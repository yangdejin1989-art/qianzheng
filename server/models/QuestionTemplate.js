const mongoose = require('mongoose');

// 简化的问题项 Schema
const questionItemSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true }, // 问题文本
  questionType: { type: String, enum: ['common', 'personal'], default: 'personal' }, // 问题类型：common=共同问题，personal=个人问题
  required: { type: Boolean, default: false }, // 是否必填
  helpText: String, // 帮助文本
  order: { type: Number, default: 0 }
});

// 问题模板 Schema
const questionTemplateSchema = new mongoose.Schema({
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  packageName: { type: String, required: true },
  customerTypeId: String, // 特定客户类型的问题模板
  customerTypeName: String,
  questions: [questionItemSchema], // 简化为直接的问题数组
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

questionTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 创建复合索引，确保同一签证类型+客户类型只有一个模板
questionTemplateSchema.index({ packageId: 1, customerTypeId: 1 }, { unique: true });

module.exports = mongoose.model('QuestionTemplate', questionTemplateSchema);





