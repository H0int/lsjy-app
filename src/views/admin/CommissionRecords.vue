<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">佣金记录</h2>
      <div class="flex gap-2">
        <el-button @click="loadData">刷新</el-button>
        <el-button @click="exportData">导出</el-button>
        <el-button type="primary" @click="settleAll">批量结算</el-button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="cyber-card p-4 text-center">
        <div class="text-xs" style="color:#808099;">总佣金</div>
        <div class="text-2xl font-bold" style="color:#00f0ff;">¥{{ stats.total }}</div>
      </div>
      <div class="cyber-card p-4 text-center">
        <div class="text-xs" style="color:#808099;">待结算</div>
        <div class="text-2xl font-bold" style="color:#00f0ff;">¥{{ stats.pending }}</div>
      </div>
      <div class="cyber-card p-4 text-center">
        <div class="text-xs" style="color:#808099;">已结算</div>
        <div class="text-2xl font-bold" style="color:#00f0ff;">¥{{ stats.settled }}</div>
      </div>
    </div>

    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无佣金记录">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="source" label="来源" />
        <el-table-column prop="amount" label="佣金" width="100" />
        <el-table-column prop="rate" label="比例" width="90">
          <template #default="{ row }">{{ row.rate ?? '-' }}%</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'settled' ? 'success' : 'warning'" effect="dark" round>{{ row.status === 'settled' ? '已结算' : '待结算' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button v-if="row.status !== 'settled'" size="small" link type="success" @click="settle(row)">结算</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'
import { formatDate } from '@/utils'

const loading = ref(false)
const list = ref<any[]>([])

const stats = computed(() => {
  const total = list.value.reduce((s, r) => s + (r.amount || 0), 0)
  const pending = list.value.filter(r => r.status !== 'settled').reduce((s, r) => s + (r.amount || 0), 0)
  const settled = list.value.filter(r => r.status === 'settled').reduce((s, r) => s + (r.amount || 0), 0)
  return { total: total.toFixed(2), pending: pending.toFixed(2), settled: settled.toFixed(2) }
})

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getCommissions()
    list.value = res.data?.list || res.data?.commissions || res.data?.items || res.data || []
  } catch (e: any) { console.warn('[API] 加载失败:', e?.message) }
  finally { loading.value = false }
}

async function settle(row: any) {
  try {
    await ElMessageBox.confirm(`确认结算用户 ${row.username} 的佣金 ¥${row.amount}？`)
    row.status = 'settled'
    ElMessage.success('已结算')
  } catch { /* cancelled */ }
}

async function settleAll() {
  const pending = list.value.filter(r => r.status !== 'settled')
  if (!pending.length) { ElMessage.info('没有待结算记录'); return }
  try {
    await ElMessageBox.confirm(`确认批量结算 ${pending.length} 条佣金？`)
    pending.forEach(r => r.status = 'settled')
    ElMessage.success('批量结算完成')
  } catch { /* cancelled */ }
}

function exportData() {
  const csv = ['ID,用户,来源,佣金,比例,状态,时间'].join(',') + '\n' + list.value.map(r => [r.id, r.username, r.source, r.amount, r.rate + '%', r.status === 'settled' ? '已结算' : '待结算', formatDate(r.createdAt)].join(',')).join('\n')
  const blob = new Blob(['\ufeff'+csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `commissions-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
}

onMounted(loadData)
</script>
