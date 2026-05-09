// 直接通过MongoDB创建3人测试订单
const mongoose = require('mongoose');
const config = require('./config');

async function createTestOrder() {
  try {
    console.log('🔌 连接数据库...');
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ 数据库连接成功\n');

    // 清除mongoose和Node.js缓存
    delete mongoose.models.Application;
    delete mongoose.models.Package;
    delete require.cache[require.resolve('./models/Application')];
    delete require.cache[require.resolve('./models/Package')];
    
    const Application = require('./models/Application');
    const Package = require('./models/Package');
    
    // 获取第一个套餐
    const packages = await Package.find();
    if (packages.length === 0) {
      console.error('❌ 没有可用的套餐');
      process.exit(1);
    }
    
    const selectedPackage = packages[0];
    console.log(`📦 使用套餐: ${selectedPackage.name}\n`);
    
    // 生成申请编码
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomLetters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                         String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const randomNumbers = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const applyCode = `QZ${year}${month}${day}${randomLetters}${randomNumbers}`;
    
    // 创建测试订单数据
    const testOrder = {
      name: '张三',
      phone: '+81 09012345678',
      address: '东京都新宿区西新宿2-8-1',
      email: 'test3persons@example.com',
      wechat: 'zhangsan_wx',
      line: 'zhangsan_line',
      package: selectedPackage.name,
      applyCode: applyCode,
      status: '待处理',
      companions: ['李四', '王五'],
      customerType: {
        typeId: 'tourist',
        typeName: '旅游签证'
      },
      questionsAnswers: [
        {
          questionId: 'q1',
          questionText: '出生日期',
          answer: '主申请人张三：1990-01-01\n同行人李四：1992-02-02\n同行人王五：1995-03-03'
        },
        {
          questionId: 'q2',
          questionText: '护照号码',
          answer: '主申请人张三：AB1234567\n同行人李四：CD2345678\n同行人王五：EF3456789'
        },
        {
          questionId: 'q3',
          questionText: '旅行目的',
          answer: '三人同行旅游，计划游览东京、大阪、京都等地，停留7天'
        }
      ],
      materials: [
        // 张三的材料
        {
          materialId: 'passport',
          materialName: '护照',
          templateRequired: true,
          personId: 'main',
          personName: '张三',
          status: '未提交',
          images: [],
          submittedBy: 'user'
        },
        {
          materialId: 'photo',
          materialName: '照片',
          templateRequired: true,
          personId: 'main',
          personName: '张三',
          status: '未提交',
          images: [],
          submittedBy: 'user'
        },
        // 李四的材料
        {
          materialId: 'passport',
          materialName: '护照',
          templateRequired: true,
          personId: 'comp1',
          personName: '李四',
          status: '未提交',
          images: [],
          submittedBy: 'user'
        },
        {
          materialId: 'photo',
          materialName: '照片',
          templateRequired: true,
          personId: 'comp1',
          personName: '李四',
          status: '未提交',
          images: [],
          submittedBy: 'user'
        },
        // 王五的材料
        {
          materialId: 'passport',
          materialName: '护照',
          templateRequired: true,
          personId: 'comp2',
          personName: '王五',
          status: '未提交',
          images: [],
          submittedBy: 'user'
        },
        {
          materialId: 'photo',
          materialName: '照片',
          templateRequired: true,
          personId: 'comp2',
          personName: '王五',
          status: '未提交',
          images: [],
          submittedBy: 'user'
        }
      ],
      processLog: [{
        action: '创建测试订单',
        description: '系统创建3人测试订单',
        timestamp: new Date()
      }]
    };
    
    // 调试：打印保存前的材料数据
    console.log('\n🐛 调试 - 保存前的材料数据:');
    testOrder.materials.forEach((m, i) => {
      console.log(`  材料${i+1}: ${m.materialName}, personId: ${m.personId}, personName: ${m.personName}`);
    });
    
    // 保存订单
    const application = new Application(testOrder);
    await application.save();
    
    console.log('\n🐛 调试 - 保存后的材料数据:');
    application.materials.forEach((m, i) => {
      console.log(`  材料${i+1}: ${m.materialName}, personId: ${m.personId}, personName: ${m.personName}`);
    });
    
    console.log('✅ 测试订单创建成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 订单信息:');
    console.log('  申请编码:', application.applyCode);
    console.log('  订单ID:', application._id);
    console.log('  主申请人:', application.name);
    console.log('  同行人:', application.companions.join('、'));
    console.log('  材料数量:', application.materials.length, '项');
    console.log('  问题数量:', application.questionsAnswers.length, '个');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 重新查询以验证材料分布
    const savedApp = await Application.findById(application._id);
    
    console.log('📊 材料分布:');
    const persons = [
      { personId: 'main', personName: '张三' },
      { personId: 'comp1', personName: '李四' },
      { personId: 'comp2', personName: '王五' }
    ];
    
    persons.forEach(person => {
      const personMaterials = savedApp.materials.filter(m => m.personId === person.personId);
      console.log(`  ${person.personName}: ${personMaterials.length} 项材料`);
      personMaterials.forEach(m => {
        console.log(`    - ${m.materialName} (状态: ${m.status})`);
      });
    });
    
    console.log('\n✅ 全部完成！');
    
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 数据库连接已关闭');
  }
}

createTestOrder();

