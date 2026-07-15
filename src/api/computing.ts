import service from './request'
import type { ApiResponse, PageResult } from '@/types'

// ===== 算力调度 & 虚拟数字员工中心 API =====

export const computingApi = {

  // --- 算力调度配置 ---
  getDispatchConfig(): Promise<ApiResponse<any>> {
    return service.get('/computing/dispatch/config').then(r => r.data)
  },

  updateDispatchConfig(data: any): Promise<ApiResponse<any>> {
    return service.put('/computing/dispatch/config', data).then(r => r.data)
  },

  // --- 调度日志 ---
  getDispatchLogs(params?: { page?: number; pageSize?: number; startDate?: string; endDate?: string }): Promise<ApiResponse<PageResult<any>>> {
    return service.get('/computing/dispatch/logs', { params }).then(r => r.data)
  },

  // --- 调度统计 ---
  getDispatchStats(): Promise<ApiResponse<any>> {
    return service.get('/computing/dispatch/stats').then(r => r.data)
  },

  // --- 虚拟员工 ---
  getEmployees(params?: { page?: number; pageSize?: number; status?: string }): Promise<ApiResponse<PageResult<any>>> {
    return service.get('/computing/employees', { params }).then(r => r.data)
  },

  createEmployee(data: any): Promise<ApiResponse<any>> {
    return service.post('/computing/employees', data).then(r => r.data)
  },

  updateEmployee(id: number, data: any): Promise<ApiResponse<any>> {
    return service.put(`/computing/employees/${id}`, data).then(r => r.data)
  },

  deleteEmployee(id: number): Promise<ApiResponse<any>> {
    return service.delete(`/computing/employees/${id}`).then(r => r.data)
  },

  startEmployee(id: number): Promise<ApiResponse<any>> {
    return service.post(`/computing/employees/${id}/start`).then(r => r.data)
  },

  stopEmployee(id: number): Promise<ApiResponse<any>> {
    return service.post(`/computing/employees/${id}/stop`).then(r => r.data)
  },

  // --- 增值服务（用户端） ---
  getPackages(): Promise<ApiResponse<any[]>> {
    return service.get('/computing/packages').then(r => r.data)
  },

  createOrder(data: any): Promise<ApiResponse<any>> {
    return service.post('/computing/orders', data).then(r => r.data)
  },

  getOrders(params?: { page?: number; pageSize?: number; status?: string }): Promise<ApiResponse<PageResult<any>>> {
    return service.get('/computing/orders', { params }).then(r => r.data)
  },

  // --- 导出 ---
  exportData(params: { type: 'defense' | 'business_plan' | 'competitive_analysis' }): Promise<any> {
    return service.post('/computing/export', params, { responseType: 'blob' }).then(r => r.data)
  },

  // ===== 管理后台API =====

  // 套餐管理
  adminGetPackages(): Promise<ApiResponse<any[]>> {
    return service.get('/computing/admin/packages').then(r => r.data)
  },

  adminCreatePackage(data: any): Promise<ApiResponse<any>> {
    return service.post('/computing/admin/packages', data).then(r => r.data)
  },

  adminUpdatePackage(id: number, data: any): Promise<ApiResponse<any>> {
    return service.put(`/computing/admin/packages/${id}`, data).then(r => r.data)
  },

  adminDeletePackage(id: number): Promise<ApiResponse<any>> {
    return service.delete(`/computing/admin/packages/${id}`).then(r => r.data)
  },

  // 订单管理
  adminGetOrders(params?: { page?: number; pageSize?: number; status?: string }): Promise<ApiResponse<PageResult<any>>> {
    return service.get('/computing/admin/orders', { params }).then(r => r.data)
  },

  adminUpdateOrder(id: number, data: any): Promise<ApiResponse<any>> {
    return service.put(`/computing/admin/orders/${id}`, data).then(r => r.data)
  },

  // 虚拟员工管理（全部）
  adminGetEmployees(params?: { page?: number; pageSize?: number; industry?: string; status?: string }): Promise<ApiResponse<PageResult<any>>> {
    return service.get('/computing/admin/employees', { params }).then(r => r.data)
  },

  // 调度日志（全部）
  adminGetLogs(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PageResult<any>>> {
    return service.get('/computing/admin/logs', { params }).then(r => r.data)
  },

  // 全局调度配置
  adminGetConfig(): Promise<ApiResponse<any>> {
    return service.get('/computing/admin/config').then(r => r.data)
  },

  adminUpdateConfig(data: any): Promise<ApiResponse<any>> {
    return service.put('/computing/admin/config', data).then(r => r.data)
  },

  // ===== AI员工接入与分享 =====
  getEmployeeAccess(employeeId: number): Promise<ApiResponse<any>> {
    return service.get(`/computing/employee/${employeeId}/access`).then(r => r.data)
  },

  generateEmbedCode(employeeId: number, options: any): Promise<ApiResponse<any>> {
    return service.post(`/computing/employee/${employeeId}/embed-code`, options).then(r => r.data)
  },

  // ===== 一键部署第三方平台（旧版兼容） =====
  deployToPlatform(data: { employeeId: number; platform: string }): Promise<ApiResponse<any>> {
    return service.post('/computing/admin/employee/deploy', data).then(r => r.data)
  },

  getEmployeeDeployments(employeeId: number): Promise<ApiResponse<any[]>> {
    return service.get(`/computing/admin/employee/deploy/${employeeId}`).then(r => r.data)
  },
}
