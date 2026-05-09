// 安装测试依赖脚本

const { execSync } = require('child_process');

console.log('📦 开始安装测试依赖...');

try {
  // 安装 axios
  console.log('安装 axios...');
  execSync('npm install axios', { stdio: 'inherit' });
  console.log('✅ axios 安装成功');
  

  
  // 安装 puppeteer
  console.log('安装 puppeteer...');
  execSync('npm install puppeteer', { stdio: 'inherit' });
  console.log('✅ puppeteer 安装成功');
  
  console.log('🎉 所有依赖安装完成！');
  console.log('');
  console.log('现在可以运行测试了:');
  console.log('1. node debug_test.js - 调试测试');
  console.log('2. node debug_frontend.js - 前端调试');
  console.log('3. node run_tests.js - 完整测试');
  
} catch (error) {
  console.log('❌ 安装失败:', error.message);
  console.log('');
  console.log('请手动安装依赖:');
  console.log('npm install axios puppeteer');
} 