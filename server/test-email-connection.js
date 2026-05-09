// 邮件连接测试脚本
const { createTransporter } = require('./utils/transporter');

async function testEmailConnection() {
  console.log('🧪 开始测试邮件连接...\n');

  try {
    console.log('1️⃣ 检查环境变量...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || '未设置 (使用默认值)');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '已设置' : '未设置 (使用默认值)');
    console.log('ENABLE_STATUS_EMAILS:', process.env.ENABLE_STATUS_EMAILS || '未设置');

    console.log('\n2️⃣ 测试创建邮件传输器...');
    const transporter = await createTransporter();
    console.log('✅ 邮件传输器创建成功');

    console.log('\n3️⃣ 测试邮件发送...');
    const testMailOptions = {
      from: process.env.EMAIL_USER || 'jishu2020_service@163.com',
      to: 'test@example.com', // 测试邮箱
      subject: '邮件功能测试',
      html: '<h1>这是一封测试邮件</h1><p>如果您收到这封邮件，说明邮件功能正常工作。</p>'
    };

    console.log('📧 发送测试邮件...');
    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ 测试邮件发送成功！');
    console.log('Message ID:', result.messageId);

    console.log('\n🎯 邮件功能测试完成！所有功能正常。');

  } catch (error) {
    console.error('\n❌ 邮件功能测试失败:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    
    if (error.response) {
      console.error('SMTP响应:', error.response);
    }

    console.log('\n🔧 常见问题解决方案:');
    console.log('1. 检查163邮箱授权码是否正确');
    console.log('2. 检查网络连接是否正常');
    console.log('3. 检查163邮箱是否开启了SMTP服务');
    console.log('4. 检查防火墙是否阻止了SMTP连接');
    
    console.log('\n📧 163邮箱SMTP设置说明:');
    console.log('- 服务器: smtp.163.com');
    console.log('- 端口: 465 (SSL) 或 25 (非SSL)');
    console.log('- 需要开启SMTP服务并获取授权码');
    console.log('- 授权码不是登录密码，需要在邮箱设置中单独获取');

  } finally {
    process.exit(0);
  }
}

// 运行测试
testEmailConnection();
