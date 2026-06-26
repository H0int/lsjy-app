<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🖥️ 系统监控</h1><p class="subtitle">服务器状态与性能实时监控</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">🖥️</div><div class="stat-info"><div class="stat-value">{{ monitor.cpu }}%</div><div class="stat-label">CPU使用率</div></div></div>
      <div class="stat-card"><div class="stat-icon">💾</div><div class="stat-info"><div class="stat-value">{{ monitor.memory }}%</div><div class="stat-label">内存使用率</div></div></div>
      <div class="stat-card"><div class="stat-icon">💿</div><div class="stat-info"><div class="stat-value">{{ monitor.disk }}%</div><div class="stat-label">磁盘使用率</div></div></div>
      <div class="stat-card"><div class="stat-icon">🌐</div><div class="stat-info"><div class="stat-value">{{ monitor.network }}</div><div class="stat-label">网络流量</div></div></div>
    </div>
    <div class="two-col">
      <div class="cyber-card">
        <div class="card-header"><h2>📊 服务状态</h2></div>
        <div class="service-list">
          <div v-for="svc in services" :key="svc.name" class="service-item">
            <span class="service-status" :class="svc.status"></span>
            <span class="service-name">{{ svc.name }}</span>
            <span class="service-info">{{ svc.info }}</span>
            <el-button size="small" type="warning" link @click="restartService(svc.name)">重启</el-button>
          </div>
        </div>
      </div>
      <div class="cyber-card">
        <div class="card-header"><h2>📈 性能指标</h2></div>
        <div class="metrics-list">
          <div class="metric-item"><span class="metric-label">响应时间</span><span class="metric-value">{{ metrics.responseTime }}</span></div>
          <div class="metric-item"><span class="metric-label">QPS</span><span class="metric-value">{{ metrics.qps }}</span></div>
          <div class="metric-item"><span class="metric-label">错误率</span><span class="metric-value">{{ metrics.errorRate }}</span></div>
          <div class="metric-item"><span class="metric-label">运行时间</span><span class="metric-value">{{ metrics.uptime }}</span></div>
        </div>
      </div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>📋 系统日志</h2></div>
      <div class="log-container">
        <div v-for="log in logs" :key="log.id" class="log-line" :class="log.level">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-level">[{{ log.level.toUpperCase() }}]</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import service from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const monitor = ref({ cpu: 0, memory: 0, disk: 0, network: '-', uptime: '', hostname: '', loadAvg: '' })
const services = ref<any[]>([])
const metrics = ref({ responseTime: '-', qps: '-', errorRate: '-', uptime: '-', totalRequests: 0 })
const logs = ref<any[]>([])

let timer: any = null

async function fetchMonitor() {
  try {
    const res = await service.get('/system/monitor')
    if (res.data.code === 0) {
      const d = res.data.data
      monitor.value = {
        cpu: d.cpu ?? 0,
        memory: d.memory ?? 0,
        disk: d.disk ?? 0,
        network: d.network ?? '-',
        uptime: d.uptime ?? '',
        hostname: d.hostname ?? '',
        loadAvg: d.loadAvg ?? '',
      }
    }
  } catch {
    // silent refresh
  }
}

async function fetchServices() {
  try {
    const res = await service.get('/system/services')
    if (res.data.code === 0) {
      services.value = res.data.data
    }
  } catch {
    // silent
  }
}

async function fetchMetrics() {
  try {
    const res = await service.get('/system/metrics')
    if (res.data.code === 0) {
      const d = res.data.data
      metrics.value = {
        responseTime: d.responseTime ?? '-',
        qps: d.qps ?? '-',
        errorRate: d.errorRate ?? '-',
        uptime: d.uptime ?? '-',
        totalRequests: d.totalRequests ?? 0,
      }
    }
  } catch {
    // silent
  }
}

async function restartService(name: string) {
  try {
    await ElMessageBox.confirm(`确定要重启服务 "${name}" 吗？`, '确认重启', { type: 'warning' })
    const res = await service.post(`/system/services/${encodeURIComponent(name)}/restart`)
    if (res.data.code === 0) {
      ElMessage.success(`服务 ${name} 重启成功`)
      fetchServices()
    } else {
      ElMessage.error(res.data.message || '重启失败')
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('重启失败')
  }
}

async function fetchLogs() {
  try {
    const res = await service.get('/system/logs', { params: { page: 1, pageSize: 50 } })
    if (res.data.code === 0) {
      logs.value = (res.data.data?.list || res.data.data || []).map((l: any) => ({
        time: l.createdAt || l.time || new Date().toISOString(),
        level: l.level || 'INFO',
        module: l.module || 'system',
        message: l.message || '',
      }))
    }
  } catch {
    // silent
  }
}

async function fetchAll() {
  await Promise.all([fetchMonitor(), fetchServices(), fetchMetrics(), fetchLogs()])
}

onMounted(() => {
  fetchAll()
  timer = setInterval(fetchAll, 10000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })
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
.two-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
.service-list { display: flex; flex-direction: column; gap: 0.75rem; }
.service-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: rgba(0,240,255,0.03); border-radius: 0.5rem; }
.service-status { width: 8px; height: 8px; border-radius: 50%; }
.service-status.online { background: #00ff88; box-shadow: 0 0 8px #00ff88; }
.service-status.offline { background: #ff4444; box-shadow: 0 0 8px #ff4444; }
.service-name { font-weight: 500; color: #e0e0ff; }
.service-info { color: #8888aa; font-size: 0.875rem; margin-left: auto; }
.metrics-list { display: flex; flex-direction: column; gap: 0.75rem; }
.metric-item { display: flex; justify-content: space-between; padding: 0.5rem; background: rgba(0,240,255,0.03); border-radius: 0.5rem; }
.metric-label { color: #8888aa; }
.metric-value { color: #00f0ff; font-weight: bold; font-family: 'JetBrains Mono', monospace; }
.log-container { max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.3); border-radius: 0.5rem; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; }
.log-line { padding: 0.25rem 0; display: flex; gap: 0.75rem; }
.log-time { color: #8888aa; }
.log-level { font-weight: bold; }
.log-line.info .log-level { color: #00f0ff; }
.log-line.warn .log-level { color: #ffaa00; }
.log-line.error .log-level { color: #ff4444; }
.log-message { color: #e0e0ff; }
</style>
