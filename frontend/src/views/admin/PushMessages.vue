<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🔔 消息推送</h1><p class="subtitle">系统消息与推送通知管理</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">📨</div><div class="stat-info"><div class="stat-value">{{ stats.totalSent }}</div><div class="stat-label">已发送</div></div></div>
      <div class="stat-card"><div class="stat-icon">📱</div><div class="stat-info"><div class="stat-value">{{ stats.pushToday }}</div><div class="stat-label">今日推送</div></div></div>
      <div class="stat-card"><div class="stat-icon">👁️</div><div class="stat-info"><div class="stat-value">{{ stats.readRate }}</div><div class="stat-label">阅读率</div></div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-info"><div class="stat-value">{{ stats.subscribers }}</div><div class="stat-label">订阅用户</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>推送消息列表</h2><el-button type="primary" size="small" @click="openCreateDialog">+ 新建推送</el-button></div>
      <el-table :data="messages" style="width: 100%" class="cyber-table" v-loading="loading">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }"><el-tag size="small" effect="dark">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="target" label="目标用户" width="120" />
        <el-table-column prop="sentCount" label="发送数" width="80" />
        <el-table-column prop="readCount" label="已读" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === '已发送' ? 'success' : 'info'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="sentAt" label="发送时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === '草稿'" size="small" type="success" link @click="sendMessage(row)">发送</el-button>
          </template>
        </el-table-column>
      </el-table>

    <!-- 新建推送弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新建推送" width="500px" destroy-on-close>
      <el-form label-width="80px" class="cyber-form" style="padding: 0 20px;">
        <el-form-item label="标题"><el-input v-model="form.title" placeholder="输入推送标题" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="4" placeholder="输入推送内容" /></el-form-item>
        <el-form-item label="目标用户">
          <el-select v-model="form.target" class="w-full">
            <el-option label="全部用户" value="全部用户" />
            <el-option label="VIP用户" value="VIP用户" />
            <el-option label="付费用户" value="付费用户" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createMessage">保存草稿</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="消息详情" width="500px" destroy-on-close>
      <div v-if="currentMessage" style="padding: 0 20px;">
        <h3 style="color: #00f0ff; margin-bottom: 12px;">{{ currentMessage.title }}</h3>
        <p style="color: #8888aa; font-size: 13px; margin-bottom: 8px;">
          类型: {{ currentMessage.type }} | 目标: {{ currentMessage.target }} | 状态: {{ currentMessage.status }}
        </p>
        <p style="color: #8888aa; font-size: 13px; margin-bottom: 12px;">
          发送数: {{ currentMessage.sentCount }} | 已读: {{ currentMessage.readCount }} | 时间: {{ currentMessage.sentAt }}
        </p>
        <div style="color: #e0e0ff; line-height: 1.8; white-space: pre-wrap;">{{ currentMessage.content }}</div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const stats = ref({ totalSent: 0, pushToday: 0, readRate: '0%', subscribers: 0 })
const messages = ref<any[]>([])

// 新建推送表单
const createDialogVisible = ref(false)
const form = ref({ title: '', content: '', target: '全部用户' })

// 详情弹窗
const detailDialogVisible = ref(false)
const currentMessage = ref<any>(null)

async function fetchData() {
  loading.value = true
  try {
    const res = await service.get('/admin/push-messages')
    if (res.data.code === 0) {
      messages.value = res.data.data.messages || []
      const s = res.data.data.stats || {}
      stats.value = {
        totalSent: s.totalSent || 0,
        pushToday: s.todaySent || 0,
        readRate: s.readRate || '0%',
        subscribers: s.subscribers || 0
      }
    }
  } catch (e) {
    ElMessage.error('加载消息失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

function openCreateDialog() {
  form.value = { title: '', content: '', target: '全部用户' }
  createDialogVisible.value = true
}

async function createMessage() {
  if (!form.value.title) {
    ElMessage.warning('请输入标题')
    return
  }
  try {
    const res = await service.post('/admin/push-messages', {
      title: form.value.title,
      content: form.value.content,
      target: form.value.target
    })
    if (res.data.code === 0) {
      ElMessage.success('创建成功')
      createDialogVisible.value = false
      fetchData()
    }
  } catch (e) {
    ElMessage.error('创建失败')
  }
}

async function sendMessage(row: any) {
  try {
    await ElMessageBox.confirm(`确定要发送「${row.title}」吗？`, '确认发送', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await service.post(`/admin/push-messages/${row.id}/send`)
    if (res.data.code === 0) {
      ElMessage.success('发送成功')
      fetchData()
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('发送失败')
    }
  }
}

function viewDetail(row: any) {
  currentMessage.value = row
  detailDialogVisible.value = true
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
.w-full { width: 100%; }
</style>
