const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 控制台格式（开发环境）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// 创建logger实例
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'jishu-visa' },
  transports: [
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 所有日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 访问日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'access.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// 日志中间件
const logMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // 记录请求开始
  logger.info('API请求开始', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined
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
      contentLength: res.get('Content-Length')
    });
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// 业务日志记录函数
const logBusiness = {
  // 用户申请
  applicationSubmitted: (data) => {
    logger.info('用户提交申请', {
      event: 'application_submitted',
      applicationId: data._id,
      applicationCode: data.applicationCode || `APP${Date.now()}`,
      phone: data.phone,
      name: data.name,
      package: data.package,
      address: data.address,
      idCard: data.idCard,
      submitTime: new Date().toISOString(),
      ip: data.ip,
      userAgent: data.userAgent
    });
  },

  // 状态变更
  statusChanged: (applicationId, oldStatus, newStatus, adminId, reason = '', applicationData = {}) => {
    logger.info('申请状态变更', {
      event: 'status_changed',
      applicationId,
      applicationCode: applicationData.applicationCode || `APP${Date.now()}`,
      oldStatus,
      newStatus,
      adminId,
      adminName: applicationData.adminName || '未知管理员',
      reason,
      changeTime: new Date().toISOString(),
      operationDetails: {
        from: oldStatus,
        to: newStatus,
        operator: adminId,
        reason: reason
      }
    });
  },

  // 管理员操作
  adminAction: (action, adminId, targetId, details) => {
    logger.info('管理员操作', {
      event: 'admin_action',
      action,
      adminId,
      adminName: details.adminName,
      targetId,
      targetType: details.targetType, // 'application', 'order', 'user'
      targetCode: details.targetCode, // 申请编码、订单号等
      operationTime: new Date().toISOString(),
      operationDetails: {
        action: action,
        target: targetId,
        changes: details.changes,
        reason: details.reason,
        ip: details.ip,
        userAgent: details.userAgent
      },
      ...details
    });
  },

  // 邮件发送
  emailSent: (to, subject, success, error) => {
    if (success) {
      logger.info('邮件发送成功', {
        event: 'email_sent',
        to,
        subject
      });
    } else {
      logger.error('邮件发送失败', {
        event: 'email_failed',
        to,
        subject,
        error: error.message
      });
    }
  },

  // 文件上传
  fileUploaded: (filename, size, userId) => {
    logger.info('文件上传', {
      event: 'file_uploaded',
      filename,
      size,
      userId
    });
  },

  // 安全事件
  securityEvent: (event, ip, details) => {
    logger.warn('安全事件', {
      event: 'security_event',
      type: event,
      ip,
      details
    });
  },

  // 系统错误
  systemError: (error, context) => {
    logger.error('系统错误', {
      event: 'system_error',
      error: error.message,
      stack: error.stack,
      context
    });
  },

  // 订单相关操作
  orderCreated: (orderData) => {
    logger.info('订单创建', {
      event: 'order_created',
      orderId: orderData._id,
      orderCode: orderData.orderCode || `ORD${Date.now()}`,
      customerName: orderData.customerName,
      phone: orderData.phone,
      package: orderData.package,
      amount: orderData.amount,
      status: orderData.status,
      createTime: new Date().toISOString(),
      applicationId: orderData.applicationId,
      applicationCode: orderData.applicationCode,
      customerInfo: {
        name: orderData.customerName,
        phone: orderData.phone,
        address: orderData.address,
        idCard: orderData.idCard
      },
      orderDetails: {
        package: orderData.package,
        amount: orderData.amount,
        paymentMethod: orderData.paymentMethod,
        installDate: orderData.installDate
      }
    });
  },

  orderStatusChanged: (orderId, oldStatus, newStatus, adminId, reason = '', orderData = {}) => {
    logger.info('订单状态变更', {
      event: 'order_status_changed',
      orderId,
      orderCode: orderData.orderCode || `ORD${Date.now()}`,
      oldStatus,
      newStatus,
      adminId,
      adminName: orderData.adminName || '未知管理员',
      reason,
      changeTime: new Date().toISOString(),
      operationDetails: {
        from: oldStatus,
        to: newStatus,
        operator: adminId,
        reason: reason,
        previousData: orderData.previousData,
        newData: orderData.newData
      }
    });
  },

  orderCancelled: (orderId, reason, adminId) => {
    logger.warn('订单取消', {
      event: 'order_cancelled',
      orderId,
      reason,
      adminId,
      timestamp: new Date().toISOString()
    });
  },

  orderModified: (orderId, changes, adminId) => {
    logger.info('订单修改', {
      event: 'order_modified',
      orderId,
      changes,
      adminId,
      timestamp: new Date().toISOString()
    });
  },

  orderViewed: (orderId, viewerId, viewerType) => {
    logger.info('订单查看', {
      event: 'order_viewed',
      orderId,
      viewerId,
      viewerType, // 'admin' 或 'customer'
      timestamp: new Date().toISOString()
    });
  },

  orderExported: (orderIds, format, adminId) => {
    logger.info('订单导出', {
      event: 'order_exported',
      orderIds,
      format,
      adminId,
      count: Array.isArray(orderIds) ? orderIds.length : 1,
      timestamp: new Date().toISOString()
    });
  },

  orderPaymentProcessed: (orderId, paymentData) => {
    logger.info('订单支付处理', {
      event: 'order_payment_processed',
      orderId,
      paymentMethod: paymentData.method,
      amount: paymentData.amount,
      transactionId: paymentData.transactionId,
      status: paymentData.status
    });
  },

  orderRefundProcessed: (orderId, refundData) => {
    logger.info('订单退款处理', {
      event: 'order_refund_processed',
      orderId,
      refundAmount: refundData.amount,
      reason: refundData.reason,
      adminId: refundData.adminId
    });
  }
};

module.exports = {
  logger,
  logMiddleware,
  logBusiness
};