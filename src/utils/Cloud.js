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
        const response = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
        });
        fs.unlinkSync(file);
        return response;
    } catch (error) {
        fs.unlinkSync(file);
        console.log("Utils::Cloud::uploadCloud: ", error);
    }
};

const deleteCloud = async (public_id, resource_type) => {
    if (!public_id) return null;
    try {
        return await cloudinary.uploader.destroy(public_id, {
            resource_type,
        });
    } catch (error) {
        console.log("Utils::Cloud::deleteCloud: ", error);

        return null;
    }
};

export { uploadCloud, deleteCloud };
