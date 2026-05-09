const mongoose = require('mongoose');
const config = require('./config');

async function cleanupDatabase() {
  try {
    console.log('🧹 开始清理数据库...');
    
    // 连接数据库
    await mongoose.connect(config.mongoUri);
    console.log('✅ 已连接到数据库');
    
    // 获取数据库实例
    const db = mongoose.connection.db;
    
    // 1. 删除旧的queryCode索引
    console.log('📝 步骤1: 删除旧的queryCode索引...');
    try {
      await db.collection('applications').dropIndex('queryCode_1');
      console.log('✅ 已删除queryCode索引');
    } catch (error) {
      if (error.code === 26) {
        console.log('ℹ️ queryCode索引不存在，跳过');
      } else {
        console.log('⚠️ 删除queryCode索引时出错:', error.message);
      }
    }
    
    // 2. 更新所有记录的queryCode字段为undefined（移除该字段）
    console.log('📝 步骤2: 清理记录中的queryCode字段...');
    const result = await db.collection('applications').updateMany(
      { queryCode: { $exists: true } },
      { $unset: { queryCode: "" } }
    );
    console.log(`✅ 已清理 ${result.modifiedCount} 条记录的queryCode字段`);
    
    // 3. 检查是否还有其他queryCode相关的索引
    console.log('📝 步骤3: 检查剩余索引...');
    const indexes = await db.collection('applications').indexes();
    console.log('当前索引列表:');
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // 4. 验证申请编码生成
    console.log('📝 步骤4: 测试申请编码生成...');
    const Application = require('./models/Application');
    
    // 模拟生成申请编码
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomLetters = '';
    for (let i = 0; i < 3; i++) {
      randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    let randomNumbers = '';
    for (let i = 0; i < 3; i++) {
      randomNumbers += Math.floor(Math.random() * 10);
    }
    
    const testCode = `KD${year}${month}${day}${randomLetters}${randomNumbers}`;
    console.log(`✅ 测试编码生成: ${testCode}`);
    
    console.log('\n🎉 数据库清理完成！');
    console.log('现在可以正常提交申请了。');
    
  } catch (error) {
    console.error('❌ 清理数据库时出错:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行清理
cleanupDatabase();
