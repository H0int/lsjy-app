import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'
import { getToken, removeToken } from '@/utils'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const service: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
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

    // 401处理：尝试Token刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 已在刷新中，加入等待队列
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
        // 无refreshToken，直接登出
        removeToken()
        localStorage.removeItem('lsjy_refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // 尝试刷新Token
        const { data } = await axios.post(
          `${API_BASE}/auth/refresh`,
          { refreshToken }
        )
        const newAccessToken = data.data?.accessToken
        const newRefreshToken = data.data?.refreshToken

        if (newAccessToken) {
          localStorage.setItem('lsjy_token', newAccessToken)
          if (newRefreshToken) {
            localStorage.setItem('lsjy_refresh_token', newRefreshToken)
          }
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
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 非401错误：统一提示
    const msg = error.response?.data?.message || error.message || '网络异常'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default service
