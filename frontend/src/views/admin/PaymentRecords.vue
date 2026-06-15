<template>
  <div>
    <h2 class="text-xl font-bold mb-6" style="color: #e0e0ff;">💳 支付记录</h2>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">今日收入</div>
        <div class="text-2xl font-bold" style="color: #00ff88;">¥2,580</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">本月收入</div>
        <div class="text-2xl font-bold" style="color: #00f0ff;">¥38,420</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">总交易笔数</div>
        <div class="text-2xl font-bold" style="color: #7c3aed;">8,956</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">待处理退款</div>
        <div class="text-2xl font-bold" style="color: #ffb800;">3</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="flex flex-wrap gap-3 mb-4">
      <input type="text" placeholder="搜索订单号/用户..." class="px-3 py-2 rounded-lg text-sm"
        style="background: #12121f; border: 1px solid #1a1a2e; color: #e0e0ff; width: 200px;" />
      <select class="px-3 py-2 rounded-lg text-sm"
        style="background: #12121f; border: 1px solid #1a1a2e; color: #e0e0ff;">
        <option>全部类型</option><option>充值</option><option>消费</option><option>退款</option>
      </select>
      <select class="px-3 py-2 rounded-lg text-sm"
        style="background: #12121f; border: 1px solid #1a1a2e; color: #e0e0ff;">
        <option>全部渠道</option><option>微信支付</option><option>支付宝</option><option>QQ支付</option>
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
                <button class="text-xs px-2 py-1 rounded" style="background:rgba(0,240,255,0.08);color:#00f0ff;">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const records = ref([
  { id: 1, orderNo: 'PAY20260614001', user: 'user001', amount: 39.9, coins: 550, channel: '微信支付', status: 'success', time: '2026-06-14 14:30' },
  { id: 2, orderNo: 'PAY20260614002', user: 'user007', amount: 69.9, coins: 1150, channel: '支付宝', status: 'success', time: '2026-06-14 13:15' },
  { id: 3, orderNo: 'PAY20260614003', user: 'user003', amount: 9.9, coins: 100, channel: '微信支付', status: 'pending', time: '2026-06-14 12:48' },
  { id: 4, orderNo: 'PAY20260613004', user: 'user010', amount: 199, coins: 3500, channel: '支付宝', status: 'success', time: '2026-06-13 18:20' },
  { id: 5, orderNo: 'PAY20260613005', user: 'user004', amount: 39.9, coins: 550, channel: '微信支付', status: 'success', time: '2026-06-13 16:05' },
])
</script>
