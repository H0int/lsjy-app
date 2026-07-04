# 罗圣纪元后端代理服务

## 项目说明

本服务为罗圣纪元平台（lsjy-app）的后端代理层，承担以下职责：

1. **API 密钥安全管理** — 所有第三方 API Key 仅存储在后端环境变量中，前端无法访问
2. **AI 接口代理** — 豆包（火山引擎）文本/图片生成接口代理
3. **短信服务** — 阿里云短信验证码发送与校验
4. **数字人代理** — HeyGen API 接口代理
5. **用户认证** — JWT Token 认证体系
6. **请求限流** — 防止 API 滥用

## 快速部署

### 1. 安装依赖

```bash
cd lsjy-backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入实际的 API Key 和密钥
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务启动后监听 `http://localhost:3000`

### 4. 部署到 Render（推荐）

1. 将代码推送到 GitHub
2. 在 [Render](https://render.com) 创建 Web Service
3. 连接 GitHub 仓库
4. 设置环境变量（在 Render Dashboard 的 Environment 中配置）
5. 启动命令：`npm start`

## API 接口列表

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/health` | GET | 健康检查 | 无 |
| `/api/auth/login` | POST | 用户名密码登录 | 无 |
| `/api/auth/register` | POST | 用户名密码注册 | 无 |
| `/api/auth/sms-login` | POST | 短信验证码登录 | 无 |
| `/api/auth/sms-register` | POST | 短信验证码注册 | 无 |
| `/api/ai/text` | POST | AI 文本生成 | Token |
| `/api/ai/image` | POST | AI 图片生成 | Token |
| `/api/ai/generic` | POST | 通用 AI 工具 | Token |
| `/api/ai/quick` | POST | 快速 AI 回复 | Token |
| `/api/sms/send` | POST | 发送短信验证码 | 无 |
| `/api/sms/verify` | POST | 校验短信验证码 | 无 |
| `/api/heygen/create` | POST | 创建数字人视频 | Token |
| `/api/heygen/status/:taskId` | GET | 查询视频状态 | Token |
| `/api/heygen/avatars` | GET | 获取数字人列表 | Token |
| `/api/user/info` | GET | 获取用户信息 | Token |
| `/api/user/credits` | GET | 获取积分 | Token |
| `/api/user/credits/deduct` | POST | 消耗积分 | Token |

## 前端对接指南

前端原有的直接 API 调用需改为以下方式：

### 原有方式（不安全）
```javascript
// 前端直接调用火山引擎
const r = await fetch('https://ark.cn-beijing.volces.com/api/v3/responses', {
  headers: { 'Authorization': 'Bearer ' + ARK_API_KEY }
});
```

### 新方式（安全）
```javascript
// 前端调用后端代理
const r = await fetch('https://your-backend.onrender.com/api/ai/generic', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + userToken,  // 登录后获取的 JWT
  },
  body: JSON.stringify({ prompt: '...', tool: 'copywriter' }),
});
const data = await r.json();
const text = data.text;
```

## 项目结构

```
lsjy-backend/
├── server.js            # 主入口
├── package.json          # 依赖配置
├── .env.example          # 环境变量模板
├── .gitignore
├── README.md
├── routes/
│   ├── ai-proxy.js      # 豆包 AI 代理
│   ├── sms.js            # 短信服务
│   ├── heygen.js         # HeyGen 数字人代理
│   ├── auth.js           # 认证（登录/注册）
│   └── user.js           # 用户管理
└── lib/
    ├── cache.js          # 缓存（Redis/内存）
    ├── auth.js           # JWT 认证
    └── rate-limit.js     # 请求限流
```
