const { logger, logBusiness } = require('../utils/logger');

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // 记录请求开始
  logger.info('API请求开始', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // 重写res.end来记录响应
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info('API请求完成', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    });
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// 错误日志中间件
const errorLogger = (err, req, res, next) => {
  logger.error('服务器错误', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });
  
  next(err);
};

// 安全日志中间件
const securityLogger = (req, res, next) => {
  // 检测可疑请求
  const suspiciousPatterns = [
    /\.\.\//, // 路径遍历攻击
    /<script/i, // XSS攻击
    /union.*select/i, // SQL注入
    /eval\(/i, // 代码注入
  ];

  const userInput = JSON.stringify(req.body) + req.url + JSON.stringify(req.query);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userInput)) {
      logBusiness.securityEvent('suspicious_request', req.ip, {
        pattern: pattern.toString(),
        url: req.url,
        body: req.body,
        query: req.query
      });
      break;
    }
  }

  next();
};

// 业务操作日志中间件
const businessLogger = (operation) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      try {
        const responseData = typeof data === 'string' ? JSON.parse(data) : data;
        
        // 记录成功的业务操作
        if (res.statusCode >= 200 && res.statusCode < 300) {
          logBusiness.adminAction(operation, req.user?.id, responseData._id || responseData.id, {
            method: req.method,
            url: req.url,
            response: responseData
          });
        }
      } catch (e) {
        // 如果解析失败，仍然记录操作
        logBusiness.adminAction(operation, req.user?.id, null, {
          method: req.method,
          url: req.url
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// 数据库操作日志中间件
const databaseLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    try {
      const responseData = typeof data === 'string' ? JSON.parse(data) : data;
      
      // 记录数据库查询性能
      if (req.dbQueryTime) {
        logger.info('数据库查询', {
          operation: req.method,
          collection: req.collection,
          queryTime: req.dbQueryTime,
          resultCount: Array.isArray(responseData) ? responseData.length : 1
        });
      }
    } catch (e) {
      // 忽略解析错误
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  requestLogger,
  errorLogger,
  securityLogger,
  businessLogger,
  databaseLogger
};