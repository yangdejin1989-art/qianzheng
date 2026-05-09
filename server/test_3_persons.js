const mongoose = require('mongoose');
const Application = require('./models/Application');
const Package = require('./models/Package');
const MaterialTemplate = require('./models/MaterialTemplate');
const QuestionTemplate = require('./models/QuestionTemplate');
const CodeSeq = require('./models/CodeSeq');
const config = require('./config');

// 连接数据库
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ 数据库连接成功'))
.catch(err => {
  console.error('❌ 数据库连接失败:', err);
  process.exit(1);
});

async function create3PersonsTest() {
  try {
    console.log('\n=====================================');
    console.log('📝 创建3人测试申请（1主申请人 + 2同行人）');
    console.log('=====================================\n');

    // 1. 获取签证套餐
    const visaPackage = await Package.findOne({ name: '台湾签证' });
    if (!visaPackage) {
      throw new Error('未找到"台湾签证"套餐，请先运行初始化脚本');
    }
    console.log(`✅ 找到签证套餐: ${visaPackage.name}`);

    // 2. 获取材料模板
    const template = await MaterialTemplate.findOne({ packageId: visaPackage._id });
    if (!template) {
      throw new Error('未找到材料模板');
    }
    console.log(`✅ 找到材料模板: ${template.packageName}`);

    // 3. 选择客户类型（个人旅游）
    const customerType = template.customerTypes.find(ct => ct.typeName === '个人旅游');
    if (!customerType) {
      throw new Error('未找到"个人旅游"客户类型');
    }
    console.log(`✅ 客户类型: ${customerType.typeName}`);

    // 4. 准备材料清单
    const materials = customerType.materials.map(mat => ({
      materialId: mat.materialId,
      materialName: mat.name,
      templateRequired: mat.required,
      status: '未提交',
      images: [],
      note: '',
      submittedBy: '',
      submittedAt: null
    }));
    console.log(`✅ 材料清单: ${materials.length} 个材料`);

    // 5. 获取问题模板
    const questionTemplate = await QuestionTemplate.findOne({
      packageId: visaPackage._id,
      customerTypeId: customerType.typeId
    });
    
    let questionsAnswers = [];
    if (questionTemplate && questionTemplate.questionGroups) {
      console.log(`✅ 找到问题模板: ${questionTemplate.questionGroups.length} 个问题组`);
      
      // 创建问题答案
      questionTemplate.questionGroups.forEach(group => {
        group.questions.forEach(question => {
          questionsAnswers.push({
            questionId: question.questionId,
            questionText: question.questionText,
            answer: `测试答案 - ${question.questionText}`,
            groupId: group.groupId,
            groupName: group.groupName
          });
        });
      });
    }

    // 6. 生成申请编码
    let seqDoc = await CodeSeq.findOne({});
    if (!seqDoc) {
      seqDoc = await CodeSeq.create({ seq: 1000 });
    }
    seqDoc.seq += 1;
    await seqDoc.save();
    const applyCode = `V${seqDoc.seq}`;
    console.log(`✅ 申请编码: ${applyCode}`);

    // 7. 创建申请
    const application = new Application({
      // 主申请人信息
      name: '张三',
      phone: '09012345678',
      phoneCountryCode: '+81',
      address: '東京都新宿区西新宿2-8-1',
      email: 'zhangsan@example.com',
      wechat: 'zhangsan_wechat',
      line: 'zhangsan_line',
      
      // 同行人（2人）
      companions: ['李四', '王五'],
      
      // 签证信息
      package: visaPackage.name,
      customerType: {
        typeId: customerType.typeId,
        typeName: customerType.typeName
      },
      
      // 材料和问题
      materials: materials,
      questionsAnswers: questionsAnswers,
      
      // 状态
      status: '待处理',
      applyCode: applyCode,
      
      // 时间戳
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // 处理日志
      processLog: [{
        action: '创建申请',
        description: '测试申请 - 3人（主申请人：张三，同行人：李四、王五）',
        timestamp: new Date()
      }]
    });
    
    await application.save();
    
    console.log('\n=====================================');
    console.log('✅ 测试申请创建成功！');
    console.log('=====================================');
    console.log('\n📋 申请详情：');
    console.log(`   申请编号: ${application.applyCode}`);
    console.log(`   主申请人: ${application.name}`);
    console.log(`   联系电话: ${application.phoneCountryCode} ${application.phone}`);
    console.log(`   邮箱地址: ${application.email}`);
    console.log(`   居住地址: ${application.address}`);
    console.log(`   微信号: ${application.wechat}`);
    console.log(`   LINE ID: ${application.line}`);
    console.log('\n👥 同行人员：');
    application.companions.forEach((companion, index) => {
      console.log(`   ${index + 1}. ${companion}`);
    });
    console.log('\n📦 签证信息：');
    console.log(`   签证类型: ${application.package}`);
    console.log(`   客户类型: ${application.customerType.typeName}`);
    console.log(`\n📄 材料清单（共 ${application.materials.length} 项）：`);
    application.materials.forEach((material, index) => {
      const required = material.templateRequired ? '必填' : '可选';
      console.log(`   ${index + 1}. ${material.materialName} [${required}] - ${material.status}`);
    });
    console.log(`\n❓ 问题答案（共 ${application.questionsAnswers.length} 个）：`);
    const groupedQuestions = {};
    application.questionsAnswers.forEach(qa => {
      if (!groupedQuestions[qa.groupName]) {
        groupedQuestions[qa.groupName] = [];
      }
      groupedQuestions[qa.groupName].push(qa);
    });
    Object.keys(groupedQuestions).forEach(groupName => {
      console.log(`   ${groupName}: ${groupedQuestions[groupName].length} 个问题`);
    });
    console.log('\n💡 提示：');
    console.log(`   - 您可以用申请编号 ${application.applyCode} 在前台查询申请状态`);
    console.log(`   - 可以在管理后台查看和处理这个申请`);
    console.log(`   - 当前状态: ${application.status}`);
    console.log('\n=====================================\n');
    
  } catch (error) {
    console.error('❌ 创建测试申请失败:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('📌 数据库连接已关闭');
  }
}

// 等待数据库连接成功后执行测试
mongoose.connection.once('open', async () => {
  await create3PersonsTest();
});

