<template>
  <div>
    <!-- 统计卡片 -->
    <div class="cyber-grid-4 mb-4">
      <div class="cyber-stat-mini">
        <div class="flex items-center justify-between">
          <div><p class="stat-lbl">待处理</p><p class="stat-num text-red-400">{{ stats.open }}</p></div>
          <div class="stat-icon-box text-xl">🔴</div>
        </div>
      </div>
      <div class="cyber-stat-mini">
        <div class="flex items-center justify-between">
          <div><p class="stat-lbl">处理中</p><p class="stat-num text-amber-400">{{ stats.processing }}</p></div>
          <div class="stat-icon-box text-xl">🟡</div>
        </div>
      </div>
      <div class="cyber-stat-mini">
        <div class="flex items-center justify-between">
          <div><p class="stat-lbl">平均响应</p><p class="stat-num text-cyan-400">{{ stats.avgResponseTime }}</p></div>
          <div class="stat-icon-box text-xl">⏱️</div>
        </div>
      </div>
      <div class="cyber-stat-mini">
        <div class="flex items-center justify-between">
          <div><p class="stat-lbl">解决率</p><p class="stat-num text-green-400">{{ stats.resolveRate }}%</p></div>
          <div class="stat-icon-box text-xl">✅</div>
        </div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="cyber-toolbar">
      <div class="tab-bar">
        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" class="cyber-tab" :class="{ 'cyber-tab-active': activeTab === tab.value }">{{ tab.label }} <span class="tab-count">{{ tab.count }}</span></button>
      </div>
      <div class="flex-1" />
      <select v-model="assignFilter" class="cyber-select">
        <option value="">全部客服</option>
        <option value="1">客服小王</option>
        <option value="2">客服小李</option>
        <option value="unassigned">未分配</option>
      </select>
    </div>

    <!-- 工单列表 -->
    <div class="cyber-card p-0 overflow-hidden">
      <table class="cyber-html-table">
        <thead>
          <tr>
            <th>工单号</th>
            <th>用户</th>
            <th>主题</th>
            <th>分类</th>
            <th>优先级</th>
            <th>状态</th>
            <th>处理人</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in filteredList" :key="ticket.id" class="table-row-hover cursor-pointer" @click="openDetail(ticket)">
            <td class="font-mono text-xs text-cyan-400">{{ ticket.ticketNo }}</td>
            <td class="text-[#a0a0cc]">{{ ticket.userName }}</td>
            <td class="text-white font-medium max-w-[200px] truncate">{{ ticket.subject }}</td>
            <td><span class="cyber-tag" :class="'tag-' + ticket.category">{{ categoryLabel(ticket.category) }}</span></td>
            <td><span class="cyber-badge" :class="'priority-' + ticket.priority">{{ priorityLabel(ticket.priority) }}</span></td>
            <td><span class="cyber-badge" :class="'status-' + ticket.status">{{ statusLabel(ticket.status) }}</span></td>
            <td class="text-[#6a6a8a] text-xs">{{ ticket.assigneeName || '未分配' }}</td>
            <td class="text-[#4a4a6a] text-xs font-mono">{{ ticket.createdAt }}</td>
            <td>
              <button v-if="!ticket.assigneeId" @click.stop="handleAssign(ticket)" class="cyber-btn-xs cyber-btn-cyan">分配</button>
              <button v-if="ticket.status === 'open' || ticket.status === 'processing'" @click.stop="handleResolve(ticket)" class="cyber-btn-xs cyber-btn-green">解决</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredList.length === 0" class="text-center py-12 text-[#4a4a6a]">暂无工单</div>
    </div>

    <!-- 工单详情弹窗 -->
    <div v-if="selectedTicket" class="cyber-overlay">
      <div class="cyber-dialog cyber-dialog-lg">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-white">{{ selectedTicket.subject }}</h3>
            <p class="text-xs text-[#4a4a6a] mt-1 font-mono">{{ selectedTicket.ticketNo }} | {{ selectedTicket.userName }} | {{ selectedTicket.createdAt }}</p>
          </div>
          <button @click="selectedTicket = null" class="close-btn">✕</button>
        </div>
        <div class="ticket-content-box">
          <p class="text-sm text-[#a0a0cc]">{{ selectedTicket.content }}</p>
        </div>
        <div class="space-y-3 mb-4">
          <div v-for="reply in selectedTicket.replies" :key="reply.id" class="flex gap-3" :class="reply.isStaff ? 'flex-row-reverse' : ''">
            <div class="reply-avatar" :class="reply.isStaff ? 'avatar-staff' : 'avatar-user'">{{ reply.isStaff ? '客' : reply.userName[0] }}</div>
            <div class="max-w-[70%]">
              <div class="flex items-center gap-2 mb-1" :class="reply.isStaff ? 'flex-row-reverse' : ''">
                <span class="text-xs font-medium text-[#a0a0cc]">{{ reply.userName }}</span>
                <span class="text-xs text-[#4a4a6a]">{{ reply.createdAt }}</span>
              </div>
              <div class="reply-bubble" :class="reply.isStaff ? 'reply-staff' : 'reply-customer'">{{ reply.content }}</div>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <input v-model="replyText" class="cyber-text-input flex-1" placeholder="输入回复内容..." />
          <button @click="handleReply" class="cyber-btn cyber-btn-cyan">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ticket } from '@/types'

const activeTab = ref('all')
const assignFilter = ref('')
const selectedTicket = ref<Ticket | null>(null)
const replyText = ref('')

const stats = ref({ open: 8, processing: 5, avgResponseTime: '2.3h', resolveRate: 94 })

const tabs = computed(() => [
  { label: '全部', value: 'all', count: list.value.length },
  { label: '待处理', value: 'open', count: list.value.filter(t => t.status === 'open').length },
  { label: '处理中', value: 'processing', count: list.value.filter(t => t.status === 'processing').length },
  { label: '已解决', value: 'resolved', count: list.value.filter(t => t.status === 'resolved').length },
  { label: '已关闭', value: 'closed', count: list.value.filter(t => t.status === 'closed').length },
])

const list = ref<Ticket[]>([
  { id: 1, ticketNo: 'TK20250718001', userId: 101, userName: '张三', subject: '充值圣点未到账', content: '我在今天上午10点左右充值了200元购买500圣点，支付已成功但圣点没有到账，订单号: PAY2025071800123。', category: 'payment', priority: 'high', status: 'open', assigneeId: null, assigneeName: null, replies: [], firstResponseAt: null, resolvedAt: null, createdAt: '2025-07-18 10:30', updatedAt: '2025-07-18 10:30' },
  { id: 2, ticketNo: 'TK20250718002', userId: 102, userName: '李四', subject: 'AI绘画工具无法使用', content: '使用AI绘画工具时一直显示"处理中"，等了30分钟也没有结果。', category: 'tool', priority: 'medium', status: 'processing', assigneeId: 1, assigneeName: '客服小王', replies: [{ id: 1, ticketId: 2, userId: 1, userName: '客服小王', isStaff: true, content: '您好，已收到您的反馈。请问您使用的是哪个AI绘画工具？能否提供一下请求ID？', createdAt: '2025-07-18 11:00' }, { id: 2, ticketId: 2, userId: 102, userName: '李四', isStaff: false, content: '使用的是"AI国画生成器"，请求ID是 req_abc123456。', createdAt: '2025-07-18 11:15' }], firstResponseAt: '2025-07-18 11:00', resolvedAt: null, createdAt: '2025-07-18 09:45', updatedAt: '2025-07-18 11:15' },
  { id: 3, ticketNo: 'TK20250717003', userId: 103, userName: '王五', subject: '建议增加批量导出功能', content: '希望能增加批量导出AI生成图片的功能，目前一张一张下载太麻烦了。', category: 'suggestion', priority: 'low', status: 'resolved', assigneeId: 2, assigneeName: '客服小李', replies: [{ id: 3, ticketId: 3, userId: 2, userName: '客服小李', isStaff: true, content: '感谢您的建议！我们已将此需求提交至产品团队，预计将在下个版本中实现。', createdAt: '2025-07-17 15:00' }], firstResponseAt: '2025-07-17 15:00', resolvedAt: '2025-07-17 15:30', createdAt: '2025-07-17 14:20', updatedAt: '2025-07-17 15:30' },
  { id: 4, ticketNo: 'TK20250718004', userId: 104, userName: '赵六', subject: '账号被盗用', content: '我发现我的账号在异地登录，怀疑被盗，请帮我冻结账号并重置密码。', category: 'account', priority: 'urgent', status: 'processing', assigneeId: 1, assigneeName: '客服小王', replies: [{ id: 4, ticketId: 4, userId: 1, userName: '客服小王', isStaff: true, content: '已为您临时冻结账号，请提供注册手机号进行身份验证后重置密码。', createdAt: '2025-07-18 08:30' }], firstResponseAt: '2025-07-18 08:30', resolvedAt: null, createdAt: '2025-07-18 08:15', updatedAt: '2025-07-18 08:30' },
  { id: 5, ticketNo: 'TK20250716005', userId: 105, userName: '孙七', subject: '课程视频无法播放', content: '购买的Python课程第三章视频一直显示加载失败。', category: 'bug', priority: 'medium', status: 'closed', assigneeId: 2, assigneeName: '客服小李', replies: [{ id: 5, ticketId: 5, userId: 2, userName: '客服小李', isStaff: true, content: '您好，该视频已修复，请您刷新后重试。', createdAt: '2025-07-16 16:00' }, { id: 6, ticketId: 5, userId: 105, userName: '孙七', isStaff: false, content: '可以正常播放了，谢谢！', createdAt: '2025-07-16 16:30' }], firstResponseAt: '2025-07-16 16:00', resolvedAt: '2025-07-16 16:30', createdAt: '2025-07-16 15:00', updatedAt: '2025-07-16 16:30' },
])

const filteredList = computed(() => {
  let result = list.value
  if (activeTab.value !== 'all') result = result.filter(t => t.status === activeTab.value)
  if (assignFilter.value === 'unassigned') result = result.filter(t => !t.assigneeId)
  else if (assignFilter.value) result = result.filter(t => t.assigneeId === Number(assignFilter.value))
  return result
})

function categoryLabel(c: string) { return { account: '账号', payment: '支付', tool: '工具', bug: '故障', suggestion: '建议', other: '其他' }[c] || c }
function priorityLabel(p: string) { return { low: '低', medium: '中', high: '高', urgent: '紧急' }[p] || p }
function statusLabel(s: string) { return { open: '待处理', processing: '处理中', resolved: '已解决', closed: '已关闭' }[s] || s }

function openDetail(ticket: Ticket) { selectedTicket.value = ticket }
function handleAssign(ticket: Ticket) { ticket.assigneeId = 1; ticket.assigneeName = '客服小王'; ticket.status = 'processing' }
function handleResolve(ticket: Ticket) { ticket.status = 'resolved'; ticket.resolvedAt = new Date().toISOString().slice(0, 16).replace('T', ' ') }
function handleReply() {
  if (!replyText.value.trim() || !selectedTicket.value) return
  selectedTicket.value.replies.push({ id: Date.now(), ticketId: selectedTicket.value.id, userId: 1, userName: '客服小王', isStaff: true, content: replyText.value, createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ') })
  if (selectedTicket.value.status === 'open') selectedTicket.value.status = 'processing'
  replyText.value = ''
}
</script>

<style scoped>
.cyber-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.cyber-stat-mini { background: #12121f; border: 1px solid #1a1a2e; border-radius: 10px; padding: 16px; }
.stat-num { font-size: 24px; font-weight: 800; font-family: 'Courier New', monospace; margin-top: 4px; }
.stat-lbl { font-size: 11px; color: #6a6a8a; }
.stat-icon-box { width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; }

.cyber-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }

.tab-bar { display: flex; gap: 4px; }
.cyber-tab { padding: 8px 16px; border-radius: 8px; font-size: 13px; background: transparent; border: 1px solid #1a1a2e; color: #6a6a8a; cursor: pointer; transition: all 0.2s; }
.cyber-tab:hover { border-color: #00f0ff44; color: #00f0ff; }
.cyber-tab-active { background: rgba(0,240,255,0.1) !important; border-color: #00f0ff !important; color: #00f0ff !important; box-shadow: 0 0 8px rgba(0,240,255,0.2); }
.tab-count { font-size: 10px; opacity: 0.6; margin-left: 4px; }

.cyber-select { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #a0a0cc; outline: none; }
.cyber-select:focus { border-color: #00f0ff; }
.cyber-select option { background: #12121f; }

.cyber-card { background: #12121f; border: 1px solid #1a1a2e; border-radius: 12px; }

.cyber-html-table { width: 100%; font-size: 13px; }
.cyber-html-table th { padding: 12px 16px; text-align: left; color: #4a4a6a; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; background: rgba(26,26,46,0.3); border-bottom: 1px solid #1a1a2e; }
.cyber-html-table td { padding: 12px 16px; border-bottom: 1px solid #1a1a2e; }
.table-row-hover:hover { background: rgba(0,240,255,0.03); }

.cyber-tag { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
.tag-account { background: rgba(255,68,102,0.1); color: #ff4466; }
.tag-payment { background: rgba(245,158,11,0.1); color: #f59e0b; }
.tag-tool { background: rgba(0,240,255,0.1); color: #00f0ff; }
.tag-bug { background: rgba(255,107,0,0.1); color: #ff6b00; }
.tag-suggestion { background: rgba(0,255,136,0.1); color: #00ff88; }
.tag-other { background: rgba(100,100,140,0.1); color: #6a6a8a; }

.cyber-badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.priority-low { background: rgba(100,100,140,0.1); color: #6a6a8a; border: 1px solid #2a2a4e; }
.priority-medium { background: rgba(0,240,255,0.1); color: #00f0ff; border: 1px solid rgba(0,240,255,0.2); }
.priority-high { background: rgba(255,107,0,0.1); color: #ff6b00; border: 1px solid rgba(255,107,0,0.2); }
.priority-urgent { background: rgba(255,68,102,0.1); color: #ff4466; border: 1px solid rgba(255,68,102,0.2); }

.status-open { background: rgba(255,68,102,0.1); color: #ff4466; border: 1px solid rgba(255,68,102,0.2); }
.status-processing { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.status-resolved { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.status-closed { background: rgba(100,100,140,0.1); color: #6a6a8a; border: 1px solid #2a2a4e; }

.cyber-btn-xs { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.cyber-btn-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border: 1px solid rgba(0,240,255,0.2); }
.cyber-btn-green { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }

.cyber-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }

/* Detail Dialog */
.cyber-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; }
.cyber-dialog { background: #12121f; border: 1px solid #1a1a2e; border-radius: 16px; padding: 24px; width: 100%; max-width: 520px; }
.cyber-dialog-lg { max-width: 700px; max-height: 80vh; overflow-y: auto; }
.close-btn { padding: 8px; border-radius: 8px; background: transparent; border: none; color: #4a4a6a; cursor: pointer; font-size: 16px; }
.close-btn:hover { background: rgba(255,255,255,0.05); color: #a0a0cc; }

.ticket-content-box { background: rgba(26,26,46,0.3); border: 1px solid #1a1a2e; border-radius: 8px; padding: 16px; margin-bottom: 16px; }

.reply-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0; }
.avatar-staff { background: linear-gradient(135deg, #00f0ff, #7c3aed); }
.avatar-user { background: #4a4a6a; }

.reply-bubble { border-radius: 8px; padding: 12px; font-size: 13px; }
.reply-staff { background: rgba(0,240,255,0.05); color: #a0a0cc; border: 1px solid rgba(0,240,255,0.1); }
.reply-customer { background: rgba(26,26,46,0.5); color: #a0a0cc; border: 1px solid #1a1a2e; }

.cyber-text-input { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #e0e0ff; outline: none; }
.cyber-text-input:focus { border-color: #00f0ff; }
.cyber-text-input::placeholder { color: #4a4a6a; }

.mb-4 { margin-bottom: 16px; }
.mb-1 { margin-bottom: 4px; }
.mt-1 { margin-top: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.flex-row-reverse { flex-direction: row-reverse; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.max-w-\[70\%\] { max-width: 70%; }
.max-w-\[200px\] { max-width: 200px; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cursor-pointer { cursor: pointer; }
.font-mono { font-family: 'Courier New', monospace; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }
.text-xs { font-size: 11px; }
.text-sm { font-size: 13px; }
.text-lg { font-size: 18px; }
.text-xl { font-size: 20px; }
.text-white { color: #fff; }
.text-cyan-400 { color: #00f0ff; }
.text-red-400 { color: #ff4466; }
.text-amber-400 { color: #f59e0b; }
.text-green-400 { color: #00ff88; }
.space-y-3 > * + * { margin-top: 12px; }
</style>
