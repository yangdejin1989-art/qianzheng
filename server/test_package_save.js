const mongoose = require('mongoose');
const config = require('./config');
const Package = require('./models/Package');

// 连接数据库
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('MongoDB 连接成功');
  
  try {
    // 创建测试套餐
    const testPackage = new Package({
      name: '测试台湾签证',
      speed: '2-5个工作日',
      visaTypes: [
        {
          type: '单次',
          currency: 'JPY',
          price: 12000,
          originalPrice: 15000
        },
        {
          type: '一年多次',
          currency: 'CNY',
          price: 15000,
          originalPrice: 18000
        }
      ],
      description: '台湾入台证办理，电子版入台证，简化材料，快速审批',
      features: ['电子版入台证', '代办大通证咨询', '3个工作日加急', '材料简化指导', '全程在线办理'],
      details: '<p>详细说明</p>',
      order: 1,
      visible: true
    });
    
    console.log('准备保存的数据:');
    console.log(JSON.stringify(testPackage, null, 2));
    
    await testPackage.save();
    console.log('✅ 套餐保存成功！ID:', testPackage._id);
    
    // 读取并验证
    const saved = await Package.findById(testPackage._id);
    console.log('\n已保存的数据:');
    console.log('visaTypes:', JSON.stringify(saved.visaTypes, null, 2));
    
    // 清理测试数据
    await Package.findByIdAndDelete(testPackage._id);
    console.log('\n✅ 测试完成，测试数据已清理');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('完整错误:', error);
  } finally {
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  }
}).catch(err => {
  console.error('❌ MongoDB 连接失败:', err);
  process.exit(1);
});

