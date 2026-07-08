<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <el-radio-group v-model="range" @change="loadData">
          <el-radio-button label="7d">近7天</el-radio-button>
          <el-radio-button label="30d">近30天</el-radio-button>
          <el-radio-button label="90d">近90天</el-radio-button>
        </el-radio-group>
      </div>
      <div class="flex gap-2">
        <el-button @click="loadData">刷新</el-button>
        <el-button type="primary" @click="exportReport">导出报告</el-button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div v-for="item in cards" :key="item.title" class="cyber-card p-4">
        <div class="text-xs mb-1" style="color:#808099;">{{ item.title }}</div>
        <div class="text-2xl font-bold" style="color:#00f0ff;">{{ item.value }}</div>
        <div class="text-xs mt-1" :class="item.trend >= 0 ? 'text-green-500' : 'text-red-500'">
          {{ item.trend >= 0 ? '↑' : '↓' }} {{ Math.abs(item.trend) }}% 较昨日
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="cyber-card p-4">
        <h3 class="font-bold mb-3" style="color:#00f0ff;">Top5 热门工具</h3>
        <div class="space-y-2">
          <div v-for="(tool, idx) in topTools" :key="idx" class="flex items-center justify-between p-2 rounded" style="background:#0d0d1a;">
            <span style="color:#e0e0ff;">{{ idx + 1 }}. {{ tool.name }}</span>
            <span style="color:#00f0ff;">{{ tool.value }}</span>
          </div>
          <div v-if="!topTools.length" style="color:#808099;">暂无数据</div>
        </div>
      </div>
      <div class="cyber-card p-4">
        <h3 class="font-bold mb-3" style="color:#00f0ff;">Top5 营收贡献</h3>
        <div class="space-y-2">
          <div v-for="(item, idx) in topRevenue" :key="idx" class="flex items-center justify-between p-2 rounded" style="background:#0d0d1a;">
            <span style="color:#e0e0ff;">{{ idx + 1 }}. {{ item.name }}</span>
            <span style="color:#00f0ff;">¥{{ item.value }}</span>
          </div>
          <div v-if="!topRevenue.length" style="color:#808099;">暂无数据</div>
        </div>
      </div>
    </div>

    <div class="cyber-card p-4">
      <h3 class="font-bold mb-3" style="color:#00f0ff;">决策建议</h3>
      <div class="space-y-2">
        <div v-for="(tip, idx) in tips" :key="idx" class="p-3 rounded flex items-start gap-3" style="background:#0d0d1a;border:1px solid #00f0ff20;">
          <el-checkbox v-model="tip.done" />
          <div>
            <div class="text-sm" style="color:#e0e0ff;">{{ tip.title }}</div>
            <div class="text-xs mt-1" style="color:#808099;">{{ tip.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api'

const range = ref('7d')
const dashboardData = ref<any>(null)
const cards = ref<any[]>([
  { title: '总用户数', value: '-', trend: 0 },
  { title: '今日营收', value: '-', trend: 0 },
  { title: '今日活跃', value: '-', trend: 0 },
])
const tips = ref([
  { title: '用户增长', desc: '关注每日新增用户趋势，适时调整推广策略。', done: false },
  { title: '营收优化', desc: '通过分析热销套餐，优化圣力套餐定价与推荐。', done: false },
  { title: '内容运营', desc: '定期发布公告与活动，提升用户留存率。', done: false },
])

const topTools = computed(() => dashboardData.value?.topTools || [])
const topRevenue = computed(() => dashboardData.value?.topRevenue || [])

async function loadData() {
  try {
    const res = await adminApi.getDashboard()
    const d = res.data || {}
    dashboardData.value = d
    cards.value = [
      { title: '总用户数', value: d.totalUsers || 0, trend: d.userGrowth || 0 },
      { title: '今日营收', value: '¥' + (d.todayRevenue || 0), trend: d.revenueGrowth || 0 },
      { title: '今日活跃', value: d.activeUsers || 0, trend: d.activeGrowth || 0 },
    ]
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  }
}

function exportReport() {
  const text = `决策中心报告\n时间范围：${range.value}\n总用户数：${cards.value[0].value}\n今日营收：${cards.value[1].value}\n今日活跃：${cards.value[2].value}`
  const blob = new Blob([text], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `决策报告-${new Date().toISOString().slice(0,10)}.txt`
  link.click()
}

onMounted(loadData)
</script>
