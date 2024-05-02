import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import uploadCloud from "../utils/Cloud.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error in generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email }); // ({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ApiError(409, "User with email already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    console.log("avatarLocalPath", avatarLocalPath);

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // let coverImageLocalPath;
    // if (req.files &&Array.isArray(req.files.coverImage) &&req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const uploadedAvatar = await uploadCloud(avatarLocalPath);
    const coverImage = await uploadCloud(coverImageLocalPath);
    // console.log("uploadedAvatar", uploadedAvatar);
    // console.log("coverImage", coverImage);

    if (!uploadedAvatar) {
        throw new ApiError(400, "Avatar file is not uploaded");
    }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: uploadedAvatar.url,
        coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -createdAt -updatedAt -__v"
    );

    if (!createdUser) {
        throw new ApiError(500, "Error while creating user");
    } else {
        // res.status(201).json({
        //     success: true,
        //     message: "User registered successfully",
        //     createdUser,
        // });

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    createdUser,
                    "User registered successfully"
                )
            );
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // if (!email && !username) {
    //     throw new ApiError(400, "Email or username is required");
    // }

    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    // console.log("user from login::findOne:", user);

    if (!user) {
        throw new ApiError(401, "Invalid email or username or password @1");
    }

    const pwMatch = await user.comparePassword(password);

    if (!pwMatch) {
        throw new ApiError(401, "Invalid email or username or password @2");
    }

    const { refreshToken, accessToken } = await generateAccessandRefreshToken(
        user._id
    );

    //or update the userobj
    // user.refreshToken = refreshToken;
    // delete user.password;
    // delete user.createdAt;
    // delete user.__v;

    const loggedInUser = await User.findById(user._id).select(
        "-password -createdAt -updatedAt -__v"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    // accessToken,
                    // refreshToken,
                },
                "User logged In Successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    //TODO:
    const { _id } = req.user;

    const userDataAfterUpdate = await User.findByIdAndUpdate(
        _id,
        { $unset: { refreshToken: 1 } }, // Using $unset to remove refreshToken
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out Successfully"));
});

const getAllUser = asyncHandler(async (req, res) => {
    const users = await User.find({}).select(
        "-password -createdAt -updatedAt -__v"
    );
    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user || !user.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } =
            await generateAccessandRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(500, error?.message || "refresh token server error");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "current user fetched successfully")
        );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Missing fields");
    }

    const isPasswordCorrect = await req.user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    const user = await User.findById(req.user?._id);
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "Atleast one field is required");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email,
            },
        },
        { new: true }
    ).select("-password");
    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    const coverImage = await uploadCloud(coverImageLocalPath);

    if (!coverImage?.url) {
        throw new ApiError(400, "Error while uploading Cover image ");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage?.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadCloud(avatarLocalPath);

    if (!avatar?.url) {
        throw new ApiError(400, "Error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar?.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username,
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id", //where user.id
                foreignField: "channel", // is the same as channel id
                as: "myChSubByIds", //myChannelIsSubbedByIds: my id is in these many documents as the channel
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo", //my id is in these documents as subscriber
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$myChSubByIds",
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$myChSubByIds.subscriber"],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetched successfully"
            )
        );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        );
});

export {
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
};
