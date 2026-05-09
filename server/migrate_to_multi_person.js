// migrate_to_multi_person.js
// 数据迁移脚本：将旧格式的申请数据转换为新的多人分组格式

const mongoose = require('mongoose');
const Application = require('./models/Application');
const config = require('./config');

// 连接数据库
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ 数据库连接成功');
  migrateApplications();
}).catch(err => {
  console.error('❌ 数据库连接失败:', err);
  process.exit(1);
});

async function migrateApplications() {
  try {
    console.log('\n🚀 开始迁移申请数据...\n');
    
    // 查找所有申请
    const applications = await Application.find({});
    console.log(`📊 找到 ${applications.length} 条申请记录\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const app of applications) {
      try {
        // 检查是否已经迁移过
        if (app.persons && app.persons.length > 0) {
          console.log(`⏭️  跳过 ${app.applyCode} - 已经是新格式`);
          skippedCount++;
          continue;
        }
        
        console.log(`\n🔄 正在迁移: ${app.applyCode}`);
        console.log(`   主申请人: ${app.name}`);
        console.log(`   同行人数: ${app.companions ? app.companions.length : 0}`);
        
        // 1. 构建persons数组
        const persons = [
          { 
            personId: 'main', 
            name: app.name, 
            role: 'main' 
          }
        ];
        
        // 添加同行人
        if (app.companions && app.companions.length > 0) {
          app.companions.forEach((name, i) => {
            if (name && name.trim()) {
              persons.push({
                personId: `comp${i + 1}`,
                name: name.trim(),
                role: 'companion'
              });
              console.log(`   - 同行人 ${i + 1}: ${name}`);
            }
          });
        }
        
        // 2. 迁移材料数据
        const materialsByPerson = [];
        
        // 主申请人的材料
        if (app.materials && app.materials.length > 0) {
          materialsByPerson.push({
            personId: 'main',
            materials: app.materials.map(m => ({
              materialId: m.materialId,
              materialName: m.materialName,
              templateRequired: m.templateRequired,
              status: m.status || '未提交',
              images: m.images || [],
              note: m.note,
              submittedBy: m.submittedBy,
              submittedAt: m.submittedAt,
              reviewedAt: m.reviewedAt,
              reviewNote: m.reviewNote
            }))
          });
          console.log(`   ✓ 迁移了 ${app.materials.length} 个材料`);
        }
        
        // 同行人的材料（初始为空）
        persons.slice(1).forEach(person => {
          materialsByPerson.push({
            personId: person.personId,
            materials: []
          });
        });
        
        // 3. 迁移问答数据
        const questionsByPerson = [];
        const commonQuestions = [];
        
        // 主申请人的问答
        if (app.questionsAnswers && app.questionsAnswers.length > 0) {
          const personalQuestions = [];
          
          // 区分共同问题和个人问题
          // 注意：由于旧数据没有questionType字段，暂时将所有问题作为个人问题
          // 管理员可以后续手动调整
          app.questionsAnswers.forEach(qa => {
            personalQuestions.push({
              questionId: qa.questionId,
              questionText: qa.questionText,
              questionType: 'personal', // 默认为个人问题
              answer: qa.answer,
              groupId: qa.groupId,
              groupName: qa.groupName,
              inheritedFrom: null
            });
          });
          
          questionsByPerson.push({
            personId: 'main',
            questionsAnswers: personalQuestions
          });
          
          console.log(`   ✓ 迁移了 ${app.questionsAnswers.length} 个问答`);
        }
        
        // 同行人的问答（初始为空，或继承主申请人）
        persons.slice(1).forEach(person => {
          questionsByPerson.push({
            personId: person.personId,
            questionsAnswers: []
          });
        });
        
        // 4. 更新申请记录
        app.persons = persons;
        app.materialsByPerson = materialsByPerson;
        app.questionsByPerson = questionsByPerson;
        app.commonQuestions = commonQuestions;
        
        // 保存（保留原有的materials和questionsAnswers字段以兼容）
        await app.save();
        
        console.log(`   ✅ 迁移成功: ${app.applyCode}`);
        migratedCount++;
        
      } catch (err) {
        console.error(`   ❌ 迁移失败 ${app.applyCode}:`, err.message);
        errorCount++;
      }
    }
    
    // 统计结果
    console.log('\n' + '='.repeat(60));
    console.log('📊 迁移完成统计:');
    console.log('='.repeat(60));
    console.log(`✅ 成功迁移: ${migratedCount} 条`);
    console.log(`⏭️  已跳过: ${skippedCount} 条（已是新格式）`);
    console.log(`❌ 失败: ${errorCount} 条`);
    console.log(`📋 总计: ${applications.length} 条`);
    console.log('='.repeat(60));
    
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('\n✅ 数据库连接已关闭');
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ 迁移过程发生错误:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('❌ 未捕获的异常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ 未处理的Promise拒绝:', err);
  process.exit(1);
});

