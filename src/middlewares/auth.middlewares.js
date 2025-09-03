import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import dotenv from "dotenv"
dotenv.config()

//We use this middleware to extract the _id of the user and attach it to the req and pass it forward
export const verifyJWT = asyncHandler(async(req, __, next) => {
    //get the access token from the cookies
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if(!token){
        throw new ApiError(401, "Unauthorized!")
    }
    try {
        //validate the access token using secret key
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN)

        //Then we extract the user _id from the access token(since we have defined user _id in the 
        // schemas of the tokens), and then verify the user of that id exists in the database
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401, "Invalid refresh token!")
        }
        //Atach all the user info(except password & refresh token) along with the id to the req
        req.user = user

        //move it forward
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token!")
    }
})