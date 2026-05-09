// MaterialTemplate.js
// 材料模板数据模型 - 用于配置不同签证类型的材料清单

const mongoose = require('mongoose');

const materialTemplateSchema = new mongoose.Schema({
  // 关联的签证类型（Package）
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  packageName: {
    type: String,
    required: true
  },
  
  // 客户类型数组
  customerTypes: [{
    typeId: {
      type: String,
      required: true
    },
    typeName: {
      type: String,
      required: true
    },
    description: String,
    order: {
      type: Number,
      default: 0
    },
    
    // 该客户类型的材料清单
    materials: [{
      materialId: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      needsImage: {
        type: Boolean,
        default: false
      },
      allowMultiple: {
        type: Boolean,
        default: false
      },
      description: String,
      order: {
        type: Number,
        default: 0
      }
    }]
  }]
}, {
  timestamps: true
});

// 索引优化
materialTemplateSchema.index({ packageId: 1 });
materialTemplateSchema.index({ packageName: 1 });

module.exports = mongoose.model('MaterialTemplate', materialTemplateSchema);

