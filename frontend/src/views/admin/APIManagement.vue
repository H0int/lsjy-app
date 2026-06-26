<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🔌 API管理</h1><p class="subtitle">API错误监控与管理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">🔌</div><div class="stat-info"><div class="stat-value">{{ stats.total ?? '-' }}</div><div class="stat-label">错误总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-info"><div class="stat-value">{{ stats.todayErrors ?? '-' }}</div><div class="stat-label">今日错误</div></div></div>
      <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-info"><div class="stat-value">{{ stats.resolvedRate ?? '-' }}</div><div class="stat-label">解决率</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">{{ stats.pending ?? '-' }}</div><div class="stat-label">待处理</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header">
        <h2>API错误列表</h2>
        <div style="display:flex;gap:8px;">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable size="small" style="width:120px" @change="fetchErrors">
            <el-option label="pending" value="pending" />
            <el-option label="resolved" value="resolved" />
            <el-option label="ignored" value="ignored" />
          </el-select>
          <el-button size="small" type="primary" @click="batchResolve" :disabled="!selectedIds.length">批量解决</el-button>
        </div>
      </div>
      <el-table :data="errors" style="width: 100%" class="cyber-table" @selection-change="onSelectionChange">
        <el-table-column type="selection" width="40" />
        <el-table-column prop="toolName" label="工具名称" width="140" />
        <el-table-column prop="apiPath" label="路径" />
        <el-table-column prop="errorMessage" label="错误信息" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === 'resolved' ? 'success' : row.status === 'ignored' ? 'info' : 'danger'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="retryError(row)">重试</el-button>
            <el-button size="small" type="success" link @click="resolveError(row)">解决</el-button>
            <el-button size="small" type="danger" link @click="deleteError(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="display:flex;justify-content:flex-end;margin-top:12px;">
        <el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize" :current-page="currentPage" @current-change="onPageChange" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const errors = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const statusFilter = ref('')
const selectedIds = ref<number[]>([])
const stats = ref<any>({})

async function fetchErrors() {
  loading.value = true
  try {
    const params: any = { page: currentPage.value, pageSize }
    if (statusFilter.value) params.status = statusFilter.value
    const res = await service.get('/admin/api-errors', { params })
    if (res.data.code === 0) {
      errors.value = res.data.data.errors || []
      total.value = res.data.data.total || 0
      stats.value = res.data.data.stats || {}
    }
  } catch {
    ElMessage.error('加载API错误列表失败')
  } finally {
    loading.value = false
  }
}

function onSelectionChange(rows: any[]) {
  selectedIds.value = rows.map(r => r.id)
}

function onPageChange(p: number) {
  currentPage.value = p
  fetchErrors()
}

async function retryError(row: any) {
  try {
    const res = await service.post(`/admin/api-errors/${row.id}/retry`)
    if (res.data.code === 0) {
      ElMessage.success('重试成功')
      fetchErrors()
    } else {
      ElMessage.error(res.data.message || '重试失败')
    }
  } catch {
    ElMessage.error('重试失败')
  }
}

async function resolveError(row: any) {
  try {
    const res = await service.put(`/admin/api-errors/${row.id}`, { status: 'resolved', resolvedBy: 'admin' })
    if (res.data.code === 0) {
      ElMessage.success('已标记为解决')
      fetchErrors()
    } else {
      ElMessage.error(res.data.message || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

async function deleteError(row: any) {
  try {
    await ElMessageBox.confirm('确定要删除该错误记录吗？', '确认删除', { type: 'warning' })
    const res = await service.delete(`/admin/api-errors/${row.id}`)
    if (res.data.code === 0) {
      ElMessage.success('删除成功')
      fetchErrors()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

async function batchResolve() {
  if (!selectedIds.value.length) return
  try {
    const res = await service.post('/admin/api-errors/batch-resolve', { ids: selectedIds.value })
    if (res.data.code === 0) {
      ElMessage.success('批量解决成功')
      fetchErrors()
    } else {
      ElMessage.error(res.data.message || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

onMounted(fetchErrors)
</script>
<style scoped>
.cyber-page { padding: 1.5rem; min-height: 100vh; background: #0a0a0f; color: #e0e0ff; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.5rem; font-weight: bold; color: #00f0ff; margin: 0 0 0.25rem 0; }
.subtitle { color: #8888aa; font-size: 0.875rem; margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
.stat-icon { font-size: 2rem; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #00f0ff; font-family: 'JetBrains Mono', monospace; }
.stat-label { font-size: 0.75rem; color: #8888aa; }
.cyber-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.card-header h2 { font-size: 1rem; font-weight: bold; color: #e0e0ff; margin: 0; }
.cyber-table { --el-table-bg-color: transparent; --el-table-tr-bg-color: transparent; --el-table-header-bg-color: rgba(0,240,255,0.05); --el-table-row-hover-bg-color: rgba(0,240,255,0.08); --el-table-border-color: rgba(0,240,255,0.1); --el-table-text-color: #e0e0ff; --el-table-header-text-color: #00f0ff; }
</style>
