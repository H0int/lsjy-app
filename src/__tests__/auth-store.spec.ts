import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock @/api
vi.mock('@/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  },
  userApi: {
    getProfile: vi.fn(),
    getMyRoles: vi.fn()
  },
  paymentApi: {
    getBalance: vi.fn()
  }
}))

// Mock element-plus
vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
}))

import { authApi, userApi, paymentApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('初始状态', () => {
    it('无 token 时 isLoggedIn 为 false', () => {
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)
      expect(store.user).toBeNull()
      expect(store.userRoles).toEqual([])
    })

    it('有 token 时 isLoggedIn 为 true', () => {
      localStorage.setItem('lsjy_token', 'test_token')
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(true)
    })

    it('从 localStorage 恢复用户信息', () => {
      localStorage.setItem('lsjy_token', 'test_token')
      localStorage.setItem('lsjy_user', JSON.stringify({
        username: 'testuser',
        nickname: '测试用户',
        roles: ['user']
      }))
      const store = useAuthStore()
      expect(store.user?.username).toBe('testuser')
      expect(store.userRoles).toEqual(['user'])
    })

    it('local_ token 时余额为 Infinity', () => {
      localStorage.setItem('lsjy_token', 'local_abc')
      localStorage.setItem('lsjy_user', JSON.stringify({ username: 'KF02V9', roles: ['boss'] }))
      const store = useAuthStore()
      expect(store.coinBalance).toBe(Infinity)
    })
  })

  describe('计算属性', () => {
    it('isAdmin 在拥有管理角色时为 true', () => {
      localStorage.setItem('lsjy_token', 'test_token')
      localStorage.setItem('lsjy_user', JSON.stringify({ username: 'admin', roles: ['super_admin'] }))
      const store = useAuthStore()
      expect(store.isAdmin).toBe(true)
    })

    it('isAdmin 在普通用户时为 false', () => {
      localStorage.setItem('lsjy_token', 'test_token')
      localStorage.setItem('lsjy_user', JSON.stringify({ username: 'user1', roles: ['user'] }))
      const store = useAuthStore()
      expect(store.isAdmin).toBe(false)
    })

    it('isBossAccount 对 KF02V9 管理员为 true', () => {
      localStorage.setItem('lsjy_token', 'test_token')
      localStorage.setItem('lsjy_user', JSON.stringify({ username: 'KF02V9', roles: ['boss'] }))
      const store = useAuthStore()
      expect(store.isBossAccount).toBe(true)
    })

    it('nickname 返回用户昵称或默认值', () => {
      const store = useAuthStore()
      expect(store.nickname).toBe('未登录')
    })
  })

  describe('login()', () => {
    it('NestJS 格式登录成功', async () => {
      const mockResponse = {
        code: 0,
        data: {
          accessToken: 'jwt_abc',
          refreshToken: 'refresh_xyz',
          user: { id: 1, username: 'testuser', nickname: '测试', roles: ['user'] }
        }
      }
      ;(authApi.login as any).mockResolvedValue(mockResponse)

      const store = useAuthStore()
      const result = await store.login('testuser', 'password123')

      expect(result).toBe(true)
      expect(store.token).toBe('jwt_abc')
      expect(store.user?.username).toBe('testuser')
      expect(store.isLoggedIn).toBe(true)
      expect(localStorage.getItem('lsjy_token')).toBe('jwt_abc')
      expect(localStorage.getItem('lsjy_refresh_token')).toBe('refresh_xyz')
    })

    it('Express 格式登录成功 (success + token)', async () => {
      const mockResponse = {
        success: true,
        token: 'express_token',
        user: { id: 2, username: 'express_user', roles: ['user'] }
      }
      ;(authApi.login as any).mockResolvedValue(mockResponse)

      const store = useAuthStore()
      const result = await store.login('express_user', 'pass')

      expect(result).toBe(true)
      expect(store.token).toBe('express_token')
      expect(store.user?.username).toBe('express_user')
    })

    it('密码错误 (401) 返回 false', async () => {
      const err: any = new Error('Unauthorized')
      err.response = { status: 401, data: { message: '账号或密码错误' } }
      ;(authApi.login as any).mockRejectedValue(err)

      const store = useAuthStore()
      const result = await store.login('user', 'wrongpass')

      expect(result).toBe(false)
      expect(store.isLoggedIn).toBe(false)
    })

    it('网络错误返回 "network"', async () => {
      const err: any = new Error('Network Error')
      err.code = 'ERR_NETWORK'
      ;(authApi.login as any).mockRejectedValue(err)

      const store = useAuthStore()
      const result = await store.login('user', 'pass')

      expect(result).toBe('network')
    })

    it('服务器 500 错误返回 "network"', async () => {
      const err: any = new Error('Internal Server Error')
      err.response = { status: 500, data: {} }
      ;(authApi.login as any).mockRejectedValue(err)

      const store = useAuthStore()
      const result = await store.login('user', 'pass')

      expect(result).toBe('network')
    })
  })

  describe('logout()', () => {
    it('退出后清除所有状态', async () => {
      localStorage.setItem('lsjy_token', 'test_token')
      localStorage.setItem('lsjy_user', JSON.stringify({ username: 'user1', roles: ['user'] }))
      localStorage.setItem('lsjy_refresh_token', 'refresh')
      ;(authApi.logout as any).mockResolvedValue({})

      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(true)

      await store.logout()

      expect(store.token).toBe('')
      expect(store.user).toBeNull()
      expect(store.userRoles).toEqual([])
      expect(store.coinBalance).toBe(0)
      expect(store.isLoggedIn).toBe(false)
      expect(localStorage.getItem('lsjy_token')).toBeNull()
      expect(localStorage.getItem('lsjy_user')).toBeNull()
      expect(localStorage.getItem('lsjy_refresh_token')).toBeNull()
    })
  })

  describe('fetchBalance()', () => {
    it('local_ token 时余额为 Infinity 不发请求', async () => {
      localStorage.setItem('lsjy_token', 'local_abc')
      const store = useAuthStore()
      await store.fetchBalance()
      expect(store.coinBalance).toBe(Infinity)
      expect(paymentApi.getBalance).not.toHaveBeenCalled()
    })

    it('正常 token 时从 API 获取余额', async () => {
      localStorage.setItem('lsjy_token', 'jwt_token')
      ;(paymentApi.getBalance as any).mockResolvedValue({ data: { data: { balance: 999 } } })

      const store = useAuthStore()
      await store.fetchBalance()
      expect(store.coinBalance).toBe(999)
    })
  })

  describe('fetchUserProfile()', () => {
    it('local_ token 从 localStorage 读取', async () => {
      localStorage.setItem('lsjy_token', 'local_abc')
      localStorage.setItem('lsjy_user', JSON.stringify({ username: 'localuser', roles: ['admin'] }))

      const store = useAuthStore()
      await store.fetchUserProfile()

      expect(store.user?.username).toBe('localuser')
      expect(userApi.getProfile).not.toHaveBeenCalled()
    })

    it('正常 token 从 API 获取', async () => {
      localStorage.setItem('lsjy_token', 'jwt_token')
      ;(userApi.getProfile as any).mockResolvedValue({
        data: { data: { username: 'apiuser', roles: ['user'] } }
      })

      const store = useAuthStore()
      await store.fetchUserProfile()

      expect(store.user?.username).toBe('apiuser')
      expect(userApi.getProfile).toHaveBeenCalled()
    })
  })

  describe('KF02V9 Boss 数据修正', () => {
    it('初始化时强制修正 KF02V9 用户数据', () => {
      localStorage.setItem('lsjy_token', 'local_boss')
      localStorage.setItem('lsjy_user', JSON.stringify({
        username: 'KF02V9',
        nickname: '旧昵称',
        roles: ['user']
      }))

      const store = useAuthStore()
      expect(store.user?.nickname).toBe('罗总')
      expect(store.user?.vipLevel).toBe(99)
      expect(store.userRoles).toContain('boss')
      expect(store.userRoles).toContain('founder')
    })
  })
})
