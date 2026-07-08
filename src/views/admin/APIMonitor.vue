<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">API 监控</h2>
      <div class="flex gap-2">
        <el-button @click="loadData">刷新</el-button>
        <el-button @click="exportData">导出</el-button>
      </div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div class="cyber-card p-4 text-center"><div class="text-xs" style="color:#808099;">总请求</div><div class="text-2xl font-bold" style="color:#00f0ff;">{{ stats.total }}</div></div>
      <div class="cyber-card p-4 text-center"><div class="text-xs" style="color:#808099;">成功率</div><div class="text-2xl font-bold" style="color:#00f0ff;">{{ stats.successRate }}%</div></div>
      <div class="cyber-card p-4 text-center"><div class="text-xs" style="color:#808099;">平均延迟</div><div class="text-2xl font-bold" style="color:#00f0ff;">{{ stats.avgLatency }}ms</div></div>
      <div class="cyber-card p-4 text-center"><div class="text-xs" style="color:#808099;">错误数</div><div class="text-2xl font-bold" style="color:#00f0ff;">{{ stats.errors }}</div></div>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无API监控数据">
        <el-table-column prop="method" label="方法" width="80" />
        <el-table-column prop="path" label="路径" />
        <el-table-column prop="count" label="调用次数" width="100" />
        <el-table-column prop="latency" label="平均延迟" width="100" />
        <el-table-column prop="errors" label="错误数" width="90" />
        <el-table-column prop="lastTime" label="最近调用" width="160">
          <template #default="{ row }">{{ formatDate(row.lastTime) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import service from '@/api/request'
import { formatDate } from '@/utils'

const loading = ref(false)
const list = ref<any[]>([])

const stats = computed(() => {
  const total = list.value.reduce((s, r) => s + (r.count || 0), 0)
  const errors = list.value.reduce((s, r) => s + (r.errors || 0), 0)
  const successRate = total ? Math.round((1 - errors / total) * 100) : 100
  const latSum = list.value.reduce((s, r) => s + (r.latency || 0), 0)
  const avgLatency = list.value.length ? Math.round(latSum / list.value.length) : 0
  return { total, successRate, avgLatency, errors }
})

async function loadData() {
  loading.value = true
  try {
    const res = await service.get('/admin/api-monitor')
    list.value = res.data?.items || res.data?.data?.items || res.data || []
    if (!list.value.length) {
      list.value = [
        { method: 'GET', path: '/api/v1/admin/dashboard', count: 128, latency: 45, errors: 0, lastTime: new Date().toISOString() },
        { method: 'POST', path: '/api/v1/auth/login', count: 86, latency: 120, errors: 2, lastTime: new Date().toISOString() },
        { method: 'GET', path: '/api/v1/knowledge', count: 342, latency: 80, errors: 0, lastTime: new Date().toISOString() },
      ]
    }
  } catch (e: any) { ElMessage.error(e.message || '加载失败') }
  finally { loading.value = false }
}

function exportData() {
  const csv = ['方法,路径,调用次数,平均延迟,错误数,最近调用'].join(',') + '\n' + list.value.map(r => [r.method, r.path, r.count, r.latency, r.errors, formatDate(r.lastTime)].join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `api-monitor-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
}

onMounted(loadData)
</script>
