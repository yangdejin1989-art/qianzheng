const mongoose = require('mongoose');
const config = require('./config');
const Application = require('./models/Application');

async function updateRecords() {
  try {
    // 连接到MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('✅ 已连接到MongoDB');
    
    // 查找所有没有queryCode的记录
    const recordsWithoutQueryCode = await Application.find({ queryCode: { $exists: false } });
    console.log(`📋 找到 ${recordsWithoutQueryCode.length} 条没有queryCode的记录`);
    
    if (recordsWithoutQueryCode.length === 0) {
      console.log('✅ 所有记录都已经有queryCode字段');
      return;
    }
    
    // 生成查询编码的函数
    function generateQueryCode() {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 6);
      return `QC${timestamp}${random}`.toUpperCase();
    }
    
    // 更新每条记录
    for (const record of recordsWithoutQueryCode) {
      const queryCode = generateQueryCode();
      await Application.findByIdAndUpdate(record._id, { queryCode });
      console.log(`✅ 已更新记录 ${record._id}: ${queryCode}`);
    }
    
    console.log('🎉 所有记录更新完成！');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已断开MongoDB连接');
  }
}

updateRecords();
