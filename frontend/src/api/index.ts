import service from './request'
import { mockApi } from './mock'
import type {
  ApiResponse, User, Tool, CoinTransaction, CoinAccount,
  PaymentTransaction, RechargePackage, LoginResult, TokenInfo,
  PageResult, AiCallRecord, ToolCategory,
  ChatMessage, ChatResult, ImageOptions, ImageResult,
  ProviderStatus, ProviderModelGroup
} from '@/types'

const useMock = import.meta.env.VITE_MOCK === 'true'

// ===== 认证API =====
export const authApi = {
  /** POST /auth/login - 用户名密码登录 */
  login(username: string, password: string): Promise<ApiResponse<LoginResult>> {
    if (useMock) return mockApi.login() as any
    return service.post('/auth/login', { username, password }).then(r => r.data)
  },

  /** POST /auth/register - 用户注册 */
  register(data: { username: string; password: string; nickname: string; email?: string; phone?: string }): Promise<ApiResponse<LoginResult>> {
    if (useMock) return mockApi.register() as any
    return service.post('/auth/register', data).then(r => r.data)
  },

  /** POST /auth/refresh - 刷新Token */
  refreshToken(refreshToken: string): Promise<ApiResponse<TokenInfo>> {
    return service.post('/auth/refresh', { refreshToken }).then(r => r.data)
  },

  /** POST /auth/logout - 退出登录 */
  logout(): Promise<ApiResponse<{ message: string }>> {
    return service.post('/auth/logout').then(r => r.data)
  },

  /** POST /auth/change-password - 修改密码 */
  changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return service.post('/auth/change-password', { oldPassword, newPassword }).then(r => r.data)
  }
}

// ===== 用户API =====
export const userApi = {
  /** GET /users/me - 获取当前用户信息 */
  getProfile(): Promise<ApiResponse<User & { roles: any[] }>> {
    if (useMock) return mockApi.getProfile() as any
    return service.get('/users/me').then(r => r.data)
  },

  /** PUT /users/me - 更新个人信息 */
  updateProfile(data: { nickname?: string; avatar?: string; gender?: number; bio?: string; birthday?: string }): Promise<ApiResponse<User>> {
    if (useMock) return Promise.resolve({ code: 0, message: 'ok', data: { ...data } as User })
    return service.put('/users/me', data).then(r => r.data)
  },

  /** GET /users/me/roles - 获取当前用户角色 */
  getMyRoles(): Promise<ApiResponse<any[]>> {
    return service.get('/users/me/roles').then(r => r.data)
  }
}

// ===== AI工具API =====
export const toolApi = {
  /** GET /ai/categories - 获取工具分类 */
  getCategories(): Promise<ApiResponse<ToolCategory[]>> {
    if (useMock) return mockApi.getCategories() as any
    return service.get('/ai/categories').then(r => r.data)
  },

  /** GET /ai/tools - 获取工具列表 */
  getTools(params?: { categoryId?: number; toolType?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<Tool>>> {
    if (useMock) return mockApi.getTools(params) as any
    return service.get('/ai/tools', { params }).then(r => r.data)
  },

  /** GET /ai/tools/:id - 获取工具详情 */
  getToolDetail(id: number | string): Promise<ApiResponse<Tool>> {
    if (useMock) return mockApi.getToolDetail(id) as any
    return service.get(`/ai/tools/${id}`).then(r => r.data)
  },

  /** POST /ai/tools/:id/call - 调用AI工具 */
  callTool(id: number | string, input: { text?: string; params?: Record<string, any>; files?: string[] }): Promise<ApiResponse<AiCallRecord>> {
    if (useMock) return mockApi.callTool(id, input) as any
    return service.post(`/ai/tools/${id}/call`, input).then(r => r.data)
  },

  /** GET /ai/history - 获取调用历史 */
  getHistory(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<AiCallRecord>>> {
    return service.get('/ai/history', { params }).then(r => r.data)
  },

  /** GET /ai/quota/:toolId - 查询每日配额 */
  getQuota(toolId: number): Promise<ApiResponse<{ used: number; limit: number; date: string }>> {
    return service.get(`/ai/quota/${toolId}`).then(r => r.data)
  },

  /** POST /ai/tools/:toolId/chat - AI文本对话 */
  chat(toolId: number, messages: ChatMessage[], options?: {
    model?: string; temperature?: number; maxTokens?: number; stream?: boolean; systemPrompt?: string
  }): Promise<ApiResponse<ChatResult>> {
    return service.post(`/ai/tools/${toolId}/chat`, {
      messages,
      model: options?.model,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      stream: options?.stream,
      systemPrompt: options?.systemPrompt,
    }).then(r => r.data)
  },

  /** POST /ai/tools/:toolId/generate - AI图像生成 */
  generateImage(toolId: number, prompt: string, options?: ImageOptions): Promise<ApiResponse<ImageResult>> {
    return service.post(`/ai/tools/${toolId}/generate`, {
      prompt,
      ...options,
    }).then(r => r.data)
  },

  /** GET /ai/models - 获取所有可用模型 */
  getModels(category?: string): Promise<ApiResponse<ProviderModelGroup[]>> {
    return service.get('/ai/models', { params: { category } }).then(r => r.data)
  },

  /** GET /ai/providers - 获取Provider状态 */
  getProviders(): Promise<ApiResponse<ProviderStatus[]>> {
    return service.get('/ai/providers').then(r => r.data)
  },
}

// ===== 支付API =====
export const paymentApi = {
  /** GET /payment/coin/balance - 查询圣点余额 */
  getBalance(): Promise<ApiResponse<CoinAccount>> {
    if (useMock) return mockApi.getBalance() as any
    return service.get('/payment/coin/balance').then(r => r.data)
  },

  /** GET /payment/coin/packages - 获取充值套餐列表 */
  getPackages(): Promise<ApiResponse<RechargePackage[]>> {
    if (useMock) return mockApi.getPackages() as any
    return service.get('/payment/coin/packages').then(r => r.data)
  },

  /** POST /payment/coin/recharge - 创建充值订单 */
  recharge(packageId: number): Promise<ApiResponse<{ paymentTransaction: PaymentTransaction; coinAmount: number }>> {
    if (useMock) return mockApi.recharge(packageId) as any
    return service.post('/payment/coin/recharge', { packageId }).then(r => r.data)
  },

  /** GET /payment/coin/transactions - 查询圣点交易记录 */
  getTransactions(params?: { type?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<CoinTransaction>>> {
    if (useMock) return mockApi.getTransactions(params) as any
    return service.get('/payment/coin/transactions', { params }).then(r => r.data)
  },

  /** GET /payment/orders - 查询支付订单 */
  getOrders(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<PaymentTransaction>>> {
    if (useMock) return mockApi.getPaymentOrders() as any
    return service.get('/payment/orders', { params }).then(r => r.data)
  }
}

// ===== 管理API =====
export const adminApi = {
  /** GET /users - 获取用户列表(管理员) */
  getUsers(params?: { page?: number; pageSize?: number; status?: string }): Promise<ApiResponse<PageResult<User>>> {
    if (useMock) return mockApi.getUsers() as any
    return service.get('/users', { params }).then(r => r.data)
  },

  /** GET /users/:id - 获取指定用户(管理员) */
  getUserById(id: number): Promise<ApiResponse<User>> {
    return service.get(`/users/${id}`).then(r => r.data)
  },

  /** PUT /users/:id/status - 更新用户状态 */
  updateUserStatus(id: number, status: string): Promise<ApiResponse<{ message: string }>> {
    return service.put(`/users/${id}/status`, { status }).then(r => r.data)
  },

  /** GET /ai/tools - 获取工具列表(管理复用) */
  getAdminTools(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<Tool>>> {
    if (useMock) return mockApi.getTools() as any
    return service.get('/ai/tools', { params }).then(r => r.data)
  },

  /** GET /payment/orders - 获取支付订单(管理复用) */
  getOrders(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<PaymentTransaction>>> {
    if (useMock) return mockApi.getPaymentOrders() as any
    return service.get('/payment/orders', { params }).then(r => r.data)
  },

  /** GET /system/logs - 获取操作日志 */
  getLogs(params?: { module?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<any>>> {
    return service.get('/system/logs', { params }).then(r => r.data)
  },

  /** GET /roles - 获取角色列表 */
  getRoles(): Promise<ApiResponse<any[]>> {
    return service.get('/roles').then(r => r.data)
  },

  /** GET /notifications - 获取通知列表 */
  getNotifications(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<any>>> {
    return service.get('/notifications', { params }).then(r => r.data)
  },

  /** GET /notifications/unread-count - 获取未读通知数 */
  getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return service.get('/notifications/unread-count').then(r => r.data)
  }
}
