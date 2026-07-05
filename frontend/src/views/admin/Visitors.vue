<template>
  <div class="cyber-page">
    <div class="page-header">
      <h1>👁️ 访客中心</h1>
      <p class="subtitle">实时监控网站访客动态</p>
      <div class="page-actions">
        <el-button type="primary" @click="router.push('/admin/realtime-location')">📍 实时定位</el-button>
        <el-button @click="refreshNow">🔄 立即刷新</el-button>
        <el-tag type="success" effect="dark">秒级时间：{{ liveClock }}</el-tag>
      </div>
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
import { useRouter } from 'vue-router'
import service from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const liveClock = ref('')
let clockTimer: any = null

const stats = ref({
  todayVisitors: 0,
  onlineNow: 0,
  pageViews: 0,
  avgDuration: '-'
})

const liveVisitors = ref<any[]>([])

const trendData = ref(
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    height: 0
  }))
)

const hotPages = ref<any[]>([])

async function fetchStats() {
  try {
    const res = await service.get('/admin/locations', { headers: { 'X-Silent-Error': 'true' } })
    if (res.data.code === 0) {
      const data = res.data.data
      stats.value = {
        todayVisitors: data.logs?.length ?? data.list?.length ?? 0,
        onlineNow: data.stats?.activeUsers ?? 0,
        pageViews: data.logs?.length ?? data.list?.length ?? 0,
        avgDuration: (() => {
          const logs = data.logs || data.list || [];
          if (!logs.length) return '0秒';
          const avg = logs.reduce((s: number, l: any) => s + (l.elapsedSeconds || 0), 0) / logs.length;
          return `${Math.round(avg)}秒`;
        })()
      }
      liveVisitors.value = (data.logs || data.list || []).map(normalizeVisitor)
      // 从真实访客数据按小时聚合趋势
      if (data.hourly && Array.isArray(data.hourly)) {
        const maxVal = Math.max(...data.hourly.map((h: any) => h.count || h.visitors || 0), 1)
        trendData.value = data.hourly.map((h: any, i: number) => ({
          hour: `${i}:00`,
          height: Math.round(((h.count || h.visitors || 0) / maxVal) * 100)
        }))
      } else {
        // 从真实访客记录按小时聚合
        const logs = data.logs || data.list || [];
        const hourCounts: Record<number, number> = {};
        logs.forEach((l: any) => {
          try {
            const h = new Date(l.time || l.visitTime || l.lastHeartbeatFormatted || Date.now()).getHours();
            hourCounts[h] = (hourCounts[h] || 0) + 1;
          } catch {}
        });
        const maxVal = Math.max(...Object.values(hourCounts), 1);
        trendData.value = Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          height: Math.round(((hourCounts[i] || 0) / maxVal) * 100)
        }))
      }
      // 热门页面 TOP10 从真实访客当前页面聚合
      const pageCounts: Record<string, number> = {};
      (data.logs || data.list || []).forEach((l: any) => {
        const p = l.currentPage || l.path || '/';
        pageCounts[p] = (pageCounts[p] || 0) + 1;
      });
      hotPages.value = Object.entries(pageCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([page, count]) => ({ page, count }));
    }
  } catch (e) {
    console.warn('加载访客统计失败:', (e as any)?.message)
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await service.get('/admin/locations', { headers: { 'X-Silent-Error': 'true' } })
    if (res.data.code === 0) {
      const data = res.data.data
      liveVisitors.value = (data.logs || data.list || []).map(normalizeVisitor)
    }
  } catch (e: any) {
    console.warn('加载访客列表失败:', e?.message)
  } finally {
    loading.value = false
  }
}

function normalizeVisitor(item: any) {
  return {
    ...item,
    ip: item.ip || '-',
    location: item.location || [item.province, item.city].filter(Boolean).join(' ') || 'IP定位中',
    currentPage: item.currentPage || item.path || '/',
    device: item.device || parseDevice(item.userAgent),
    browser: item.browser || '-',
    duration: item.elapsedSeconds !== undefined ? `${item.elapsedSeconds}秒` : (item.duration || '-')
  }
}

function refreshNow() {
  fetchStats()
  fetchList()
}

function tickClock() {
  const d = new Date()
  liveClock.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
}

function parseDevice(ua = '') {
  if (/MicroMessenger/i.test(ua)) return '微信'
  if (/Mobile|Android|iPhone|iPad/i.test(ua)) return '移动端'
  if (/Windows|Macintosh|Linux/i.test(ua)) return '桌面端'
  return '未知'
}

function viewDetail(row: any) {
  ElMessageBox.alert(
    `IP: ${row.ip}\n位置: ${row.location || '-'}\n页面: ${row.currentPage || '-'}\n设备: ${row.device || '-'}`,
    '访客详情',
    { confirmButtonText: '确定' }
  )
}

async function blockIP(row: any) {
  try {
    await ElMessageBox.confirm(`确定要拦截IP「${row.ip}」吗？`, '拦截确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await service.post('/admin/blacklist/ips', { ip: row.ip, reason: '访客管理拦截' })
    if (res.data.code === 0) {
      ElMessage.success('IP已拦截')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('拦截失败')
  }
}

onMounted(() => {
  tickClock()
  fetchStats()
  clockTimer = setInterval(() => {
    tickClock()
    fetchStats()
  }, 5000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
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

.page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  align-items: center;
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
