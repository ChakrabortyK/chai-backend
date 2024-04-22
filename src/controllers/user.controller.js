import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import uploadCloud from "../utils/Cloud.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("avatarLocalPath", avatarLocalPath);

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // let coverImageLocalPath;
    // if (
    //     req.files &&
    //     Array.isArray(req.files.coverImage) &&
    //     req.files.coverImage.length > 0
    // ) {
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const uploadedAvatar = await uploadCloud(avatarLocalPath);
    const coverImage = await uploadCloud(coverImageLocalPath);

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
        "-password -refreshToken -createdAt -updatedAt -__v"
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

export { registerUser };
