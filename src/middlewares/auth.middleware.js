import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.headers("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken

        if (!token) {
            throw new ApiError(400, "Unauthorized Request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)


        const user = await User.findById(decodedToken._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(400, "Invalid accessToken")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid accessToken")
    }

})

export { verifyJWT }