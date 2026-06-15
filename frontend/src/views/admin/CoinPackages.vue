<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold" style="color: #e0e0ff;">💰 圣力套餐管理</h2>
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
        <div class="text-sm mb-3" style="color: #5a5a7a;">圣力</div>
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
  { id: 1, coins: 50, price: 4.9, originalPrice: 5, bonus: '送5圣力', sold: 523, status: 'active', highlight: false },
  { id: 2, coins: 100, price: 9.9, originalPrice: 10, bonus: '送10圣力', sold: 1256, status: 'active', highlight: false },
  { id: 3, coins: 200, price: 14.9, originalPrice: 20, bonus: '送20圣力', sold: 892, status: 'active', highlight: false },
  { id: 4, coins: 300, price: 24.9, originalPrice: 30, bonus: '送30圣力', sold: 1567, status: 'active', highlight: false },
  { id: 5, coins: 500, price: 39.9, originalPrice: 50, bonus: '送100圣力', sold: 3421, status: 'active', highlight: true },
  { id: 6, coins: 1000, price: 69.9, originalPrice: 100, bonus: '送200圣力', sold: 2187, status: 'active', highlight: false },
  { id: 7, coins: 2000, price: 129.9, originalPrice: 200, bonus: '送500圣力', sold: 1345, status: 'active', highlight: false },
  { id: 8, coins: 3500, price: 199.9, originalPrice: 350, bonus: '送1000圣力', sold: 987, status: 'active', highlight: false },
  { id: 9, coins: 5000, price: 299.9, originalPrice: 500, bonus: '送1500圣力', sold: 876, status: 'active', highlight: false },
  { id: 10, coins: 10000, price: 549.9, originalPrice: 1000, bonus: '送3500圣力', sold: 432, status: 'active', highlight: false },
  { id: 11, coins: 25000, price: 1299.9, originalPrice: 2500, bonus: '送10000圣力', sold: 198, status: 'active', highlight: false },
  { id: 12, coins: 50000, price: 2499.9, originalPrice: 5000, bonus: '送25000圣力', sold: 56, status: 'active', highlight: false },
])
</script>

<style scoped>
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.p-2 { padding: 8px; }
.p-5 { padding: 20px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-0\.5 { padding-top: 2px; padding-bottom: 2px; }
.py-1\.5 { padding-top: 6px; padding-bottom: 6px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.pt-3 { padding-top: 12px; }
.text-xs { font-size: 11px; }
.text-sm { font-size: 13px; }
.text-xl { font-size: 20px; }
.text-2xl { font-size: 24px; }
.text-3xl { font-size: 30px; }
.font-bold { font-weight: 700; }
.inline-block { display: inline-block; }
.rounded { border-radius: 4px; }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.flex-1 { flex: 1; }
.transition-all { transition: all 0.2s; }
.hover\:-translate-y-1:hover { transform: translateY(-4px); }
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
</style>
