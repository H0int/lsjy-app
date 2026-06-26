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
            <el-button size="small" type="primary" link @click="editTag(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="deleteTag(row)">删除</el-button>
          </template>
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

const stats = ref({ totalTags: 0, taggedUsers: 0, avgTagsPerUser: '0' })

const tags = ref<any[]>([])

async function fetchTags() {
  loading.value = true
  try {
    const res = await service.get('/admin/user-tags')
    if (res.data.code === 0) {
      const data = res.data.data
      tags.value = data.tags || []
      const s = data.stats || {}
      const totalTags = s.totalTags ?? tags.value.length
      const taggedUsers = s.taggedUsers ?? 0
      const avg = totalTags > 0 && taggedUsers > 0
        ? (taggedUsers / totalTags).toFixed(1)
        : '0'
      stats.value = { totalTags, taggedUsers, avgTagsPerUser: avg }
    }
  } catch (e) {
    ElMessage.error('加载标签失败')
  } finally {
    loading.value = false
  }
}

function createTag() {
  ElMessageBox.prompt('请输入标签名称', '新建标签', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(async ({ value }) => {
    try {
      const res = await service.post('/admin/user-tags', { name: value, color: '#00F0FF', description: '' })
      if (res.data.code === 0) {
        ElMessage.success('标签创建成功')
        fetchTags()
      }
    } catch (e) {
      ElMessage.error('创建标签失败')
    }
  }).catch(() => {})
}

function editTag(row: any) {
  ElMessageBox.prompt('请输入标签名称', '编辑标签', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: row.name,
  }).then(async ({ value }) => {
    try {
      const res = await service.put(`/admin/user-tags/${row.id}`, { name: value, color: row.color, description: row.description })
      if (res.data.code === 0) {
        ElMessage.success('标签更新成功')
        fetchTags()
      }
    } catch (e) {
      ElMessage.error('更新标签失败')
    }
  }).catch(() => {})
}

async function deleteTag(row: any) {
  try {
    await ElMessageBox.confirm(`确定要删除标签「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await service.delete(`/admin/user-tags/${row.id}`)
    if (res.data.code === 0) {
      ElMessage.success('标签已删除')
      fetchTags()
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除标签失败')
  }
}

onMounted(fetchTags)
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
