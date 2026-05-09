const winston = require('winston');
const path = require('path');
const fs = require('fs');

const isVercel = Boolean(process.env.VERCEL);
const logDir = isVercel ? null : path.join(__dirname, '../logs');

if (logDir && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const extra = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${extra}`;
  })
);

const transports = isVercel
  ? [
      new winston.transports.Console({
        format: consoleFormat,
      }),
    ]
  : [
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 5242880,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'access.log'),
        level: 'info',
        maxsize: 5242880,
        maxFiles: 5,
      }),
    ];

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'jishu-visa' },
  transports,
});

if (!isVercel && process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: consoleFormat }));
}

const logMiddleware = (req, res, next) => {
  const start = Date.now();

  logger.info('API request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined,
  });

  const originalEnd = res.end;
  res.end = function endWithLogging(chunk, encoding) {
    logger.info('API request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${Date.now() - start}ms`,
      contentLength: res.get('Content-Length'),
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

const logEvent = (level, message, data = {}) => {
  logger[level](message, data);
};

const logBusiness = {
  applicationSubmitted: (data) => logEvent('info', 'application_submitted', data),
  statusChanged: (applicationId, oldStatus, newStatus, adminId, reason = '', applicationData = {}) =>
    logEvent('info', 'status_changed', { applicationId, oldStatus, newStatus, adminId, reason, ...applicationData }),
  adminAction: (action, adminId, targetId, details = {}) =>
    logEvent('info', 'admin_action', { action, adminId, targetId, ...details }),
  emailSent: (to, subject, success, error) =>
    logEvent(success ? 'info' : 'error', success ? 'email_sent' : 'email_failed', {
      to,
      subject,
      error: error?.message,
    }),
  fileUploaded: (filename, size, userId) => logEvent('info', 'file_uploaded', { filename, size, userId }),
  securityEvent: (event, ip, details = {}) => logEvent('warn', 'security_event', { event, ip, ...details }),
  systemError: (error, context) =>
    logEvent('error', 'system_error', { error: error?.message, stack: error?.stack, context }),
  orderCreated: (orderData) => logEvent('info', 'order_created', orderData),
  orderStatusChanged: (orderId, oldStatus, newStatus, adminId, reason = '', orderData = {}) =>
    logEvent('info', 'order_status_changed', { orderId, oldStatus, newStatus, adminId, reason, ...orderData }),
  orderCancelled: (orderId, reason, adminId) => logEvent('warn', 'order_cancelled', { orderId, reason, adminId }),
  orderModified: (orderId, changes, adminId) => logEvent('info', 'order_modified', { orderId, changes, adminId }),
  orderViewed: (orderId, viewerId, viewerType) => logEvent('info', 'order_viewed', { orderId, viewerId, viewerType }),
  orderExported: (orderIds, format, adminId) => logEvent('info', 'order_exported', { orderIds, format, adminId }),
  orderPaymentProcessed: (orderId, paymentData) =>
    logEvent('info', 'order_payment_processed', { orderId, ...paymentData }),
  orderRefundProcessed: (orderId, refundData) => logEvent('info', 'order_refund_processed', { orderId, ...refundData }),
};

module.exports = {
  logger,
  logMiddleware,
  logBusiness,
};
