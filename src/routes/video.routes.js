import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getUserVideos, togglePublish, updateVideoDetails, uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route('/')
            .get(getAllVideos)
            .post(upload.single('video'),uploadVideo)

router.route('/:userId').get(getUserVideos)

router.route('/:videoId')
            .patch(updateVideoDetails)
            .delete(deleteVideo)

router.route('/toggle/publish/:videoId').patch(togglePublish)

export default router