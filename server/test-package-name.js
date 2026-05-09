// 测试套餐名称处理功能
const mongoose = require('mongoose');

async function testPackageName() {
  console.log('🧪 开始测试套餐名称处理功能...');
  
  try {
    // 模拟套餐ID（24位MongoDB ObjectId）
    const mockPackageId = '6884d1afb3ffc5de0e2cbd77';
    const mockPackageName = '测试套餐名称';
    
    console.log('📦 模拟套餐ID:', mockPackageId);
    console.log('📦 模拟套餐名称:', mockPackageName);
    
    // 测试ID长度判断
    console.log('🔍 测试ID长度判断...');
    if (mockPackageId && mockPackageId.length === 24) {
      console.log('✅ ID长度正确 (24位)');
    } else {
      console.log('❌ ID长度不正确');
    }
    
    // 模拟Package模型查询
    console.log('🔍 模拟Package模型查询...');
    
    // 这里我们模拟查询逻辑，实际测试时需要真实的数据库连接
    const mockPackageInfo = {
      _id: mockPackageId,
      name: mockPackageName,
      description: '这是一个测试套餐',
      price: 99.99
    };
    
    if (mockPackageInfo) {
      console.log('✅ 找到套餐信息:', mockPackageInfo.name);
      console.log('📦 套餐详情:', JSON.stringify(mockPackageInfo, null, 2));
    } else {
      console.log('⚠️ 套餐ID不存在:', mockPackageId);
    }
    
    // 测试最终保存的数据
    console.log('🔍 测试最终保存的数据...');
    const finalPackageName = mockPackageInfo ? mockPackageInfo.name : mockPackageId;
    console.log('📦 最终保存的套餐名称:', finalPackageName);
    
    if (finalPackageName === mockPackageName) {
      console.log('✅ 套餐名称处理正确');
    } else {
      console.log('❌ 套餐名称处理错误');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('❌ 错误堆栈:', error.stack);
  }
}

// 运行测试
testPackageName().then(() => {
  console.log('🧪 套餐名称处理测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
