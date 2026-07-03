<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
      <span style="color: var(--cyber-cyan);">▍</span>收藏工具
    </h1>
    <div class="cyber-card p-8 text-center">
      <div class="text-4xl mb-4">⭐</div>
      <p style="color: var(--cyber-text-dim);">您收藏的AI工具将在这里展示</p>
      <router-link to="/tools" class="inline-block mt-4 px-6 py-2 rounded-lg text-sm font-medium"
        style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.3);">
        浏览工具中心
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
