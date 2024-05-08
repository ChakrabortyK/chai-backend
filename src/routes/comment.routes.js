import { Router } from "express";
import {
    addCommentToVideo,
    addCommentToTweet,
    updateCommentToVideo,
    updateCommentToTweet,
    deleteCommentToVideo,
    deleteCommentToTweet,
    getVideoComments,
    getTweetComments,
} from "../controllers/comment.controller.js";

import { authJWT } from "../middleware/auth.mdw.js";

const router = Router();

router.use(authJWT); // apply in all

router.route("/video/:videoId").get(getVideoComments).post(addCommentToVideo);
router.route("/tweet/:tweetId").get(getTweetComments).post(addCommentToTweet);

router
    .route("/video/c/:commentId")
    .delete(deleteCommentToVideo)
    .patch(updateCommentToVideo);
router
    .route("/tweet/c/:commentId")
    .delete(deleteCommentToTweet)
    .patch(updateCommentToTweet);

export default router;
