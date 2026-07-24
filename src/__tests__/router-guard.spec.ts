import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

// Mock @/utils
vi.mock('@/utils', () => ({
  getToken: vi.fn(),
  setToken: vi.fn(),
  removeToken: vi.fn()
}))

// Mock @/api
vi.mock('@/api', () => ({
  userApi: {
    getProfile: vi.fn(),
    getMyRoles: vi.fn()
  }
}))

// Mock element-plus
vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
}))

import { getToken, removeToken } from '@/utils'
import { userApi } from '@/api'

// 定义简化路由用于测试守卫逻辑
const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: { template: '<div />' }, meta: { title: '登录', guest: true } },
  { path: '/register', name: 'Register', component: { template: '<div />' }, meta: { title: '注册', guest: true } },
  { path: '/dashboard', name: 'Dashboard', component: { template: '<div />' }, meta: { title: '控制台' } },
  {
    path: '/admin',
    component: { template: '<router-view />' },
    redirect: '/admin/dashboard',
    meta: { requiresAdmin: true },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: { template: '<div />' }, meta: { title: '数据看板' } }
    ]
  },
  { path: '/algorithm-platform', name: 'AlgorithmPlatform', component: { template: '<div />' }, meta: { title: '算法中台', requiresAlgoPlatform: true } },
  { path: '/profile/wallet', name: 'Wallet', component: { template: '<div />' }, meta: { title: '圣力中心' } }
]

function createTestRouter() {
  return createRouter({
    history: createWebHashHistory(),
    routes
  })
}

// 复制源码中的守卫逻辑以便独立测试
function installGuard(router: ReturnType<typeof createTestRouter>) {
  router.beforeEach(async (to, _from, next) => {
    document.title = `${(to.meta.title as string) || '罗圣纪元'} - 罗圣纪元SaaS平台`
    const token = (getToken as any)()

    if (to.meta.guest) {
      if (token) return next('/dashboard')
      return next()
    }

    if (to.matched.some(r => r.meta.requiresAdmin)) {
      if (!token) return next('/login')
      if (token.startsWith('local_')) {
        const savedUser = localStorage.getItem('lsjy_user')
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser)
            const roleNames = Array.isArray(userData?.roles)
              ? userData.roles.map((r: any) => typeof r === 'string' ? r : (r.roleName || r.name || r.role || '')).filter(Boolean)
              : []
            const isAdmin = roleNames.some((r: string) =>
              ['boss', 'founder', 'ultimate_admin', 'super_admin', 'admin'].includes(r)
            )
            if (isAdmin) return next()
          } catch { /* ignore */ }
        }
        return next('/dashboard')
      }
      try {
        const [profileRes, rolesRes] = await Promise.all([
          (userApi.getProfile as any)(),
          (userApi.getMyRoles as any)()
        ])
        const rolesData = rolesRes?.data?.data || rolesRes?.data || []
        const roleNames = Array.isArray(rolesData)
          ? rolesData.map((r: any) => typeof r === 'string' ? r : (r.roleName || r.name || r.role || '')).filter(Boolean)
          : []
        const isAdmin = roleNames.some((r: string) =>
          ['boss', 'founder', 'ultimate_admin', 'super_admin', 'admin'].includes(r)
        )
        if (!isAdmin) {
          ;(removeToken as any)()
          localStorage.removeItem('lsjy_refresh_token')
          localStorage.removeItem('lsjy_user')
          return next('/dashboard')
        }
      } catch {
        ;(removeToken as any)()
        localStorage.removeItem('lsjy_refresh_token')
        localStorage.removeItem('lsjy_user')
        return next('/login')
      }
      return next()
    }

    if (!token) return next('/login')

    if (to.matched.some(r => r.meta.requiresAlgoPlatform)) {
      try {
        const savedUser = localStorage.getItem('lsjy_user')
        const userData = savedUser ? JSON.parse(savedUser) : null
        const username = userData?.username || ''
        const algoAccess = localStorage.getItem('lsjy_algo_platform_access')
        const isBoss = username === 'KF02V9'
        const hasAccess = isBoss || algoAccess === 'true'
        if (!hasAccess) {
          return next('/profile/wallet?from=algo-platform')
        }
      } catch {
        return next('/profile/wallet?from=algo-platform')
      }
    }

    next()
  })
}

describe('路由守卫 (Router Guard)', () => {
  let router: ReturnType<typeof createTestRouter>

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
    router = createTestRouter()
    installGuard(router)
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Guest 路由', () => {
    it('未登录时允许访问 /login', async () => {
      ;(getToken as any).mockReturnValue(null)
      await router.push('/login')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('已登录时访问 /login 重定向到 /dashboard', async () => {
      ;(getToken as any).mockReturnValue('some_token')
      await router.push('/login')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('未登录时允许访问 /register', async () => {
      ;(getToken as any).mockReturnValue(null)
      await router.push('/register')
      expect(router.currentRoute.value.path).toBe('/register')
    })
  })

  describe('需要认证的路由', () => {
    it('未登录时访问 /dashboard 重定向到 /login', async () => {
      ;(getToken as any).mockReturnValue(null)
      await router.push('/dashboard')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('已登录时允许访问 /dashboard', async () => {
      ;(getToken as any).mockReturnValue('valid_token')
      await router.push('/dashboard')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })
  })

  describe('Admin 路由', () => {
    it('未登录时访问 /admin 重定向到 /login', async () => {
      ;(getToken as any).mockReturnValue(null)
      await router.push('/admin/dashboard')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('local_ token + 管理员角色 → 允许访问', async () => {
      ;(getToken as any).mockReturnValue('local_abc123')
      localStorage.setItem('lsjy_user', JSON.stringify({
        username: 'KF02V9',
        roles: ['boss', 'founder', 'super_admin']
      }))
      await router.push('/admin/dashboard')
      expect(router.currentRoute.value.path).toBe('/admin/dashboard')
    })

    it('local_ token + 非管理员角色 → 重定向到 /dashboard', async () => {
      ;(getToken as any).mockReturnValue('local_abc123')
      localStorage.setItem('lsjy_user', JSON.stringify({
        username: 'normaluser',
        roles: ['user']
      }))
      await router.push('/admin/dashboard')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('local_ token + 无用户数据 → 重定向到 /dashboard', async () => {
      ;(getToken as any).mockReturnValue('local_abc123')
      await router.push('/admin/dashboard')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('API token + 管理员角色 → 允许访问', async () => {
      ;(getToken as any).mockReturnValue('jwt_token_xyz')
      ;(userApi.getProfile as any).mockResolvedValue({ data: { data: { username: 'admin1' } } })
      ;(userApi.getMyRoles as any).mockResolvedValue({ data: { data: ['super_admin'] } })
      await router.push('/admin/dashboard')
      expect(router.currentRoute.value.path).toBe('/admin/dashboard')
    })

    it('API token + 非管理员角色 → 重定向到 /dashboard 并清除 token', async () => {
      ;(getToken as any).mockReturnValue('jwt_token_xyz')
      ;(userApi.getProfile as any).mockResolvedValue({ data: { data: { username: 'user1' } } })
      ;(userApi.getMyRoles as any).mockResolvedValue({ data: { data: ['user'] } })
      await router.push('/admin/dashboard')
      expect(router.currentRoute.value.path).toBe('/dashboard')
      expect(removeToken).toHaveBeenCalled()
    })

    it('API token + API 请求失败 → 重定向到 /login', async () => {
      ;(getToken as any).mockReturnValue('jwt_token_xyz')
      // removeToken 被调用后，模拟 token 已清除
      ;(removeToken as any).mockImplementation(() => {
        ;(getToken as any).mockReturnValue(null)
      })
      ;(userApi.getProfile as any).mockRejectedValue(new Error('Network Error'))
      ;(userApi.getMyRoles as any).mockRejectedValue(new Error('Network Error'))
      await router.push('/admin/dashboard')
      expect(router.currentRoute.value.path).toBe('/login')
      expect(removeToken).toHaveBeenCalled()
    })
  })

  describe('算法中台权限', () => {
    it('Boss 用户(KF02V9)可免费访问算法中台', async () => {
      ;(getToken as any).mockReturnValue('valid_token')
      localStorage.setItem('lsjy_user', JSON.stringify({ username: 'KF02V9' }))
      await router.push('/algorithm-platform')
      expect(router.currentRoute.value.path).toBe('/algorithm-platform')
    })

    it('已激活卡密的用户可访问算法中台', async () => {
      ;(getToken as any).mockReturnValue('valid_token')
      localStorage.setItem('lsjy_user', JSON.stringify({ username: 'someone' }))
      localStorage.setItem('lsjy_algo_platform_access', 'true')
      await router.push('/algorithm-platform')
      expect(router.currentRoute.value.path).toBe('/algorithm-platform')
    })

    it('未付费普通用户重定向到钱包页', async () => {
      ;(getToken as any).mockReturnValue('valid_token')
      localStorage.setItem('lsjy_user', JSON.stringify({ username: 'normaluser' }))
      await router.push('/algorithm-platform')
      expect(router.currentRoute.value.path).toBe('/profile/wallet')
    })
  })

  describe('页面标题', () => {
    it('导航后更新 document.title', async () => {
      ;(getToken as any).mockReturnValue('valid_token')
      await router.push('/dashboard')
      expect(document.title).toBe('控制台 - 罗圣纪元SaaS平台')
    })
  })
})
