const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  phone: String,
  applyCode: String,
  name: String,
  queryType: String,
  code: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL索引，自动删除过期记录
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 创建复合索引，提高查询效率
emailVerificationSchema.index({ email: 1, code: 1 });
emailVerificationSchema.index({ email: 1, verified: 1, expiresAt: 1 });

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);
