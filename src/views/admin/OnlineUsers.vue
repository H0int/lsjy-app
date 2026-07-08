<template>
  <div>
    <div class="cyber-card p-4">
      <div class="grid grid-cols-4 gap-4 mb-4">
        <div class="p-4 rounded-lg text-center" style="background:#0d0d1a;border:1px solid #00f0ff30;">
          <div class="text-xs" style="color:#808099;">在线总数</div>
          <div class="text-xl font-bold" style="color:#00f0ff;">{{ stats.onlineTotal || 0 }}</div>
        </div>
        <div class="p-4 rounded-lg text-center" style="background:#0d0d1a;border:1px solid #00f0ff30;">
          <div class="text-xs" style="color:#808099;">登录用户</div>
          <div class="text-xl font-bold" style="color:#00f0ff;">{{ stats.loggedIn || 0 }}</div>
        </div>
        <div class="p-4 rounded-lg text-center" style="background:#0d0d1a;border:1px solid #00f0ff30;">
          <div class="text-xs" style="color:#808099;">游客</div>
          <div class="text-xl font-bold" style="color:#00f0ff;">{{ stats.guests || 0 }}</div>
        </div>
        <div class="p-4 rounded-lg text-center" style="background:#0d0d1a;border:1px solid #00f0ff30;">
          <div class="text-xs" style="color:#808099;">今日峰值</div>
          <div class="text-xl font-bold" style="color:#00f0ff;">{{ stats.peakToday || 0 }}</div>
        </div>
      </div>
      <el-table :data="list" stripe v-loading="loading" empty-text="当前暂无在线用户">
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api'
import { formatDate } from '@/utils'

const loading = ref(false)
const list = ref<any[]>([])
const stats = reactive<any>({ onlineTotal: 0, loggedIn: 0, guests: 0, peakToday: 0 })

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getOnlineUsers()
    list.value = res.data?.list || []
    Object.assign(stats, res.data?.stats || {})
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
