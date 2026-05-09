# 签证系统 Vercel + MongoDB Atlas 免费部署指南

## 📋 部署架构

```
前端 (React)  →  部署到 Vercel (免费)
后端 (Express) →  部署到 Render/Railway (免费额度)
数据库 (MongoDB) →  部署到 MongoDB Atlas (免费 512MB)
```

---

## 🚀 部署步骤

### 第一步：创建 MongoDB Atlas 免费数据库

1. 访问 https://www.mongodb.com/cloud/atlas
2. 注册账号（无需信用卡）
3. 创建免费集群（M0 Free）
   - 选择 **MongoDB Shared (M0)** - 免费
   - 选择靠近日本的区域（Tokyo）- 亚洲访问最快
4. 创建数据库用户（用户名 + 密码）
5. 设置 IP 白名单：添加 `0.0.0.0/0`（允许所有 IP）
6. 获取连接字符串：
   - 点击 "Connect" → "Connect your application"
   - 复制连接字符串，格式如：
   ```
   mongodb+srv://用户名:密码@集群地址/visa-system?retryWrites=true&w=majority
   ```

---

### 第二步：部署前端到 Vercel

#### 方式 A：使用 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 进入前端目录
cd 签证/qianzheng/client

# 3. 登录 Vercel
vercel login

# 4. 构建项目
npm run build

# 5. 部署
vercel
```

#### 方式 B：连接 Git 仓库（自动部署）

1. 将项目推送到 GitHub
2. 访问 https://vercel.com
3. 点击 "New Project"
4. 导入你的 GitHub 仓库
5. 设置：
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. 添加环境变量：
   ```
   REACT_APP_API_URL = 你的后端API地址
   ```
7. 点击 "Deploy"

---

### 第三步：部署后端到 Render（免费）

1. 访问 https://render.com
2. 注册账号
3. 创建 **Web Service**
4. 连接 GitHub 仓库
5. 设置：
   - **Name**: visa-backend
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Type**: Free（免费）
6. 添加环境变量：
   ```
   MONGO_URI = mongodb+srv://用户名:密码@集群地址/visa-system?retryWrites=true&w=majority
   JWT_SECRET = 你自己设置的密钥（如: my_secret_key_2024）
   EMAIL_USER = jishu2020_service@163.com
   EMAIL_PASS = QDyQgPu328neKbEE
   PORT = 5000
   ```
7. 点击 "Create Web Service"

---

### 第四步：配置前端 API 地址

1. 在 `client/.env` 文件中添加：
   ```
   REACT_APP_API_URL=https://你的后端域名.onrender.com
   ```

2. 修改前端代码中的 API 调用，将 `localhost:5000` 替换为环境变量

3. 重新部署前端

---

## 💰 费用说明

| 服务 | 方案 | 月费 |
|------|------|------|
| Vercel | Hobby（个人） | **免费** |
| MongoDB Atlas | M0 Free | **免费** |
| Render | Free Instance | **免费** |
| 域名 | 使用免费子域名 | **免费** |
| **总计** | | **¥0/月** |

> **注意**：Render 免费版会在 15 分钟无访问后休眠，首次访问需要约 30-50 秒唤醒。

---

## 🌐 免费域名

部署完成后，你将获得：
- 前端：`your-project.vercel.app`
- 后端：`visa-backend.onrender.com`

后期可以购买自己的域名（约 ¥50-80/年）并绑定。

---

## ⚡ 性能优化建议

1. **国内访问慢的解决方案**：
   - 免费方案在海外服务器，国内访问可能较慢（1-3秒）
   - 如果测试效果满意，可以迁移到国内云服务器（¥40-80/月）

2. **升级建议**（如需更快响应）：
   - Render 升级 $7/月 - 不休眠
   - MongoDB Atlas 升级 $9/月 - 更大空间

---

## 📝 测试清单

部署完成后，测试以下功能：

- [ ] 首页正常加载
- [ ] 签证申请表单可以提交
- [ ] 文件上传功能正常
- [ ] 进度查询功能正常
- [ ] 后台管理登录正常
- [ ] 邮件发送功能正常

---

## 🔗 有用链接

- Vercel: https://vercel.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Render: https://render.com