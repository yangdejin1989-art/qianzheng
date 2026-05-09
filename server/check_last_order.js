// 检查最后一个订单的详细数据
const mongoose = require('mongoose');
const config = require('./config');

async function checkLastOrder() {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const Application = require('./models/Application');
    
    // 获取最后一个订单
    const lastOrder = await Application.findOne().sort({ createdAt: -1 });
    
    if (!lastOrder) {
      console.log('没有找到订单');
      return;
    }
    
    console.log('📋 订单信息:');
    console.log('  申请编码:', lastOrder.applyCode);
    console.log('  主申请人:', lastOrder.name);
    console.log('  同行人:', lastOrder.companions);
    console.log('\n📦 材料详情:');
    console.log('  材料数量:', lastOrder.materials?.length || 0);
    
    if (lastOrder.materials && lastOrder.materials.length > 0) {
      lastOrder.materials.forEach((m, index) => {
        console.log(`\n  材料 ${index + 1}:`);
        console.log('    ID:', m.materialId);
        console.log('    名称:', m.materialName);
        console.log('    personId:', m.personId);
        console.log('    personName:', m.personName);
        console.log('    状态:', m.status);
      });
    }
    
    console.log('\n❓ 问题答案:');
    if (lastOrder.questionsAnswers && lastOrder.questionsAnswers.length > 0) {
      lastOrder.questionsAnswers.forEach((q, index) => {
        console.log(`\n  问题 ${index + 1}:`);
        console.log('    问题:', q.questionText);
        console.log('    答案:', q.answer);
      });
    }
    
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkLastOrder();

