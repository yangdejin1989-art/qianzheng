// 查看签证套餐详细信息
const mongoose = require('mongoose');
const Package = require('./models/Package');
const config = require('./config');

async function viewPackageDetails() {
  try {
    await mongoose.connect(config.mongoUri);
    
    const packages = await Package.find({}).sort({ order: 1 });
    
    console.log('\n========================================');
    console.log('  签证套餐详细信息');
    console.log('========================================\n');
    
    for (const pkg of packages) {
      console.log(`📦 ${pkg.name}`);
      console.log('━'.repeat(50));
      console.log(`价格: ¥${pkg.price} ${pkg.originalPrice ? `(原价: ¥${pkg.originalPrice})` : ''}`);
      console.log(`时效: ${pkg.speed || '未设置'}`);
      console.log(`简介: ${pkg.description || '无'}`);
      console.log(`\n特色功能:`);
      if (pkg.features && pkg.features.length > 0) {
        pkg.features.forEach((feature, index) => {
          console.log(`  ${index + 1}. ${feature}`);
        });
      } else {
        console.log('  无');
      }
      console.log(`\n是否显示: ${pkg.visible ? '是' : '否'}`);
      console.log(`排序: ${pkg.order || 0}`);
      console.log('\n');
    }
    
    console.log('========================================\n');
    
  } catch (error) {
    console.error('查看失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

viewPackageDetails();

