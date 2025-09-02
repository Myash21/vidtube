import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// Surface misconfig early
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('[Cloudinary] Missing env vars:',
    { CLOUDINARY_CLOUD_NAME: !!CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY: !!CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET: !!CLOUDINARY_API_SECRET }
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true, // use https URLs
});

export const uploadOnCloudinary = async (localFilePath, options = {}) => {
  if (!localFilePath) {
    console.error('[Cloudinary] upload called without a file path');
    return null;
  }

  const absolutePath = path.resolve(localFilePath);

  try {
    const res = await cloudinary.uploader.upload(absolutePath, {
      resource_type: 'auto',
      ...options, // e.g., { folder: 'avatars' }
    });
    // Prefer secure_url
    console.log('[Cloudinary] Uploaded:', { public_id: res.public_id, secure_url: res.secure_url });
    return res;
  } catch (err) {
    // SHOW the actual error
    console.error('[Cloudinary] Upload error:', err?.message || err);
    // Re-throw so controller can react
    throw err;
  } finally {
    // Always attempt to clean temp file
    try {
      fs.unlinkSync(absolutePath);
    } catch (unlinkErr) {
      // ignore missing file errors
    }
  }
};
