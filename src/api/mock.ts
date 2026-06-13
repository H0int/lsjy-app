import type {
  User, Tool, CoinTransaction, CoinAccount, PaymentTransaction,
  RechargePackage, LoginResult, PageResult, AiCallRecord, ToolCategory
} from '@/types'

// ===== Mock用户数据 =====
export const mockUser: User = {
  id: 1, username: 'admin', nickname: '罗凯中', avatar: null,
  email: 'admin@lsjyapp.cn', phone: '13800138888',
  gender: 1, bio: '平台管理员', userType: 'personal', vipLevel: 3,
  status: 'active', roles: ['super_admin'],
  createdAt: '2026-01-15T10:00:00.000Z', updatedAt: '2026-06-01T08:30:00.000Z',
  lastLoginAt: '2026-06-10T14:00:00.000Z'
}

export const mockCoinAccount: CoinAccount = {
  id: 1, userId: 1, balance: 2580, frozenAmount: 0,
  totalRecharge: 5000, totalConsumed: 2420, totalEarned: 0, totalWithdrawn: 0,
  status: 'active'
}

export const mockCategories: ToolCategory[] = [
  { id: 1, name: 'AI人工智能', slug: 'ai', icon: '🤖', description: 'AI生成工具', module: 'ai', toolCount: 6 },
  { id: 2, name: '自媒体', slug: 'media', icon: '📱', description: '自媒体工具', module: 'media', toolCount: 2 },
  { id: 3, name: '电商', slug: 'ecommerce', icon: '🛒', description: '电商工具', module: 'shop', toolCount: 1 },
  { id: 4, name: '宠物', slug: 'pet', icon: '🐾', description: '宠物健康', module: 'pet', toolCount: 1 },
  { id: 5, name: '教育', slug: 'education', icon: '📚', description: '教学工具', module: 'edu', toolCount: 1 },
  { id: 6, name: '伯雅校园', slug: 'campus', icon: '🎓', description: '校园服务', module: 'campus', toolCount: 1 },
]

export const mockTools: Tool[] = [
  { id: 1, categoryId: 1, name: 'AI文案创作', slug: 'ai-copywriting', description: '短视频/团购/种草/朋友圈文案', icon: '✍️', provider: 'openai', modelId: 'gpt-4o', toolType: 'text', inputType: 'text', outputType: 'text', coinCost: 10, isFree: 0, freeDailyLimit: 0, usageCount: 12580, sortOrder: 1, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, categoryId: 1, name: 'AI文生图', slug: 'ai-image', description: '文字描述生成高清图片', icon: '🎨', provider: 'stability', modelId: 'sd-xl', toolType: 'image', inputType: 'text', outputType: 'image', coinCost: 20, isFree: 0, freeDailyLimit: 0, usageCount: 8920, sortOrder: 2, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 3, categoryId: 1, name: 'AI视频生成', slug: 'ai-video', description: 'Seedance 2.0 AI文生视频', icon: '🎬', provider: 'bytedance', modelId: 'seedance-2.0', toolType: 'video', inputType: 'text', outputType: 'video', coinCost: 80, isFree: 0, freeDailyLimit: 0, usageCount: 5430, sortOrder: 3, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 4, categoryId: 2, name: '爆款脚本', slug: 'viral-script', description: 'AI生成爆款短视频脚本', icon: '📝', provider: 'openai', modelId: 'gpt-4o', toolType: 'text', inputType: 'text', outputType: 'text', coinCost: 50, isFree: 0, freeDailyLimit: 0, usageCount: 3210, sortOrder: 4, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 5, categoryId: 2, name: '短视频解析', slug: 'video-parser', description: '无水印视频下载', icon: '📥', provider: 'local', modelId: 'parser', toolType: 'other', inputType: 'text', outputType: 'file', coinCost: 0, isFree: 1, freeDailyLimit: 10, usageCount: 25600, sortOrder: 5, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 6, categoryId: 3, name: '商品文案', slug: 'product-copy', description: '电商商品详情描述', icon: '🏷️', provider: 'openai', modelId: 'gpt-4o', toolType: 'text', inputType: 'text', outputType: 'text', coinCost: 10, isFree: 0, freeDailyLimit: 0, usageCount: 4560, sortOrder: 6, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 7, categoryId: 4, name: '症状自查', slug: 'pet-symptom', description: '宠物常见症状分析', icon: '🐾', provider: 'openai', modelId: 'gpt-4o', toolType: 'analysis', inputType: 'text', outputType: 'text', coinCost: 5, isFree: 0, freeDailyLimit: 0, usageCount: 2100, sortOrder: 7, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 8, categoryId: 5, name: '教案生成', slug: 'lesson-plan', description: '课堂教学教案编写', icon: '📚', provider: 'openai', modelId: 'gpt-4o', toolType: 'text', inputType: 'text', outputType: 'text', coinCost: 12, isFree: 0, freeDailyLimit: 0, usageCount: 1890, sortOrder: 8, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 9, categoryId: 6, name: '创业计划书', slug: 'business-plan', description: '大学生创业计划书', icon: '💼', provider: 'openai', modelId: 'gpt-4o', toolType: 'text', inputType: 'text', outputType: 'text', coinCost: 15, isFree: 0, freeDailyLimit: 0, usageCount: 980, sortOrder: 9, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 10, categoryId: 1, name: 'AI智能抠图', slug: 'ai-cutout', description: '智能去除图片背景', icon: '✂️', provider: 'local', modelId: 'rembg', toolType: 'image', inputType: 'image', outputType: 'image', coinCost: 10, isFree: 0, freeDailyLimit: 0, usageCount: 7650, sortOrder: 10, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 11, categoryId: 1, name: '数字人口播', slug: 'digital-human', description: 'AI脚本+数字人形象', icon: '🧑‍💼', provider: 'bytedance', modelId: 'digital-human-v2', toolType: 'video', inputType: 'text', outputType: 'video', coinCost: 100, isFree: 0, freeDailyLimit: 0, usageCount: 2340, sortOrder: 11, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 12, categoryId: 1, name: '大模型中心', slug: 'llm-center', description: '豆包/DeepSeek/GLM/即梦 全模型', icon: '⚡', provider: 'multi', modelId: 'multi-model', toolType: 'text', inputType: 'text', outputType: 'text', coinCost: 0, isFree: 1, freeDailyLimit: 20, usageCount: 35000, sortOrder: 0, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
]

export const mockPackages: RechargePackage[] = [
  { id: 1, name: '50圣点', coinAmount: 50, price: 29.9, originalPrice: null, bonusCoins: 0, isRecommended: 0, sortOrder: 1 },
  { id: 2, name: '100圣点', coinAmount: 100, price: 49.9, originalPrice: 59.9, bonusCoins: 10, isRecommended: 0, sortOrder: 2 },
  { id: 3, name: '500圣点', coinAmount: 500, price: 199, originalPrice: 299, bonusCoins: 80, isRecommended: 1, sortOrder: 3 },
  { id: 4, name: '1000圣点', coinAmount: 1000, price: 349, originalPrice: 499, bonusCoins: 200, isRecommended: 0, sortOrder: 4 },
  { id: 5, name: '5000圣点', coinAmount: 5000, price: 1499, originalPrice: 2499, bonusCoins: 1500, isRecommended: 0, sortOrder: 5 },
]

export const mockTransactions: CoinTransaction[] = [
  { id: 1, userId: 1, transactionType: 'recharge', amount: 500, balanceBefore: 2080, balanceAfter: 2580, refType: 'recharge', refId: 1, remark: '套餐充值 - 500圣点', createdAt: '2026-06-09T09:00:00.000Z' },
  { id: 2, userId: 1, transactionType: 'consume', amount: -80, balanceBefore: 2580, balanceAfter: 2500, refType: 'ai_tool_call', refId: 3, remark: '调用AI工具: AI视频生成', createdAt: '2026-06-10T14:20:00.000Z' },
  { id: 3, userId: 1, transactionType: 'consume', amount: -10, balanceBefore: 2500, balanceAfter: 2490, refType: 'ai_tool_call', refId: 1, remark: '调用AI工具: AI文案创作', createdAt: '2026-06-10T10:00:00.000Z' },
  { id: 4, userId: 1, transactionType: 'consume', amount: -20, balanceBefore: 2490, balanceAfter: 2470, refType: 'ai_tool_call', refId: 2, remark: '调用AI工具: AI文生图', createdAt: '2026-06-09T16:30:00.000Z' },
  { id: 5, userId: 1, transactionType: 'recharge', amount: 200, balanceBefore: 2270, balanceAfter: 2470, refType: 'recharge', refId: 2, remark: '套餐充值 - 200圣点', createdAt: '2026-06-08T11:00:00.000Z' },
]

export const mockPaymentOrders: PaymentTransaction[] = [
  { id: 1, transactionNo: 'PAY20260609001', userId: 1, bizType: 'recharge', payChannel: 'wechat', amount: 199.00, coinAmount: 580, direction: 'in', status: 'success', remark: '充值: 500圣点', createdAt: '2026-06-09T09:00:00.000Z', paidAt: '2026-06-09T09:01:00.000Z' },
  { id: 2, transactionNo: 'PAY20260608002', userId: 1, bizType: 'recharge', payChannel: 'wechat', amount: 99.90, coinAmount: 210, direction: 'in', status: 'success', remark: '充值: 100圣点', createdAt: '2026-06-08T11:00:00.000Z', paidAt: '2026-06-08T11:01:00.000Z' },
]

export const mockUsers: User[] = [
  mockUser,
  { id: 2, username: 'zhangsan', nickname: '张三', avatar: null, email: 'zhangsan@qq.com', phone: '13900131234', gender: 1, bio: null, userType: 'personal', vipLevel: 1, status: 'active', roles: ['user'], createdAt: '2026-02-20T09:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z', lastLoginAt: '2026-06-10T08:00:00.000Z' },
  { id: 3, username: 'lisi', nickname: '李四', avatar: null, email: 'lisi@163.com', phone: '13700135678', gender: 2, bio: null, userType: 'personal', vipLevel: 0, status: 'active', roles: ['user'], createdAt: '2026-03-15T14:00:00.000Z', updatedAt: '2026-06-05T00:00:00.000Z', lastLoginAt: '2026-06-09T16:00:00.000Z' },
  { id: 4, username: 'wangwu', nickname: '王五', avatar: null, email: 'wangwu@gmail.com', phone: '13600139012', gender: 1, bio: null, userType: 'enterprise', vipLevel: 2, status: 'active', roles: ['merchant'], createdAt: '2026-01-20T10:00:00.000Z', updatedAt: '2026-06-08T00:00:00.000Z', lastLoginAt: '2026-06-10T12:00:00.000Z' },
  { id: 5, username: 'zhaoliu', nickname: '赵六', avatar: null, email: 'zhaoliu@qq.com', phone: '13500133456', gender: 0, bio: null, userType: 'personal', vipLevel: 0, status: 'frozen', roles: ['user'], createdAt: '2026-04-01T08:00:00.000Z', updatedAt: '2026-05-20T00:00:00.000Z', lastLoginAt: '2026-05-15T10:00:00.000Z' },
]

// ===== Mock API =====
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const mockApi = {
  async login() {
    await delay(500)
    const result: LoginResult = {
      user: mockUser,
      accessToken: 'mock_access_token_xxx',
      refreshToken: 'mock_refresh_token_xxx'
    }
    return { code: 0, message: 'success', data: result }
  },

  async register() {
    await delay(500)
    return { code: 0, message: 'success', data: { user: mockUser, accessToken: 'mock_token', refreshToken: 'mock_refresh' } }
  },

  async getProfile() {
    await delay(300)
    return { code: 0, message: 'success', data: { ...mockUser, roles: [{ roleId: 1, roleName: 'super_admin', displayName: '超级管理员', scopeType: 'global' }] } }
  },

  async getCategories() {
    await delay(200)
    return { code: 0, message: 'success', data: mockCategories }
  },

  async getTools(params?: { categoryId?: number; toolType?: string }) {
    await delay(300)
    let list = [...mockTools].filter(t => t.status === 'active')
    if (params?.categoryId) list = list.filter(t => t.categoryId === params.categoryId)
    if (params?.toolType) list = list.filter(t => t.toolType === params.toolType)
    const result: PageResult<Tool> = { items: list, total: list.length, page: 1, pageSize: 20 }
    return { code: 0, message: 'success', data: result }
  },

  async getToolDetail(id: number | string) {
    await delay(200)
    const tool = mockTools.find(t => t.id === Number(id))
    return { code: 0, message: 'success', data: tool }
  },

  async callTool(_id: number | string, input: any) {
    await delay(1000)
    const record: AiCallRecord = {
      id: 100, userId: 1, toolId: Number(_id), requestId: 'mock-req-id',
      inputText: input?.text || '', outputText: '【Mock生成结果】这是一段模拟的AI生成内容。',
      coinCost: 10, status: 'completed', isFavorite: 0, createdAt: new Date().toISOString()
    }
    return { code: 0, message: 'success', data: record }
  },

  async getBalance() {
    await delay(200)
    return { code: 0, message: 'success', data: mockCoinAccount }
  },

  async getPackages() {
    await delay(200)
    return { code: 0, message: 'success', data: mockPackages }
  },

  async recharge(_packageId: number) {
    await delay(500)
    const pkg = mockPackages.find(p => p.id === _packageId)
    return {
      code: 0, message: 'success',
      data: {
        paymentTransaction: { id: 99, transactionNo: 'PAY_MOCK_001', userId: 1, bizType: 'recharge', payChannel: 'wechat', amount: pkg?.price || 0, coinAmount: (pkg?.coinAmount || 0) + (pkg?.bonusCoins || 0), direction: 'in', status: 'pending', remark: `充值: ${pkg?.name}`, createdAt: new Date().toISOString(), paidAt: null },
        coinAmount: (pkg?.coinAmount || 0) + (pkg?.bonusCoins || 0)
      }
    }
  },

  async getTransactions(_params?: any) {
    await delay(300)
    const result: PageResult<CoinTransaction> = { items: mockTransactions, total: mockTransactions.length, page: 1, pageSize: 20 }
    return { code: 0, message: 'success', data: result }
  },

  async getPaymentOrders() {
    await delay(300)
    const result: PageResult<PaymentTransaction> = { items: mockPaymentOrders, total: mockPaymentOrders.length, page: 1, pageSize: 20 }
    return { code: 0, message: 'success', data: result }
  },

  async getUsers() {
    await delay(300)
    const result: PageResult<User> = { items: mockUsers, total: mockUsers.length, page: 1, pageSize: 20 }
    return { code: 0, message: 'success', data: result }
  }
}
