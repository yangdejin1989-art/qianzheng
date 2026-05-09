// 测试3人多人订单提交
const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000';

// 配置axios
axios.defaults.validateStatus = function () {
  return true;
};

async function createTest3PersonsOrder() {
  console.log('🧪 开始创建3人测试订单...\n');
  
  try {
    // 1. 获取套餐列表
    console.log('📦 获取套餐列表...');
    const packagesRes = await axios.get(`${API_URL}/api/packages`);
    const packages = packagesRes.data;
    
    if (packages.length === 0) {
      console.error('❌ 没有可用的套餐');
      return;
    }
    
    const selectedPackage = packages[0];
    console.log(`✅ 选择套餐: ${selectedPackage.name} (${selectedPackage._id})\n`);
    
    // 2. 获取材料模板
    console.log('📋 获取材料模板...');
    const templateRes = await axios.get(`${API_URL}/api/material-templates/package/${selectedPackage._id}`);
    const materialTemplate = templateRes.data;
    
    if (!materialTemplate || !materialTemplate.customerTypes || materialTemplate.customerTypes.length === 0) {
      console.error('❌ 该套餐没有配置材料模板');
      return;
    }
    
    const customerType = materialTemplate.customerTypes[0];
    console.log(`✅ 客户类型: ${customerType.typeName}`);
    console.log(`✅ 材料数量: ${customerType.materials.length}\n`);
    
    // 3. 获取问题模板
    console.log('❓ 获取问题模板...');
    const questionsRes = await axios.get(
      `${API_URL}/api/question-templates/package/${selectedPackage._id}/customer-type/${customerType.typeId}`
    );
    const questionTemplates = questionsRes.data.questions || [];
    console.log(`✅ 问题数量: ${questionTemplates.length}\n`);
    
    // 4. 准备表单数据
    const formData = new FormData();
    
    // 基本信息
    formData.append('name', '张三');
    formData.append('phone', '+81 09012345678');
    formData.append('address', '东京都新宿区西新宿2-8-1');
    formData.append('email', 'test3persons@example.com');
    formData.append('wechat', 'zhangsan_wx');
    formData.append('line', 'zhangsan_line');
    formData.append('package', selectedPackage._id);
    formData.append('captcha', '1234'); // 测试验证码
    
    // 同行人（2人）
    const companions = ['李四', '王五'];
    formData.append('companions', JSON.stringify(companions));
    console.log('👥 同行人:', companions.join('、'), '\n');
    
    // 客户类型
    formData.append('customerType', JSON.stringify({
      typeId: customerType.typeId,
      typeName: customerType.typeName
    }));
    
    // 问题答案（统一回答，备注清楚每个人）
    const questionsAnswers = questionTemplates.slice(0, 3).map(q => ({
      questionId: q.questionId,
      questionText: q.questionText,
      answer: `主申请人张三：${q.questionText}的答案A\n同行人李四：${q.questionText}的答案B\n同行人王五：${q.questionText}的答案C`,
      groupId: q.groupId,
      groupName: q.groupName
    }));
    
    if (questionsAnswers.length > 0) {
      formData.append('questionsAnswers', JSON.stringify(questionsAnswers));
      console.log('📝 问题答案数量:', questionsAnswers.length);
    }
    
    // 材料数据（每人一份）
    const allPersons = [
      { personId: 'main', personName: '张三' },
      { personId: 'comp1', personName: '李四' },
      { personId: 'comp2', personName: '王五' }
    ];
    
    const materials = [];
    const materialsList = customerType.materials.slice(0, 2); // 取前2个材料类型
    
    console.log('\n📎 准备材料:');
    allPersons.forEach(person => {
      materialsList.forEach(material => {
        materials.push({
          materialId: material.materialId,
          materialName: material.name,
          templateRequired: material.required,
          personId: person.personId,
          personName: person.personName,
          fileCount: 0 // 暂不上传文件
        });
        console.log(`  - ${person.personName}: ${material.name}`);
      });
    });
    
    formData.append('materials', JSON.stringify(materials));
    
    // 5. 提交申请
    console.log('\n🚀 提交申请...\n');
    const response = await axios.post(`${API_URL}/api/apply`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ 申请提交成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 订单信息:');
    console.log('  申请编码:', response.data.applyCode);
    console.log('  订单ID:', response.data.id);
    console.log('  主申请人:', '张三');
    console.log('  同行人:', companions.join('、'));
    console.log('  材料数量:', materials.length, '项');
    console.log('  问题数量:', questionsAnswers.length, '个');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 6. 验证订单
    console.log('🔍 验证订单数据...');
    const orderRes = await axios.get(`${API_URL}/api/applications/${response.data.id}`);
    const order = orderRes.data;
    
    console.log('✅ 订单验证成功:');
    console.log('  同行人数:', order.companions?.length || 0);
    console.log('  材料数量:', order.materials?.length || 0);
    console.log('  问题数量:', order.questionsAnswers?.length || 0);
    
    // 验证每个人的材料
    console.log('\n📊 材料分布:');
    allPersons.forEach(person => {
      const personMaterials = (order.materials || []).filter(m => m.personId === person.personId);
      console.log(`  ${person.personName}: ${personMaterials.length} 项材料`);
    });
    
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('详细错误:', error.response.data);
    }
  }
}

// 运行测试
createTest3PersonsOrder();

