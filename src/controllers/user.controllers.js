import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

//Generate access and refresh token for a user
export const generateAcessAndRefresh = async(userId) => {
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