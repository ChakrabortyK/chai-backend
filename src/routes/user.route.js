import { Router } from "express";
import { authJWT } from "../middleware/auth.mdw.js";
import upload from "../middleware/multer.mdw.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getAllUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserCoverImage,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory,
} from "../controllers/user.controller.js";

const router = Router();
//  /api/v1/users/____

router.get("/test", (req, res) => {
    res.status(200).send("Hello User");
});

//No Auth
router.route("/register").post(
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
router.route("/getuser").get(authJWT, getCurrentUser);
router.route("/updatePassword").post(authJWT, changeCurrentPassword);
router.route("/updateAccount").patch(authJWT, updateAccountDetails);
router.route("/channel/:username").get(authJWT, getUserChannelProfile);
router.route("/watchhistory").get(authJWT, getWatchHistory);
// router.route("/getallusers").get(getAllUser);

// router.route("/deleteuser").delete();
//MULTER BASED ROUTE
router
    .route("/updateAvatar")
    .patch(authJWT, upload.single("avatar"), updateUserAvatar); //add multer
router
    .route("/updateCover")
    .patch(authJWT, upload.single("cover-image"), updateUserCoverImage); //add multer
export default router;
