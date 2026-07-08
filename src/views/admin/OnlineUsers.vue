<template>
  <div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="ip" label="IP" />
        <el-table-column prop="path" label="当前页面" />
        <el-table-column prop="time" label="在线时长" />
        <el-table-column prop="lastActive" label="最后活跃" width="160">
          <template #default="{ row }">{{ formatDate(row.lastActive) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { service } from '@/api/request'
import { formatDate } from '@/utils'

const loading = ref(false)
const list = ref<any[]>([])

async function loadData() {
  loading.value = true
  try {
    const res = await service.get('/admin/online-users')
    list.value = res.data?.data?.list || res.data?.list || []
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
