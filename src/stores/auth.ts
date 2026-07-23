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
  const isLocalAuth = ref(localStorage.getItem('lsjy_local_auth') === 'true')

  // 初始化时从localStorage恢复用户信息
  try {
    const savedUser = localStorage.getItem('lsjy_user')
    if (savedUser && token.value) {
      const parsed = JSON.parse(savedUser)
      // 合并 localStorage 中单独保存的头像
      const savedAvatar = localStorage.getItem('lsjy_user_avatar')
      if (savedAvatar && !parsed.avatar) parsed.avatar = savedAvatar
      // ★ 反向保护：如果lsjy_user中有base64头像但lsjy_user_avatar丢失，自动恢复
      if (!savedAvatar && parsed.avatar && parsed.avatar.startsWith('data:image')) {
        localStorage.setItem('lsjy_user_avatar', parsed.avatar)
      }
      // ★ KF02V9/罗总账号数据修正（强制同步最新信息）
      if (parsed.username === 'KF02V9') {
        // 强制更新的字段（每次都覆盖，确保最新）
        parsed.nickname = '罗总'
        parsed.phone = '18890000368'
        parsed.email = '3196542376@qq.com'
        parsed.bio = '罗圣纪元创始人'
        parsed.gender = 1
        parsed.userType = 'founder'
        parsed.vipLevel = 99
        parsed.status = 'active'
        parsed.unlimited = true
        parsed.createdAt = '2026-05-12T00:00:00.000Z'
        if (!parsed.roles?.length || !parsed.roles.includes('boss')) {
          parsed.roles = ['boss', 'founder', 'ultimate_admin', 'super_admin', 'admin', 'operator']
        }
        // ★ 头像保护：lsjy_user_avatar优先，确保不丢失
        if (savedAvatar) {
          parsed.avatar = savedAvatar
        }
        // 同步修正后的数据回localStorage
        localStorage.setItem('lsjy_user', JSON.stringify(parsed))
      }
      user.value = parsed
      userRoles.value = extractRoles(parsed?.roles)
      // Boss本地模式：余额设为无限
      if (token.value.startsWith('local_')) {
        coinBalance.value = Infinity
      }
    }
  } catch (e) {}

  // ★ 后端同步检测：本地模式用户进入系统时，检测后端是否恢复并尝试同步
  async function syncLocalDataToBackend() {
    if (!isLocalAuth.value || !user.value) return
    try {
      const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://api.lsjyapp.cn/api/v1').replace(/\/$/, '')
      const healthRes = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })
      if (healthRes.ok) {
        // 后端恢复了，尝试用本地数据同步注册（如果用户不存在于后端）
        try {
          const known: Record<string, string> = JSON.parse(localStorage.getItem('lsjy_known_accounts') || '{}')
          const pwd = known[user.value.username]
          if (pwd) {
            await authApi.register({
              username: user.value.username,
              password: pwd,
              nickname: user.value.nickname || user.value.username,
              phone: user.value.phone || undefined,
              email: user.value.email || undefined,
            })
          }
        } catch {
          // 用户可能已存在于后端，忽略注册失败
        }
      }
    } catch {
      // 后端仍然不可用，静默忽略
    }
  }

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

        // 响应格式异常：后端可能异常，降级到本地模式
        console.warn('远程登录响应格式异常，降级到本地模式')
        return 'network'
      } catch (remoteErr: any) {
        console.error('远程登录失败:', remoteErr)
        const status = remoteErr?.response?.status
        const responseData = remoteErr?.response?.data
        const isNetErr = !remoteErr.response || remoteErr.code === 'ERR_NETWORK' || remoteErr.message === 'Network Error' || remoteErr.message?.includes('timeout')
        const isServerDown = status >= 500 && status <= 599
        const isClientErr = status === 400 || status === 422

        if (isNetErr || isServerDown || isClientErr) {
          // 网络/服务器/格式错误：静默降级到本地模式，不弹提示（本地容错登录会自动接管）
          console.warn('远程服务器不可用，静默降级到本地模式:', remoteErr?.message || 'unknown error')
          return 'network'
        } else {
          // 真正的密码错误（401/403）：显示提示
          const errMsg = responseData?.error || responseData?.message || '账号或密码错误'
          ElMessage.error(errMsg)
          return false
        }
      }
    } catch (e: any) {
      console.error('登录异常:', e)
      return 'network'
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  async function fetchUserProfile() {
    // 本地容错模式：从 localStorage 读取，不发请求
    const currentToken = getToken()
    if (currentToken && currentToken.startsWith('local_')) {
      try {
        const saved = localStorage.getItem('lsjy_user')
        if (saved) {
          const userData = JSON.parse(saved)
          user.value = userData
          userRoles.value = extractRoles(userData.roles)
        }
      } catch (e) {
        console.error('本地模式读取用户信息失败', e)
      }
      return
    }
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
    // 本地容错模式：Boss 无限，不发请求
    const currentToken = getToken()
    if (currentToken && currentToken.startsWith('local_')) {
      coinBalance.value = Infinity
      return
    }
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
    login, fetchUserProfile, fetchBalance, logout, syncLocalDataToBackend
  }
})
