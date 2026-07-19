<template>
  <div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div class="cyber-card p-4 text-center">
        <div class="text-xs" style="color:#808099;">总对话数</div>
        <div class="text-xl font-bold" style="color:#00f0ff;">{{ stats.total }}</div>
      </div>
      <div class="cyber-card p-4 text-center">
        <div class="text-xs" style="color:#808099;">总 Tokens</div>
        <div class="text-xl font-bold" style="color:#00f0ff;">{{ stats.tokens }}</div>
      </div>
      <div class="cyber-card p-4 text-center">
        <div class="text-xs" style="color:#808099;">平均延迟</div>
        <div class="text-xl font-bold" style="color:#00f0ff;">{{ stats.avgLatency }}ms</div>
      </div>
      <div class="cyber-card p-4 text-center">
        <div class="text-xs" style="color:#808099;">平均评分</div>
        <div class="text-xl font-bold" style="color:#00f0ff;">{{ stats.avgRating }}</div>
      </div>
    </div>

    <div class="cyber-card p-4 mb-4">
      <div class="flex flex-wrap items-center gap-3">
        <el-input v-model="filter.keyword" placeholder="搜索对话内容" clearable style="width: 220px;" />
        <el-select v-model="filter.agent" placeholder="智能体筛选" clearable style="width: 160px;">
          <el-option v-for="a in agentOptions" :key="a.value" :label="a.label" :value="a.value" />
        </el-select>
        <el-date-picker v-model="filter.dateRange" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 260px;" />
        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button @click="resetFilter">重置</el-button>
        <el-button @click="exportData">导出</el-button>
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
      </div>
    </div>

    <div class="cyber-card p-4">
      <el-table :data="list" stripe style="width: 100%;" v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="createdAt" label="时间" width="160">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="agentName" label="智能体" width="140" />
        <el-table-column prop="question" label="用户提问" min-width="200" show-overflow-tooltip />
        <el-table-column prop="answer" label="AI回复" min-width="240" show-overflow-tooltip />
        <el-table-column prop="tokens" label="Tokens" width="90" />
        <el-table-column prop="latency" label="延迟" width="100">
          <template #default="{ row }">{{ row.latency }}ms</template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="100">
          <template #default="{ row }">
            <span v-if="row.rating" style="color:#f59e0b;">{{ '★'.repeat(row.rating) }}</span>
            <span v-else style="color:#808099;">-</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="pagination.total" layout="total, prev, pager, next" @current-change="loadData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'

interface ChatRecord {
  id: string
  createdAt: string
  username: string
  agentName: string
  question: string
  answer: string
  tokens: number
  latency: number
  rating: number
}

const loading = ref(false)
const list = ref<ChatRecord[]>([])
const selected = ref<ChatRecord[]>([])
const agentOptions = ref<{ label: string; value: string }[]>([])
const filter = reactive({ keyword: '', agent: '', dateRange: [] as string[] })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const stats = computed(() => {
  const total = list.value.length
  const tokens = list.value.reduce((s, r) => s + (r.tokens || 0), 0)
  const latSum = list.value.reduce((s, r) => s + (r.latency || 0), 0)
  const avgLatency = total ? Math.round(latSum / total) : 0
  const rated = list.value.filter(r => r.rating)
  const avgRating = rated.length ? (rated.reduce((s, r) => s + r.rating, 0) / rated.length).toFixed(1) : '-'
  return { total, tokens, avgLatency, avgRating }
})

function formatTime(iso: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
}

async function loadData() {
  loading.value = true
  try {
    const params: any = { keyword: filter.keyword, agent: filter.agent, page: pagination.page, pageSize: pagination.pageSize }
    if (filter.dateRange && filter.dateRange.length === 2) {
      params.startDate = filter.dateRange[0]
      params.endDate = filter.dateRange[1]
    }
    const res = await adminApi.getChatHistory(params)
    if (res.code === 0 && res.data) {
      list.value = res.data.list || []
      pagination.total = res.data.total || 0
      const map = new Map<string, string>()
      list.value.forEach(r => { if (r.agentName && !map.has(r.agentName)) map.set(r.agentName, r.agentName) })
      agentOptions.value = Array.from(map.entries()).map(([k, v]) => ({ label: k, value: v }))
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch (e: any) { console.warn('[API] 加载失败:', e?.message) }
  finally { loading.value = false }
}

function resetFilter() {
  Object.assign(filter, { keyword: '', agent: '', dateRange: [] })
  pagination.page = 1
  loadData()
}

function handleSelectionChange(rows: ChatRecord[]) { selected.value = rows }

async function batchDelete() {
  if (!selected.value.length) { ElMessage.warning('请先选择记录'); return }
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selected.value.length} 条对话？`)
    ElMessage.success('删除演示：已清除本地选中')
    loadData()
  } catch { /* cancelled */ }
}

function exportData() {
  const csv = [
    ['时间','用户','智能体','用户提问','AI回复','Tokens','延迟(ms)','评分'].join(','),
    ...list.value.map(r => [
      formatTime(r.createdAt), r.username, r.agentName,
      `"${String(r.question).replace(/"/g,'""')}"`,
      `"${String(r.answer).replace(/"/g,'""')}"`,
      r.tokens, r.latency, r.rating
    ].join(','))
  ].join('\n')
  const blob = new Blob(['\ufeff'+csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `chat-history-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
}

onMounted(loadData)
</script>
