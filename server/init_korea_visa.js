const mongoose = require('mongoose');
const Package = require('./models/Package');
const MaterialTemplate = require('./models/MaterialTemplate');
const QuestionTemplate = require('./models/QuestionTemplate');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/visa-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 韩国签证材料配置
const koreaVisaMaterials = [
  {
    materialId: 'passport',
    name: '护照原件',
    description: '有效期6个月以上的护照所有页面拍照',
    required: true,
    needsImage: true,
    allowMultiple: true,
    materialType: 'personal',
    order: 1
  },
  {
    materialId: 'photo_4.5x3.5',
    name: '证件照片',
    description: '4.5cm×3.5cm，白色背景，3个月内拍摄',
    required: true,
    needsImage: true,
    allowMultiple: false,
    materialType: 'personal',
    order: 2
  },
  {
    materialId: 'residence_card',
    name: '在留卡',
    description: '在留卡正反面清晰照片，有效期3个月以上',
    required: true,
    needsImage: true,
    allowMultiple: true,
    materialType: 'personal',
    order: 3
  },
  {
    materialId: 'residence_certificate',
    name: '住民票',
    description: '全家族成员，全部事项不能省略（除个人番号外）',
    required: true,
    needsImage: true,
    allowMultiple: false,
    materialType: 'personal',
    order: 4
  },
  {
    materialId: 'bank_statement',
    name: '银行通帐',
    description: '最近6个月的银行通帐复印件（非永住者必须）',
    required: false,
    needsImage: true,
    allowMultiple: true,
    materialType: 'personal',
    order: 5
  },
  {
    materialId: 'employment_certificate',
    name: '在职证明书',
    description: '技术·人文知识·国际业务资格在留期间1年持有者需提交',
    required: false,
    needsImage: true,
    allowMultiple: false,
    materialType: 'personal',
    order: 6
  },
  {
    materialId: 'student_certificate',
    name: '在学证明或学生证',
    description: '4年制大学留学生提供在学证明书或学生证正反面复印件',
    required: false,
    needsImage: true,
    allowMultiple: true,
    materialType: 'personal',
    order: 7
  },
  {
    materialId: 'family_relation',
    name: '家族关系证明',
    description: '留学生无本人名义财政证明时，提供本国父母财政资料需附此证明',
    required: false,
    needsImage: true,
    allowMultiple: true,
    materialType: 'personal',
    order: 8
  }
];

// 韩国签证问题配置
const koreaQuestions = [
  {
    questionId: 'china_address',
    questionText: '中国的地址',
    questionType: 'personal',
    required: true,
    helpText: '请填写您在中国的详细地址',
    order: 1
  },
  {
    questionId: 'japan_phone',
    questionText: '日本的手机电话号码',
    questionType: 'personal',
    required: true,
    helpText: '请填写您在日本的联系电话',
    order: 2
  },
  {
    questionId: 'spouse_info',
    questionText: '配偶者信息',
    questionType: 'personal',
    required: true,
    helpText: '如有配偶，请填写：姓名、生日、电话号码；如无配偶请填写"无"',
    order: 3
  },
  {
    questionId: 'education_info',
    questionText: '最终学历信息',
    questionType: 'personal',
    required: true,
    helpText: '请填写：学校名称、学校地址',
    order: 4
  },
  {
    questionId: 'employment_info',
    questionText: '现在工作情况',
    questionType: 'personal',
    required: true,
    helpText: '请填写：是否有工作、公司名称、公司地址、公司电话；如无工作请填写"无"',
    order: 5
  },
  {
    questionId: 'korea_travel_history',
    questionText: '过去5年内韩国旅行记录',
    questionType: 'personal',
    required: true,
    helpText: '请填写：是否去过韩国、目的、出发日期、回程日期；如没有去过请填写"无"',
    order: 6
  },
  {
    questionId: 'other_travel_history',
    questionText: '过去5年内其他国家旅行记录',
    questionType: 'personal',
    required: true,
    helpText: '请填写：去过的国家名（除中国、韩国外）、目的、出发日期、回程日期；如没有去过请填写"无"',
    order: 7
  },
  {
    questionId: 'departure_date',
    questionText: '预计出发时间',
    questionType: 'personal',
    required: true,
    helpText: '请填写预计出发日期，格式：YYYY-MM-DD',
    order: 8
  }
];

// 配置材料模板
async function configureMaterialTemplate(packageId, packageName) {
  try {
    // 查找或创建韩国签证的材料模板
    let template = await MaterialTemplate.findOne({ packageId: packageId });
    
    if (!template) {
      template = new MaterialTemplate({
        packageId: packageId,
        packageName: packageName,
        customerTypes: [
          {
            typeId: 'individual',
            typeName: '个人申请',
            description: '适用于在日本居住满2年的中长期签证持有者',
            order: 1,
            materials: koreaVisaMaterials
          }
        ]
      });
      console.log('创建新的韩国签证材料模板');
    } else {
      template.packageName = packageName;
      template.customerTypes = [
        {
          typeId: 'individual',
          typeName: '个人申请',
          description: '适用于在日本居住满2年的中长期签证持有者',
          order: 1,
          materials: koreaVisaMaterials
        }
      ];
      console.log('更新现有韩国签证材料模板');
    }
    
    await template.save();
    console.log('韩国签证材料模板配置成功！');
    console.log(`共配置 ${koreaVisaMaterials.length} 个材料项`);
  } catch (error) {
    console.error('配置材料模板失败:', error);
  }
}

// 配置问题模板
async function configureQuestionTemplates(packageId, packageName) {
  try {
    // 查找或创建韩国签证的问题模板
    let template = await QuestionTemplate.findOne({ packageId: packageId, customerTypeId: 'individual' });
    
    if (!template) {
      template = new QuestionTemplate({
        packageId: packageId,
        packageName: packageName,
        customerTypeId: 'individual',
        customerTypeName: '个人申请',
        questions: koreaQuestions
      });
      console.log('创建新的韩国签证问题模板');
    } else {
      template.packageName = packageName;
      template.customerTypeName = '个人申请';
      template.questions = koreaQuestions;
      console.log('更新现有韩国签证问题模板');
    }
    
    await template.save();
    console.log('韩国签证问题模板配置成功！');
    console.log(`共配置 ${koreaQuestions.length} 个问题`);
  } catch (error) {
    console.error('配置问题模板失败:', error);
  }
}

// 创建或更新韩国签证套餐
async function createOrUpdatePackage() {
  try {
    const packageData = {
      name: '韩国签证【日本出发】',
      visaType: '韩国签证',
      description: '<h2>🇰🇷 韩国观光签证服务（日本出发）</h2><h3>📍 适用范围</h3><p><strong>东京管辖区：</strong>东京、千叶、埼玉、茨城、栃木、群马在住</p><h3>✅ 申请条件</h3><ul><li>在日本居住满2年</li><li>持有中长期签证</li><li>在留卡有效期3个月以上</li><li>护照有效期6个月以上</li></ul><h3>📅 申请时间</h3><p><strong>每周二、周四</strong>接受申请</p><h3>⏱️ 办理时长</h3><p>顺利情况下：<strong>工作日5-6天</strong></p><h3>🎫 签证类型说明</h3><ul><li><strong>单次签证：</strong>首次申请者</li><li><strong>多次签证：</strong>必须之前有过单次签证记录</li><li><strong>1年多次：</strong>一般疫情之后有去过韩国的履历</li><li><strong>3年多次：</strong>疫情之后去过韩国的可申请</li><li><strong>5年多次：</strong>暂时疫情之后还未开放</li></ul><h3>⚠️ 重要提示</h3><ul><li>多次签证由使馆根据个人情况判断</li><li>非永住者需提供银行通帐等追加资料</li><li>技术·人文知识·国际业务资格且在留期间1年者需提供在职证明</li><li>4年制大学留学生需提供在学证明或学生证</li></ul>',
      price: 500,
      processingTime: '5-6',
      currency: 'CNY',
      features: [
        '专业材料审核',
        '在线申请系统',
        '材料清单指导',
        '申请状态追踪',
        '专业客服支持'
      ],
      active: true
    };

    let pkg = await Package.findOne({ visaType: '韩国签证' });
    
    if (!pkg) {
      pkg = new Package(packageData);
      console.log('创建新的韩国签证套餐');
    } else {
      Object.assign(pkg, packageData);
      console.log('更新现有韩国签证套餐');
    }
    
    await pkg.save();
    console.log('韩国签证套餐配置成功！');
    console.log('套餐名称:', pkg.name);
    console.log('价格:', pkg.price, pkg.currency);
    console.log('套餐ID:', pkg._id);
    return pkg;
  } catch (error) {
    console.error('配置套餐失败:', error);
    return null;
  }
}

// 执行所有配置
async function runConfiguration() {
  console.log('='.repeat(50));
  console.log('开始配置韩国签证（日本出发）');
  console.log('='.repeat(50));
  
  // 先创建或更新套餐
  const pkg = await createOrUpdatePackage();
  console.log('-'.repeat(50));
  
  // 使用套餐的ID配置材料和问题模板
  if (pkg && pkg._id) {
    await configureMaterialTemplate(pkg._id, pkg.name);
    console.log('-'.repeat(50));
    
    await configureQuestionTemplates(pkg._id, pkg.name);
    console.log('-'.repeat(50));
  } else {
    console.error('无法获取套餐ID，跳过材料和问题模板配置');
  }
  
  console.log('='.repeat(50));
  console.log('韩国签证配置完成！');
  console.log('='.repeat(50));
  
  mongoose.connection.close();
}

// 运行配置
runConfiguration().catch(err => {
  console.error('配置过程出错:', err);
  mongoose.connection.close();
});

