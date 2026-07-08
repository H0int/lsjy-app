<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div v-for="item in cards" :key="item.title" class="cyber-card p-4">
        <div class="text-xs mb-1" style="color:#808099;">{{ item.title }}</div>
        <div class="text-2xl font-bold" style="color:#00f0ff;">{{ item.value }}</div>
        <div class="text-xs mt-1" :class="item.trend >= 0 ? 'text-green-500' : 'text-red-500'">
          {{ item.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(item.trend) }}% 较昨日
        </div>
      </div>
    </div>
    <div class="cyber-card p-4">
      <h3 class="font-bold mb-3" style="color:#00f0ff;">决策建议</h3>
      <div class="space-y-2">
        <div v-for="(tip, idx) in tips" :key="idx" class="p-3 rounded" style="background:#0d0d1a;border:1px solid #00f0ff20;">
          <div class="text-sm" style="color:#e0e0ff;">{{ tip.title }}</div>
          <div class="text-xs mt-1" style="color:#808099;">{{ tip.desc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api'

const cards = ref<any[]>([
  { title: '总用户数', value: '-', trend: 0 },
  { title: '今日营收', value: '-', trend: 0 },
  { title: '今日活跃', value: '-', trend: 0 },
])

const tips = ref([
  { title: '用户增长', desc: '关注每日新增用户趋势，适时调整推广策略。' },
  { title: '营收优化', desc: '通过分析热销套餐，优化圣力套餐定价与推荐。' },
  { title: '内容运营', desc: '定期发布公告与活动，提升用户留存率。' },
])

async function loadData() {
  try {
    const res = await adminApi.getDashboard()
    const d = res.data || {}
    cards.value = [
      { title: '总用户数', value: d.totalUsers || 0, trend: d.userGrowth || 0 },
      { title: '今日营收', value: '¥' + (d.todayRevenue || 0), trend: d.revenueGrowth || 0 },
      { title: '今日活跃', value: d.activeUsers || 0, trend: d.activeGrowth || 0 },
    ]
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  }
}

onMounted(loadData)
</script>
