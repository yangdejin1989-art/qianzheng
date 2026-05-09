// 邮件发送辅助函数
const { buildStatusEmail } = require('../emailTemplates/statusTemplates');
const { createTransporter } = require('./transporter');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 手动发送状态邮件（用于管理界面）
 * @param {string} applicationId - 申请ID
 * @param {Object} application - 申请记录
 * @returns {Promise<Object>} 发送结果
 */
async function sendManualStatusEmail(applicationId, application) {
  try {
    const status = application.status;
    
    // 生成免验证查询 token（30 分钟有效）
    const token = jwt.sign({
      email: application.email,
      name: application.name,
      applyCode: application.applyCode,
      queryType: 'code',
      verified: true,
      exp: Math.floor(Date.now() / 1000) + (30 * 60)
    }, config.jwtSecret);

    const webOrigin = process.env.PUBLIC_WEB_ORIGIN || 'http://localhost:3000';
    const openParam = (status === '待确认' || status === '处理中') ? '&open=materials' : '';
    const linkUrl = `${webOrigin}/?page=status&token=${encodeURIComponent(token)}${openParam}`;

    // 构建邮件内容（包含更多字段与快捷链接）
    const emailContent = buildStatusEmail(status, {
      name: application.name,
      phone: application.phone,
      address: application.address,
      email: application.email,
      wechat: application.wechat,
      networkType: application.networkType,
      installDate: application.installDate,
      packageName: application.package,
      visaType: application.visaType,        // 签证次数
      visaPrice: application.visaPrice,      // 办理价格
      visaCurrency: application.visaCurrency, // 币种
      customerTypeName: application.customerType?.typeName || '', // 办理类型
      applyCode: application.applyCode,
      submitTime: application.createdAt ? new Date(application.createdAt).toLocaleString('zh-CN') : '未知',
      updateTime: application.updatedAt ? new Date(application.updatedAt).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN'),
      feedback: application.feedback,
      linkUrl
    });

    if (!emailContent) {
      return { success: false, message: `未找到状态 "${status}" 的邮件模版` };
    }

    // 创建邮件传输器
    const transporter = await createTransporter();
    
    // 发送邮件
    const mailOptions = {
      from: process.env.EMAIL_USER || 'jishu2020_service@163.com',
      to: application.email,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log(`✅ 手动状态邮件发送成功: ${application.email} - ${status}`);
    
    return {
      success: true,
      message: '邮件发送成功',
      messageId: result.messageId,
      status: status,
      email: application.email,
      applicationId: applicationId
    };

  } catch (error) {
    console.error(`❌ 手动状态邮件发送失败: ${error.message}`);
    return {
      success: false,
      message: `邮件发送失败: ${error.message}`,
      error: error.message
    };
  }
}

module.exports = {
  sendManualStatusEmail
};