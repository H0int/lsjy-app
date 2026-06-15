import type {
  User, Tool, CoinTransaction, CoinAccount, PaymentTransaction,
  RechargePackage, LoginResult, PageResult, AiCallRecord, ToolCategory,
  Announcement, Coupon, Campaign, Ticket, FAQItem, AutomationRule,
  ModerationItem, ReportData
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
  { id: 2, categoryId: 1, name: 'AI文生图', slug: 'ai-image', description: '文字描述生成高清图片', icon: '🎨', provider: 'jimeng', modelId: 'jimeng-v2', toolType: 'image', inputType: 'text', outputType: 'image', coinCost: 20, isFree: 0, freeDailyLimit: 0, usageCount: 8920, sortOrder: 2, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 3, categoryId: 1, name: 'AI视频生成', slug: 'ai-video', description: 'Seedance 2.0 AI文生视频', icon: '🎬', provider: 'bytedance', modelId: 'seedance-2.0', toolType: 'video', inputType: 'text', outputType: 'video', coinCost: 80, isFree: 0, freeDailyLimit: 0, usageCount: 5430, sortOrder: 3, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 4, categoryId: 2, name: '爆款脚本', slug: 'viral-script', description: 'AI生成爆款短视频脚本', icon: '📝', provider: 'openai', modelId: 'gpt-4o', toolType: 'text', inputType: 'text', outputType: 'text', coinCost: 50, isFree: 0, freeDailyLimit: 0, usageCount: 3210, sortOrder: 4, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 5, categoryId: 2, name: '短视频解析', slug: 'video-parser', description: '无水印视频下载', icon: '📥', provider: 'local', modelId: 'parser', toolType: 'other', inputType: 'text', outputType: 'file', coinCost: 0, isFree: 1, freeDailyLimit: 10, usageCount: 25600, sortOrder: 5, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 6, categoryId: 3, name: '商品文案', slug: 'product-copy', description: '电商商品详情描述', icon: '🏷️', provider: 'openai', modelId: 'gpt-4o', toolType: 'text', inputType: 'text', outputType: 'text', coinCost: 10, isFree: 0, freeDailyLimit: 0, usageCount: 4560, sortOrder: 6, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 7, categoryId: 4, name: '症状自查', slug: 'pet-symptom', description: '宠物常见症状分析', icon: '🐾', provider: 'openai', modelId: 'gpt-4o', toolType: 'analysis', inputType: 'text', outputType: 'text', coinCost: 5, isFree: 0, freeDailyLimit: 0, usageCount: 2100, sortOrder: 7, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 8, categoryId: 5, name: '教案生成', slug: 'lesson-plan', description: '课堂教学教案编写', icon: '📚', provider: 'openai', modelId: 'gpt-4o', toolType: 'text', inputType: 'text', outputType: 'text', coinCost: 12, isFree: 0, freeDailyLimit: 0, usageCount: 1890, sortOrder: 8, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 9, categoryId: 6, name: '创业计划书', slug: 'business-plan', description: '大学生创业计划书', icon: '💼', provider: 'openai', modelId: 'gpt-4o', toolType: 'text', inputType: 'text', outputType: 'text', coinCost: 15, isFree: 0, freeDailyLimit: 0, usageCount: 980, sortOrder: 9, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 10, categoryId: 1, name: 'AI智能抠图', slug: 'ai-cutout', description: '智能去除图片背景', icon: '✂️', provider: 'local', modelId: 'rembg', toolType: 'image', inputType: 'image', outputType: 'image', coinCost: 10, isFree: 0, freeDailyLimit: 0, usageCount: 7650, sortOrder: 10, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 11, categoryId: 1, name: '数字人口播', slug: 'digital-human', description: 'AI脚本+数字人形象', icon: '🧑‍💼', provider: 'bytedance', modelId: 'digital-human-v2', toolType: 'video', inputType: 'text', outputType: 'video', coinCost: 100, isFree: 0, freeDailyLimit: 0, usageCount: 2340, sortOrder: 11, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 12, categoryId: 1, name: '罗圣AI', slug: 'luosheng-ai', description: '罗圣AI大模型中心 - 豆包/DeepSeek/即梦/元宝/千问/GPT 全模型接入', icon: '🧠', provider: 'multi', modelId: 'multi-model', toolType: 'text', inputType: 'text', outputType: 'text', coinCost: 0, isFree: 1, freeDailyLimit: 20, usageCount: 35000, sortOrder: 0, status: 'active', createdAt: '2026-01-01T00:00:00.000Z' },
]

export const mockPackages: RechargePackage[] = [
  { id: 1, name: '50圣力', coinAmount: 50, price: 29.9, originalPrice: null, bonusCoins: 0, isRecommended: 0, sortOrder: 1 },
  { id: 2, name: '100圣力', coinAmount: 100, price: 49.9, originalPrice: 59.9, bonusCoins: 10, isRecommended: 0, sortOrder: 2 },
  { id: 3, name: '500圣力', coinAmount: 500, price: 199, originalPrice: 299, bonusCoins: 80, isRecommended: 1, sortOrder: 3 },
  { id: 4, name: '1000圣力', coinAmount: 1000, price: 349, originalPrice: 499, bonusCoins: 200, isRecommended: 0, sortOrder: 4 },
  { id: 5, name: '5000圣力', coinAmount: 5000, price: 1499, originalPrice: 2499, bonusCoins: 1500, isRecommended: 0, sortOrder: 5 },
]

export const mockTransactions: CoinTransaction[] = [
  { id: 1, userId: 1, transactionType: 'recharge', amount: 500, balanceBefore: 2080, balanceAfter: 2580, refType: 'recharge', refId: 1, remark: '套餐充值 - 500圣力', createdAt: '2026-06-09T09:00:00.000Z' },
  { id: 2, userId: 1, transactionType: 'consume', amount: -80, balanceBefore: 2580, balanceAfter: 2500, refType: 'ai_tool_call', refId: 3, remark: '调用AI工具: AI视频生成', createdAt: '2026-06-10T14:20:00.000Z' },
  { id: 3, userId: 1, transactionType: 'consume', amount: -10, balanceBefore: 2500, balanceAfter: 2490, refType: 'ai_tool_call', refId: 1, remark: '调用AI工具: AI文案创作', createdAt: '2026-06-10T10:00:00.000Z' },
  { id: 4, userId: 1, transactionType: 'consume', amount: -20, balanceBefore: 2490, balanceAfter: 2470, refType: 'ai_tool_call', refId: 2, remark: '调用AI工具: AI文生图', createdAt: '2026-06-09T16:30:00.000Z' },
  { id: 5, userId: 1, transactionType: 'recharge', amount: 200, balanceBefore: 2270, balanceAfter: 2470, refType: 'recharge', refId: 2, remark: '套餐充值 - 200圣力', createdAt: '2026-06-08T11:00:00.000Z' },
]

export const mockPaymentOrders: PaymentTransaction[] = [
  { id: 1, transactionNo: 'PAY20260609001', userId: 1, bizType: 'recharge', payChannel: 'wechat', amount: 199.00, coinAmount: 580, direction: 'in', status: 'success', remark: '充值: 500圣力', createdAt: '2026-06-09T09:00:00.000Z', paidAt: '2026-06-09T09:01:00.000Z' },
  { id: 2, transactionNo: 'PAY20260608002', userId: 1, bizType: 'recharge', payChannel: 'wechat', amount: 99.90, coinAmount: 210, direction: 'in', status: 'success', remark: '充值: 100圣力', createdAt: '2026-06-08T11:00:00.000Z', paidAt: '2026-06-08T11:01:00.000Z' },
  { id: 3, transactionNo: 'PAY20260610003', userId: 2, bizType: 'recharge', payChannel: 'alipay', amount: 49.90, coinAmount: 100, direction: 'in', status: 'pending', remark: '充值: 100圣力', createdAt: '2026-06-10T10:00:00.000Z', paidAt: null },
]

export const mockUsers: User[] = [
  mockUser,
  { id: 2, username: 'zhangsan', nickname: '张三', avatar: null, email: 'zhangsan@qq.com', phone: '13900131234', gender: 1, bio: null, userType: 'personal', vipLevel: 1, status: 'active', roles: ['user'], createdAt: '2026-02-20T09:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z', lastLoginAt: '2026-06-10T08:00:00.000Z' },
  { id: 3, username: 'lisi', nickname: '李四', avatar: null, email: 'lisi@163.com', phone: '13700135678', gender: 2, bio: null, userType: 'personal', vipLevel: 0, status: 'active', roles: ['user'], createdAt: '2026-03-15T14:00:00.000Z', updatedAt: '2026-06-05T00:00:00.000Z', lastLoginAt: '2026-06-09T16:00:00.000Z' },
  { id: 4, username: 'wangwu', nickname: '王五', avatar: null, email: 'wangwu@gmail.com', phone: '13600139012', gender: 1, bio: null, userType: 'enterprise', vipLevel: 2, status: 'active', roles: ['merchant'], createdAt: '2026-01-20T10:00:00.000Z', updatedAt: '2026-06-08T00:00:00.000Z', lastLoginAt: '2026-06-10T12:00:00.000Z' },
  { id: 5, username: 'zhaoliu', nickname: '赵六', avatar: null, email: 'zhaoliu@qq.com', phone: '13500133456', gender: 0, bio: null, userType: 'personal', vipLevel: 0, status: 'frozen', roles: ['user'], createdAt: '2026-04-01T08:00:00.000Z', updatedAt: '2026-05-20T00:00:00.000Z', lastLoginAt: '2026-05-15T10:00:00.000Z' },
]

// ===== Admin mock data =====
export const mockAnnouncements: Announcement[] = [
  { id: 1, title: '平台v3.0版本升级通知', content: '尊敬的用户，平台将于本周六凌晨2:00-6:00进行系统升级维护。', type: 'system', targetScope: 'all', status: 'published', scheduledAt: null, publishedAt: '2025-07-15T08:00:00.000Z', createdBy: 1, createdAt: '2025-07-14T16:00:00.000Z', updatedAt: '2025-07-15T08:00:00.000Z' },
  { id: 2, title: '暑期大促：圣力充值8折优惠', content: '暑期限时活动，7月20日至8月20日期间，所有充值套餐享受8折优惠！', type: 'activity', targetScope: 'all', status: 'published', scheduledAt: null, publishedAt: '2025-07-18T10:00:00.000Z', createdBy: 1, createdAt: '2025-07-17T14:00:00.000Z', updatedAt: '2025-07-18T10:00:00.000Z' },
  { id: 3, title: '自媒体模块新增小红书数据分析', content: '自媒体模块已支持小红书平台数据接入。', type: 'update', targetScope: 'all', status: 'scheduled', scheduledAt: '2025-07-20T09:00:00.000Z', publishedAt: null, createdBy: 1, createdAt: '2025-07-18T11:00:00.000Z', updatedAt: '2025-07-18T11:00:00.000Z' },
  { id: 4, title: '电商模块商家入驻规则调整', content: '为提升平台商品质量，自8月1日起，新入驻商家需提供营业执照。', type: 'system', targetScope: 'merchant', status: 'draft', scheduledAt: null, publishedAt: null, createdBy: 1, createdAt: '2025-07-18T15:00:00.000Z', updatedAt: '2025-07-18T15:00:00.000Z' },
]

export const mockCoupons: Coupon[] = [
  { id: 1, name: '新用户满50减10', type: 'full_reduce', discountValue: 10, minAmount: 50, maxReduce: null, totalQuantity: 5000, usedQuantity: 3280, validFrom: '2025-07-01', validTo: '2025-08-31', issueRule: 'new_user', status: 'active', createdAt: '2025-07-01T00:00:00.000Z' },
  { id: 2, name: '暑期8折优惠券', type: 'discount', discountValue: 8, minAmount: 100, maxReduce: 50, totalQuantity: 2000, usedQuantity: 856, validFrom: '2025-07-15', validTo: '2025-08-15', issueRule: 'activity', status: 'active', createdAt: '2025-07-15T10:00:00.000Z' },
  { id: 3, name: '充值赠送100圣力', type: 'coin_gift', discountValue: 100, minAmount: 200, maxReduce: null, totalQuantity: 1000, usedQuantity: 423, validFrom: '2025-07-01', validTo: '2025-07-31', issueRule: 'consume_threshold', status: 'active', createdAt: '2025-07-01T00:00:00.000Z' },
  { id: 4, name: 'VIP专属9折券', type: 'discount', discountValue: 9, minAmount: 0, maxReduce: 30, totalQuantity: 500, usedQuantity: 120, validFrom: '2025-06-01', validTo: '2025-06-30', issueRule: 'manual', status: 'expired', createdAt: '2025-06-01T00:00:00.000Z' },
]

export const mockCampaigns: Campaign[] = [
  { id: 1, name: '暑期充值大返利', type: 'flash_sale', description: '暑期限时充值返利活动', startTime: '2025-07-20 00:00', endTime: '2025-08-20 23:59', participantCount: 2340, totalReward: 56000, status: 'active', config: {}, createdAt: '2025-07-15T10:00:00.000Z' },
  { id: 2, name: '每日签到领圣力', type: 'check_in', description: '连续签到7天可获得50圣力奖励', startTime: '2025-07-01 00:00', endTime: '2025-09-30 23:59', participantCount: 8920, totalReward: 123000, status: 'active', config: {}, createdAt: '2025-06-28T14:00:00.000Z' },
  { id: 3, name: '邀请好友得奖励', type: 'invite_reward', description: '每邀请一位新用户注册并完成首充，双方各得20圣力', startTime: '2025-07-01 00:00', endTime: '2025-12-31 23:59', participantCount: 1560, totalReward: 31200, status: 'active', config: {}, createdAt: '2025-06-25T09:00:00.000Z' },
  { id: 4, name: '618大促', type: 'flash_sale', description: '618限时折扣，全场AI工具8折', startTime: '2025-06-18 00:00', endTime: '2025-06-20 23:59', participantCount: 15600, totalReward: 280000, status: 'ended', config: {}, createdAt: '2025-06-10T10:00:00.000Z' },
]

export const mockTickets: Ticket[] = [
  { id: 1, ticketNo: 'TK20250718001', userId: 101, userName: '张三', subject: '充值圣力未到账', content: '我在今天上午10点左右充值了200元购买500圣力，支付已成功但圣力没有到账。', category: 'payment', priority: 'high', status: 'open', assigneeId: null, assigneeName: null, replies: [], firstResponseAt: null, resolvedAt: null, createdAt: '2025-07-18T10:30:00.000Z', updatedAt: '2025-07-18T10:30:00.000Z' },
  { id: 2, ticketNo: 'TK20250718002', userId: 102, userName: '李四', subject: 'AI绘画工具无法使用', content: '使用AI绘画工具时一直显示"处理中"，等了30分钟也没有结果。', category: 'tool', priority: 'medium', status: 'processing', assigneeId: 1, assigneeName: '客服小王', replies: [{ id: 1, ticketId: 2, userId: 1, userName: '客服小王', isStaff: true, content: '您好，已收到您的反馈。', createdAt: '2025-07-18T11:00:00.000Z' }], firstResponseAt: '2025-07-18T11:00:00.000Z', resolvedAt: null, createdAt: '2025-07-18T09:45:00.000Z', updatedAt: '2025-07-18T11:00:00.000Z' },
  { id: 3, ticketNo: 'TK20250717003', userId: 103, userName: '王五', subject: '建议增加批量导出功能', content: '希望能增加批量导出AI生成图片的功能。', category: 'suggestion', priority: 'low', status: 'resolved', assigneeId: 2, assigneeName: '客服小李', replies: [{ id: 3, ticketId: 3, userId: 2, userName: '客服小李', isStaff: true, content: '感谢建议！已提交至产品团队。', createdAt: '2025-07-17T15:00:00.000Z' }], firstResponseAt: '2025-07-17T15:00:00.000Z', resolvedAt: '2025-07-17T15:30:00.000Z', createdAt: '2025-07-17T14:20:00.000Z', updatedAt: '2025-07-17T15:30:00.000Z' },
]

export const mockFAQs: FAQItem[] = [
  { id: 1, category: '支付充值', question: '圣力充值后多久到账？', answer: '正常情况下圣力充值即时到账。如超过10分钟未到账，请提交工单联系客服处理。', searchCount: 1256, sortOrder: 1, status: 'active', createdAt: '2025-06-01T10:00:00.000Z', updatedAt: '2025-06-01T10:00:00.000Z' },
  { id: 2, category: 'AI工具', question: 'AI工具调用失败会扣圣力吗？', answer: '不会。如果AI工具调用失败，系统会自动退还消耗的圣力。', searchCount: 980, sortOrder: 2, status: 'active', createdAt: '2025-06-01T10:00:00.000Z', updatedAt: '2025-06-01T10:00:00.000Z' },
  { id: 3, category: '账号相关', question: '如何修改绑定手机号？', answer: '进入个人中心 -> 安全设置 -> 修改手机号。', searchCount: 756, sortOrder: 3, status: 'active', createdAt: '2025-06-01T10:00:00.000Z', updatedAt: '2025-06-01T10:00:00.000Z' },
]

export const mockAutomationRules: AutomationRule[] = [
  { id: 1, name: '新用户欢迎奖励', description: '新用户注册后自动发放20圣力', triggerEvent: 'user_register', triggerCondition: {}, actions: [{ type: 'send_coins', config: { amount: 20 } }], status: 'active', executionCount: 3420, lastExecutedAt: '2025-07-18T14:30:00.000Z', createdAt: '2025-06-01T10:00:00.000Z' },
  { id: 2, name: '消费满100自动升级VIP1', description: '用户累计消费满100圣力自动升级', triggerEvent: 'consume_threshold', triggerCondition: { threshold: 100 }, actions: [{ type: 'change_role', config: { vipLevel: 1 } }], status: 'active', executionCount: 856, lastExecutedAt: '2025-07-18T12:15:00.000Z', createdAt: '2025-06-05T14:00:00.000Z' },
  { id: 3, name: '首次充值双倍返还', description: '用户首次充值额外赠送等额圣力', triggerEvent: 'first_recharge', triggerCondition: {}, actions: [{ type: 'send_coins', config: { amount: 'equal' } }], status: 'active', executionCount: 1230, lastExecutedAt: '2025-07-18T10:00:00.000Z', createdAt: '2025-06-10T09:00:00.000Z' },
]

export const mockModerations: ModerationItem[] = [
  { id: 1, contentType: 'post', contentTitle: '分享我的AI绘画作品', authorName: '张三', authorId: 101, summary: '这是一篇关于AI绘画的分享帖子...', status: 'pending', reason: null, reviewerId: null, reviewerName: null, createdAt: '2025-07-18T14:30:00.000Z', reviewedAt: null },
  { id: 2, contentType: 'comment', contentTitle: '关于课程评价', authorName: '李四', authorId: 102, summary: '这个课程真的很棒，推荐给大家...', status: 'pending', reason: null, reviewerId: null, reviewerName: null, createdAt: '2025-07-18T13:20:00.000Z', reviewedAt: null },
  { id: 3, contentType: 'course', contentTitle: 'Python从入门到精通', authorName: '王老师', authorId: 103, summary: '零基础Python编程课程...', status: 'approved', reason: null, reviewerId: 1, reviewerName: '管理员', createdAt: '2025-07-18T10:00:00.000Z', reviewedAt: '2025-07-18T11:30:00.000Z' },
  { id: 4, contentType: 'product', contentTitle: '手工陶瓷茶杯套装', authorName: '匠心店铺', authorId: 104, summary: '纯手工制作的陶瓷茶杯...', status: 'pending', reason: null, reviewerId: null, reviewerName: null, createdAt: '2025-07-18T09:15:00.000Z', reviewedAt: null },
]

export const mockReportData: ReportData[] = [
  { period: '07-18', newUsers: 234, activeUsers: 5620, revenue: 18900, coinConsumed: 45600, orders: 189, toolCalls: 12340 },
  { period: '07-17', newUsers: 198, activeUsers: 5430, revenue: 16500, coinConsumed: 41200, orders: 165, toolCalls: 11200 },
  { period: '07-16', newUsers: 256, activeUsers: 5890, revenue: 21300, coinConsumed: 52100, orders: 213, toolCalls: 14500 },
  { period: '07-15', newUsers: 187, activeUsers: 5210, revenue: 15200, coinConsumed: 38900, orders: 152, toolCalls: 10800 },
  { period: '07-14', newUsers: 312, activeUsers: 6100, revenue: 25600, coinConsumed: 61200, orders: 256, toolCalls: 16700 },
  { period: '07-13', newUsers: 278, activeUsers: 5950, revenue: 22100, coinConsumed: 54300, orders: 221, toolCalls: 15200 },
  { period: '07-12', newUsers: 145, activeUsers: 4890, revenue: 12300, coinConsumed: 32100, orders: 123, toolCalls: 8900 },
]

// ===== Mock API =====
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let nextId = 100

function genId(): number {
  return ++nextId
}

function paginate<T>(items: T[], page = 1, pageSize = 20): PageResult<T> {
  const start = (page - 1) * pageSize
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize }
}

export const mockApi = {
  async login() {
    await delay(500)
    return { code: 0, message: 'success', data: { user: mockUser, accessToken: 'mock_access_token_xxx', refreshToken: 'mock_refresh_token_xxx' } as LoginResult }
  },

  async register() {
    await delay(500)
    return { code: 0, message: 'success', data: { user: mockUser, accessToken: 'mock_token', refreshToken: 'mock_refresh' } as LoginResult }
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
    return { code: 0, message: 'success', data: paginate(list) }
  },

  async getToolDetail(id: number | string) {
    await delay(200)
    const tool = mockTools.find(t => t.id === Number(id))
    return { code: 0, message: 'success', data: tool }
  },

  async callTool(_id: number | string, input: any) {
    await delay(1000)
    const record: AiCallRecord = {
      id: genId(), userId: 1, toolId: Number(_id), requestId: 'mock-req-id',
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
        paymentTransaction: { id: genId(), transactionNo: 'PAY_MOCK_' + Date.now(), userId: 1, bizType: 'recharge', payChannel: 'wechat', amount: pkg?.price || 0, coinAmount: (pkg?.coinAmount || 0) + (pkg?.bonusCoins || 0), direction: 'in', status: 'pending', remark: `充值: ${pkg?.name}`, createdAt: new Date().toISOString(), paidAt: null },
        coinAmount: (pkg?.coinAmount || 0) + (pkg?.bonusCoins || 0)
      }
    }
  },

  async getTransactions(_params?: any) {
    await delay(300)
    return { code: 0, message: 'success', data: paginate(mockTransactions) }
  },

  async getPaymentOrders() {
    await delay(300)
    return { code: 0, message: 'success', data: paginate(mockPaymentOrders) }
  },

  async getUsers(_params?: any) {
    await delay(300)
    return { code: 0, message: 'success', data: paginate(mockUsers) }
  },

  // ===== Admin: User =====
  async saveUser(data: any) {
    await delay(300)
    if (data.id) {
      const user = mockUsers.find(u => u.id === data.id)
      if (user) Object.assign(user, { nickname: data.nickname, phone: data.phone, email: data.email, roles: data.roles, status: data.status })
    } else {
      mockUsers.push({ id: genId(), username: data.username, nickname: data.nickname, avatar: null, email: data.email, phone: data.phone, gender: 0, bio: null, userType: 'personal', vipLevel: 0, status: data.status || 'active', roles: data.roles || ['user'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastLoginAt: null })
    }
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  async updateUserStatus(id: number, status: string) {
    await delay(200)
    const user = mockUsers.find(u => u.id === id)
    if (user) user.status = status as any
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  // ===== Admin: Tools =====
  async getAdminTools(params?: { page?: number; pageSize?: number }) {
    await delay(300)
    return { code: 0, message: 'success', data: paginate(mockTools, params?.page, params?.pageSize) }
  },

  async saveTool(data: any) {
    await delay(300)
    if (data.id) {
      const tool = mockTools.find(t => t.id === data.id)
      if (tool) Object.assign(tool, data)
    } else {
      mockTools.push({ id: genId(), categoryId: data.categoryId || 1, name: data.name, slug: data.name, description: data.description || '', icon: data.icon || '🔧', provider: data.provider || 'openai', modelId: data.modelId || '', toolType: data.toolType || 'text', inputType: 'text', outputType: 'text', coinCost: data.coinCost || 0, isFree: data.isFree || 0, freeDailyLimit: data.freeDailyLimit || 0, usageCount: 0, sortOrder: mockTools.length + 1, status: data.status || 'active', createdAt: new Date().toISOString() })
    }
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  async updateToolStatus(id: number, status: string) {
    await delay(200)
    const tool = mockTools.find(t => t.id === id)
    if (tool) tool.status = status as any
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  // ===== Admin: Orders =====
  async confirmOrder(id: number) {
    await delay(300)
    const order = mockPaymentOrders.find(o => o.id === id)
    if (order) { order.status = 'success'; order.paidAt = new Date().toISOString() }
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  // ===== Admin: Announcements =====
  async getAnnouncements() {
    await delay(300)
    return { code: 0, message: 'success', data: [...mockAnnouncements] }
  },

  async createAnnouncement(data: any) {
    await delay(300)
    const item: Announcement = { id: genId(), title: data.title, content: data.content, type: data.type, targetScope: data.targetScope, status: data.scheduledAt ? 'scheduled' : 'draft', scheduledAt: data.scheduledAt || null, publishedAt: null, createdBy: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    mockAnnouncements.unshift(item)
    return { code: 0, message: 'success', data: item }
  },

  async updateAnnouncement(id: number, data: any) {
    await delay(300)
    const item = mockAnnouncements.find(a => a.id === id)
    if (item) Object.assign(item, data, { updatedAt: new Date().toISOString() })
    return { code: 0, message: 'success', data: item }
  },

  async deleteAnnouncement(id: number) {
    await delay(200)
    const idx = mockAnnouncements.findIndex(a => a.id === id)
    if (idx >= 0) mockAnnouncements.splice(idx, 1)
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  // ===== Admin: Coupons =====
  async getCoupons() {
    await delay(300)
    return { code: 0, message: 'success', data: [...mockCoupons] }
  },

  async createCoupon(data: any) {
    await delay(300)
    const item: Coupon = { id: genId(), name: data.name, type: data.type, discountValue: data.discountValue, minAmount: data.minAmount || 0, maxReduce: null, totalQuantity: data.totalQuantity, usedQuantity: 0, validFrom: data.validFrom, validTo: data.validTo, issueRule: data.issueRule, status: 'active', createdAt: new Date().toISOString() }
    mockCoupons.unshift(item)
    return { code: 0, message: 'success', data: item }
  },

  async updateCoupon(id: number, data: any) {
    await delay(300)
    const item = mockCoupons.find(c => c.id === id)
    if (item) Object.assign(item, data)
    return { code: 0, message: 'success', data: item }
  },

  async deleteCoupon(id: number) {
    await delay(200)
    const idx = mockCoupons.findIndex(c => c.id === id)
    if (idx >= 0) mockCoupons.splice(idx, 1)
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  // ===== Admin: Campaigns =====
  async getCampaigns() {
    await delay(300)
    return { code: 0, message: 'success', data: [...mockCampaigns] }
  },

  async createCampaign(data: any) {
    await delay(300)
    const item: Campaign = { id: genId(), name: data.name, type: data.type, description: data.description || '', startTime: data.startTime, endTime: data.endTime, participantCount: 0, totalReward: data.totalReward || 0, status: 'draft', config: {}, createdAt: new Date().toISOString() }
    mockCampaigns.unshift(item)
    return { code: 0, message: 'success', data: item }
  },

  async deleteCampaign(id: number) {
    await delay(200)
    const idx = mockCampaigns.findIndex(c => c.id === id)
    if (idx >= 0) mockCampaigns.splice(idx, 1)
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  // ===== Admin: Tickets =====
  async getTickets() {
    await delay(300)
    return { code: 0, message: 'success', data: [...mockTickets] }
  },

  async replyTicket(id: number, content: string) {
    await delay(300)
    const ticket = mockTickets.find(t => t.id === id)
    if (ticket) {
      ticket.replies.push({ id: genId(), ticketId: id, userId: 1, userName: '管理员', isStaff: true, content, createdAt: new Date().toISOString() })
      if (ticket.status === 'open') ticket.status = 'processing'
    }
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  async resolveTicket(id: number) {
    await delay(200)
    const ticket = mockTickets.find(t => t.id === id)
    if (ticket) { ticket.status = 'resolved'; ticket.resolvedAt = new Date().toISOString() }
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  async assignTicket(id: number, assigneeId: number, assigneeName: string) {
    await delay(200)
    const ticket = mockTickets.find(t => t.id === id)
    if (ticket) { ticket.assigneeId = assigneeId; ticket.assigneeName = assigneeName; if (ticket.status === 'open') ticket.status = 'processing' }
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  // ===== Admin: FAQs =====
  async getFAQs() {
    await delay(300)
    return { code: 0, message: 'success', data: [...mockFAQs] }
  },

  async createFAQ(data: any) {
    await delay(300)
    const item: FAQItem = { id: genId(), category: data.category, question: data.question, answer: data.answer, searchCount: 0, sortOrder: data.sortOrder || 0, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    mockFAQs.unshift(item)
    return { code: 0, message: 'success', data: item }
  },

  async updateFAQ(id: number, data: any) {
    await delay(300)
    const item = mockFAQs.find(f => f.id === id)
    if (item) Object.assign(item, data, { updatedAt: new Date().toISOString() })
    return { code: 0, message: 'success', data: item }
  },

  async deleteFAQ(id: number) {
    await delay(200)
    const idx = mockFAQs.findIndex(f => f.id === id)
    if (idx >= 0) mockFAQs.splice(idx, 1)
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  // ===== Admin: Automation Rules =====
  async getAutomationRules() {
    await delay(300)
    return { code: 0, message: 'success', data: [...mockAutomationRules] }
  },

  async createRule(data: any) {
    await delay(300)
    const item: AutomationRule = { id: genId(), name: data.name, description: data.description || '', triggerEvent: data.triggerEvent, triggerCondition: {}, actions: data.actions || [], status: 'active', executionCount: 0, lastExecutedAt: null, createdAt: new Date().toISOString() }
    mockAutomationRules.unshift(item)
    return { code: 0, message: 'success', data: item }
  },

  async toggleRule(id: number) {
    await delay(200)
    const rule = mockAutomationRules.find(r => r.id === id)
    if (rule) rule.status = rule.status === 'active' ? 'disabled' : 'active'
    return { code: 0, message: 'success', data: rule }
  },

  async deleteRule(id: number) {
    await delay(200)
    const idx = mockAutomationRules.findIndex(r => r.id === id)
    if (idx >= 0) mockAutomationRules.splice(idx, 1)
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  // ===== Admin: Content Moderation =====
  async getContentModerations() {
    await delay(300)
    return { code: 0, message: 'success', data: [...mockModerations] }
  },

  async approveContent(id: number) {
    await delay(200)
    const item = mockModerations.find(m => m.id === id)
    if (item) { item.status = 'approved'; item.reviewerName = '管理员'; item.reviewedAt = new Date().toISOString() }
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  async rejectContent(id: number, reason: string) {
    await delay(200)
    const item = mockModerations.find(m => m.id === id)
    if (item) { item.status = 'rejected'; item.reason = reason; item.reviewerName = '管理员'; item.reviewedAt = new Date().toISOString() }
    return { code: 0, message: 'success', data: { message: 'ok' } }
  },

  // ===== Admin: System =====
  async getSystemLogs() {
    await delay(300)
    return { code: 0, message: 'success', data: paginate([
      { id: 1, module: 'user', action: '用户注册', userId: 101, detail: '新用户 zhangsan 注册', createdAt: '2025-07-18T14:30:00.000Z' },
      { id: 2, module: 'payment', action: '充值成功', userId: 1, detail: '充值500圣力 ¥199', createdAt: '2025-07-18T10:00:00.000Z' },
      { id: 3, module: 'tool', action: '工具调用', userId: 2, detail: 'AI文案创作 消耗10圣力', createdAt: '2025-07-18T09:30:00.000Z' },
    ]) }
  },

  async getSystemSettings() {
    await delay(200)
    return { code: 0, message: 'success', data: { platformName: '罗圣纪元SaaS平台', domain: 'lsjyapp.cn', adminEmail: 'admin@lsjyapp.cn', newUserBonus: 50, unitPrice: 0.6, enterpriseDiscount: '0.8', emailNotify: true, smsNotify: false } }
  },

  async saveSystemSettings(data: any) {
    await delay(300)
    return { code: 0, message: 'success', data: { message: 'ok', ...data } }
  },

  async getDataReports(_range?: string) {
    await delay(300)
    return { code: 0, message: 'success', data: [...mockReportData] }
  },
  // ===== AI: Models & Providers =====
  async getModels(_category?: string) {
    await delay(200)
    return {
      code: 0, message: 'success',
      data: [
        {
          provider: 'doubao', providerName: '豆包',
          models: [
            { id: 'doubao-pro-4k', name: 'Doubao-Pro-4K', capabilities: ['text', 'code'], maxContextLength: 4096, supportStream: true, inputPrice: 0.8, outputPrice: 2.0 },
            { id: 'doubao-pro-32k', name: 'Doubao-Pro-32K', capabilities: ['text', 'code'], maxContextLength: 32768, supportStream: true, inputPrice: 1.0, outputPrice: 2.5 },
            { id: 'doubao-lite-32k', name: 'Doubao-Lite-32K', capabilities: ['text'], maxContextLength: 32768, supportStream: true, inputPrice: 0.3, outputPrice: 0.6 },
          ]
        },
        {
          provider: 'deepseek', providerName: 'DeepSeek',
          models: [
            { id: 'deepseek-v3', name: 'DeepSeek-V3', capabilities: ['text', 'code'], maxContextLength: 65536, supportStream: true, inputPrice: 0.5, outputPrice: 1.0 },
            { id: 'deepseek-r1', name: 'DeepSeek-R1', capabilities: ['text', 'code', 'reasoning'], maxContextLength: 65536, supportStream: true, inputPrice: 1.0, outputPrice: 2.0 },
          ]
        },
        {
          provider: 'yuanbao', providerName: '元宝',
          models: [
            { id: 'yuanbao-pro', name: '元宝 Pro', capabilities: ['text', 'code', 'multimodal'], maxContextLength: 32768, supportStream: true, inputPrice: 0.6, outputPrice: 1.5 },
            { id: 'yuanbao-lite', name: '元宝 Lite', capabilities: ['text'], maxContextLength: 32768, supportStream: true, inputPrice: 0.2, outputPrice: 0.4 },
          ]
        },
        {
          provider: 'jimeng', providerName: '即梦',
          models: [
            { id: 'jimeng-2.1', name: '即梦 2.1', capabilities: ['image'], maxContextLength: 0, supportStream: false, inputPrice: 0, outputPrice: 5.0 },
            { id: 'jimeng-2.0-pro', name: '即梦 2.0 Pro', capabilities: ['image'], maxContextLength: 0, supportStream: false, inputPrice: 0, outputPrice: 8.0 },
          ]
        },
        {
          provider: 'openai', providerName: 'OpenAI',
          models: [
            { id: 'gpt-4o', name: 'GPT-4o', capabilities: ['text', 'image', 'code', 'multimodal'], maxContextLength: 128000, supportStream: true, inputPrice: 2.5, outputPrice: 10.0 },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', capabilities: ['text', 'code', 'multimodal'], maxContextLength: 128000, supportStream: true, inputPrice: 0.15, outputPrice: 0.6 },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', capabilities: ['text', 'code', 'multimodal'], maxContextLength: 128000, supportStream: true, inputPrice: 10.0, outputPrice: 30.0 },
            { id: 'dall-e-3', name: 'DALL-E 3', capabilities: ['image'], maxContextLength: 0, supportStream: false, inputPrice: 0, outputPrice: 40.0 },
          ]
        },
        {
          provider: 'tongyi', providerName: '通义千问',
          models: [
            { id: 'qwen-max', name: '通义千问 Max', capabilities: ['text', 'code'], maxContextLength: 32768, supportStream: true, inputPrice: 2.0, outputPrice: 6.0 },
            { id: 'qwen-plus', name: '通义千问 Plus', capabilities: ['text', 'code'], maxContextLength: 131072, supportStream: true, inputPrice: 0.8, outputPrice: 2.0 },
            { id: 'qwen-turbo', name: '通义千问 Turbo', capabilities: ['text'], maxContextLength: 131072, supportStream: true, inputPrice: 0.3, outputPrice: 0.6 },
            { id: 'wanx-v1', name: '通义万相', capabilities: ['image'], maxContextLength: 0, supportStream: false, inputPrice: 0, outputPrice: 8.0 },
          ]
        },
      ]
    }
  },

  // ===== AI: Chat =====
  async chat(_toolId: number, messages: any[], _options?: any) {
    await delay(800 + Math.random() * 1200)
    const lastMsg = messages[messages.length - 1]?.content || ''
    const tool = mockTools.find(t => t.id === _toolId)
    let reply = ''

    if (lastMsg.includes('你好') || lastMsg.includes('hello')) {
      reply = '你好！我是' + (tool?.name || 'AI助手') + '，很高兴为你服务。请问有什么可以帮到你的？'
    } else if (lastMsg.includes('文案') || lastMsg.includes('写')) {
      reply = '好的，我来帮你创作文案。\n\n' +
        '📝 【创作方向】\n' +
        '1. 品牌故事型：用真实的情感和经历打动用户\n' +
        '2. 场景种草型：描绘使用场景，激发购买欲望\n' +
        '3. 专业测评型：用数据和对比建立信任\n\n' +
        '💡 示例文案：\n' +
        '"当清晨第一缕阳光洒进窗台，一杯手冲咖啡的香气弥漫开来——这不是奢侈品，是对自己最好的犒赏。我们的精品咖啡豆，来自云南高海拔庄园，每一颗都经过手工挑选，只为给你最纯粹的味道。"'
    } else if (lastMsg.includes('代码') || lastMsg.includes('编程')) {
      reply = '当然可以！以下是一个示例：\n\n' +
        '```typescript\n' +
        'function fibonacci(n: number): number {\n' +
        '  if (n <= 1) return n;\n' +
        '  return fibonacci(n - 1) + fibonacci(n - 2);\n' +
        '}\n\n' +
        'console.log(fibonacci(10)); // 55\n' +
        '```\n\n' +
        '这个递归实现简单直观，但对于大数值可能会有性能问题。如果需要优化，可以使用动态规划或记忆化搜索。'
    } else if (lastMsg.includes('分析') || lastMsg.includes('数据')) {
      reply = '📊 数据分析报告\n\n' +
        '根据您提供的数据，我做了以下分析：\n\n' +
        '1. **趋势分析**：整体呈上升趋势，环比增长12.5%\n' +
        '2. **关键发现**：用户活跃度在周末达到峰值\n' +
        '3. **建议**：建议在周末推出限时活动，最大化转化率\n\n' +
        '需要我深入分析某个具体方面吗？'
    } else {
      reply = '收到你的问题。让我为你详细解答：\n\n' +
        '这是一个很好的问题。基于我的分析，这里有几个关键点需要考虑：\n\n' +
        '1. 首先，需要明确你的核心目标和预期结果\n' +
        '2. 其次，评估现有资源和可用工具\n' +
        '3. 最后，制定一个可执行的行动计划\n\n' +
        '如果你能提供更多具体信息，我可以给出更有针对性的建议。\n\n' +
        '💡 提示：越详细的描述，我能提供的帮助越精准。'
    }

    const coinCost = tool?.coinCost || 10
    return {
      code: 0, message: 'success',
      data: {
        content: reply,
        usage: { promptTokens: Math.floor(lastMsg.length * 1.5), completionTokens: Math.floor(reply.length * 1.2), totalTokens: Math.floor((lastMsg.length + reply.length) * 1.3) },
        model: tool?.modelId || 'gpt-4o',
        provider: tool?.provider || 'openai',
        durationMs: 800 + Math.floor(Math.random() * 1200),
        callRecordId: genId(),
        coinCost: coinCost,
      }
    }
  },

  // ===== AI: Generate Image =====
  async generateImage(_toolId: number, _prompt: string, _options?: any) {
    await delay(2000 + Math.random() * 2000)
    const tool = mockTools.find(t => t.id === _toolId)
    const count = _options?.count || 1
    const size = _options?.size || '1024x1024'
    // Return realistic placeholder image URLs (using picsum for actual photos)
    const urls: string[] = []
    for (let i = 0; i < count; i++) {
      // Use picsum.photos with random seed for different images each time
      const seed = Date.now() + i
      urls.push(`https://picsum.photos/seed/${seed}/${size.replace('x', '/')}`)
    }
    return {
      code: 0, message: 'success',
      data: {
        urls,
        model: tool?.modelId || 'sd-xl',
        provider: tool?.provider || 'jimeng',
        durationMs: 2000 + Math.floor(Math.random() * 2000),
        callRecordId: genId(),
        coinCost: (tool?.coinCost || 20) * count,
      }
    }
  },

}
