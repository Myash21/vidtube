import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Video } from "../models/video.models";
import { asyncHandler } from "../utils/asyncHandler";
import dotenv from "dotenv"
import { Mongoose } from "mongoose";
dotenv.config()

export const getVideoById = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "video id is missing!")
    }
    const video = Video.findById(videoId)
    return res
    .status(200)
    .json(new ApiResponse(200, video, "video information fetched successfully!"))
})