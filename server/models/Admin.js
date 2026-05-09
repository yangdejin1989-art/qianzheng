const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' }, // 角色：管理员/员工
  displayName: { type: String }, // 显示名称
  // 联系方式
  phone: { type: String }, // 手机号
  email: { type: String }, // 邮箱
  wechat: { type: String }, // 微信号
  qq: { type: String }, // QQ号
  permissions: {
    // 权限配置
    orderManagement: { type: Boolean, default: false },      // 订单管理
    packageManagement: { type: Boolean, default: false },    // 套餐管理
    templateManagement: { type: Boolean, default: false },   // 模板管理
    blacklistManagement: { type: Boolean, default: false },  // 黑名单管理
    faqManagement: { type: Boolean, default: false },        // 常见问题管理
    noticeManagement: { type: Boolean, default: false },     // 公告管理
    userManagement: { type: Boolean, default: false }        // 用户管理
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true } // 账户是否激活
});

module.exports = mongoose.model('Admin', adminSchema);