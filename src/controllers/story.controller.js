import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { Story } from "../models/story.model";

const addStory = asyncHandler(async(req,res)=>{
    const storyFilePath =  req.file?.path

    if(!storyFilePath){
        throw new ApiError(400,"upload a file")
    }

    const storyFile = await uploadOnCloudinary(storyFile)

    if(!storyFile){
        throw new ApiError(400,"story file is required")
    }

    const story = await Story.create({
        storyFile:storyFile.url,
        owner:req.user._id
    })

    if(!story){
        throw new ApiError(500,"something went wrong while creating story")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,story,"story upload successFull")
    )

})


const deleteStory = asyncHandler(async(req,res)=>{
    const {storyId} = req.params

    if(!storyId){
        throw new ApiError(400,"story id is required")
    }

    const story = await Story.findById(storyId)

    if(req.user._id !== story.owner){
        throw new ApiError(400,"invalid request")
    }

    await story.deleteOne({_id:storyId})

    await story.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,story,"story deleted")
    )
})


const timeoutDeleteStory = asyncHandler(async(req,res)=>{
    //TODO : controller for story which delete the story when user uses delete button or automatically delete after 24 hours of uploading the story

    // we can use cron for scheduling the task of deleting
})