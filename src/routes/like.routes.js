import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideosAndImages, toggleCommentLike, toggleImageLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router()
router.use(verifyJWT)

router.route('/toggle/v/:videoId').post(toggleVideoLike)
router.route('/toggle/c/:commentId').post(toggleCommentLike)
router.route('/toggle/i/:imageId').post(toggleImageLike)

router.route('/videos-images').get(getLikedVideosAndImages)

export default router