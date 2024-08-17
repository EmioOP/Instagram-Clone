import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import mongoose ,{isValidObjectId}from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const uploadVideo = asyncHandler(async(req,res)=>{
    const {caption} = req.body

    if(!caption){
        throw new ApiError(400,"caption is needed")
    }

    const videoFileLocalPath = req.file?.path

    if(!videoFileLocalPath){
        throw new ApiError(400,"videoFile is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)

    if(!videoFile){
        throw new ApiError(400,"videoFile is required")
    }

    const video = await Video.create({
        videoFile,
        caption,
        owner:req.user._id,
        views:0,
        duration:videoFile.duration,
        isPublished:true
    })

    if(!video){
        throw new ApiError(400,"error while uploading video")
    }

    return req
    .status(200)
    .json(
        new ApiResponse(200,video,"video uploaded successfully")
    )
})

const getAllVideos = asyncHandler(async(req,res)=>{
    const {page=1,limit=10,userId,sortBy,sortType,query} = req.query


    const matchStage = {}
    if(userId){
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    if(query){
        matchStage.caption = {$regex:query , $options:"i"}
    }




    const videos = await Video.aggregate([
        {
            $match:matchStage
        },
        {
            $sort:{
                [sortBy] : sortType === "asc" ? 1 : -1
            }
        },
        {
            $skip:(page-1) * limit
        },
        {
            $limit:limit
        }
    ])


    if(!videos){
        throw new ApiError(400,"unable to fetch video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"videos fetched")
    )
})

const getUserVideos = asyncHandler(async(req,res)=>{
    const {userId} = req.params

    const videos = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    if(!videos){
        throw new ApiError(400,"unable to fetch videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"videos fetched")
    )
})

const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }

    const deleteVideo = await Video.findByIdAndDelete(videoId)

    if(!deleteVideo){
        throw new ApiError(400,"unable to delete video ,inavalid id")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,deleteVideo,"video deleted")
    )

})

const updateVideoDetails = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const {caption} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }

    const video = await Video.findById(videoId)

    if(video.owner !== req.user._id){
        throw new ApiError(400,"only owner or admin can change")
    }

    video.caption = caption
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,updateVideo,"video detail updated")
    )
})


const togglePublish = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }

    const video = await Video.findById(videoId)

    if(video.owner !== req.user._id){
        throw new ApiError(400,"only owner or admin can change")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json( 
        new ApiResponse(200,{},"toggled")
    )
})


export {
    uploadVideo,
    getAllVideos,
    deleteVideo,
    getUserVideos,
    updateVideoDetails,
    togglePublish
}