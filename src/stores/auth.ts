import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi, paymentApi } from '@/api'
import { getToken, setToken, removeToken } from '@/utils'
import type { User } from '@/types'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(getToken() || '')
  const user = ref<User | null>(null)
  const userRoles = ref<string[]>([])
  const coinBalance = ref(0)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userRoles.value.some(r => ['super_admin', 'operator'].includes(r)))
  const nickname = computed(() => user.value?.nickname || '未登录')

  // 登录（用户名 + 密码）
  async function login(username: string, password: string) {
    loading.value = true
    try {
      const res = await authApi.login(username, password)
      const { accessToken, refreshToken, user: loginUser } = res.data
      token.value = accessToken
      setToken(accessToken)
      localStorage.setItem('lsjy_refresh_token', refreshToken)
      // 直接使用登录返回的用户信息
      user.value = loginUser
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
    token, user, userRoles, coinBalance, loading,
    isLoggedIn, isAdmin, nickname,
    login, fetchUserProfile, fetchBalance, logout
  }
})
