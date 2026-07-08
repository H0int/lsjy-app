<template><div class="space-y-4"><h2 class="text-xl font-bold" style="color:#00f0ff">🤖 模型监控</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div v-for="m in models" :key="m.name" class="cyber-card rounded-xl p-4"><div class="flex items-center justify-between mb-3"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full" :style="{background:m.online?'#00ff88':'#00f0ff'}"></div><span class="font-bold text-sm" style="color:#e0e0ff">{{m.name}}</span></div><span class="text-xs px-2 py-0.5 rounded" :style="{background:m.online?'#00ff8820':'#00f0ff20',color:m.online?'#00ff88':'#00f0ff'}">{{m.online?'在线':'离线'}}</span></div><div class="grid grid-cols-3 gap-2 text-center"><div><div class="text-xs" style="color:#a0a0cc">响应</div><div class="text-sm font-bold" style="color:#00f0ff">{{m.lat}}ms</div></div><div><div class="text-xs" style="color:#a0a0cc">成功率</div><div class="text-sm font-bold" style="color:#00ff88">{{m.rate}}%</div></div><div><div class="text-xs" style="color:#a0a0cc">调用</div><div class="text-sm font-bold" style="color:#ffe600">{{m.calls}}</div></div></div></div></div></div></template>
<script setup lang="ts">
import {ref} from 'vue'
const models=ref([
{name:'Coze Bot',online:true,lat:234,rate:99.2,calls:1856},
{name:'豆包 Pro',online:false,lat:0,rate:0,calls:0},
{name:'DeepSeek',online:false,lat:0,rate:0,calls:0},
{name:'通义千问',online:false,lat:0,rate:0,calls:0},
{name:'即梦 Seedream',online:true,lat:1520,rate:97.8,calls:342},
{name:'腾讯元宝',online:false,lat:0,rate:0,calls:0},
{name:'OpenAI GPT',online:false,lat:0,rate:0,calls:0}
])
</script>