import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv"
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
dotenv.config()

export const getVideoById = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "video id is missing!")
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id!")
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
    const { title, description } = req.body || {}
    const thumbnailLocalPath = req.file?.path
    if(!title && !description && !thumbnailLocalPath){
        throw new ApiError(400, "Atleast one field is required!")
    }
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "videoId missing!")
    }
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id!")
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

export const deleteVideo = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "Missing video Id!")
    }

    //Verifying video with given Id exists
    let video
    try{
        video = await Video.findById(videoId)
    }
    catch(error){
        throw new ApiError(400, "Invalid video Id!")
    }
    if(!video){
        throw new ApiError(404, "Video not found!")
    }

    //Delete video
    try{
        await Video.findByIdAndDelete(videoId)
        console.log("Video deleted successfully!")
    }
    catch(error){
        console.log("Something went wrong while trying to delete video")
        throw new ApiError(500, "Something went wrong while trying to delete video")
    }
    return res
    .status(204)
    .json(new ApiResponse(204, {}, "Video deleted successfully"))
})

export const getAllVideos = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    const match = {}
    if(query){
        match.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }
    if(userId){
        match.owner = userId
    }
    match.isPublished = true
    const sort = {}
    if(sortBy){
        sort[sortBy] = String(sortType).toLowerCase() === "asc" ? 1 : -1
    }
    const aggregation = Video.aggregate([
        { $match: match },
        { $sort: sort }
    ])
    const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10
    }
    const result = await Video.aggregatePaginate(aggregation, options)
    return res
    .status(200)
    .json(new ApiResponse(200, result, "Videos fetched successfully"))
})
/*
Example requests:
Fetch latest: GET /api/v1/videos?Page=1&limit=10
Search: GET /api/v1/videos?query=react
Sort by views asc: GET /api/v1/videos?sortBy=views&sortType=asc
By owner: GET /api/v1/videos?userId=<userId>
*/