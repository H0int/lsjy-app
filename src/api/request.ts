import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'
import { getToken, removeToken } from '@/utils'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// ===== Token刷新状态管理 =====
let isRefreshing = false
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void }[] = []

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

// ===== 请求拦截器 =====
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ===== 响应拦截器 =====
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 兼容后端双层data包装: {code, data:{data:...}} → {code, data:...}
    const body = response.data as any
    if (body && typeof body === 'object' && 'code' in body && body.data && typeof body.data === 'object' && 'data' in body.data) {
      response.data = { ...body, data: body.data.data }
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 本地认证Token跳过401处理
    const curToken = localStorage.getItem('lsjy_token')
    const isLocalToken = curToken && curToken.startsWith('lsjy_') && curToken.includes('_token_')

    // 网络错误处理
    const isNetErr = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error'
    if (isNetErr) {
      const isLoginReq = originalRequest.url?.includes('/auth/login')
      if (!isLoginReq && !isLocalToken) {
        ElMessage.warning('网络连接异常，部分功能可能受限')
      }
      return Promise.reject(error)
    }

    // 401处理：尝试Token刷新（本地Token跳过）
    if (error.response?.status === 401 && !originalRequest._retry && !isLocalToken) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return service(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('lsjy_refresh_token')
      if (!refreshToken) {
        removeToken()
        localStorage.removeItem('lsjy_refresh_token')
        window.location.href = '/#/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/refresh`,
          { refreshToken }
        )
        const newAccessToken = data.data?.accessToken
        const newRefreshToken = data.data?.refreshToken

        if (newAccessToken) {
          localStorage.setItem('lsjy_token', newAccessToken)
          if (newRefreshToken) localStorage.setItem('lsjy_refresh_token', newRefreshToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          processQueue(null, newAccessToken)
          return service(originalRequest)
        } else {
          throw new Error('刷新Token失败')
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        removeToken()
        localStorage.removeItem('lsjy_refresh_token')
        ElMessage.error('登录已过期，请重新登录')
        window.location.href = '/#/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 非401错误：登录请求由登录页处理，避免重复弹窗
    const isLoginReq = originalRequest.url?.includes('/auth/login')
    if (!isLoginReq) {
      const msg = error.response?.data?.message || error.message || '请求失败'
      ElMessage.error(msg)
    }
    return Promise.reject(error)
  }
)

export default service
