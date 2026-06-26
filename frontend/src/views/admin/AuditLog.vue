<template>
  <div>
    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <el-input v-model="search" placeholder="搜索操作内容..." class="cyber-input w-64" clearable />
        <el-select v-model="moduleFilter" placeholder="操作类型" class="cyber-input w-36" clearable>
          <el-option v-for="a in actionTypes" :key="a" :label="a" :value="a" />
        </el-select>
        <el-select v-model="levelFilter" placeholder="风险等级" class="cyber-input w-32" clearable>
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
      </div>
      <el-button @click="exportLogs">📥 导出审计日志</el-button>
    </div>

    <div class="cyber-grid-4 mb-6">
      <div class="cyber-stat-mini">
        <p class="stat-lbl">日志总数</p>
        <p class="stat-num text-white">{{ total }}</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">高风险操作</p>
        <p class="stat-num text-pink-400">{{ logs.filter(l=>l.risk==='high').length }}</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">活跃管理员</p>
        <p class="stat-num text-cyan-400">{{ adminNames.length }}</p>
      </div>
      <div class="cyber-stat-mini">
        <p class="stat-lbl">当前页</p>
        <p class="stat-num text-red-400">{{ page }}/{{ Math.ceil(total / pageSize) || 1 }}</p>
      </div>
    </div>

    <!-- 桌面端 -->
    <div class="hidden md:block">
      <el-table :data="filteredLogs" stripe class="cyber-table" v-loading="loading">
        <el-table-column label="时间" width="170">
          <template #default="{ row }">
            <span class="font-mono text-xs text-[#6a6a8a]">{{ row.time }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作人" width="100">
          <template #default="{ row }">
            <span class="text-white text-sm">{{ row.admin }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作类型" width="120">
          <template #default="{ row }">
            <span class="cyber-tag" :class="actionTagClass(row.action)">{{ row.action }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作内容" min-width="280">
          <template #default="{ row }">
            <span class="text-sm text-[#a0a0cc]">{{ row.detail }}</span>
          </template>
        </el-table-column>
        <el-table-column label="IP" width="130">
          <template #default="{ row }">
            <span class="font-mono text-xs text-[#6a6a8a]">{{ row.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column label="风险" width="80">
          <template #default="{ row }">
            <span class="cyber-badge" :class="riskClass(row.risk)">{{ riskLabel(row.risk) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结果" width="80">
          <template #default="{ row }">
            <span :class="row.success ? 'text-green-400' : 'text-red-400'" class="text-sm">{{ row.success ? '成功' : '失败' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 移动端 -->
    <div class="md:hidden space-y-3">
      <div v-for="row in filteredLogs" :key="row.id" class="cyber-card p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-white text-sm font-medium">{{ row.admin }}</span>
          <span class="text-xs text-[#4a4a6a]">{{ row.time }}</span>
        </div>
        <div class="flex gap-2 mb-2">
          <span class="cyber-tag" :class="actionTagClass(row.action)">{{ row.action }}</span>
          <span class="cyber-badge" :class="riskClass(row.risk)">{{ riskLabel(row.risk) }}</span>
          <span :class="row.success ? 'text-green-400' : 'text-red-400'" class="text-xs">{{ row.success ? '✓ 成功' : '✗ 失败' }}</span>
        </div>
        <p class="text-sm text-[#a0a0cc]">{{ row.detail }}</p>
        <p class="text-xs text-[#4a4a6a] mt-2 font-mono">IP: {{ row.ip }}</p>
      </div>
    </div>

    <div class="mt-4 flex justify-end">
      <el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize"
        :current-page="page"
        @current-change="(p: number) => { page = p; fetchLogs() }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import service from '@/api/request'
import { ElMessage } from 'element-plus'

const search = ref('')
const moduleFilter = ref('')
const levelFilter = ref('')
const page = ref(1)
const pageSize = 20

const actionTypes = ['创建', '修改', '删除', '登录', '配置变更', '数据导出', '权限变更']
const adminNames = ref<string[]>([])

const logs = ref<any[]>([])
const total = ref(0)
const loading = ref(false)

async function fetchLogs() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize }
    if (moduleFilter.value) params.module = moduleFilter.value
    if (levelFilter.value) params.level = levelFilter.value
    const res = await service.get('/audit-logs', { params })
    if (res.data.code === 0) {
      const d = res.data.data
      logs.value = d.logs || []
      total.value = d.total || 0
      // Extract unique admin names from logs for the filter dropdown
      const names = new Set(logs.value.map((l: any) => l.admin).filter(Boolean))
      if (names.size > 0) adminNames.value = Array.from(names) as string[]
    }
  } catch {
    ElMessage.error('加载审计日志失败')
  } finally {
    loading.value = false
  }
}

const filteredLogs = computed(() => {
  let list = logs.value
  if (search.value) list = list.filter(l => (l.detail || '').includes(search.value))
  if (moduleFilter.value) list = list.filter(l => l.action === moduleFilter.value)
  if (levelFilter.value) list = list.filter(l => l.risk === levelFilter.value)
  return list
})

function actionTagClass(action: string) {
  const map: Record<string, string> = { '创建':'tag-green', '修改':'tag-cyan', '删除':'tag-red', '登录':'tag-purple', '配置变更':'tag-amber', '数据导出':'tag-cyan', '权限变更':'tag-red' }
  return map[action] || 'tag-cyan'
}
function riskClass(r: string) { return r === 'high' ? 'badge-high' : r === 'medium' ? 'badge-medium' : 'badge-low' }
function riskLabel(r: string) { return { high: '高', medium: '中', low: '低' }[r] || r }

function exportLogs() {
  const headers = ['时间', '操作人', '操作类型', '操作内容', 'IP', '风险', '结果']
  const rows = filteredLogs.value.map(l => [
    l.time, l.admin, l.action, l.detail, l.ip, riskLabel(l.risk), l.success ? '成功' : '失败'
  ])
  const csv = '﻿' + [headers.join(','), ...rows.map(r => r.map(c => `"${c || ''}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('审计日志导出成功')
}

// Watch filter changes and reset page
watch([moduleFilter, levelFilter], () => {
  page.value = 1
  fetchLogs()
})

onMounted(fetchLogs)
</script>

<style scoped>
.cyber-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.toolbar-left { display: flex; gap: 12px; flex-wrap: wrap; }
.cyber-input { flex-shrink: 0; }
.w-full { width: 100%; }
.mb-2 { margin-bottom: 8px; }
.mb-6 { margin-bottom: 24px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.space-y-3 > * + * { margin-top: 12px; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.gap-2 { gap: 8px; }
.p-4 { padding: 16px; }
.text-white { color: #fff; }
.text-xs { font-size: 11px; }
.text-sm { font-size: 13px; }
.font-mono { font-family: 'Courier New', monospace; }
.font-medium { font-weight: 600; }
.text-green-400 { color: #00ff88; }
.text-red-400 { color: #ff4466; }
.text-pink-400 { color: #ff00ff; }
.text-cyan-400 { color: #00f0ff; }
.cyber-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.tag-green { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.tag-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border: 1px solid rgba(0,240,255,0.2); }
.tag-red { background: rgba(255,68,102,0.1); color: #ff4466; border: 1px solid rgba(255,68,102,0.2); }
.tag-purple { background: rgba(124,58,237,0.15); color: #c084fc; border: 1px solid rgba(124,58,237,0.3); }
.tag-amber { background: rgba(255,184,0,0.1); color: #ffb800; border: 1px solid rgba(255,184,0,0.2); }
.cyber-badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-high { background: rgba(255,0,255,0.1); color: #ff00ff; border: 1px solid rgba(255,0,255,0.3); }
.badge-medium { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.badge-low { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
@media (max-width: 767px) { .hidden { display: none; } .md\:hidden { display: none; } .md\:block { display: none; } .cyber-grid-4 { grid-template-columns: 1fr 1fr !important; } }
@media (min-width: 768px) { .md\:hidden { display: block; } .md\:block { display: block; } }
</style>
