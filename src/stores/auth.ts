import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi, paymentApi } from '@/api'
import { getToken, setToken, removeToken } from '@/utils'
import type { User } from '@/types'
import { ElMessage } from 'element-plus'

// 罗总专属本地账号（后端不可用时仍可登录）
const LUOZONG_ACCOUNT = {
  username: 'KF02V9',
  password: 'LuoKaiZhong02V9',
  user: {
    id: 1, username: 'KF02V9', nickname: '罗总', avatar: null, email: null, phone: '187******92',
    gender: 1, bio: '罗圣纪元创始人', userType: 'enterprise' as const, vipLevel: 99, status: 'active' as const,
    roles: ['super_admin', 'vip_lifetime'],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastLoginAt: new Date().toISOString()
  },
  token: 'lsjy_luozong_token_kf02v9_2026',
  initialBalance: 999999.0
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(getToken() || '')
  const user = ref<User | null>(null)
  const userRoles = ref<string[]>([])
  const coinBalance = ref(0)
  const loading = ref(false)
  const isLocalAuth = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userRoles.value.some(r => ['super_admin', 'operator'].includes(r)))
  const nickname = computed(() => user.value?.nickname || '未登录')

  // 登录（用户名 + 密码）- 本地优先，网络降级
  async function login(username: string, password: string) {
    loading.value = true
    const uname = username.trim()
    try {
      // 优先罗总本地账号验证（不依赖后端）
      if (uname === LUOZONG_ACCOUNT.username && password === LUOZONG_ACCOUNT.password) {
        token.value = LUOZONG_ACCOUNT.token
        setToken(LUOZONG_ACCOUNT.token)
        localStorage.setItem('lsjy_refresh_token', 'lsjy_local_refresh_token')
        user.value = LUOZONG_ACCOUNT.user as User
        userRoles.value = LUOZONG_ACCOUNT.user.roles
        coinBalance.value = LUOZONG_ACCOUNT.initialBalance
        isLocalAuth.value = true
        ElMessage.success('登录成功，欢迎回来罗总！')
        return true
      }

      // 远程登录
      try {
        const res = await authApi.login(uname, password)
        const { accessToken, refreshToken, user: loginUser } = res.data
        token.value = accessToken
        setToken(accessToken)
        localStorage.setItem('lsjy_refresh_token', refreshToken)
        user.value = loginUser
        userRoles.value = loginUser.roles || []
        isLocalAuth.value = false
        ElMessage.success('登录成功')
        fetchBalance()
        return true
      } catch (remoteErr: any) {
        const isNetErr = !remoteErr.response || remoteErr.code === 'ERR_NETWORK' || remoteErr.message === 'Network Error'
        if (isNetErr) {
          ElMessage.warning('服务器连接异常，请检查网络后重试')
        } else {
          ElMessage.error(remoteErr?.response?.data?.message || '账号或密码错误')
        }
        return false
      }
    } catch (e: any) {
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
      const userData = res.data
      user.value = userData
      // 从roles数组提取角色名
      if (Array.isArray(userData.roles) && userData.roles.length > 0) {
        if (typeof userData.roles[0] === 'string') {
          userRoles.value = userData.roles
        } else {
          userRoles.value = userData.roles.map((r: any) => r.roleName || r.name)
        }
      }
    } catch (e) {
      console.error('获取用户信息失败', e)
    }
  }

  // 获取圣点余额
  async function fetchBalance() {
    try {
      const res = await paymentApi.getBalance()
      coinBalance.value = res.data.balance
    } catch (e) {
      console.error('获取余额失败', e)
    }
  }

  // 退出登录
  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    token.value = ''
    user.value = null
    userRoles.value = []
    coinBalance.value = 0
    removeToken()
    localStorage.removeItem('lsjy_refresh_token')
    ElMessage.success('已退出登录')
  }

  return {
    token, user, userRoles, coinBalance, loading, isLocalAuth,
    isLoggedIn, isAdmin, nickname,
    login, fetchUserProfile, fetchBalance, logout
  }
})
