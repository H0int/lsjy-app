<template>
  <div class="cyber-page">
    <div class="page-header">
      <h1>📚 知识库管理</h1>
      <p class="subtitle">AI智能体知识库文档管理</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">📄</div><div class="stat-info"><div class="stat-value">{{ stats.totalDocs }}</div><div class="stat-label">文档总数</div></div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-info"><div class="stat-value">{{ stats.totalChunks }}</div><div class="stat-label">知识片段</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">{{ stats.indexed }}</div><div class="stat-label">已索引</div></div></div>
      <div class="stat-card"><div class="stat-icon">💾</div><div class="stat-info"><div class="stat-value">{{ stats.storage }}</div><div class="stat-label">存储空间</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>知识库文档</h2><el-button type="primary" size="small">+ 上传文档</el-button></div>
      <el-table :data="documents" style="width: 100%" class="cyber-table">
        <el-table-column prop="name" label="文档名称" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="chunks" label="片段数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已索引' ? 'success' : 'warning'" size="small" effect="dark">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default><el-button size="small" type="primary" link>预览</el-button><el-button size="small" type="danger" link>删除</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const stats = ref({ totalDocs: 45, totalChunks: 2847, indexed: '98%', storage: '128MB' })
const documents = ref([
  { name: '公司介绍文档.pdf', category: '公司', chunks: 156, status: '已索引', updatedAt: '2026-06-10 10:00' },
  { name: '产品使用手册.docx', category: '产品', chunks: 342, status: '已索引', updatedAt: '2026-06-08 14:30' },
  { name: 'FAQ常见问题.txt', category: 'FAQ', chunks: 89, status: '已索引', updatedAt: '2026-06-12 09:00' },
  { name: '技术文档v2.md', category: '技术', chunks: 234, status: '索引中', updatedAt: '2026-06-15 11:00' },
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
