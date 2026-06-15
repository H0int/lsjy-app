<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🚫 敏感词库</h1><p class="subtitle">内容过滤敏感词管理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-info"><div class="stat-value">{{ stats.totalWords }}</div><div class="stat-label">敏感词总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">🔍</div><div class="stat-info"><div class="stat-value">{{ stats.todayFiltered }}</div><div class="stat-label">今日过滤</div></div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-info"><div class="stat-value">{{ stats.categories }}</div><div class="stat-label">分类数</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>敏感词列表</h2><div class="header-actions"><el-button type="primary" size="small">+ 添加词汇</el-button><el-button size="small">批量导入</el-button></div></div>
      <el-table :data="words" style="width: 100%" class="cyber-table">
        <el-table-column prop="word" label="敏感词" width="200" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }"><el-tag size="small" effect="dark">{{ row.category }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }"><el-tag :type="row.level === '高' ? 'danger' : row.level === '中' ? 'warning' : 'info'" size="small" effect="dark">{{ row.level }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="filterCount" label="过滤次数" width="100" />
        <el-table-column prop="action" label="处理方式" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default><el-button size="small" type="primary" link>编辑</el-button><el-button size="small" type="danger" link>删除</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const stats = ref({ totalWords: 1234, todayFiltered: 56, categories: 8 })
const words = ref([
  { word: '***', category: '政治', level: '高', filterCount: 123, action: '替换' },
  { word: '***', category: '色情', level: '高', filterCount: 89, action: '屏蔽' },
  { word: '***', category: '暴力', level: '中', filterCount: 45, action: '替换' },
  { word: '***', category: '广告', level: '低', filterCount: 234, action: '替换' },
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
