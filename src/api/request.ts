import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosAdapter } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'
import { getToken, removeToken } from '@/utils'

// ★ 本地模式适配器：local_ token 时直接返回模拟成功响应
const localModeAdapter: AxiosAdapter = (config) => {
  return Promise.resolve({
    data: { code: 0, data: null, message: 'ok' },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    statusText: 'OK'
  } as AxiosResponse)
}

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

    // ★ 本地容错登录时：使用本地适配器直接返回模拟响应，不实际发送请求
    if (token && token.startsWith('local_')) {
      const url = config.url || ''
      // 登录/注册相关请求放行
      if (url.includes('/auth/login') || url.includes('/auth/register')) {
        return config
      }
      console.info('[API] 本地模式，跳过请求:', url)
      config.adapter = localModeAdapter
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

    // 网络错误处理
    const isNetErr = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error'
    if (isNetErr) {
      // 本地容错token时：网络错误静默返回空数据，不报错
      const currentToken = getToken()
      if (currentToken && currentToken.startsWith('local_')) {
        console.info('[API] 本地模式，忽略网络错误:', originalRequest.url)
        return Promise.resolve({ data: { code: 0, data: null }, status: 200, statusText: 'OK', headers: {}, config: originalRequest })
      }
      const isLoginReq = originalRequest.url?.includes('/auth/login')
      if (!isLoginReq) {
        ElMessage.warning('网络连接异常，请检查网络或联系管理员')
      }
      console.warn('[API] 网络不可用:', originalRequest.url)
      return Promise.reject(error)
    }

    // CORS 错误特殊处理
    if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
      ElMessage.error('跨域访问被阻止，请联系管理员配置服务器 CORS')
      return Promise.reject(error)
    }

    // 401处理：尝试Token刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 本地容错token不尝试刷新，静默返回空数据
      const currentToken = getToken()
      if (currentToken && currentToken.startsWith('local_')) {
        console.warn('[API] 本地模式，忽略401:', originalRequest.url)
        return Promise.resolve({ data: { code: 0, data: null }, status: 200, statusText: 'OK', headers: {}, config: originalRequest })
      }

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
