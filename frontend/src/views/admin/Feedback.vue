<template>
  <div class="cyber-page">
    <div class="page-header"><h1>💭 意见反馈</h1><p class="subtitle">用户反馈收集与处理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">💭</div><div class="stat-info"><div class="stat-value">{{ stats.totalFeedback }}</div><div class="stat-label">总反馈</div></div></div>
      <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-info"><div class="stat-value">{{ stats.pending }}</div><div class="stat-label">待处理</div></div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-value">{{ stats.resolved }}</div><div class="stat-label">已解决</div></div></div>
      <div class="stat-card"><div class="stat-icon">⭐</div><div class="stat-info"><div class="stat-value">{{ stats.satisfaction }}</div><div class="stat-label">满意度</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>反馈列表</h2></div>
      <el-table :data="feedbacks" style="width: 100%" class="cyber-table">
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }"><el-tag size="small" effect="dark">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="content" label="反馈内容" />
        <el-table-column prop="rating" label="评分" width="80">
          <template #default="{ row }"><span style="color:#FFD700">{{ '⭐'.repeat(row.rating) }}</span></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === '已处理' ? 'success' : 'warning'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleProcess(row)" :disabled="row.status === '已处理'">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 处理反馈对话框 -->
    <el-dialog v-model="processDialogVisible" title="处理反馈" width="500px">
      <div v-if="currentFeedback" style="color:#a0a0cc;">
        <p><strong>用户：</strong>{{ currentFeedback.username }}</p>
        <p><strong>类型：</strong>{{ currentFeedback.type }}</p>
        <p><strong>内容：</strong>{{ currentFeedback.content }}</p>
        <el-form style="margin-top:12px;">
          <el-form-item label="回复">
            <el-input v-model="replyContent" type="textarea" :rows="3" placeholder="请输入回复内容..." />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess" :loading="submitting">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/api/request'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const submitting = ref(false)
const stats = ref({ totalFeedback: 0, pending: 0, resolved: 0, satisfaction: '0' })
const feedbacks = ref<any[]>([])
const processDialogVisible = ref(false)
const currentFeedback = ref<any>(null)
const replyContent = ref('')

async function fetchFeedback() {
  loading.value = true
  try {
    const res = await service.get('/admin/feedback')
    if (res.data.code === 0) {
      const data = res.data.data
      feedbacks.value = data.feedbacks || data.list || data.items || data || []
      if (data.stats) {
        stats.value = {
          totalFeedback: data.stats.total || 0,
          pending: data.stats.pending || 0,
          resolved: data.stats.resolved || 0,
          satisfaction: data.stats.avgSatisfaction ? String(data.stats.avgSatisfaction) : '0'
        }
      }
    }
  } catch (e) {
    console.error('获取反馈列表失败', e)
    feedbacks.value = []
  } finally {
    loading.value = false
  }
}

function handleProcess(row: any) {
  currentFeedback.value = row
  replyContent.value = ''
  processDialogVisible.value = true
}

async function submitProcess() {
  if (!currentFeedback.value) return
  submitting.value = true
  try {
    const res = await service.put(`/admin/feedback/${currentFeedback.value.id}`, {
      status: '已处理',
      reply: replyContent.value
    })
    if (res.data.code === 0) {
      ElMessage.success('处理成功')
      processDialogVisible.value = false
      fetchFeedback()
    } else {
      ElMessage.error(res.data.message || '处理失败')
    }
  } catch (e) {
    ElMessage.error('处理失败')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchFeedback)
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
