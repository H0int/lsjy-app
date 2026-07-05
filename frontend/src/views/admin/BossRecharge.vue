<template>
  <div>
    <h2 class="text-xl font-bold mb-6" style="color: #e0e0ff;">👑 Boss充圣点</h2>

    <div class="grid lg:grid-cols-[360px,1fr] gap-6 mb-6">
      <div class="rounded-xl p-5" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <h3 class="font-bold mb-4" style="color: #00f0ff;">给用户充值</h3>
        <el-form label-position="top">
          <el-form-item label="选择用户">
            <el-select v-model="form.userId" filterable placeholder="搜索/选择用户" class="w-full">
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="`${user.nickname || user.username}（ID:${user.id}）`"
                :value="user.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="充值圣点">
            <el-input-number v-model="form.amount" :min="1" :step="100" class="w-full" />
          </el-form-item>

          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="例如：Boss手动赠送、活动补偿、测试充值" />
          </el-form-item>

          <el-button type="primary" class="w-full" :loading="submitting" @click="submitRecharge">
            确认充值
          </el-button>
        </el-form>
      </div>

      <div class="rounded-xl overflow-hidden" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="flex items-center justify-between p-4 border-b" style="border-color: #1a1a2e;">
          <h3 class="font-bold" style="color: #e0e0ff;">用户列表</h3>
          <el-button size="small" @click="fetchUsers">刷新</el-button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style="background: rgba(26,26,46,0.5);">
                <th class="text-left p-3" style="color: #6a6a8a;">ID</th>
                <th class="text-left p-3" style="color: #6a6a8a;">用户</th>
                <th class="text-left p-3" style="color: #6a6a8a;">手机号</th>
                <th class="text-left p-3" style="color: #6a6a8a;">状态</th>
                <th class="text-left p-3" style="color: #6a6a8a;">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" style="border-top: 1px solid #1a1a2e;">
                <td class="p-3" style="color: #00f0ff;">{{ user.id }}</td>
                <td class="p-3" style="color: #e0e0ff;">{{ user.nickname || user.username }}</td>
                <td class="p-3" style="color: #8888aa;">{{ user.phone || '-' }}</td>
                <td class="p-3" style="color: #00ff88;">{{ user.status }}</td>
                <td class="p-3">
                  <el-button size="small" @click="selectUser(user.id)">选择</el-button>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="5" class="p-8 text-center" style="color: #5a5a7a;">暂无用户</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="rounded-xl overflow-hidden" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
      <div class="flex items-center justify-between p-4 border-b" style="border-color: #1a1a2e;">
        <div>
          <h3 class="font-bold" style="color: #e0e0ff;">前台圣点/会员订单同步</h3>
          <p class="text-xs mt-1" style="color: #6a6a8a;">这里显示用户在前端圣力中心创建的充值订单和会员订阅订单。</p>
        </div>
        <el-button size="small" @click="fetchOrders">刷新订单</el-button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: rgba(26,26,46,0.5);">
              <th class="text-left p-3" style="color: #6a6a8a;">订单号</th>
              <th class="text-left p-3" style="color: #6a6a8a;">用户</th>
              <th class="text-left p-3" style="color: #6a6a8a;">类型</th>
              <th class="text-left p-3" style="color: #6a6a8a;">内容</th>
              <th class="text-left p-3" style="color: #6a6a8a;">金额</th>
              <th class="text-left p-3" style="color: #6a6a8a;">状态</th>
              <th class="text-left p-3" style="color: #6a6a8a;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in frontOrders" :key="order.id" style="border-top: 1px solid #1a1a2e;">
              <td class="p-3 font-mono text-xs" style="color: #00f0ff;">{{ order.orderNo }}</td>
              <td class="p-3" style="color: #e0e0ff;">{{ order.userName || order.username || ('用户#' + order.userId) }}</td>
              <td class="p-3">
                <span class="text-xs px-2 py-1 rounded" :style="order.orderType === 'subscription' ? 'background: rgba(255,184,0,0.1); color: #ffb800;' : 'background: rgba(0,240,255,0.1); color: #00f0ff;'">
                  {{ order.orderType === 'subscription' ? '会员订阅' : '圣点充值' }}
                </span>
              </td>
              <td class="p-3" style="color: #ffb800;">
                <template v-if="order.orderType === 'subscription'">
                  {{ order.planName || order.displayName || '月度会员' }} · 首日{{ order.coinAmount }} · 每日{{ order.dailyCoins }} · {{ order.subscriptionDays || 30 }}天
                </template>
                <template v-else>{{ order.coinAmount }} 圣点</template>
              </td>
              <td class="p-3 font-bold" style="color: #00ff88;">¥{{ order.price }}</td>
              <td class="p-3">
                <span class="text-xs px-2 py-1 rounded-full" :style="statusStyle(order.status)">
                  {{ statusLabel(order.status) }}
                </span>
              </td>
              <td class="p-3">
                <div class="flex gap-2">
                  <el-button v-if="order.status === 'pending_review' || order.status === 'pending_payment'" size="small" type="success" @click="approveOrder(order)">通过</el-button>
                  <el-button v-if="order.status === 'pending_review' || order.status === 'pending_payment'" size="small" type="danger" @click="rejectOrder(order)">拒绝</el-button>
                </div>
              </td>
            </tr>
            <tr v-if="frontOrders.length === 0">
              <td colspan="7" class="p-8 text-center" style="color: #5a5a7a;">暂无前台充值/会员订单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'
import type { User } from '@/types'
import service from '@/api/request'

const users = ref<User[]>([])
const frontOrders = ref<any[]>([])
const submitting = ref(false)
const form = reactive({
  userId: undefined as number | undefined,
  amount: 100,
  remark: 'Boss后台手动充值',
})

async function fetchUsers() {
  const res = await adminApi.getUsers({ page: 1, pageSize: 200, status: 'active' })
  users.value = (res.data as any)?.items || []
}

async function fetchOrders() {
  const res = await service.get('/payment/coin/orders')
  frontOrders.value = (res.data?.data?.items || []).slice().reverse()
}

function selectUser(userId: number) {
  form.userId = userId
}

async function submitRecharge() {
  if (!form.userId) {
    ElMessage.warning('请先选择用户')
    return
  }
  if (!form.amount || form.amount <= 0) {
    ElMessage.warning('充值圣点必须大于0')
    return
  }

  const user = users.value.find(item => item.id === form.userId)
  await ElMessageBox.confirm(
    `确认给 ${user?.nickname || user?.username || `用户${form.userId}`} 充值 ${form.amount} 圣点？`,
    'Boss充值确认',
    { confirmButtonText: '确认充值', cancelButtonText: '取消', type: 'warning' },
  )

  submitting.value = true
  try {
    await adminApi.bossAdjustCoins({
      userId: form.userId,
      amount: form.amount,
      remark: form.remark,
    })
    ElMessage.success('充值成功')
  } finally {
    submitting.value = false
  }
}

function statusLabel(s: string): string {
  return {
    pending_payment: '待支付',
    pending_review: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }[s] || s
}

function statusStyle(s: string) {
  return {
    pending_payment: 'background: rgba(100,100,140,0.1); color: #9ca3af; border: 1px solid rgba(100,100,140,0.2);',
    pending_review: 'background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2);',
    approved: 'background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2);',
    rejected: 'background: rgba(255,68,102,0.1); color: #ff4466; border: 1px solid rgba(255,68,102,0.2);'
  }[s] || ''
}

async function approveOrder(order: any) {
  const content = order.orderType === 'subscription'
    ? `${order.planName || '会员订阅'}，首日${order.coinAmount}圣点，每日${order.dailyCoins}圣点`
    : `${order.coinAmount}圣点`
  await ElMessageBox.confirm(`确认通过 ${order.userName || order.username || order.userId} 的订单？\n${content}`, '订单审批', {
    confirmButtonText: '通过',
    cancelButtonText: '取消',
    type: 'warning',
  })
  const res = await service.post(`/payment/coin/approve/${order.id}`, { action: 'approve', remark: 'Boss后台审批通过' })
  if (res.data?.code === 0) {
    ElMessage.success('已通过，前后台数据已同步')
    await Promise.all([fetchOrders(), fetchUsers()])
  } else {
    ElMessage.error(res.data?.message || '审批失败')
  }
}

async function rejectOrder(order: any) {
  const { value } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝订单', {
    confirmButtonText: '拒绝',
    cancelButtonText: '取消',
  })
  const res = await service.post(`/payment/coin/approve/${order.id}`, { action: 'reject', remark: value || 'Boss后台拒绝' })
  if (res.data?.code === 0) {
    ElMessage.success('已拒绝')
    await fetchOrders()
  } else {
    ElMessage.error(res.data?.message || '操作失败')
  }
}

onMounted(() => {
  fetchUsers()
  fetchOrders()
})
</script>
