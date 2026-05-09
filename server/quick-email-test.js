// 快速邮件测试脚本
const nodemailer = require('nodemailer');

async function quickEmailTest() {
  console.log('🧪 快速邮件测试...\n');

  try {
    // 设置环境变量（模拟启动脚本的设置）
    process.env.EMAIL_USER = 'jishu2020_service@163.com';
    process.env.EMAIL_PASS = 'QDyQgPu328neKbEE';
    process.env.ENABLE_STATUS_EMAILS = 'true';

    console.log('📧 邮箱配置:');
    console.log('用户:', process.env.EMAIL_USER);
    console.log('密码:', process.env.EMAIL_PASS ? '已设置' : '未设置');
    console.log('功能开关:', process.env.ENABLE_STATUS_EMAILS);

    // 创建传输器
    const transporter = nodemailer.createTransport({
      host: 'smtp.163.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('\n✅ 传输器创建成功');

    // 测试连接
    await transporter.verify();
    console.log('✅ 连接验证成功');

    // 发送测试邮件
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'test@example.com',
      subject: '邮件功能测试',
      html: '<h1>测试邮件</h1><p>邮件功能正常工作！</p>'
    };

    console.log('\n📧 发送测试邮件...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ 邮件发送成功！');
    console.log('Message ID:', result.messageId);

    console.log('\n🎯 邮件功能完全正常！');

  } catch (error) {
    console.error('\n❌ 邮件测试失败:');
    console.error('错误:', error.message);
    
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    
    console.log('\n🔧 建议检查:');
    console.log('1. 163邮箱授权码是否正确');
    console.log('2. 网络连接是否正常');
    console.log('3. 163邮箱SMTP服务是否开启');
  }
}

quickEmailTest();
