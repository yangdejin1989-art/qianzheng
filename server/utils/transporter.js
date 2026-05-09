// 邮件传输器配置
const nodemailer = require('nodemailer');

/**
 * 创建邮件传输器
 * @returns {Promise<Object>} Nodemailer传输器
 */
async function createTransporter() {
  try {
    // 检查环境变量
    const emailUser = process.env.EMAIL_USER || 'jishu2020_service@163.com';
    const emailPass = process.env.EMAIL_PASS || 'QDyQgPu328neKbEE';
    
    if (!emailUser || !emailPass) {
      throw new Error('邮箱配置不完整，请检查 EMAIL_USER 和 EMAIL_PASS 环境变量');
    }

    // 创建163邮箱传输器
    const transporter = nodemailer.createTransport({
      host: 'smtp.163.com',
      port: 465,
      secure: true, // 使用SSL
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // 验证连接
    await transporter.verify();
    console.log('✅ 邮件传输器连接成功');
    
    return transporter;

  } catch (error) {
    console.error('❌ 邮件传输器创建失败:', error.message);
    throw error;
  }
}

module.exports = {
  createTransporter
};
