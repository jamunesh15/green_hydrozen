const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
});

/**
 * Upload a file to Cloudinary
 * @param {String} filePath - Path to the file
 * @param {String} folder - Folder to upload to
 * @returns {Promise} - Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder = 'hydrogen_trade') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      use_filename: true
    });
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to cloud storage');
  }
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise} - Cloudinary delete result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image from cloud storage');
  }
};

/**
 * Generate a signed URL for a file on Cloudinary (with expiration)
 * @param {String} publicId - Cloudinary public ID
 * @param {Number} expiresAt - Timestamp when the URL expires
 * @returns {String} - Signed URL
 */
const generateSignedUrl = (publicId, expiresAt) => {
  const signature = cloudinary.utils.generate_auth_token({
    public_id: publicId,
    expires_at: expiresAt
  });
  return signature;
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  generateSignedUrl
};
