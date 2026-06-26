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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import service from '@/api/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const filter = ref('all')
const loading = ref(false)

const stats = ref({
  onlineTotal: 0,
  loggedIn: 0,
  guests: 0,
  peakToday: 0
})

const allUsers = ref<any[]>([])

const onlineUsers = computed(() => {
  if (filter.value === 'logged') return allUsers.value.filter((u: any) => u.userId !== '-')
  if (filter.value === 'guest') return allUsers.value.filter((u: any) => u.userId === '-')
  return allUsers.value
})

async function fetchData() {
  loading.value = true
  try {
    const res = await service.get('/admin/online-users')
    if (res.data.code === 0) {
      const data = res.data.data
      allUsers.value = data.users || []
      stats.value = {
        onlineTotal: data.stats?.active ?? 0,
        loggedIn: data.stats?.loggedIn ?? 0,
        guests: data.stats?.guests ?? 0,
        peakToday: data.stats?.peakToday ?? 0
      }
    }
  } catch (e) {
    ElMessage.error('加载在线用户失败')
  } finally {
    loading.value = false
  }
}

function viewUser(row: any) {
  router.push({ path: '/admin/users', query: { search: row.id || row.nickname } })
}

onMounted(fetchData)
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
