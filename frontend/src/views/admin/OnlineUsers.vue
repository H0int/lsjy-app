<template>
  <div class="cyber-page">
    <div class="page-header">
      <h1>🟢 在线用户</h1>
      <p class="subtitle">实时监控当前在线用户状态</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🟢</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.onlineTotal }}</div>
          <div class="stat-label">在线总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👤</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.loggedIn }}</div>
          <div class="stat-label">已登录</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👻</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.guests }}</div>
          <div class="stat-label">游客</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.peakToday }}</div>
          <div class="stat-label">今日峰值</div>
        </div>
      </div>
    </div>

    <div class="cyber-card">
      <div class="card-header">
        <h2>📡 在线用户列表</h2>
        <div class="header-actions">
          <el-select v-model="filter" size="small" style="width: 120px">
            <el-option label="全部" value="all" />
            <el-option label="已登录" value="logged" />
            <el-option label="游客" value="guest" />
          </el-select>
        </div>
      </div>
      <el-table :data="onlineUsers" style="width: 100%" class="cyber-table">
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '活跃' ? 'success' : 'info'" size="small" effect="dark">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentPage" label="当前页面" />
        <el-table-column prop="ip" label="IP地址" width="130" />
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column prop="device" label="设备" width="100" />
        <el-table-column prop="onlineTime" label="在线时长" width="100" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="viewUser(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const filter = ref('all')

const stats = ref({
  onlineTotal: 156,
  loggedIn: 89,
  guests: 67,
  peakToday: 342
})

const onlineUsers = ref([
  { userId: 'U10086', username: '张三', status: '活跃', currentPage: '/agent', ip: '120.245.**.**', location: '北京', device: 'PC', onlineTime: '32m' },
  { userId: 'U10042', username: '李四', status: '活跃', currentPage: '/tools', ip: '112.96.**.**', location: '广州', device: 'iPhone', onlineTime: '15m' },
  { userId: '-', username: '游客', status: '浏览', currentPage: '/dashboard', ip: '183.6.**.**', location: '上海', device: 'PC', onlineTime: '3m' },
  { userId: 'U10234', username: '王五', status: '活跃', currentPage: '/profile', ip: '222.73.**.**', location: '杭州', device: 'Android', onlineTime: '48m' },
  { userId: '-', username: '游客', status: '浏览', currentPage: '/login', ip: '61.135.**.**', location: '成都', device: 'iPad', onlineTime: '1m' },
  { userId: 'U10567', username: '赵六', status: '空闲', currentPage: '/dashboard', ip: '36.110.**.**', location: '武汉', device: 'PC', onlineTime: '1h 12m' },
])

function viewUser(row: any) {
  console.log('查看用户', row)
}
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
