<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">登录记录</h2>
      <div class="flex gap-2">
        <el-input v-model="filter.user" placeholder="用户名" clearable style="width: 150px;" />
        <el-select v-model="filter.status" placeholder="状态" clearable style="width: 120px;">
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
        </el-select>
        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button @click="exportData">导出</el-button>
      </div>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading" empty-text="暂无登录记录">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="device" label="设备" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" effect="dark" round>{{ row.status === 'success' ? '成功' : '失败' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
      <div class="flex justify-end mt-4">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="total, prev, pager, next" @current-change="loadData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api'
import { formatDate } from '@/utils'

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const filter = reactive({ user: '', status: '' })

async function loadData() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize }
    if (filter.user) params.username = filter.user
    if (filter.status) params.status = filter.status
    const res = await adminApi.getLoginHistory(params)
    list.value = res.data?.items || res.data?.list || []
    total.value = res.data?.total || list.value.length
  } catch (e: any) { ElMessage.error(e.message || '加载失败') }
  finally { loading.value = false }
}

function exportData() {
  const csv = ['ID,用户,IP,设备,状态,时间'].join(',') + '\n' + list.value.map(r => [r.id, r.username, r.ip, r.device, r.status === 'success' ? '成功' : '失败', formatDate(r.createdAt)].join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `login-history-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
}

onMounted(loadData)
</script>
