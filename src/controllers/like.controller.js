import mongoose,{ isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"provided invalid videoId")
    }

    const likedVideo = await Like.aggregate([
        {
            $match:{
                videoId: new mongoose.Types.ObjectId(videoId),
                likedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    if(likedVideo){
        await Like.findByIdAndDelete(likedVideo._id)
    }

    if(!likedVideo){
        await Like.create(
            {
                videoId:videoId,
                likedBy:req.user._id
            }
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"video like toggled")
    )

})

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid comment id")
    }

    const likedComment = await Like.aggregate([
        {
            $match:{
                commentId: new mongoose.Types.ObjectId(commentId),
                likedBy : new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])


    if(likedComment){
        await Like.findByIdAndDelete(likedComment._id)
    }

    if(!likedComment){
        await Like.create({
            commentId:commentId,
            likedBy:req.user._id
        })
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Like comment toggled")
    )

})

const toggleImageLike = asyncHandler(async(req,res)=>{
    const {imageId} = req.params

    if(!isValidObjectId(imageId)){
        throw new ApiError(400,"invalid image id")
    }

    const likedImage = await Like.aggregate([
        {
            $match:{
                imageId: new mongoose.Types.ObjectId(imageId),
                likedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    if(likedImage && likedImage.length > 0){
        await Like.findByIdAndDelete(likedImage[0]._id)
    }

    if(!likedImage || likedImage.length < 1){
        await Like.create({
            imageId:imageId,
            likedBy:req.user._id
        })
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"image like toggled")
    )
})

const getLikedVideosAndImages = asyncHandler(async(req,res)=>{

    const likedVideosAndImages = await Like.aggregate([
        {
            $match:{
                likedBy:req.user._id,
                $or:[
                    {videoId:{$exists:true}},
                    {imageId:{$exists:true}}
                ]
            }
        }
    ])

    if(!likedVideosAndImages){
        throw new ApiError(400,"fetching failed")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,likedVideosAndImages,"liked images and videos fetched")
    )
})


export {
    toggleVideoLike,
    toggleCommentLike,
    toggleImageLike,
    getLikedVideosAndImages
}