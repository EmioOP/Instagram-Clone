import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { followersList, followingList, toggleFollow } from "../controllers/follow.controller.js";

const router = Router()
router.use(verifyJWT)


router.route("/toggle/follow/:accountId").post(toggleFollow)

router.route("/followers/:accountId").get(followersList)

router.route("/following/:userId").get(followingList)


export default router