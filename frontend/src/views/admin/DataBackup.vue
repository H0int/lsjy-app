<template>
  <div class="cyber-page">
    <div class="page-header"><h1>💿 数据备份</h1><p class="subtitle">数据库备份与恢复管理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">💿</div><div class="stat-info"><div class="stat-value">{{ stats.totalBackups }}</div><div class="stat-label">备份总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">💾</div><div class="stat-info"><div class="stat-value">{{ stats.storageUsed }}</div><div class="stat-label">存储空间</div></div></div>
      <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-info"><div class="stat-value">{{ stats.lastBackup }}</div><div class="stat-label">最近备份</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">{{ stats.successRate }}</div><div class="stat-label">成功率</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>备份操作</h2></div>
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="createBackup">📦 立即备份</el-button>
        <el-button size="large" @click="autoBackup">⏰ 自动备份设置</el-button>
        <el-button size="large" @click="uploadBackup">📤 上传备份文件</el-button>
      </div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>备份历史</h2></div>
      <el-table :data="backups" style="width: 100%" class="cyber-table">
        <el-table-column prop="name" label="备份名称" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }"><el-tag size="small" effect="dark">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createdAt" label="备份时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default><el-button size="small" type="primary" link>下载</el-button><el-button size="small" type="warning" link>恢复</el-button><el-button size="small" type="danger" link>删除</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const stats = ref({ totalBackups: 45, storageUsed: '2.3GB', lastBackup: '2小时前', successRate: '100%' })
const backups = ref([
  { name: 'backup_20260615_140000.sql', type: '自动', size: '128MB', status: '成功', createdAt: '2026-06-15 14:00' },
  { name: 'backup_20260615_020000.sql', type: '自动', size: '126MB', status: '成功', createdAt: '2026-06-15 02:00' },
  { name: 'backup_20260614_manual.sql', type: '手动', size: '125MB', status: '成功', createdAt: '2026-06-14 16:30' },
  { name: 'backup_20260614_140000.sql', type: '自动', size: '124MB', status: '成功', createdAt: '2026-06-14 14:00' },
])
function createBackup() { console.log('创建备份') }
function autoBackup() { console.log('自动备份设置') }
function uploadBackup() { console.log('上传备份') }
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
