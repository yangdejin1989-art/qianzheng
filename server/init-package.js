const mongoose = require('mongoose');
const Package = require('./models/Package');
const config = require('./config');

async function initPackage() {
  try {
    console.log('📦 初始化套餐数据...');
    
    // 连接到MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ 已连接到MongoDB');
    
    // 检查是否已存在套餐
    const existingPackage = await Package.findOne({ name: '100M宽带套餐' });
    if (existingPackage) {
      console.log('✅ 套餐已存在:', existingPackage._id);
      return existingPackage._id;
    }
    
    // 创建新套餐
    const packageData = {
      name: '100M宽带套餐',
      speed: '100Mbps',
      price: 99,
      originalPrice: 129,
      description: '高速稳定的100M宽带服务',
      features: ['高速稳定', '24小时客服', '免费安装'],
      details: '适合家庭使用的标准宽带套餐',
      order: 1,
      visible: true
    };
    
    const newPackage = new Package(packageData);
    await newPackage.save();
    
    console.log('✅ 套餐创建成功:', newPackage._id);
    return newPackage._id;
    
  } catch (error) {
    console.error('❌ 初始化套餐失败:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已断开MongoDB连接');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initPackage().then(() => {
    console.log('🎉 套餐初始化完成');
    process.exit(0);
  }).catch(err => {
    console.error('❌ 套餐初始化失败:', err);
    process.exit(1);
  });
}

module.exports = initPackage;
