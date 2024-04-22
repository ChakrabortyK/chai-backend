import { Router } from "express";
const router = Router();

import { registerUser } from "../controllers/user.controller.js";
import upload from "../middleware/multer.mdw.js";

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

router.route("/getuser:id").get();
router.route("/getallusers").get();
router.route("/deleteuser").delete();

export default router;
