const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  siteName: { 
    type: String, 
    default: '季舒签证',
    required: true 
  },
  siteDescription: { 
    type: String, 
    default: '专业的签证服务提供商' 
  },
  siteKeywords: { 
    type: String, 
    default: '签证,出国,旅游签证,商务签证' 
  },
  contactPhone: { 
    type: String, 
    default: '08031886981' 
  },
  contactEmail: { 
    type: String, 
    default: '843752026@qq.com' 
  },
  contactAddress: { 
    type: String, 
    default: '福建省福州市高新区群升广场6号611' 
  },
  workingHours: { 
    type: String, 
    default: '周一到周五 18:00-19:00' 
  },
  logoUrl: { 
    type: String, 
    default: '/logo192.png' 
  },
  faviconUrl: { 
    type: String, 
    default: '/favicon.ico' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 更新时自动设置 updatedAt
siteSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
