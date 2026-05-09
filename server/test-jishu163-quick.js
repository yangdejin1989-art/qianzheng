const nodemailer = require('nodemailer');
const readline = require('readline');

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('========================================');
console.log('163邮箱快速测试 - jishu2020_service@163.com');
console.log('========================================');
console.log('📧 邮箱地址: jishu2020_service@163.com');
console.log('');

// 请求用户输入授权码
rl.question('请输入您的163邮箱授权码: ', async (authCode) => {
  if (!authCode || authCode.trim() === '') {
    console.log('❌ 授权码不能为空！');
    rl.close();
    return;
  }

  const testConfig = {
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
      user: 'jishu2020_service@163.com',
      pass: authCode.trim()
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  };

  console.log('');
  console.log('🔧 测试配置:');
  console.log('   SMTP服务器: smtp.163.com');
  console.log('   端口: 465 (SSL)');
  console.log('   邮箱: jishu2020_service@163.com');
  console.log('   授权码: ***已设置***');
  console.log('');

  // 创建传输器
  const transporter = nodemailer.createTransporter(testConfig);

  try {
    console.log('🔄 正在测试SMTP连接...');
    
    // 验证连接
    await transporter.verify();
    console.log('✅ SMTP连接测试成功！');
    
    // 测试发送邮件
    console.log('🔄 正在测试邮件发送...');
    const mailOptions = {
      from: testConfig.auth.user,
      to: testConfig.auth.user, // 发送给自己
      subject: '163邮箱SMTP测试邮件 - jishu2020_service',
      text: '这是一封测试邮件，用于验证163邮箱SMTP配置是否正确。',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">163邮箱SMTP测试邮件</h2>
          <p>您好！</p>
          <p>这是一封测试邮件，用于验证163邮箱SMTP配置是否正确。</p>
          <p>如果您收到这封邮件，说明配置成功！</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 邮件发送成功！');
    console.log('📧 邮件ID:', info.messageId);
    console.log('📤 发送时间:', new Date().toLocaleString());
    console.log('');
    console.log('🎉 恭喜！163邮箱配置成功！');
    console.log('现在您可以使用"163邮箱一键启动.bat"启动系统了。');
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    console.log('');
    console.log('🔍 错误详情:');
    console.log('错误代码:', error.code);
    console.log('错误类型:', error.name);
    
    if (error.code === 'EAUTH') {
      console.log('');
      console.log('💡 认证失败解决方案:');
      console.log('1. 确认授权码正确（不是登录密码）');
      console.log('2. 确认已开启SMTP服务');
      console.log('3. 检查授权码是否过期');
      console.log('4. 尝试重新生成授权码');
      console.log('');
      console.log('🔧 重新配置步骤:');
      console.log('1. 登录 mail.163.com');
      console.log('2. 点击右上角"设置"');
      console.log('3. 选择"POP3/SMTP/IMAP"');
      console.log('4. 重新生成授权码');
      console.log('5. 重新运行此测试脚本');
    } else if (error.code === 'ECONNECTION') {
      console.log('');
      console.log('💡 连接失败解决方案:');
      console.log('1. 检查网络连接');
      console.log('2. 检查防火墙设置');
      console.log('3. 尝试使用其他端口（587）');
    }
  }
  
  rl.close();
});
