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

// 主配置函数
async function configureKoreaVisa() {
  try {
    console.log('='.repeat(60));
    console.log('开始配置韩国签证材料和问答');
    console.log('='.repeat(60));

    // 查找韩国签证套餐（通过名称查找）
    const pkg = await Package.findOne({ name: '韩国签证' });
    
    if (!pkg) {
      console.error('❌ 错误：未找到韩国签证套餐，请先在系统中创建套餐！');
      console.log('提示：套餐名称应该是"韩国签证"');
      mongoose.connection.close();
      return;
    }

    console.log('✅ 找到韩国签证套餐');
    console.log(`   套餐ID: ${pkg._id}`);
    console.log(`   套餐名称: ${pkg.name}`);
    console.log('-'.repeat(60));

    // 配置材料模板
    console.log('\n📋 配置材料模板...');
    let materialTemplate = await MaterialTemplate.findOne({ packageId: pkg._id });
    
    if (!materialTemplate) {
      materialTemplate = new MaterialTemplate({
        packageId: pkg._id,
        packageName: pkg.name,
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
      console.log('   ✨ 创建新的材料模板');
    } else {
      materialTemplate.packageName = pkg.name;
      materialTemplate.customerTypes = [
        {
          typeId: 'individual',
          typeName: '个人申请',
          description: '适用于在日本居住满2年的中长期签证持有者',
          order: 1,
          materials: koreaVisaMaterials
        }
      ];
      console.log('   🔄 更新现有材料模板');
    }
    
    await materialTemplate.save();
    console.log(`   ✅ 材料模板配置成功！共 ${koreaVisaMaterials.length} 个材料项`);
    
    // 列出材料清单
    console.log('\n   材料清单：');
    koreaVisaMaterials.forEach((m, index) => {
      const requiredText = m.required ? '✅ 必须' : '⚠️  选填';
      console.log(`   ${index + 1}. ${m.name} - ${requiredText}`);
    });

    console.log('\n' + '-'.repeat(60));

    // 配置问题模板
    console.log('\n❓ 配置问题模板...');
    let questionTemplate = await QuestionTemplate.findOne({ 
      packageId: pkg._id, 
      customerTypeId: 'individual' 
    });
    
    if (!questionTemplate) {
      questionTemplate = new QuestionTemplate({
        packageId: pkg._id,
        packageName: pkg.name,
        customerTypeId: 'individual',
        customerTypeName: '个人申请',
        questions: koreaQuestions
      });
      console.log('   ✨ 创建新的问题模板');
    } else {
      questionTemplate.packageName = pkg.name;
      questionTemplate.customerTypeName = '个人申请';
      questionTemplate.questions = koreaQuestions;
      console.log('   🔄 更新现有问题模板');
    }
    
    await questionTemplate.save();
    console.log(`   ✅ 问题模板配置成功！共 ${koreaQuestions.length} 个问题`);
    
    // 列出问题清单
    console.log('\n   问题清单：');
    koreaQuestions.forEach((q, index) => {
      console.log(`   ${index + 1}. ${q.questionText}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ 韩国签证材料和问答配置完成！');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ 配置失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 运行配置
configureKoreaVisa();

