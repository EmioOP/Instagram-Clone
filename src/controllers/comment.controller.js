import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";

const addCommentOnVideo = asyncHandler(async(req,res)=>{
    const {videoId}  = req.params
    const {content} = req.body

    if(!isValidObjectId(postId)){
        throw new ApiError(400,"provide valid post id")
    }

    const comment = await Comment.create({
        videoId:videoId,
        content,
        owner:req.user._id
    })

    if(!comment){
        throw new ApiError(500,"comment adding failed")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"comment adding successfull")
    )
})

const getVideoComments = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }

    const videoComments = await Comment.find({
        videoId:videoId
    })


    if(!videoComments){
        throw new ApiError(500,"unable to fetch comments")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videoComments,"video comments are fetched")
    )

})


const addCommentOnImage = asyncHandler(async(req,res)=>{
    const {imageId}  = req.params
    const {content} = req.body

    if(!isValidObjectId(postId)){
        throw new ApiError(400,"provide valid post id")
    }

    const comment = await Comment.create({
        imageId:imageId,
        content,
        owner:req.user._id
    })

    if(!comment){
        throw new ApiError(500,"comment adding failed")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"comment adding successfull")
    )
})

const getImageComments = asyncHandler(async(req,res)=>{
    const {imageId} = req.params

    if(!isValidObjectId(imageId)){
        throw new ApiError(400,"invalid video id")
    }

    const imageComments = await Comment.find({
        imageId:imageId
    })


    if(!imageComments){
        throw new ApiError(500,"unable to fetch comments")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,imageComments,"video comments are fetched")
    )

})

const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid comment id")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError(500,"unable to delete commment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,deletedComment,"comment deleted")
    )
})

const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const {content} = req.body


    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid comment id")
    }

    const comment = await Comment.findById(commentId)

    if(!comment || comment.owner !== req.user._id){
        throw new ApiError(400,"invalid request")
    }

    comment.content = content
    await comment.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"comment updated")
    )
})

export {
    addCommentOnImage,
    getImageComments,
    addCommentOnVideo,
    getVideoComments,
    updateComment,
    deleteComment
}




