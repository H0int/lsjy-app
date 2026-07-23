/**
 * Model Router 统一接入层（前端）
 *
 * 优先调用后端 NestJS 统一模型路由接口 POST /ai/router/chat（任务路由 + 自动降级），
 * 任何失败（未登录 / 401 / 404 / 5xx / 网络异常 / 空回复）均返回 null，
 * 由调用方无缝继续现有降级链（/agent/chat → 直连大模型），纯新增一层、可回退。
 */

export type RouterTaskType = 'simple' | 'complex' | 'code' | 'vision' | 'long_text'

export interface RouterMessage {
  role: string
  content: string
  imageUrl?: string
}

const ROUTER_API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://api.lsjyapp.cn/api/v1').replace(/\/$/, '')

/** 判断消息中是否包含图片内容（多模态数组或 imageUrl 字段） */
function hasImage(messages: Array<{ role: string; content: any; imageUrl?: string }>): boolean {
  return messages.some((m) => {
    if (m.imageUrl) return true
    if (Array.isArray(m.content)) {
      return m.content.some((p: any) => p?.type === 'image_url')
    }
    return false
  })
}

/**
 * 将页面消息（content 可能为多模态数组）转换为 Router 消息格式 { role, content, imageUrl? }
 */
export function toRouterMessages(
  messages: Array<{ role: string; content: any; imageUrl?: string }>,
): RouterMessage[] {
  return messages.map((m) => {
    if (typeof m.content === 'string') {
      return m.imageUrl
        ? { role: m.role, content: m.content, imageUrl: m.imageUrl }
        : { role: m.role, content: m.content }
    }
    if (Array.isArray(m.content)) {
      const text = m.content
        .filter((p: any) => p?.type === 'text')
        .map((p: any) => p.text)
        .join('\n')
      const img = m.content.find((p: any) => p?.type === 'image_url')
      const imageUrl = img?.image_url?.url
      return imageUrl
        ? { role: m.role, content: text, imageUrl }
        : { role: m.role, content: text }
    }
    return { role: m.role, content: String(m.content ?? '') }
  })
}

/**
 * 尝试通过 Model Router 统一对话。
 * 成功返回回复内容；失败返回 null（调用方继续现有降级链）。
 * 消息含图片时自动升级为 vision 任务。
 */
export async function tryModelRouter(opts: {
  taskType?: RouterTaskType
  messages: Array<{ role: string; content: any; imageUrl?: string }>
  token?: string | null
  timeoutMs?: number
}): Promise<string | null> {
  const { messages, token, timeoutMs = 45000 } = opts

  // Router 需 JWT 鉴权：未登录或本地容错 token（local_ 前缀）直接跳过，走现有降级
  if (!token || String(token).startsWith('local_')) return null
  if (!messages || messages.length === 0) return null

  // 含图片自动升级 vision；否则按传入任务类型（缺省 simple）
  const taskType: RouterTaskType = hasImage(messages) ? 'vision' : opts.taskType || 'simple'

  try {
    const res = await fetch(`${ROUTER_API_BASE}/ai/router/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ taskType, messages: toRouterMessages(messages) }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data && data.code === 0) {
      const reply = data.data?.content || data.data?.reply || ''
      return reply || null
    }
    return null
  } catch {
    return null
  }
}
