<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">内容审核</h2>
      <div class="flex gap-2">
        <el-select v-model="filter.status" placeholder="状态" clearable style="width: 120px;">
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button @click="exportData">导出</el-button>
      </div>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无待审核内容">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'" effect="dark" round>{{ row.status === 'approved' ? '通过' : row.status === 'rejected' ? '拒绝' : '待审' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" size="small" link type="success" @click="approve(row)">通过</el-button>
            <el-button v-if="row.status === 'pending'" size="small" link type="danger" @click="reject(row)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import service from '@/api/request'
import { formatDate } from '@/utils'

const loading = ref(false)
const list = ref<any[]>([])
const filter = reactive({ status: '' })

async function loadData() {
  loading.value = true
  try {
    const params: any = {}
    if (filter.status) params.status = filter.status
    const res = await service.get('/moderation/list', { params })
    list.value = res.data?.items || res.data?.data?.items || res.data || []
  } catch (e: any) { ElMessage.error(e.message || '加载失败') }
  finally { loading.value = false }
}

async function approve(row: any) {
  try {
    await service.post(`/moderation/${row.id}/approve`)
    ElMessage.success('已通过')
    loadData()
  } catch (e: any) { ElMessage.error(e.message || '操作失败') }
}

async function reject(row: any) {
  try {
    await service.post(`/moderation/${row.id}/reject`)
    ElMessage.success('已拒绝')
    loadData()
  } catch (e: any) { ElMessage.error(e.message || '操作失败') }
}

function exportData() {
  const csv = ['ID,用户,类型,内容,状态,提交时间'].join(',') + '\n' + list.value.map(r => [r.id, r.username, r.type, r.content, r.status, formatDate(r.createdAt)].join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `moderation-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
}

onMounted(loadData)
</script>
