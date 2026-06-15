import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getToken } from '@/utils'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { title: '登录', guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { title: '注册', guest: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/UserLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/DashboardView.vue'), meta: { title: '控制台', icon: '🏠' } },
      { path: 'tools', name: 'ToolCenter', component: () => import('@/views/ai-tools/ToolCenter.vue'), meta: { title: 'AI工具中心', icon: '🤖' } },
      { path: 'tools/:id', name: 'ToolDetail', component: () => import('@/views/ai-tools/ToolDetail.vue'), meta: { title: '工具详情', hidden: true } },
      { path: 'chat', name: 'AgentChat', component: () => import('@/views/chat/AgentChat.vue'), meta: { title: '罗圣AI', icon: '🤖' } },
      { path: 'profile', name: 'Profile', component: () => import('@/views/profile/ProfileView.vue'), meta: { title: '个人中心', icon: '👤' } },
      { path: 'profile/wallet', name: 'Wallet', component: () => import('@/views/profile/WalletView.vue'), meta: { title: '圣力中心', icon: '💰' } }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAdmin: true },
    children: [
      // 概览
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/AdminDashboard.vue'), meta: { title: '数据看板' } },
      { path: 'realtime', name: 'RealtimeMonitor', component: () => import('@/views/admin/analytics/RealtimeMonitor.vue'), meta: { title: '实时监控' } },
      // 数据中心
      { path: 'traffic', name: 'TrafficAnalysis', component: () => import('@/views/admin/analytics/TrafficAnalysis.vue'), meta: { title: '流量分析' } },
      { path: 'bi', name: 'BusinessIntelligence', component: () => import('@/views/admin/analytics/BusinessIntelligence.vue'), meta: { title: '商业智能' } },
      { path: 'performance', name: 'PerformanceMonitor', component: () => import('@/views/admin/analytics/PerformanceMonitor.vue'), meta: { title: '性能监控' } },
      { path: 'reports', name: 'AdminReports', component: () => import('@/views/admin/DataReports.vue'), meta: { title: '数据报表' } },
      // 用户管理
      { path: 'users', name: 'AdminUsers', component: () => import('@/views/admin/UserManagement.vue'), meta: { title: '用户管理' } },
      { path: 'registration-audit', name: 'RegistrationAudit', component: () => import('@/views/admin/user/RegistrationAudit.vue'), meta: { title: '注册审核' } },
      { path: 'vip', name: 'VIPManagement', component: () => import('@/views/admin/user/VIPManagement.vue'), meta: { title: 'VIP管理' } },
      { path: 'user-behavior', name: 'UserBehavior', component: () => import('@/views/admin/user/UserBehavior.vue'), meta: { title: '用户行为' } },
      { path: 'feedback', name: 'FeedbackManage', component: () => import('@/views/admin/user/FeedbackManage.vue'), meta: { title: '反馈管理' } },
      { path: 'account-security', name: 'AccountSecurity', component: () => import('@/views/admin/user/AccountSecurity.vue'), meta: { title: '账号安全' } },
      // 内容运营
      { path: 'content-moderation', name: 'AdminContentModeration', component: () => import('@/views/admin/ContentModeration.vue'), meta: { title: '内容审核' } },
      { path: 'announcements', name: 'AdminAnnouncements', component: () => import('@/views/admin/AnnouncementManagement.vue'), meta: { title: '公告管理' } },
      { path: 'knowledge', name: 'KnowledgeBase', component: () => import('@/views/admin/content/KnowledgeBase.vue'), meta: { title: '知识库管理' } },
      { path: 'media', name: 'MediaLibrary', component: () => import('@/views/admin/content/MediaLibrary.vue'), meta: { title: '媒体库' } },
      { path: 'push', name: 'PushNotification', component: () => import('@/views/admin/content/PushNotification.vue'), meta: { title: '消息推送' } },
      { path: 'faq', name: 'AdminFAQ', component: () => import('@/views/admin/FAQManagement.vue'), meta: { title: 'FAQ管理' } },
      // AI管理
      { path: 'tools', name: 'AdminTools', component: () => import('@/views/admin/ToolManagement.vue'), meta: { title: '工具管理' } },
      { path: 'model-monitor', name: 'ModelMonitor', component: () => import('@/views/admin/ai/ModelMonitor.vue'), meta: { title: '模型监控' } },
      { path: 'token-usage', name: 'TokenUsage', component: () => import('@/views/admin/ai/TokenUsage.vue'), meta: { title: 'Token用量' } },
      { path: 'prompts', name: 'PromptTemplates', component: () => import('@/views/admin/ai/PromptTemplates.vue'), meta: { title: '提示词模板' } },
      { path: 'training-data', name: 'TrainingData', component: () => import('@/views/admin/ai/TrainingData.vue'), meta: { title: '训练数据' } },
      { path: 'chat-history', name: 'ChatHistory', component: () => import('@/views/admin/ai/ChatHistory.vue'), meta: { title: '对话记录' } },
      // 商业变现
      { path: 'orders', name: 'AdminOrders', component: () => import('@/views/admin/OrderManagement.vue'), meta: { title: '订单管理' } },
      { path: 'transactions', name: 'TransactionRecords', component: () => import('@/views/admin/commerce/TransactionRecords.vue'), meta: { title: '交易记录' } },
      { path: 'refunds', name: 'RefundManage', component: () => import('@/views/admin/commerce/RefundManage.vue'), meta: { title: '退款处理' } },
      { path: 'payment', name: 'PaymentChannels', component: () => import('@/views/admin/commerce/PaymentChannels.vue'), meta: { title: '支付渠道' } },
      { path: 'invoices', name: 'InvoiceManage', component: () => import('@/views/admin/commerce/InvoiceManage.vue'), meta: { title: '发票管理' } },
      { path: 'pricing', name: 'PricingManage', component: () => import('@/views/admin/commerce/PricingManage.vue'), meta: { title: '定价管理' } },
      // 营销增长
      { path: 'coupons', name: 'AdminCoupons', component: () => import('@/views/admin/CouponManagement.vue'), meta: { title: '优惠券' } },
      { path: 'campaigns', name: 'AdminCampaigns', component: () => import('@/views/admin/CampaignManagement.vue'), meta: { title: '活动管理' } },
      { path: 'referral', name: 'ReferralTracking', component: () => import('@/views/admin/marketing/ReferralTracking.vue'), meta: { title: '推荐追踪' } },
      { path: 'affiliate', name: 'AffiliateManage', component: () => import('@/views/admin/marketing/AffiliateManage.vue'), meta: { title: '分销管理' } },
      { path: 'points-mall', name: 'PointsMall', component: () => import('@/views/admin/marketing/PointsMall.vue'), meta: { title: '积分商城' } },
      // 客服支持
      { path: 'tickets', name: 'AdminTickets', component: () => import('@/views/admin/TicketManagement.vue'), meta: { title: '工单管理' } },
      { path: 'automation', name: 'AdminAutomation', component: () => import('@/views/admin/AutomationRules.vue'), meta: { title: '自动化规则' } },
      { path: 'live-chat', name: 'LiveChat', component: () => import('@/views/admin/support/LiveChat.vue'), meta: { title: '在线聊天' } },
      // 访客中心
      { path: 'visitors', name: 'VisitorCenter', component: () => import('@/views/admin/visitor/VisitorCenter.vue'), meta: { title: '访客中心' } },
      { path: 'checkin', name: 'CheckinRecords', component: () => import('@/views/admin/visitor/CheckinRecords.vue'), meta: { title: '签到记录' } },
      { path: 'clock', name: 'RealtimeClock', component: () => import('@/views/admin/visitor/RealtimeClock.vue'), meta: { title: '实时定位' } },
      { path: 'visitor-stats', name: 'VisitorStats', component: () => import('@/views/admin/visitor/VisitorStats.vue'), meta: { title: '访客统计' } },
      // 系统管理
      { path: 'settings', name: 'AdminSettings', component: () => import('@/views/admin/SystemSettings.vue'), meta: { title: '系统配置' } },
      { path: 'oplog', name: 'OperationLog', component: () => import('@/views/admin/system/OperationLog.vue'), meta: { title: '操作日志' } },
      { path: 'scheduler', name: 'ScheduledTasks', component: () => import('@/views/admin/system/ScheduledTasks.vue'), meta: { title: '定时任务' } },
      { path: 'api-keys', name: 'ApiKeyManage', component: () => import('@/views/admin/system/ApiKeyManage.vue'), meta: { title: 'API密钥' } },
      { path: 'backup', name: 'BackupRestore', component: () => import('@/views/admin/system/BackupRestore.vue'), meta: { title: '备份恢复' } },
      { path: 'sysinfo', name: 'SysInfo', component: () => import('@/views/admin/system/SysInfo.vue'), meta: { title: '系统信息' } },
      // 安全中心
      { path: 'audit', name: 'AuditLog', component: () => import('@/views/admin/security/AuditLog.vue'), meta: { title: '安全审计' } },
      { path: 'login-history', name: 'LoginHistory', component: () => import('@/views/admin/security/LoginHistory.vue'), meta: { title: '登录记录' } },
      { path: 'ip-blacklist', name: 'IPBlacklist', component: () => import('@/views/admin/security/IPBlacklist.vue'), meta: { title: 'IP黑名单' } },
      { path: 'permissions', name: 'PermissionManage', component: () => import('@/views/admin/security/PermissionManage.vue'), meta: { title: '权限管理' } },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to, _from, next) => {
  document.title = `${(to.meta.title as string) || '罗圣纪元'} - 罗圣纪元SaaS平台`
  const token = getToken()
  if (to.meta.guest) {
    if (token) return next('/dashboard')
    return next()
  }
  if (to.matched.some(r => r.meta.requiresAdmin)) {
    if (!token) return next('/login')
    return next()
  }
  if (!token) return next('/login')
  next()
})

export default router
