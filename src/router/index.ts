import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getToken, removeToken } from '@/utils'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api'
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
      { path: 'tools/skill/analysis', name: 'OpenSourceSkillAnalysis', component: () => import('@/views/ai-tools/OpenSourceSkillAnalysis.vue'), meta: { title: '开源AI技能分析', hidden: true } },
      { path: 'tools/:id', name: 'ToolDetail', component: () => import('@/views/ai-tools/ToolDetail.vue'), meta: { title: '工具详情', hidden: true } },
      { path: 'algorithm-platform', name: 'AlgorithmPlatform', component: () => import('@/views/algorithm-platform/AlgorithmPlatform.vue'), meta: { title: '自研算法中台', icon: '⚡', requiresAlgoPlatform: true } },
      { path: 'chat', name: 'AgentChat', component: () => import('@/views/chat/AgentChat.vue'), meta: { title: '罗圣AI', icon: '🤖' }},
      { path: 'profile', name: 'Profile', component: () => import('@/views/profile/ProfileView.vue'), meta: { title: '个人中心', icon: '👤' } },
      { path: 'profile/works', name: 'Works', component: () => import('@/views/profile/WorksView.vue'), meta: { title: '我的作品', icon: '🎨' } },
      { path: 'profile/wallet', name: 'Wallet', component: () => import('@/views/profile/WalletView.vue'), meta: { title: '圣力中心', icon: '💰' } },
      { path: 'profile/favorites', name: 'Favorites', component: () => import('@/views/profile/FavoritesView.vue'), meta: { title: '收藏工具', icon: '⭐' } },
      { path: 'profile/creation-history', name: 'CreationHistory', component: () => import('@/views/profile/CreationHistory.vue'), meta: { title: '创作记录', icon: '📝' } },
      { path: 'profile/help', name: 'HelpCenter', component: () => import('@/views/profile/HelpCenter.vue'), meta: { title: '帮助中心', icon: '❓' } },
      { path: 'computing', name: 'ComputingCenter', component: () => import('@/views/computing/ComputingCenter.vue'), meta: { title: '算力调度&虚拟员工中心', icon: '⚡' } }
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
      { path: 'decision', name: 'DecisionCenter', component: () => import('@/views/admin/DecisionCenter.vue'), meta: { title: '决策中心' } },
      { path: 'realtime', name: 'RealtimeMonitor', component: () => import('@/views/admin/analytics/RealtimeMonitor.vue'), meta: { title: '实时定位' } },
      // 算力调度 & 虚拟数字员工中心
      { path: 'computing-manage', name: 'ComputingManage', component: () => import('@/views/admin/ComputingManage.vue'), meta: { title: '算力调度管理' } },
      { path: 'employees-manage', name: 'EmployeesManage', component: () => import('@/views/admin/EmployeesManage.vue'), meta: { title: '虚拟员工管理' } },
      { path: 'value-packages', name: 'ValuePackages', component: () => import('@/views/admin/ValuePackages.vue'), meta: { title: '增值套餐管理' } },
      { path: 'value-orders', name: 'ValueOrders', component: () => import('@/views/admin/ValueOrders.vue'), meta: { title: '增值订单管理' } },
      // 用户管理
      { path: 'online-users', name: 'OnlineUsers', component: () => import('@/views/admin/OnlineUsers.vue'), meta: { title: '在线用户' } },
      { path: 'user-tags', name: 'UserTags', component: () => import('@/views/admin/UserTags.vue'), meta: { title: '用户标签' } },
      { path: 'blacklist', name: 'BlacklistManage', component: () => import('@/views/admin/BlacklistManage.vue'), meta: { title: '黑名单管理' } },
      // 智能体管理
      { path: 'ai-agents', name: 'AIAgents', component: () => import('@/views/admin/AIAgents.vue'), meta: { title: 'AI智能体' } },
      { path: 'chat-history', name: 'ChatHistory', component: () => import('@/views/admin/ai/ChatHistory.vue'), meta: { title: '对话记录' } },
      { path: 'model-config', name: 'ModelConfig', component: () => import('@/views/admin/ModelConfig.vue'), meta: { title: '模型配置' } },
      { path: 'knowledge', name: 'KnowledgeBase', component: () => import('@/views/admin/content/KnowledgeBase.vue'), meta: { title: '知识库管理' } },
      // 财务中心
      { path: 'coin-packages', name: 'CoinPackages', component: () => import('@/views/admin/CoinPackages.vue'), meta: { title: '圣力套餐' } },
      { path: 'boss-cards', name: 'BossCards', component: () => import('@/views/admin/BossCards.vue'), meta: { title: 'Boss充值卡' } },
      { path: 'payment', name: 'Payment', component: () => import('@/views/admin/Payment.vue'), meta: { title: '支付' } },
      { path: 'recharge', name: 'RechargeManage', component: () => import('@/views/admin/RechargeManage.vue'), meta: { title: '充值管理' } },
      { path: 'orders', name: 'AdminOrders', component: () => import('@/views/admin/OrderManagement.vue'), meta: { title: '订单管理' } },
      { path: 'commission', name: 'CommissionRecords', component: () => import('@/views/admin/CommissionRecords.vue'), meta: { title: '佣金记录' } },
      // 内容运营
      { path: 'announcements', name: 'AdminAnnouncements', component: () => import('@/views/admin/AnnouncementManagement.vue'), meta: { title: '公告管理' } },
      { path: 'content-moderation', name: 'AdminContentModeration', component: () => import('@/views/admin/ContentModeration.vue'), meta: { title: '内容审核' } },
      { path: 'push', name: 'PushNotification', component: () => import('@/views/admin/content/PushNotification.vue'), meta: { title: '消息推送' } },
      // 系统管理
      { path: 'settings', name: 'AdminSettings', component: () => import('@/views/admin/SystemSettings.vue'), meta: { title: '系统配置' } },
      { path: 'oplog', name: 'OperationLog', component: () => import('@/views/admin/system/OperationLog.vue'), meta: { title: '操作日志' } },
      { path: 'operation-log', name: 'OperationLogAlt', component: () => import('@/views/admin/OperationLog.vue'), meta: { title: '操作日志' } },
      { path: 'login-history', name: 'LoginHistory', component: () => import('@/views/admin/security/LoginHistory.vue'), meta: { title: '登录记录' } },
      { path: 'api-monitor', name: 'APIMonitor', component: () => import('@/views/admin/APIMonitor.vue'), meta: { title: 'API监控' } },
      { path: 'data-backup', name: 'DataBackup', component: () => import('@/views/admin/DataBackup.vue'), meta: { title: '数据备份' } },
      { path: 'data-reports', name: 'DataReports', component: () => import('@/views/admin/DataReports.vue'), meta: { title: '数据报表' } },
      { path: 'tickets', name: 'TicketManagement', component: () => import('@/views/admin/TicketManagement.vue'), meta: { title: '工单管理' } },
      { path: 'coupons', name: 'CouponManagement', component: () => import('@/views/admin/CouponManagement.vue'), meta: { title: '优惠券管理' } },
      { path: 'faq', name: 'FAQManagement', component: () => import('@/views/admin/FAQManagement.vue'), meta: { title: 'FAQ管理' } },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to, _from, next) => {
  document.title = `${(to.meta.title as string) || '罗圣纪元'} - 罗圣纪元SaaS平台`
  const token = getToken()
  if (to.meta.guest) {
    if (token) return next('/dashboard')
    return next()
  }
  if (to.matched.some(r => r.meta.requiresAdmin)) {
    if (!token) return next('/login')
    try {
      const authStore = useAuthStore()
      const [profileRes, rolesRes] = await Promise.all([
        userApi.getProfile(),
        userApi.getMyRoles()
      ])
      const userData = (profileRes as any).data?.data || (profileRes as any).data
      const rolesData = (rolesRes as any).data?.data || (rolesRes as any).data || []
      const roleNames = Array.isArray(rolesData)
        ? rolesData.map((r: any) => typeof r === 'string' ? r : (r.roleName || r.name || r.role || '')).filter(Boolean)
        : []
      authStore.user = userData
      authStore.userRoles = roleNames
      localStorage.setItem('lsjy_user', JSON.stringify(userData))
      // 纯后端 JWT 鉴权：由后端控制角色，前端只校验角色名
      const isAdmin = roleNames.some((r: string) =>
        ['boss', 'founder', 'ultimate_admin', 'super_admin', 'admin'].includes(r)
      )
      if (!isAdmin) {
        removeToken()
        localStorage.removeItem('lsjy_refresh_token')
        localStorage.removeItem('lsjy_user')
        return next('/dashboard')
      }
    } catch {
      removeToken()
      localStorage.removeItem('lsjy_refresh_token')
      localStorage.removeItem('lsjy_user')
      return next('/login')
    }
    return next()
  }
  if (!token) return next('/login')

  // 算法中台权限检查：KF02V9(Boss)免费，其他用户需付费或持有卡密
  if (to.matched.some(r => r.meta.requiresAlgoPlatform)) {
    try {
      const savedUser = localStorage.getItem('lsjy_user')
      const userData = savedUser ? JSON.parse(savedUser) : null
      const username = userData?.username || ''
      const algoAccess = localStorage.getItem('lsjy_algo_platform_access') // 卡密激活标记
      const isBoss = username === 'KF02V9'
      const hasAccess = isBoss || algoAccess === 'true'
      if (!hasAccess) {
        // 重定向到付费页面，带上来源标记
        return next('/profile/wallet?from=algo-platform')
      }
    } catch {
      return next('/profile/wallet?from=algo-platform')
    }
  }

  next()
})

export default router
