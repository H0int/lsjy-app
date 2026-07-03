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
      <div class="card-header">
        <h2>知识库文档</h2>
        <div class="flex gap-2">
          <el-input v-model="keyword" placeholder="搜索文档..." class="cyber-input w-48" clearable @clear="fetchKnowledge" @keyup.enter="fetchKnowledge" />
          <el-button type="primary" size="small" @click="uploadDialogVisible = true">+ 上传文档</el-button>
        </div>
      </div>
      <el-table :data="documents" style="width: 100%" class="cyber-table" v-loading="loading">
        <el-table-column prop="title" label="文档名称" />
        <el-table-column prop="type" label="分类" width="120" />
        <el-table-column label="标签" width="180">
          <template #default="{ row }">
            <span v-for="tag in (row.tags || [])" :key="tag" class="cyber-tag tag-cyan">{{ tag }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="previewDoc(row)">预览</el-button>
            <el-button size="small" type="danger" link @click="deleteDoc(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传知识文档" width="92vw" class="mobile-safe-dialog" destroy-on-close append-to-body>
      <el-form :model="uploadForm" label-width="80px" class="cyber-form">
        <el-form-item label="标题">
          <el-input v-model="uploadForm.title" placeholder="文档标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="uploadForm.type" placeholder="选择分类" class="w-full">
            <el-option label="公司" value="公司" />
            <el-option label="产品" value="产品" />
            <el-option label="技术" value="技术" />
            <el-option label="FAQ" value="FAQ" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="uploadForm.tagsStr" placeholder="标签1, 标签2 (逗号分隔)" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="uploadForm.content" type="textarea" :rows="8" placeholder="文档内容..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpload" :loading="uploading">上传</el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="'预览 - ' + previewDoc_title" width="92vw" class="mobile-safe-dialog" destroy-on-close append-to-body>
      <div class="preview-content">{{ previewContent }}</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/api/request'

const loading = ref(false)
const uploading = ref(false)
const keyword = ref('')
const documents = ref<any[]>([])
const stats = ref({ totalDocs: 0, totalChunks: 0, indexed: '0%', storage: '0MB' })

const uploadDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const previewDoc_title = ref('')
const previewContent = ref('')

const uploadForm = ref({
  title: '',
  content: '',
  type: '其他',
  tagsStr: ''
})

async function fetchKnowledge() {
  loading.value = true
  try {
    const res = await service.get('/knowledge', {
      params: {
        type: '',
        keyword: keyword.value
      }
    })
    if (res.data.code === 0) {
      const list = res.data.data || []
      documents.value = list
      stats.value = {
        totalDocs: list.length,
        totalChunks: list.reduce((sum: number, d: any) => sum + (d.chunks || 0), 0),
        indexed: list.length > 0 ? Math.round(list.filter((d: any) => d.status === 'indexed' || d.status === '已索引').length / list.length * 100) + '%' : '0%',
        storage: (list.length * 2.8).toFixed(0) + 'MB'
      }
    }
  } catch (e) {
    ElMessage.error('加载知识库失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchKnowledge)

async function handleUpload() {
  if (!uploadForm.value.title.trim()) return ElMessage.warning('请输入标题')
  if (!uploadForm.value.content.trim()) return ElMessage.warning('请输入内容')
  uploading.value = true
  try {
    const tags = uploadForm.value.tagsStr.split(',').map(s => s.trim()).filter(Boolean)
    const res = await service.post('/knowledge', {
      title: uploadForm.value.title,
      content: uploadForm.value.content,
      type: uploadForm.value.type,
      tags
    })
    if (res.data.code === 0) {
      ElMessage.success('上传成功')
      uploadDialogVisible.value = false
      uploadForm.value = { title: '', content: '', type: '其他', tagsStr: '' }
      fetchKnowledge()
    }
  } catch (e) {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

function previewDoc(row: any) {
  previewDoc_title.value = row.title || row.name
  previewContent.value = row.content || '暂无内容'
  previewDialogVisible.value = true
}

async function deleteDoc(row: any) {
  ElMessageBox.confirm(`确认删除文档「${row.title || row.name}」？`).then(async () => {
    try {
      const res = await service.delete(`/knowledge/${row.id}`)
      if (res.data.code === 0) {
        ElMessage.success('已删除')
        fetchKnowledge()
      }
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}
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
.flex { display: flex; }
.gap-2 { gap: 8px; }
.w-full { width: 100%; }
.w-48 { width: 12rem; }
.cyber-input { flex-shrink: 0; }
.cyber-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 4px; }
.tag-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border: 1px solid rgba(0,240,255,0.2); }
.preview-content { white-space: pre-wrap; color: #a0a0cc; font-size: 14px; line-height: 1.6; max-height: 500px; overflow-y: auto; }
:deep(.mobile-safe-dialog) { max-width: 700px; margin: 8vh auto 0 !important; }
:deep(.mobile-safe-dialog .el-dialog__body) { max-height: 68vh; overflow-y: auto; }
@media (max-width: 640px) {
  .cyber-page { padding: 1rem; }
  .card-header { align-items: stretch; flex-direction: column; gap: 10px; }
  .card-header .flex { flex-direction: column; }
  .w-48 { width: 100%; }
}
</style>
