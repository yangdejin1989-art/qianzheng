const mongoose = require('mongoose');
const Application = require('./models/Application');
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

async function fixImagePaths() {
  try {
    console.log('🔧 开始修复图片路径...\n');

    // 查找所有有材料数据的申请
    const applications = await Application.find({ 
      materials: { $exists: true, $ne: [] } 
    });

    console.log(`📋 找到 ${applications.length} 个包含材料的申请\n`);

    let updatedCount = 0;

    for (const app of applications) {
      let needUpdate = false;

      // 检查并修复材料图片路径
      if (app.materials && app.materials.length > 0) {
        app.materials.forEach(material => {
          if (material.images && material.images.length > 0) {
            material.images = material.images.map(imgPath => {
              // 如果路径不是以 / 开头，添加 /uploads/ 前缀
              if (!imgPath.startsWith('/')) {
                needUpdate = true;
                if (imgPath.startsWith('uploads/')) {
                  return `/${imgPath}`;
                } else {
                  return `/uploads/${imgPath}`;
                }
              }
              return imgPath;
            });
          }
        });
      }

      if (needUpdate) {
        await app.save();
        updatedCount++;
        console.log(`✅ 已更新申请: ${app.applyCode}`);
        console.log(`   申请人: ${app.name}`);
        console.log(`   材料数: ${app.materials.length}`);
      }
    }

    console.log(`\n🎉 修复完成！共更新了 ${updatedCount} 个申请的图片路径`);

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

fixImagePaths();





