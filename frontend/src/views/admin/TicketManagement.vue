<template>
  <div>
    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div><p class="text-sm text-gray-500">待处理</p><p class="text-2xl font-bold text-red-500 mt-1">{{ stats.open }}</p></div>
          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-xl">🔴</div>
        </div>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div><p class="text-sm text-gray-500">处理中</p><p class="text-2xl font-bold text-amber-500 mt-1">{{ stats.processing }}</p></div>
          <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-xl">🟡</div>
        </div>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div><p class="text-sm text-gray-500">平均响应</p><p class="text-2xl font-bold text-blue-500 mt-1">{{ stats.avgResponseTime }}</p></div>
          <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">⏱️</div>
        </div>
      </div>
      <div class="bg-white dark:bg-dark-100 rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div><p class="text-sm text-gray-500">解决率</p><p class="text-2xl font-bold text-green-500 mt-1">{{ stats.resolveRate }}%</p></div>
          <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-xl">✅</div>
        </div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="flex items-center gap-3 mb-4">
      <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" class="px-4 py-2 rounded-lg text-sm transition-colors" :class="activeTab === tab.value ? 'bg-primary text-white' : 'bg-white dark:bg-dark-100 text-gray-600 dark:text-gray-400 hover:bg-gray-100'">{{ tab.label }} <span class="ml-1 opacity-70">({{ tab.count }})</span></button>
      <div class="flex-1" />
      <select v-model="assignFilter" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
        <option value="">全部客服</option>
        <option value="1">客服小王</option>
        <option value="2">客服小李</option>
        <option value="unassigned">未分配</option>
      </select>
    </div>

    <!-- 工单列表 -->
    <div class="bg-white dark:bg-dark-100 rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-dark-200">
          <tr>
            <th class="px-4 py-3 text-left text-gray-500">工单号</th>
            <th class="px-4 py-3 text-left text-gray-500">用户</th>
            <th class="px-4 py-3 text-left text-gray-500">主题</th>
            <th class="px-4 py-3 text-left text-gray-500">分类</th>
            <th class="px-4 py-3 text-left text-gray-500">优先级</th>
            <th class="px-4 py-3 text-left text-gray-500">状态</th>
            <th class="px-4 py-3 text-left text-gray-500">处理人</th>
            <th class="px-4 py-3 text-left text-gray-500">创建时间</th>
            <th class="px-4 py-3 text-left text-gray-500">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr v-for="ticket in filteredList" :key="ticket.id" class="hover:bg-gray-50 dark:hover:bg-dark-200 cursor-pointer" @click="openDetail(ticket)">
            <td class="px-4 py-3 text-primary font-mono text-xs">{{ ticket.ticketNo }}</td>
            <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ ticket.userName }}</td>
            <td class="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium max-w-[200px] truncate">{{ ticket.subject }}</td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs" :class="categoryClass(ticket.category)">{{ categoryLabel(ticket.category) }}</span></td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="priorityClass(ticket.priority)">{{ priorityLabel(ticket.priority) }}</span></td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs" :class="statusClass(ticket.status)">{{ statusLabel(ticket.status) }}</span></td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ ticket.assigneeName || '未分配' }}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ ticket.createdAt }}</td>
            <td class="px-4 py-3">
              <button v-if="!ticket.assigneeId" @click.stop="handleAssign(ticket)" class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">分配</button>
              <button v-if="ticket.status === 'open' || ticket.status === 'processing'" @click.stop="handleResolve(ticket)" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">解决</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredList.length === 0" class="text-center py-12 text-gray-400">暂无工单</div>
    </div>

    <!-- 工单详情弹窗 -->
    <div v-if="selectedTicket" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedTicket.subject }}</h3>
            <p class="text-xs text-gray-400 mt-1">{{ selectedTicket.ticketNo }} | {{ selectedTicket.userName }} | {{ selectedTicket.createdAt }}</p>
          </div>
          <button @click="selectedTicket = null" class="p-2 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg text-gray-400">✕</button>
        </div>
        <div class="bg-gray-50 dark:bg-dark-200 rounded-lg p-4 mb-4">
          <p class="text-sm text-gray-700 dark:text-gray-300">{{ selectedTicket.content }}</p>
        </div>
        <!-- 回复列表 -->
        <div class="space-y-3 mb-4">
          <div v-for="reply in selectedTicket.replies" :key="reply.id" class="flex gap-3" :class="reply.isStaff ? 'flex-row-reverse' : ''">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" :class="reply.isStaff ? 'bg-primary' : 'bg-gray-400'">{{ reply.isStaff ? '客' : reply.userName[0] }}</div>
            <div class="max-w-[70%]">
              <div class="flex items-center gap-2 mb-1" :class="reply.isStaff ? 'flex-row-reverse' : ''">
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ reply.userName }}</span>
                <span class="text-xs text-gray-400">{{ reply.createdAt }}</span>
              </div>
              <div class="rounded-lg p-3 text-sm" :class="reply.isStaff ? 'bg-primary/10 text-gray-700 dark:text-gray-200' : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'">{{ reply.content }}</div>
            </div>
          </div>
        </div>
        <!-- 回复输入 -->
        <div class="flex gap-2">
          <input v-model="replyText" class="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" placeholder="输入回复内容..." />
          <button @click="handleReply" class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">发送</button>
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
function categoryClass(c: string) { return { account: 'bg-red-100 text-red-700', payment: 'bg-amber-100 text-amber-700', tool: 'bg-blue-100 text-blue-700', bug: 'bg-orange-100 text-orange-700', suggestion: 'bg-green-100 text-green-700', other: 'bg-gray-100 text-gray-700' }[c] || '' }
function priorityLabel(p: string) { return { low: '低', medium: '中', high: '高', urgent: '紧急' }[p] || p }
function priorityClass(p: string) { return { low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' }[p] || '' }
function statusLabel(s: string) { return { open: '待处理', processing: '处理中', resolved: '已解决', closed: '已关闭' }[s] || s }
function statusClass(s: string) { return { open: 'bg-red-100 text-red-700', processing: 'bg-amber-100 text-amber-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-500' }[s] || '' }

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
