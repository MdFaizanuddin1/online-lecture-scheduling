import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
// Configure cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("No file path provided");
      return null;
    }
    
    // Check if file exists
    if (!fs.existsSync(localFilePath)) {
      console.error("File does not exist at path:", localFilePath);
      return null;
    }
    
    // console.log("Uploading file to cloudinary:", localFilePath);
    
    // Upload file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    
    // console.log("File uploaded successfully. URL:", response.url);
    
    // File uploaded successfully
    try {
      fs.unlinkSync(localFilePath);
      // console.log("Local file deleted successfully");
    } catch (unlinkError) {
      console.error("Failed to delete local file:", unlinkError);
    }
    
    return response;
  } catch (error) {
    console.error("Error in cloudinary upload:", error);
    
    // Try to clean up the local file if it exists
    try {
      if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        console.log("Local file deleted after upload error");
      }
    } catch (unlinkError) {
      console.error("Failed to delete local file after upload error:", unlinkError);
    }
    
    return null;
  }
};

const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) {
      console.log("No image URL provided for deletion");
      return;
    }
    
    // Extract public ID from URL
    const publicId = extractPublicIdFromUrl(imageUrl);
    
    if (!publicId) {
      console.error("Could not extract public ID from URL:", imageUrl);
      return;
    }
    
    console.log("Deleting image from Cloudinary. Public ID:", publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted from Cloudinary:", result);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    // Don't throw, just log the error
  }
};

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url) {
  try {
    // Extract the last part of the URL (filename with extension)
    const parts = url.split('/');
    const filenameWithExt = parts[parts.length - 1];
    
    // Remove the file extension
    const publicId = filenameWithExt.split('.')[0]; 
    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}

export { uploadOnCloudinary, deleteFromCloudinary };
