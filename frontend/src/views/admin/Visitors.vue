<template>
  <div class="cyber-page">
    <div class="page-header">
      <h1>👁️ 访客中心</h1>
      <p class="subtitle">实时监控网站访客动态</p>
    </div>

    <!-- 实时统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.todayVisitors }}</div>
          <div class="stat-label">今日访客</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🟢</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.onlineNow }}</div>
          <div class="stat-label">当前在线</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📄</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.pageViews }}</div>
          <div class="stat-label">页面浏览</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.avgDuration }}</div>
          <div class="stat-label">平均停留</div>
        </div>
      </div>
    </div>

    <!-- 实时访客列表 -->
    <div class="cyber-card">
      <div class="card-header">
        <h2>🔴 实时访客</h2>
        <div class="header-actions">
          <el-tag type="success" effect="dark">
            <span class="pulse-dot"></span> 实时更新中
          </el-tag>
        </div>
      </div>
      <el-table :data="liveVisitors" style="width: 100%" class="cyber-table">
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="location" label="地理位置" width="180" />
        <el-table-column prop="currentPage" label="当前页面" />
        <el-table-column prop="device" label="设备" width="120" />
        <el-table-column prop="browser" label="浏览器" width="120" />
        <el-table-column prop="duration" label="停留时间" width="100" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="viewDetail(row)">详情</el-button>
            <el-button size="small" type="danger" link @click="blockIP(row)">拦截</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 今日访问趋势 -->
    <div class="cyber-card">
      <div class="card-header">
        <h2>📈 今日访问趋势</h2>
      </div>
      <div class="chart-placeholder">
        <div class="trend-bars">
          <div v-for="(bar, i) in trendData" :key="i" class="trend-bar-wrapper">
            <div class="trend-bar" :style="{ height: bar.height + '%' }">
              <span class="bar-label">{{ bar.hour }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门页面 -->
    <div class="cyber-card">
      <div class="card-header">
        <h2>🔥 热门页面 TOP 10</h2>
      </div>
      <el-table :data="hotPages" style="width: 100%" class="cyber-table">
        <el-table-column type="index" label="排名" width="60" />
        <el-table-column prop="page" label="页面" />
        <el-table-column prop="views" label="浏览量" width="120" />
        <el-table-column prop="uniqueVisitors" label="独立访客" width="120" />
        <el-table-column prop="avgTime" label="平均停留" width="120" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const stats = ref({
  todayVisitors: 1247,
  onlineNow: 38,
  pageViews: 5832,
  avgDuration: '3m 24s'
})

const liveVisitors = ref([
  { ip: '120.245.**.**', location: '北京市', currentPage: '/dashboard', device: 'PC', browser: 'Chrome', duration: '2m 15s' },
  { ip: '112.96.**.**', location: '广东省广州市', currentPage: '/agent', device: 'iPhone', browser: 'Safari', duration: '5m 32s' },
  { ip: '183.6.**.**', location: '上海市', currentPage: '/tools', device: 'PC', browser: 'Edge', duration: '1m 08s' },
  { ip: '222.73.**.**', location: '浙江省杭州市', currentPage: '/profile', device: 'Android', browser: 'Chrome', duration: '8m 44s' },
  { ip: '61.135.**.**', location: '四川省成都市', currentPage: '/dashboard', device: 'iPad', browser: 'Safari', duration: '3m 21s' },
  { ip: '36.110.**.**', location: '湖北省武汉市', currentPage: '/agent', device: 'PC', browser: 'Firefox', duration: '0m 45s' },
])

const trendData = ref(
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    height: Math.max(5, Math.floor(Math.random() * 80 + (i > 8 && i < 22 ? 30 : 0)))
  }))
)

const hotPages = ref([
  { page: '/agent - AI智能体', views: 1823, uniqueVisitors: 945, avgTime: '4m 12s' },
  { page: '/dashboard - 控制台', views: 1456, uniqueVisitors: 1102, avgTime: '2m 38s' },
  { page: '/tools - AI工具中心', views: 987, uniqueVisitors: 634, avgTime: '3m 05s' },
  { page: '/profile - 个人中心', views: 654, uniqueVisitors: 521, avgTime: '1m 42s' },
  { page: '/profile/wallet - 圣力中心', views: 432, uniqueVisitors: 387, avgTime: '2m 15s' },
])

let timer: any = null

function viewDetail(row: any) {
  console.log('查看详情', row)
}

function blockIP(row: any) {
  console.log('拦截IP', row.ip)
}

onMounted(() => {
  timer = setInterval(() => {
    stats.value.onlineNow = Math.floor(Math.random() * 20 + 30)
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.cyber-page {
  padding: 1.5rem;
  min-height: 100vh;
  background: #0a0a0f;
  color: #e0e0ff;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00f0ff;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: #8888aa;
  font-size: 0.875rem;
  margin: 0;
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

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00f0ff;
  font-family: 'JetBrains Mono', monospace;
}

.stat-label {
  font-size: 0.75rem;
  color: #8888aa;
}

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

.card-header h2 {
  font-size: 1rem;
  font-weight: bold;
  color: #e0e0ff;
  margin: 0;
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

.trend-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 200px;
  padding: 1rem 0;
}

.trend-bar-wrapper {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.trend-bar {
  width: 100%;
  background: linear-gradient(180deg, #00f0ff 0%, rgba(0, 240, 255, 0.2) 100%);
  border-radius: 2px 2px 0 0;
  position: relative;
  min-height: 4px;
  transition: height 0.3s;
}

.bar-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: #8888aa;
  white-space: nowrap;
}

.chart-placeholder {
  padding-bottom: 1.5rem;
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
