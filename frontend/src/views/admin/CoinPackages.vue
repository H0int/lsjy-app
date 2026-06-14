<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold" style="color: #e0e0ff;">💰 圣点套餐管理</h2>
      <button class="px-4 py-2 rounded-lg text-sm font-bold"
        style="background: linear-gradient(135deg, #00f0ff, #7c3aed); color: #000;">
        + 新建套餐
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="pkg in packages" :key="pkg.id"
        class="rounded-xl p-5 transition-all hover:-translate-y-1"
        :style="{ background: 'rgba(13,13,26,0.8)', border: `1px solid ${pkg.highlight ? '#00f0ff' : '#1a1a2e'}` }">
        <div v-if="pkg.highlight" class="text-xs font-bold mb-2 px-2 py-0.5 rounded inline-block"
          style="background: rgba(0,240,255,0.1); color: #00f0ff;">推荐</div>
        <div class="text-3xl font-bold mb-1" style="color: #e0e0ff;">{{ pkg.coins }}</div>
        <div class="text-sm mb-3" style="color: #5a5a7a;">圣点</div>
        <div class="text-2xl font-bold mb-1" style="color: #ffb800;">¥{{ pkg.price }}</div>
        <div class="text-xs mb-4" style="color: #5a5a7a;">原价 ¥{{ pkg.originalPrice }}</div>
        <div class="text-xs mb-4 p-2 rounded" style="background: rgba(0,240,255,0.05); color: #00f0ff;">
          {{ pkg.bonus }}
        </div>
        <div class="flex items-center justify-between text-xs" style="color: #5a5a7a;">
          <span>已售 {{ pkg.sold }}</span>
          <span :style="pkg.status === 'active' ? 'color: #00ff88;' : 'color: #ff4444;'">
            {{ pkg.status === 'active' ? '上架中' : '已下架' }}
          </span>
        </div>
        <div class="flex gap-2 mt-3 pt-3" style="border-top: 1px solid #1a1a2e;">
          <button class="flex-1 py-1.5 rounded text-xs" style="background: rgba(0,240,255,0.08); color: #00f0ff;">编辑</button>
          <button class="flex-1 py-1.5 rounded text-xs" style="background: rgba(255,68,68,0.08); color: #ff4444;">下架</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const packages = ref([
  { id: 1, coins: 100, price: 9.9, originalPrice: 10, bonus: '无赠品', sold: 1256, status: 'active', highlight: false },
  { id: 2, coins: 500, price: 39.9, originalPrice: 50, bonus: '送50圣点', sold: 3421, status: 'active', highlight: true },
  { id: 3, coins: 1000, price: 69.9, originalPrice: 100, bonus: '送150圣点', sold: 2187