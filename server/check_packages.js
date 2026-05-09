const mongoose = require('mongoose');
const Package = require('./models/Package');

mongoose.connect('mongodb://localhost:27017/visa-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkPackages() {
  try {
    const packages = await Package.find({});
    
    console.log('='.repeat(60));
    console.log('数据库中的套餐列表：');
    console.log('='.repeat(60));
    
    if (packages.length === 0) {
      console.log('暂无套餐');
    } else {
      packages.forEach((pkg, index) => {
        console.log(`\n${index + 1}. 套餐名称: ${pkg.name}`);
        console.log(`   签证类型: ${pkg.visaType}`);
        console.log(`   套餐ID: ${pkg._id}`);
        console.log(`   价格: ${pkg.price} ${pkg.currency || 'CNY'}`);
        console.log(`   状态: ${pkg.active ? '✅ 启用' : '❌ 停用'}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkPackages();

