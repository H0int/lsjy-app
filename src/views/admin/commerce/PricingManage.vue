<template><div class="space-y-4"><div class="cyber-card rounded-xl p-6"><h2 class="text-xl font-bold mb-2" style="color:#00f0ff">💲 定价管理</h2><p class="text-xs mb-4" style="color:#a0a0cc">套餐定价策略</p><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-xs mb-1" style="color:#ff2d95">基础月卡</label><input v-model="cfg.basic" class="w-full px-3 py-2 rounded-lg text-sm" style="background:#0d0d1a;border:1px solid #00f0ff30;color:#e0e0ff;outline:none" placeholder="基础月卡"/></div>
<div><label class="block text-xs mb-1" style="color:#ff2d95">高级月卡</label><input v-model="cfg.pro" class="w-full px-3 py-2 rounded-lg text-sm" style="background:#0d0d1a;border:1px solid #00f0ff30;color:#e0e0ff;outline:none" placeholder="高级月卡"/></div>
<div><label class="block text-xs mb-1" style="color:#ff2d95">年卡折扣</label><input v-model="cfg.yearly" class="w-full px-3 py-2 rounded-lg text-sm" style="background:#0d0d1a;border:1px solid #00f0ff30;color:#e0e0ff;outline:none" placeholder="年卡折扣"/></div>
<div><label class="block text-xs mb-1" style="color:#ff2d95">首充优惠</label><input v-model="cfg.first" class="w-full px-3 py-2 rounded-lg text-sm" style="background:#0d0d1a;border:1px solid #00f0ff30;color:#e0e0ff;outline:none" placeholder="首充优惠"/></div>
</div><button @click="save" class="mt-4 px-6 py-2 rounded-lg text-sm" style="background:linear-gradient(135deg,#00f0ff,#b700ff);color:#fff">保存配置</button></div></div></template>
<script setup lang="ts">
import {ref} from 'vue'
const cfg=ref({basic:'29.9', pro:'99.9', yearly:'0.8', first:'0.5'})
function save(){alert('配置已保存')}
</script>