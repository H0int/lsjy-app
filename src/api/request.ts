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
    // 兼容多种后端响应格式
    const body = response.data as any

    // 格式1: NestJS双层包装 {code, data:{data:...}} → {code, data:...}
    if (body && typeof body === 'object' && 'code' in body && body.data && typeof body.data === 'object' && 'data' in body.data) {
      response.data = { ...body, data: body.data.data }
    }
    // 格式2: Express后端 {success, token, user} - 不做修改，直接返回
    // 格式3: 直接返回数据 - 不做修改

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 网络错误：静默处理，不打扰用户（前端已内置降级数据）
    const isNetErr = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error'
    if (isNetErr) {
      console.warn('[API] 网络不可用:', originalRequest.url)
      return Promise.reject(error)
    }

    // 401处理：尝试Token刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
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
      if (!refreshToken || refreshToken === 'lsjy_no_refresh_token') {
        removeToken()
        localStorage.removeItem('lsjy_refresh_token')
        localStorage.removeItem('lsjy_user')
        window.location.href = '/#/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/refresh`,
          { refreshToken }
        )
        // 兼容多种token刷新响应格式
        const newAccessToken = data?.data?.accessToken || data?.accessToken || data?.token
        const newRefreshToken = data?.data?.refreshToken || data?.refreshToken

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
        localStorage.removeItem('lsjy_user')
        ElMessage.error('登录已过期，请重新登录')
        window.location.href = '/#/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 其他错误：登录请求由登录页处理；404静默（功能可能尚未部署）
    // 其余状态码也静默处理，由业务代码自行决定是否提示用户
    const isLoginReq = originalRequest.url?.includes('/auth/login')
    if (!isLoginReq) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || '请求失败'
      console.warn('[API] 请求失败:', originalRequest.url, msg)
    }
    return Promise.reject(error)
  }
)

export default service
