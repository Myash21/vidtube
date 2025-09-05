import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

//Generate access and refresh token for a user
export const generateAccessAndRefresh = async(userId) => {
    try {
        //check if user exists
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(404, "User not found")
        }
        //generate access and refresh tokens
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        //store refresh token with the user as we have created a refresh token field in the user schema
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens!")
    }
}

//Register new user
export const registerUser = asyncHandler(async(req, res) => {
    //get the details from the request body
    const {fullname, username, email, password} = req.body
    
    //validation
    if([fullname, username, email, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "all fields are required")
    }

    //check if user already exists
    const existingUser = await User.findOne({$or: [{username}, {email}]}) //check if user already exists by searching the database using username or email

    if(existingUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    
    //storing image files in the database
    //console.log(req.files)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath  = req.files?.coverImage?.[0]?.path;

    //avatar is a compulsory field so we need to ensure it exists
    if (!avatarLocalPath) {
        throw new ApiError(404, "Avatar file is missing");
    }

    //upload the image file on cloudinary and then store it in our database since in our database we are only storing the image url

    /*const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage = "";
    if (coverLocalPath) {
        coverImage = await uploadOnCloudinary(coverLocalPath);
    }*/

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Uploaded avatar", avatar)
    } catch (error) {
        console.log("Failed to upload avatar")
        throw new ApiError(500, "Failed to upload avatar");
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath)
        console.log("Uploaded cover image", coverImage)
    } catch (error) {
        console.log("Failed to upload cover image")
        throw new ApiError(500, "Failed to upload cover image");
    }
    
    //creating a new user in database
    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            username: username.toLowerCase(),
            email,
            password
        })
    
        //verifying that the user has been created in the database
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"  //we don't want the password and refresh token
        )
    
        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering user!") //(status, message)
        }
    
        return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User registered successfully")) //(status, data, message))
    } catch (error) {
        console.log("User creation failed!")
        if(avatar){
            await deleteFromCloudinary(avatar.public_id)
        }
        if(coverImage){
            await deleteFromCloudinary(coverImage.public_id)
        }
        throw new ApiError(500, "Something went wrong while registering user and images were deleted!")
    }
})

//Login the user
export const loginUser = asyncHandler(async(req, res) => {
    //get data from request body
    const {email, username, password} = req.body

    //validation
    if(!password || (!email && !username)){
        throw new ApiError(400, "Some fields are missing")
    }

    //verify user is registered
    const existingUser = await User.findOne({$or: [{username}, {email}]})
    if(!existingUser){
        throw new ApiError(404, "User not registered!")
    }

    //validate password
    const isPasswordValid = await existingUser.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Unauthorized!")
    }

    //generate access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefresh(existingUser._id)

    //return the data of the logged in user except password and refresh token
    const loggedInUser = await User.findById(existingUser._id).select("-password -refreshToken")

    //check if user logged in
    if(!loggedInUser){
        throw new ApiError(500, "User not logged in!")
    }

    //options are cookie flags you pass to res.cookie() in Express, control how the browser stores and handles the cookie
    const options = {
        httpOnly: true, //client cannot access the cookie
        secure: process.env.NODE_ENV === "production" //Ensures cookies can only be sent over HTTPS connections, when NODE_ENV is production, secure: true, but allows us to test on localhost
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200, 
            {user: loggedInUser, accessToken, refreshToken}, //In mobile app we cannot set the cookies, so sending the tokens here
            "User login successfull!"
        ))
})

/*
Access tokens (JWTs) are usually short-lived (e.g., 15 minutes – 1 hour) which limits damage if a token is stolen.
But if access tokens expire too fast, users would need to log in again and again — not good UX.
So we use refresh token to generate new access and refresh tokens

Example Flow
User logs in → gets accessToken (15min) + refreshToken (7d).
Access token expires.
Client calls /refresh with refresh token.
Server verifies refresh token, issues new access+refresh.
User continues without re-login.
*/
export const refreshAccessToken = asyncHandler(async(req, res) => {
    //Get the refresh token from the request
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Refesh Token is required!")
    }
    try {
        //Use the refresh token secret to validate refresh token and ensure it isn't expired
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET_REFRESH_TOKEN)

        //Makes sure the refresh token corresponds to a real user
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid refresh token!")
        }
        //Ensure the refresh token presented is the latest one issued from the database
        if(incomingRefreshToken != user?.refreshToken){
            throw new ApiError(401, "Invalid refresh token!")
        }

        const options = {
        httpOnly: true, //client cannot access the cookie
        secure: process.env.NODE_ENV === "production" //Ensures cookies can only be sent over HTTPS connections, when NODE_ENV is production, secure: true, but allows us to test on localhost
    }

    //generate new access and refresh tokens and store refresh in database
    const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefresh(user._id)

    //send back tokens to client
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(
            200, 
            {accessToken, refreshToken: newRefreshToken}, 
            "Access Token refreshed successfully"
        ))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing access token!")
    }
})

//Logout the user by effectively removing the refresh token from the database and clearing the cookies
export const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined 
            }
        },
        {new: true}
    )
    const options = {
        httpOnly: true, //client cannot access the cookie
        secure: process.env.NODE_ENV === "production"
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("rccessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully!"))
})

export const changeCurrentPassword = asyncHandler((req, res) => {

})

export const getCurrentUser = asyncHandler(() => {})

export const updateAccountDetails = asyncHandler(() => {})

export const updateAvatar = asyncHandler(() => {})

export const updateCoverImage = asyncHandler(() => {})