<template>
  <div>
    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <el-input v-model="search" placeholder="搜索对话内容..." class="cyber-input w-64" clearable />
        <el-select v-model="agentFilter" placeholder="智能体" class="cyber-input w-40" clearable>
          <el-option v-for="a in agentNames" :key="a" :label="a" :value="a" />
        </el-select>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" class="cyber-input" style="width:260px" />
      </div>
      <el-button @click="exportLogs">📥 导出</el-button>
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
            <span class="cyber-tag tag-cyan">{{ row.agentName }}</span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import service from '@/api/request'

const search = ref('')
const agentFilter = ref('')
const dateRange = ref(null)
const page = ref(1)
const pageSize = 20
const loading = ref(false)

const agentNames = ['代码助手', '文案创作', '数据分析', '客服机器人', '翻译专家', '学习导师']

const allLogs = ref<any[]>([])

const total = ref(0)

const filteredLogs = computed(() => allLogs.value)

async function fetchLogs() {
  loading.value = true
  try {
    const res = await service.get('/admin/chat-logs', {
      params: {
        search: search.value,
        toolName: agentFilter.value,
        page: page.value,
        pageSize
      }
    })
    if (res.data.code === 0) {
      allLogs.value = res.data.data.logs || []
      total.value = res.data.data.total || 0
    }
  } catch (e) {
    ElMessage.error('加载对话记录失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchLogs)

watch([search, agentFilter, page], () => {
  fetchLogs()
})

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
.cyber-input { flex-shrink: 0; }
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
@media (max-width: 767px) { .hidden { display: none; } .md\:hidden { display: none; } .md\:block { display: none; } }
@media (min-width: 768px) { .md\:hidden { display: block; } .md\:block { display: block; } }
</style>
