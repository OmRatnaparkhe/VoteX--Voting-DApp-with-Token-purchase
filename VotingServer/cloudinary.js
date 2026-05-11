import { v2 as cloudinary } from 'cloudinary';

// Lazily configure Cloudinary on first use, so env vars are guaranteed to be loaded
let configured = false;

const getCloudinary = () => {
  if (!configured) {
    const cloudinaryUrl = process.env.CLOUDINARY_URL || '';
    const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);

    if (match) {
      cloudinary.config({
        api_key: match[1],
        api_secret: match[2],
        cloud_name: match[3],
        secure: true,
      });
      console.log("Cloudinary configured for cloud:", match[3]);
      configured = true;
    } else {
      throw new Error(`CLOUDINARY_URL missing or invalid. Value: "${cloudinaryUrl}"`);
    }
  }
  return cloudinary;
};

export const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    try {
      const cloud = getCloudinary();
      const uploadStream = cloud.uploader.upload_stream(
        {
          folder: `voting_system/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    } catch (err) {
      reject(err);
    }
  });
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const cloud = getCloudinary();
    const result = await cloud.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error);
    throw error;
  }
};

export default cloudinary;