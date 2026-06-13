import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getToken } from '@/utils'

// 判断是否为 GitHub Pages 环境
const isGitHubPages = import.meta.env.PROD && (import.meta.env.BASE_URL.includes('/lsjy-app/') || window.location.hostname.includes('github.io'))

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
        meta: { title: '圣点账户', icon: '💰' }
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
      }
    ]
  }
]

const router = createRouter({
  history: isGitHubPages ? createWebHashHistory() : createWebHistory('/'),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  document.title = `${(to.meta.title as string) || '罗圣纪元'} - 罗圣纪元SaaS平台`
  const token = getToken()

  // 访客页面（登录/注册），已登录则跳转控制台
  if (to.meta.guest) {
    if (token) return next('/dashboard')
    return next()
  }

  // 管理后台：检查token + 管理员角色
  if (to.matched.some(r => r.meta.requiresAdmin)) {
    if (!token) return next('/login')
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    if (!authStore.user) {
      await authStore.fetchUserProfile()
    }
    if (!authStore.isAdmin) {
      return next('/dashboard')
    }
    return next()
  }

  // 普通页面：未登录跳转登录
  if (!token) {
    return next('/login')
  }

  next()
})

export default router
