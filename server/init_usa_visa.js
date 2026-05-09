const mongoose = require('mongoose');
const Package = require('./models/Package');
const MaterialTemplate = require('./models/MaterialTemplate');
const QuestionTemplate = require('./models/QuestionTemplate');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visa-system';

const usaPackageName = '美国签证';

// ==================== 材料配置 ====================

const usaVisaMaterials = {
  'tourist': {
    typeName: '美国签证',
    description: '美国旅游/商务签证申请',
    materials: [
      // 基础证件类（4项）
      {
        materialId: 'passport',
        name: '护照',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '有效期6个月以上的护照（首页、签证页等）'
      },
      {
        materialId: 'passport_old',
        name: '旧护照',
        required: false,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '如有旧护照请一并提供'
      },
      {
        materialId: 'photo_5x5',
        name: '签证照片',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '5CM×5CM 白底彩色照片'
      },
      {
        materialId: 'residence_card',
        name: '在留卡',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '在留卡正反面（有效期6个月以上）'
      },
      
      // 居住证明类（1项）
      {
        materialId: 'residence_certificate',
        name: '住民票',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'shared',
        description: '家庭全员记载的住民票'
      },
      
      // 财力证明类（1项）
      {
        materialId: 'bank_balance',
        name: '银行余额证明',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '银行英文版余额证明（学生50万日币以上，根据情况会有所不同）'
      },
      
      // 工作/学习证明类（1项）
      {
        materialId: 'employment_certificate',
        name: '在职证明/在学证明',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '英文版在职证明或在学证明（如无英文版，可自行翻译）'
      },
      
      // 行程相关类（3项）
      {
        materialId: 'itinerary',
        name: '旅程表',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '英文版访问地日程安排'
      },
      {
        materialId: 'flight_ticket',
        name: '电子机票单',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '电子机票预订单'
      },
      {
        materialId: 'hotel_booking',
        name: '酒店预订单',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '英文版酒店预订确认单'
      }
    ]
  }
};

// ==================== 问题模板配置 ====================
// 根据用户提供的问题清单，进行分组优化

const usaQuestions = [
  // 基本个人信息（8题）
  { 
    questionId: 'name_english', 
    questionText: '英文姓名', 
    required: true, 
    helpText: '请填写与护照一致的英文姓名（姓/名）', 
    questionType: 'personal' 
  },
  { 
    questionId: 'name_chinese', 
    questionText: '中文姓名', 
    required: true, 
    helpText: '请填写中文姓名', 
    questionType: 'personal' 
  },
  { 
    questionId: 'marital_status', 
    questionText: '婚姻状况', 
    required: true, 
    helpText: '请选择：未婚/已婚/离异/丧偶', 
    questionType: 'personal' 
  },
  { 
    questionId: 'birthday', 
    questionText: '生日', 
    required: true, 
    helpText: '格式：YYYY-MM-DD', 
    questionType: 'personal' 
  },
  { 
    questionId: 'birth_place', 
    questionText: '出生地（国家/省份/城市）', 
    required: true, 
    helpText: '请填写出生的国家、省份、城市\n示例：中国 / 北京市 / 北京市', 
    questionType: 'personal' 
  },
  { 
    questionId: 'other_country_pr', 
    questionText: '是否为其他国家永驻', 
    required: true, 
    helpText: '请选择：是/否。如是，请注明国家名称', 
    questionType: 'personal' 
  },
  { 
    questionId: 'china_id_number', 
    questionText: '中国身份证号', 
    required: true, 
    helpText: '请填写18位身份证号码', 
    questionType: 'personal' 
  },
  { 
    questionId: 'phone', 
    questionText: '电话号码', 
    required: true, 
    helpText: '请填写手机号码', 
    questionType: 'personal' 
  },
  
  // 联系方式与住址（2题）
  { 
    questionId: 'current_address', 
    questionText: '现家庭住址', 
    required: true, 
    helpText: '请填写详细的现居住地址', 
    questionType: 'personal' 
  },
  { 
    questionId: 'social_media', 
    questionText: '社交媒体账号', 
    required: true, 
    helpText: '请填写过去五年使用的社交媒体平台及账号\n示例：\nFacebook: xxx\n微博: xxx\nYouTube: xxx\nQQ: xxx\n优酷: xxx', 
    questionType: 'personal' 
  },
  
  // 旅行计划（3题）
  { 
    questionId: 'travel_plan', 
    questionText: '旅行计划', 
    required: true, 
    helpText: '请填写旅行计划（年月日、目的地州市）\n示例：\n2025-06-01 至 2025-06-15\n加利福尼亚州 洛杉矶市', 
    questionType: 'personal' 
  },
  { 
    questionId: 'companions', 
    questionText: '同行者信息', 
    required: false, 
    helpText: '如有同行者，请填写姓名和关系\n示例：\n张三 / 配偶\n李四 / 朋友', 
    questionType: 'personal' 
  },
  { 
    questionId: 'us_contact', 
    questionText: '在美国的联系方式', 
    required: false, 
    helpText: '如在美国有联系人，请填写：\n姓名：\n关系：\n电话：\n地址：', 
    questionType: 'personal' 
  },
  
  // 护照信息（1题）
  { 
    questionId: 'passport_info', 
    questionText: '护照信息', 
    required: true, 
    helpText: '请填写护照信息：\n护照号码：\n签发日期：YYYY-MM-DD\n有效期至：YYYY-MM-DD\n签发地：', 
    questionType: 'personal' 
  },
  
  // 家庭成员信息（2题）
  { 
    questionId: 'parents_info', 
    questionText: '父母信息', 
    required: true, 
    helpText: '请填写父母信息：\n父亲姓名：\n父亲生日：YYYY-MM-DD\n父亲是否在美国：是/否\n\n母亲姓名：\n母亲生日：YYYY-MM-DD\n母亲是否在美国：是/否', 
    questionType: 'personal' 
  },
  { 
    questionId: 'spouse_info', 
    questionText: '配偶信息（如已婚请填写）', 
    required: false, 
    helpText: '请填写配偶信息：\n姓名：\n生日：YYYY-MM-DD\n出生地（省市）：\n国籍：', 
    questionType: 'personal' 
  },
  
  // 工作与教育（2题）
  { 
    questionId: 'work_info', 
    questionText: '工作信息', 
    required: true, 
    helpText: '请填写工作信息（如为家庭主妇请注明）：\n单位名称：\n单位地址：\n邮编：\n电话：\n入职日期：YYYY-MM-DD\n月薪（人民币）：\n工作职责：\n\n备注：\n- 永驻已婚或配偶签证女性可选择填写"家庭主妇"\n- 离异或单身女性需填写工作单位（无工作可能影响签证）', 
    questionType: 'personal' 
  },
  { 
    questionId: 'education_info', 
    questionText: '最终学历信息', 
    required: true, 
    helpText: '请填写最高学历信息：\n学历：（如：本科、硕士等）\n学校名称：\n学校地址：\n城市：\n省份/州：\n邮编：\n入学日期：YYYY-MM-DD\n毕业日期：YYYY-MM-DD', 
    questionType: 'personal' 
  },
  
  // 其他信息（3题）
  { 
    questionId: 'languages', 
    questionText: '会说几种语言', 
    required: true, 
    helpText: '请列出您会说的所有语言\n示例：中文（母语）、英语、日语', 
    questionType: 'personal' 
  },
  { 
    questionId: 'travel_history', 
    questionText: '过去五年去过的其他国家', 
    required: true, 
    helpText: '请列出过去五年去过的国家和大致时间\n示例：\n日本（2023年）\n泰国（2024年）', 
    questionType: 'personal' 
  },
  { 
    questionId: 'social_media_content', 
    questionText: '社交媒体内容分享意愿', 
    required: true, 
    helpText: '是否愿意提供过去五年内，在其他网站或应用程序上创建或分享内容（如照片、视频、状态更新等）的信息？\n请选择：愿意/不愿意', 
    questionType: 'personal' 
  }
];

// ==================== 执行函数 ====================

async function initializeUSAVisaConfig() {
  try {
    console.log('========================================');
    console.log('  美国签证配置');
    console.log(`  配置时间：${new Date().toLocaleString()}`);
    console.log('========================================\n');
    
    console.log('正在连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功！\n');

    // 第一步：查找或创建"美国签证"套餐
    console.log('📦 第一步：确认美国签证套餐...');
    let usaPackage = await Package.findOne({ name: usaPackageName });
    
    if (!usaPackage) {
      usaPackage = await Package.create({
        name: usaPackageName,
        speed: '面试后3-5个工作日',
        price: 1680,
        currency: 'CNY',
        description: '美国B1/B2旅游商务签证办理，专业DS-160填写指导，面试培训',
        features: ['DS-160专业填写', '面试预约', '面试培训', '材料审核', '全程指导'],
        visible: true
      });
      console.log('  ✅ 创建美国签证套餐');
    } else {
      console.log('  ✅ 美国签证套餐已存在');
    }

    // 第二步：配置材料模板
    console.log('\n📋 第二步：配置材料模板...');
    await configureMaterialTemplate(usaPackage);

    // 第三步：配置问题模板
    console.log('\n❓ 第三步：配置问题模板...');
    await configureQuestionTemplates(usaPackage);

    console.log('\n========================================');
    console.log('  ✅ 配置完成！');
    console.log('========================================');
    console.log('\n已配置内容：');
    console.log('  • 1个签证套餐：美国签证');
    console.log('  • 1个客户类型：美国签证');
    console.log(`  • ${usaVisaMaterials.tourist.materials.length}个材料`);
    console.log(`  • ${usaQuestions.length}个问题（已优化分组）\n`);
    console.log('📝 提示：');
    console.log('  - 材料和问题已按类别分组优化');
    console.log('  - 可在管理后台进一步调整\n');

  } catch (error) {
    console.error('\n❌ 配置过程中出错:', error);
    console.error('错误详情:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭\n');
  }
}

// 配置材料模板的辅助函数
async function configureMaterialTemplate(packageObj) {
  try {
    let materialTemplate = await MaterialTemplate.findOne({
      packageId: packageObj._id
    });

    const customerTypesConfig = Object.keys(usaVisaMaterials).map((key, index) => {
      const config = usaVisaMaterials[key];
      return {
        typeId: key,
        typeName: config.typeName,
        description: config.description || '',
        order: index,
        materials: config.materials.map((mat, idx) => ({
          materialId: mat.materialId,
          name: mat.name,
          required: mat.required,
          needsImage: mat.needsImage,
          allowMultiple: mat.allowMultiple || false,
          materialType: mat.materialType,
          description: mat.description,
          order: idx
        }))
      };
    });

    if (materialTemplate) {
      materialTemplate.customerTypes = customerTypesConfig;
      await materialTemplate.save();
      console.log(`  ✅ 更新材料模板（${usaVisaMaterials.tourist.materials.length}个材料）`);
    } else {
      materialTemplate = await MaterialTemplate.create({
        packageId: packageObj._id,
        packageName: packageObj.name,
        customerTypes: customerTypesConfig
      });
      console.log(`  ✅ 创建材料模板（${usaVisaMaterials.tourist.materials.length}个材料）`);
    }
  } catch (error) {
    console.error('  ❌ 配置材料模板失败:', error.message);
    throw error;
  }
}

// 配置问题模板的辅助函数
async function configureQuestionTemplates(packageObj) {
  try {
    const customerTypeId = 'tourist';
    const customerTypeName = '美国签证';
    
    let questionTemplate = await QuestionTemplate.findOne({
      packageId: packageObj._id,
      customerTypeId
    });

    const questionsData = usaQuestions.map((q, idx) => ({
      questionId: q.questionId,
      questionText: q.questionText,
      required: q.required,
      helpText: q.helpText || '',
      questionType: q.questionType || 'personal',
      order: idx
    }));

    if (questionTemplate) {
      questionTemplate.questions = questionsData;
      await questionTemplate.save();
      console.log(`  ✅ 更新问题模板（${usaQuestions.length}个问题）`);
    } else {
      questionTemplate = await QuestionTemplate.create({
        packageId: packageObj._id,
        packageName: packageObj.name,
        customerTypeId,
        customerTypeName,
        questions: questionsData
      });
      console.log(`  ✅ 创建问题模板（${usaQuestions.length}个问题）`);
    }
  } catch (error) {
    console.error('  ❌ 配置问题模板失败:', error.message);
    throw error;
  }
}

// 运行配置
if (require.main === module) {
  initializeUSAVisaConfig();
}

module.exports = { initializeUSAVisaConfig };

