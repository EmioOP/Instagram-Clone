import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    deleteImage,
    getAllImages,
    togglePublished,
    updateImageDetails,
    uploadImage
} from "../controllers/image.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.use(verifyJWT) // using verify jwt for all routes


router.route('/')
    .get(getAllImages)
    .post(upload.single('image'), uploadImage)

router.route('/:imageId')
    .patch(updateImageDetails)
    .delete(deleteImage)

router.route('/toggle/publish/:imageId')
    .patch(togglePublished)


export default router