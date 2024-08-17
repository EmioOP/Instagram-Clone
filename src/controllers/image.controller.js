import { asyncHandler } from "../utils/asyncHandler.js";
import { Image } from "../models/images.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const uploadImage = asyncHandler(async(req,res)=>{
    const {caption} = req.body

    if(!caption){
        throw new ApiError(400,"caption is required")
    }

    const imageLocalPath = req.file?.path

    if(!imageLocalPath){
        throw new ApiError(400,"upload image")
    }

    const image = await uploadOnCloudinary(imageLocalPath)

    if(!image){
        throw new ApiError(400,"uploading to cloudinary is failed")
    }

    const createImage = await Image.create({
        imageFile:image.url,
        caption:caption,
        owner:req.user?._id,
        isPublished:true
    })

    if(!createImage){
        throw new ApiError(500,"something went wrong while creating image")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,createImage,"image uploaded")
    )
})

const getAllImages = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortType, query } = req.query




    const images = await Image.aggregate([
        {
            $match: {
                content: { $regex: query, $options: "i" }
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, images, "images fetched")
        )
})

const deleteImage = asyncHandler(async (req, res) => {
    const { imageId } = req.params

    const image = await Image.findById(imageId)

    await deleteFromCloudinary(image.url, "image")

    if (image.owner !== req.user._id) {
        throw new ApiError(400, "invalid request you are not the owner or admin")
    }

    const deletedImage = await Image.findByIdAndDelete(imageId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedImage, "image deletion success")
        )

})

const updateImageDetails = asyncHandler(async (req, res) => {

    const { imageId } = req.params
    const { caption } = req.body

    const image = await Image.findById(imageId)

    if (image.owner !== req.user._id) {
        throw new ApiError(400, "invalid request you are not the owner or admin")
    }

    const updateImage = await Image.findByIdAndUpdate(imageId,
        {
            $set: {
                caption: caption
            }
        },
        {
            new: true
        })

    return res
    .status(200)
    .json(
        new ApiResponse(200,updateImage,"image updated")
    )

})

const togglePublished = asyncHandler(async(req,res)=>{
    const {imageId} = req.params

    const image = await Image.findById(imageId)

    if (image.owner !== req.user._id) {
        throw new ApiError(400, "invalid request you are not the owner or admin")
    }

    image.isPublished = !image.isPublished
    await image.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,image,"image updated")
    )
})

export {
    uploadImage,
    getAllImages,
    deleteImage,
    updateImageDetails,
    togglePublished
}