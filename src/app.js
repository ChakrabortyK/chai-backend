import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMdw } from "./middleware/error.mdw.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        // Send the error as JSON
        res.status(err.statusCode).json(err.toJSON());
    } else {
        // Handle other types of errors
        // You can customize this part based on your application's requirements
        console.error(err); // Log the error for debugging
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error",
            success: false,
            errors: ["An unexpected error occurred"],
        });
    }
});
//ROUTES IMPORT
import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

//ROUTES DECLARATION
app.get("/test", async (req, res) => {
    res.send("test api success");
});
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use(errorMdw);
export { app };
