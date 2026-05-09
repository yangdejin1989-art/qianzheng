// API测试脚本
const http = require('http');

console.log('🧪 测试邮件配置API...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/email-config',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📧 邮件配置响应:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.enabled) {
        console.log('\n✅ 邮件功能已启用！');
      } else {
        console.log('\n❌ 邮件功能未启用');
      }
    } catch (error) {
      console.log('\n❌ 响应不是有效的JSON:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ 请求失败:', error.message);
});

req.end();
