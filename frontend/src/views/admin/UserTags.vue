<template>
  <div class="cyber-page">
    <div class="page-header">
      <h1>🏷️ 用户标签</h1>
      <p class="subtitle">用户标签管理与分组</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🏷️</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalTags }}</div>
          <div class="stat-label">标签总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.taggedUsers }}</div>
          <div class="stat-label">已标记用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.avgTagsPerUser }}</div>
          <div class="stat-label">人均标签</div>
        </div>
      </div>
    </div>

    <div class="cyber-card">
      <div class="card-header">
        <h2>标签列表</h2>
        <el-button type="primary" size="small" @click="createTag">+ 新建标签</el-button>
      </div>
      <el-table :data="tags" style="width: 100%" class="cyber-table">
        <el-table-column prop="name" label="标签名称" width="150">
          <template #default="{ row }">
            <el-tag :color="row.color" effect="dark" size="small">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="userCount" label="用户数" width="100" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link>编辑</el-button>
            <el-button size="small" type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const stats = ref({ totalTags: 24, taggedUsers: 1847, avgTagsPerUser: '2.3' })

const tags = ref([
  { name: 'VIP用户', color: '#FFD700', category: '等级', userCount: 156, description: 'VIP等级用户', createdAt: '2026-01-15 10:00' },
  { name: '高活跃', color: '#00FF88', category: '行为', userCount: 342, description: '日活跃用户', createdAt: '2026-02-20 14:30' },
  { name: '新用户', color: '#00F0FF', category: '状态', userCount: 89, description: '注册7天内', createdAt: '2026-03-01 09:00' },
  { name: '付费用户', color: '#FF6B6B', category: '消费', userCount: 234, description: '有充值记录', createdAt: '2026-01-20 16:00' },
  { name: 'AI爱好者', color: '#7C3AED', category: '兴趣', userCount: 567, description: '频繁使用AI功能', createdAt: '2026-02-10 11:00' },
  { name: '沉默用户', color: '#888888', category: '状态', userCount: 423, description: '7天未登录', createdAt: '2026-03-05 08:00' },
])

function createTag() { console.log('新建标签') }
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
