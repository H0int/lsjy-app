<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🔐 权限管理</h1><p class="subtitle">角色权限配置与管理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-info"><div class="stat-value">{{ stats.totalRoles }}</div><div class="stat-label">角色总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">🔑</div><div class="stat-info"><div class="stat-value">{{ stats.permissions }}</div><div class="stat-label">权限项</div></div></div>
      <div class="stat-card"><div class="stat-icon">👤</div><div class="stat-info"><div class="stat-value">{{ stats.assignedUsers }}</div><div class="stat-label">已分配用户</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>角色列表</h2><el-button type="primary" size="small">+ 新建角色</el-button></div>
      <el-table :data="roles" style="width: 100%" class="cyber-table">
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="userCount" label="用户数" width="100" />
        <el-table-column prop="permissionCount" label="权限数" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default><el-button size="small" type="primary" link>编辑</el-button><el-button size="small" type="danger" link>删除</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const stats = ref({ totalRoles: 5, permissions: 48, assignedUsers: 1847 })
const roles = ref([
  { name: '超级管理员', description: '拥有所有权限', userCount: 1, permissionCount: 48, status: '启用' },
  { name: '普通管理员', description: '基础管理权限', userCount: 3, permissionCount: 32, status: '启用' },
  { name: '运营人员', description: '运营管理权限', userCount: 5, permissionCount: 18, status: '启用' },
  { name: '客服人员', description: '客服工单权限', userCount: 8, permissionCount: 12, status: '启用' },
])
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
