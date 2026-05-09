// 测试申请邮件发送功能
const { buildStatusEmail } = require('./emailTemplates/statusTemplates');
const { sendManualStatusEmail } = require('./utils/emailHelpers');

async function testApplyEmail() {
  console.log('🧪 开始测试申请邮件发送功能...');
  
  // 模拟申请数据
  const mockApplication = {
    _id: 'test123',
    name: '测试用户',
    phone: '13800138000',
    address: '测试地址',
    email: 'test@example.com',
    wechat: 'test_wechat',
    networkType: '光纤',
    installDate: '2024-01-01',
    package: '测试套餐',
    applyCode: 'TEST001',
    status: '待处理',
    createdAt: new Date(),
    feedback: null
  };
  
  console.log('📧 测试邮件模板构建...');
  
  // 测试邮件模板构建
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
    console.log('📧 邮件主题:', emailContent.subject);
    console.log('📧 邮件内容长度:', emailContent.html.length);
  } else {
    console.log('❌ 邮件模板构建失败');
    return;
  }
  
  console.log('📧 测试邮件发送...');
  
  try {
    // 测试邮件发送（使用真实的邮箱地址进行测试）
    const emailResult = await sendManualStatusEmail(mockApplication._id, mockApplication);
    console.log('📧 邮件发送结果:', emailResult);
    
    if (emailResult.success) {
      console.log('✅ 测试邮件发送成功！');
      console.log('📧 邮件ID:', emailResult.messageId);
      console.log('📧 发送状态:', emailResult.status);
    } else {
      console.log('❌ 测试邮件发送失败');
      console.log('❌ 错误信息:', emailResult.message);
    }
  } catch (error) {
    console.error('❌ 测试邮件发送异常:', error);
    console.error('❌ 错误堆栈:', error.stack);
  }
}

// 运行测试
testApplyEmail().then(() => {
  console.log('🧪 测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
