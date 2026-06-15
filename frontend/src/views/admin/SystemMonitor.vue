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
          <div v-for="service in services" :key="service.name" class="service-item">
            <span class="service-status" :class="service.status"></span>
            <span class="service-name">{{ service.name }}</span>
            <span class="service-info">{{ service.info }}</span>
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
const monitor = ref({ cpu: 45, memory: 62, disk: 38, network: '12.5 MB/s' })
const services = ref([
  { name: 'Node.js Backend', status: 'online', info: '运行正常 - PM2' },
  { name: 'Nginx', status: 'online', info: '运行正常 - Systemd' },
  { name: 'DeepSeek API', status: 'online', info: '连接正常' },
  { name: 'MySQL Database', status: 'online', info: '连接正常' },
])
const metrics = ref({ responseTime: '45ms', qps: '234', errorRate: '0.1%', uptime: '7d 12h' })
const logs = ref([
  { id: 1, time: '14:32:18', level: 'info', message: '用户 U10086 登录成功' },
  { id: 2, time: '14:32:15', level: 'info', message: 'AI请求处理完成 - DeepSeek' },
  { id: 3, time: '14:32:12', level: 'warn', message: 'API响应时间超过阈值: 520ms' },
  { id: 4, time: '14:32:08', level: 'info', message: '订单 ORD20260615001 创建成功' },
])
let timer: any = null
onMounted(() => {
  timer = setInterval(() => {
    monitor.value.cpu = Math.floor(Math.random() * 30 + 30)
    monitor.value.memory = Math.floor(Math.random() * 20 + 55)
  }, 3000)
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
