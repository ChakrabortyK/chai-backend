import { Router } from "express";
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { authJWT } from "../middleware/auth.mdw.js";

const router = Router();

router.use(authJWT); // Apply authJWT middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
