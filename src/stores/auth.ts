import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi, paymentApi } from '@/api'
import { getToken, setToken, removeToken } from '@/utils'
import type { User } from '@/types'
import { ElMessage } from 'element-plus'

// 兼容多种后端返回格式的数据提取
function extractLoginData(response: any): { accessToken: string; refreshToken?: string; user: any } | null {
  if (!response) return null

  // 格式1: { code: 0, data: { accessToken, refreshToken, user } } - NestJS标准
  if (response.code === 0 && response.data) {
    const d = response.data
    if (d.accessToken && d.user) {
      return { accessToken: d.accessToken, refreshToken: d.refreshToken, user: d.user }
    }
  }

  // 格式2: { success: true, token, user } - Express简单后端
  if (response.success && response.token) {
    const userData = response.user || {}
    const roles = userData.roles || (userData.role ? [userData.role] : ['user'])
    return {
      accessToken: response.token,
      refreshToken: response.refreshToken,
      user: {
        id: userData.id || 1,
        username: userData.username || '',
        nickname: userData.nickname || userData.username || '用户',
        avatar: userData.avatar || null,
        email: userData.email || null,
        phone: userData.phone || null,
        gender: userData.gender || 0,
        bio: userData.bio || '',
        userType: userData.userType || 'personal',
        vipLevel: userData.vipLevel || 0,
        status: userData.status || 'active',
        roles: roles,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString()
      }
    }
  }

  // 格式3: { accessToken, user } - 直接返回
  if (response.accessToken && response.user) {
    return { accessToken: response.accessToken, refreshToken: response.refreshToken, user: response.user }
  }

  // 格式4: { token, user } - 直接返回
  if (response.token && response.user) {
    const userData = response.user
    const roles = userData.roles || (userData.role ? [userData.role] : ['user'])
    return {
      accessToken: response.token,
      refreshToken: response.refreshToken,
      user: { ...userData, roles }
    }
  }

  return null
}

// 从多种角色格式中提取
function extractRoles(roles: any): string[] {
  if (!roles) return []
  if (typeof roles === 'string') return [roles]
  if (Array.isArray(roles)) {
    return roles.map((r: any) => {
      if (typeof r === 'string') return r
      return r.roleName || r.name || r.role || ''
    }).filter(Boolean)
  }
  return []
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(getToken() || '')
  const user = ref<User | null>(null)
  const userRoles = ref<string[]>([])
  const coinBalance = ref(0)
  const loading = ref(false)
  const isLocalAuth = ref(false)

  // 初始化时从localStorage恢复用户信息
  try {
    const savedUser = localStorage.getItem('lsjy_user')
    if (savedUser && token.value) {
      user.value = JSON.parse(savedUser)
      userRoles.value = extractRoles(user.value?.roles)
    }
  } catch (e) {}

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userRoles.value.some(r => ['super_admin', 'boss', 'founder', 'ultimate_admin', 'admin', 'operator'].includes(r)))
  const isBossAccount = computed(() => user.value?.username === 'KF02V9' && isAdmin.value)
  const nickname = computed(() => user.value?.nickname || user.value?.username || '未登录')

  // 登录（用户名 + 密码）- 必须由后端签发token
  // 返回 true=成功, false=密码错误, 'network'=网络/服务器不可用
  async function login(username: string, password: string): Promise<boolean | string> {
    loading.value = true
    const uname = username.trim()
    try {
      // 远程登录 - 兼容多种后端格式
      try {
        const res = await authApi.login(uname, password)
        const loginData = extractLoginData(res)

        if (loginData) {
          token.value = loginData.accessToken
          setToken(loginData.accessToken)
          if (loginData.refreshToken) {
            localStorage.setItem('lsjy_refresh_token', loginData.refreshToken)
          } else {
            localStorage.setItem('lsjy_refresh_token', 'lsjy_no_refresh_token')
          }
          user.value = loginData.user as User
          userRoles.value = extractRoles(loginData.user.roles)
          isLocalAuth.value = false
          localStorage.setItem('lsjy_user', JSON.stringify(loginData.user))
          localStorage.removeItem('lsjy_local_auth')
          ElMessage.success('登录成功')
          fetchBalance().catch(() => {})
          return true
        }

        ElMessage.error('登录响应格式异常，请联系管理员')
        return false
      } catch (remoteErr: any) {
        console.error('远程登录失败:', remoteErr)
        const status = remoteErr?.response?.status
        const isNetErr = !remoteErr.response || remoteErr.code === 'ERR_NETWORK' || remoteErr.message === 'Network Error' || remoteErr.message?.includes('timeout')
        const isServerDown = status >= 500 && status <= 599

        if (isNetErr || isServerDown) {
          ElMessage.warning(`服务器${isServerDown ? '维护中' : '连接异常'}，请稍后再试`)
          return 'network'
        } else {
          const errMsg = remoteErr?.response?.data?.error || remoteErr?.response?.data?.message || remoteErr?.message || '账号或密码错误'
          ElMessage.error(errMsg)
        }
        return false
      }
    } catch (e: any) {
      console.error('登录异常:', e)
      ElMessage.error(e?.message || '登录失败，请稍后重试')
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  async function fetchUserProfile() {
    try {
      const res = await userApi.getProfile()
      const userData = (res as any).data?.data || (res as any).data || res
      if (userData) {
        user.value = userData
        localStorage.setItem('lsjy_user', JSON.stringify(userData))
        userRoles.value = extractRoles(userData.roles)
      }
    } catch (e) {
      console.error('获取用户信息失败', e)
    }
  }

  // 获取圣力余额
  async function fetchBalance() {
    try {
      const res = await paymentApi.getBalance()
      const balData = (res as any).data?.data || (res as any).data || res
      if (balData && typeof balData.balance === 'number') {
        coinBalance.value = balData.balance
      }
    } catch (e) {
      console.error('获取余额失败', e)
    }
  }

  // 退出登录
  async function logout() {
    try {
      if (!isLocalAuth.value) {
        await authApi.logout().catch(() => {})
      }
    } catch {
      // ignore
    }
    token.value = ''
    user.value = null
    userRoles.value = []
    coinBalance.value = 0
    isLocalAuth.value = false
    removeToken()
    localStorage.removeItem('lsjy_refresh_token')
    localStorage.removeItem('lsjy_user')
    localStorage.removeItem('lsjy_local_auth')
    ElMessage.success('已退出登录')
  }

  return {
    token, user, userRoles, coinBalance, loading, isLocalAuth,
    isLoggedIn, isAdmin, isBossAccount, nickname,
    login, fetchUserProfile, fetchBalance, logout
  }
})
