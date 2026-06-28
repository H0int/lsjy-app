import service from './request'

import { mockApi } from './mock'
import type {
  ApiResponse, User, Tool, CoinTransaction, CoinAccount,
  PaymentTransaction, RechargePackage, LoginResult, TokenInfo,
  PageResult, AiCallRecord, ToolCategory,
  ChatMessage, ChatResult, ImageOptions, ImageResult,
  ProviderStatus, ProviderModelGroup,
  Announcement, Coupon, Campaign, Ticket, FAQItem,
  AutomationRule, ModerationItem, ReportData
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
  updateProfile(data: { nickname?: string; avatar?: string; gender?: number; bio?: string; birthday?: string; phone?: string; email?: string }): Promise<ApiResponse<User>> {
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
  getTools(params?: { categoryId?: number; toolType?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<Tool>>> {
    if (useMock) return mockApi.getTools(params) as any
    return service.get('/ai/tools', { params }).then(r => r.data)
  },
  getToolDetail(id: number | string): Promise<ApiResponse<Tool>> {
    if (useMock) return mockApi.getToolDetail(id) as any
    return service.get(`/ai/tools/${id}`).then(r => r.data)
  },
  callTool(id: number | string, input: { text?: string; params?: Record<string, any>; files?: string[] }): Promise<ApiResponse<AiCallRecord>> {
    if (useMock) return mockApi.callTool(id, input) as any
    return service.post(`/ai/tools/${id}/call`, input).then(r => r.data)
  },
  getHistory(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<AiCallRecord>>> {
    return service.get('/ai/history', { params }).then(r => r.data)
  },
  getQuota(toolId: number): Promise<ApiResponse<{ used: number; limit: number; date: string }>> {
    return service.get(`/ai/quota/${toolId}`).then(r => r.data)
  },
  chat(toolId: number, messages: ChatMessage[], options?: {
    model?: string; temperature?: number; maxTokens?: number; stream?: boolean; systemPrompt?: string
  }): Promise<ApiResponse<ChatResult>> {
    if (useMock) return mockApi.chat(toolId, messages, options) as any
    return service.post(`/ai/tools/${toolId}/chat`, {
      messages, model: options?.model, temperature: options?.temperature,
      maxTokens: options?.maxTokens, stream: options?.stream, systemPrompt: options?.systemPrompt,
    }).then(r => r.data)
  },
  generateImage(toolId: number, prompt: string, options?: ImageOptions): Promise<ApiResponse<ImageResult>> {
    if (useMock) return mockApi.generateImage(toolId, prompt, options) as any
    return service.post(`/ai/tools/${toolId}/generate`, { prompt, ...options }).then(r => r.data)
  },
  getModels(category?: string): Promise<ApiResponse<ProviderModelGroup[]>> {
    if (useMock) return mockApi.getModels(category) as any
    return service.get('/ai/models', { params: { category } }).then(r => r.data)
  },
  getProviders(): Promise<ApiResponse<ProviderStatus[]>> {
    if (useMock) {
      return Promise.resolve({
        code: 0, message: 'success',
        data: [
          { name: 'doubao', displayName: '豆包', status: 'healthy', latencyMs: 120 },
          { name: 'jimeng', displayName: '即梦', status: 'healthy', latencyMs: 200 },
          { name: 'openai', displayName: 'OpenAI', status: 'healthy', latencyMs: 350 },
          { name: 'tongyi', displayName: '通义千问', status: 'healthy', latencyMs: 150 },
        ]
      })
    }
    return service.get('/ai/providers').then(r => r.data)
  },
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
  recharge(packageId: number, paymentMethod?: string): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.recharge(packageId) as any
    return service.post('/payment/coin/recharge', { packageId, paymentMethod }).then(r => r.data)
  },
  getTransactions(params?: { type?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<CoinTransaction>>> {
    if (useMock) return mockApi.getTransactions(params) as any
    return service.get('/payment/coin/transactions', { params }).then(r => r.data)
  },
  getOrders(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<PaymentTransaction>>> {
    if (useMock) return mockApi.getPaymentOrders() as any
    return service.get('/payment/orders', { params }).then(r => r.data)
  }
}

// ===== 管理API =====
export const adminApi = {
  /** 用户管理 */
  getUsers(params?: { page?: number; pageSize?: number; status?: string }): Promise<ApiResponse<PageResult<User>>> {
    if (useMock) return mockApi.getUsers(params) as any
    return service.get('/users', { params }).then(r => r.data)
  },
  getUserById(id: number): Promise<ApiResponse<User>> {
    return service.get(`/users/${id}`).then(r => r.data)
  },
  updateUserStatus(id: number, status: string): Promise<ApiResponse<{ message: string }>> {
    if (useMock) return mockApi.updateUserStatus(id, status) as any
    return service.put(`/users/${id}/status`, { status }).then(r => r.data)
  },
  saveUser(data: { id?: number | null; username?: string; nickname: string; phone?: string; email?: string; roles?: string[]; status?: string; password?: string }): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.saveUser(data) as any
    if (data.id) return service.put(`/users/${data.id}`, data).then(r => r.data)
    return service.post('/users', data).then(r => r.data)
  },
  deleteUser(id: number): Promise<ApiResponse<{ message: string }>> {
    return service.delete(`/users/${id}`).then(r => r.data)
  },

  /** 工具管理 */
  getAdminTools(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<Tool>>> {
    if (useMock) return mockApi.getAdminTools(params) as any
    return service.get('/ai/tools', { params }).then(r => r.data)
  },
  getCategories(): Promise<ApiResponse<ToolCategory[]>> {
    if (useMock) return mockApi.getCategories() as any
    return service.get('/ai/categories').then(r => r.data)
  },
  saveTool(data: any): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.saveTool(data) as any
    if (data.id) return service.put(`/ai/tools/${data.id}`, data).then(r => r.data)
    return service.post('/ai/tools', data).then(r => r.data)
  },
  updateToolStatus(id: number, status: string): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.updateToolStatus(id, status) as any
    return service.put(`/ai/tools/${id}/status`, { status }).then(r => r.data)
  },

  /** 订单管理 */
  getOrders(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<PaymentTransaction>>> {
    if (useMock) return mockApi.getPaymentOrders() as any
    return service.get('/payment/orders', { params }).then(r => r.data)
  },
  confirmOrder(id: number): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.confirmOrder(id) as any
    return service.put(`/payment/orders/${id}/confirm`).then(r => r.data)
  },

  /** 公告管理 */
  getAnnouncements(): Promise<ApiResponse<Announcement[]>> {
    if (useMock) return mockApi.getAnnouncements() as any
    return service.get('/announcements').then(r => r.data)
  },
  createAnnouncement(data: any): Promise<ApiResponse<Announcement>> {
    if (useMock) return mockApi.createAnnouncement(data) as any
    return service.post('/announcements', data).then(r => r.data)
  },
  updateAnnouncement(id: number, data: any): Promise<ApiResponse<Announcement>> {
    if (useMock) return mockApi.updateAnnouncement(id, data) as any
    return service.put(`/announcements/${id}`, data).then(r => r.data)
  },
  deleteAnnouncement(id: number): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.deleteAnnouncement(id) as any
    return service.delete(`/announcements/${id}`).then(r => r.data)
  },

  /** 优惠券管理 */
  getCoupons(): Promise<ApiResponse<Coupon[]>> {
    if (useMock) return mockApi.getCoupons() as any
    return service.get('/coupons').then(r => r.data)
  },
  createCoupon(data: any): Promise<ApiResponse<Coupon>> {
    if (useMock) return mockApi.createCoupon(data) as any
    return service.post('/coupons', data).then(r => r.data)
  },
  updateCoupon(id: number, data: any): Promise<ApiResponse<Coupon>> {
    if (useMock) return mockApi.updateCoupon(id, data) as any
    return service.put(`/coupons/${id}`, data).then(r => r.data)
  },
  deleteCoupon(id: number): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.deleteCoupon(id) as any
    return service.delete(`/coupons/${id}`).then(r => r.data)
  },

  /** 活动管理 */
  getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    if (useMock) return mockApi.getCampaigns() as any
    return service.get('/campaigns').then(r => r.data)
  },
  createCampaign(data: any): Promise<ApiResponse<Campaign>> {
    if (useMock) return mockApi.createCampaign(data) as any
    return service.post('/campaigns', data).then(r => r.data)
  },
  deleteCampaign(id: number): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.deleteCampaign(id) as any
    return service.delete(`/campaigns/${id}`).then(r => r.data)
  },

  /** 工单管理 */
  getTickets(): Promise<ApiResponse<Ticket[]>> {
    if (useMock) return mockApi.getTickets() as any
    return service.get('/tickets').then(r => r.data)
  },
  replyTicket(id: number, content: string): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.replyTicket(id, content) as any
    return service.post(`/tickets/${id}/reply`, { content }).then(r => r.data)
  },
  resolveTicket(id: number): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.resolveTicket(id) as any
    return service.post(`/tickets/${id}/resolve`).then(r => r.data)
  },
  assignTicket(id: number, assigneeId: number, assigneeName: string): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.assignTicket(id, assigneeId, assigneeName) as any
    return service.post(`/tickets/${id}/assign`, { assigneeId, assigneeName }).then(r => r.data)
  },

  /** FAQ管理 */
  getFAQs(): Promise<ApiResponse<FAQItem[]>> {
    if (useMock) return mockApi.getFAQs() as any
    return service.get('/faqs/admin/list').then(r => r.data)
  },
  createFAQ(data: any): Promise<ApiResponse<FAQItem>> {
    if (useMock) return mockApi.createFAQ(data) as any
    return service.post('/faqs', data).then(r => r.data)
  },
  updateFAQ(id: number, data: any): Promise<ApiResponse<FAQItem>> {
    if (useMock) return mockApi.updateFAQ(id, data) as any
    return service.put(`/faqs/${id}`, data).then(r => r.data)
  },
  deleteFAQ(id: number): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.deleteFAQ(id) as any
    return service.delete(`/faqs/${id}`).then(r => r.data)
  },

  /** 自动化规则 */
  getAutomationRules(): Promise<ApiResponse<AutomationRule[]>> {
    if (useMock) return mockApi.getAutomationRules() as any
    return service.get('/automation/rules').then(r => r.data)
  },
  createRule(data: any): Promise<ApiResponse<AutomationRule>> {
    if (useMock) return mockApi.createRule(data) as any
    return service.post('/automation/rules', data).then(r => r.data)
  },
  toggleRule(id: number): Promise<ApiResponse<AutomationRule>> {
    if (useMock) return mockApi.toggleRule(id) as any
    return service.put(`/automation/rules/${id}/toggle`).then(r => r.data)
  },
  deleteRule(id: number): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.deleteRule(id) as any
    return service.delete(`/automation/rules/${id}`).then(r => r.data)
  },
  getRuleLogs(id: number, params?: { page?: number; pageSize?: number }): Promise<ApiResponse<any>> {
    return service.get(`/automation/rules/${id}/logs`, { params }).then(r => r.data)
  },

  /** 内容审核 */
  getContentModerations(): Promise<ApiResponse<ModerationItem[]>> {
    if (useMock) return mockApi.getContentModerations() as any
    return service.get('/moderation/list').then(r => r.data)
  },
  approveContent(id: number): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.approveContent(id) as any
    return service.post(`/moderation/${id}/approve`).then(r => r.data)
  },
  rejectContent(id: number, reason: string): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.rejectContent(id, reason) as any
    return service.post(`/moderation/${id}/reject`, { reason }).then(r => r.data)
  },

  /** 系统日志 */
  getSystemLogs(params?: { module?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<any>>> {
    if (useMock) return mockApi.getSystemLogs() as any
    return service.get('/system/logs', { params }).then(r => r.data)
  },

  /** 系统配置 */
  getSystemSettings(): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.getSystemSettings() as any
    return service.get('/system/settings').then(r => r.data)
  },
  saveSystemSettings(data: any): Promise<ApiResponse<any>> {
    if (useMock) return mockApi.saveSystemSettings(data) as any
    return service.put('/system/settings', data).then(r => r.data)
  },

  /** 数据报表 */
  getDataReports(range?: string): Promise<ApiResponse<ReportData[]>> {
    if (useMock) return mockApi.getDataReports(range) as any
    return service.get('/reports/overview', { params: { range } }).then(r => r.data)
  },

  /** 角色和通知 */
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
  /** POST /visitors/checkin - 访客签到 */
  checkin(page?: string, referer?: string): Promise<ApiResponse<any>> {
    return service.post('/visitors/checkin', { page: page || '/', referer: referer || '' }).then(r => r.data)
  },

  /** GET /visitors/stats - 获取访客统计 */
  getStats(): Promise<ApiResponse<any>> {
    return service.get('/visitors/stats').then(r => r.data)
  },

  /** GET /visitors/list - 获取访客列表(管理) */
  getList(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<any>> {
    return service.get('/visitors/list', { params }).then(r => r.data)
  }
}
