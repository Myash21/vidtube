import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Video } from "../models/video.models";
import { asyncHandler } from "../utils/asyncHandler";
import dotenv from "dotenv"
import { Mongoose } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary";
dotenv.config()

export const getVideoById = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "video id is missing!")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found!")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, video, "video information fetched successfully!"))
})

export const publishAVideo = asyncHandler(async(req, res) => {
    //get video details from req body
    const {title, description, duration} = req.body
    const owner = req.user._id

    //validation
    if(!title?.trim() || !description?.trim() || !Number.isFinite(Number(duration))){
        throw new ApiError(400, "All fields are required!")
    }

    //upload video and thumbnail on cloudinary
    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoLocalPath){
        throw new ApiError(400, "Missing video local path!")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Missing thumbnail local path!")
    }

    let newVideo
    try{
        newVideo = await uploadOnCloudinary(videoLocalPath)
        console.log("uploaded video!", newVideo)
    }
    catch(error){
        console.log("Failed to upload video!")
        throw new ApiError(500, "Failed to upload video!")
    }

    let thumbnail
    try{
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        console.log("uploaded thumbnail!", thumbnail)
    }
    catch(error){
        console.log("Failed to upload thumbnail!")
        throw new ApiError(500, "Failed to upload thumbnail!")
    }

    //Upload a new video in database
    try{
        const video = await Video.create({
            owner: owner,
            videoFile: newVideo.url,
            thumbnail: thumbnail.url,
            title: title,
            description: description,
            duration: duration,
            isPublished: true
        })
        return res
        .status(201)
        .json(new ApiResponse(201, video, "Video registered successfully!"))
    }
    catch(error){
        console.log("Failed to register video!")
        throw new ApiError(500, "Something went wrong when registering video!")
    }
})

export const updateVideo = asyncHandler(async(req, res) => {
    const { title, description } = req.body
    const thumbnailLocalPath = req?.file?.path
    if(!title && !description && !thumbnailLocalPath){
        throw new ApiError(401, "Atleast one field is required!")
    }
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "videoId missing!")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found!")
    }
    if(title){
        video.title = title
    }
    if(description){
        video.description = description
    }
    if(thumbnailLocalPath){
        let thumbnail
        try{
            thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
            console.log("Uploaded thumbnail on cloudinary!")
        }
        catch(error){
            console.log("Failed to upload thumbnail on cloudinary!")
            throw new ApiError(500, "Failed to upload thumbnail on cloudinary!")
        }
        video.thumbnail = thumbnail.url
    }
    await video.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(new ApiResponse(200, {video}, "Updated information successfully!"))
})