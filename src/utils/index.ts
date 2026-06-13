/**
 * 日期格式化
 */
export function formatDate(date: string | Date, fmt = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date)
  const map: Record<string, number> = {
    YYYY: d.getFullYear(),
    MM: d.getMonth() + 1,
    DD: d.getDate(),
    HH: d.getHours(),
    mm: d.getMinutes(),
    ss: d.getSeconds()
  }
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => {
    return String(map[match]).padStart(2, '0')
  })
}

/**
 * 数字格式化（千分位）
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN')
}

/**
 * 金额格式化
 */
export function formatMoney(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

/**
 * Token 存取
 */
export function getToken(): string | null {
  return localStorage.getItem('lsjy_token')
}

export function setToken(token: string): void {
  localStorage.setItem('lsjy_token', token)
}

export function removeToken(): void {
  localStorage.removeItem('lsjy_token')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('lsjy_refresh_token')
}

export function setRefreshToken(token: string): void {
  localStorage.setItem('lsjy_refresh_token', token)
}

export function removeRefreshToken(): void {
  localStorage.removeItem('lsjy_refresh_token')
}

/**
 * 主题切换
 */
export function getTheme(): 'light' | 'dark' {
  return (localStorage.getItem('lsjy_theme') as 'light' | 'dark') || 'light'
}

export function setTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem('lsjy_theme', theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/**
 * 延迟函数（模拟请求）
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 工具类型映射（对应后端 toolType 字段）
 */
export const toolTypeMap: Record<string, string> = {
  text: '文本生成',
  image: '图片生成',
  video: '视频生成',
  audio: '音频处理',
  analysis: '数据分析',
  other: '其他工具'
}

/**
 * 工具类型图标
 */
export const toolTypeIconMap: Record<string, string> = {
  text: '✍️',
  image: '🎨',
  video: '🎬',
  audio: '🎵',
  analysis: '📊',
  other: '🔧'
}

/**
 * 用户类型映射
 */
export const userTypeMap: Record<string, string> = {
  personal: '个人版',
  merchant: '商户版',
  enterprise: '企业版'
}

/**
 * 交易类型映射
 */
export const txTypeMap: Record<string, string> = {
  recharge: '充值',
  consume: '消费',
  refund: '退款',
  commission: '佣金',
  bonus: '奖励',
  admin_adjust: '管理员调整',
  withdraw: '提现',
  transfer: '转账'
}

/**
 * 用户状态映射
 */
export const userStatusMap: Record<string, string> = {
  active: '正常',
  frozen: '冻结',
  banned: '封禁'
}

/**
 * 角色名映射
 */
export const roleNameMap: Record<string, string> = {
  super_admin: '超级管理员',
  operator: '运营',
  merchant: '商户',
  user: '普通用户'
}
