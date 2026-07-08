<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">在线用户</h2>
      <div class="flex gap-2">
        <el-button @click="loadData">刷新</el-button>
        <el-button type="primary" @click="exportData">导出</el-button>
        <el-button type="danger" @click="clearGuests">清空游客</el-button>
      </div>
    </div>
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
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" link type="danger" @click="kickUser(row)">强制下线</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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

async function kickUser(row: any) {
  try {
    await ElMessageBox.confirm(`确认强制用户 ${row.username || row.id} 下线？`)
    // 实际场景中调用下线 API，这里演示用
    list.value = list.value.filter(u => u.id !== row.id)
    stats.onlineTotal = Math.max(0, stats.onlineTotal - 1)
    ElMessage.success('已强制下线')
  } catch { /* cancelled */ }
}

function clearGuests() {
  const guests = list.value.filter(u => !u.username)
  if (!guests.length) {
    ElMessage.info('当前没有游客')
    return
  }
  list.value = list.value.filter(u => u.username)
  stats.guests = 0
  stats.onlineTotal = list.value.length
  ElMessage.success('已清空游客')
}

function exportData() {
  const csv = [
    ['ID', '用户', '昵称', 'IP', '当前页面', '在线时长', '最后活跃'].join(','),
    ...list.value.map(r => [r.id, r.username, r.nickname, r.ip, r.path, r.time, formatDate(r.lastActive)].join(','))
  ].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `online-users-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
}

onMounted(loadData)
</script>
