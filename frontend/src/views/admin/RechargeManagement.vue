<template>
  <div>
    <h2 class="text-xl font-bold mb-6" style="color: #e0e0ff;">💎 充值管理</h2>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">今日充值</div>
        <div class="text-2xl font-bold" style="color: #00f0ff;">¥1,280</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">本月充值</div>
        <div class="text-2xl font-bold" style="color: #7c3aed;">¥28,500</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">充值用户数</div>
        <div class="text-2xl font-bold" style="color: #00ff88;">156</div>
      </div>
      <div class="rounded-xl p-4" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="text-xs mb-1" style="color: #5a5a7a;">人均充值</div>
        <div class="text-2xl font-bold" style="color: #ffb800;">¥182</div>
      </div>
    </div>

    <div class="rounded-xl overflow-hidden" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: rgba(26,26,46,0.5);">
              <th class="text-left p-3" style="color: #6a6a8a;">用户</th>
              <th class="text-left p-3" style="color: #6a6a8a;">充值金额</th>
              <th class="text-left p-3" style="color: #6a6a8a;">获得圣点</th>
              <th class="text-left p-3" style="color: #6a6a8a;">赠送圣点</th>
              <th class="text-left p-3" style="color: #6a6a8a;">充值前余额</th>
              <th class="text-left p-3" style="color: #6a6a8a;">充值后余额</th>
              <th class="text-left p-3" style="color: #6a6a8a;">时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in recharges" :key="r.id" style="border-top: 1px solid #1a1a2e;">
              <td class="p-3" style="color: #e0e0ff;">{{ r.user }}</td>
              <td class="p-3 font-bold" style="color: #00ff88;">¥{{ r.amount }}</td>
              <td class="p-3" style="color: #ffb800;">{{ r.coins }}</td>
              <td class="p-3" style="color: #00f0ff;">+{{ r.bonus }}</td>
              <td class="p-3" style="color: #5a5a7a;">{{ r.before }}</td>
              <td class="p-3" style="color: #00ff88;">{{ r.after }}</td>
              <td class="p-3" style="color: #5a5a7a;">{{ r.time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const recharges = ref([
  { id: 1, user: 'user001', amount: 39.9, coins: 500, bonus: 50, before: 120, after: 670, time: '2026-06-14 14:30' },
  { id: 2, user: 'user007', amount: 69.9, coins: 1000, bonus: 150, after: 1350, before: 200, time: '2026-06-14 13:15' },
  { id: 3, user: 'user010', amount: 199, coins: 3000, bonus: 500, before: 800, after: 4300, time: '2026-06-13 18:20' },
])
</script>
