<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold" style="color: #e0e0ff;">🧠 AI智能体管理</h2>
      <button @click="showCreateDialog = true" class="px-4 py-2 rounded-lg text-sm font-bold"
        style="background: linear-gradient(135deg, #00f0ff, #7c3aed); color: #000;">
        + 新建智能体
      </button>
    </div>

    <!-- 智能体列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="agent in agents" :key="agent.id"
        class="rounded-xl p-5 transition-all hover:-translate-y-1"
        style="background: rgba(13,13,26,0.8); border: 1px solid #1a1a2e;">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-black"
            :style="{ background: `linear-gradient(135deg, ${agent.color1}, ${agent.color2})` }">
            {{ agent.icon }}
          </div>
          <div>
            <div class="font-bold text-sm" style="color: #e0e0ff;">{{ agent.name }}</div>
            <div class="text-xs" style="color: #5a5a7a;">{{ agent.model }}</div>
          </div>
          <span class="ml-auto px-2 py-0.5 rounded text-xs"
            :style="agent.status === 'active'
              ? 'background: rgba(0,255,136,0.1); color: #00ff88;'
              : 'background: rgba(255,68,68,0.1); color: #ff4444;'">
            {{ agent.status === 'active' ? '运行中' : '已停用' }}
          </span>
        </div>
        <p class="text-xs mb-3" style="color: #8888aa;">{{ agent.description }}</p>
        <div class="flex items-center justify-between text-xs" style="color: #5a5a7a;">
          <span>对话 {{ agent.chatCount }} 次</span>
          <span>用户 {{ agent.userCount }} 人</span>
        </div>
        <div class="flex gap-2 mt-3 pt-3" style="border-top: 1px solid #1a1a2e;">
          <button class="flex-1 py-1.5 rounded text-xs" style="background: rgba(0,240,255,0.08); color: #00f0ff;">编辑</button>
          <button class="flex-1 py-1.5 rounded text-xs" :style="agent.status === 'active'
            ? 'background: rgba(255,68,68,0.08); color: #ff4444;'
            : 'background: rgba(0,255,136,0.08); color: #00ff88;'">
            {{ agent.status === 'active' ? '停用' : '启用' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 新建对话框 -->
    <div v-if="showCreateDialog" class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(0,0,0,0.7);">
      <div class="w-full max-w-lg mx-4 rounded-xl p-6" style="background: #12121f; border: 1px solid #1a1a2e;">
