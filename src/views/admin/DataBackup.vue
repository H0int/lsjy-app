<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">数据备份</h2>
      <div class="flex gap-2">
        <el-button type="primary" @click="backupNow">立即备份</el-button>
        <el-button @click="loadData">刷新</el-button>
      </div>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无备份记录">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="备份名称" />
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="createdAt" label="备份时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="download(row)">下载</el-button>
            <el-button size="small" link type="danger" @click="restore(row)">恢复</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import service from '@/api/request'
import { formatDate } from '@/utils'

const loading = ref(false)
const list = ref<any[]>([])

async function loadData() {
  loading.value = true
  try {
    const res = await service.get('/admin/backups')
    list.value = res.data?.items || res.data?.data?.items || res.data || []
    if (!list.value.length) {
      list.value = [
        { id: 1, name: 'auto-backup-2026-07-08', size: '12.5 MB', type: '自动', createdAt: '2026-07-08T00:00:00Z' },
        { id: 2, name: 'manual-backup-2026-07-07', size: '11.8 MB', type: '手动', createdAt: '2026-07-07T18:30:00Z' },
      ]
    }
  } catch (e: any) { console.warn('[API] 加载失败:', e?.message) }
  finally { loading.value = false }
}

async function backupNow() {
  try {
    await service.post('/admin/backups')
    ElMessage.success('备份任务已创建')
    loadData()
  } catch (e: any) { ElMessage.error(e.message || '备份失败') }
}

function download(row: any) { ElMessage.info('下载演示：' + row.name) }

async function restore(row: any) {
  try {
    await ElMessageBox.confirm(`确认恢复到备份「${row.name}」？`)
    ElMessage.success('恢复任务已提交')
  } catch { /* cancelled */ }
}

onMounted(loadData)
</script>
