const mongoose = require('mongoose');
const Package = require('./models/Package');
const config = require('./config');

mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB 连接成功'))
.catch(err => {
  console.error('❌ MongoDB 连接失败:', err);
  process.exit(1);
});

async function listPackages() {
  try {
    const packages = await Package.find();
    console.log('\n📋 当前数据库中的签证类型：');
    if (packages.length === 0) {
      console.log('   （暂无签证类型）');
    } else {
      packages.forEach((pkg, index) => {
        console.log(`   ${index + 1}. ${pkg.name} (ID: ${pkg._id})`);
      });
    }
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

listPackages();





