<template><div class="space-y-4"><div class="cyber-card rounded-xl p-6"><h2 class="text-xl font-bold mb-2" style="color:#00f0ff">💰 支付渠道</h2><p class="text-xs mb-4" style="color:#a0a0cc">支付通道配置</p><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-xs mb-1" style="color:#00f0ff">微信AppID</label><input v-model="cfg.wx_appid" class="w-full px-3 py-2 rounded-lg text-sm" style="background:#0d0d1a;border:1px solid #00f0ff30;color:#e0e0ff;outline:none" placeholder="微信AppID"/></div>
<div><label class="block text-xs mb-1" style="color:#00f0ff">支付宝PartnerID</label><input v-model="cfg.ali_pid" class="w-full px-3 py-2 rounded-lg text-sm" style="background:#0d0d1a;border:1px solid #00f0ff30;color:#e0e0ff;outline:none" placeholder="支付宝PartnerID"/></div>
<div><label class="block text-xs mb-1" style="color:#00f0ff">Stripe Key</label><input v-model="cfg.stripe_key" class="w-full px-3 py-2 rounded-lg text-sm" style="background:#0d0d1a;border:1px solid #00f0ff30;color:#e0e0ff;outline:none" placeholder="Stripe Key"/></div>
<div><label class="block text-xs mb-1" style="color:#00f0ff">PayPal ID</label><input v-model="cfg.paypal_id" class="w-full px-3 py-2 rounded-lg text-sm" style="background:#0d0d1a;border:1px solid #00f0ff30;color:#e0e0ff;outline:none" placeholder="PayPal ID"/></div>
</div><button @click="save" class="mt-4 px-6 py-2 rounded-lg text-sm" style="background:linear-gradient(135deg,#00f0ff,#b700ff);color:#fff">保存配置</button></div></div></template>
<script setup lang="ts">
import {ref} from 'vue'
const cfg=ref({wx_appid:'', ali_pid:'', stripe_key:'', paypal_id:''})
function save(){alert('配置已保存')}
</script>