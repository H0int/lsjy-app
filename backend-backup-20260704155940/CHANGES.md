# 罗圣纪元SaaS平台后端 - 全面修复和功能扩展

## 编译状态
✅ `tsc --noEmit -p tsconfig.json` 通过，零错误

---

## 一、新增文件清单

### 新增实体（9个）
| 文件 | 说明 |
|------|------|
| `src/database/entities/announcement.entity.ts` | 公告实体 |
| `src/database/entities/coupon.entity.ts` | 优惠券实体 |
| `src/database/entities/campaign.entity.ts` | 活动实体 |
| `src/database/entities/ticket.entity.ts` | 工单实体 |
| `src/database/entities/ticket-reply.entity.ts` | 工单回复实体 |
| `src/database/entities/faq.entity.ts` | FAQ实体 |
| `src/database/entities/automation-rule.entity.ts` | 自动化规则实体 |
| `src/database/entities/automation-rule-log.entity.ts` | 自动化规则日志实体 |
| `src/database/entities/content-moderation.entity.ts` | 内容审核实体 |

### 新增模块（8个模块，每个含 module/controller/service）
| 模块目录 | 说明 |
|----------|------|
| `src/announcements/` | 公告管理模块 |
| `src/coupons/` | 优惠券管理模块 |
| `src/campaigns/` | 活动管理模块 |
| `src/tickets/` | 工单管理模块 |
| `src/faqs/` | FAQ管理模块 |
| `src/automation/` | 自动化规则模块 |
| `src/moderation/` | 内容审核模块 |
| `src/reports/` | 数据报表模块 |

---

## 二、修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `src/app.module.ts` | 注册8个新模块 |
| `src/main.ts` | Swagger新增10个API标签 |
| `src/database/entities/index.ts` | 导出9个新实体，修复AiProvider导入路径 |
| `src/database/entities/user.entity.ts` | 用户状态枚举新增 `pending` |
| `src/database/entities/coin-account.entity.ts` | 修复 version 列类型错误 |
| `src/auth/auth.service.ts` | 注册状态改为 pending；登录增加 pending 状态检查 |
| `src/auth/dto/auth.dto.ts` | 修复 strict 模式属性未初始化错误 |
| `src/users/users.controller.ts` | 新增 POST /users、PUT /users/:id 管理员端点 |
| `src/users/users.service.ts` | 新增 createUser、updateUser 方法 |
| `src/payment/payment.controller.ts` | 新增订单管理管理员端点（列表/详情/确认） |
| `src/payment/payment.service.ts` | 新增 getAllOrders、getOrderDetail、confirmOrder 方法 |
| `src/payment/payment.module.ts` | 注册 Order 实体 |
| `src/payment/dto/recharge.dto.ts` | 修复 strict 模式属性未初始化错误 |
| `src/ai-tools/ai-tools.controller.ts` | 新增管理员工具管理端点（创建/编辑/启停） |
| `src/ai-tools/ai-tools.service.ts` | 新增 createTool、updateTool、updateToolStatus 方法；修复 lock 类型错误 |
| `src/ai/ai.controller.ts` | 修复 imageUrl 属性缺失错误 |
| `src/ai/providers/base-provider.ts` | 新增 abstract chat 方法声明 |

---

## 三、全部API端点清单

### 认证模块 `/auth`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/auth/register` | 公开 | 用户注册（状态=pending，需审批） |
| POST | `/auth/login` | 公开 | 用户登录 |
| POST | `/auth/refresh` | 公开 | 刷新Token |
| POST | `/auth/logout` | 登录 | 用户登出 |
| POST | `/auth/change-password` | 登录 | 修改密码 |
| GET | `/auth/profile` | 登录 | 获取当前用户信息 |

### 用户管理 `/users`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/users/me` | 登录 | 获取当前用户信息 |
| PUT | `/users/me` | 登录 | 更新个人信息 |
| GET | `/users/me/roles` | 登录 | 获取当前用户角色 |
| GET | `/users` | admin/operator | 用户列表（分页+状态筛选）🆕 |
| GET | `/users/:id` | admin/operator | 用户详情 |
| POST | `/users` | super_admin | 添加用户 🆕 |
| PUT | `/users/:id` | super_admin | 编辑用户信息 🆕 |
| PUT | `/users/:id/status` | super_admin | 更新用户状态 |

### 工具管理 `/ai`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/ai/categories` | 公开 | 工具分类列表 |
| GET | `/ai/tools` | 公开 | 工具列表 |
| GET | `/ai/tools/:id` | 公开 | 工具详情 |
| POST | `/ai/tools/:id/call` | 登录 | 调用工具 |
| POST | `/ai/tools/:id/chat` | 登录 | AI对话 |
| POST | `/ai/tools/:id/chat/stream` | 登录 | AI流式对话(SSE) |
| POST | `/ai/tools/:id/generate` | 登录 | 图片生成 |
| GET | `/ai/history` | 登录 | 调用历史 |
| GET | `/ai/history/:id` | 登录 | 调用详情 |
| POST | `/ai/history/:id/favorite` | 登录 | 收藏/取消 |
| GET | `/ai/quota/:toolId` | 登录 | 每日配额 |
| POST | `/ai/admin/tools` | admin/operator | 创建工具 🆕 |
| PUT | `/ai/admin/tools/:id` | admin/operator | 编辑工具 🆕 |
| PUT | `/ai/admin/tools/:id/status` | admin/operator | 启用/停用工具 🆕 |

### 支付中心 `/payment`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/payment/coin/balance` | 登录 | 圣点余额 |
| GET | `/payment/coin/packages` | 公开 | 充值套餐 |
| POST | `/payment/coin/recharge` | 登录 | 充值 |
| GET | `/payment/coin/transactions` | 登录 | 交易记录 |
| GET | `/payment/orders` | 登录 | 我的订单 |
| GET | `/payment/admin/orders` | admin/operator | 订单列表（分页+状态筛选）🆕 |
| GET | `/payment/admin/orders/:id` | admin/operator | 订单详情 🆕 |
| PUT | `/payment/admin/orders/:id/confirm` | admin/operator | 确认订单 🆕 |

### 公告管理 `/announcements`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/announcements/active` | 公开 | 已发布公告 🆕 |
| GET | `/announcements/:id` | 公开 | 公告详情 🆕 |
| GET | `/announcements` | admin/operator | 公告列表 🆕 |
| POST | `/announcements` | admin/operator | 创建公告 🆕 |
| PUT | `/announcements/:id` | admin/operator | 编辑公告 🆕 |
| DELETE | `/announcements/:id` | admin/operator | 删除公告 🆕 |
| POST | `/announcements/:id/publish` | admin/operator | 发布公告 🆕 |

### 优惠券管理 `/coupons`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/coupons` | admin/operator | 优惠券列表 🆕 |
| GET | `/coupons/:id` | admin/operator | 优惠券详情 🆕 |
| POST | `/coupons` | admin/operator | 创建优惠券 🆕 |
| PUT | `/coupons/:id` | admin/operator | 编辑优惠券 🆕 |
| DELETE | `/coupons/:id` | admin/operator | 删除优惠券 🆕 |
| PUT | `/coupons/:id/status` | admin/operator | 启用/暂停 🆕 |

### 活动管理 `/campaigns`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/campaigns/active` | 公开 | 进行中的活动 🆕 |
| GET | `/campaigns` | admin/operator | 活动列表 🆕 |
| POST | `/campaigns` | admin/operator | 创建活动 🆕 |
| PUT | `/campaigns/:id` | admin/operator | 编辑活动 🆕 |
| DELETE | `/campaigns/:id` | admin/operator | 删除活动 🆕 |
| PUT | `/campaigns/:id/status` | admin/operator | 上线/暂停 🆕 |

### 工单管理 `/tickets`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/tickets` | admin/operator/support | 工单列表 🆕 |
| GET | `/tickets/:id` | 登录 | 工单详情 🆕 |
| POST | `/tickets` | 登录 | 创建工单 🆕 |
| POST | `/tickets/:id/assign` | admin/operator/support | 分配客服 🆕 |
| POST | `/tickets/:id/reply` | 登录 | 回复工单 🆕 |
| POST | `/tickets/:id/resolve` | admin/operator/support | 解决工单 🆕 |

### FAQ管理 `/faqs`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/faqs` | 公开 | FAQ列表 🆕 |
| GET | `/faqs/:id` | 公开 | FAQ详情 🆕 |
| GET | `/faqs/admin/list` | admin/operator | FAQ列表(管理) 🆕 |
| POST | `/faqs` | admin/operator | 创建FAQ 🆕 |
| PUT | `/faqs/:id` | admin/operator | 编辑FAQ 🆕 |
| DELETE | `/faqs/:id` | admin/operator | 删除FAQ 🆕 |

### 内容审核 `/moderation`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/moderation/list` | admin/operator/reviewer | 待审核列表 🆕 |
| GET | `/moderation/:id` | admin/operator/reviewer | 内容详情 🆕 |
| POST | `/moderation/:id/approve` | admin/operator/reviewer | 通过审核 🆕 |
| POST | `/moderation/:id/reject` | admin/operator/reviewer | 拒绝审核 🆕 |
| POST | `/moderation/:id/flag` | admin/operator/reviewer | 标记内容 🆕 |

### 自动化规则 `/automation`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/automation/rules` | admin/operator | 规则列表 🆕 |
| GET | `/automation/rules/:id` | admin/operator | 规则详情 🆕 |
| POST | `/automation/rules` | admin/operator | 创建规则 🆕 |
| PUT | `/automation/rules/:id` | admin/operator | 编辑规则 🆕 |
| PUT | `/automation/rules/:id/toggle` | admin/operator | 启用/禁用 🆕 |
| DELETE | `/automation/rules/:id` | admin/operator | 删除规则 🆕 |
| GET | `/automation/rules/:id/logs` | admin/operator | 执行日志 🆕 |

### 系统配置 `/system`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/system/configs/public` | 公开 | 公开配置 |
| GET | `/system/configs` | super_admin | 所有配置 |
| GET | `/system/settings` | super_admin | 获取配置(分组格式) 🆕 |
| PUT | `/system/settings` | super_admin | 批量保存配置 🆕 |
| PUT | `/system/configs/:key` | super_admin | 更新单个配置 |
| GET | `/system/logs` | admin/operator | 操作日志 |

### 数据报表 `/reports`
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/reports/overview` | admin/operator | 概览数据 🆕 |
| GET | `/reports/trend` | admin/operator | 趋势数据 🆕 |
| GET | `/reports/revenue` | admin/operator | 收入报表 🆕 |

### 其他
| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/health` | 公开 | 健康检查 |
| GET | `/notifications` | 登录 | 通知列表 |
| GET | `/notifications/unread-count` | 登录 | 未读通知数 |
| POST | `/notifications/:id/read` | 登录 | 标记已读 |
| POST | `/notifications/read-all` | 登录 | 全部标记已读 |
| GET | `/roles` | admin/operator | 角色列表 |
| GET | `/roles/permissions` | admin/operator | 权限列表 |
| GET | `/roles/:id` | admin/operator | 角色详情 |
| POST | `/roles` | admin/operator | 创建角色 |
| PUT | `/roles/:id` | admin/operator | 编辑角色 |
| POST | `/roles/assign` | admin/operator | 分配角色 |
| DELETE | `/roles/user/:userId/role/:roleId` | admin/operator | 移除角色 |

---

## 四、关键修复

1. **注册审批流程**：用户注册后状态为 `pending`，需管理员审批后才能登录
2. **TypeScript编译错误**：修复了16个预存TS错误（DTO属性初始化、实体类型、接口实现等）
3. **统一响应格式**：所有API通过 `TransformInterceptor` 返回 `{ code: 0, message: 'success', data: ... }`
4. **分页统一**：所有列表API返回 `{ items, total, page, pageSize }`
5. **AiProvider导入路径**：修复跨模块路径解析问题
