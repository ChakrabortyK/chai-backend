import { Router } from "express";
import {
    toggleVideoLikeAndUnlike,
    toggleCommentLikeAndUnlike,
    toggleTweetLikeAndUnlike,
    getLikedVideos,
} from "../controllers/like.controller.js";
import { authJWT } from "../middleware/auth.mdw.js";

const router = Router();
router.use(authJWT); // Apply authJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLikeAndUnlike);
router.route("/toggle/c/:commentId").post(toggleCommentLikeAndUnlike);
router.route("/toggle/t/:tweetId").post(toggleTweetLikeAndUnlike);
router.route("/videos").get(getLikedVideos);

export default router;
