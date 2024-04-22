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

        const response = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
        });
        //print the response
        // console.log("Utils::Cloud::uploadCloud::file upload ", response);
        fs.unlinkSync(file);
        return response;
    } catch (error) {
        fs.unlink(file);
        console.log("Utils::Cloud::uploadCloud::file upload error:", error);
    }
};

export default uploadCloud;
