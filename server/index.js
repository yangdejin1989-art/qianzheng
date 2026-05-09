// index.js
// Node.js + Express 后端主入口，提供签证申请和进度查询接口
// 主要功能：
// 1. 连接 MongoDB 数据库
// 2. 加载数据模型
// 3. 提供 API 接口：/api/apply（提交申请）、/api/status（查询进度）等
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('./config');

// 导入邮件功能
const { sendManualStatusEmail } = require('./utils/emailHelpers');

const app = express();
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// 连接 MongoDB
const dbReady = mongoose.connect(config.mongoUri, {
  serverSelectionTimeoutMS: 10000,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB 连接错误:'));
db.once('open', () => {
  console.log('已成功连接到 MongoDB');
});

app.use('/api', async (req, res, next) => {
  try {
    await dbReady;
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    res.status(500).json({
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// 加载所有数据模型（在数据库连接后）
const Application = require('./models/Application');
const FAQ = require('./models/FAQ');
const Notice = require('./models/Notice');
const Admin = require('./models/Admin');
const Carousel = require('./models/Carousel');
const Footer = require('./models/Footer');
const Introduction = require('./models/Introduction');
const Package = require('./models/Package');
const CodeSeq = require('./models/CodeSeq');
const EmailVerification = require('./models/EmailVerification');
const Blacklist = require('./models/Blacklist');
const MaterialTemplate = require('./models/MaterialTemplate');
const QuestionTemplate = require('./models/QuestionTemplate');

// 导入黑名单中间件
const { checkIPBlacklist, checkEmailBlacklist, checkPhoneBlacklist } = require('./middleware/blacklistMiddleware');

// 导入认证中间件
const { authenticate, requireAdmin, requireAdminOrStaff } = require('./middleware/authMiddleware');

// 创建 uploads 目录（如不存在）
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, name);
  }
});
// 配置 multer，移除文件大小限制
const upload = multer({ 
  storage,
  limits: {
    fileSize: Infinity, // 移除文件大小限制
    files: 100 // 允许同时上传最多100个文件（支持多人申请）
  }
});

// 静态托管 uploads 目录
app.use('/uploads', express.static(uploadDir));

// 通用图片上传接口
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }
    
    const imageUrl = '/uploads/' + req.file.filename;
    res.json({
      success: true,
      url: imageUrl,
      alt: req.file.originalname,
      message: '图片上传成功'
    });
  } catch (error) {
    console.error('图片上传错误:', error);
    res.status(500).json({ success: false, message: '图片上传失败' });
  }
});

// 初始化默认管理员账号（admin/123456）
async function initAdmin() {
  const exist = await Admin.findOne({ username: 'admin' });
  if (!exist) {
    const hash = await bcrypt.hash('123456', 10);
    await Admin.create({ username: 'admin', password: hash });
    console.log('已初始化默认管理员账号：admin/123456');
  }
}
dbReady.then(initAdmin).catch(err => {
  console.error('Admin initialization skipped:', err.message);
});

// 配置邮件发送器 - 支持Gmail、QQ邮箱和163邮箱
function createTransporter() {
  const emailUser = process.env.EMAIL_USER || 'jishu2020_service@163.com';
  const emailPass = process.env.EMAIL_PASS || 'QDyQgPu328neKbEE';
  
  console.log('📧 使用163邮箱SMTP配置');
  return nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465, // 163邮箱使用465端口更稳定
    secure: true, // 465端口需要SSL
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
}

const transporter = createTransporter();

// 测试邮件连接
async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ 163邮箱 SMTP连接测试成功');
    return true;
  } catch (error) {
    console.log('❌ 163邮箱 SMTP连接测试失败:', error.message);
    return false;
  }
}

// 生成6位数字验证码
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 启动时测试邮件连接
if (!process.env.VERCEL) {
  testEmailConnection();
}

// 发送邮箱验证码接口 - 支持双验证方式
app.post('/api/send-verification-code', async (req, res) => {
  try {
    const { email, phone, applyCode, name, queryType } = req.body;
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: '请输入有效的邮箱地址' });
    }
    
    // 根据查询类型验证必填字段
    if (queryType === 'phone') {
      // 方式一：姓名+手机号+邮箱验证
      if (!name || !phone) {
        return res.status(400).json({ message: '请提供姓名和手机号' });
      }
      
      // 验证申请记录是否存在且信息匹配
      const application = await Application.findOne({ 
        name: name,
        phone: phone,
        email: email
      });
      
      if (!application) {
        return res.status(404).json({ message: '未找到匹配的申请记录，请检查姓名、手机号和邮箱是否正确' });
      }
      
    } else if (queryType === 'code') {
      // 方式二：姓名+申请编码+邮箱验证
      if (!name || !applyCode) {
        return res.status(400).json({ message: '请提供姓名和申请编码' });
      }
      
      // 验证申请记录是否存在且信息匹配
      const application = await Application.findOne({ 
        name: name,
        applyCode: applyCode,
        email: email
      });
      
      if (!application) {
        return res.status(404).json({ message: '未找到匹配的申请记录，请检查姓名、申请编码和邮箱是否正确' });
      }
      
    } else {
      // 兼容旧版本：手机号或申请编码
      if (!phone && !applyCode) {
        return res.status(400).json({ message: '请提供手机号或申请编码' });
      }
    }
    
    // 检查发送频率限制（1分钟内只能发送一次）
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentCode = await EmailVerification.findOne({
      email,
      createdAt: { $gte: oneMinuteAgo }
    });
    
    if (recentCode) {
      return res.status(429).json({ 
        message: '验证码发送过于频繁，请1分钟后再试' 
      });
    }
    
    // 生成验证码
    const code = generateVerificationCode();
    
    // 保存验证码到数据库（10分钟有效期）
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期
    await EmailVerification.create({
      email,
      code,
      phone: phone || '',
      applyCode: applyCode || '',
      name: name || '',
      queryType: queryType || '',
      expiresAt: expiresAt
    });
    
    // 发送邮件
    const mailOptions = {
      from: process.env.EMAIL_USER || 'jishu2020_service@163.com',
      to: email,
      subject: '签证申请进度查询验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">签证申请进度查询验证码</h2>
          <p>您好！</p>
          <p>您正在查询签证申请进度，验证码为：</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #1976d2; letter-spacing: 3px;">${code}</span>
          </div>
          <p style="color: #666;">验证码有效期为10分钟，请及时使用。</p>
          <p style="color: #666;">如果这不是您的操作，请忽略此邮件。</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
        </div>
      `
    };
    
    // 发送邮件，带重试机制
    let emailSent = false;
    let lastError = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📧 尝试发送邮件 (第${attempt}次)...`);
        await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log('✅ 邮件发送成功');
        break;
      } catch (emailError) {
        lastError = emailError;
        console.log(`❌ 第${attempt}次发送失败:`, emailError.message);
        
        if (attempt < 3) {
          console.log('⏳ 等待2秒后重试...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    if (!emailSent) {
      throw lastError;
    }
    
    res.json({ 
      message: '验证码已发送到您的邮箱，请查收',
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2') // 隐藏部分邮箱地址
    });
    
  } catch (error) {
    console.error('发送验证码失败:', error);
    console.error('错误详情:', error.message);
    
    // 根据错误类型提供更具体的错误信息
    let errorMessage = '发送验证码失败，请稍后重试';
    if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      errorMessage = '网络连接超时，请检查网络连接或稍后重试';
    } else if (error.code === 'EAUTH') {
      errorMessage = '邮箱认证失败，请检查邮箱配置';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      code: error.code
    });
  }
});

// 验证邮箱验证码接口 - 支持双验证方式
app.post('/api/verify-email-code', async (req, res) => {
  try {
    const { email, code, phone, applyCode, queryCode, name, queryType } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: '请输入邮箱和验证码' });
    }
    
    // 查找验证码记录
    const verification = await EmailVerification.findOne({
      email,
      code,
      verified: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!verification) {
      // 检查是否是验证码错误还是过期
      const expiredCode = await EmailVerification.findOne({
        email,
        code
      });
      
      if (expiredCode) {
        return res.status(400).json({ message: '验证码已过期，请重新获取' });
      } else {
        // 增加尝试次数
        await EmailVerification.updateMany(
          { email, verified: false },
          { $inc: { attempts: 1 } }
        );
        return res.status(400).json({ message: '验证码错误' });
      }
    }
    
    // 检查尝试次数
    if (verification.attempts >= 5) {
      return res.status(400).json({ message: '验证码尝试次数过多，请重新获取' });
    }
    
    // 验证成功，标记为已验证
    verification.verified = true;
    await verification.save();
    
    // 生成临时token用于查询
    const queryToken = jwt.sign(
      { 
        email, 
        phone: phone || verification.phone,
        applyCode: applyCode || verification.applyCode,
        name: name || verification.name,
        queryType: queryType || verification.queryType,
        verified: true,
        exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30分钟有效期
      }, 
      config.jwtSecret
    );
    
    res.json({ 
      message: '验证成功',
      token: queryToken
    });
    
  } catch (error) {
    console.error('验证码验证失败:', error);
    res.status(500).json({ message: '验证失败，请稍后重试' });
  }
});

// 管理员登录接口
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(401).json({ message: '账号或密码错误' });
  if (!admin.isActive) return res.status(401).json({ message: '账户已被禁用' });
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ message: '账号或密码错误' });
  // 生成JWT，包含角色信息
  const token = jwt.sign({ 
    username: admin.username, 
    id: admin._id,
    role: admin.role 
  }, config.jwtSecret, { expiresIn: '2h' });
  
  // 返回用户信息和权限
  res.json({ 
    token,
    user: {
      id: admin._id,
      username: admin.username,
      displayName: admin.displayName || admin.username,
      role: admin.role,
      permissions: admin.role === 'admin' ? {
        // 管理员拥有所有权限
        orderManagement: true,
        packageManagement: true,
        templateManagement: true,
        blacklistManagement: true,
        faqManagement: true,
        noticeManagement: true,
        userManagement: true
      } : admin.permissions
    }
  });
});

// 个人设置 - 更新基本信息
app.put('/api/admin/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: '未授权' });

    const decoded = jwt.verify(token, config.jwtSecret);
    const { displayName, phone, email, wechat, qq } = req.body;

    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(404).json({ success: false, message: '用户不存在' });
    if (!admin.isActive) return res.status(401).json({ success: false, message: '账户已被禁用' });

    // 更新允许修改的字段
    if (displayName !== undefined) admin.displayName = displayName;
    if (phone !== undefined) admin.phone = phone;
    if (email !== undefined) admin.email = email;
    if (wechat !== undefined) admin.wechat = wechat;
    if (qq !== undefined) admin.qq = qq;
    admin.updatedAt = new Date();
    await admin.save();

    res.json({ 
      success: true, 
      message: '基本信息更新成功',
      user: {
        id: admin._id,
        username: admin.username,
        displayName: admin.displayName,
        phone: admin.phone,
        email: admin.email,
        wechat: admin.wechat,
        qq: admin.qq,
        role: admin.role
      }
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: '无效的令牌' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// 个人设置 - 修改密码
app.put('/api/admin/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: '未授权' });

    const decoded = jwt.verify(token, config.jwtSecret);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '请提供当前密码和新密码' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: '新密码长度至少6位' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(404).json({ success: false, message: '用户不存在' });
    if (!admin.isActive) return res.status(401).json({ success: false, message: '账户已被禁用' });

    // 验证当前密码
    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: '当前密码错误' });
    }

    // 更新密码
    admin.password = await bcrypt.hash(newPassword, 10);
    admin.updatedAt = new Date();
    await admin.save();

    res.json({ success: true, message: '密码修改成功' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: '无效的令牌' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// 测试接口
app.get('/api/hello', (req, res) => {
  res.json({ message: '后端服务已启动！' });
});

// 生成申请编码 - 优化版本：QZ年月日+随机3个字母+3个数字
async function generateApplyCode() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 取年份后两位
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份，补零
  const day = now.getDate().toString().padStart(2, '0'); // 日期，补零
  
  // 生成3个随机大写字母
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomLetters = '';
  for (let i = 0; i < 3; i++) {
    randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // 生成3个随机数字
  let randomNumbers = '';
  for (let i = 0; i < 3; i++) {
    randomNumbers += Math.floor(Math.random() * 10);
  }
  
  return `QZ${year}${month}${day}${randomLetters}${randomNumbers}`;
}



// 提交签证申请（支持文件上传）
app.post('/api/apply', (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('❌ 文件上传错误:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: '文件过大，请压缩后重试' });
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: '文件数量超过限制，最多100个文件' });
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: '文件字段名不正确' });
      } else {
        return res.status(500).json({ message: '文件上传失败: ' + err.message });
      }
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, phone, address, email, wechat, line, networkType, installDate, package: pkg, captcha, visaType, visaPrice, visaCurrency } = req.body;
    
    // 解析JSON字符串字段
    let customerType, companionsList, questionsAnswers, materials;
    
    try {
      customerType = req.body.customerType ? JSON.parse(req.body.customerType) : null;
      companionsList = req.body.companions ? JSON.parse(req.body.companions) : [];
      questionsAnswers = req.body.questionsAnswers ? JSON.parse(req.body.questionsAnswers) : [];
      materials = req.body.materials ? JSON.parse(req.body.materials) : [];
    } catch (jsonError) {
      console.error('❌ JSON解析失败:', jsonError);
      return res.status(400).json({ message: 'JSON数据格式错误' });
    }
    
    console.log('📝 接收到的数据:', {
      name,
      phone,
      customerType,
      companionsList,
      questionsCount: questionsAnswers.length,
      materialsCount: materials.length,
      filesCount: req.files ? req.files.length : 0,
      visaType: visaType || '未填写',
      visaPrice: visaPrice || 0,
      visaCurrency: visaCurrency || 'CNY'
    });
    
    // 验证必填字段
    if (!name || !phone || !address) {
      return res.status(400).json({ message: '请填写完整信息' });
    }
    
    // 验证微信或LINE至少填一个
    if (!wechat && !line) {
      return res.status(400).json({ message: '请至少填写微信号或LINE号其中一个' });
    }
    
    // 验证图形验证码
    if (!captcha || captcha.length !== 4) {
      return res.status(400).json({ message: '请输入正确的验证码' });
    }
    
    // 检查邮箱黑名单（如提供邮箱）
    if (email) {
      const isEmailBlacklisted = await checkEmailBlacklist(email);
      if (isEmailBlacklisted) {
        return res.status(403).json({ message: '该邮箱已被封禁，无法提交申请' });
      }
    }
    
    // 检查手机号黑名单
    const isPhoneBlacklisted = await checkPhoneBlacklist(phone);
    if (isPhoneBlacklisted) {
      return res.status(403).json({ message: '该手机号已被封禁，无法提交申请' });
    }
    
    // 获取套餐信息（如果提供了套餐ID）
    let packageName = pkg;
    if (pkg && pkg.length === 24) { // MongoDB ObjectId 长度为24
      try {
        const Package = require('./models/Package');
        const packageInfo = await Package.findById(pkg);
        if (packageInfo) {
          packageName = packageInfo.name;
          console.log('📦 找到套餐信息:', packageInfo.name);
        } else {
          console.log('⚠️ 套餐ID不存在:', pkg);
        }
      } catch (packageError) {
        console.error('❌ 查询套餐信息失败:', packageError);
      }
    }
    
    // 处理上传的材料文件
    const uploadedFiles = req.files || [];
    const materialsWithFiles = [];
    
    if (materials && materials.length > 0) {
      materials.forEach(materialMeta => {
        const materialFiles = uploadedFiles.filter(file => 
          file.fieldname === `material_${materialMeta.personId}_${materialMeta.materialId}`
        );
        
        materialsWithFiles.push({
          materialId: materialMeta.materialId,
          materialName: materialMeta.materialName,
          templateRequired: materialMeta.templateRequired,
          personId: materialMeta.personId,
          personName: materialMeta.personName,
          status: materialFiles.length > 0 ? '已提交' : '未提交',
          images: materialFiles.map(file => `/uploads/${file.filename}`),
          submittedBy: 'user',
          submittedAt: materialFiles.length > 0 ? new Date() : null
        });
        
        console.log(`📎 ${materialMeta.personName} - 材料 "${materialMeta.materialName}": ${materialFiles.length} 个文件`);
      });
      
      console.log('✅ 材料处理完成，共', materialsWithFiles.length, '项');
    }
    
    const applyCode = await generateApplyCode();
    
    // 构建申请记录
    const applicationData = {
      name,
      phone,
      address,
      email,
      wechat,
      line,
      networkType,
      installDate,
      package: packageName,
      visaType: visaType || '',        // 签证次数（单次、多次等）
      visaPrice: visaPrice ? parseFloat(visaPrice) : 0,  // 价格
      visaCurrency: visaCurrency || 'CNY',  // 币种
      applyCode,
      status: '待处理',
      companions: companionsList,
      processLog: [{
        action: '客户提交申请',
        description: companionsList.length > 0 
          ? `客户提交了签证申请（含${companionsList.length}位同行人）` 
          : '客户提交了签证办理申请',
        timestamp: new Date()
      }]
    };
    
    // 添加客户类型
    if (customerType) {
      applicationData.customerType = customerType;
      
      // 🆕 自动加载问题模板（即使用户没填写，也保存模板结构）
      try {
        const QuestionTemplate = require('./models/QuestionTemplate');
        const questionTemplate = await QuestionTemplate.findOne({
          packageId: pkg,
          customerTypeId: customerType.typeId
        });
        
        if (questionTemplate && questionTemplate.questions && questionTemplate.questions.length > 0) {
          // 创建完整的问题列表（包含模板问题）
          const fullQuestions = questionTemplate.questions.map(templateQuestion => {
            // 查找用户是否填写了这个问题的答案
            const userAnswer = questionsAnswers.find(qa => qa.questionId === templateQuestion.questionId);
            
            return {
              questionId: templateQuestion.questionId,
              questionText: templateQuestion.questionText,
              questionType: templateQuestion.questionType || 'personal',
              required: templateQuestion.required || false,
              helpText: templateQuestion.helpText || '',
              answer: userAnswer ? userAnswer.answer : '', // 如果用户没填，答案为空
              answeredBy: userAnswer ? 'user' : '', // 标记是谁填写的
              answeredAt: userAnswer ? new Date() : null
            };
          });
          
          applicationData.questionsAnswers = fullQuestions;
          console.log('✅ 已加载问题模板:', fullQuestions.length, '个问题（含用户答案）');
        } else {
          // 如果没有问题模板，只保存用户填写的答案（旧版兼容）
          if (questionsAnswers && questionsAnswers.length > 0) {
            applicationData.questionsAnswers = questionsAnswers;
          }
        }
        
        // 🆕 自动加载材料清单模板
        const MaterialTemplate = require('./models/MaterialTemplate');
        const materialTemplate = await MaterialTemplate.findOne({ packageId: pkg });
        
        if (materialTemplate) {
          const customerTypeData = materialTemplate.customerTypes.find(ct => ct.typeId === customerType.typeId);
          
          if (customerTypeData && customerTypeData.materials && customerTypeData.materials.length > 0) {
            // 生成所有人员的材料清单
            const allPersons = [
              { id: 'main', name: name },
              ...companionsList.map((name, idx) => ({ id: `comp${idx + 1}`, name }))
            ];
            
            // 构建用户上传材料的映射（用于合并）
            const uploadedMaterialsMap = new Map();
            materialsWithFiles.forEach(material => {
              const key = `${material.personId}_${material.materialId}`;
              uploadedMaterialsMap.set(key, material);
            });
            
            const materialsList = [];
            customerTypeData.materials.forEach(materialTemplate => {
              allPersons.forEach(person => {
                const key = `${person.id}_${materialTemplate.materialId}`;
                const uploadedMaterial = uploadedMaterialsMap.get(key);
                
                if (uploadedMaterial) {
                  // 用户已上传材料，使用用户上传的数据
                  materialsList.push(uploadedMaterial);
                } else {
                  // 用户未上传材料，创建空的材料项
                  materialsList.push({
                    materialId: materialTemplate.materialId,
                    materialName: materialTemplate.name,
                    templateRequired: materialTemplate.required || false,
                    needsImage: materialTemplate.needsImage || false,
                    allowMultiple: materialTemplate.allowMultiple || false,
                    materialType: materialTemplate.materialType || 'personal',
                    personId: person.id,
                    personName: person.name,
                    status: '未提交',
                    images: [],
                    submittedBy: '',
                    submittedAt: null
                  });
                }
              });
            });
            
            applicationData.materials = materialsList;
            console.log('✅ 已自动加载材料清单模板:', materialsList.length, '项（', allPersons.length, '人），其中', materialsWithFiles.length, '项已上传材料');
          } else if (materialsWithFiles.length > 0) {
            // 如果没有材料模板，但用户上传了材料，使用用户上传的材料
            applicationData.materials = materialsWithFiles;
          }
        } else if (materialsWithFiles.length > 0) {
          // 如果没有材料模板，但用户上传了材料，使用用户上传的材料
          applicationData.materials = materialsWithFiles;
        }
      } catch (templateError) {
        console.error('❌ 加载模板失败:', templateError);
        // 发生错误时，至少保存用户填写的答案和材料
        if (questionsAnswers && questionsAnswers.length > 0) {
          applicationData.questionsAnswers = questionsAnswers;
        }
        if (materialsWithFiles.length > 0) {
          applicationData.materials = materialsWithFiles;
        }
      }
    } else {
      // 如果没有客户类型，只保存用户填写的答案和材料（旧版兼容）
      if (questionsAnswers && questionsAnswers.length > 0) {
        applicationData.questionsAnswers = questionsAnswers;
      }
    if (materialsWithFiles.length > 0) {
      applicationData.materials = materialsWithFiles;
      }
    }
    
    const application = new Application(applicationData);
    await application.save();
    
    console.log('✅ 申请保存成功:', applyCode);
    console.log('  - 客户类型:', customerType?.typeName || '无');
    console.log('  - 同行人数:', companionsList.length);
    console.log('  - 问题数量:', questionsAnswers.length);
    console.log('  - 材料数量:', materialsWithFiles.length);
    console.log('  - 签证次数:', visaType || '未填写');
    console.log('  - 办理价格:', visaPrice ? `${visaCurrency || 'CNY'} ${visaPrice}` : '未填写');
    
    // 自动发送申请成功邮件
    if (email && email.trim()) {
      try {
        const { sendManualStatusEmail } = require('./utils/emailHelpers');
        const emailResult = await sendManualStatusEmail(application._id, application);
        
        if (emailResult.success) {
          application.emailLog = application.emailLog || [];
          application.emailLog.push({ status: '待处理', type: 'auto', sentAt: new Date() });
          await application.save();
          console.log('✅ 申请成功邮件已自动发送到:', email);
        } else {
          console.error('❌ 邮件发送失败:', emailResult.message);
        }
      } catch (emailError) {
        console.error('❌ 自动发送申请成功邮件失败:', emailError);
      }
    } else {
      console.log('⚠️ 申请未提供邮箱地址，跳过邮件发送');
    }
    
    res.json({ message: '申请提交成功', id: application._id, applyCode });
  } catch (err) {
    console.error('❌ 申请提交失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 辅助函数：填充完整的 customerType 数据（包括 materials 和 questions）
async function populateCustomerType(application) {
  if (!application.customerType || !application.customerType.typeId) {
    return null;
  }
  
  try {
    const packageInfo = await Package.findOne({ name: application.package });
    if (!packageInfo) {
      console.log('未找到套餐信息:', application.package);
      return application.customerType;
    }
    
    // 查找材料模板
    const materialTemplate = await MaterialTemplate.findOne({ packageId: packageInfo._id });
    let materials = [];
    
    if (materialTemplate && materialTemplate.customerTypes) {
      const customerTypeData = materialTemplate.customerTypes.find(
        ct => ct.typeId === application.customerType.typeId
      );
      if (customerTypeData && customerTypeData.materials) {
        materials = customerTypeData.materials.map(m => ({
          materialId: m.materialId,
          name: m.name,
          required: m.required,
          description: m.description,
          needsImage: m.needsImage,
          allowMultiple: m.allowMultiple,
          materialType: m.materialType,
          order: m.order
        }));
      }
    }
    
    // 查找问题模板
    const questionTemplate = await QuestionTemplate.findOne({
      packageId: packageInfo._id,
      customerTypeId: application.customerType.typeId
    });
    
    let questions = [];
    if (questionTemplate && questionTemplate.questions) {
      questions = questionTemplate.questions.map(q => ({
        questionId: q.questionId,
        question: q.questionText,
        required: q.required,
        description: q.helpText,
        questionType: q.questionType,
        order: q.order
      }));
    }
    
    // 添加后台手动添加的自定义问题
    if (application.questionsAnswers && application.questionsAnswers.length > 0) {
      const customQuestions = application.questionsAnswers.filter(q => 
        q.questionId && q.questionId.startsWith('custom_')
      );
      
      customQuestions.forEach(customQ => {
        // 检查是否已存在（避免重复）
        if (!questions.find(q => q.questionId === customQ.questionId)) {
          questions.push({
            questionId: customQ.questionId,
            question: customQ.questionText || '自定义问题',
            required: false,
            description: '',
            questionType: 'common', // 自定义问题默认为共同问题
            order: 999
          });
        }
      });
    }
    
    // 返回完整的 customerType 对象
    return {
      typeId: application.customerType.typeId,
      typeName: application.customerType.typeName,
      materials: materials,
      questions: questions
    };
  } catch (error) {
    console.error('填充 customerType 数据失败:', error);
    return application.customerType;
  }
}

// 通过手机号、申请编号或申请编码查询进度（支持邮箱验证）
app.get('/api/status', async (req, res) => {
  try {
    const { phone, id, applyCode, token } = req.query;
    
    // 如果提供了token，验证token
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        if (!decoded.verified) {
          return res.status(401).json({ message: '验证token无效' });
        }
        
        // 使用token中的信息查询
        let application;
        let allApplications = [];
        
        if (decoded.queryType === 'phone') {
          // 方式一：通过姓名+手机号查询
          // 获取所有匹配的申请记录
          allApplications = await Application.find({ 
            name: decoded.name,
            phone: decoded.phone,
            email: decoded.email
          }).sort({ createdAt: -1 }); // 按创建时间倒序
          
          if (allApplications.length === 0) {
            return res.status(404).json({ message: '未找到申请记录' });
          }
          
          // 默认显示最新的申请
          application = allApplications[0];
        } else if (decoded.queryType === 'code') {
          // 方式二：通过姓名+申请编码查询
          application = await Application.findOne({ 
            name: decoded.name,
            applyCode: decoded.applyCode,
            email: decoded.email
          });
          
          if (application) {
            allApplications = [application];
          }
        } else if (decoded.applyCode) {
          // 兼容旧版本：通过申请编码查询
          application = await Application.findOne({ applyCode: decoded.applyCode });
          
          if (application) {
            allApplications = [application];
          }
        } else if (decoded.phone) {
          // 兼容旧版本：通过手机号查询
          application = await Application.findOne({ phone: decoded.phone });
          
          if (application) {
            allApplications = [application];
          }
        } else {
          return res.status(400).json({ message: 'token中缺少查询信息' });
        }
        
        if (!application) {
          return res.status(404).json({ message: '未找到申请记录' });
        }
        
        // 验证邮箱是否匹配（如果申请记录中有邮箱）
        if (application.email && application.email !== decoded.email) {
          return res.status(403).json({ message: '邮箱验证不匹配' });
        }
        
        // 填充完整的 customerType 数据
        const fullCustomerType = await populateCustomerType(application);
        
        // 返回查询结果
        return res.json({
          name: application.name,
          phone: application.phone,
          address: application.address,
          email: application.email,
          wechat: application.wechat,
          line: application.line,
          networkType: application.networkType,
          installDate: application.installDate,
          package: application.package,
          status: application.status,
          feedback: application.feedback,
          createdAt: application.createdAt,
          id: application._id,
          applyCode: application.applyCode,
          // 同行人信息
          companions: application.companions || [],
          // 办理类型（包含材料清单和问题）
          customerType: fullCustomerType,
          // 材料和答案
          materials: application.materials || [],
          materialFiles: application.materialFiles,
          answers: application.answers,
          // 所有申请记录信息
          allApplications: allApplications.map(app => ({
            id: app._id,
            applyCode: app.applyCode,
            package: app.package,
            status: app.status,
            createdAt: app.createdAt,
            address: app.address
          })),
          totalApplications: allApplications.length,
          hasMultipleApplications: allApplications.length > 1,
          // 用户确认信息
          confirmTime: application.confirmTime,
          japaneseName: application.japaneseName,
          idCardFront: application.idCardFront,
          idCardBack: application.idCardBack,
          passportPhoto: application.passportPhoto,
          other: application.other,
          // 补充材料信息
          additionalMaterials: application.additionalMaterials,
          contactPreference: application.contactPreference,
          notes: application.notes,
          // 过程记录
          processLog: application.processLog || [],
          // 用户/管理员提交的消息
          messages: application.messages || [],
          // 标记为已验证
          emailVerified: true
        });
        
      } catch (tokenError) {
        return res.status(401).json({ message: '验证token已过期或无效' });
      }
    }
    
    // 原有的查询逻辑（无邮箱验证）
    let application;
    if (applyCode) {
      application = await Application.findOne({ applyCode });
    } else if (id) {
      application = await Application.findById(id);
    } else if (phone) {
      application = await Application.findOne({ phone });
    } else {
      return res.status(400).json({ message: '请提供手机号、申请编号或申请编码' });
    }
    if (!application) {
      return res.status(404).json({ message: '未找到申请记录' });
    }
    
    // 填充完整的 customerType 数据
    const fullCustomerType = await populateCustomerType(application);
    
    res.json({
      name: application.name,
      phone: application.phone,
      address: application.address,
      email: application.email,
      wechat: application.wechat,
      line: application.line,
      networkType: application.networkType,
      installDate: application.installDate,
      package: application.package,
      status: application.status,
      feedback: application.feedback,
      createdAt: application.createdAt,
      // 同行人信息
      companions: application.companions || [],
      // 办理类型（包含材料清单和问题）
      customerType: fullCustomerType,
      // 材料和答案
      materials: application.materials || [],
      materialFiles: application.materialFiles,
      answers: application.answers,
      id: application._id,
      applyCode: application.applyCode,
      queryCode: application.queryCode, // 返回查询编码
      // 用户确认信息
      confirmTime: application.confirmTime,
      japaneseName: application.japaneseName,
      idCardFront: application.idCardFront,
      idCardBack: application.idCardBack,
      passportPhoto: application.passportPhoto,
      other: application.other, // <--- 补充返回 other 字段
      // 补充材料信息
      additionalMaterials: application.additionalMaterials,
      contactPreference: application.contactPreference,
      notes: application.notes,
      // 过程记录
      processLog: application.processLog || [],
      // 用户/管理员提交的消息
      messages: application.messages || []
    });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 提交签证申请（新接口）
app.post('/api/applications', async (req, res) => {
  try {
    const { 
      name, phone, address, packageId, email, wechat, notes,
      visaType, visaPrice, visaCurrency,  // 新增：签证类型相关字段
      customerType  // 新增：办理类型
    } = req.body;
    
    // 验证必填字段
    if (!name || !phone || !address || !packageId || !email) {
      return res.status(400).json({ message: '请填写所有必填字段（姓名、手机号、地址、套餐、邮箱）' });
    }
    
    // 验证手机号格式（国际格式，支持8-15位数字，含国家代码）
    // 移除可能的空格和连字符后验证
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    const phoneRegex = /^\d{8,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ message: '请输入正确的手机号码（8-15位数字）' });
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '请输入正确的邮箱地址' });
    }
    
    // 获取套餐信息
    const packageInfo = await Package.findById(packageId);
    if (!packageInfo) {
      return res.status(400).json({ message: '套餐信息不存在' });
    }
    
    // 生成申请编码
    const applyCode = await generateApplyCode();
    
    // 创建申请记录
    const applicationData = {
      name,
      phone,
      address,
      email: email, // 直接使用email，不设置默认值
      wechat: wechat || '',
      networkType: '', // 默认为空，后续可以补充
      package: packageInfo.name, // 使用套餐名称
      visaType: visaType || '',        // 签证类型：单次、一年多次等
      visaPrice: visaPrice || 0,       // 价格
      visaCurrency: visaCurrency || 'CNY',  // 币种
      notes: notes || '',
      applyCode,
      status: '待处理',
      processLog: [{
        action: '客户提交申请',
        description: '客户提交了签证办理申请',
        timestamp: new Date()
      }]
    };
    
    // 添加客户类型（如果提供了）
    if (customerType && customerType.typeId) {
      applicationData.customerType = customerType;
      
      // 自动加载材料清单和问题模板
      try {
        // 1. 自动加载问题模板
        const QuestionTemplate = require('./models/QuestionTemplate');
        const questionTemplate = await QuestionTemplate.findOne({
          packageId: packageId,
          customerTypeId: customerType.typeId
        });
        
        if (questionTemplate && questionTemplate.questions && questionTemplate.questions.length > 0) {
          const fullQuestions = questionTemplate.questions.map(templateQuestion => {
            return {
              questionId: templateQuestion.questionId,
              questionText: templateQuestion.questionText,
              questionType: templateQuestion.questionType || 'personal',
              required: templateQuestion.required || false,
              helpText: templateQuestion.helpText || '',
              answer: '', // 初始为空，用户后续填写
              answeredBy: '',
              answeredAt: null
            };
          });
          
          applicationData.questionsAnswers = fullQuestions;
          console.log('✅ 已自动加载问题模板:', fullQuestions.length, '个问题');
        }
        
        // 2. 自动加载材料清单模板
        const MaterialTemplate = require('./models/MaterialTemplate');
        const materialTemplate = await MaterialTemplate.findOne({ packageId: packageId });
        
        if (materialTemplate) {
          const customerTypeData = materialTemplate.customerTypes.find(ct => ct.typeId === customerType.typeId);
          
          if (customerTypeData && customerTypeData.materials && customerTypeData.materials.length > 0) {
            // 生成材料清单（主申请人）
            const materials = customerTypeData.materials.map(materialTemplate => {
              return {
                materialId: materialTemplate.materialId,
                materialName: materialTemplate.name,
                templateRequired: materialTemplate.required || false,
                needsImage: materialTemplate.needsImage || false,
                allowMultiple: materialTemplate.allowMultiple || false,
                materialType: materialTemplate.materialType || 'personal',
                personId: 'main',
                personName: name,
                status: '未提交',
                images: [],
                submittedBy: '',
                submittedAt: null
              };
            });
            
            applicationData.materials = materials;
            console.log('✅ 已自动加载材料清单:', materials.length, '项');
          }
        }
      } catch (templateError) {
        console.error('❌ 加载模板失败:', templateError);
        // 即使加载模板失败，也继续保存customerType
      }
    }
    
    const application = new Application(applicationData);
    await application.save();
    
    console.log('💰 保存的签证类型信息:', { visaType, visaPrice, visaCurrency });
    console.log('📋 保存的办理类型:', customerType?.typeName || '未选择');
    
    // 自动发送申请成功邮件，并记录日志
    console.log('🔍 调试信息 - 申请邮箱:', email);
    console.log('🔍 调试信息 - 申请邮箱类型:', typeof email);
    console.log('🔍 调试信息 - 邮箱是否为空:', !email);
    console.log('🔍 调试信息 - 邮箱是否为空字符串:', email === '');
    console.log('🔍 调试信息 - 邮箱是否只有空格:', email && email.trim() === '');
    
    if (email && email.trim()) {
      try {
        const { buildStatusEmail } = require('./emailTemplates/statusTemplates');
        const { sendManualStatusEmail } = require('./utils/emailHelpers');
        
        console.log('📧 准备发送申请成功邮件到:', email);
        console.log('📧 申请状态:', application.status);
        console.log('📧 申请ID:', application._id);
        
        const emailResult = await sendManualStatusEmail(application._id, application);
        console.log('📧 邮件发送结果:', emailResult);
        
        if (emailResult.success) {
          // 记录邮件已发送（自动）
          application.emailLog = application.emailLog || [];
          application.emailLog.push({ status: '待处理', type: 'auto', sentAt: new Date() });
          await application.save();
          console.log('✅ 申请成功邮件已自动发送到:', email);
        } else {
          console.error('❌ 邮件发送失败:', emailResult.message);
          console.error('❌ 邮件发送失败详情:', emailResult);
        }
      } catch (emailError) {
        console.error('❌ 自动发送申请成功邮件失败:', emailError);
        // 邮件发送失败不影响申请提交
      }
    } else {
      console.log('⚠️ 申请未提供邮箱地址，跳过邮件发送');
      console.log('⚠️ 邮箱值:', email);
      console.log('⚠️ 邮箱类型:', typeof email);
      console.log('⚠️ 邮箱长度:', email ? email.length : 'undefined');
    }
    
    res.json({ 
      message: '申请提交成功', 
      id: application._id, 
      applyCode: application.applyCode
    });
  } catch (err) {
    console.error('提交申请失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 申请列表（后台管理）支持多条件筛选 - 添加员工订单过滤
app.get('/api/applications', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { name, phone, status, applyCode, deleted, startDate, endDate, networkType, installStartDate, installEndDate, package, assignedTo } = req.query;
    const filter = {};
    
    // 根据用户角色过滤订单
    if (req.user.role === 'staff') {
      // 员工只能看到分配给自己的订单
      filter.assignedTo = req.user._id;
      console.log(`员工 ${req.user.username} 查询自己的订单`);
    } else if (req.user.role === 'admin') {
      // 管理员可以查看所有订单，也可以通过assignedTo参数筛选
      if (assignedTo) {
        if (assignedTo === 'unassigned') {
          // 查询未分配的订单
          filter.assignedTo = null;
        } else if (assignedTo !== 'all') {
          // 查询分配给特定员工的订单
          filter.assignedTo = assignedTo;
        }
        // assignedTo === 'all' 时不添加过滤条件，显示所有订单
      }
      console.log(`管理员 ${req.user.username} 查询订单`);
    }
    
    if (name) filter.name = new RegExp(name, 'i');
    if (phone) filter.phone = new RegExp(phone, 'i');
    if (status) filter.status = status;
    if (applyCode) filter.applyCode = new RegExp(applyCode, 'i');
    if (networkType) filter.networkType = new RegExp(networkType, 'i');
    if (package) filter.package = package; // 套餐名称使用精确匹配
    if (deleted === 'true') filter.deleted = true;
    else if (deleted === 'false' || deleted === undefined) filter.deleted = false;
    
    // 创建日期范围筛选
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // 安装日期范围筛选
    if (installStartDate || installEndDate) {
      // 使用 $and 来组合多个条件
      filter.$and = filter.$and || [];
      filter.$and.push({
        installDate: { 
          $exists: true, 
          $ne: null, 
          $ne: '' 
        }
      });
      
      // 添加日期范围条件
      const dateConditions = {};
      if (installStartDate) dateConditions.$gte = installStartDate;
      if (installEndDate) dateConditions.$lte = installEndDate;
      
      if (Object.keys(dateConditions).length > 0) {
        filter.$and.push({ installDate: dateConditions });
      }
    }
    
    // 状态筛选逻辑
    if (status !== undefined && status !== null) {
      if (status.trim() !== '') {
        // 如果指定了状态，则筛选对应状态的订单
        filter.status = status;
      } else {
        // 如果状态为空字符串，则排除已取消的订单（全部订单页面）
        filter.status = { $ne: '已取消' };
      }
    } else {
      // 如果没有传递状态参数，则排除已取消的订单（全部订单页面）
      filter.status = { $ne: '已取消' };
    }
    
    console.log('筛选条件:', JSON.stringify(filter, null, 2));
    
    // 使用 populate 填充负责人信息
    const list = await Application.find(filter)
      .populate('assignedTo', 'username displayName')
      .populate('assignedBy', 'username displayName')
      .sort({ createdAt: -1 });
    
    console.log('查询结果数量:', list.length);
    
    // 调试：显示返回的订单状态
    if (list.length > 0) {
      console.log('返回订单状态分布:');
      const statusCount = {};
      list.forEach(order => {
        statusCount[order.status] = (statusCount[order.status] || 0) + 1;
      });
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}个`);
      });
    }
    
    res.json(list);
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ message: '获取订单列表失败', error: error.message });
  }
});

// 订单分配接口 - 管理员分配订单给员工
app.post('/api/applications/:id/assign', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body; // assignedTo 可以是员工ID或null（取消分配）
    
    // 检查ID格式是否有效
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的申请ID格式' });
    }
    
    // 如果有assignedTo，验证该用户是否存在且为员工
    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ message: '无效的员工ID格式' });
      }
      
      const staff = await Admin.findById(assignedTo);
      if (!staff) {
        return res.status(404).json({ message: '未找到该员工' });
      }
      
      if (!staff.isActive) {
        return res.status(400).json({ message: '该员工账户已被禁用' });
      }
    }
    
    // 更新订单的分配信息
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: '未找到申请' });
    }
    
    application.assignedTo = assignedTo || null;
    application.assignedBy = req.user._id;
    application.assignedAt = new Date();
    
    await application.save();
    
    // 返回更新后的订单信息（包含填充的员工信息）
    const updatedApplication = await Application.findById(id)
      .populate('assignedTo', 'username displayName')
      .populate('assignedBy', 'username displayName');
    
    const assignedStaff = assignedTo ? await Admin.findById(assignedTo) : null;
    const assignedStaffName = assignedStaff ? (assignedStaff.displayName || assignedStaff.username) : '未分配';
    
    console.log(`管理员 ${req.user.username} ${assignedTo ? '分配' : '取消分配'}订单 ${application.applyCode} ${assignedTo ? '给员工 ' + assignedStaffName : ''}`);
    
    res.json({ 
      success: true, 
      message: assignedTo ? '订单分配成功' : '取消分配成功',
      application: updatedApplication 
    });
  } catch (error) {
    console.error('分配订单失败:', error);
    res.status(500).json({ message: '分配订单失败', error: error.message });
  }
});

// 获取员工列表 - 供管理员分配订单时选择
app.get('/api/admin/staff', authenticate, requireAdmin, async (req, res) => {
  try {
    // 获取所有激活的员工账号（包括admin和staff角色）
    const staffList = await Admin.find({ 
      isActive: true 
    }).select('username displayName role').sort({ username: 1 });
    
    res.json({ 
      success: true, 
      data: staffList 
    });
  } catch (error) {
    console.error('获取员工列表失败:', error);
    res.status(500).json({ message: '获取员工列表失败', error: error.message });
  }
});

// 获取单个申请详情
app.get('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查ID格式是否有效
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的申请ID格式' });
    }
    
    let application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: '未找到申请' });
    }
    
    // 转换为普通对象以便修改
    const appObj = application.toObject();
    
    // 填充 customerType 的完整数据（包括材料和问题模板）
    if (appObj.customerType && appObj.customerType.typeId) {
      const fullCustomerType = await populateCustomerType(appObj);
      if (fullCustomerType) {
        appObj.customerType = fullCustomerType;
      }
    }
    
    res.json(appObj);
  } catch (err) {
    console.error('获取申请详情失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 审核/反馈接口（后台管理）支持applyCode
app.put('/api/applications/:id', async (req, res) => {
  try {
  const { id } = req.params;
  const { status, feedback, applyCode, networkType, package: pkg, customerType, packageChanged, customerTypeChanged, name, phone, address, wechat, line, email, companions, visaType, visaPrice, visaCurrency } = req.body;
  
  // 检查ID格式是否有效（如果不使用applyCode）
  if (!applyCode && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: '无效的申请ID格式' });
  }
  
  let appItem = null;
  if (applyCode) {
    appItem = await Application.findOne({ applyCode });
  } else {
    appItem = await Application.findById(id);
  }
  if (!appItem) return res.status(404).json({ message: '未找到申请' });
    
    const oldStatus = appItem.status;
    const oldFeedback = appItem.feedback;
    const oldNetworkType = appItem.networkType;
    const oldPackage = appItem.package;
    const oldCustomerType = appItem.customerType ? appItem.customerType.typeName : null;
    const oldCompanions = appItem.companions || [];
    
  if (status) appItem.status = status;
  if (feedback !== undefined) appItem.feedback = feedback;
  if (networkType !== undefined) appItem.networkType = networkType;
  
  // 更新签证类型相关字段
  if (visaType !== undefined) appItem.visaType = visaType;
  if (visaPrice !== undefined) appItem.visaPrice = visaPrice;
  if (visaCurrency !== undefined) appItem.visaCurrency = visaCurrency;
  
  // 更新基本信息字段
  if (name !== undefined) appItem.name = name;
  if (phone !== undefined) appItem.phone = phone;
  if (address !== undefined) appItem.address = address;
  if (wechat !== undefined) appItem.wechat = wechat;
  if (line !== undefined) appItem.line = line;
  if (email !== undefined) appItem.email = email;
  
  // 更新同行人信息
  if (companions !== undefined) {
    const oldCompanions = appItem.companions || [];
    const newCompanions = companions.filter(c => c && c.trim() !== ''); // 过滤空字符串
    appItem.companions = newCompanions;
    
    // 如果同行人数量发生变化，需要重新生成材料清单
    if (oldCompanions.length !== newCompanions.length && appItem.customerType && appItem.customerType.typeId) {
      console.log(`⚠️ 同行人数量变化: ${oldCompanions.length} -> ${newCompanions.length}，需要重新生成材料清单`);
      
      try {
        const Package = require('./models/Package');
        const packageInfo = await Package.findOne({ name: appItem.package });
        
        if (packageInfo) {
          const MaterialTemplate = require('./models/MaterialTemplate');
          const materialTemplate = await MaterialTemplate.findOne({ packageId: packageInfo._id });
          
          if (materialTemplate) {
            const customerTypeData = materialTemplate.customerTypes.find(ct => ct.typeId === appItem.customerType.typeId);
            
            if (customerTypeData && customerTypeData.materials && customerTypeData.materials.length > 0) {
              // 生成所有人员的材料清单
              const allPersons = [
                { id: 'main', name: appItem.name },
                ...newCompanions.map((name, idx) => ({ id: `companion_${idx}`, name }))
              ];
              
              const existingMaterials = appItem.materials || [];
              const newMaterials = [];
              
              customerTypeData.materials.forEach(materialTemplate => {
                allPersons.forEach(person => {
                  // 查找是否已有这个材料（根据materialId和personId匹配）
                  const existingMaterial = existingMaterials.find(m => 
                    m.materialId === materialTemplate.materialId && m.personId === person.id
                  );
                  
                  if (existingMaterial) {
                    // 保留已有材料（包括已上传的图片）
                    newMaterials.push({
                      ...existingMaterial,
                      personName: person.name, // 更新人员名称（可能有变化）
                      materialName: materialTemplate.name,
                      templateRequired: materialTemplate.required || false,
                      needsImage: materialTemplate.needsImage || false,
                      allowMultiple: materialTemplate.allowMultiple || false
                    });
                  } else {
                    // 添加新材料
                    newMaterials.push({
                      materialId: materialTemplate.materialId,
                      materialName: materialTemplate.name,
                      templateRequired: materialTemplate.required || false,
                      needsImage: materialTemplate.needsImage || false,
                      allowMultiple: materialTemplate.allowMultiple || false,
                      personId: person.id,
                      personName: person.name,
                      status: '未提交',
                      images: [],
                      submittedBy: '',
                      submittedAt: null
                    });
                  }
                });
              });
              
              appItem.materials = newMaterials;
              console.log(`✅ 已重新生成材料清单: ${newMaterials.length} 项`);
            }
          }
        }
      } catch (err) {
        console.error('❌ 重新生成材料清单失败:', err);
      }
    }
  }
  
  // 处理签证类型更换
  if (pkg !== undefined && packageChanged === true) {
    // 签证类型改变了，清空相关数据
    appItem.package = pkg;
    appItem.customerType = null; // 清空办理类型
    appItem.materials = []; // 清空材料清单
    appItem.questionsAnswers = []; // 清空问题答案
    console.log('✅ 签证类型已更换，已清空办理类型、材料清单和问题答案');
  } else if (pkg !== undefined) {
    appItem.package = pkg;
  }
  
  if (customerType !== undefined) {
    // 如果是更换办理类型，先清空问题答案（材料会在后面智能合并）
    if (customerTypeChanged === true) {
      appItem.questionsAnswers = []; // 清空问题答案
      console.log('✅ 办理类型更换，已清空原问题答案，材料将智能合并');
    }
    
    appItem.customerType = customerType;
    
    // 当更新customerType时，自动加载材料清单和问题模板
    if (customerType && customerType.typeId) {
      try {
        // 获取签证类型ID
        const Package = require('./models/Package');
        const packageInfo = await Package.findOne({ name: appItem.package });
        
        if (packageInfo) {
          // 1. 自动加载问题模板
          const QuestionTemplate = require('./models/QuestionTemplate');
          const questionTemplate = await QuestionTemplate.findOne({
            packageId: packageInfo._id,
            customerTypeId: customerType.typeId
          });
          
          if (questionTemplate && questionTemplate.questions && questionTemplate.questions.length > 0) {
            // 保留已有的答案，加载新的问题模板
            const existingAnswers = appItem.questionsAnswers || [];
            const fullQuestions = questionTemplate.questions.map(templateQuestion => {
              // 查找是否已有答案
              const existingAnswer = existingAnswers.find(qa => qa.questionId === templateQuestion.questionId);
              
              return {
                questionId: templateQuestion.questionId,
                questionText: templateQuestion.questionText,
                questionType: templateQuestion.questionType || 'personal',
                required: templateQuestion.required || false,
                helpText: templateQuestion.helpText || '',
                answer: existingAnswer ? existingAnswer.answer : '',
                answeredBy: existingAnswer ? existingAnswer.answeredBy : '',
                answeredAt: existingAnswer ? existingAnswer.answeredAt : null
              };
            });
            
            appItem.questionsAnswers = fullQuestions;
            console.log('✅ 已自动加载问题模板:', fullQuestions.length, '个问题');
          }
          
          // 2. 自动加载材料清单模板
          const MaterialTemplate = require('./models/MaterialTemplate');
          const materialTemplate = await MaterialTemplate.findOne({ packageId: packageInfo._id });
          
          if (materialTemplate) {
            const customerTypeData = materialTemplate.customerTypes.find(ct => ct.typeId === customerType.typeId);
            
            if (customerTypeData && customerTypeData.materials && customerTypeData.materials.length > 0) {
              // 生成所有人员的材料清单
              const allPersons = [
                { id: 'main', name: appItem.name },
                ...(appItem.companions || []).map((name, idx) => ({ id: `companion_${idx}`, name }))
              ];
              
              const existingMaterials = appItem.materials || [];
              const newMaterials = [];
              
              let preservedCount = 0; // 保留的材料数量
              
              customerTypeData.materials.forEach(materialTemplate => {
                allPersons.forEach(person => {
                  const materialId = `${materialTemplate.materialId}_${person.id}`;
                  
                  // 查找是否已有这个材料（根据materialId和personId匹配）
                  const existingMaterial = existingMaterials.find(m => 
                    m.materialId === materialTemplate.materialId && m.personId === person.id
                  );
                  
                  if (existingMaterial) {
                    // 保留已有材料（包括已上传的图片）
                    newMaterials.push({
                      ...existingMaterial,
                      materialName: materialTemplate.name, // 更新材料名称（可能有变化）
                      templateRequired: materialTemplate.required || false,
                      needsImage: materialTemplate.needsImage || false,
                      allowMultiple: materialTemplate.allowMultiple || false
                    });
                    if (existingMaterial.images && existingMaterial.images.length > 0) {
                      preservedCount++;
                    }
                  } else {
                    // 添加新材料
                    newMaterials.push({
                      materialId: materialTemplate.materialId,
                      materialName: materialTemplate.name,
                      templateRequired: materialTemplate.required || false,
                      needsImage: materialTemplate.needsImage || false,
                      allowMultiple: materialTemplate.allowMultiple || false,
                      personId: person.id,
                      personName: person.name,
                      status: '未提交',
                      images: [],
                      submittedBy: '',
                      submittedAt: null
                    });
                  }
                });
              });
              
              appItem.materials = newMaterials;
              
              if (customerTypeChanged === true && preservedCount > 0) {
                console.log(`✅ 已自动加载材料清单: ${newMaterials.length} 项，保留了 ${preservedCount} 项已上传的材料`);
              } else {
                console.log('✅ 已自动加载材料清单:', newMaterials.length, '项');
              }
            }
          }
        }
      } catch (templateError) {
        console.error('❌ 加载模板失败:', templateError);
        // 即使加载模板失败，也继续保存customerType
      }
    }
  }
  appItem.updatedAt = new Date();
    
    // 添加过程记录
    const changes = [];
    if (status && status !== oldStatus) {
      changes.push(`状态从"${oldStatus}"改为"${status}"`);
    }
    if (feedback !== undefined && feedback !== oldFeedback) {
      changes.push('更新了管理员反馈');
    }
    if (networkType !== undefined && networkType !== oldNetworkType) {
      changes.push(`网络类型从"${oldNetworkType || '未填写'}"改为"${networkType}"`);
    }
    if (pkg !== undefined && pkg !== oldPackage) {
      if (packageChanged === true) {
        changes.push(`签证类型从"${oldPackage}"更换为"${pkg}"，已清空原办理类型、材料清单和问题答案`);
      } else {
        changes.push(`套餐从"${oldPackage}"改为"${pkg}"`);
      }
    }
    if (customerType !== undefined) {
      const newTypeName = customerType ? customerType.typeName : '未选择';
      if (customerTypeChanged === true) {
        changes.push(`办理类型从"${oldCustomerType || '未选择'}"更换为"${newTypeName}"，已智能合并材料（保留相同材料的图片），已清空问题答案`);
      } else {
        changes.push(`办理类型从"${oldCustomerType || '未选择'}"改为"${newTypeName}"，已自动关联材料清单和问题模板`);
      }
    }
    if (companions !== undefined) {
      const newCompanions = companions.filter(c => c && c.trim() !== '');
      if (JSON.stringify(oldCompanions) !== JSON.stringify(newCompanions)) {
        const oldNames = oldCompanions.length > 0 ? oldCompanions.join('、') : '无';
        const newNames = newCompanions.length > 0 ? newCompanions.join('、') : '无';
        changes.push(`同行人从"${oldNames}"改为"${newNames}"`);
        if (oldCompanions.length !== newCompanions.length) {
          changes.push(`同行人数量变化（${oldCompanions.length} -> ${newCompanions.length}），已重新生成材料清单`);
        }
      }
    }
    
    if (changes.length > 0) {
      appItem.processLog.push({
        action: '管理员更新',
        description: changes.join('，'),
        timestamp: new Date()
      });
    }
    
  await appItem.save();
  
  // 状态变更邮件功能已移除，只保留手动发送功能
  
  // 转换为普通对象以便修改
  const appObj = appItem.toObject();
  
  // 填充 customerType 的完整数据（包括材料和问题模板）
  if (appObj.customerType && appObj.customerType.typeId) {
    const fullCustomerType = await populateCustomerType(appObj);
    if (fullCustomerType) {
      appObj.customerType = fullCustomerType;
    }
  }
  
  res.json(appObj);
  } catch (err) {
    console.error('更新申请失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 用户确认安装接口
app.put('/api/applications/:id/confirm', upload.any(), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, answers, modificationReason } = req.body;
    const files = req.files || [];
    
    console.log('收到材料提交请求:', { id, status, notes, answersCount: answers ? Object.keys(JSON.parse(answers || '{}')).length : 0, filesCount: files.length });
    
    // 检查ID格式是否有效
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的申请ID格式' });
    }
    
    let appItem = await Application.findById(id);
    if (!appItem) {
      return res.status(404).json({ message: '未找到申请' });
    }
    
    console.log('当前申请状态:', appItem.status, '办理类型:', appItem.customerType?.typeName);
    
    // 更新基本信息
    if (status) appItem.status = status;
    appItem.confirmTime = new Date();
    appItem.notes = notes || '';
    appItem.updatedAt = new Date();
    
    // 更新答案
    if (answers) {
      try {
        appItem.answers = JSON.parse(answers);
      } catch (e) {
        console.error('解析answers失败:', e);
      }
    }
    
    // 初始化materialFiles对象（如果不存在）
    if (!appItem.materialFiles) {
      appItem.materialFiles = {};
    }
    
    // 获取完整的客户类型信息（用于获取材料和问题模板）
    const fullCustomerType = await populateCustomerType(appItem);
    const materialTemplates = fullCustomerType?.materials || [];
    const questionTemplates = fullCustomerType?.questions || [];
    
    // 处理上传的材料文件
    if (files && files.length > 0) {
      // 初始化 materials 数组
      if (!appItem.materials) {
        appItem.materials = [];
      }
      
      files.forEach(file => {
        // 文件字段名格式：materials_materialId
        const match = file.fieldname.match(/^materials_(.+)$/);
        if (match) {
          const materialId = match[1];
          const filePath = '/uploads/' + file.filename;
          
          // 保存到 materialFiles（简化格式）
          if (!appItem.materialFiles[materialId]) {
            appItem.materialFiles[materialId] = [];
          }
          appItem.materialFiles[materialId].push(filePath);
          
          // 保存到 materials 数组（用于后台显示）
          const materialTemplate = materialTemplates.find(m => m.materialId === materialId);
          const materialName = materialTemplate ? materialTemplate.name : '未知材料';
          
          let materialRecord = appItem.materials.find(m => m.materialId === materialId && m.personId === 'main');
          if (materialRecord) {
            // 更新现有记录
            if (!materialRecord.images) {
              materialRecord.images = [];
            }
            materialRecord.images.push(filePath);
            materialRecord.status = '已提交';
            materialRecord.submittedAt = new Date();
          } else {
            // 创建新记录
            appItem.materials.push({
              materialId: materialId,
              materialName: materialName,
              personId: 'main',
              status: '已提交',
              images: [filePath],
              submittedBy: 'user',
              submittedAt: new Date()
            });
          }
        }
      });
    }
    
    // 同步答案到 questionsAnswers 数组（用于后台显示）
    if (appItem.answers && Object.keys(appItem.answers).length > 0) {
      if (!appItem.questionsAnswers) {
        appItem.questionsAnswers = [];
      }
      
      console.log('开始同步答案到questionsAnswers:');
      console.log('问题模板数量:', questionTemplates.length);
      console.log('问题模板:', questionTemplates.map(q => ({ id: q.questionId, text: q.question })));
      console.log('答案questionId列表:', Object.keys(appItem.answers));
      
      Object.keys(appItem.answers).forEach(questionId => {
        const answerValue = appItem.answers[questionId];
        
        // 去掉 _main 或 _comp0 等后缀来查找问题模板（兼容旧数据）
        const baseQuestionId = questionId.replace(/_main$|_comp\d+$/, '');
        const questionTemplate = questionTemplates.find(q => q.questionId === baseQuestionId);
        
        console.log(`查找问题 ${questionId} (基础ID: ${baseQuestionId}):`, questionTemplate ? '找到' : '未找到');
        if (questionTemplate) {
          console.log('  问题文本:', questionTemplate.question);
        }
        
        // 先用基础ID查找，再用完整ID查找
        let existingIndex = appItem.questionsAnswers.findIndex(q => q.questionId === baseQuestionId);
        if (existingIndex === -1) {
          existingIndex = appItem.questionsAnswers.findIndex(q => q.questionId === questionId);
        }
        
        const answerObj = {
          questionId: baseQuestionId,  // 使用基础ID，保持与问题模板一致
          questionText: questionTemplate ? questionTemplate.question : '问题',
          answer: answerValue,
          groupId: questionTemplate ? questionTemplate.groupId : '',
          groupName: questionTemplate ? questionTemplate.groupName : ''
        };
        
        if (existingIndex >= 0) {
          appItem.questionsAnswers[existingIndex] = answerObj;
        } else {
          appItem.questionsAnswers.push(answerObj);
        }
      });
    }
    
    console.log('更新后的材料信息:', {
      materialsCount: Object.keys(appItem.materialFiles || {}).length,
      answersCount: Object.keys(appItem.answers || {}).length,
      materialsArrayCount: appItem.materials?.length || 0,
      questionsArrayCount: appItem.questionsAnswers?.length || 0
    });
    
    // 准备过程记录
    const materialNames = [];
    if (fullCustomerType && fullCustomerType.materials) {
      fullCustomerType.materials.forEach(material => {
        if (appItem.materialFiles[material.materialId] && appItem.materialFiles[material.materialId].length > 0) {
          materialNames.push(`${material.name}(${appItem.materialFiles[material.materialId].length}张)`);
        }
      });
    }
    
    const answeredQuestions = [];
    if (fullCustomerType && fullCustomerType.questions) {
      fullCustomerType.questions.forEach(question => {
        if (appItem.answers && appItem.answers[question.questionId]) {
          answeredQuestions.push(question.question);  // populateCustomerType 返回的是 question 字段
        }
      });
    }
    
    // 更新状态为'待处理'（如果有新材料提交）
    if (files && files.length > 0) {
      appItem.status = '待处理';
      appItem.feedback = '';
      console.log('更新状态为待处理，并清空管理员反馈');
    }
    
    const processDescription = `用户提交材料：
办理类型：${appItem.customerType?.typeName || '未选择'}
上传的材料：${materialNames.length > 0 ? materialNames.join('、') : '无'}
回答的问题：${answeredQuestions.length > 0 ? answeredQuestions.length + '个' : '无'}
备注：${notes || '无'}${modificationReason ? '\n修改理由：' + modificationReason : ''}`;
    
    // 记录到过程日志
    appItem.processLog.push({
      action: '用户提交材料',
      description: processDescription,
      images: {},
      timestamp: new Date()
    });
    
    // 标记materialFiles和answers字段为已修改（对于Mixed类型字段必须这样做）
    appItem.markModified('materialFiles');
    appItem.markModified('answers');
    
    await appItem.save();
    console.log('保存成功，最终状态:', appItem.status);
    
    // 转换为普通对象以便修改
    const appObj = appItem.toObject();
    
    // 填充 customerType 的完整数据（包括材料和问题模板）
    if (appObj.customerType && appObj.customerType.typeId) {
      const fullCustomerType = await populateCustomerType(appObj);
      if (fullCustomerType) {
        appObj.customerType = fullCustomerType;
      }
    }
    
    res.json(appObj);
  } catch (err) {
    console.error('材料提交失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 客服审核材料接口
app.put('/api/applications/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewResult, feedback } = req.body; // reviewResult: 'approved' | 'rejected'
    
    let appItem = await Application.findById(id);
    if (!appItem) {
      return res.status(404).json({ message: '未找到申请' });
    }
    
    if (reviewResult === 'approved') {
      // 材料审核通过，状态改为处理中（开始实际处理工作）
      appItem.status = '处理中';
      // 只有当客服主动填写反馈时才设置
      if (feedback && feedback.trim()) {
        appItem.feedback = feedback;
      }
    } else if (reviewResult === 'rejected') {
      // 材料审核不通过，状态改为待处理
      appItem.status = '待处理';
      // 只有当客服主动填写反馈时才设置
      if (feedback && feedback.trim()) {
        appItem.feedback = feedback;
      }
    }
    
    appItem.updatedAt = new Date();
    
    // 添加过程记录
    const processDescription = reviewResult === 'approved' ? 
      '客服审核材料通过，开始处理安装申请' :
      `客服审核材料不通过：${feedback || '请重新提交材料'}`;
    
    appItem.processLog.push({
      action: '客服审核材料',
      description: processDescription,
      timestamp: new Date()
    });
    
    await appItem.save();
    
    // 状态变更邮件功能已移除，只保留手动发送功能
    
    // 转换为普通对象以便修改
    const appObj = appItem.toObject();
    
    // 填充 customerType 的完整数据（包括材料和问题模板）
    if (appObj.customerType && appObj.customerType.typeId) {
      const fullCustomerType = await populateCustomerType(appObj);
      if (fullCustomerType) {
        appObj.customerType = fullCustomerType;
      }
    }
    
    res.json(appObj);
  } catch (err) {
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 用户补充材料接口
app.put('/api/applications/:id/materials', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, additionalMaterials, contactPreference, notes } = req.body;
    
    let appItem = await Application.findById(id);
    if (!appItem) return res.status(404).json({ message: '未找到申请' });
    
    // 计算新版本号
    const currentVersion = appItem.materialHistory ? appItem.materialHistory.length + 1 : 1;
    
    // 保存到历史记录
    const historyEntry = {
      additionalMaterials: additionalMaterials || '',
      contactPreference: contactPreference || '',
      notes: notes || '',
      submitTime: new Date(),
      version: currentVersion
    };
    
    // 添加到历史记录
    if (!appItem.materialHistory) {
      appItem.materialHistory = [];
    }
    appItem.materialHistory.push(historyEntry);
    
    // 更新当前最新材料（主记录）
    if (status) appItem.status = status;
    appItem.additionalMaterials = additionalMaterials || '';
    appItem.contactPreference = contactPreference || '';
    appItem.notes = notes || '';
    appItem.updatedAt = new Date();
    
    // 添加过程记录
    const processDescription = `用户补充材料（第${currentVersion}次）：
联系方式偏好：${contactPreference || '未填写'}
补充材料说明：${additionalMaterials || '无说明'}
备注：${notes || '无备注'}`;
    
    appItem.processLog.push({
      action: '用户补充材料',
      description: processDescription,
      timestamp: new Date()
    });
    
  await appItem.save();
  
  // 转换为普通对象以便修改
  const appObj = appItem.toObject();
  
  // 填充 customerType 的完整数据（包括材料和问题模板）
  if (appObj.customerType && appObj.customerType.typeId) {
    const fullCustomerType = await populateCustomerType(appObj);
    if (fullCustomerType) {
      appObj.customerType = fullCustomerType;
    }
  }
  
  res.json(appObj);
  } catch (err) {
    console.error('补充材料提交失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 客户端提交材料和问题答案（新的动态表单系统）
app.put('/api/applications/:id/submit-materials', upload.any(), async (req, res) => {
  try {
    const { id } = req.params;
    const { questionsAnswers, materialsData } = req.body;
    
    const appItem = await Application.findById(id);
    if (!appItem) {
      return res.status(404).json({ message: '未找到申请' });
    }
    
    // 解析JSON字符串
    let parsedQuestions = [];
    let parsedMaterials = [];
    
    try {
      if (questionsAnswers) {
        parsedQuestions = typeof questionsAnswers === 'string' 
          ? JSON.parse(questionsAnswers) 
          : questionsAnswers;
      }
      if (materialsData) {
        parsedMaterials = typeof materialsData === 'string' 
          ? JSON.parse(materialsData) 
          : materialsData;
      }
    } catch (parseErr) {
      console.error('解析数据失败:', parseErr);
      return res.status(400).json({ message: '数据格式错误' });
    }
    
    // 更新问题答案
    if (parsedQuestions.length > 0) {
      appItem.questionsAnswers = parsedQuestions;
    }
    
    // 处理材料文件上传
    if (parsedMaterials.length > 0 && req.files) {
      const updatedMaterials = [];
      
      for (const materialData of parsedMaterials) {
        const materialId = materialData.materialId;
        const images = [];
        
        // 查找该材料的所有文件
        const materialFiles = req.files.filter(file => 
          file.fieldname.startsWith(`material_${materialId}_`)
        );
        
        // 保存文件路径
        materialFiles.forEach(file => {
          images.push('/uploads/' + file.filename);
        });
        
        updatedMaterials.push({
          materialId: materialData.materialId,
          materialName: materialData.materialName,
          templateRequired: materialData.templateRequired || false,
          status: '已提交',
          images: images,
          submittedBy: 'user',
          submittedAt: new Date()
        });
      }
      
      // 合并现有材料和新提交的材料
      if (!appItem.materials) {
        appItem.materials = [];
      }
      
      // 更新或添加材料
      updatedMaterials.forEach(newMaterial => {
        const existingIndex = appItem.materials.findIndex(
          m => m.materialId === newMaterial.materialId
        );
        
        if (existingIndex >= 0) {
          // 更新现有材料
          appItem.materials[existingIndex] = {
            ...appItem.materials[existingIndex],
            ...newMaterial,
            images: newMaterial.images
          };
        } else {
          // 添加新材料
          appItem.materials.push(newMaterial);
        }
      });
    }
    
    // 更新申请状态
    if (appItem.status === '待确认') {
      appItem.status = '处理中';
    }
    
    appItem.updatedAt = new Date();
    
    // 添加过程记录
    appItem.processLog.push({
      action: '用户提交材料和问题答案',
      description: `提交了 ${parsedQuestions.length} 个问题答案和 ${parsedMaterials.length} 份材料`,
      timestamp: new Date()
    });
    
    await appItem.save();
    
    // 转换为普通对象以便修改
    const appObj = appItem.toObject();
    
    // 填充 customerType 的完整数据（包括材料和问题模板）
    if (appObj.customerType && appObj.customerType.typeId) {
      const fullCustomerType = await populateCustomerType(appObj);
      if (fullCustomerType) {
        appObj.customerType = fullCustomerType;
      }
    }
    
    res.json({ 
      message: '提交成功', 
      application: appObj 
    });
  } catch (err) {
    console.error('提交材料和问题失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 管理员上传材料图片
app.post('/api/applications/:id/materials/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { materialId, materialName, personId, personName } = req.body;
    const files = req.files;
    
    console.log('📤 收到管理员上传材料请求:', { 
      id, 
      materialId, 
      materialName,
      personId, 
      personName, 
      filesCount: files?.length 
    });
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的申请ID格式' });
    }
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: '请选择要上传的文件' });
    }
    
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: '申请记录不存在' });
    }
    
    // 初始化 materials 数组（如果不存在）
    if (!application.materials) {
      application.materials = [];
      console.log('初始化 materials 数组');
    }
    
    console.log('📋 当前 materials 数组:', application.materials.map(m => ({
      materialId: m.materialId,
      personId: m.personId,
      personName: m.personName
    })));
    
    // 查找或创建材料记录 - 同时匹配materialId和personId
    let materialIndex = application.materials.findIndex(m => 
      m.materialId === materialId && m.personId === personId
    );
    
    console.log(`🔍 查找材料 (materialId=${materialId}, personId=${personId}):`, 
      materialIndex >= 0 ? `找到，索引=${materialIndex}` : '未找到，将创建新记录');
    
    if (materialIndex < 0) {
      // 如果材料不存在，创建新的
      const newMaterial = {
        materialId,
        materialName: materialName || '未命名材料',
        personId: personId || 'main',
        personName: personName || application.name,
        status: '已提交',
        images: [],
        submittedBy: 'admin',
        submittedAt: new Date()
      };
      application.materials.push(newMaterial);
      materialIndex = application.materials.length - 1;
      console.log('✅ 创建新材料记录:', newMaterial);
    }
    
    // 添加新上传的图片
    const newImages = files.map(file => `/uploads/${file.filename}`);
    const material = application.materials[materialIndex];
    material.images = material.images || [];
    material.images.push(...newImages);
    material.status = '已提交';
    material.submittedBy = 'admin';
    material.submittedAt = new Date();
    
    console.log(`✅ 添加 ${newImages.length} 张图片到材料，当前总图片数: ${material.images.length}`);
    
    application.updatedAt = new Date();
    
    // 添加操作记录
    application.processLog = application.processLog || [];
    application.processLog.push({
      action: '管理员上传材料',
      description: `管理员为"${personName || application.name}"上传了 ${files.length} 个文件到"${materialName}"`,
      timestamp: new Date()
    });
    
    // 标记 materials 字段为已修改（对于数组类型很重要）
    application.markModified('materials');
    
    console.log('💾 准备保存到数据库...');
    await application.save();
    console.log('✅ 保存成功！');
    
    console.log('✅ 材料上传成功:', { personId, personName, materialId, images: newImages });
    
    res.json({ 
      success: true,
      message: `成功上传 ${files.length} 个文件`,
      images: newImages,
      application 
    });
  } catch (err) {
    console.error('❌ 上传材料失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 管理员删除材料图片
app.delete('/api/applications/:id/materials/image', async (req, res) => {
  try {
    const { id } = req.params;
    const { materialId, personId, imageUrl } = req.body;
    
    console.log('🗑️ 收到删除图片请求:', { id, materialId, personId, imageUrl });
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的申请ID格式' });
    }
    
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: '申请记录不存在' });
    }
    
    // 查找材料（支持新旧两种 personId 格式）
    const currentPersonId = personId || 'main';
    const oldPersonId = currentPersonId === 'main' ? 'main' : currentPersonId.replace('comp', 'companion_');
    
    console.log('🔍 查找材料:', {
      materialId,
      currentPersonId,
      oldPersonId
    });
    
    // 先尝试新格式，再尝试旧格式
    let material = application.materials.find(m => 
      m.materialId === materialId && m.personId === currentPersonId
    );
    
    if (!material) {
      material = application.materials.find(m => 
        m.materialId === materialId && m.personId === oldPersonId
      );
      console.log('使用旧格式查找:', material ? '找到' : '未找到');
    } else {
      console.log('使用新格式查找: 找到');
    }
    
    if (!material) {
      console.log('❌ 材料不存在');
      console.log('现有材料:', application.materials.map(m => ({
        materialId: m.materialId,
        personId: m.personId,
        imagesCount: m.images?.length || 0
      })));
      return res.status(404).json({ message: '材料不存在' });
    }
    
    // 删除图片
    const imageIndex = material.images.indexOf(imageUrl);
    if (imageIndex > -1) {
      material.images.splice(imageIndex, 1);
      
      // 如果没有图片了，更新状态
      if (material.images.length === 0) {
        material.status = '未提交';
      }
      
      application.updatedAt = new Date();
      
      // 添加操作记录
      application.processLog = application.processLog || [];
      application.processLog.push({
        action: '管理员删除材料图片',
        description: `删除了"${material.materialName}"的图片`,
        timestamp: new Date()
      });
      
      // 标记 materials 字段为已修改
      application.markModified('materials');
      
      console.log('✅ 图片已从材料中删除，剩余图片数:', material.images.length);
      
      await application.save();
      
      // 删除服务器上的文件（可选）
      try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('✅ 文件已删除:', filePath);
        }
      } catch (fsErr) {
        console.log('⚠️ 文件删除失败:', fsErr.message);
      }
      
      console.log('✅ 图片删除成功');
      
      res.json({ 
        success: true,
        message: '图片删除成功',
        application 
      });
    } else {
      res.status(404).json({ message: '图片不存在' });
    }
  } catch (err) {
    console.error('❌ 删除图片失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 管理员更新问题答案
app.put('/api/applications/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    const { questionsAnswers } = req.body;
    
    console.log('收到更新问题答案请求:', { id, questionsCount: questionsAnswers?.length });
    
    // 检查ID格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的申请ID格式' });
    }
    
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: '申请记录不存在' });
    }
    
    // 更新问题答案
    application.questionsAnswers = questionsAnswers || [];
    application.updatedAt = new Date();
    
    // 添加操作记录
    application.processLog = application.processLog || [];
    application.processLog.push({
      action: '管理员更新问题答案',
      description: `更新了 ${questionsAnswers?.length || 0} 个问题答案`,
      timestamp: new Date()
    });
    
    await application.save();
    
    console.log('✅ 问题答案更新成功');
    
    // 转换为普通对象以便修改
    const appObj = application.toObject();
    
    // 填充 customerType 的完整数据（包括材料和问题模板）
    if (appObj.customerType && appObj.customerType.typeId) {
      const fullCustomerType = await populateCustomerType(appObj);
      if (fullCustomerType) {
        appObj.customerType = fullCustomerType;
      }
    }
    
    res.json({ 
      success: true,
      message: '问题答案更新成功', 
      application: appObj 
    });
  } catch (err) {
    console.error('❌ 更新问题答案失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 申请修改材料（支持动态材料系统）
app.post('/api/applications/:id/request-modification', upload.any(), async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, notes, modificationReason } = req.body;
    
    console.log('收到材料修改申请:', {
      id,
      hasAnswers: !!answers,
      hasNotes: !!notes,
      hasModificationReason: !!modificationReason,
      filesCount: req.files?.length || 0
    });
    
    // 打印所有文件的字段名
    if (req.files && req.files.length > 0) {
      console.log('文件字段名:', req.files.map(f => f.fieldname));
    }
    
    // 检查ID格式是否有效
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的申请ID格式' });
    }
    
    const appItem = await Application.findById(id);
    
    if (!appItem) {
      return res.status(404).json({ message: '申请记录不存在' });
    }
    
    if (!appItem.customerType) {
      return res.status(400).json({ message: '请等待工作人员为您选择办理类型后再提交材料' });
    }
    
    // 解析问题答案
    let parsedAnswers = {};
    if (answers) {
      try {
        parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers;
      } catch (err) {
        console.error('解析answers失败:', err);
      }
    }
    
    // 处理材料文件上传
    const updatedMaterials = [];
    if (req.files && req.files.length > 0) {
      // 获取完整的材料模板信息（包含材料名称）
      const fullCustomerType = await populateCustomerType(appItem);
      const materialTemplates = fullCustomerType?.materials || [];
      
      console.log('材料模板数量:', materialTemplates.length);
      console.log('材料模板:', materialTemplates.map(m => ({ id: m.materialId, name: m.name })));
      
      // 按材料ID和人员ID分组文件
      // 字段名格式: materials_materialId 或 materials_materialId_personId
      const filesByMaterial = {};
      req.files.forEach(file => {
        const match = file.fieldname.match(/^materials_(.+)$/);
        if (match) {
          const fullKey = match[1]; // 可能是 materialId 或 materialId_personId
          if (!filesByMaterial[fullKey]) {
            filesByMaterial[fullKey] = [];
          }
          filesByMaterial[fullKey].push('/uploads/' + file.filename);
        }
      });
      
      console.log('收到的材料文件:', Object.keys(filesByMaterial));
      
      // 为每个有文件的材料创建记录
      Object.keys(filesByMaterial).forEach(fullKey => {
        // 尝试从fullKey中提取materialId和personId
        // 格式可能是: materialId 或 materialId_personId
        let materialId = fullKey;
        let personId = 'main';
        let personName = appItem.name;
        
        // 检查是否包含personId（格式：materialId_personId）
        const parts = fullKey.split('_');
        console.log(`解析fullKey: ${fullKey}, parts:`, parts);
        
        if (parts.length >= 2) {
          // 最后一个部分可能是personId (main, comp0, comp1等)
          const lastPart = parts[parts.length - 1];
          console.log(`检查最后一部分: ${lastPart}`);
          
          if (lastPart === 'main' || lastPart.startsWith('comp')) {
            personId = lastPart;
            materialId = parts.slice(0, -1).join('_');
            
            console.log(`✅ 识别到personId: ${personId}, materialId: ${materialId}`);
            
            // 获取personName
            if (personId === 'main') {
              personName = appItem.name;
            } else {
              const compIndex = parseInt(personId.replace('comp', ''));
              personName = appItem.companions && appItem.companions[compIndex] 
                ? appItem.companions[compIndex] 
                : `同行人 ${compIndex + 1}`;
            }
          } else {
            console.log(`⚠️ 最后一部分不是personId，使用默认值main`);
          }
        } else {
          console.log(`⚠️ parts长度不足，使用默认值main`);
        }
        
        const materialTemplate = materialTemplates.find(m => m.materialId === materialId);
        const materialName = materialTemplate ? materialTemplate.name : '未知材料';
        
        console.log(`材料: ${fullKey} -> ID: ${materialId}, 名称: ${materialName}, 人员: ${personId} (${personName})`);
        
        updatedMaterials.push({
          materialId: materialId,
          materialName: materialName,
          personId: personId,
          personName: personName,
          status: '待审核',
          images: filesByMaterial[fullKey],
          submittedBy: 'user',
          submittedAt: new Date()
        });
      });
    }
    
    // 更新材料记录
    if (updatedMaterials.length > 0) {
      console.log(`📦 准备更新 ${updatedMaterials.length} 个材料到数据库`);
      
      if (!appItem.materials) {
        appItem.materials = [];
        console.log('初始化 materials 数组');
      }
      
      updatedMaterials.forEach((newMaterial, idx) => {
        console.log(`处理材料 ${idx + 1}:`, {
          materialId: newMaterial.materialId,
          materialName: newMaterial.materialName,
          personId: newMaterial.personId,
          personName: newMaterial.personName,
          imagesCount: newMaterial.images.length
        });
        
        const existingIndex = appItem.materials.findIndex(
          m => m.materialId === newMaterial.materialId && m.personId === newMaterial.personId
        );
        
        console.log(`  查找现有材料 (materialId=${newMaterial.materialId}, personId=${newMaterial.personId}):`, 
          existingIndex >= 0 ? `找到，索引=${existingIndex}` : '未找到，将新增');
        
        if (existingIndex >= 0) {
          // 更新现有材料
          const oldImagesCount = appItem.materials[existingIndex].images?.length || 0;
          appItem.materials[existingIndex] = {
            ...appItem.materials[existingIndex],
            ...newMaterial,
            images: [...(appItem.materials[existingIndex].images || []), ...newMaterial.images]
          };
          console.log(`  ✅ 已更新，图片数量: ${oldImagesCount} -> ${appItem.materials[existingIndex].images.length}`);
        } else {
          // 添加新材料
          appItem.materials.push(newMaterial);
          console.log(`  ✅ 已添加到 materials 数组，当前总数: ${appItem.materials.length}`);
        }
      });
      
      console.log(`📋 更新后的 materials 数组:`, appItem.materials.map(m => ({
        materialId: m.materialId,
        materialName: m.materialName,
        personId: m.personId,
        personName: m.personName,
        imagesCount: m.images?.length || 0
      })));
    }
    
    // 更新问题答案（同时保存到两个字段以保持兼容）
    if (parsedAnswers && Object.keys(parsedAnswers).length > 0) {
      // 保存到简化格式 answers
      if (!appItem.answers) {
        appItem.answers = {};
      }
      appItem.answers = {
        ...appItem.answers,
        ...parsedAnswers
      };
      
      // 同时保存到 questionsAnswers 数组格式（用于后台显示）
      // 获取问题模板以获取问题文本
      const fullCustomerType = await populateCustomerType(appItem);
      const questionTemplates = fullCustomerType?.questions || [];
      
      console.log('【request-modification】开始同步答案:');
      console.log('问题模板数量:', questionTemplates.length);
      console.log('问题模板:', questionTemplates.map(q => ({ id: q.questionId, text: q.question })));
      console.log('答案列表:', Object.keys(parsedAnswers));
      
      if (!appItem.questionsAnswers) {
        appItem.questionsAnswers = [];
      }
      
      // 更新或添加答案到数组
      Object.keys(parsedAnswers).forEach(questionId => {
        const answerValue = parsedAnswers[questionId];
        
        // 去掉 _main 或 _comp0 等后缀来查找问题模板（兼容旧数据）
        const baseQuestionId = questionId.replace(/_main$|_comp\d+$/, '');
        const questionTemplate = questionTemplates.find(q => q.questionId === baseQuestionId);
        
        console.log(`  问题 ${questionId} (基础ID: ${baseQuestionId}):`, questionTemplate ? `找到 - ${questionTemplate.question}` : '未找到');
        
        // 查找是否已存在该问题的答案
        // 先用基础ID查找（因为原始问题模板使用的是基础ID）
        let existingIndex = appItem.questionsAnswers.findIndex(q => q.questionId === baseQuestionId);
        
        // 如果用基础ID没找到，再用完整ID查找
        if (existingIndex === -1) {
          existingIndex = appItem.questionsAnswers.findIndex(q => q.questionId === questionId);
        }
        
        const answerObj = {
          questionId: baseQuestionId,  // 使用基础ID，保持与问题模板一致
          questionText: questionTemplate ? questionTemplate.question : '问题',
          answer: answerValue,
          groupId: questionTemplate ? questionTemplate.groupId : '',
          groupName: questionTemplate ? questionTemplate.groupName : ''
        };
        
        console.log(`  保存的答案对象:`, { questionId: answerObj.questionId, questionText: answerObj.questionText, answer: answerValue });
        
        if (existingIndex >= 0) {
          // 更新现有答案
          appItem.questionsAnswers[existingIndex] = answerObj;
          console.log(`  更新现有答案，索引: ${existingIndex}`);
        } else {
          // 添加新答案
          appItem.questionsAnswers.push(answerObj);
          console.log(`  添加新答案`);
        }
      });
      
      console.log('已保存问题答案:', Object.keys(parsedAnswers).length, '个');
      console.log('questionsAnswers数组:', appItem.questionsAnswers.map(q => ({ id: q.questionId, text: q.questionText })));
    }
    
    // 更新备注
    if (notes) {
      appItem.notes = notes;
    }
    
    // 记录修改申请到 processLog
    const materialsSummary = updatedMaterials.length > 0 
      ? updatedMaterials.map(m => m.materialName).join('、') 
      : '无新材料';
    const answersSummary = Object.keys(parsedAnswers).length > 0 
      ? `回答了${Object.keys(parsedAnswers).length}个问题` 
      : '无问题回答';
    
    appItem.processLog.push({
      action: '用户补充材料',
      description: `用户补充材料
修改理由：${modificationReason || '未填写'}
补充材料：${materialsSummary}
${answersSummary}
备注：${notes || '无'}`,
      timestamp: new Date()
    });
    
    // 补交材料时，状态设为处理中
    if (appItem.status === '待确认' || appItem.status === '需补充材料') {
      appItem.status = '处理中';
    }
    appItem.updatedAt = new Date();
    
    console.log('💾 准备保存到数据库...');
    console.log('  materials数组长度:', appItem.materials?.length || 0);
    if (appItem.materials && appItem.materials.length > 0) {
      console.log('  materials详情:', appItem.materials.map(m => ({
        materialId: m.materialId,
        materialName: m.materialName,
        personId: m.personId,
        personName: m.personName,
        imagesCount: m.images?.length || 0
      })));
    }
    
    // 标记materials字段为已修改（对于数组类型字段需要这样做）
    appItem.markModified('materials');
    
    await appItem.save();
    
    console.log('✅ 材料修改申请已保存:', {
      id: appItem._id,
      materialsCount: updatedMaterials.length,
      answersCount: Object.keys(parsedAnswers).length
    });
    
    res.json({ 
      message: '修改申请已提交',
      materialsCount: updatedMaterials.length,
      answersCount: Object.keys(parsedAnswers).length
    });
  } catch (err) {
    console.error('记录修改申请失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 申请取消订单
app.post('/api/applications/:id/request-cancellation', async (req, res) => {
  try {
    const { reason } = req.body;
    const { id } = req.params;
    
    // 检查ID格式是否有效
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '无效的申请ID格式' });
    }
    
    const appItem = await Application.findById(id);
    
    if (!appItem) {
      return res.status(404).json({ message: '申请记录不存在' });
    }
    
    // 记录取消申请到 processLog
    appItem.processLog.push({
      action: '申请取消订单',
      description: `用户申请取消订单，原因：${reason}`,
      timestamp: new Date()
    });
    
    await appItem.save();
    res.json({ message: '取消申请已记录' });
  } catch (err) {
    console.error('记录取消申请失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 审核修改申请
app.post('/api/applications/:id/review-modification', async (req, res) => {
  try {
    const { action, adminReason } = req.body;
    const appItem = await Application.findById(req.params.id);
    if (!appItem) {
      return res.status(404).json({ message: '申请记录不存在' });
    }
    if (action === 'approve' && appItem.pendingModification) {
      const pendingMod = appItem.pendingModification;
      appItem.japaneseName = pendingMod.japaneseName;
      appItem.idCardFront = pendingMod.idCardFront;
      appItem.idCardBack = pendingMod.idCardBack;
      appItem.passportPhoto = pendingMod.passportPhoto;
      appItem.other = pendingMod.other;
      appItem.notes = pendingMod.notes;
      appItem.status = '处理中';
      appItem.pendingModification = null;
      appItem.processLog.push({
        action: '审核修改申请',
        description: `客服同意修改申请，原因：${adminReason}。材料已被更新。`,
        timestamp: new Date()
      });
    } else if (action === 'reject') {
      appItem.pendingModification = null;
      appItem.status = '待确认';
      appItem.processLog.push({
        action: '审核修改申请',
        description: `客服拒绝修改申请，原因：${adminReason}`,
        timestamp: new Date()
      });
    }
    await appItem.save();
    res.json({ message: '审核完成' });
  } catch (err) {
    console.error('审核修改申请失败:', err);
    res.status(500).json({ message: '服务器错误', error: err.message, stack: err.stack });
  }
});

// 审核取消申请
app.post('/api/applications/:id/review-cancellation', async (req, res) => {
  try {
    const { action, adminReason } = req.body;
    const appItem = await Application.findById(req.params.id);
    
    if (!appItem) {
      return res.status(404).json({ message: '申请记录不存在' });
    }
    
    if (action === 'approve') {
      // 同意取消，状态改为已取消
      appItem.status = '已取消';
      appItem.processLog.push({
        action: '审核取消申请',
        description: `客服同意取消申请，原因：${adminReason}`,
        timestamp: new Date()
      });
    } else {
      // 拒绝取消，保持当前状态
      appItem.processLog.push({
        action: '审核取消申请',
        description: `客服拒绝取消申请，原因：${adminReason}`,
        timestamp: new Date()
      });
    }
    
    await appItem.save();
    res.json({ message: '审核完成' });
  } catch (err) {
    console.error('审核取消申请失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 用户/管理员提交消息
app.post('/api/applications/:id/message', async (req, res) => {
  try {
    const { role, content } = req.body;
    if (!role || !content) {
      return res.status(400).json({ message: '角色和内容不能为空' });
    }
    const appItem = await Application.findById(req.params.id);
    if (!appItem) {
      return res.status(404).json({ message: '申请记录不存在' });
    }
    appItem.messages = appItem.messages || [];
    appItem.messages.push({ role, content, timestamp: new Date() });
    await appItem.save();
    res.json({ message: '消息已保存' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 查询详情时返回messages（已包含在原有详情接口中，无需额外处理）


// 删除申请接口（软删除）
app.delete('/api/applications/:id', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id } = req.params;
    const { applyCode } = req.query;
    let appItem = null;
    if (applyCode) {
      appItem = await Application.findOne({ applyCode });
    } else {
      appItem = await Application.findById(id);
    }
    if (!appItem) return res.status(404).json({ message: '未找到申请' });

    // 使用直接更新以绕过字段校验（历史数据可能缺少必填字段）
    await Application.updateOne({ _id: appItem._id }, { $set: { deleted: true } });

    console.log(`✅ 订单删除成功: ${appItem._id}, 申请编码: ${appItem.applyCode}`);
    res.json({ success: true, message: '删除成功', id: String(appItem._id), applyCode: appItem.applyCode });
  } catch (err) {
    console.error('删除申请失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});
// 彻底删除接口（回收站）
app.delete('/api/applications/:id/permanent', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id } = req.params;
    const { applyCode } = req.query;
    let result = null;
    if (applyCode) {
      result = await Application.findOneAndDelete({ applyCode });
    } else {
      // 先查出记录拿到applyCode用于提示
      const appItem = await Application.findById(id);
      if (!appItem) return res.status(404).json({ message: '未找到申请' });
      result = await Application.findByIdAndDelete(id);
      result = result || appItem; // 兜底保持applyCode
    }
    if (!result) return res.status(404).json({ message: '未找到申请' });
    
    console.log(`✅ 订单彻底删除成功: ${result._id}, 申请编码: ${result.applyCode}`);
    res.json({ success: true, message: '彻底删除成功', id: String(result._id), applyCode: result.applyCode });
  } catch (err) {
    console.error('彻底删除申请失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 恢复订单接口（从回收站恢复）
app.put('/api/applications/:id/restore', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id } = req.params;
    const appItem = await Application.findById(id);
    if (!appItem) return res.status(404).json({ message: '未找到申请' });

    // 恢复订单：将deleted字段设置为false
    await Application.updateOne({ _id: appItem._id }, { $set: { deleted: false } });

    console.log(`✅ 订单恢复成功: ${appItem._id}, 申请编码: ${appItem.applyCode}`);
    res.json({ success: true, message: '订单恢复成功', id: String(appItem._id), applyCode: appItem.applyCode });
  } catch (err) {
    console.error('恢复订单失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// FAQ接口
// 获取所有FAQ
app.get('/api/faqs', async (req, res) => {
  const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
  res.json(faqs);
});
// 新增FAQ
app.post('/api/faqs', async (req, res) => {
  const { question, answer, order, visible } = req.body;
  const faq = new FAQ({ question, answer, order, visible });
  await faq.save();
  res.json(faq);
});
// 修改FAQ
app.put('/api/faqs/:id', async (req, res) => {
  const { id } = req.params;
  const { question, answer, order, visible } = req.body;
  const faq = await FAQ.findByIdAndUpdate(id, { question, answer, order, visible }, { new: true });
  res.json(faq);
});
// 删除FAQ
app.delete('/api/faqs/:id', async (req, res) => {
  const { id } = req.params;
  await FAQ.findByIdAndDelete(id);
  res.json({ success: true });
});

// 公告栏接口
// 获取所有公告
app.get('/api/notices', async (req, res) => {
  const notices = await Notice.find().sort({ createdAt: -1 });
  res.json(notices);
});
// 新增公告
app.post('/api/notices', async (req, res) => {
  const { title, content, visible } = req.body;
  const notice = new Notice({ title, content, visible });
  await notice.save();
  res.json(notice);
});
// 修改公告
app.put('/api/notices/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, visible } = req.body;
  const notice = await Notice.findByIdAndUpdate(id, { title, content, visible }, { new: true });
  res.json(notice);
});
// 删除公告
app.delete('/api/notices/:id', async (req, res) => {
  const { id } = req.params;
  await Notice.findByIdAndDelete(id);
  res.json({ success: true });
});

// 轮播图接口
// 获取所有轮播图
app.get('/api/carousels', async (req, res) => {
  const carousels = await Carousel.find().sort({ order: 1, createdAt: -1 });
  res.json(carousels);
});
// 上传轮播图
app.post('/api/carousels', upload.single('image'), async (req, res) => {
  const { order = 0, visible = true, position = 'center' } = req.body;
  if (!req.file) return res.status(400).json({ message: '请上传图片' });
  const imageUrl = '/uploads/' + req.file.filename;
  const carousel = new Carousel({ imageUrl, order, visible, position });
  await carousel.save();
  res.json(carousel);
});
// 编辑轮播图（顺序、显示、显示区域）
app.put('/api/carousels/:id', async (req, res) => {
  const { id } = req.params;
  const { order, visible, position } = req.body;
  const carousel = await Carousel.findByIdAndUpdate(id, { order, visible, position }, { new: true });
  res.json(carousel);
});
// 删除轮播图
app.delete('/api/carousels/:id', async (req, res) => {
  const { id } = req.params;
  const carousel = await Carousel.findById(id);
  if (!carousel) return res.status(404).json({ message: '未找到轮播图' });
  // 删除图片文件
  const filePath = path.join(uploadDir, path.basename(carousel.imageUrl));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await Carousel.findByIdAndDelete(id);
  res.json({ success: true });
});

// Footer 获取
app.get('/api/footer', async (req, res) => {
  let footer = await Footer.findOne();
  if (!footer) {
    // 初始化一个默认footer
    footer = await Footer.create({
      about: [{ title: '', content: '' }],
      companyInfo: [{ title: '', content: '' }],
      contacts: '',
      qrcodes: []
    });
  }
  res.json(footer);
});
// Footer 更新
app.put('/api/footer', async (req, res) => {
  const { about, companyInfo, contacts, qrcodes } = req.body;
  let footer = await Footer.findOne();
  if (!footer) {
    footer = new Footer();
  }
  footer.about = about;
  footer.companyInfo = companyInfo;
  footer.contacts = contacts;
  footer.qrcodes = qrcodes;
  await footer.save();
  res.json(footer);
});
// Footer 二维码图片上传
app.post('/api/footer/qrcode', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: '请上传图片' });
  const imageUrl = '/uploads/' + req.file.filename;
  res.json({ imageUrl });
});

// 产品简介/公司介绍接口
// 获取产品简介
app.get('/api/introduction', async (req, res) => {
  let introduction = await Introduction.findOne();
  if (!introduction) {
    // 初始化一个默认的产品简介
    introduction = await Introduction.create({
      title: '关于我们',
      sections: [
        {
          title: '我们的愿景',
          content: '我们致力于为客户提供最优质的服务和产品。',
          imageUrl: '',
          order: 0,
          visible: true,
          layout: 'left-image'
        }
      ],
      visible: true
    });
  }
  res.json(introduction);
});

// 更新产品简介
app.put('/api/introduction', async (req, res) => {
  // 验证token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '未提供认证token' });
  }
  
  try {
    jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return res.status(401).json({ message: 'token无效' });
  }
  
  const { title, sections, visible } = req.body;
  let introduction = await Introduction.findOne();
  if (!introduction) {
    introduction = new Introduction();
  }
  introduction.title = title;
  introduction.sections = sections;
  introduction.visible = visible;
  introduction.updatedAt = new Date();
  await introduction.save();
  res.json(introduction);
});

// 上传产品简介图片
app.post('/api/introduction/image', upload.single('image'), async (req, res) => {
  try {
    // 验证token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: '请上传图片' });
    }
    
    console.log('收到图片上传请求:', req.file.originalname);
    const imageUrl = '/uploads/' + req.file.filename;
    console.log('图片保存路径:', imageUrl);
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('图片上传处理错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 套餐接口
// 获取所有套餐
app.get('/api/packages', async (req, res) => {
  const packages = await Package.find({ visible: true }).sort({ order: 1, createdAt: -1 });
  res.json(packages);
});

// 获取单个套餐详情
app.get('/api/packages/:id', async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    if (!package) {
      return res.status(404).json({ message: '套餐不存在' });
    }
    res.json(package);
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 新增套餐（需要管理员权限）
app.post('/api/packages', upload.single('image'), async (req, res) => {
  try {
    // 验证token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { name, speed, price, originalPrice, visaTypes, currency, description, features, details, order, visible } = req.body;
    console.log('接收到的数据:', { name, speed, visaTypes, price, originalPrice, currency });
    
    const imageUrl = req.file ? '/uploads/' + req.file.filename : '';
    
    const package = new Package({
      name,
      speed,
      price: price ? Number(price) : undefined,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      visaTypes: visaTypes ? JSON.parse(visaTypes) : [],
      currency: currency || 'CNY',
      description,
      features: features ? JSON.parse(features) : [],
      details,
      imageUrl,
      order: Number(order) || 0,
      visible: visible === 'true'
    });
    
    await package.save();
    res.json(package);
  } catch (err) {
    console.error('新增套餐失败:', err);
    console.error('错误详情:', err.message);
    console.error('错误堆栈:', err.stack);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 修改套餐（需要管理员权限）
app.put('/api/packages/:id', upload.single('image'), async (req, res) => {
  try {
    // 验证token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { name, speed, price, originalPrice, visaTypes, currency, description, features, details, order, visible } = req.body;
    const updateData = {
      name,
      speed,
      price: price ? Number(price) : undefined,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      visaTypes: visaTypes ? JSON.parse(visaTypes) : [],
      currency: currency || 'CNY',
      description,
      features: features ? JSON.parse(features) : [],
      details,
      order: Number(order) || 0,
      visible: visible === 'true',
      updatedAt: new Date()
    };
    
    if (req.file) {
      updateData.imageUrl = '/uploads/' + req.file.filename;
    }
    
    const package = await Package.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(package);
  } catch (err) {
    console.error('修改套餐失败:', err);
    console.error('错误详情:', err.message);
    console.error('错误堆栈:', err.stack);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 删除套餐（需要管理员权限）
app.delete('/api/packages/:id', async (req, res) => {
  try {
    // 验证token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const package = await Package.findById(req.params.id);
    if (!package) {
      return res.status(404).json({ message: '套餐不存在' });
    }
    
    // 删除图片文件
    if (package.imageUrl) {
      const filePath = path.join(uploadDir, path.basename(package.imageUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Package.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('删除套餐失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 手动发送状态变更邮件接口（需要管理员权限）
app.post('/api/applications/:id/send-status-email', async (req, res) => {
  try {
    // 验证token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id } = req.params;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: '未找到申请' });
    }

    // 导入手动发送邮件函数
    const { sendManualStatusEmail } = require('./utils/emailHelpers');
    
    // 发送邮件
    const emailResult = await sendManualStatusEmail(id, application);
    
    if (emailResult.success) {
      // 记录手动发送日志
      application.emailLog = application.emailLog || [];
      application.emailLog.push({ status: application.status, type: 'manual', sentAt: new Date() });
      await application.save();
      res.json({
        success: true,
        message: '状态邮件发送成功',
        data: emailResult
      });
    } else {
      res.status(500).json({
        success: false,
        message: '状态邮件发送失败',
        error: emailResult.message
      });
    }
    
  } catch (err) {
    console.error('手动发送状态邮件失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 发送材料提醒邮件接口（需要管理员权限）
app.post('/api/applications/:id/send-material-reminder', async (req, res) => {
  try {
    // 验证token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id } = req.params;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: '未找到申请' });
    }

    if (!application.customerType) {
      return res.status(400).json({ 
        success: false,
        message: '请先为客户选择办理类型' 
      });
    }

    if (!application.email) {
      return res.status(400).json({ 
        success: false,
        message: '客户邮箱不存在' 
      });
    }
    
    console.log('准备发送材料提醒邮件:', {
      applicationId: id,
      email: application.email,
      customerType: application.customerType?.typeName,
      package: application.package,
      visaType: application.visaType || '未填写',
      visaPrice: application.visaPrice || 0,
      visaCurrency: application.visaCurrency || 'CNY',
      applyCode: application.applyCode
    });

    // 生成免验证查询token（7天有效）
    const queryToken = jwt.sign({
      email: application.email,
      name: application.name,
      applyCode: application.applyCode,
      queryType: 'code',
      verified: true,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    }, config.jwtSecret);

    const webOrigin = process.env.PUBLIC_WEB_ORIGIN || 'http://localhost:3000';
    const linkUrl = `${webOrigin}/?page=status&token=${encodeURIComponent(queryToken)}&open=materials`;

    // 创建邮件传输器
    const { createTransporter } = require('./utils/transporter');
    const transporter = await createTransporter();
    
    // 邮件内容
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .info-box { background: #fff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #764ba2; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .highlight { color: #667eea; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 需要补充材料</h1>
          </div>
          <div class="content">
            <p>尊敬的 <strong>${application.name}</strong> 您好！</p>
            
            <p>您的签证申请材料欠缺，请尽快补充所需材料，以便我们为您加快办理进度。</p>
            
            <div class="info-box">
              <p><strong>📌 申请信息</strong></p>
              <p><strong>申请编码：</strong><span class="highlight" style="color: #1976d2; font-weight: bold;">${application.applyCode}</span></p>
              <p><strong>签证套餐：</strong><span class="highlight" style="background: #e3f2fd; color: #1565c0; padding: 3px 10px; border-radius: 12px; font-size: 13px; display: inline-block;">${application.package || '未填写'}</span></p>
              <p><strong>签证次数：</strong><span class="highlight" style="background: #fff3cd; color: #856404; padding: 3px 10px; border-radius: 12px; font-size: 13px; display: inline-block;">${application.visaType || '未填写'}</span></p>
              <p><strong>办理价格：</strong><span class="highlight" style="background: #d4edda; color: #155724; padding: 3px 10px; border-radius: 12px; font-size: 13px; display: inline-block;">${application.visaPrice && application.visaPrice > 0 ? `${application.visaCurrency === 'CNY' ? '¥' : application.visaCurrency === 'JPY' ? '¥' : application.visaCurrency === 'USD' ? '$' : '€'} ${application.visaPrice} (${application.visaCurrency || 'CNY'})` : '未填写'}</span></p>
              <p><strong>办理类型：</strong><span class="highlight" style="background: #d1ecf1; color: #0c5460; padding: 3px 10px; border-radius: 12px; font-size: 13px; display: inline-block;">${application.customerType && application.customerType.typeName ? application.customerType.typeName : '未填写'}</span></p>
            </div>

            <div class="info-box" style="border-left-color: #f59e0b;">
              <p><strong>⚠️ 重要提示</strong></p>
              <p>• 请准备好相关材料的清晰照片或扫描件</p>
              <p>• 请如实填写所有问题</p>
              <p>• 如有疑问，请及时联系我们的客服团队</p>
            </div>

            <div style="text-align: center;">
              <a href="${linkUrl}" class="button">点击立刻补充材料/查看进度</a>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              此链接7天内有效，点击后可直接查看需要提交的材料清单和问题。
            </p>
          </div>
          <div class="footer">
            <p>此邮件由系统发送，请勿直接回复。如有疑问，请联系客服。</p>
            <p>© ${new Date().getFullYear()} 签证服务系统</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // 发送邮件
    const mailOptions = {
      from: process.env.EMAIL_USER || 'jishu2020_service@163.com',
      to: application.email,
      subject: `📋 【${application.package}】需要补充材料 - ${application.applyCode}`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`✅ 材料提醒邮件发送成功: ${application.email}`);
    
    res.json({
      success: true,
      message: '材料提醒邮件发送成功'
    });
    
  } catch (err) {
    console.error('发送材料提醒邮件失败:', err);
    console.error('错误详情:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      command: err.command
    });
    res.status(500).json({ 
      success: false,
      message: '邮件发送失败: ' + err.message,
      error: err.message 
    });
  }
});

// 管理员备注相关接口
// 添加管理员备注
app.post('/api/applications/:id/admin-notes', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: '备注内容不能为空' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: '未找到申请' });
    }

    // 添加新备注
    application.adminNotes = application.adminNotes || [];
    application.adminNotes.push({
      content: content.trim(),
      createdAt: new Date()
    });

    await application.save();
    
    res.json({
      success: true,
      message: '备注添加成功',
      adminNotes: application.adminNotes
    });
    
  } catch (err) {
    console.error('添加管理员备注失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 获取管理员备注列表
app.get('/api/applications/:id/admin-notes', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id } = req.params;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: '未找到申请' });
    }

    res.json({
      success: true,
      adminNotes: application.adminNotes || []
    });
    
  } catch (err) {
    console.error('获取管理员备注失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 删除管理员备注
app.delete('/api/applications/:id/admin-notes/:noteId', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id, noteId } = req.params;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: '未找到申请' });
    }

    // 删除指定备注
    application.adminNotes = application.adminNotes.filter(note => note._id.toString() !== noteId);
    await application.save();
    
    res.json({
      success: true,
      message: '备注删除成功',
      adminNotes: application.adminNotes
    });
    
  } catch (err) {
    console.error('删除管理员备注失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// ==================== 账单明细管理API ====================

// 添加支付记录
app.post('/api/applications/:id/billing/payments', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id } = req.params;
    const { amount, paymentDate, payerName, note } = req.body;
    
    if (!amount || !paymentDate || !payerName) {
      return res.status(400).json({ message: '金额、支付时间和支付人不能为空' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: '未找到申请' });
    }

    // 初始化billing对象
    if (!application.billing) {
      application.billing = { payments: [], cost: { amount: 0 } };
    }
    if (!application.billing.payments) {
      application.billing.payments = [];
    }

    // 添加新支付记录
    const newPayment = {
      paymentId: `PAY_${Date.now()}`,
      amount: parseFloat(amount),
      paymentDate: new Date(paymentDate),
      payerName: payerName.trim(),
      note: note ? note.trim() : '',
      createdAt: new Date()
    };
    
    application.billing.payments.push(newPayment);
    await application.save();
    
    res.json({
      success: true,
      message: '支付记录添加成功',
      billing: application.billing
    });
    
  } catch (err) {
    console.error('添加支付记录失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 删除支付记录
app.delete('/api/applications/:id/billing/payments/:paymentId', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id, paymentId } = req.params;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: '未找到申请' });
    }

    if (!application.billing || !application.billing.payments) {
      return res.status(404).json({ message: '未找到支付记录' });
    }

    // 删除指定支付记录
    application.billing.payments = application.billing.payments.filter(
      payment => payment.paymentId !== paymentId
    );
    await application.save();
    
    res.json({
      success: true,
      message: '支付记录删除成功',
      billing: application.billing
    });
    
  } catch (err) {
    console.error('删除支付记录失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 更新成本
app.put('/api/applications/:id/billing/cost', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id } = req.params;
    const { amount, note } = req.body;
    
    if (amount === undefined || amount === null) {
      return res.status(400).json({ message: '成本金额不能为空' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: '未找到申请' });
    }

    // 初始化billing对象
    if (!application.billing) {
      application.billing = { payments: [], cost: { amount: 0 } };
    }
    if (!application.billing.cost) {
      application.billing.cost = { amount: 0 };
    }

    // 更新成本
    application.billing.cost.amount = parseFloat(amount);
    application.billing.cost.note = note ? note.trim() : '';
    application.billing.cost.updatedAt = new Date();
    
    await application.save();
    
    res.json({
      success: true,
      message: '成本更新成功',
      billing: application.billing
    });
    
  } catch (err) {
    console.error('更新成本失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 获取账单汇总
app.get('/api/applications/:id/billing', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id } = req.params;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: '未找到申请' });
    }

    // 初始化billing对象
    if (!application.billing) {
      application.billing = { payments: [], cost: { amount: 0 } };
    }

    // 计算汇总
    const totalIncome = (application.billing.payments || []).reduce(
      (sum, payment) => sum + (payment.amount || 0), 
      0
    );
    const totalCost = application.billing.cost?.amount || 0;
    const profit = totalIncome - totalCost;
    const profitRate = totalIncome > 0 ? (profit / totalIncome * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      billing: application.billing,
      summary: {
        totalIncome,
        totalCost,
        profit,
        profitRate
      }
    });
    
  } catch (err) {
    console.error('获取账单汇总失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 订单结算（仅管理员）
app.post('/api/applications/:id/settle', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: '未找到订单' 
      });
    }

    if (application.settled) {
      return res.status(400).json({ 
        success: false,
        message: '订单已经结算过了' 
      });
    }

    // 标记为已结算
    application.settled = true;
    application.settledAt = new Date();
    application.settledBy = req.user._id;
    
    await application.save();

    res.json({
      success: true,
      message: '订单结算成功',
      data: {
        settled: application.settled,
        settledAt: application.settledAt
      }
    });
    
  } catch (err) {
    console.error('订单结算失败:', err);
    res.status(500).json({ 
      success: false,
      message: '服务器错误: ' + err.message 
    });
  }
});

// 取消订单结算（仅管理员）
app.post('/api/applications/:id/unsettle', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: '未找到订单' 
      });
    }

    if (!application.settled) {
      return res.status(400).json({ 
        success: false,
        message: '订单未结算' 
      });
    }

    // 取消结算
    application.settled = false;
    application.settledAt = null;
    application.settledBy = null;
    
    await application.save();

    res.json({
      success: true,
      message: '已取消订单结算',
      data: {
        settled: application.settled
      }
    });
    
  } catch (err) {
    console.error('取消订单结算失败:', err);
    res.status(500).json({ 
      success: false,
      message: '服务器错误: ' + err.message 
    });
  }
});

// ==================== 财务报表API ====================

// 获取财务报表统计
app.get('/api/financial-report', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { startDate, endDate, assignedTo } = req.query;
    
    // 构建查询条件
    const filter = {};
    
    // 只统计已结算的订单
    filter.settled = true;
    
    // 员工只能查看自己负责的订单
    if (req.user.role === 'staff') {
      filter.assignedTo = req.user._id;
    } else if (req.user.role === 'admin' && assignedTo && assignedTo !== 'all') {
      // 管理员可以按员工筛选
      if (assignedTo === 'unassigned') {
        filter.assignedTo = null;
      } else {
        filter.assignedTo = assignedTo;
      }
    }
    
    // 按日期范围筛选（使用结算时间）
    if (startDate || endDate) {
      filter.settledAt = {};
      if (startDate) {
        filter.settledAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.settledAt.$lte = end;
      }
    }
    
    // 获取所有符合条件的订单
    const applications = await Application.find(filter).populate('assignedTo', 'username displayName');
    
    // 统计数据
    let totalOrders = applications.length;
    let totalIncome = 0;
    let totalCost = 0;
    let ordersByStatus = {
      pending: 0,
      processing: 0,
      completed: 0,
      rejected: 0
    };
    let ordersByPaymentStatus = {
      unpaid: 0,
      partial: 0,
      paid: 0
    };
    
    // 按员工统计（仅管理员）
    let staffStats = {};
    
    applications.forEach(app => {
      // 统计收入和成本
      if (app.billing && app.billing.payments) {
        const income = app.billing.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        totalIncome += income;
        
        // 计算支付状态
        const packagePrice = app.totalPrice || 0;
        if (income === 0) {
          ordersByPaymentStatus.unpaid++;
        } else if (income < packagePrice) {
          ordersByPaymentStatus.partial++;
        } else {
          ordersByPaymentStatus.paid++;
        }
      } else {
        ordersByPaymentStatus.unpaid++;
      }
      
      if (app.billing && app.billing.cost) {
        totalCost += app.billing.cost.amount || 0;
      }
      
      // 统计订单状态
      const status = app.status || 'pending';
      if (ordersByStatus[status] !== undefined) {
        ordersByStatus[status]++;
      }
      
      // 按员工统计（仅管理员）
      if (req.user.role === 'admin') {
        const staffId = app.assignedTo ? app.assignedTo._id.toString() : 'unassigned';
        const staffName = app.assignedTo ? (app.assignedTo.displayName || app.assignedTo.username) : '未分配';
        
        if (!staffStats[staffId]) {
          staffStats[staffId] = {
            staffId,
            staffName,
            orderCount: 0,
            income: 0,
            cost: 0,
            profit: 0
          };
        }
        
        staffStats[staffId].orderCount++;
        
        if (app.billing && app.billing.payments) {
          const income = app.billing.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
          staffStats[staffId].income += income;
        }
        
        if (app.billing && app.billing.cost) {
          staffStats[staffId].cost += app.billing.cost.amount || 0;
        }
        
        staffStats[staffId].profit = staffStats[staffId].income - staffStats[staffId].cost;
      }
    });
    
    const profit = totalIncome - totalCost;
    const profitRate = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(2) : 0;
    
    // 构建详细订单列表用于导出
    const orderDetails = applications.map(app => {
      const income = app.billing?.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const cost = app.billing?.cost?.amount || 0;
      const profit = income - cost;

      return {
        applyCode: app.applyCode || '',
        applicantName: app.name || '',
        phone: app.phone || '',
        networkType: app.networkType || '',
        package: app.package || '',
        customerType: app.customerType?.typeName || '',
        createdAt: app.createdAt,
        payments: app.billing?.payments || [],
        cost: cost,
        costNote: app.billing?.cost?.note || '',
        settledAt: app.settledAt,
        profit: profit,
        assignedTo: app.assignedTo ? (app.assignedTo.displayName || app.assignedTo.username) : '未分配'
      };
    });

    res.json({
      success: true,
      summary: {
        totalOrders,
        totalIncome,
        totalCost,
        profit,
        profitRate,
        ordersByStatus,
        ordersByPaymentStatus
      },
      staffStats: req.user.role === 'admin' ? Object.values(staffStats) : null,
      orderDetails: orderDetails,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    });
    
  } catch (err) {
    console.error('获取财务报表失败:', err);
    res.status(500).json({ 
      success: false,
      message: '服务器错误: ' + err.message 
    });
  }
});

// ==================== 权限管理API ====================

// 权限验证中间件
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: '未提供认证token' });
      }
      
      const decoded = jwt.verify(token, config.jwtSecret);
      const admin = await Admin.findById(decoded.id);
      
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: '无效的账户' });
      }
      
      // 管理员拥有所有权限
      if (admin.role === 'admin') {
        req.user = admin;
        return next();
      }
      
      // 检查员工权限
      if (!admin.permissions || !admin.permissions[permission]) {
        return res.status(403).json({ message: '没有权限访问此功能' });
      }
      
      req.user = admin;
      next();
    } catch (err) {
      res.status(401).json({ message: 'token无效' });
    }
  };
};

// 获取所有用户列表（仅管理员）
app.get('/api/admin/users', checkPermission('userManagement'), async (req, res) => {
  try {
    const users = await Admin.find({}, '-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        phone: user.phone,
        email: user.email,
        wechat: user.wechat,
        qq: user.qq,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
        createdAt: user.createdAt
      }))
    });
  } catch (err) {
    console.error('获取用户列表失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 创建员工账户（仅管理员）
app.post('/api/admin/users', checkPermission('userManagement'), async (req, res) => {
  try {
    const { username, password, displayName, permissions } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    // 检查用户名是否已存在
    const existingUser = await Admin.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建新用户
    const newUser = new Admin({
      username,
      password: hashedPassword,
      displayName: displayName || username,
      role: 'staff', // 新创建的都是员工
      permissions: permissions || {
        orderManagement: false,
        packageManagement: false,
        templateManagement: false,
        blacklistManagement: false,
        faqManagement: false,
        noticeManagement: false,
        userManagement: false
      },
      isActive: true
    });
    
    await newUser.save();
    
    res.json({
      success: true,
      message: '员工账户创建成功',
      user: {
        id: newUser._id,
        username: newUser.username,
        displayName: newUser.displayName,
        role: newUser.role,
        permissions: newUser.permissions,
        isActive: newUser.isActive
      }
    });
  } catch (err) {
    console.error('创建用户失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 更新员工信息和权限（仅管理员）
app.put('/api/admin/users/:id', checkPermission('userManagement'), async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, phone, email, wechat, qq, permissions, isActive, password } = req.body;
    
    const user = await Admin.findById(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 更新基本信息
    if (displayName !== undefined) user.displayName = displayName;
    if (phone !== undefined) user.phone = phone;
    if (email !== undefined) user.email = email;
    if (wechat !== undefined) user.wechat = wechat;
    if (qq !== undefined) user.qq = qq;
    
    // 管理员只能修改自己的基本信息和密码，不能修改权限和激活状态
    if (user.role !== 'admin') {
      if (permissions !== undefined) user.permissions = permissions;
      if (isActive !== undefined) user.isActive = isActive;
    }
    
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    user.updatedAt = new Date();
    
    await user.save();
    
    res.json({
      success: true,
      message: '用户信息更新成功',
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        phone: user.phone,
        email: user.email,
        wechat: user.wechat,
        qq: user.qq,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error('更新用户失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 删除员工账户（仅管理员）
app.delete('/api/admin/users/:id', checkPermission('userManagement'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await Admin.findById(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 不能删除管理员
    if (user.role === 'admin') {
      return res.status(403).json({ message: '不能删除管理员账户' });
    }
    
    await Admin.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: '员工账户删除成功'
    });
  } catch (err) {
    console.error('删除用户失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 黑名单管理API
// 获取黑名单列表
app.get('/api/blacklist', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { type, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isActive: true };
    if (type) {
      query.type = type;
    }
    
    const blacklist = await Blacklist.find(query)
      .sort({ bannedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Blacklist.countDocuments(query);
    
    res.json({
      success: true,
      data: blacklist,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (err) {
    console.error('获取黑名单失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 添加到黑名单
app.post('/api/blacklist', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { value, type, reason, expiresAt, notes } = req.body;
    
    if (!value || !type || !reason) {
      return res.status(400).json({ message: '请填写完整信息' });
    }
    
    // 检查是否已存在
    const existing = await Blacklist.findOne({
      value: value,
      type: type,
      isActive: true
    });
    
    if (existing) {
      return res.status(400).json({ message: '该条目已在黑名单中' });
    }
    
    const blacklist = await Blacklist.addToBlacklist(
      value, 
      type, 
      reason, 
      expiresAt ? new Date(expiresAt) : null,
      'admin',
      notes
    );
    
    res.json({
      success: true,
      message: '已添加到黑名单',
      data: blacklist
    });
    
  } catch (err) {
    console.error('添加到黑名单失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 从黑名单移除
app.delete('/api/blacklist/:id', async (req, res) => {
  try {
    // 验证管理员token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证token' });
    }
    
    try {
      jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'token无效' });
    }

    const { id } = req.params;
    
    const blacklist = await Blacklist.findById(id);
    if (!blacklist) {
      return res.status(404).json({ message: '未找到黑名单记录' });
    }
    
    blacklist.isActive = false;
    await blacklist.save();
    
    res.json({
      success: true,
      message: '已从黑名单移除'
    });
    
  } catch (err) {
    console.error('从黑名单移除失败:', err);
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 获取邮件功能配置状态接口
app.get('/api/email-config', async (req, res) => {
  try {
    res.json({
      emailUser: process.env.EMAIL_USER || 'jishu2020_service@163.com',
      supportedStatuses: ['待处理', '待确认', '处理中', '已完成', '已取消']
    });
  } catch (err) {
    res.status(500).json({ message: '服务器错误: ' + err.message });
  }
});

// 日志管理API路由
const logRoutes = require('./routes/logRoutes');
app.use('/api/logs', logRoutes);

// 统计管理API路由
const statisticsRoutes = require('./routes/statisticsRoutes');
app.use('/api/statistics', statisticsRoutes);

// 网站设置API路由
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
app.use('/api/site-settings', siteSettingsRoutes);

// 材料模板管理API路由
const materialTemplateRoutes = require('./routes/materialTemplateRoutes');
app.use('/api/material-templates', materialTemplateRoutes);

// 问题模板管理API路由
const questionTemplateRoutes = require('./routes/questionTemplateRoutes');
app.use('/api/question-templates', questionTemplateRoutes);

if (require.main === module) {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${config.port}`);
    console.log(`Server is also accessible on http://192.168.80.98:${config.port}`);
  });
}

module.exports = app;
