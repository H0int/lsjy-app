# AGENTS.md — 罗圣纪元 SaaS 前端 (lsjy-saas-frontend)

## 项目定位

Vue 3 + TypeScript + Vite 单页应用，为罗圣纪元平台提供用户端（控制台/AI 工具/对话/算力调度/算法中台/个人中心）和管理后台（40+ 页面）。使用 Element Plus 组件库、Pinia 状态管理、vue-router hash 路由、ECharts 图表。通过 axios 调用后端 `/api/v1` 接口，JWT Bearer Token 认证。自定义域名 lsjyapp.cn，兼容 GitHub Pages 构建。

## 目录职责表

| 路径 | 职责 |
|------|------|
| `src/main.ts` | 应用入口；挂载 Vue、Pinia、Element Plus、路由 |
| `src/App.vue` | 根组件 |
| `src/router/index.ts` | 路由定义（188 行）；用户端 13 路由 + AdminLayout 40+ 路由；`beforeEach` 鉴权守卫（本地 Token 容错、角色校验、算法中台付费门禁） |
| `src/api/request.ts` | axios 实例（177 行）；请求/响应拦截器、401 Token 刷新、多格式兼容 |
| `src/api/index.ts` | API 方法封装层（337 行） |
| `src/api/computing.ts` | 算力调度与虚拟员工 API（134 行） |
| `src/api/mock.ts` | Mock 数据（427 行，开发降级用） |
| `src/stores/auth.ts` | 认证状态（309 行）；Token 存储/清除/角色判断 |
| `src/stores/app.ts` | 全局应用状态 |
| `src/stores/tool.ts` | AI 工具状态（389 行） |
| `src/layouts/UserLayout.vue` | 用户端布局（导航 + 路由出口） |
| `src/layouts/AdminLayout.vue` | 管理后台布局（侧边栏 + 路由出口） |
| `src/views/auth/` | 登录 `LoginView.vue`（1089 行）、注册 `RegisterView.vue`（602 行） |
| `src/views/dashboard/` | 用户控制台（648 行） |
| `src/views/ai-tools/` | AI 工具中心（729 行）、工具详情（1018 行）、开源技能分析 |
| `src/views/chat/` | AgentChat 对话页（1608 行）；流式/轮询 AI 接口 |
| `src/views/computing/` | 算力调度 & 虚拟员工中心（4049 行，最大单文件） |
| `src/views/algorithm-platform/` | 自研算法中台（835 行）；付费/卡密门禁 |
| `src/views/profile/` | 个人中心（751 行）、圣力中心/钱包（2054 行）、作品/收藏/创作记录/帮助中心 |
| `src/views/admin/` | 管理后台页面；按模块分子目录：`ai/`、`analytics/`、`commerce/`、`content/`、`marketing/`、`security/`、`support/`、`system/`、`user/`、`visitor/` |
| `src/types/index.ts` | TypeScript 类型定义（391 行） |
| `src/utils/index.ts` | 工具函数（Token 读写等，143 行） |
| `src/utils/toolParams.ts` | AI 工具参数定义与映射（561 行） |
| `src/composables/` | 组合式函数（useLoading） |
| `src/assets/style.css` | 全局样式（405 行） |
| `vite.config.ts` | Vite 配置；dev 代理 `/api → :3000`、构建分包（vue/element-plus/axios） |
| `public/` | 静态资源（landing.html 等） |
| `admin/` | 独立管理后台静态版（admin-app.js 5491 行，备用） |

## 命令指针

| 命令 | 用途 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 开发服务器（`http://localhost:5173`，代理 `/api` 到后端 3000） |
| `npm run build` | 类型检查 `vue-tsc` + Vite 生产构建 → `dist/` |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | ESLint 检查并自动修复（`.vue/.js/.ts/.tsx`） |
| `npm run lint:check` | ESLint 仅检查不修复 |
| `npm test` | 类型检查（`vue-tsc --noEmit`） |

环境变量：`VITE_API_BASE_URL`（默认 `/api/v1`）；GitHub Pages 构建设 `GITHUB_PAGES=true`。

## 高风险区域

1. **`src/api/request.ts`（177 行）** — Token 刷新逻辑；401 时自动刷新 `lsjy_refresh_token`，失败清除 Token 并跳转登录；本地 Token（`lsjy_`/`local_` 前缀）跳过刷新。修改可能导致认证死循环或 Token 丢失。
2. **`src/stores/auth.ts`（309 行）** — 认证 store，管理 Token/用户/角色；与 `request.ts` 和 `utils/index.ts` 耦合，改动需三处同步。
3. **`src/router/index.ts`（188 行）** — `beforeEach` 守卫三层逻辑：①本地 `local_` Token 从 localStorage 读角色容错放行；②正常 Token 调 API 校验角色列表（boss/founder/ultimate_admin/super_admin/admin），非管理员清除 Token 退回 dashboard；③算法中台 `requiresAlgoPlatform` 付费/卡密门禁（KF02V9 免费）。
4. **`src/views/auth/LoginView.vue`（1089 行）** — 登录页含多种登录方式、表单校验、本地 Token 降级逻辑；修改影响所有用户入口。
5. **`src/views/chat/AgentChat.vue`（1608 行）** — 对话页，直接调用后端 AI 接口，含流式/轮询逻辑与工具调用渲染。
6. **`src/views/computing/ComputingCenter.vue`（4049 行）** — 项目最大单文件，算力调度 + 虚拟员工全功能页；重构风险高。
7. **`src/utils/toolParams.ts`（561 行）** — 全部 AI 工具的参数定义字典；修改影响工具中心与详情页的参数渲染。
8. **`vite.config.ts`** — `base` 路径和 dev proxy 配置；GitHub Pages（`/lsjy-app/`）与自定义域名（`/`）构建行为不同。
9. **`src/api/mock.ts`（427 行）** — Mock 数据可能在生产环境意外启用，需确保仅在开发环境降级使用。

## 验证路由映射

| 验证目标 | 操作 | 预期 |
|----------|------|------|
| 未登录重定向 | 访问 `/#/dashboard` 无 Token | 跳转 `/#/login` |
| 已登录跳过登录页 | 访问 `/#/login` 有 Token | 跳转 `/#/dashboard` |
| 管理后台鉴权 | 访问 `/#/admin/dashboard` 无 Token | 跳转 `/#/login` |
| 管理后台角色校验 | 非管理员 Token 访问 `/#/admin/dashboard` | 清除 Token，跳转 `/#/dashboard` |
| 本地 Token 容错 | `local_` 前缀 Token + localStorage 有管理员角色 | 放行进入管理后台 |
| 算法中台门禁 | 无 `lsjy_algo_platform_access` 标记访问 `/#/algorithm-platform` | 跳转 `/#/profile/wallet?from=algo-platform` |
| API 请求拦截 | 任意 API 调用 | 请求头自动添加 `Authorization: Bearer <token>` |
| 401 Token 刷新 | API 返回 401（非本地 Token） | 自动刷新 Token 并重试；失败跳转登录 |
| 网络错误提示 | 后端不可达 | ElMessage 网络异常提示（登录请求除外） |
| 构建类型检查 | `npm run build` | `vue-tsc` 通过 + `dist/` 产物生成 |

## 前后端联动注意

- 后端须先于前端启动（dev proxy 目标 `localhost:3000`）。
- 后端同时挂载 `/api/*` 和 `/api/v1/*`，前端统一使用 `/api/v1` 前缀。
- 后端 JWT 为自实现格式（非 `jsonwebtoken`），前端 `request.ts` 已做兼容；本地降级 Token 以 `lsjy_`/`local_` 开头跳过刷新。
- 管理员角色白名单前后端须保持一致：`boss`、`founder`、`ultimate_admin`、`super_admin`、`admin`。
- 后端 `origin: true` 允许跨域携带凭据，前端 `credentials` 默认随 axios 实例。
