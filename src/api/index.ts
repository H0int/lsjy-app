import service from './request'
import { mockApi } from './mock'
import type {
  ApiResponse, User, Tool, CoinTransaction, CoinAccount,
  PaymentTransaction, RechargePackage, LoginResult, TokenInfo,
  PageResult, AiCallRecord, ToolCategory
} from '@/types'

const useMock = import.meta.env.VITE_MOCK === 'true'

// ===== 认证API =====
export const authApi = {
  login(username: string, password: string): Promise<ApiResponse<LoginResult>> {
    if (useMock) return mockApi.login() as any
    return service.post('/auth/login', { username, password }).then(r => r.data)
  },
  register(data: { username: string; password: string; nickname: string; email?: string; phone?: string }): Promise<ApiResponse<LoginResult>> {
    if (useMock) return mockApi.register() as any
    return service.post('/auth/register', data).then(r => r.data)
  },
  refreshToken(refreshToken: string): Promise<ApiResponse<TokenInfo>> {
    return service.post('/auth/refresh', { refreshToken }).then(r => r.data)
  },
  logout(): Promise<ApiResponse<{ message: string }>> {
    return service.post('/auth/logout').then(r => r.data)
  },
  changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return service.post('/auth/change-password', { oldPassword, newPassword }).then(r => r.data)
  }
}

// ===== 用户API =====
export const userApi = {
  getProfile(): Promise<ApiResponse<User & { roles: any[] }>> {
    if (useMock) return mockApi.getProfile() as any
    return service.get('/users/me').then(r => r.data)
  },
  updateProfile(data: { nickname?: string; avatar?: string; gender?: number; bio?: string; birthday?: string }): Promise<ApiResponse<User>> {
    if (useMock) return Promise.resolve({ code: 0, message: 'ok', data: { ...data } as User })
    return service.put('/users/me', data).then(r => r.data)
  },
  getMyRoles(): Promise<ApiResponse<any[]>> {
    return service.get('/users/me/roles').then(r => r.data)
  }
}

// ===== AI工具API =====
export const toolApi = {
  getCategories(): Promise<ApiResponse<ToolCategory[]>> {
    if (useMock) return mockApi.getCategories() as any
    return service.get('/ai/categories').then(r => r.data)
  },
  getTools(params?: { categoryId?: number; subCategory?: string; toolType?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<Tool>>> {
    if (useMock) return mockApi.getTools(params) as any
    return service.get('/ai/tools', { params }).then(r => r.data)
  },
  getToolDetail(id: number | string): Promise<ApiResponse<Tool>> {
    if (useMock) return mockApi.getToolDetail(id) as any
    return service.get(`/ai/tools/${id}`).then(r => r.data)
  },
  callTool(id: number | string, input: { text?: string; params?: Record<string, any>; files?: string[] }): Promise<ApiResponse<AiCallRecord>> {
    if (useMock) return mockApi.callTool(id, input) as any
    return service.post(`/ai/tools/${id}/call`, input, { timeout: 60000 }).then(r => r.data)
  },
  generateImage(id: number | string, params: { prompt: string; width?: number; height?: number; size?: string; style?: string; count?: number; quality?: string }): Promise<ApiResponse<any>> {
    return service.post(`/ai/tools/${id}/generate`, params, { timeout: 180000 }).then(r => r.data)
  },
  /** POST /ai/tools/:id/video - 生成视频（支持时长/分辨率参数） */
  generateVideo(id: number | string, params: { prompt: string; duration?: number; resolution?: string; style?: string; engine?: string }): Promise<ApiResponse<any>> {
    return service.post(`/ai/tools/${id}/video`, params, { timeout: 300000 }).then(r => r.data)
  },
  getVideoTask(taskId: string): Promise<ApiResponse<any>> {
    return service.get(`/ai/video/tasks/${taskId}`, { timeout: 60000 }).then(r => r.data)
  },
  getHistory(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<AiCallRecord>>> {
    return service.get('/ai/history', { params }).then(r => r.data)
  },
  getWorks(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<AiCallRecord>>> {
    return service.get('/ai/works', { params }).then(r => r.data)
  },
  getQuota(toolId: number): Promise<ApiResponse<{ used: number; limit: number; date: string }>> {
    return service.get(`/ai/quota/${toolId}`).then(r => r.data)
  }
}

// ===== 支付API =====
export const paymentApi = {
  getBalance(): Promise<ApiResponse<CoinAccount>> {
    if (useMock) return mockApi.getBalance() as any
    return service.get('/payment/coin/balance').then(r => r.data)
  },
  getPackages(): Promise<ApiResponse<RechargePackage[]>> {
    if (useMock) return mockApi.getPackages() as any
    return service.get('/payment/coin/packages').then(r => r.data)
  },
  recharge(packageId: number, extra?: { payMethod?: string; note?: string; screenshotUrl?: string }): Promise<ApiResponse<{ paymentTransaction: PaymentTransaction; coinAmount: number }>> {
    if (useMock) return mockApi.recharge(packageId) as any
    return service.post('/payment/coin/recharge', { packageId, ...extra }).then(r => r.data)
  },
  submitScreenshot(orderId: number, screenshotUrl: string): Promise<ApiResponse<{ order: PaymentTransaction }>> {
    return service.post('/payment/coin/submit-screenshot', { orderId, screenshotUrl }).then(r => r.data)
  },
  getTransactions(params?: { type?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<CoinTransaction>>> {
    if (useMock) return mockApi.getTransactions(params) as any
    return service.get('/payment/coin/transactions', { params }).then(r => r.data)
  },
  getOrders(params?: { page?: number; pageSize?: number; status?: string }): Promise<ApiResponse<PageResult<PaymentTransaction>>> {
    if (useMock) return mockApi.getPaymentOrders() as any
    return service.get('/payment/orders', { params }).then(r => r.data)
  }
}

// ===== 管理API =====
export const adminApi = {
  getUsers(params?: { page?: number; pageSize?: number; status?: string }): Promise<ApiResponse<PageResult<User>>> {
    if (useMock) return mockApi.getUsers() as any
    return service.get('/users', { params }).then(r => r.data)
  },
  getUserById(id: number): Promise<ApiResponse<User>> {
    return service.get(`/users/${id}`).then(r => r.data)
  },
  updateUserStatus(id: number, status: string): Promise<ApiResponse<{ message: string }>> {
    return service.put(`/users/${id}/status`, { status }).then(r => r.data)
  },
  getAdminTools(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<Tool>>> {
    if (useMock) return mockApi.getTools() as any
    return service.get('/ai/tools', { params }).then(r => r.data)
  },
  getOrders(params?: { page?: number; pageSize?: number; status?: string }): Promise<ApiResponse<PageResult<PaymentTransaction>>> {
    if (useMock) return mockApi.getPaymentOrders() as any
    return service.get('/payment/orders', { params }).then(r => r.data)
  },
  approveOrder(id: number): Promise<ApiResponse<{ message: string }>> {
    return service.post(`/payment/coin/approve/${id}`, { action: 'approve' }).then(r => r.data)
  },
  rejectOrder(id: number, reason?: string): Promise<ApiResponse<{ message: string }>> {
    return service.post(`/payment/coin/approve/${id}`, { action: 'reject', remark: reason }).then(r => r.data)
  },
  getLogs(params?: { module?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<any>>> {
    return service.get('/system/logs', { params }).then(r => r.data)
  },
  getDashboard(): Promise<ApiResponse<any>> {
    return service.get('/admin/dashboard', { timeout: 60000 }).then(r => r.data)
  },
  getChatHistory(params?: { keyword?: string; agent?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number }): Promise<ApiResponse<any>> {
    return service.get('/admin/chat-history', { params, timeout: 30000 }).then(r => r.data)
  },
  rechargeUser(userId: number, amount: number): Promise<ApiResponse<any>> {
    return service.post('/admin/users/recharge', { userId, amount, description: '管理员后台充值' }).then(r => r.data)
  },
  getCoinPackages(): Promise<ApiResponse<any[]>> {
    return service.get('/admin/coin-packages').then(r => r.data)
  },
  createCoinPackage(data: any): Promise<ApiResponse<any>> {
    return service.post('/admin/coin-packages', data).then(r => r.data)
  },
  updateCoinPackage(id: number, data: any): Promise<ApiResponse<any>> {
    return service.put(`/admin/coin-packages/${id}`, data).then(r => r.data)
  },
  deleteCoinPackage(id: number): Promise<ApiResponse<any>> {
    return service.delete(`/admin/coin-packages/${id}`).then(r => r.data)
  },
  getRechargeOrders(params?: { page?: number; pageSize?: number; status?: string }): Promise<ApiResponse<any>> {
    return service.get('/payment/coin/orders', { params }).then(r => r.data)
  },
  getRoles(): Promise<ApiResponse<any[]>> {
    return service.get('/roles').then(r => r.data)
  },
  getNotifications(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<any>>> {
    return service.get('/notifications', { params }).then(r => r.data)
  },
  getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return service.get('/notifications/unread-count').then(r => r.data)
  }
}

// ===== 访客中心API =====
export const visitorApi = {
  checkin(page?: string, referer?: string): Promise<ApiResponse<any>> {
    return service.post('/visitors/checkin', { page: page || '/', referer: referer || '' }).then(r => r.data)
  },
  getStats(): Promise<ApiResponse<any>> {
    return service.get('/visitors/stats').then(r => r.data)
  },
  getList(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<any>> {
    return service.get('/visitors/list', { params }).then(r => r.data)
  }
}
