<template>
  <div>
    <h2 class="text-xl font-bold mb-6" style="color: #e0e0ff;">🤖 AI模型配置</h2>

    <div class="space-y-4">
      <div v-for="provider in providers" :key="provider.id"
        class="rounded-xl p-5" style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              :style="{ background: provider.gradient }">
              {{ provider.icon }}
            </div>
            <div>
              <div class="font-bold" style="color: #e0e0ff;">{{ provider.name }}</div>
              <div class="text-xs" style="color: #5a5a7a;">{{ provider.endpoint }}</div>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold"
            :style="provider.status === 'active'
              ? 'background: rgba(0,255,136,0.1); color: #00ff88;'
              : 'background: rgba(255,68,68,0.1); color: #ff4444;'">
            {{ provider.status === 'active' ? '已连接' : '未配置' }}
          </span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div class="rounded-lg p-3" style="background: rgba(0,240,255,0.05);">
            <div style="color: #5a5a7a;">调用次数</div>
            <div class="font-bold text-lg" style="color: #00f0ff;">{{ provider.calls }}</div>
          </div>
          <div class="rounded-lg p-3" style="background: rgba(124,58,237,0.05);">
            <div style="color: #5a5a7a;">Token消耗</div>
            <div class="font-bold text-lg" style="color: #7c3aed;">{{ provider.tokens }}</div>
          </div>
          <div class="rounded-lg p-3" style="background: rgba(255,184,0,0.05);">
            <div style="color: #5a5a7a;">成本(圣点)</div>
            <div class="font-bold text-lg" style="color: #ffb800;">{{ provider.cost }}</div>
          </div>
          <div class="rounded-lg p-3" style="background: rgba(0,255,136,0.05);">
            <div style="color: #5a5a7a;">成功率</div>
            <div class="font-bold text-lg" style="color: #00ff88;">{{ provider.successRate }}%</div>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <button class="flex-1 py-2 rounded-lg text-sm" style="background: rgba(0,240,255,0.08); color: #00f0ff;">
            配置API Key
          </button>
          <button class="flex-1 py-2 rounded-lg text-sm" style="background: rgba(124,58,237,0.08); color: #7c3aed;">
            测试连接
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const providers = ref([
  {
    id: 1,
name: '豆包 (字节跳动)',
    icon: '🫘',
    gradient: 'linear-gradient(135deg, #00f0ff, #0ea5e9)',
    endpoint: 'ark.cn-beijing.volces.com',
    status: 'active',
    calls: '12,458',
    tokens: '3.2M',
    cost: '8,520',
    successRate: '99.2'
  },
  {
    id: 2,
    name: '即梦 (字节AI绘画)',
    icon: '🎨',
    gradient: 'linear-gradient(135deg, #ff00ff, #7c3aed)',
    endpoint: 'jimeng.jianying.com',
    status: 'active',
    calls: '3,256',
    tokens: '0',
    cost: '32,560',
    successRate: '98.5'
  },
  {
    id: 3,
    name: 'OpenAI GPT',
    icon: '🤖',
    gradient: 'linear-gradient(135deg, #00ff88, #10b981)',
    endpoint: 'api.openai.com',
    status: 'inactive',
    calls: '0',
    tokens: '0',
    cost: '0',
    successRate: '0'
  },
  {
    id: 4,
    name: '通义千问 (阿里云)',
    icon: '🦙',
    gradient: 'linear-gradient(135deg, #ffb800, #f59e0b)',
    endpoint: 'dashscope.aliyuncs.com',
    status: 'active',
    calls: '5,892',
    tokens: '1.8M',
    cost: '4,210',
    successRate: '99.8'
  }
])
</script>
