// 测试 /api/apply 接口的邮件发送功能
const axios = require('axios');

async function testApplyAPI() {
  console.log('🧪 开始测试 /api/apply 接口的邮件发送功能...');
  
  try {
    // 模拟前端发送的数据到 /api/apply 接口
    const mockFormData = {
      name: '测试用户API',
      phone: '13800138001',
      address: '测试地址API 456号',
      email: 'testapi@example.com',
      wechat: 'test_api_wechat',
      networkType: '光纤',
      installDate: '2024-01-15',
      package: '测试套餐API',
      captcha: '1234'
    };
    
    console.log('📝 模拟前端数据:', JSON.stringify(mockFormData, null, 2));
    
    // 注意：这里我们直接调用后端的处理逻辑，而不是通过HTTP请求
    // 这样可以更好地调试问题
    
    // 导入后端模块
    const { buildStatusEmail } = require('./emailTemplates/statusTemplates');
    const { sendManualStatusEmail } = require('./utils/emailHelpers');
    
    // 模拟申请记录（与 /api/apply 接口创建的结构一致）
    const mockApplication = {
      _id: 'test_api_123',
      name: mockFormData.name,
      phone: mockFormData.phone,
      address: mockFormData.address,
      email: mockFormData.email,
      wechat: mockFormData.wechat,
      networkType: mockFormData.networkType,
      installDate: mockFormData.installDate,
      package: mockFormData.package,
      applyCode: 'TEST_API_001',
      status: '待处理',
      createdAt: new Date(),
      processLog: [{
        action: '客户提交申请',
        description: '客户提交了宽带安装申请',
        timestamp: new Date()
      }]
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
      feedback: null,
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
    
    // 测试邮件发送
    console.log('📧 测试邮件发送...');
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
    console.error('❌ 测试失败:', error);
    console.error('❌ 错误堆栈:', error.stack);
  }
}

// 运行测试
testApplyAPI().then(() => {
  console.log('🧪 /api/apply 接口测试完成');
  process.exit(0);
}).catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});