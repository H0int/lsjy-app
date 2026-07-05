<template>
  <div>
    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <el-input v-model="search" placeholder="搜索对话内容..." class="chat-log-control cyber-input w-64" clearable />
        <el-select v-model="agentFilter" placeholder="智能体" class="chat-log-control cyber-input w-40" clearable popper-class="chat-log-popper">
          <el-option v-for="a in agentNames" :key="a" :label="a" :value="a" />
        </el-select>
        <el-config-provider :locale="zhCn">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" class="chat-log-control chat-log-date cyber-input" popper-class="chat-log-date-popper" format="YYYY年MM月DD日" value-format="YYYY-MM-DD" style="width:260px" />
        </el-config-provider>
      </div>
      <div class="toolbar-right">
        <span class="sync-text">{{ lastSyncAt ? `已同步 ${lastSyncAt}` : '实时同步中' }}</span>
        <el-button class="chat-log-button" :loading="loading" @click="fetchLogs">🔄 刷新</el-button>
        <el-button class="chat-log-button" @click="exportLogs">📥 导出</el-button>
      </div>
    </div>

    <!-- 桌面端 -->
    <div class="hidden md:block">
      <el-table :data="filteredLogs" stripe class="cyber-table">
        <el-table-column label="时间" width="170">
          <template #default="{ row }">
            <span class="font-mono text-xs text-[#6a6a8a]">{{ row.time }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="100">
          <template #default="{ row }">
            <span class="text-white text-sm">{{ row.userName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="智能体" width="120">
          <template #default="{ row }">
            <span class="cyber-tag tag-cyan">{{ row.agentName || row.toolName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户提问" min-width="200">
          <template #default="{ row }">
            <span class="text-sm text-[#a0a0cc]">{{ row.question }}</span>
          </template>
        </el-table-column>
        <el-table-column label="AI回复" min-width="200">
          <template #default="{ row }">
            <span class="text-sm text-[#8888aa] line-clamp-2">{{ row.answer }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Tokens" width="80">
          <template #default="{ row }">
            <span class="font-mono text-xs text-[#a0a0cc]">{{ row.tokens }}</span>
          </template>
        </el-table-column>
        <el-table-column label="延迟" width="80">
          <template #default="{ row }">
            <span class="font-mono text-xs" :class="row.latency < 500 ? 'text-green-400' : 'text-amber-400'">{{ row.latency }}ms</span>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="70">
          <template #default="{ row }">
            <span class="text-sm">{{ '⭐'.repeat(row.rating) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 移动端卡片 -->
    <div class="md:hidden space-y-3">
      <div v-for="row in filteredLogs" :key="row.id" class="cyber-card p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-white text-sm font-medium">{{ row.userName }}</span>
          <span class="text-xs text-[#4a4a6a]">{{ row.time }}</span>
        </div>
        <div class="flex gap-2 mb-2">
          <span class="cyber-tag tag-cyan">{{ row.agentName }}</span>
          <span class="cyber-tag tag-purple">{{ row.tokens }} tokens</span>
        </div>
        <p class="text-sm text-[#a0a0cc] mb-1"><span class="text-[#00f0ff]">Q:</span> {{ row.question }}</p>
        <p class="text-sm text-[#8888aa]"><span class="text-[#7c3aed]">A:</span> {{ row.answer.substring(0,100) }}...</p>
        <div class="flex gap-3 mt-2 text-xs text-[#4a4a6a]">
          <span>{{ row.latency }}ms</span><span>{{ '⭐'.repeat(row.rating) }}</span>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-end">
      <el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize"
        @current-change="(p: number) => page = p" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import service from '@/api/request'

const search = ref('')
const agentFilter = ref('')
const dateRange = ref(null)
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const lastSyncAt = ref('')
let syncTimer: ReturnType<typeof setInterval> | null = null

const agentNames = ref<string[]>([])

const allLogs = ref<any[]>([])

const total = ref(0)

const filteredLogs = computed(() => allLogs.value)

async function fetchLogs() {
  if (loading.value) return
  loading.value = true
  try {
    const res = await service.get('/admin/chat-logs', {
      params: {
        search: search.value,
        toolName: agentFilter.value,
        startDate: Array.isArray(dateRange.value) ? dateRange.value[0] : '',
        endDate: Array.isArray(dateRange.value) ? dateRange.value[1] : '',
        page: page.value,
        pageSize,
        _t: Date.now()
      }
    })
    if (res.data.code === 0) {
      allLogs.value = (res.data.data.logs || res.data.data.list || []).map(normalizeLog)
      total.value = res.data.data.total || 0
      agentNames.value = Array.from(new Set(allLogs.value.map(l => l.agentName).filter(Boolean)))
      lastSyncAt.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  } catch (e) {
    ElMessage.error('加载对话记录失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
  syncTimer = setInterval(fetchLogs, 5000)
  document.addEventListener('visibilitychange', handleVisibilitySync)
})

onUnmounted(() => {
  if (syncTimer) clearInterval(syncTimer)
  document.removeEventListener('visibilitychange', handleVisibilitySync)
})

watch([search, agentFilter, dateRange, page], () => {
  fetchLogs()
})

function handleVisibilitySync() {
  if (!document.hidden) fetchLogs()
}

function normalizeLog(log: any) {
  return {
    ...log,
    userName: log.userName || log.username || `用户#${log.userId || ''}`,
    agentName: log.agentName || log.toolName || 'AI智能体',
    question: log.question || log.input || '',
    answer: log.answer || log.output || '',
    latency: Number(log.latency ?? log.durationMs ?? log.duration ?? 0),
    tokens: Number(log.tokens || 0),
    rating: Number(log.rating || 5),
    time: formatLogTime(log.time || log.createdAt),
  }
}

function formatLogTime(value: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('zh-CN', { hour12: false })
}

function exportLogs() {
  if (!allLogs.value.length) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  const headers = ['时间', '用户', '智能体', '提问', '回复', 'Tokens', '延迟(ms)', '评分']
  const rows = allLogs.value.map(l => [l.time, l.userName, l.agentName, l.question, l.answer, l.tokens, l.latency, l.rating])
  const csv = '﻿' + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chat-logs-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.cyber-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.toolbar-left { display: flex; gap: 12px; flex-wrap: wrap; }
.toolbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sync-text { font-size: 11px; color: #6a6a8a; }
.cyber-input { flex-shrink: 0; }
.chat-log-control :deep(.el-input__wrapper),
.chat-log-control :deep(.el-select__wrapper) {
  background: rgba(10, 10, 20, 0.72) !important;
  border: 1px solid rgba(0, 240, 255, 0.16) !important;
  box-shadow: none !important;
}
.chat-log-date,
.chat-log-date.el-date-editor,
.chat-log-date.el-input__wrapper,
.chat-log-date :deep(.el-input__wrapper) {
  background: rgba(10, 10, 20, 0.78) !important;
  border: 1px solid rgba(0, 240, 255, 0.18) !important;
  box-shadow: none !important;
  color: var(--cyber-text) !important;
}
.chat-log-date :deep(.el-range-input),
.chat-log-date :deep(input) {
  background: transparent !important;
  color: var(--cyber-text) !important;
  -webkit-text-fill-color: var(--cyber-text) !important;
}
.chat-log-date :deep(.el-range-separator) {
  color: var(--cyber-cyan) !important;
  flex: 0 0 auto;
}
.chat-log-control :deep(.el-input__wrapper.is-focus),
.chat-log-control :deep(.el-select__wrapper.is-focused) {
  border-color: var(--cyber-cyan) !important;
  box-shadow: 0 0 0 1px rgba(0, 240, 255, 0.2), 0 0 12px rgba(0, 240, 255, 0.12) !important;
}
.chat-log-control :deep(.el-input__inner),
.chat-log-control :deep(.el-select__selected-item),
.chat-log-control :deep(.el-range-input) {
  color: var(--cyber-text) !important;
  -webkit-text-fill-color: var(--cyber-text) !important;
}
.chat-log-control :deep(.el-input__inner::placeholder),
.chat-log-control :deep(.el-range-input::placeholder) {
  color: rgba(160, 160, 204, 0.72) !important;
  -webkit-text-fill-color: rgba(160, 160, 204, 0.72) !important;
}
.chat-log-control :deep(.el-input__prefix),
.chat-log-control :deep(.el-input__suffix),
.chat-log-control :deep(.el-select__caret),
.chat-log-date :deep(.el-range-separator),
.chat-log-date :deep(.el-range__icon),
.chat-log-date :deep(.el-range__close-icon) {
  color: var(--cyber-cyan) !important;
}
.chat-log-date :deep(.el-date-editor) {
  background: rgba(10, 10, 20, 0.72) !important;
}
.chat-log-date :deep(.el-range-input) {
  background: transparent !important;
}
.chat-log-button {
  background: rgba(10, 10, 20, 0.76) !important;
  border: 1px solid rgba(0, 240, 255, 0.18) !important;
  color: var(--cyber-text) !important;
  box-shadow: none !important;
}
.chat-log-button:hover,
.chat-log-button:focus {
  background: rgba(0, 240, 255, 0.12) !important;
  border-color: var(--cyber-cyan) !important;
  color: var(--cyber-cyan) !important;
}
.chat-log-button :deep(span) {
  color: inherit !important;
}
.w-full { width: 100%; }
.mt-4 { margin-top: 16px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-6 { margin-bottom: 24px; }
.mt-2 { margin-top: 8px; }
.space-y-3 > * + * { margin-top: 12px; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.p-4 { padding: 16px; }
.text-white { color: #fff; }
.text-xs { font-size: 11px; }
.text-sm { font-size: 13px; }
.text-xl { font-size: 20px; }
.font-medium { font-weight: 600; }
.font-mono { font-family: 'Courier New', monospace; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.text-green-400 { color: #00ff88; }
.text-amber-400 { color: #f59e0b; }
.cyber-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.tag-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border: 1px solid rgba(0,240,255,0.2); }
.tag-purple { background: rgba(124,58,237,0.15); color: #c084fc; border: 1px solid rgba(124,58,237,0.3); }

:global(.chat-log-popper),
:global(.chat-log-date-popper) {
  background: #080b18 !important;
  border: 1px solid rgba(0, 240, 255, 0.2) !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55), 0 0 20px rgba(0, 240, 255, 0.1) !important;
}
:global(.chat-log-popper .el-select-dropdown__item) {
  color: #e8f8ff !important;
}
:global(.chat-log-popper .el-select-dropdown__item.is-hovering),
:global(.chat-log-popper .el-select-dropdown__item.is-selected) {
  background: rgba(0, 240, 255, 0.12) !important;
  color: var(--cyber-cyan) !important;
}
:global(.chat-log-date-popper .el-picker-panel),
:global(.chat-log-date-popper .el-date-range-picker),
:global(.chat-log-date-popper .el-picker-panel__body),
:global(.chat-log-date-popper .el-picker-panel__sidebar),
:global(.chat-log-date-popper .el-picker-panel__content),
:global(.chat-log-date-popper .el-date-range-picker__content),
:global(.chat-log-date-popper .el-date-range-picker__time-header),
:global(.chat-log-date-popper .el-picker-panel__footer) {
  background: #080b18 !important;
  color: #e8f8ff !important;
}
:global(.chat-log-date-popper .el-date-table th),
:global(.chat-log-date-popper .el-date-table td),
:global(.chat-log-date-popper .el-picker-panel__icon-btn),
:global(.chat-log-date-popper .el-date-range-picker__header),
:global(.chat-log-date-popper .el-date-range-picker__header div),
:global(.chat-log-date-popper .el-date-table-cell__text) {
  color: #a0a0cc !important;
}
:global(.chat-log-date-popper .el-date-table td.available:hover),
:global(.chat-log-date-popper .el-date-table td.in-range .el-date-table-cell) {
  background: rgba(0, 240, 255, 0.12) !important;
}
:global(.chat-log-date-popper .el-date-table td.current:not(.disabled) .el-date-table-cell__text),
:global(.chat-log-date-popper .el-date-table td.today .el-date-table-cell__text) {
  background: var(--cyber-cyan) !important;
  color: #001018 !important;
}
:global(.chat-log-date-popper .el-button) {
  background: rgba(10, 10, 20, 0.76) !important;
  border-color: rgba(0, 240, 255, 0.18) !important;
  color: var(--cyber-text) !important;
}

:deep(.el-pagination button),
:deep(.el-pagination .el-pager li) {
  background: rgba(10, 10, 20, 0.72) !important;
  color: var(--cyber-text) !important;
  border: 1px solid rgba(0, 240, 255, 0.12);
}
:deep(.el-pagination .el-pager li.is-active) {
  background: rgba(0, 240, 255, 0.16) !important;
  color: var(--cyber-cyan) !important;
}
:deep(.cyber-table),
:deep(.cyber-table .el-table__inner-wrapper),
:deep(.cyber-table .el-table__header-wrapper),
:deep(.cyber-table .el-table__body-wrapper),
:deep(.cyber-table th.el-table__cell),
:deep(.cyber-table tr),
:deep(.cyber-table td.el-table__cell) {
  background: rgba(10, 10, 20, 0.72) !important;
  color: var(--cyber-text) !important;
}
:deep(.cyber-table th.el-table__cell) {
  background: rgba(8, 11, 24, 0.95) !important;
}
@media (max-width: 767px) { .hidden { display: none; } .md\:hidden { display: none; } .md\:block { display: none; } }
@media (min-width: 768px) { .md\:hidden { display: block; } .md\:block { display: block; } }
</style>
