# 🟢 Vercel 部署步骤指南

## 📋 准备工作

代码已经推送到 GitHub，仓库地址：
https://github.com/yangdejin1989-art/qianzheng

---

## 第一步：注册 Vercel 账号

1. 打开浏览器，访问：https://vercel.com/signup
2. 点击 **"Continue with GitHub"** 按钮
3. 授权 Vercel 访问你的 GitHub 账号

---

## 第二步：导入项目

1. 登录后，点击 **"Add New..."** → **"Project"**
2. 在项目列表中找到 **`qianzheng`** 仓库
3. 点击 **"Import"** 按钮

---

## 第三步：配置项目

Vercel 会自动检测到 `vercel.json` 配置文件，你会看到：

- **Framework Preset**: 保持默认（Other）
- **Root Directory**: 保持默认（`.`）
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: 会自动检测

你需要手动修改：
- **Build Command** 改为：`cd client && npm install && npm run build`

点击 **"Deploy"** 按钮！

---

## 第四步：添加环境变量

部署完成后（或部署前），需要添加环境变量：

1. 点击项目 → **"Settings"** → **"Environment Variables"**
2. 点击 **"Add New Variable"**，依次添加以下变量：

```
MONGO_URI=mongodb+srv://yangdejin1989_db_user:yh5bcI6suXIoBQKN@cluster0.vkhuqul.mongodb.net/visa-system?retryWrites=true&w=majority
```

```
JWT_SECRET=visa_secret_key_2024_yangdejin
```

```
EMAIL_USER=jishu2020_service@163.com
```

```
EMAIL_PASS=QDyQgPu328neKbEE
```

3. 点击 **"Save"**

---

## 第五步：重新部署

添加环境变量后，需要重新部署才能生效：

1. 点击 **"Deployments"** 标签
2. 点击右上角 **"Redeploy"**（或者去 GitHub 仓库修改任意文件触发重新部署）

---

## 第六步：查看部署结果

部署完成后，Vercel 会给你一个域名，类似：
- **https://qianzheng.vercel.app**

你可以用这个地址访问网站了！

---

## ⚠️ 重要提示

### 前端 API 地址问题

目前前端代码中有很多地方写死了 `http://localhost:5000`，在 Vercel 部署后，需要将其改为相对路径。

我已经配置了 `vercel.json`，让 `/api/*` 请求转发到后端。但是，前端代码中的 `http://localhost:5000/api/xxx` 需要改为 `/api/xxx`。

**这个问题我可以在你部署后帮你修复。**

---

## 💰 费用

Vercel 个人版是 **完全免费** 的：
- 每月 100,000 MB 数据传输
- 无限部署次数
- 自动 HTTPS
- 自动预览部署

对于个人网站来说，完全够用！

---

## 需要我帮你做什么？

完成上述步骤后，告诉我：
1. 你是否已成功部署？
2. 部署后的网站地址是什么？
3. 访问网站时是否有什么问题？

我会帮你修复前端 API 地址问题，确保网站能正常使用！