<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">消息推送</h2>
      <div class="flex gap-2">
        <el-button @click="loadData">刷新</el-button>
        <el-button type="primary" @click="openDialog()">+ 新建推送</el-button>
      </div>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无推送记录">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="target" label="目标用户" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'sent' ? 'success' : 'warning'" effect="dark" round>{{ row.status === 'sent' ? '已发送' : '草稿' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="row.status !== 'sent'" size="small" link type="success" @click="send(row)">发送</el-button>
            <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" title="新建推送" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="目标"><el-input v-model="form.target" placeholder="all 或用户名" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { service } from '@/api/request'
import { formatDate } from '@/utils'

const loading = ref(false)
const list = ref<any[]>([])
const dialogVisible = ref(false)
const form = reactive<any>({ id: null, title: '', target: 'all', content: '', status: 'draft' })

async function loadData() {
  loading.value = true
  try {
    const res = await service.get('/admin/push-messages')
    list.value = res.data?.items || res.data?.data?.items || res.data || []
  } catch (e: any) { ElMessage.error(e.message || '加载失败') }
  finally { loading.value = false }
}

function openDialog() {
  Object.assign(form, { id: null, title: '', target: 'all', content: '', status: 'draft' })
  dialogVisible.value = true
}

async function submit() {
  try {
    await service.post('/admin/push-messages', form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e: any) { ElMessage.error(e.message || '保存失败') }
}

async function send(row: any) {
  try {
    await ElMessageBox.confirm(`确认发送推送「${row.title}」？`)
    await service.post(`/admin/push-messages/${row.id}/send`)
    ElMessage.success('已发送')
    loadData()
  } catch { /* cancelled */ }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确认删除该推送？')
    await service.delete(`/admin/push-messages/${row.id}`)
    ElMessage.success('删除成功')
    loadData()
  } catch { /* cancelled */ }
}

onMounted(loadData)
</script>
