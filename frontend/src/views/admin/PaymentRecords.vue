<template>
  <div>
    <h2 class="text-xl font-bold mb-6" style="color: #e0e0ff;">💳 支付记录</h2>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">今日收入</div>
        <div class="text-2xl font-bold" style="color: #00ff88;">¥{{ stats.todayIncome }}</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">本月收入</div>
        <div class="text-2xl font-bold" style="color: #00f0ff;">¥{{ stats.monthIncome }}</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">总交易笔数</div>
        <div class="text-2xl font-bold" style="color: #7c3aed;">{{ stats.totalOrders }}</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">待处理退款</div>
        <div class="text-2xl font-bold" style="color: #ffb800;">{{ stats.pendingRefunds }}</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="flex flex-wrap gap-3 mb-4">
      <input v-model="searchQuery" @keyup.enter="fetchRecords" type="text" placeholder="搜索订单号/用户..." class="px-3 py-2 rounded-lg text-sm"
        style="background: #12121f; border: 1px solid #1a1a2e; color: #e0e0ff; width: 200px;" />
      <select v-model="statusFilter" @change="fetchRecords" class="px-3 py-2 rounded-lg text-sm"
        style="background: #12121f; border: 1px solid #1a1a2e; color: #e0e0ff;">
        <option value="">全部状态</option><option value="success">成功</option><option value="pending">处理中</option><option value="failed">失败</option>
      </select>
    </div>

    <!-- 表格 -->
    <div class="rounded-xl overflow-hidden" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: rgba(26,26,46,0.5);">
              <th class="text-left p-3" style="color: #6a6a8a;">订单号</th>
<th class="text-left p-3" style="color: #6a6a8a;">用户</th>
              <th class="text-left p-3" style="color: #6a6a8a;">金额</th>
              <th class="text-left p-3" style="color: #6a6a8a;">圣力</th>
              <th class="text-left p-3" style="color: #6a6a8a;">渠道</th>
              <th class="text-left p-3" style="color: #6a6a8a;">状态</th>
              <th class="text-left p-3" style="color: #6a6a8a;">时间</th>
              <th class="text-left p-3" style="color: #6a6a8a;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id" style="border-top: 1px solid #1a1a2e;">
              <td class="p-3" style="color: #a0a0cc;">{{ record.orderNo }}</td>
              <td class="p-3" style="color: #e0e0ff;">{{ record.user }}</td>
              <td class="p-3 font-bold" style="color: #00ff88;">+¥{{ record.amount }}</td>
              <td class="p-3" style="color: #ffb800;">{{ record.coins }}</td>
              <td class="p-3" style="color: #a0a0cc;">{{ record.channel }}</td>
              <td class="p-3">
                <span class="px-2 py-0.5 rounded text-xs"
                  :style="record.status === 'success' ? 'background:rgba(0,255,136,0.1);color:#00ff88;' : 'background:rgba(255,184,0,0.1);color:#ffb800;'">
                  {{ record.status === 'success' ? '成功' : '处理中' }}
                </span>
              </td>
              <td class="p-3" style="color: #5a5a7a;">{{ record.time }}</td>
              <td class="p-3">
                <button class="text-xs px-2 py-1 rounded" style="background:rgba(0,240,255,0.08);color:#00f0ff;" @click="viewDetail(record)">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分页 -->
    <div class="flex items-center justify-between mt-4" style="color: #5a5a7a; font-size: 13px;">
      <span>共 {{ total }} 条记录，第 {{ page }} / {{ totalPages }} 页</span>
      <div class="flex gap-2">
        <button @click="prevPage" :disabled="page <= 1" class="px-3 py-1 rounded" style="background: rgba(0,240,255,0.08); color: #00f0ff;">上一页</button>
        <button @click="nextPage" :disabled="page >= totalPages" class="px-3 py-1 rounded" style="background: rgba(0,240,255,0.08); color: #00f0ff;">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import service from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const records = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')
const statusFilter = ref('')
const stats = ref({ todayIncome: 0, monthIncome: 0, totalOrders: 0, pendingRefunds: 0 })

async function fetchRecords() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: pageSize.value }
    if (statusFilter.value) params.status = statusFilter.value
    if (searchQuery.value) params.userId = searchQuery.value
    const res = await service.get('/payment/orders', { params })
    if (res.data.code === 0) {
      records.value = res.data.data.list || []
      total.value = res.data.data.total || 0
    }
  } catch (e) {
    ElMessage.error('加载支付记录失败')
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const res = await service.get('/admin/payment-failures', { params: { page: 1, pageSize: 1 } })
    if (res.data.code === 0 && res.data.data.stats) {
      stats.value = { ...stats.value, ...res.data.data.stats }
    }
  } catch (e) { /* ignore */ }
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

function nextPage() { if (page.value < totalPages.value) { page.value++; fetchRecords() } }
function prevPage() { if (page.value > 1) { page.value--; fetchRecords() } }

function viewDetail(record: any) {
  ElMessageBox.alert(
    `<div style="line-height:2">
      <p><b>订单号：</b>${record.orderNo || '-'}</p>
      <p><b>用户：</b>${record.username || record.nickname || '-'}</p>
      <p><b>金额：</b>¥${record.amount || 0}</p>
      <p><b>支付方式：</b>${record.paymentMethod || '-'}</p>
      <p><b>状态：</b>${record.status === 'success' ? '成功' : '处理中'}</p>
      <p><b>时间：</b>${record.time || '-'}</p>
    </div>`,
    '支付详情',
    { dangerouslyUseHTMLString: true, confirmButtonText: '关闭' }
  )
}

onMounted(() => { fetchRecords(); fetchStats() })
</script>
