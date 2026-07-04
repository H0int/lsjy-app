// ===== 统一API响应格式 =====
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
}

// ===== 分页请求 =====
export interface PageParams {
  page?: number
  pageSize?: number
}

// ===== 分页响应（以后端 items + meta 为准）=====
export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ===== 用户相关 =====
export interface User {
  id: number
  username: string
  nickname: string
  avatar: string | null
  email: string | null
  phone: string | null
  gender: number
  bio: string | null
  userType: 'personal' | 'merchant' | 'enterprise' | 'founder' | 'boss'
  vipLevel: number
  status: 'active' | 'frozen' | 'banned'
  roles: string[]
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

// ===== 圣力中心 =====
export interface CoinAccount {
  id: number
  userId: number
  balance: number
  frozenAmount: number
  totalRecharge: number
  totalConsumed: number
  totalEarned: number
  totalWithdrawn: number
  status: string
}

// ===== 登录响应 =====
export interface LoginResult {
  user: User
  accessToken: string
  refreshToken: string
  // 兼容后端不同返回格式
  token?: string
  userInfo?: User
}

// ===== Token信息 =====
export interface TokenInfo {
  accessToken: string
  refreshToken: string
}

// ===== 登录表单 =====
export interface LoginForm {
  username: string
  password: string
}

// ===== 注册表单 =====
export interface RegisterForm {
  username: string
  password: string
  nickname: string
  email?: string
  phone?: string
}

// ===== AI工具分类 =====
export interface ToolCategory {
  id: number
  name: string
  slug: string
  icon: string | null
  description: string | null
  module: string
  toolCount: number
}

// ===== AI工具 =====
export interface Tool {
  id: number
  categoryId: number
  category?: ToolCategory
  name: string
  slug: string
  description: string | null
  icon: string | null
  provider: string
  modelId: string
  toolType: 'text' | 'image' | 'video' | 'audio' | 'analysis' | 'other'
  inputType: string
  outputType: string
  coinCost: number
  isFree: number
  freeDailyLimit: number
  usageCount: number
  sortOrder: number
  status: 'active' | 'maintenance' | 'disabled'
  createdAt: string
}

// ===== 圣力交易记录 =====
export interface CoinTransaction {
  id: number
  userId: number
  transactionType: 'recharge' | 'consume' | 'refund' | 'commission' | 'bonus' | 'admin_adjust' | 'withdraw' | 'transfer'
  amount: number
  balanceBefore: number
  balanceAfter: number
  refType: string | null
  refId: number | null
  remark: string | null
  createdAt: string
}

// ===== 充值套餐 =====
export interface RechargePackage {
  id: number
  name: string
  coinAmount: number
  price: number
  originalPrice: number | null
  bonusCoins: number
  isRecommended: number
  sortOrder: number
}

// ===== 支付订单 =====
export interface PaymentTransaction {
  id: number
  transactionNo: string
  userId: number
  bizType: string
  payChannel: string
  amount: number
  coinAmount: number
  direction: string
  status: 'pending' | 'success' | 'failed' | 'refunded'
  remark: string | null
  createdAt: string
  paidAt: string | null
}

// ===== AI调用记录 =====
export interface AiCallRecord {
  id: number
  userId: number
  toolId: number
  tool?: Tool
  requestId: string
  inputText: string | null
  outputText: string | null
  coinCost: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  isFavorite: number
  createdAt: string
}

// ===== 仪表盘统计（前端聚合，无后端直连API）=====
export interface DashboardStats {
  totalUsers: number
  totalTools: number
  totalOrders: number
  totalRevenue: number
  todayUsers: number
  todayOrders: number
  toolUsageRanking: { name: string; count: number }[]
  recentActivities: { id: string; action: string; user: string; time: string }[]
}

// ===== 工具类型映射（前端展示用）=====
export const toolTypeMap: Record<string, string> = {
  text: '文本生成',
  image: '图片生成',
  video: '视频生成',
  audio: '音频处理',
  analysis: '数据分析',
  other: '其他工具'
}

// ===== 用户类型映射 =====
export const userTypeMap: Record<string, string> = {
  personal: '个人版',
  merchant: '商户版',
  enterprise: '企业版',
  founder: '至尊创始人',
  boss: '创始人'
}

// ===== 交易类型映射 =====
export const txTypeMap: Record<string, string> = {
  recharge: '充值',
  consume: '消费',
  refund: '退款',
  commission: '佣金',
  bonus: '奖励',
  admin_adjust: '管理员调整',
  withdraw: '提现',
  transfer: '转账'
}

// ===== 运营后台扩展类型 =====

// 内容审核
export interface ModerationItem {
  id: number
  contentType: 'post' | 'comment' | 'course' | 'product'
  contentTitle: string
  authorName: string
  authorId: number
  summary: string
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  reason: string | null
  reviewerId: number | null
  reviewerName: string | null
  createdAt: string
  reviewedAt: string | null
}

// 公告
export interface Announcement {
  id: number
  title: string
  content: string
  type: 'system' | 'activity' | 'update'
  targetScope: 'all' | 'personal' | 'merchant' | 'enterprise'
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  scheduledAt: string | null
  publishedAt: string | null
  createdBy: number
  createdAt: string
  updatedAt: string
}

// 优惠券
export interface Coupon {
  id: number
  name: string
  type: 'full_reduce' | 'discount' | 'coin_gift'
  discountValue: number
  minAmount: number
  maxReduce: number | null
  totalQuantity: number
  usedQuantity: number
  validFrom: string
  validTo: string
  issueRule: 'new_user' | 'consume_threshold' | 'activity' | 'manual'
  status: 'active' | 'paused' | 'expired'
  createdAt: string
}

// 活动
export interface Campaign {
  id: number
  name: string
  type: 'flash_sale' | 'check_in' | 'invite_reward' | 'coupon_event'
  description: string
  startTime: string
  endTime: string
  participantCount: number
  totalReward: number
  status: 'draft' | 'active' | 'ended' | 'paused'
  config: Record<string, any>
  createdAt: string
}

// 工单
export interface Ticket {
  id: number
  ticketNo: string
  userId: number
  userName: string
  subject: string
  content: string
  category: 'account' | 'payment' | 'tool' | 'bug' | 'suggestion' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'processing' | 'resolved' | 'closed'
  assigneeId: number | null
  assigneeName: string | null
  replies: TicketReply[]
  firstResponseAt: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TicketReply {
  id: number
  ticketId: number
  userId: number
  userName: string
  isStaff: boolean
  content: string
  createdAt: string
}

// FAQ
export interface FAQItem {
  id: number
  category: string
  question: string
  answer: string
  searchCount: number
  sortOrder: number
  status: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
}

// 自动化规则
export interface AutomationRule {
  id: number
  name: string
  description: string
  triggerEvent: string
  triggerCondition: Record<string, any>
  actions: AutomationAction[]
  status: 'active' | 'disabled'
  executionCount: number
  lastExecutedAt: string | null
  createdAt: string
}

export interface AutomationAction {
  type: 'send_coins' | 'send_notification' | 'change_role' | 'send_coupon' | 'update_field'
  config: Record<string, any>
}

// 数据报表
export interface ReportData {
  period: string
  newUsers: number
  activeUsers: number
  revenue: number
  coinConsumed: number
  orders: number
  toolCalls: number
}

// 仪表盘增强
export interface DashboardRealtime {
  onlineUsers: number
  todayRegistered: number
  todayRevenue: number
  todayCoinConsumed: number
}

export interface DashboardTrend {
  date: string
  newUsers: number
  revenue: number
  activeUsers: number
  toolCalls: number
}

export interface DashboardModuleUsage {
  module: string
  users: number
  revenue: number
}

export interface DashboardAlert {
  type: 'warning' | 'danger' | 'info'
  metric: string
  value: string
  threshold: string
  message: string
}

// ===== AI Provider 相关类型 =====

/** AI消息 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  imageUrl?: string
}

/** 对话选项 */
export interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
  topP?: number
  systemPrompt?: string
  stop?: string[]
}

/** 对话响应 */
export interface ChatResult {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  provider: string
  durationMs: number
  callRecordId: number
  coinCost: number
}

/** 图像生成选项 */
export interface ImageOptions {
  size?: string
  style?: string
  count?: number
  quality?: 'standard' | 'hd' | 'ultra' | 'master'
  refImage?: string
}

/** 图像生成响应 */
export interface ImageResult {
  urls: string[]
  model: string
  provider: string
  durationMs: number
  callRecordId: number
  coinCost: number
}

/** Provider状态 */
export interface ProviderStatus {
  name: string
  displayName: string
  status: 'healthy' | 'degraded' | 'down'
  latencyMs?: number
  lastError?: string
}

/** 模型信息 */
export interface ModelInfo {
  id: string
  name: string
  capabilities: ('text' | 'image' | 'code' | 'multimodal')[]
  maxContextLength?: number
  supportStream?: boolean
  inputPrice?: number
  outputPrice?: number
}

/** Provider模型组 */
export interface ProviderModelGroup {
  provider: string
  providerName: string
  models: ModelInfo[]
}
