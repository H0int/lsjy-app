<template>
  <div class="cyber-page">
    <div class="page-header"><h1>💾 缓存管理</h1><p class="subtitle">系统缓存清理与管理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">💾</div><div class="stat-info"><div class="stat-value">{{ stats.cacheSize }}</div><div class="stat-label">缓存大小</div></div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-info"><div class="stat-value">{{ stats.hitRate }}</div><div class="stat-label">命中率</div></div></div>
      <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-info"><div class="stat-value">{{ stats.keys }}</div><div class="stat-label">缓存键数</div></div></div>
      <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-info"><div class="stat-value">{{ stats.avgTTL }}</div><div class="stat-label">平均TTL</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>缓存操作</h2></div>
      <div class="action-buttons">
        <el-button type="warning" size="large" @click="clearAll">🗑️ 清空全部缓存</el-button>
        <el-button type="primary" size="large" @click="refreshStats">🔄 刷新统计</el-button>
        <el-button size="large" @click="exportCache">📤 导出缓存数据</el-button>
      </div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>缓存分类</h2></div>
      <el-table :data="cacheItems" style="width: 100%" class="cyber-table" v-loading="loading">
        <el-table-column prop="name" label="缓存名称" />
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column prop="keys" label="键数" width="100" />
        <el-table-column prop="hitRate" label="命中率" width="100" />
        <el-table-column prop="ttl" label="TTL" width="100" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default><el-button size="small" type="warning" link>清空</el-button><el-button size="small" type="primary" link>刷新</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const stats = ref<any>({})
const cacheItems = ref<any[]>([])

async function fetchStats() {
  loading.value = true
  try {
    const res = await service.get('/cache/stats')
    if (res.data.code === 0) {
      const d = res.data.data
      stats.value = {
        cacheSize: d.memory ?? d.cacheSize ?? '-',
        hitRate: d.hitRate ?? '-',
        keys: d.keys ?? '-',
        avgTTL: d.avgTTL ?? '-',
      }
      cacheItems.value = d.items || d.categories || []
    }
  } catch {
    ElMessage.error('加载缓存统计失败')
  } finally {
    loading.value = false
  }
}

async function clearAll() {
  try {
    await ElMessageBox.confirm('确定要清空全部缓存吗？此操作不可恢复。', '确认清空', { type: 'warning' })
    const res = await service.post('/cache/clear')
    if (res.data.code === 0) {
      ElMessage.success(res.data.message || '缓存已清空')
      fetchStats()
    } else {
      ElMessage.error(res.data.message || '清空失败')
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('清空缓存失败')
  }
}

async function refreshStats() {
  ElMessage.info('正在刷新...')
  await fetchStats()
  ElMessage.success('统计已刷新')
}

function exportCache() {
  const data = JSON.stringify(cacheItems.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cache-stats-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('缓存数据导出成功')
}

onMounted(fetchStats)
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
