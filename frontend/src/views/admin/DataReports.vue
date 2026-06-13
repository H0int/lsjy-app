<template>
  <div>
    <!-- 时间范围选择 -->
    <div class="cyber-toolbar">
      <div class="tab-bar">
        <button v-for="range in ranges" :key="range.value" @click="activeRange = range.value" class="cyber-tab" :class="{ 'cyber-tab-active': activeRange === range.value }">{{ range.label }}</button>
      </div>
      <div class="flex-1" />
      <ExportButton filename="运营数据报表" :data="exportData" />
    </div>

    <!-- 汇总数据 -->
    <div class="cyber-grid-6 mb-6">
      <div v-for="metric in summaryMetrics" :key="metric.label" class="cyber-stat-mini">
        <p class="stat-lbl">{{ metric.label }}</p>
        <p class="stat-num text-white">{{ metric.value }}</p>
        <p class="stat-change" :class="metric.change >= 0 ? 'change-up' : 'change-down'">{{ metric.change >= 0 ? '↑' : '↓' }} {{ Math.abs(metric.change) }}%</p>
      </div>
    </div>

    <!-- 趋势图表区 -->
    <div class="cyber-grid-2 mb-6">
      <div class="cyber-card">
        <h3 class="card-title mb-4">用户增长趋势</h3>
        <div class="bar-chart">
          <div v-for="item in reportData" :key="item.period" class="bar-row">
            <span class="bar-label">{{ item.period }}</span>
            <div class="bar-track">
              <div class="bar-fill bar-fill-cyan" :style="{ width: (item.newUsers / maxUsers * 100) + '%' }">
                <span v-if="item.newUsers / maxUsers > 0.15" class="bar-text">{{ item.newUsers }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="cyber-card">
        <h3 class="card-title mb-4">营收趋势</h3>
        <div class="bar-chart">
          <div v-for="item in reportData" :key="item.period" class="bar-row">
            <span class="bar-label">{{ item.period }}</span>
            <div class="bar-track">
              <div class="bar-fill bar-fill-green" :style="{ width: (item.revenue / maxRevenue * 100) + '%' }">
                <span v-if="item.revenue / maxRevenue > 0.15" class="bar-text">¥{{ item.revenue.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细数据表 -->
    <div class="cyber-card p-0 overflow-hidden">
      <div class="table-header">
        <h3 class="card-title">详细数据</h3>
        <ExportButton filename="详细运营数据" :data="exportData" />
      </div>
      <table class="cyber-html-table">
        <thead>
          <tr>
            <th>日期</th>
            <th class="text-right">新增用户</th>
            <th class="text-right">活跃用户</th>
            <th class="text-right">营收(¥)</th>
            <th class="text-right">圣点消耗</th>
            <th class="text-right">订单数</th>
            <th class="text-right">工具调用</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in reportData" :key="item.period" class="table-row-hover">
            <td class="text-white font-medium">{{ item.period }}</td>
            <td class="text-right text-[#a0a0cc] font-mono">{{ item.newUsers.toLocaleString() }}</td>
            <td class="text-right text-[#a0a0cc] font-mono">{{ item.activeUsers.toLocaleString() }}</td>
            <td class="text-right text-green-400 font-medium font-mono">{{ item.revenue.toLocaleString() }}</td>
            <td class="text-right text-amber-400 font-mono">{{ item.coinConsumed.toLocaleString() }}</td>
            <td class="text-right text-[#a0a0cc] font-mono">{{ item.orders.toLocaleString() }}</td>
            <td class="text-right text-cyan-400 font-mono">{{ item.toolCalls.toLocaleString() }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="table-footer-row">
            <td class="text-white font-semibold">合计</td>
            <td class="text-right font-mono font-semibold">{{ reportData.reduce((s, i) => s + i.newUsers, 0).toLocaleString() }}</td>
            <td class="text-right font-mono">-</td>
            <td class="text-right text-green-400 font-mono font-semibold">¥{{ reportData.reduce((s, i) => s + i.revenue, 0).toLocaleString() }}</td>
            <td class="text-right text-amber-400 font-mono font-semibold">{{ reportData.reduce((s, i) => s + i.coinConsumed, 0).toLocaleString() }}</td>
            <td class="text-right font-mono font-semibold">{{ reportData.reduce((s, i) => s + i.orders, 0).toLocaleString() }}</td>
            <td class="text-right text-cyan-400 font-mono font-semibold">{{ reportData.reduce((s, i) => s + i.toolCalls, 0).toLocaleString() }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ReportData } from '@/types'
import ExportButton from '@/components/ExportButton.vue'

const activeRange = ref('7d')
const ranges = [
  { label: '近7天', value: '7d' },
  { label: '近30天', value: '30d' },
  { label: '近90天', value: '90d' },
]

const reportData = ref<ReportData[]>([
  { period: '07-18', newUsers: 234, activeUsers: 5620, revenue: 18900, coinConsumed: 45600, orders: 189, toolCalls: 12340 },
  { period: '07-17', newUsers: 198, activeUsers: 5430, revenue: 16500, coinConsumed: 41200, orders: 165, toolCalls: 11200 },
  { period: '07-16', newUsers: 256, activeUsers: 5890, revenue: 21300, coinConsumed: 52100, orders: 213, toolCalls: 14500 },
  { period: '07-15', newUsers: 187, activeUsers: 5210, revenue: 15200, coinConsumed: 38900, orders: 152, toolCalls: 10800 },
  { period: '07-14', newUsers: 312, activeUsers: 6100, revenue: 25600, coinConsumed: 61200, orders: 256, toolCalls: 16700 },
  { period: '07-13', newUsers: 278, activeUsers: 5950, revenue: 22100, coinConsumed: 54300, orders: 221, toolCalls: 15200 },
  { period: '07-12', newUsers: 145, activeUsers: 4890, revenue: 12300, coinConsumed: 32100, orders: 123, toolCalls: 8900 },
])

const maxUsers = computed(() => Math.max(...reportData.value.map(r => r.newUsers), 1))
const maxRevenue = computed(() => Math.max(...reportData.value.map(r => r.revenue), 1))

const summaryMetrics = computed(() => {
  const data = reportData.value
  const totalNewUsers = data.reduce((s, i) => s + i.newUsers, 0)
  const totalRevenue = data.reduce((s, i) => s + i.revenue, 0)
  const totalOrders = data.reduce((s, i) => s + i.orders, 0)
  const totalCoinConsumed = data.reduce((s, i) => s + i.coinConsumed, 0)
  const totalToolCalls = data.reduce((s, i) => s + i.toolCalls, 0)
  const avgActiveUsers = Math.round(data.reduce((s, i) => s + i.activeUsers, 0) / data.length)
  return [
    { label: '新增用户', value: totalNewUsers.toLocaleString(), change: 12.5 },
    { label: '日均活跃', value: avgActiveUsers.toLocaleString(), change: 8.3 },
    { label: '总营收', value: '¥' + totalRevenue.toLocaleString(), change: 15.2 },
    { label: '圣点消耗', value: totalCoinConsumed.toLocaleString(), change: 10.7 },
    { label: '订单数', value: totalOrders.toLocaleString(), change: -3.2 },
    { label: '工具调用', value: totalToolCalls.toLocaleString(), change: 18.9 },
  ]
})

const exportData = computed(() => reportData.value.map(r => ({
  '日期': r.period, '新增用户': r.newUsers, '活跃用户': r.activeUsers,
  '营收': r.revenue, '圣点消耗': r.coinConsumed, '订单数': r.orders, '工具调用': r.toolCalls
})))
</script>

<style scoped>
.cyber-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.cyber-grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.cyber-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

.cyber-stat-mini { background: #12121f; border: 1px solid #1a1a2e; border-radius: 10px; padding: 16px; text-align: center; }
.stat-num { font-size: 20px; font-weight: 800; font-family: 'Courier New', monospace; margin-top: 4px; }
.stat-lbl { font-size: 10px; color: #6a6a8a; letter-spacing: 0.5px; }
.stat-change { font-size: 10px; margin-top: 2px; }
.change-up { color: #00ff88; }
.change-down { color: #ff4466; }

.tab-bar { display: flex; gap: 4px; }
.cyber-tab { padding: 8px 16px; border-radius: 8px; font-size: 13px; background: transparent; border: 1px solid #1a1a2e; color: #6a6a8a; cursor: pointer; transition: all 0.2s; }
.cyber-tab:hover { border-color: #00f0ff44; color: #00f0ff; }
.cyber-tab-active { background: rgba(0,240,255,0.1) !important; border-color: #00f0ff !important; color: #00f0ff !important; box-shadow: 0 0 8px rgba(0,240,255,0.2); }

.cyber-card { background: #12121f; border: 1px solid #1a1a2e; border-radius: 12px; padding: 20px; }

.card-title { font-size: 14px; font-weight: 700; color: #e0e0ff; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }

/* Bar Charts */
.bar-chart { display: flex; flex-direction: column; gap: 8px; }
.bar-row { display: flex; align-items: center; gap: 12px; }
.bar-label { font-size: 11px; color: #4a4a6a; width: 60px; font-family: 'Courier New', monospace; }
.bar-track { flex: 1; height: 22px; background: #1a1a2e; border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; transition: width 0.3s; }
.bar-fill-cyan { background: linear-gradient(90deg, #00f0ff44, #00f0ff); }
.bar-fill-green { background: linear-gradient(90deg, #00ff8844, #00ff88); }
.bar-text { font-size: 10px; color: #0a0a0f; font-weight: 700; }

/* Table */
.table-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #1a1a2e; }
.cyber-html-table { width: 100%; font-size: 13px; }
.cyber-html-table th { padding: 12px 16px; text-align: left; color: #4a4a6a; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; background: rgba(26,26,46,0.3); border-bottom: 1px solid #1a1a2e; }
.cyber-html-table td { padding: 12px 16px; border-bottom: 1px solid #1a1a2e; }
.table-row-hover:hover { background: rgba(0,240,255,0.03); }
.table-footer-row { background: rgba(26,26,46,0.3); }
.table-footer-row td { border-bottom: none; }

.text-right { text-align: right; }
.flex-1 { flex: 1; }
.text-white { color: #fff; }
.text-green-400 { color: #00ff88; }
.text-amber-400 { color: #f59e0b; }
.text-cyan-400 { color: #00f0ff; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-mono { font-family: 'Courier New', monospace; }
</style>
