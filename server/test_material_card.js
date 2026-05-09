const mongoose = require('mongoose');
const Application = require('./models/Application');
const config = require('./config');

// 连接数据库
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB 连接成功'))
.catch(err => {
  console.error('❌ MongoDB 连接失败:', err);
  process.exit(1);
});

// 生成申请编号
function generateApplyCode() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `QZ${year}${month}${day}${random}`;
}

async function createTestApplication() {
  try {
    console.log('📝 创建测试申请...');

    const testApplication = new Application({
      // 基本信息
      name: '张三',
      phone: '08012345678',
      phoneCountryCode: '+81',
      address: '東京都新宿区西新宿1-1-1',
      email: 'zhangsan@example.com',
      wechat: 'zhangsan123',
      line: 'zhangsan_line',
      
      // 签证信息
      package: '台湾签证',
      networkType: '普通办理',
      installDate: '2025-11-15',
      
      // 同行人
      companions: ['李四', '王五'],
      
      // 客户类型
      customerType: {
        typeId: 'humanities',
        typeName: '人文签证'
      },
      
      // 材料清单
      materials: [
        {
          materialId: 'passport',
          materialName: '护照',
          templateRequired: true,
          status: '已提交',
          images: ['/uploads/1730000000000-passport.png'],
          note: '护照有效期至2028年',
          submittedBy: 'user',
          submittedAt: new Date('2025-10-25')
        },
        {
          materialId: 'residence_card',
          materialName: '在留卡',
          templateRequired: true,
          status: '已提交',
          images: ['/uploads/1730000000001-card-front.png', '/uploads/1730000000002-card-back.png'],
          note: '在留卡正反面',
          submittedBy: 'user',
          submittedAt: new Date('2025-10-25')
        },
        {
          materialId: 'photo',
          materialName: '照片',
          templateRequired: true,
          status: '已审核',
          images: ['/uploads/1730000000003-photo.png'],
          submittedBy: 'user',
          submittedAt: new Date('2025-10-25'),
          reviewedAt: new Date('2025-10-26'),
          reviewNote: '照片符合要求'
        },
        {
          materialId: 'resident_certificate',
          materialName: '住民票',
          templateRequired: true,
          status: '需补充',
          images: [],
          note: '需要3个月内开具的住民票',
          reviewNote: '请提供最新的住民票',
          submittedBy: 'admin'
        },
        {
          materialId: 'employment_certificate',
          materialName: '在职证明',
          templateRequired: true,
          status: '未提交',
          images: [],
          submittedBy: 'admin'
        }
      ],
      
      // 问题答案
      questionsAnswers: [
        {
          questionId: 'japan_phone',
          questionText: '本人日本手机号',
          answer: '09012345678',
          groupId: 'personal_info',
          groupName: '个人基本信息'
        },
        {
          questionId: 'birthplace',
          questionText: '本人及配偶的出生地（精确到区）',
          answer: '北京市朝阳区\n配偶：上海市浦东新区',
          groupId: 'personal_info',
          groupName: '个人基本信息'
        },
        {
          questionId: 'parents_birthday',
          questionText: '父母生日（已去世的标注去世）',
          answer: '父亲：1960-01-15\n母亲：1962-05-20 （已去世）',
          groupId: 'personal_info',
          groupName: '个人基本信息'
        },
        {
          questionId: 'japan_address_zip',
          questionText: '本人日本的地址邮编',
          answer: '160-0023',
          groupId: 'personal_info',
          groupName: '个人基本信息'
        },
        {
          questionId: 'education',
          questionText: '高中及以上最终学历',
          answer: '学校名字：北京大学\n学校地址：北京市海淀区颐和园路5号\n专业：计算机科学与技术\n入学日期：2015-09-01\n毕业日期：2019-06-30',
          groupId: 'education_info',
          groupName: '学历信息'
        },
        {
          questionId: 'company_info',
          questionText: '工作单位信息',
          answer: '单位名字：ABC株式会社\n单位地址：東京都新宿区西新宿1-1-1\n单位电话：03-1234-5678\n主管名字：田中太郎\n您的职位：系统工程师\n入社年月日：2020-04-01',
          groupId: 'work_info',
          groupName: '工作信息'
        },
        {
          questionId: 'inviter_china_phone',
          questionText: '邀请人中国手机号',
          answer: '13800138000',
          groupId: 'inviter_info',
          groupName: '邀请人信息'
        },
        {
          questionId: 'children_info',
          questionText: '子女信息',
          answer: '子女1：张小明，2018-03-15，東京都新宿区西新宿1-1-1\n子女2：张小红，2020-08-20，東京都新宿区西新宿1-1-1',
          groupId: 'family_info',
          groupName: '家庭信息'
        }
      ],
      
      // 状态
      status: '处理中',
      feedback: '材料审核中，请补充住民票',
      
      // 申请编号
      applyCode: generateApplyCode(),
      
      // 时间
      createdAt: new Date('2025-10-25'),
      updatedAt: new Date()
    });

    await testApplication.save();

    console.log('✅ 测试申请创建成功！');
    console.log('\n📋 申请信息：');
    console.log(`   申请编号: ${testApplication.applyCode}`);
    console.log(`   申请人: ${testApplication.name}`);
    console.log(`   签证类型: ${testApplication.package}`);
    console.log(`   客户类型: ${testApplication.customerType.typeName}`);
    console.log(`   材料数量: ${testApplication.materials.length} 个`);
    console.log(`   同行人: ${testApplication.companions.join(', ')}`);
    console.log('\n📊 材料状态统计：');
    testApplication.materials.forEach(m => {
      console.log(`   - ${m.materialName}: ${m.status} (图片: ${m.images.length}张)`);
    });
    console.log('\n🎉 现在可以在管理后台查看这个申请的详情了！');
    console.log(`   申请编号: ${testApplication.applyCode}`);

  } catch (error) {
    console.error('❌ 创建测试申请失败:', error);
  } finally {
    mongoose.disconnect();
  }
}

createTestApplication();

