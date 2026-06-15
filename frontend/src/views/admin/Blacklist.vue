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
          <template #default><el-button size="small" type="success" link>解封</el-button></template>
        </el-table-column>
      </el-table>
    </div>

    <div class="cyber-card">
      <div class="card-header"><h2>IP拦截列表</h2><el-button type="danger" size="small">+ 添加IP</el-button></div>
      <el-table :data="blockedIPs" style="width: 100%" class="cyber-table">
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="reason" label="拦截原因" />
        <el-table-column prop="blockCount" label="拦截次数" width="100" />
        <el-table-column prop="blockedAt" label="拦截时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default><el-button size="small" type="success" link>解除</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const stats = ref({ bannedUsers: 23, blockedIPs: 156, todayBlocks: 47 })
const bannedUsers = ref([
  { userId: 'U10099', username: '恶意用户A', reason: '发布违规内容', banType: '永久', bannedAt: '2026-05-20 10:00', expiresAt: '-' },
  { userId: 'U10123', username: 'spam_bot', reason: '恶意刷接口', banType: '永久', bannedAt: '2026-06-01 08:30', expiresAt: '-' },
  { userId: 'U10234', username: '违规用户B', reason: '多次违规', banType: '7天', bannedAt: '2026-06-10 14:00', expiresAt: '2026-06-17 14:00' },
])
const blockedIPs = ref([
  { ip: '45.33.**.**', reason: '恶意扫描', blockCount: 1234, blockedAt: '2026-06-01 00:00' },
  { ip: '185.220.**.**', reason: 'DDoS攻击', blockCount: 5678, blockedAt: '2026-05-15 12:00' },
])
function addBan() { console.log('添加封禁') }
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
