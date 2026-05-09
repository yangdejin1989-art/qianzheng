// 动态API配置
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  console.log('🌐 当前页面信息:', { hostname, port });
  
  // 如果是本地开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('🏠 使用本地开发环境API:', 'http://localhost:5000');
    return 'http://localhost:5000';
  }
  
  // 如果是局域网访问（手机测试）
  if (hostname === '192.168.80.98') {
    console.log('📱 使用局域网API:', 'http://192.168.80.98:5000');
    return 'http://192.168.80.98:5000';
  }
  
  // 生产环境（Vercel 部署）- 使用相对路径
  console.log('🌍 使用生产环境API（相对路径）');
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

// 创建预配置的 axios 实例
import axios from 'axios';

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 30000,
});

// 请求日志
api.interceptors.request.use(config => {
  console.log('📡 API 请求:', config.method.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('✅ API 响应:', response.config.url, response.status);
    return response;
  },
  error => {
    console.error('❌ API 错误:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default api;