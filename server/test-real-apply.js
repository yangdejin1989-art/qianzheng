// 模拟真实申请流程的测试脚本
const axios = require('axios');

async function testRealApply() {
  console.log('🧪 开始模拟真实申请流程...');
  
  // 模拟前端发送的数据
  const mockFormData = {
    name: '测试用户',
    phone: '13800138000',
    address: '测试地址123号',
    package: '测试套餐ID', // 注意：前端发送的是 package 字段
    email: 'test@example.com',
    wechat: 'test_wechat',
    notes: '这是一个测试申请',
    captcha: '1234'
  };
  
  console.log('📝 模拟前端数据:', JSON.stringify(mockFormData, null, 2));
  
  try {
    // 模拟发送到 /api/apply 接口
    console.log('📡 模拟发送申请请求...');
    
    // 注意：这里我们直接调用后端的处理逻辑，而不是通过HTTP请求
    // 这样可以更好地调试问题
    
    // 导入后端模块
    const { buildStatusEmail } = require('./emailTemplates/statusTemplates');
    const { sendManualStatusEmail } = require('./utils/emailHelpers');
    
    // 模拟申请记录
    const mockApplication = {
      _id: 'test_real_123',
      name: mockFormData.name,
      phone: mockFormData.phone,
      address: mockFormData.address,
      email: mockFormData.email,
      wechat: mockFormData.wechat,
      networkType: '',
      installDate: '',
      package: '测试套餐',
      notes: mockFormData.notes,
      applyCode: 'TEST_REAL_001',
      status: '待处理',
      createdAt: new Date(),
      feedback: null
    };
    
    console.log('🔍 模拟申请记录:', JSON.stringify(mockApplication, null, 2));
    
    // 测试邮件模板构建
    console.log('📧 测试邮件模板构建...');
    const emailContent = buildStatusEmail('待处理', {
      name: mockApplication.name,
      phone: mockApplication.phone,
      address: mockApplication.address,
      email: mockApplication.email,
      wechat: mockApplication.wechat,
      networkType: mockApplication.networkType,
      installDate: mockApplication.installDate,
      packageName: mockApplication.package,
      applyCode: mockApplication.applyCode,
      submitTime: mockApplication.createdAt.toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN'),
      feedback: mockApplication.feedback,
      linkUrl: 'http://localhost:3000'
    });
    
    if (emailContent) {
      console.log('✅ 邮件模板构建成功');
      console.log('✅ 邮件主题:', emailContent.subject);
      console.log('✅ 邮件内容长度:', emailContent.html.length);
    } else {
      console.log('❌ 邮件模板构建失败');
      return;
    }
    
    // 测试邮件发送
    console.log('📧 测试邮件发送...');
    const emailResult = await sendManualStatusEmail(mockApplication._id, mockApplication);
    console.log('📧 邮件发送结果:', emailResult);
    
    if (emailResult.success) {
      console.log('✅ 测试邮件发送成功！');
      console.log('✅ 邮件ID:', emailResult.messageId);
      console.log('✅ 发送状态:', emailResult.status);
    } else {
      console.log('❌ 测试邮件发送失败');
      console.log('❌ 错误信息:', emailResult.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('❌ 错误堆栈:', error.stack);
  }
}

// 运行测试
testRealApply().then(() => {
  console.log('🧪 真实申请流程测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
