import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
    addCommentOnImage,
    addCommentOnVideo,
    deleteComment,
    getImageComments,
    getVideoComments,
    updateComment
} from "../controllers/comment.controller";

const router = Router()

router.use(verifyJWT)

router.route('/video/:videoId')
    .get(getVideoComments)
    .post(addCommentOnVideo)

router.route('/image/:imageId')
    .get(getImageComments)
    .post(addCommentOnImage)

router.route('/c/:commentId')
    .patch(updateComment)
    .delete(deleteComment)

export default router