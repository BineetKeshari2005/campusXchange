import cloudinary from "../configuration/cloudinary.js";

export const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "profile_photos" }, (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      })
      .end(fileBuffer);
  });
};
