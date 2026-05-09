// 动态API配置
const getApiBaseUrl = () => {
  // 获取当前页面的主机名和端口
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
  
  // 其他情况，使用相对路径（生产环境）
  console.log('🌍 使用相对路径API（生产环境）');
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

// 导出完整的API URL构建函数
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// 导出图片URL构建函数
export const buildImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log('⚠️ 图片路径为空');
    return '';
  }
  if (imagePath.startsWith('http')) {
    console.log('🌐 图片已经是完整URL:', imagePath);
    return imagePath;
  }
  const fullUrl = `${API_BASE_URL}${imagePath}`;
  console.log('🔗 构建图片URL:', imagePath, '->', fullUrl);
  return fullUrl;
};
