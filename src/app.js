import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
import userRouter from "./routes/user.route.js";

//ROUTES DECLARATION
app.get("/test", async (req, res) => {
    res.send("test api success");
});

app.use("/api/v1/users", userRouter);

export { app };
