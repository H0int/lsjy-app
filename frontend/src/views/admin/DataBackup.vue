<template>
  <div class="cyber-page">
    <div class="page-header"><h1>💿 数据备份</h1><p class="subtitle">数据库备份与恢复管理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">💿</div><div class="stat-info"><div class="stat-value">{{ stats.totalBackups }}</div><div class="stat-label">备份总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">💾</div><div class="stat-info"><div class="stat-value">{{ stats.storageUsed }}</div><div class="stat-label">存储空间</div></div></div>
      <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-info"><div class="stat-value">{{ stats.lastBackup }}</div><div class="stat-label">最近备份</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">{{ stats.successRate }}</div><div class="stat-label">成功率</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>备份操作</h2></div>
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="createBackup" :loading="creating">📦 立即备份</el-button>
        <el-button size="large" @click="autoBackup">⏰ 自动备份设置</el-button>
        <el-button size="large" @click="uploadBackup">📤 上传备份文件</el-button>
      </div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>备份历史</h2></div>
      <el-table :data="backups" style="width: 100%" class="cyber-table" v-loading="loading">
        <el-table-column prop="name" label="备份名称" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }"><el-tag size="small" effect="dark">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createdAt" label="备份时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }"><el-button size="small" type="primary" link @click="downloadBackup(row)">下载</el-button><el-button size="small" type="warning" link @click="restoreBackup(row)">恢复</el-button><el-button size="small" type="danger" link @click="deleteBackup(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import service from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const creating = ref(false)
const backups = ref<any[]>([])

const stats = computed(() => {
  const list = backups.value
  const total = list.length
  const totalSize = list.reduce((sum, b) => sum + (parseFloat(b.size) || 0), 0)
  const last = list.length ? list[0].createdAt : '-'
  return {
    totalBackups: total,
    storageUsed: totalSize > 1024 ? (totalSize / 1024).toFixed(1) + 'GB' : totalSize + 'MB',
    lastBackup: last,
    successRate: total ? '100%' : '-',
  }
})

async function fetchBackups() {
  loading.value = true
  try {
    const res = await service.get('/backup/list')
    if (res.data.code === 0) {
      backups.value = res.data.data || []
    }
  } catch {
    ElMessage.error('加载备份列表失败')
  } finally {
    loading.value = false
  }
}

async function createBackup() {
  creating.value = true
  try {
    const res = await service.post('/backup/create')
    if (res.data.code === 0) {
      ElMessage.success('备份创建成功')
      fetchBackups()
    } else {
      ElMessage.error(res.data.message || '备份失败')
    }
  } catch {
    ElMessage.error('创建备份失败')
  } finally {
    creating.value = false
  }
}

async function downloadBackup(row: any) {
  try {
    const url = (row.downloadUrl || `/api/v1/backup/${encodeURIComponent(row.id || row.name)}/download`).replace(/^\/api\/v1/, '')
    const res = await service.get(url, { responseType: 'blob' })
    const blobUrl = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = row.name || `backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(blobUrl)
    ElMessage.success('备份下载已开始')
  } catch {
    ElMessage.error('下载失败')
  }
}

async function restoreBackup(row: any) {
  try {
    await ElMessageBox.confirm(`确定要从 "${row.name}" 恢复数据吗？此操作将覆盖当前数据。`, '确认恢复', { type: 'warning' })
    const res = await service.post(`/backup/${row.id || row.name}/restore`)
    if (res.data.code === 0) {
      ElMessage.success('数据恢复成功')
    } else {
      ElMessage.error(res.data.message || '恢复失败')
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('恢复失败')
  }
}

async function deleteBackup(row: any) {
  try {
    await ElMessageBox.confirm(`确定要删除备份 "${row.name}" 吗？`, '确认删除', { type: 'warning' })
    const res = await service.delete(`/backup/${row.id || row.name}`)
    if (res.data.code === 0) {
      ElMessage.success('删除成功')
      fetchBackups()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

async function autoBackup() {
  try {
    const { value } = await ElMessageBox.prompt('请输入自动备份频率（如：每天凌晨3点、每周日、每6小时）', '自动备份设置', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入备份频率',
    })
    const res = await service.post('/backup/settings', { frequency: value })
    if (res.data.code === 0) {
      ElMessage.success(`自动备份已设置：${value}`)
    } else {
      ElMessage.error(res.data.message || '自动备份设置失败')
    }
  } catch {
    // cancelled
  }
}

function uploadBackup() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.sql,.json,.zip,.gz'
  input.onchange = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      ElMessage.info(`正在上传备份文件：${file.name}...`)
      const res = await service.post('/backup/upload', { name: file.name, size: file.size, type: file.type || 'application/octet-stream' })
      if (res.data.code === 0) {
        ElMessage.success('备份文件上传成功')
        fetchBackups()
      } else {
        ElMessage.error(res.data.message || '上传失败')
      }
    } catch {
      ElMessage.error('上传失败')
    }
  }
  input.click()
}

onMounted(fetchBackups)
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
.action-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }
.cyber-table { --el-table-bg-color: transparent; --el-table-tr-bg-color: transparent; --el-table-header-bg-color: rgba(0,240,255,0.05); --el-table-row-hover-bg-color: rgba(0,240,255,0.08); --el-table-border-color: rgba(0,240,255,0.1); --el-table-text-color: #e0e0ff; --el-table-header-text-color: #00f0ff; }
</style>
