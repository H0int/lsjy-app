# 罗圣纪元 SaaS 平台 - 前端

> Phase 1 MVP：基于 Vue 3 + TypeScript + Vite 的渐进式迁移前端项目

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue 3 | ^3.4 | 渐进式框架 |
| TypeScript | ^5.4 | 类型安全 |
| Vite | ^5.2 | 构建工具 |
| Pinia | ^2.1 | 状态管理 |
| Vue Router | ^4.3 | 路由管理 |
| Element Plus | ^2.7 | UI组件库 |
| Tailwind CSS | ^3.4 | 原子化CSS |
| Axios | ^1.6 | HTTP客户端 |

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 开发模式

```bash
npm run dev
# 访问 http://localhost:5173
```

### 3. 生产构建

```bash
npm run build
# 产物在 dist/ 目录
```

### 4. 预览构建结果

```bash
npm run preview
```

## 项目结构

```
frontend/
├── src/
│   ├── api/                # API请求层
│   │   ├── request.ts      # Axios封装（拦截器/Token/错误处理）
│   │   ├── mock.ts         # Mock数据（开发阶段使用）
│   │   └── index.ts        # API接口定义
│   ├── assets/
│   │   └── style.css       # 全局样式 + Tailwind
│   ├── components/         # 公共组件
│   │   ├── EmptyState.vue  # 空状态组件
│   │   └── LoadingSpinner.vue # 加载状态
│   ├── composables/        # 组合式函数
│   │   └── useLoading.ts   # 加载状态管理
│   ├── layouts/            # 布局组件
│   │   ├── UserLayout.vue  # 用户端布局（顶栏+内容+底部导航）
│   │   └── AdminLayout.vue # 管理后台布局（侧边栏+顶栏+内容）
│   ├── router/
│   │   └── index.ts        # 路由配置 + 守卫
│   ├── stores/             # Pinia状态管理
│   │   ├── auth.ts         # 认证状态（登录/用户/Token）
│   │   ├── tool.ts         # 工具状态（列表/详情/调用）
│   │   └── app.ts          # 应用状态（主题/侧边栏）
│   ├── types/
│   │   └── index.ts        # TypeScript类型定义
│   ├── utils/
│   │   └── index.ts        # 工具函数
│   ├── views/              # 页面视图
│   │   ├── auth/           # 登录/注册
│   │   ├── dashboard/      # 控制台首页
│   │   ├── ai-tools/       # AI工具中心 + 工具详情
│   │   ├── profile/        # 个人中心 + 圣点账户
│   │   └── admin/          # 管理后台（5个管理页面）
│   ├── App.vue
│   └── main.ts
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .env.development
└── .env.production
```

## 核心页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录 | `/login` | 手机号+验证码/邮箱登录 |
| 注册 | `/register` | 带验证的注册表单 |
| 控制台 | `/dashboard` | 数据概览+快捷入口+最近使用 |
| AI工具中心 | `/tools` | 分类导航+搜索+卡片/列表切换 |
| 工具详情 | `/tools/:id` | 工具使用界面+参数配置+结果展示 |
| 个人中心 | `/profile` | 信息编辑+角色标识+快捷功能 |
| 圣点账户 | `/profile/wallet` | 余额+充值套餐+消费记录 |
| 管理控制台 | `/admin/dashboard` | 数据统计+工具排行+动态 |
| 用户管理 | `/admin/users` | 用户表格+搜索+角色筛选 |
| 工具管理 | `/admin/tools` | 工具表格+分类筛选+上下架 |
| 订单管理 | `/admin/orders` | 订单表格+状态筛选+导出 |
| 系统配置 | `/admin/settings` | 基础/计费/通知配置 |

## 设计特点

- **主色调**：蓝色(#3b82f6) + 金色(#f59e0b 企业版)
- **暗黑模式**：支持日夜间切换，全组件适配
- **响应式**：桌面/平板/手机三端适配，移动端底部导航
- **Mock模式**：环境变量 `VITE_MOCK=true` 启用，前端可独立预览
- **渐进迁移**：作为独立模块运行，后续嵌入现有站点

## 环境变量

| 变量 | 开发环境 | 生产环境 |
|------|----------|----------|
| VITE_API_BASE_URL | http://localhost:3000/api/v1 | https://lsjyapp.cn/api/v1 |
| VITE_MOCK | true | false |

## 后续迭代计划

- [ ] Phase 2: 接入真实后端API，移除Mock
- [ ] Phase 2: 嵌入现有GitHub Pages站点（寄生模式）
- [ ] Phase 3: 完善AI工具调用交互（实时流式输出）
- [ ] Phase 3: 支付集成（微信/支付宝）
- [ ] Phase 4: 完全SPA迁移，下线旧静态站点
