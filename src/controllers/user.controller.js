import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(400, "error while generating access or refresh token")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { username, fullName, email, password } = req.body

    if ([username, password, email, fullName].some((field) => field.trim() === "")) {
        throw new ApiError(400, "provide all fields")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(400, "user with same username or email already exist")

    }

    const avatarLocalPath = req.files?.avatar[0].path

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar is required")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url
    })

    if (!user) {
        throw new ApiError(500, "user creation failed")
    }

    const createdUser = await User.findById(user._id)

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdUser, "user creation successfull")
        )

})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )

    if (!user) {
        throw new ApiError(400, "user n")
    }

    if (!password) {
        throw new ApiError(400, "password is required")
    }

    const validatePassword = await user.isPasswordCorrect(password)

    if (!validatePassword) {
        throw new ApiError(400, "incorrect password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken })
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    //check weather the user is logged in
    //delete refresh token from db
    //delete refresh and access token from cookies

    await User.findByIdAndUpdate(req.user._id, {
        $unset: {
            refreshToken: 1
        }
    },
        {
            new: true
        })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "logged out")
        )

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken

    if (!token) {
        throw new ApiError(400, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(token,
            process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken)


        if (!user) {
            throw new ApiError(400, "unauthorized request")
        }

        if (token !== user?.refreshToken) {
            throw new ApiError(400, "refreshToken expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken: refreshToken }, "accessToken refreshToken")
            )



    } catch (error) {
        throw new ApiError(400, error.message || "invalid refreshToken")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(400, "Umauthorized request")
    }


    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(400, "enter correct old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })


    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "password changed")
        )




})

const getCurrentUser = asyncHandler(async (req, res) => {


    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "current user fetched")
        )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, fullName, } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "all fields are required")
    }

    const updatedUser = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                email,
                fullName
            }
        },
        {
            new: true
        }).select("-password -refreshToken")

    if (!updatedUser) {
        throw new ApiError(400, "invalid request")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "user details updated")
        )


})


const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const user = await User.findById(req.user._id)


    await deleteFromCloudinary(user.avatar,"image")

    

    if(!avatar){
        throw new ApiError(400,"avatar is required")
    }

    const userUpdate = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"avatar is updated")
    )


})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params

    const user = await User.aggregate([
        {
            $match:{
                username:username.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"Follower",
                localField:"_id",
                foreignField:"account",
                as:"followers"
            }
        },
        {
            $lookup:{
                from:"Follower",
                localField:"_id",
                foreignField:"follower",
                as:"followed"
            }
        },
        {
            $addFields:{
                followersCount:{
                    $size:"$followers"
                },
                followingCount:{
                    $size:"$followed"
                },
                isFollowed:{
                    $cond:{
                        $if:{$in:[req.user?._id,"$followers.follower"]},
                        $then:true,
                        $else:false
                    }
                }
            }
        },
        {
            $project:{
                username:1,
                fullName:1,
                avatar:1,
                followersCount:1,
                followingCount:1,
                isFollowed:1,
                email:1
            }
        }

    ])
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    getUserChannelProfile
}