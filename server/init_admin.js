// 初始化管理员账户脚本
// 确保admin账户是管理员角色，拥有所有权限

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');
const Admin = require('./models/Admin');

async function initAdmin() {
  try {
    // 连接数据库
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ 数据库连接成功');

    // 查找admin账户
    let adminUser = await Admin.findOne({ username: 'admin' });

    if (adminUser) {
      // admin账户已存在，更新为管理员角色
      console.log('📋 找到admin账户，正在更新为管理员角色...');
      
      adminUser.role = 'admin';
      adminUser.displayName = '系统管理员';
      adminUser.isActive = true;
      adminUser.permissions = {
        orderManagement: true,
        packageManagement: true,
        templateManagement: true,
        blacklistManagement: true,
        faqManagement: true,
        noticeManagement: true,
        userManagement: true
      };
      adminUser.updatedAt = new Date();
      
      await adminUser.save();
      console.log('✅ admin账户已更新为管理员角色！');
      console.log('   用户名: admin');
      console.log('   角色: 管理员');
      console.log('   权限: 全部权限');
    } else {
      // admin账户不存在，创建新的管理员账户
      console.log('📋 admin账户不存在，正在创建...');
      
      // 生成默认密码：admin123
      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      adminUser = new Admin({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        displayName: '系统管理员',
        permissions: {
          orderManagement: true,
          packageManagement: true,
          templateManagement: true,
          blacklistManagement: true,
          faqManagement: true,
          noticeManagement: true,
          userManagement: true
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await adminUser.save();
      console.log('✅ 管理员账户创建成功！');
      console.log('   用户名: admin');
      console.log('   初始密码: admin123');
      console.log('   角色: 管理员');
      console.log('   ⚠️  请登录后立即修改密码！');
    }

    // 显示所有账户信息
    console.log('\n📊 当前所有账户：');
    const allAdmins = await Admin.find({}, '-password');
    allAdmins.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.username}`);
      console.log(`   显示名称: ${user.displayName || '未设置'}`);
      console.log(`   角色: ${user.role === 'admin' ? '管理员' : '员工'}`);
      console.log(`   状态: ${user.isActive ? '激活' : '禁用'}`);
      if (user.role === 'staff') {
        const permissions = Object.entries(user.permissions || {})
          .filter(([key, value]) => value)
          .map(([key]) => {
            const permMap = {
              orderManagement: '订单管理',
              packageManagement: '套餐管理',
              templateManagement: '模板管理',
              blacklistManagement: '黑名单管理',
              faqManagement: '常见问题',
              noticeManagement: '公告管理',
              userManagement: '用户管理'
            };
            return permMap[key];
          });
        console.log(`   权限: ${permissions.length > 0 ? permissions.join(', ') : '无'}`);
      } else {
        console.log(`   权限: 全部权限`);
      }
    });

    console.log('\n✅ 初始化完成！');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n数据库连接已关闭');
    process.exit(0);
  }
}

// 运行初始化
initAdmin();

