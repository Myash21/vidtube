import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const registerUser = asyncHandler(async(req, res) => {
    //get the details from the request body
    const {fullName, username, email, password} = req.body
    
    //validation
    if([fullname, username, email, password].some((field) => field?.trim === "")){
        throw new ApiError(400, "all fields are required")
    }

    //check if user already exists
    const existingUser = await User.findOne({$or: [{username}, {email}]}) //check if user already exists by searching the database using username or email

    if(existingUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    
    //storing image files in the database
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.cover[0]?.path

    //avatar is a compulsory field so we need to ensure it exists
    if(!avatarLocalPath){
        throw new ApiError(404, "Avatar file is missing")
    }

    //upload the image file on cloudinary and then store it in our database since in our database we are only storing the image url

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    let coverImage = ""
    if(coverLocalPath){
        const coverImage = await uploadOnCloudinary(coverLocalPath)
    }
    
    //creating a new user in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase,
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
})