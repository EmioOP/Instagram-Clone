import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.single('avatar'),
    registerUser
)

router.route("/login").post(loginUser)
router.route("/logout").post(logoutUser)
router.route("/refresh-token").post(verifyJWT,refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-details").post(verifyJWT,updateAccountDetails)
router.route("/update-avatar").post(upload.single('avatar'),verifyJWT,updateUserAvatar)
router.route("/user-profile/:username").get(getUserChannelProfile)

export default router