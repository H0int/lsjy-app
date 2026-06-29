# 罗圣纪元 - ECS部署配置

此目录包含罗圣纪元平台在阿里云ECS上的**实际运行配置**，于2026-06-29修复时备份。

## 目录结构

```
deploy/
├── README.md                    ← 本文件
├── ecs-live-config/             ← ECS上实际运行的配置文件备份
│   ├── nginx-lsjy.conf         ← Nginx配置（/etc/nginx/conf.d/lsjy.conf）
│   ├── ai-proxy/
│   │   └── config.js           ← ai-proxy模型映射配置（/opt/ai-proxy/dist/config.js）
│   └── backend-nestjs/
│       ├── main.js             ← 后端主入口（修复崩溃）
│       ├── ai.controller.js    ← AI控制器（DeepSeek API替换Coze）
│       ├── reports.controller.js  ← 报告控制器（新增getDaily端点）
│       ├── users.controller.js    ← 用户控制器（新增getDashboard端点）
│       └── agent-dispatch.controller.js ← Agent调度控制器（修复Controller前缀）
├── re-deploy.sh                ← 从备份恢复的脚本
└── nginx-lsjy.conf             ← Nginx配置副本（根目录方便查看）
```

## ECS关键路径

| 文件 | ECS路径 |
|------|---------|
| NestJS后端 | `/opt/lsjy-app/backend-nestjs/dist/` |
| ai-proxy | `/opt/ai-proxy/dist/` |
| Nginx配置 | `/etc/nginx/conf.d/lsjy.conf` |
| PM2进程管理 | `pm2 list` |
| 数据目录 | `/opt/lsjy-app/data/` |

## 2026-06-29修复内容

1. **AI智能体**：ai-proxy添加4个前端兼容模型别名（deepseek-chat, deepseek-v4-pro, deepseek-v4-flash, deepseek-coder）
2. **Nginx路由**：`/ai/models`正确路由到ai-proxy
3. **quickChat**：从Coze API切换到DeepSeek API
4. **Reports**：新增`/reports/daily`端点
5. **Users**：新增`/users/dashboard`端点（直接读取数据文件）
6. **AgentDispatch**：修复Controller前缀（`api` → 无前缀）
7. **main.js**：修复崩溃问题

## 注意事项

- 这些是**编译后的JS文件**，不是TypeScript源码
- `backend/`目录中的TypeScript源码有49个编译错误，暂时无法构建
- 如果需要重新部署，使用`re-deploy.sh`脚本
- ai-proxy是独立项目，有自己的`.env`配置文件

## PM2进程列表

| 名称 | 端口 | 说明 |
|------|------|------|
| ai-proxy | 3001 | AI代理服务 |
| file-upload | 3002 | 文件上传服务 |
| lsjy-backend | 3000 | NestJS后端 |
| chat-proxy | 3003 | 聊天代理（豆包新增） |
