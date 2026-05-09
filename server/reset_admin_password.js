// 重置admin密码脚本
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');
const Admin = require('./models/Admin');

async function resetPassword() {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ 数据库连接成功');

    const adminUser = await Admin.findOne({ username: 'admin' });
    
    if (!adminUser) {
      console.log('❌ 未找到admin账户');
      process.exit(1);
    }

    // 重置密码为：admin123
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('✅ 密码重置成功！');
    console.log('   用户名: admin');
    console.log('   新密码: admin123');
    console.log('   ⚠️  请登录后立即修改密码！');
    
  } catch (error) {
    console.error('❌ 重置失败:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

resetPassword();

