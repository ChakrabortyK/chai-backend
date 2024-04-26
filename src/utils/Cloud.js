import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloud = async (file) => {
    try {
        if (!file) return null;
        // throw some error here

        // console.log("Utils::Cloud::uploadCloud::file:", file);
        const response = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
        });
        fs.unlinkSync(file);
        return response;
    } catch (error) {
        fs.unlinkSync(file);
        console.log("Utils::Cloud::uploadCloud::file upload error:", error);
    }
};

export default uploadCloud;
