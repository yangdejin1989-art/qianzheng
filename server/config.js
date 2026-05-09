module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/visa-system',
  jwtSecret: process.env.JWT_SECRET || 'secret_key',
  // 邮件功能配置
  emailConfig: {
    enabled: process.env.ENABLE_STATUS_EMAILS === 'true',
    user: process.env.EMAIL_USER || 'jishu2020_service@163.com',
    pass: process.env.EMAIL_PASS || 'QDyQgPu328neKbEE'
  }
};