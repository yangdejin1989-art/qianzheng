const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config');

// JWT 密钥（与登录时使用的密钥一致）
const JWT_SECRET = config.jwtSecret;

/**
 * 认证中间件 - 验证 JWT token 并获取当前登录用户信息
 */
async function authenticate(req, res, next) {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: '未提供认证令牌' 
      });
    }
    
    const token = authHeader.substring(7); // 移除 "Bearer " 前缀
    
    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 从数据库获取完整的用户信息
    const user = await Admin.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: '账户已被禁用' 
      });
    }
    
    // 将用户信息附加到请求对象上
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: '无效的认证令牌' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: '认证令牌已过期' 
      });
    }
    console.error('认证错误:', error);
    return res.status(500).json({ 
      success: false, 
      message: '认证失败' 
    });
  }
}

/**
 * 权限检查中间件 - 仅允许管理员访问
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: '未认证' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: '权限不足，仅管理员可访问' 
    });
  }
  
  next();
}

/**
 * 权限检查中间件 - 允许管理员和员工访问
 */
function requireAdminOrStaff(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: '未认证' 
    });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ 
      success: false, 
      message: '权限不足' 
    });
  }
  
  next();
}

module.exports = {
  authenticate,
  requireAdmin,
  requireAdminOrStaff
};

