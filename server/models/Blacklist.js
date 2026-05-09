const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  // 黑名单值（IP地址、邮箱或手机号）
  value: { 
    type: String, 
    required: true,
    index: true 
  },
  
  // 黑名单类型：'ip', 'email', 'phone'
  type: { 
    type: String, 
    enum: ['ip', 'email', 'phone'], 
    required: true 
  },
  
  // 被封禁的原因
  reason: { 
    type: String, 
    required: true 
  },
  
  // 封禁开始时间
  bannedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // 封禁结束时间（null表示永久封禁）
  expiresAt: { 
    type: Date, 
    default: null 
  },
  
  // 是否启用
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // 添加人
  addedBy: { 
    type: String, 
    default: 'system' 
  },
  
  // 备注
  notes: String
});

// 创建复合索引，确保同一类型的值不会重复
blacklistSchema.index({ value: 1, type: 1 }, { unique: true });

// 检查是否在黑名单中
blacklistSchema.statics.isBlacklisted = async function(value, type) {
  const now = new Date();
  const blacklist = await this.findOne({
    value: value,
    type: type,
    isActive: true,
    $or: [
      { expiresAt: null }, // 永久封禁
      { expiresAt: { $gt: now } } // 未过期的临时封禁
    ]
  });
  
  return blacklist !== null;
};

// 添加到黑名单
blacklistSchema.statics.addToBlacklist = async function(value, type, reason, expiresAt = null, addedBy = 'system', notes = '') {
  const blacklist = new this({
    value: value,
    type: type,
    reason: reason,
    expiresAt: expiresAt,
    addedBy: addedBy,
    notes: notes
  });
  
  return await blacklist.save();
};

// 从黑名单移除
blacklistSchema.statics.removeFromBlacklist = async function(value, type) {
  return await this.updateMany(
    { value: value, type: type },
    { isActive: false }
  );
};

module.exports = mongoose.model('Blacklist', blacklistSchema);