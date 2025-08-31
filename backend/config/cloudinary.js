import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (filePath) => {
  cloudinary.config({ 
    cloud_name: process.env.Cloudinary_Cloud_Name,
    api_key: process.env.Cloudinary_API_Key,
    api_secret: process.env.Cloudinary_API_Secret
  });

   try {
    const uploadImage = await cloudinary.uploader.upload(filePath, {
      folder: "assistants", // optional: folder name
    });

    // ✅ local file remove after upload
    fs.unlink(filePath, (err) => {
      if (err) console.error("❌ Error deleting local file:", err);
    });

    return uploadImage.secure_url;
  } catch (error) {
    // agar upload fail ho gaya tab bhi local file delete
    fs.unlink(filePath, (err) => {
      if (err) console.error("❌ Error deleting local file:", err);
    });
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

export default uploadOnCloudinary;