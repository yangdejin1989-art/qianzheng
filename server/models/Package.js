const mongoose = require('mongoose');

const visaTypeSchema = new mongoose.Schema({
  type: String,  // 签证类型：如"单次"、"一年多次"
  currency: String, // 该签证类型的币种
  price: Number,
  originalPrice: Number
}, { _id: false });

const packageSchema = new mongoose.Schema({
  name: String,
  speed: String, // 预计完成时间
  visaType: String, // 签证类型：单次、一年多次、三年多次、五年多次等（保留用于兼容旧数据）
  price: Number,
  originalPrice: Number,
  // 新增：多个签证类型及其价格
  visaTypes: [visaTypeSchema],
  currency: { type: String, default: 'CNY' }, // 默认币种（用于兼容旧数据）
  description: String,
  features: [String],
  details: String,
  imageUrl: String,
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Package', packageSchema);