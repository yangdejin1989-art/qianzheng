const Blacklist = require('../models/Blacklist');

// 获取客户端真实IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.ip || 
         'unknown';
};

// IP黑名单检查中间件
const checkIPBlacklist = async (req, res, next) => {
  try {
    const clientIP = getClientIP(req);
    
    // 检查IP是否在黑名单中
    const isBlacklisted = await Blacklist.isBlacklisted(clientIP, 'ip');
    
    if (isBlacklisted) {
      return res.status(403).json({
        success: false,
        message: '您的IP地址已被封禁，无法访问此服务',
        code: 'IP_BLACKLISTED'
      });
    }
    
    // 将IP添加到请求对象中，供后续使用
    req.clientIP = clientIP;
    next();
  } catch (error) {
    console.error('IP黑名单检查失败:', error);
    next(); // 出错时继续执行，不阻止请求
  }
};

// 邮箱黑名单检查
const checkEmailBlacklist = async (email) => {
  try {
    return await Blacklist.isBlacklisted(email, 'email');
  } catch (error) {
    console.error('邮箱黑名单检查失败:', error);
    return false;
  }
};

// 手机号黑名单检查
const checkPhoneBlacklist = async (phone) => {
  try {
    return await Blacklist.isBlacklisted(phone, 'phone');
  } catch (error) {
    console.error('手机号黑名单检查失败:', error);
    return false;
  }
};

// 频率限制检查
const checkRateLimit = async (req, res, next) => {
  try {
    const clientIP = req.clientIP || getClientIP(req);
    const email = req.body.email;
    const phone = req.body.phone;
    
    // 这里可以添加更复杂的频率限制逻辑
    // 比如使用Redis记录请求次数等
    
    next();
  } catch (error) {
    console.error('频率限制检查失败:', error);
    next();
  }
};

module.exports = {
  checkIPBlacklist,
  checkEmailBlacklist,
  checkPhoneBlacklist,
  checkRateLimit,
  getClientIP
};