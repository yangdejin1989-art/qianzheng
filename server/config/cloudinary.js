/**
 * Cloudinary 配置
 * 用于图片上传到云存储
 */
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * 配置 Cloudinary 存储
 * @param {string} folder - 上传文件夹名称
 * @returns {CloudinaryStorage}
 */
function getCloudinaryStorage(folder = 'qianzheng') {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
      transformation: [
        { width: 2000, height: 2000, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    }
  });
  return storage;
}

/**
 * 上传图片到 Cloudinary
 * @param {string} filePath - 本地文件路径
 * @param {string} folder - 文件夹名称
 * @returns {Promise<string>} - Cloudinary URL
 */
async function uploadImage(filePath, folder = 'qianzheng') {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary 上传失败:', error);
    throw error;
  }
}

/**
 * 删除 Cloudinary 上的图片
 * @param {string} imageUrl - Cloudinary 图片 URL
 * @returns {Promise<boolean>}
 */
async function deleteImage(imageUrl) {
  try {
    if (!imageUrl) return false;
    
    // 从 URL 提取 public_id
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const publicId = fileName.split('.')[0];
    
    // 需要完整的 public_id（包含文件夹路径）
    // 这里简化处理，实际需要根据文件夹路径构建
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto'
    });
    return true;
  } catch (error) {
    console.error('Cloudinary 删除失败:', error);
    return false;
  }
}

module.exports = {
  cloudinary,
  getCloudinaryStorage,
  uploadImage,
  deleteImage
};