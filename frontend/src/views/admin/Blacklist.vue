<template>
  <div class="cyber-page">
    <div class="page-header">
      <h1>🚫 黑名单管理</h1>
      <p class="subtitle">违规用户封禁与IP拦截管理</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">🚫</div><div class="stat-info"><div class="stat-value">{{ stats.bannedUsers }}</div><div class="stat-label">封禁用户</div></div></div>
      <div class="stat-card"><div class="stat-icon">🌐</div><div class="stat-info"><div class="stat-value">{{ stats.blockedIPs }}</div><div class="stat-label">拦截IP</div></div></div>
      <div class="stat-card"><div class="stat-icon">⚠️</div><div class="stat-info"><div class="stat-value">{{ stats.todayBlocks }}</div><div class="stat-label">今日拦截</div></div></div>
    </div>

    <div class="cyber-card">
      <div class="card-header">
        <h2>封禁用户列表</h2>
        <el-button type="danger" size="small" @click="addBan">+ 添加封禁</el-button>
      </div>
      <el-table :data="bannedUsers" style="width: 100%" class="cyber-table">
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="reason" label="封禁原因" />
        <el-table-column prop="banType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.banType === '永久' ? 'danger' : 'warning'" size="small" effect="dark">{{ row.banType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bannedAt" label="封禁时间" width="160" />
        <el-table-column prop="expiresAt" label="到期时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }"><el-button size="small" type="success" link @click="unbanUser(row)">解封</el-button></template>
        </el-table-column>
      </el-table>
    </div>

    <div class="cyber-card">
      <div class="card-header"><h2>IP拦截列表</h2><el-button type="danger" size="small" @click="addIPBlock">+ 添加IP</el-button></div>
      <el-table :data="blockedIPs" style="width: 100%" class="cyber-table">
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="reason" label="拦截原因" />
        <el-table-column prop="blockCount" label="拦截次数" width="100" />
        <el-table-column prop="blockedAt" label="拦截时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }"><el-button size="small" type="success" link @click="releaseIP(row)">解除</el-button></template>
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

const stats = ref({ bannedUsers: 0, blockedIPs: 0, todayBlocks: 0 })
const bannedUsers = ref<any[]>([])
const blockedIPs = ref<any[]>([])

async function fetchData() {
  loading.value = true
  try {
    const res = await service.get('/admin/blacklist')
    if (res.data.code === 0) {
      const data = res.data.data
      bannedUsers.value = data.bannedUsers || []
      blockedIPs.value = data.blockedIps || []
      const s = data.stats || {}
      stats.value = {
        bannedUsers: s.totalBanned ?? bannedUsers.value.length,
        blockedIPs: s.totalBlocked ?? blockedIPs.value.length,
        todayBlocks: s.todayBlocks ?? 0
      }
    }
  } catch (e) {
    ElMessage.error('加载黑名单数据失败')
  } finally {
    loading.value = false
  }
}

function addBan() {
  ElMessageBox.prompt('请输入要封禁的用户ID', '添加封禁', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(async ({ value }) => {
    try {
      const res = await service.post('/admin/blacklist/users', { userId: value, username: '', reason: '' })
      if (res.data.code === 0) {
        ElMessage.success('封禁成功')
        fetchData()
      }
    } catch (e) {
      ElMessage.error('封禁失败')
    }
  }).catch(() => {})
}

async function unbanUser(row: any) {
  try {
    await ElMessageBox.confirm(`确定要解封用户「${row.username}」吗？`, '解封确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await service.delete(`/admin/blacklist/users/${row.id}`)
    if (res.data.code === 0) {
      ElMessage.success('已解封')
      fetchData()
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('解封失败')
  }
}

function addIPBlock() {
  ElMessageBox.prompt('请输入要拦截的IP地址', '添加IP拦截', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(async ({ value }) => {
    try {
      const res = await service.post('/admin/blacklist/ips', { ip: value, reason: '' })
      if (res.data.code === 0) {
        ElMessage.success('IP拦截成功')
        fetchData()
      }
    } catch (e) {
      ElMessage.error('IP拦截失败')
    }
  }).catch(() => {})
}

async function releaseIP(row: any) {
  try {
    await ElMessageBox.confirm(`确定要解除IP「${row.ip}」的拦截吗？`, '解除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await service.delete(`/admin/blacklist/ips/${row.id}`)
    if (res.data.code === 0) {
      ElMessage.success('已解除拦截')
      fetchData()
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('解除拦截失败')
  }
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
