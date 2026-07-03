import { defineComponent, h } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getToken } from '@/utils'
import { ElMessage } from 'element-plus'

// 404 页面组件
const NotFoundView = defineComponent({
  name: 'NotFound',
  setup() {
    return () => h('div', {
      style: 'display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:2rem;'
    }, [
      h('div', { style: 'font-size:5rem;margin-bottom:1rem;' }, '🌌'),
      h('h1', { style: 'font-size:2rem;font-weight:bold;color:var(--cyber-cyan,#00f0ff);margin-bottom:0.5rem;font-family:JetBrains Mono,monospace;' }, '404'),
      h('p', { style: 'color:var(--cyber-text-dim,#8888aa);margin-bottom:2rem;' }, '页面走丢了，正在穿越赛博空间...'),
      h('a', {
        href: '#/dashboard',
        style: 'padding:0.75rem 2rem;border-radius:0.5rem;background:rgba(0,240,255,0.1);color:var(--cyber-cyan,#00f0ff);border:1px solid rgba(0,240,255,0.3);text-decoration:none;font-weight:500;transition:all 0.3s;'
      }, '← 返回控制台')
    ])
  }
})

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
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '控制台', icon: '🏠' }
      },
      {
        path: 'tools',
        name: 'ToolCenter',
        component: () => import('@/views/ai-tools/ToolCenter.vue'),
        meta: { title: 'AI工具中心', icon: '🤖' }
      },
      {
        path: 'agent-hub',
        name: 'AgentHub',
        component: () => import('@/views/ai-tools/AgentHubView.vue'),
        meta: { title: 'AI员工中心', icon: '🤖' }
      },
      {
        path: 'agent',
        name: 'AgentChat',
        component: () => import('@/views/ai-tools/AgentChat.vue'),
        meta: { title: 'AI智能体', icon: '🧠' }
      },
      {
        path: 'tools/:id',
        name: 'ToolDetail',
        component: () => import('@/views/ai-tools/ToolDetail.vue'),
        meta: { title: '工具详情', hidden: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: { title: '个人中心', icon: '👤' }
      },
      {
        path: 'profile/wallet',
        name: 'Wallet',
        component: () => import('@/views/profile/WalletView.vue'),
        meta: { title: '圣力中心', icon: '💰' }
      },
      {
        path: 'profile/works',
        name: 'MyWorks',
        component: () => import('@/views/profile/MyWorks.vue'),
        meta: { title: '我的作品', icon: '🎨' }
      },
      {
        path: 'profile/favorites',
        name: 'MyFavorites',
        component: () => import('@/views/profile/MyFavorites.vue'),
        meta: { title: '收藏工具', icon: '⭐' }
      },
      {
        path: 'profile/security',
        name: 'SecuritySettings',
        component: () => import('@/views/profile/SecuritySettings.vue'),
        meta: { title: '安全设置', icon: '🔒' }
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/AdminDashboard.vue'),
        meta: { title: '数据看板' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserManagement.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'tools',
        name: 'AdminTools',
        component: () => import('@/views/admin/ToolManagement.vue'),
        meta: { title: '工具管理' }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/OrderManagement.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'content-moderation',
        name: 'AdminContentModeration',
        component: () => import('@/views/admin/ContentModeration.vue'),
        meta: { title: '内容审核' }
      },
      {
        path: 'announcements',
        name: 'AdminAnnouncements',
        component: () => import('@/views/admin/AnnouncementManagement.vue'),
        meta: { title: '公告管理' }
      },
      {
        path: 'coupons',
        name: 'AdminCoupons',
        component: () => import('@/views/admin/CouponManagement.vue'),
        meta: { title: '优惠券管理' }
      },
      {
        path: 'campaigns',
        name: 'AdminCampaigns',
        component: () => import('@/views/admin/CampaignManagement.vue'),
        meta: { title: '活动管理' }
      },
      {
        path: 'tickets',
        name: 'AdminTickets',
        component: () => import('@/views/admin/TicketManagement.vue'),
        meta: { title: '工单管理' }
      },
      {
        path: 'faq',
        name: 'AdminFAQ',
        component: () => import('@/views/admin/FAQManagement.vue'),
        meta: { title: 'FAQ管理' }
      },
      {
        path: 'automation',
        name: 'AdminAutomation',
        component: () => import('@/views/admin/AutomationRules.vue'),
        meta: { title: '自动化规则' }
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: () => import('@/views/admin/DataReports.vue'),
        meta: { title: '数据报表' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/SystemSettings.vue'),
        meta: { title: '系统配置' }
      },
      {
        path: 'coin-packages',
        name: 'AdminCoinPackages',
        component: () => import('@/views/admin/CoinPackages.vue'),
        meta: { title: '圣力套餐' }
      },
      {
        path: 'payments',
        name: 'AdminPayments',
        component: () => import('@/views/admin/PaymentRecords.vue'),
        meta: { title: '支付记录' }
      },
      {
        path: 'recharge',
        name: 'AdminRecharge',
        component: () => import('@/views/admin/RechargeManagement.vue'),
        meta: { title: '充值管理' }
      },
      {
        path: 'boss-recharge',
        name: 'AdminBossRecharge',
        component: () => import('@/views/admin/BossRecharge.vue'),
        meta: { title: 'Boss充圣点' }
      },
      {
        path: 'ai-agent',
        name: 'AdminAIAgent',
        component: () => import('@/views/admin/AIAgent.vue'),
        meta: { title: 'AI智能体' }
      },
      {
        path: 'chat-logs',
        name: 'AdminChatLogs',
        component: () => import('@/views/admin/ChatLogs.vue'),
        meta: { title: '对话记录' }
      },
      {
        path: 'model-config',
        name: 'AdminModelConfig',
        component: () => import('@/views/admin/ModelConfig.vue'),
        meta: { title: '模型配置' }
      },
      {
        path: 'content-library',
        name: 'AdminContentLibrary',
        component: () => import('@/views/admin/ContentLibrary.vue'),
        meta: { title: '内容库' }
      },
      {
        path: 'audit-log',
        name: 'AdminAuditLog',
        component: () => import('@/views/admin/AuditLog.vue'),
        meta: { title: '操作日志' }
      },
      // 新增功能模块
      {
        path: 'visitors',
        name: 'AdminVisitors',
        component: () => import('@/views/admin/Visitors.vue'),
        meta: { title: '访客中心' }
      },
      {
        path: 'realtime-location',
        name: 'AdminRealtimeLocation',
        component: () => import('@/views/admin/RealtimeLocation.vue'),
        meta: { title: '实时定位' }
      },
      {
        path: 'online-users',
        name: 'AdminOnlineUsers',
        component: () => import('@/views/admin/OnlineUsers.vue'),
        meta: { title: '在线用户' }
      },
      {
        path: 'user-tags',
        name: 'AdminUserTags',
        component: () => import('@/views/admin/UserTags.vue'),
        meta: { title: '用户标签' }
      },
      {
        path: 'blacklist',
        name: 'AdminBlacklist',
        component: () => import('@/views/admin/Blacklist.vue'),
        meta: { title: '黑名单管理' }
      },
      {
        path: 'knowledge-base',
        name: 'AdminKnowledgeBase',
        component: () => import('@/views/admin/KnowledgeBase.vue'),
        meta: { title: '知识库管理' }
      },
      {
        path: 'commission',
        name: 'AdminCommission',
        component: () => import('@/views/admin/Commission.vue'),
        meta: { title: '佣金记录' }
      },
      {
        path: 'withdraw',
        name: 'AdminWithdraw',
        component: () => import('@/views/admin/Withdraw.vue'),
        meta: { title: '提现管理' }
      },
      {
        path: 'push-messages',
        name: 'AdminPushMessages',
        component: () => import('@/views/admin/PushMessages.vue'),
        meta: { title: '消息推送' }
      },
      {
        path: 'distribution',
        name: 'AdminDistribution',
        component: () => import('@/views/admin/Distribution.vue'),
        meta: { title: '分销管理' }
      },
      {
        path: 'affiliates',
        name: 'AdminAffiliates',
        component: () => import('@/views/admin/Affiliates.vue'),
        meta: { title: '合作伙伴' }
      },
      {
        path: 'feedback',
        name: 'AdminFeedback',
        component: () => import('@/views/admin/Feedback.vue'),
        meta: { title: '意见反馈' }
      },
      {
        path: 'system-monitor',
        name: 'AdminSystemMonitor',
        component: () => import('@/views/admin/SystemMonitor.vue'),
        meta: { title: '系统监控' }
      },
      {
        path: 'api-management',
        name: 'AdminAPIManagement',
        component: () => import('@/views/admin/APIManagement.vue'),
        meta: { title: 'API管理' }
      },
      {
        path: 'permissions',
        name: 'AdminPermissions',
        component: () => import('@/views/admin/Permissions.vue'),
        meta: { title: '权限管理' }
      },
      {
        path: 'sensitive-words',
        name: 'AdminSensitiveWords',
        component: () => import('@/views/admin/SensitiveWords.vue'),
        meta: { title: '敏感词库' }
      },
      {
        path: 'cache-management',
        name: 'AdminCacheManagement',
        component: () => import('@/views/admin/CacheManagement.vue'),
        meta: { title: '缓存管理' }
      },
      {
        path: 'data-backup',
        name: 'AdminDataBackup',
        component: () => import('@/views/admin/DataBackup.vue'),
        meta: { title: '数据备份' }
      }
    ]
  },
  // 404 兜底路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { title: '404', skipAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 设置页面标题
  document.title = `${(to.meta.title as string) || '罗圣纪元'} - 罗圣纪元SaaS平台`
  
  const token = getToken()

  // 无需认证的页面（404等）
  if (to.meta.skipAuth) return next()

  // 访客页面（登录/注册），已登录则跳转控制台
  if (to.meta.guest) {
    if (token) return next('/dashboard')
    return next()
  }

  // 管理后台：检查token + 管理员角色
  if (to.matched.some(r => r.meta.requiresAdmin)) {
    if (!token) return next('/login')
    try {
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      // 始终尝试获取最新用户信息和角色
      if (!authStore.user || authStore.userRoles.length === 0) {
        await authStore.fetchUserProfile()
      }
      // 如果还是没有角色，尝试单独获取角色
      if (authStore.userRoles.length === 0) {
        try {
          const { userApi } = await import('@/api')
          const rolesRes = await userApi.getMyRoles()
          const rolesData = rolesRes.data?.data || rolesRes.data
          if (Array.isArray(rolesData) && rolesData.length > 0) {
            authStore.userRoles = rolesData.map((r: any) => typeof r === 'string' ? r : (r.roleName || r.name || r.role || ''))
          }
        } catch { /* ignore */ }
      }
      if (!authStore.isAdmin) {
        ElMessage.error('无权访问管理后台')
        return next('/dashboard')
      }
    } catch (e) {
      console.error('Admin route check failed:', e)
      ElMessage.error('权限检查失败，请重新登录')
      return next('/login')
    }
    return next()
  }

  // 普通页面：未登录跳转登录
  if (!token) {
    return next('/login')
  }

  // 确保用户信息已加载
  try {
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    if (!authStore.user) {
      await authStore.fetchUserProfile()
    }
  } catch (e) {
    console.warn('Failed to fetch user profile:', e)
    // 不阻塞页面加载，继续导航
  }

  next()
})

export default router
