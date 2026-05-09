const mongoose = require('mongoose');

// 定义材料子Schema
const materialSchema = new mongoose.Schema({
  materialId: String,
  materialName: String,
  templateRequired: Boolean,
  needsImage: { type: Boolean, default: false },
  allowMultiple: { type: Boolean, default: false },
  materialType: { type: String, enum: ['personal', 'shared'], default: 'personal' },
  status: { type: String, default: '未提交' },
  images: [String],
  note: String,
  submittedBy: String,
  submittedAt: Date,
  reviewedAt: Date,
  reviewNote: String,
  personId: String,
  personName: String
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  email: String,
  wechat: String,
  line: String,
  networkType: String,  // 办理方式：普通办理、加急办理、特急办理
  installDate: String,  // 预计完成日期
  package: String,
  visaType: String,     // 签证类型：单次、一年多次、三年多次等
  visaPrice: Number,    // 该签证类型的价格
  visaCurrency: { type: String, default: 'CNY' },  // 币种：CNY、JPY、USD等
  companions: [String],
  customerType: {
    typeId: String,
    typeName: String
  },
  materials: [materialSchema],
  // 新的简化材料存储：{ materialId: ['/uploads/file1.jpg', '/uploads/file2.jpg'] }
  materialFiles: { type: mongoose.Schema.Types.Mixed, default: {} },
  questionsAnswers: [{
    questionId: String,
    questionText: String,
    answer: mongoose.Schema.Types.Mixed,
    groupId: String,
    groupName: String
  }],
  // 新的简化答案存储：{ questionId: 'answer text' }
  answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, default: '待处理' },
  feedback: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  applyCode: { type: String, unique: true, index: true },
  deleted: { type: Boolean, default: false },
  confirmTime: Date,
  idCardFront: String,
  idCardBack: String,
  passportPhoto: String,
  japaneseName: String,
  other: String,
  notes: String,
  additionalMaterials: String,
  contactPreference: String,
  messages: [{
    role: { type: String, enum: ['user', 'admin'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  // 待审核的修改申请
  pendingModification: {
    japaneseName: String,
    idCardFront: String,
    idCardBack: String,
    passportPhoto: String,
    other: String,
    notes: String,
    modificationReason: String,
    timestamp: Date
  },
  processLog: [{
    action: String,
    description: String,
    images: Object,
    timestamp: { type: Date, default: Date.now }
  }],
  materialHistory: [{
    japaneseName: String,
    idCardFront: String,
    idCardBack: String,
    passportPhoto: String,
    other: String,
    notes: String,
    timestamp: { type: Date, default: Date.now }
  }],
  // 邮件发送记录：记录每个状态是否已发送过状态通知邮件及时间
  emailLog: [{
    status: { type: String, required: true },
    type: { type: String, enum: ['auto', 'manual'], required: true },
    sentAt: { type: Date, default: Date.now }
  }],
  // 管理员备注记录：只供管理员查看的内部备注
  adminNotes: [{
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  // 账单明细：支付记录和成本记录
  billing: {
    payments: [{
      paymentId: { type: String, required: true },
      amount: { type: Number, required: true },
      paymentDate: { type: Date, required: true },
      payerName: { type: String, required: true },
      paymentType: { type: String, default: '支付宝' },
      note: String,
      createdAt: { type: Date, default: Date.now }
    }],
    cost: {
      amount: { type: Number, default: 0 },
      note: String,
      updatedAt: Date
    }
  },
  // 订单分配：分配给哪个员工处理
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin',
    default: null 
  },
  assignedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin',
    default: null 
  },
  assignedAt: { type: Date },
  // 财务结算：订单是否已结算
  settled: { type: Boolean, default: false },
  settledAt: { type: Date },
  settledBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin'
  }
});

module.exports = mongoose.model('Application', applicationSchema);