// ⚠️ 重要配置文件 - 请勿删除！
// 日本在留人士赴台签证配置（2025年版）
// 配置时间：2025-11-05
// 
// 本文件包含：
// 1. 个人旅游-留学生
// 2. 个人旅游-永驻  
// 3. 个人旅游-工作签证
// 4. 个人旅游-家族签证（依亲）

const mongoose = require('mongoose');
const Package = require('./models/Package');
const MaterialTemplate = require('./models/MaterialTemplate');
const QuestionTemplate = require('./models/QuestionTemplate');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/visa-system';

// ==================== 材料配置 ====================
// 注意：相同的材料使用相同的materialId，这样切换办理类型时可以保留已上传的图片

const taiwanJapanResidentMaterials = {
  // 1. 个人旅游-留学生
  student: {
    typeName: '个人旅游-留学生',
    description: '适用对象：在国外或港澳地区就读正规学校的大陆地区人士',
    materials: [
      // 通用材料（所有类型都需要）- 优化后合并
      {
        materialId: 'passport',
        name: '护照',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '大陆护照（有效期6个月以上）：首页、签证页、最近出入境盖章页'
      },
      {
        materialId: 'residence_card',
        name: '在留卡',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '在留卡正反面（按出发日计算至少3个月以上有效）'
      },
      {
        materialId: 'id_card',
        name: '身份证',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '中国身份证正反面'
      },
      {
        materialId: 'photo_35x45',
        name: '2寸白底彩照',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '35×45mm 白底彩照，符合台湾签证规范'
      },
      {
        materialId: 'residence_certificate',
        name: '住民票',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'shared',
        description: '3个月内，户籍内全员记载'
      },
      // 留学生专属材料
      {
        materialId: 'enrollment_certificate',
        name: '在学证明',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '3个月内，由就读学校出具，需盖章'
      },
      {
        materialId: 'student_id',
        name: '学生证复印件',
        required: false,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '学生证复印件（如有）'
      },
      // 未成年人额外材料（可选）
      {
        materialId: 'minor_consent',
        name: '法定代理人/监护人同意书',
        required: false,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '未成年人且无法定代理人或监护人陪同时需要，需签署并附有效身份证明'
      },
      {
        materialId: 'relationship_proof',
        name: '亲属关系证明文件',
        required: false,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '出生证明、亲属关系公证书、或同户之常住人口登记卡（任选其一）'
      }
    ]
  },

  // 2. 个人旅游-永驻
  permanent_resident: {
    typeName: '个人旅游-永驻',
    description: '适用对象：大陆地区人民已取得国外或香港、澳门的永久居留权',
    materials: [
      // 只需通用材料 - 优化后合并
      {
        materialId: 'passport',
        name: '护照',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '大陆护照（有效期6个月以上）：首页、签证页、最近出入境盖章页'
      },
      {
        materialId: 'residence_card',
        name: '在留卡',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '在留卡正反面（永久居留权，按出发日计算至少3个月以上有效）'
      },
      {
        materialId: 'id_card',
        name: '身份证',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '中国身份证正反面'
      },
      {
        materialId: 'photo_35x45',
        name: '2寸白底彩照',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '35×45mm 白底彩照，符合台湾签证规范'
      },
      {
        materialId: 'residence_certificate',
        name: '住民票',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'shared',
        description: '3个月内，户籍内全员记载'
      }
    ]
  },

  // 3. 个人旅游-工作签证
  work_visa: {
    typeName: '个人旅游-工作签证',
    description: '适用对象：大陆地区人民旅居国外或香港、澳门已满1年以上，并持有合法工作证明',
    materials: [
      // 通用材料 - 优化后合并
      {
        materialId: 'passport',
        name: '护照',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '大陆护照（有效期6个月以上）：首页、签证页、最近出入境盖章页、一年前出入境盖章页（需证明旅居国外一年以上）'
      },
      {
        materialId: 'residence_card',
        name: '在留卡',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '在留卡正反面（按出发日计算至少3个月以上有效）'
      },
      {
        materialId: 'id_card',
        name: '身份证',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '中国身份证正反面'
      },
      {
        materialId: 'photo_35x45',
        name: '2寸白底彩照',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '35×45mm 白底彩照，符合台湾签证规范'
      },
      {
        materialId: 'residence_certificate',
        name: '住民票',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'shared',
        description: '3个月内，户籍内全员记载'
      },
      // 工作签证专属材料
      {
        materialId: 'residence_permit',
        name: '居留证明文件',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '合法居留证明文件'
      },
      {
        materialId: 'work_certificate',
        name: '工作证明文件',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '3个月以内的工作证明文件'
      }
    ]
  },

  // 4. 个人旅游-投资签证
  investment_visa: {
    typeName: '个人旅游-投资签证',
    description: '适用对象：大陆地区人民旅居国外或香港、澳门已满1年以上，持有合法工作证明，并进行投资活动',
    materials: [
      // 通用材料 - 优化后合并
      {
        materialId: 'passport',
        name: '护照',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '大陆护照（有效期6个月以上）：首页、签证页、最近出入境盖章页、一年前出入境盖章页（需证明旅居国外一年以上）'
      },
      {
        materialId: 'residence_card',
        name: '在留卡',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '在留卡正反面（按出发日计算至少3个月以上有效）'
      },
      {
        materialId: 'id_card',
        name: '身份证',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '中国身份证正反面'
      },
      {
        materialId: 'photo_35x45',
        name: '2寸白底彩照',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '35×45mm 白底彩照，符合台湾签证规范'
      },
      {
        materialId: 'residence_certificate',
        name: '住民票',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'shared',
        description: '3个月内，户籍内全员记载'
      },
      // 投资签证专属材料
      {
        materialId: 'residence_permit',
        name: '居留证明文件',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '合法居留证明文件'
      },
      {
        materialId: 'work_certificate',
        name: '工作证明文件',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '3个月以内的工作证明文件'
      },
      {
        materialId: 'company_document',
        name: '公司藤本',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '公司藤本（登记簿本）材料提交'
      }
    ]
  },

  // 5. 个人旅游-家族签证（依亲）
  family_visa: {
    typeName: '个人旅游-家族签证',
    description: '适用对象：大陆地区人民旅居国外或香港、澳门，已取得依亲居留权，并拥有等值新台币10万元以上存款',
    materials: [
      // 通用材料 - 优化后合并
      {
        materialId: 'passport',
        name: '护照',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '大陆护照（有效期6个月以上）：首页、签证页、最近出入境盖章页'
      },
      {
        materialId: 'residence_card',
        name: '在留卡',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '在留卡正反面（依亲居留，按出发日计算至少3个月以上有效）'
      },
      {
        materialId: 'id_card',
        name: '身份证',
        required: true,
        needsImage: true,
        allowMultiple: true,
        materialType: 'personal',
        description: '中国身份证正反面'
      },
      {
        materialId: 'photo_35x45',
        name: '2寸白底彩照',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '35×45mm 白底彩照，符合台湾签证规范'
      },
      {
        materialId: 'residence_certificate',
        name: '住民票',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'shared',
        description: '3个月内，户籍内全员记载'
      },
      // 家族签证专属材料
      {
        materialId: 'financial_proof',
        name: '财力证明',
        required: true,
        needsImage: true,
        allowMultiple: false,
        materialType: 'personal',
        description: '等值新台币10万元以上（约合50万日元），存款1个月以上，开立日1个月以内的正式存款证明'
      }
    ]
  }
};

// ==================== 问题模板配置 ====================
// 所有类型使用相同的问题模板 - v2.0 优化合并版

const commonQuestions = [
  // 基本信息（5题）
  { 
    questionId: 'basic_phone', 
    questionText: '手机号码', 
    required: true, 
    helpText: '请填写您的手机号码', 
    questionType: 'personal' 
  },
  { 
    questionId: 'basic_occupation', 
    questionText: '职业及单位/学校信息', 
    required: true, 
    helpText: '请填写：职业、单位名字、职称（学生填写学校名字）\n示例：企业职员 / 某某株式会社 / 营业部长', 
    questionType: 'personal' 
  },
  { 
    questionId: 'spouse_taiwan', 
    questionText: '配偶是否为台湾人', 
    required: true, 
    helpText: '请选择：是/否', 
    questionType: 'personal' 
  },
  { 
    questionId: 'other_nationality', 
    questionText: '有无其他国籍', 
    required: true, 
    helpText: '请选择：有/无', 
    questionType: 'personal' 
  },
  { 
    questionId: 'parents_alive', 
    questionText: '父母是否在世', 
    required: true, 
    helpText: '请选择：父母都在世/仅父亲在世/仅母亲在世/父母都不在世', 
    questionType: 'personal' 
  },
  
  // 父母信息（2题合并）
  { 
    questionId: 'father_info', 
    questionText: '父亲信息', 
    required: true, 
    helpText: '请按以下格式填写（每行一项）：\n姓名：\n生日：YYYY-MM-DD\n电话：\n住址：\n退休前单位：（未工作填"无"）', 
    questionType: 'personal' 
  },
  { 
    questionId: 'mother_info', 
    questionText: '母亲信息', 
    required: true, 
    helpText: '请按以下格式填写（每行一项）：\n姓名：\n生日：YYYY-MM-DD\n电话：\n住址：\n退休前单位：（未工作填"无"）', 
    questionType: 'personal' 
  },
  
  // 配偶信息（1题合并，可选）
  { 
    questionId: 'spouse_info', 
    questionText: '配偶信息（如已婚请填写）', 
    required: false, 
    helpText: '请按以下格式填写（每行一项）：\n姓名：\n生日：YYYY-MM-DD\n电话：\n住址：\n单位：', 
    questionType: 'personal' 
  },
  
  // 孩子信息（1题合并，可选）
  { 
    questionId: 'children_info', 
    questionText: '孩子信息（如有孩子请填写，多个孩子请分别填写）', 
    required: false, 
    helpText: '请按以下格式填写（每行一项，多个孩子用空行分隔）：\n姓名：\n生日：YYYY-MM-DD\n电话：\n住址：\n学校/单位：', 
    questionType: 'personal' 
  },
  
  // 其他说明（1题）
  { 
    questionId: 'unemployment_reason', 
    questionText: '家庭成员就业情况说明', 
    required: false, 
    helpText: '如家庭成员（配偶、孩子）有未就业的，请详细说明原因。以前上过班的必须填写以前的单位名称。', 
    questionType: 'personal' 
  }
];

// ==================== 执行函数 ====================

async function initializeTaiwanJapanResidentConfig() {
  try {
    console.log('========================================');
    console.log('  日本在留人士赴台签证配置');
    console.log('  配置时间：2025-11-05');
    console.log('========================================\n');
    
    console.log('正在连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功！\n');

    // 第一步：查找或创建"台湾签证"套餐
    console.log('📦 第一步：确认台湾签证套餐...');
    let taiwanPackage = await Package.findOne({ name: '台湾签证' });
    
    if (!taiwanPackage) {
      taiwanPackage = await Package.create({
        name: '台湾签证',
        speed: '5-7个工作日',
        price: 300,
        currency: 'CNY',
        description: '台湾入台证办理（日本在留人士专用），电子版入台证，简化材料，快速审批',
        features: ['电子版入台证', '多种办理类型', '材料简化指导', '快速审批', '全程在线办理'],
        visible: true
      });
      console.log('  ✅ 创建台湾签证套餐');
    } else {
      console.log('  ✅ 台湾签证套餐已存在');
    }

    // 第二步：配置材料模板
    console.log('\n📋 第二步：配置材料模板...');
    await configureMaterialTemplate(taiwanPackage, taiwanJapanResidentMaterials);

    // 第三步：配置问题模板
    console.log('\n❓ 第三步：配置问题模板...');
    await configureQuestionTemplates(taiwanPackage, taiwanJapanResidentMaterials, commonQuestions);

    console.log('\n========================================');
    console.log('  ✅ 配置完成！');
    console.log('========================================');
    console.log('\n已配置内容：');
    console.log('  • 1个签证套餐：台湾签证');
    console.log('  • 5个客户类型：');
    console.log('    - 个人旅游-留学生（9个材料）');
    console.log('    - 个人旅游-永驻（5个材料）');
    console.log('    - 个人旅游-工作签证（7个材料）');
    console.log('    - 个人旅游-投资签证（8个材料）');
    console.log('    - 个人旅游-家族签证（6个材料）');
    console.log(`  • ${commonQuestions.length}个通用问题（已优化合并）\n`);
    console.log('📝 重要提示：');
    console.log('  - 相同材料使用相同ID，切换类型时自动保留图片');
    console.log('  - 所有类型使用相同的问题模板');
    console.log('  - 材料类型分为personal（个人）和shared（共同）\n');
    
  } catch (error) {
    console.error('\n❌ 配置过程中出错:', error);
    console.error('错误详情:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭\n');
  }
}

// ===== 辅助函数 =====

async function configureMaterialTemplate(packageObj, materialsConfig) {
  try {
    let template = await MaterialTemplate.findOne({ packageId: packageObj._id });
    
    const customerTypes = Object.keys(materialsConfig).map((key, index) => {
      const config = materialsConfig[key];
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
          materialType: mat.materialType || 'personal',
          description: mat.description,
          order: idx
        }))
      };
    });

    if (template) {
      template.customerTypes = customerTypes;
      await template.save();
      console.log(`  ✅ 更新台湾签证材料模板（${customerTypes.length}个客户类型）`);
    } else {
      template = await MaterialTemplate.create({
        packageId: packageObj._id,
        packageName: packageObj.name,
        customerTypes
      });
      console.log(`  ✅ 创建台湾签证材料模板（${customerTypes.length}个客户类型）`);
    }
  } catch (error) {
    console.error(`  ❌ 配置材料模板失败:`, error.message);
  }
}

async function configureQuestionTemplates(packageObj, materialsConfig, questions) {
  try {
    let count = 0;
    for (const customerTypeId of Object.keys(materialsConfig)) {
      const config = materialsConfig[customerTypeId];
      
      let template = await QuestionTemplate.findOne({ 
        packageId: packageObj._id,
        customerTypeId 
      });

      const questionsData = questions.map((q, idx) => ({
        questionId: q.questionId,
        questionText: q.questionText,
        required: q.required,
        helpText: q.helpText || '',
        questionType: q.questionType || 'personal',
        order: idx
      }));

      if (template) {
        template.questions = questionsData;
        await template.save();
        count++;
      } else {
        template = await QuestionTemplate.create({
          packageId: packageObj._id,
          packageName: packageObj.name,
          customerTypeId,
          customerTypeName: config.typeName,
          questions: questionsData
        });
        count++;
      }
    }
    console.log(`  ✅ 配置问题模板（${count}个客户类型）`);
  } catch (error) {
    console.error(`  ❌ 配置问题模板失败:`, error.message);
  }
}

// 执行初始化
if (require.main === module) {
  initializeTaiwanJapanResidentConfig();
}

module.exports = { initializeTaiwanJapanResidentConfig };

