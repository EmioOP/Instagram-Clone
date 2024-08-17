import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Follower } from "../models/follow.model.js";


const toggleFollow = asyncHandler(async (req, res) => {
    const { accountId } = req.params

    if (!isValidObjectId(accountId)) {
        throw new ApiError(400, "invalid account id")
    }

    if (req.user._id === accountId) {
        throw new ApiError(400, "cannot follow yourself")
    }

    const followStatus = {}

    const isExistingFollower = await Follower.aggregate([
        {
            $match: {
                follower: new mongoose.Types.ObjectId(req.user?._id),
                account: new mongoose.Types.ObjectId(accountId)
            }
        }
    ])

    if (isExistingFollower) {
        const unfollow = await Follower.findByIdAndDelete(isExistingFollower._id)

        followStatus.status = "Unfollowed"
        followStatus.follower = unfollow.follower
        followStatus.account = unfollow.account
    }

    if (!isExistingFollower) {
        const follow = await Follower.create({
            follower: req.user._id,
            account: accountId
        })

        followStatus.status = "Followed"
        followStatus.follower = follow.follower
        followStatus.account = follow.account
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, followStatus, "folow toggled")
        )

})

const followersList = asyncHandler(async (req, res) => {
    const { accountId } = req.params

    if (!isValidObjectId(accountId)) {
        throw new ApiError(400, "invalid channel id")
    }

    const followers = await Follower.aggregate([
        {
            $match: {
                account: new mongoose.Types.ObjectId(accountId)
            }
        },
        {
            $lookup: {
                from: "User",
                localField: "follower",
                foreignField: "_id",
                as: "followerDetails"
            }
        },
        {
            $addFields: {
                followerName: { $first: "followerDetails.fullName" }
            }
        },
        {
            $project: {
                followerName: 1
            }
        }
    ])

    if (!followers) {
        throw new ApiError(500, "unable to fetch details")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, followers, "followers name fetched")
        )
})

const followingList = asyncHandler(async (req, res) => {
    const {userId} = req.params

    const following = await Follower.aggregate([
        {
            $match:{
                follower: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"User",
                localField:"account",
                forignField:"_id",
                as:"followingList"
            }
        },
        {
            $addFields:{
                followingNames:{$first:"followingList.fullName"}
            }
        },
        {
            $project:{
                followingNames:1
            }
        }
    ])

    if(!following){
        throw new ApiError(500,"unable to fetch following accounts")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,following,"following account names fetched")
    )
})


export {
    toggleFollow,
    followersList,
    followingList
}