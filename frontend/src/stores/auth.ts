import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi, paymentApi } from '@/api'
import { getToken, setToken, removeToken } from '@/utils'
import type { User } from '@/types'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(getToken() || '')
  
  // 从localStorage恢复用户信息
  let savedUser: User | null = null
  try {
    const u = localStorage.getItem('lsjy_user')
    if (u) savedUser = JSON.parse(u)
  } catch (e) {}
  
  const user = ref<User | null>(savedUser)
  const userRoles = ref<string[]>([])
  const coinBalance = ref(0)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userRoles.value.some(r => ['super_admin', 'boss', 'operator'].includes(r)))
  const nickname = computed(() => user.value?.nickname || (user.value?.username || '用户'))

  // 登录（用户名 + 密码）
  async function login(username: string, password: string) {
    loading.value = true
    try {
      const res = await authApi.login(username, password)
      // 后端返回格式: { code, message, data: { accessToken, refreshToken, user } }
      const apiData = (res as any).data ?? res.data
      const data = apiData?.data || apiData
      const accessToken = data.token || data.accessToken
      const refreshToken = data.refreshToken
      const loginUser = data.userInfo || data.user
      token.value = accessToken
      setToken(accessToken)
      localStorage.setItem('lsjy_refresh_token', refreshToken)
      // 保存用户信息到内存和localStorage
      user.value = loginUser
      localStorage.setItem('lsjy_user', JSON.stringify(loginUser))
      userRoles.value = loginUser.roles || []
      ElMessage.success('登录成功')
      // 异步获取余额
      fetchBalance()
      return true
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '登录失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  async function fetchUserProfile() {
    try {
      const res = await userApi.getProfile()
      const userData = (res as any).data?.data || (res as any).data
      user.value = userData
      localStorage.setItem('lsjy_user', JSON.stringify(userData))
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

  // 获取圣力余额
  async function fetchBalance() {
    try {
      const res = await paymentApi.getBalance()
      const balData = (res as any).data?.data || (res as any).data
      coinBalance.value = balData.balance
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
    localStorage.removeItem('lsjy_user')
    localStorage.removeItem('lsjy_remember')
    ElMessage.success('已退出登录')
  }

  return {
    token, user, userRoles, coinBalance, loading,
    isLoggedIn, isAdmin, nickname,
    login, fetchUserProfile, fetchBalance, logout
  }
})

