<template>
  <div class="cyber-page">
    <div class="page-header">
      <h1>📍 实时定位</h1>
      <p class="subtitle">用户地理位置实时追踪与分析</p>
      <div class="live-strip">
        <el-tag type="success" effect="dark"><span class="pulse-dot"></span> 每秒刷新</el-tag>
        <span>服务器时间：<b>{{ serverTime }}</b></span>
        <span>刷新间隔：{{ refreshIntervalMs / 1000 }} 秒</span>
      </div>
    </div>

    <!-- 定位统计 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🌍</div>
        <div class="stat-info">
          <div class="stat-value">{{ locationStats.countries }}</div>
          <div class="stat-label">覆盖国家</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏙️</div>
        <div class="stat-info">
          <div class="stat-value">{{ locationStats.cities }}</div>
          <div class="stat-label">覆盖城市</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📍</div>
        <div class="stat-info">
          <div class="stat-value">{{ locationStats.activeUsers }}</div>
          <div class="stat-label">活跃定位用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <div class="stat-value">{{ locationStats.accuracy }}</div>
          <div class="stat-label">定位精度</div>
        </div>
      </div>
    </div>

    <!-- 地图区域 -->
    <div class="cyber-card">
      <div class="card-header">
        <h2>🗺️ 用户分布地图</h2>
        <div class="header-actions">
          <el-button size="small" type="primary" @click="refreshMap">刷新</el-button>
          <el-button size="small" @click="toggleHeatmap">热力图</el-button>
        </div>
      </div>
      <div class="map-container">
        <div class="map-placeholder">
          <div class="map-grid">
            <div v-for="dot in mapDots" :key="dot.id" class="map-dot"
              :style="{ left: dot.x + '%', top: dot.y + '%' }">
              <div class="dot-pulse"></div>
            </div>
          </div>
          <div class="map-overlay">
            <span>🗺️ 中国地图 - 实时用户分布</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 地区排行 -->
    <div class="two-col">
      <div class="cyber-card">
        <div class="card-header">
          <h2>🏆 省份排行 TOP 10</h2>
        </div>
        <div class="rank-list">
          <div v-for="(item, i) in provinceRank" :key="i" class="rank-item">
            <span class="rank-num" :class="{ top3: i < 3 }">{{ i + 1 }}</span>
            <span class="rank-name">{{ item.name }}</span>
            <div class="rank-bar-bg">
              <div class="rank-bar" :style="{ width: item.percent + '%' }"></div>
            </div>
            <span class="rank-value">{{ item.count }}</span>
          </div>
        </div>
      </div>

      <div class="cyber-card">
        <div class="card-header">
          <h2>🌐 城市排行 TOP 10</h2>
        </div>
        <div class="rank-list">
          <div v-for="(item, i) in cityRank" :key="i" class="rank-item">
            <span class="rank-num" :class="{ top3: i < 3 }">{{ i + 1 }}</span>
            <span class="rank-name">{{ item.name }}</span>
            <div class="rank-bar-bg">
              <div class="rank-bar" :style="{ width: item.percent + '%' }"></div>
            </div>
            <span class="rank-value">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时定位日志 -->
    <div class="cyber-card">
      <div class="card-header">
        <h2>📡 实时定位日志</h2>
        <el-tag type="success" effect="dark">
          <span class="pulse-dot"></span> 实时更新
        </el-tag>
      </div>
      <el-table :data="locationLogs" style="width: 100%" class="cyber-table">
        <el-table-column prop="time" label="最后心跳" width="170" />
        <el-table-column prop="elapsedSeconds" label="距今" width="90">
          <template #default="{ row }">{{ row.elapsedSeconds }}秒</template>
        </el-table-column>
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="province" label="省份" width="100" />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="isp" label="运营商" width="120" />
        <el-table-column prop="currentPage" label="当前页面" min-width="180" />
        <el-table-column prop="accuracy" label="精度" width="150" />
        <el-table-column prop="device" label="设备" width="120" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import service from '@/api/request'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const locationStats = ref({ countries: 0, cities: 0, activeUsers: 0, accuracy: '0%' })
const serverTime = ref('-')
const refreshIntervalMs = ref(1000)
const mapDots = ref<any[]>([])
const provinceRank = ref<any[]>([])
const cityRank = ref<any[]>([])
const locationLogs = ref<any[]>([])
let refreshTimer: any = null

async function fetchLocations() {
  loading.value = true
  try {
    const res = await service.get('/admin/locations')
    if (res.data.code === 0) {
      const data = res.data.data
      serverTime.value = data.serverTime || formatNow()
      refreshIntervalMs.value = data.refreshIntervalMs || 1000
      // Stats
      if (data.stats) {
        locationStats.value = {
          countries: data.stats.countries || 0,
          cities: data.stats.cities || 0,
          activeUsers: data.stats.activeUsers || 0,
          accuracy: data.stats.accuracy ? String(data.stats.accuracy) : '0%'
        }
      }
      // Province ranking
      if (data.provinces && Array.isArray(data.provinces)) {
        const maxProv = Math.max(...data.provinces.map((p: any) => p.count || 0), 1)
        provinceRank.value = data.provinces.slice(0, 10).map((p: any) => ({
          name: p.name || p.province,
          count: p.count || 0,
          percent: Math.round((p.count || 0) / maxProv * 100)
        }))
      }
      // City ranking
      if (data.cities && Array.isArray(data.cities)) {
        const maxCity = Math.max(...data.cities.map((c: any) => c.count || 0), 1)
        cityRank.value = data.cities.slice(0, 10).map((c: any) => ({
          name: c.name || c.city,
          count: c.count || 0,
          percent: Math.round((c.count || 0) / maxCity * 100)
        }))
      }
      // Location logs
      if (data.logs && Array.isArray(data.logs)) {
        locationLogs.value = data.logs.map(normalizeLog)
      } else if (data.list && Array.isArray(data.list)) {
        locationLogs.value = data.list.map(normalizeLog)
      }
      // Map dots - 从后端真实省份坐标生成
      if (data.mapDots && Array.isArray(data.mapDots)) {
        mapDots.value = data.mapDots
      } else {
        mapDots.value = []
      }
    }
  } catch (e) {
    ElMessage.error('加载定位数据失败')
  } finally {
    loading.value = false
  }
}

function normalizeLog(item: any) {
  return {
    ...item,
    time: item.time || item.lastHeartbeatFormatted || item.visitTimeFormatted || formatNow(),
    elapsedSeconds: Number(item.elapsedSeconds || 0),
    userId: item.userId || '访客',
    province: item.province || 'IP定位',
    city: item.city || '待解析',
    isp: item.isp || '公网网络',
    currentPage: item.currentPage || item.path || '/',
    accuracy: item.accuracy || '秒级心跳 / IP定位',
    device: item.device || '未知设备'
  }
}

function formatNow() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
}

function refreshMap() {
  fetchLocations()
}

function toggleHeatmap() {
  ElMessage.info('热力图功能开发中')
}

onMounted(() => {
  fetchLocations()
  refreshTimer = setInterval(fetchLocations, 1000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.cyber-page {
  padding: 1.5rem;
  min-height: 100vh;
  background: #0a0a0f;
  color: #e0e0ff;
}

.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.5rem; font-weight: bold; color: #00f0ff; margin: 0 0 0.25rem 0; }
.subtitle { color: #8888aa; font-size: 0.875rem; margin: 0; }
.live-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.75rem;
  color: #8888aa;
  font-size: 0.875rem;
}
.live-strip b {
  color: #00f0ff;
  font-family: 'JetBrains Mono', monospace;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: rgba(15, 15, 25, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon { font-size: 2rem; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #00f0ff; font-family: 'JetBrains Mono', monospace; }
.stat-label { font-size: 0.75rem; color: #8888aa; }

.cyber-card {
  background: rgba(15, 15, 25, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h2 { font-size: 1rem; font-weight: bold; color: #e0e0ff; margin: 0; }

.map-container {
  border-radius: 0.5rem;
  overflow: hidden;
}

.map-placeholder {
  position: relative;
  height: 400px;
  background: radial-gradient(ellipse at center, rgba(0, 240, 255, 0.05) 0%, rgba(10, 10, 15, 1) 70%);
  border: 1px solid rgba(0, 240, 255, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
}

.map-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
}

.map-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  transform: translate(-50%, -50%);
}

.map-dot::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #00f0ff;
  border-radius: 50%;
  box-shadow: 0 0 8px #00f0ff;
}

.dot-pulse {
  position: absolute;
  inset: -8px;
  border: 1px solid rgba(0, 240, 255, 0.4);
  border-radius: 50%;
  animation: dotPulse 2s infinite;
}

@keyframes dotPulse {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

.map-overlay {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  color: #8888aa;
  font-size: 0.875rem;
}

.two-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rank-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  background: rgba(0, 240, 255, 0.1);
  color: #8888aa;
}

.rank-num.top3 {
  background: rgba(0, 240, 255, 0.2);
  color: #00f0ff;
}

.rank-name {
  width: 80px;
  font-size: 0.875rem;
  color: #e0e0ff;
}

.rank-bar-bg {
  flex: 1;
  height: 6px;
  background: rgba(0, 240, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.rank-bar {
  height: 100%;
  background: linear-gradient(90deg, #00f0ff, #7c3aed);
  border-radius: 3px;
  transition: width 0.3s;
}

.rank-value {
  width: 50px;
  text-align: right;
  font-size: 0.75rem;
  color: #00f0ff;
  font-family: 'JetBrains Mono', monospace;
}

.pulse-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #00ff88;
  border-radius: 50%;
  margin-right: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.cyber-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 240, 255, 0.05);
  --el-table-row-hover-bg-color: rgba(0, 240, 255, 0.08);
  --el-table-border-color: rgba(0, 240, 255, 0.1);
  --el-table-text-color: #e0e0ff;
  --el-table-header-text-color: #00f0ff;
}
</style>
