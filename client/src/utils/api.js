import axios from 'axios';
import { API_BASE_URL } from '../config';

// 创建 API 客户�?
const apiClient = axios.create({
  baseURL: API_BASE_URL || '/',
  timeout: 30000,
});

// 构建 API URL
export const apiUrl = (endpoint) => {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${endpoint}`;
  }
  // 生产环境下，使用相对路径
  return endpoint;
};

// 构建图片 URL
export const imageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  if (API_BASE_URL) {
    return `${API_BASE_URL}${imagePath}`;
  }
  // 生产环境下，直接使用路径
  return imagePath;
};

export default apiClient;
