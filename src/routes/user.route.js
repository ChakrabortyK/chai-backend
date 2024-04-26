import { Router } from "express";
import { authJWT } from "../middleware/auth.mdw.js";
import upload from "../middleware/multer.mdw.js";
import {
    getAllUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
} from "../controllers/user.controller.js";

const router = Router();
//  /api/v1/users/____

router.get("/test", (req, res) => {
    res.status(200).send("Hello User");
});

router.route("/adduser").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);
router.route("/login").post(loginUser);

//SECURED ROUTES (AUTHED)
router.route("/logout").post(authJWT, logoutUser);
router.route("/rftoken").post(refreshAccessToken);

router.route("/getuser:id").get();
router.route("/getallusers").get(getAllUser);

router.route("/deleteuser").delete();

export default router;
