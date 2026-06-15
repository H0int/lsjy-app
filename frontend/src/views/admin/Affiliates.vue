<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🤝 合作伙伴</h1><p class="subtitle">合作伙伴管理与商务对接</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">🤝</div><div class="stat-info"><div class="stat-value">{{ stats.totalPartners }}</div><div class="stat-label">合作伙伴</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">{{ stats.active }}</div><div class="stat-label">活跃合作</div></div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">¥{{ stats.totalRevenue }}</div><div class="stat-label">合作收入</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>合作伙伴列表</h2><el-button type="primary" size="small">+ 添加伙伴</el-button></div>
      <el-table :data="partners" style="width: 100%" class="cyber-table">
        <el-table-column prop="name" label="公司名称" width="180" />
        <el-table-column prop="contact" label="联系人" width="120" />
        <el-table-column prop="phone" label="电话" width="140" />
        <el-table-column prop="type" label="合作类型" width="120" />
        <el-table-column prop="revenue" label="合作收入" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === '合作中' ? 'success' : 'info'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default><el-button size="small" type="primary" link>详情</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const stats = ref({ totalPartners: 12, active: 8, totalRevenue: '89,000' })
const partners = ref([
  { name: '深圳科技有限公司', contact: '张经理', phone: '138****1234', type: '技术合作', revenue: '¥35,000', status: '合作中' },
  { name: '北京AI研究院', contact: '李教授', phone: '139****5678', type: '数据合作', revenue: '¥28,000', status: '合作中' },
  { name: '上海云计算公司', contact: '王总', phone: '137****9012', type: '资源合作', revenue: '¥26,000', status: '洽谈中' },
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
