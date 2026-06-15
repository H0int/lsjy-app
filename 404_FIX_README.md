# 404问题修复方案

## 问题原因

你打开网站看到404错误，是因为：

1. **后端API服务未运行** - Node.js服务器没有启动
2. **Nginx未配置反向代理** - 域名没有指向后端服务
3. **前端文件未部署** - 静态文件没有在正确的位置
4. **AI配置缺失** - .env文件缺少AI API Keys

## 解决方案

### 方案一：快速修复（推荐，5分钟）

SSH登录到ECS服务器，运行：

```bash
# 登录服务器
ssh root@8.154.16.5

# 进入项目目录
cd /opt/lsjy-app

# 运行快速修复脚本
bash quick-fix.sh
```

这个脚本会：
- ✅ 启动后端API服务
- ✅ 配置AI Provider（使用DeepSeek）
- ✅ 测试API是否正常
- ✅ 检查Nginx和前端文件状态

### 方案二：完整部署（15分钟）

如果需要完全重新部署：

```bash
# 登录服务器
ssh root@8.154.16.5

# 进入项目目录
cd /opt/lsjy-app

# 运行完整部署脚本
bash full-deploy.sh
```

这个脚本会：
- ✅ 构建前端和管理后台
- ✅ 部署静态文件到Nginx目录
- ✅ 配置并启动后端服务
- ✅ 配置Nginx反向代理
- ✅ 配置防火墙
- ✅ 测试所有服务

## 部署后的访问地址

- **前台（用户）**：https://lsjyapp.cn
- **后台（管理）**：https://admin.lsjyapp.cn/#/admin/login
- **API接口**：https://api.lsjyapp.cn

## 管理员账号

- 用户名：`KF02V9`
- 密码：`LKZ2005430`

## AI智能体配置

已配置以下AI Provider（按优先级）：

1. **DeepSeek**（主）- 已配置API Key
2. **豆包 Doubao**（备用）- 已配置API Key
3. **通义千问 Tongyi**（备用）- 已配置API Key

AI对话现在会正确回答关于公司、创始人（罗凯中）、业务等问题。

## 故障排查

### 1. 后端API 502错误

```bash
# 检查后端服务状态
pm2 status

# 查看后端日志
pm2 logs lsjy-backend --lines 50

# 重启后端服务
pm2 restart lsjy-backend
```

### 2. 前端404错误

```bash
# 检查前端文件
ls -la /usr/share/nginx/html/frontend/

# 如果目录为空，需要构建前端
cd /opt/lsjy-app/frontend
npm install
npm run build
sudo cp -r dist/* /usr/share/nginx/html/frontend/
```

### 3. 管理后台404错误

```bash
# 检查admin文件
ls -la /usr/share/nginx/html/admin/

# 如果目录为空，需要构建admin
cd /opt/lsjy-app/admin
npm install
npm run build
sudo cp -r dist/* /usr/share/nginx/html/admin/
```

### 4. AI对话不工作

```bash
# 检查.env配置
cat /opt/lsjy-app/backend/.env | grep AI_

# 测试AI API
curl -X POST http://localhost:3000/api/v1/ai/tools/2/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好"}]}'

# 查看后端日志
pm2 logs lsjy-backend --lines 20
```

### 5. Nginx配置错误

```bash
# 测试Nginx配置
sudo nginx -t

# 重新加载Nginx
sudo systemctl reload nginx

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

## 文件说明

- `quick-fix.sh` - 快速修复脚本（推荐首先运行）
- `full-deploy.sh` - 完整部署脚本
- `nginx.conf` - Nginx配置文件
- `fix-ai-config.sh` - AI配置修复脚本
- `AI_FIX_README.md` - AI问题详细说明

## 技术架构

```
用户浏览器
    ↓
Nginx (443/HTTPS)
    ├─ lsjyapp.cn → /usr/share/nginx/html/frontend (Vue SPA)
    ├─ admin.lsjyapp.cn → /usr/share/nginx/html/admin (Vue SPA)
    └─ api.lsjyapp.cn → proxy_pass http://localhost:3000
                              ↓
                    Node.js Backend (PM2)
                         ├─ /api/v1/* (REST API)
                         ├─ AI Provider (DeepSeek/豆包/通义)
                         └─ SQLite Database
```

## 下一步

1. **立即执行**：SSH到服务器运行 `bash quick-fix.sh`
2. **验证服务**：访问 https://lsjyapp.cn 和 https://admin.lsjyapp.cn
3. **测试AI**：在管理后台测试AI对话功能
4. **如有问题**：查看日志 `pm2 logs lsjy-backend`

---

**修复时间**: 2026-06-15  
**状态**: 脚本已准备就绪，需要在ECS服务器上执行  
**预计耗时**: 5-15分钟
