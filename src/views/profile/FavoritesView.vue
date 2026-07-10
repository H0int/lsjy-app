<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; text-shadow: 0 0 10px var(--cyber-cyan), 0 0 20px rgba(0,240,255,0.25);">
          ⭐ 我的收藏
        </h1>
        <p class="mt-1" style="color: var(--cyber-text-dim); font-size: 13px;">收藏的AI工具，快速访问常用功能</p>
      </div>
      <el-button v-if="favoriteTools.length > 0" @click="goToTools" size="default"
        style="border-color: rgba(0,240,255,0.4); color: var(--cyber-cyan); background: rgba(0,240,255,0.05);">
        🤖 探索更多工具
      </el-button>
    </div>

    <!-- 收藏列表 -->
    <div v-if="favoriteTools.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="tool in favoriteTools" :key="tool.id" class="cyber-fav-card group">
        <div class="cyber-fav-head">
          <span class="cyber-fav-icon">{{ tool.icon || '🤖' }}</span>
          <button @click.stop="removeFavorite(tool.id)" class="cyber-fav-remove" title="取消收藏">
            ★
          </button>
        </div>
        <h3 class="cyber-fav-name">{{ tool.name || '未知工具' }}</h3>
        <p class="cyber-fav-desc">{{ tool.description || '' }}</p>
        <div class="cyber-fav-foot">
          <span class="cyber-fav-cost" :class="tool.isFree ? 'free' : 'paid'">
            {{ tool.isFree ? '免费使用' : `${tool.coinCost} 圣点/次` }}
          </span>
          <router-link :to="`/tools/${tool.id}`" class="cyber-fav-use-btn" @click.stop>
            立即使用 →
          </router-link>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="cyber-empty-state">
      <div class="cyber-empty-icon">⭐</div>
      <p class="cyber-empty-title">暂无收藏工具</p>
      <p class="cyber-empty-desc">在AI工具中心点击工具卡片左上角的 ★ 图标即可收藏</p>
      <el-button @click="goToTools" type="primary" size="large"
        style="margin-top: 20px; background: linear-gradient(135deg, rgba(0,240,255,0.2), rgba(124,58,237,0.2)); border-color: var(--cyber-cyan); color: var(--cyber-cyan);">
        🤖 去发现工具
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToolStore } from '@/stores/tool'

const router = useRouter()
const toolStore = useToolStore()

const FAVORITES_KEY = 'lsjy_favorites'

function getFavoriteIds(): number[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const favoriteTools = computed(() => {
  const ids = getFavoriteIds()
  return toolStore.tools.filter(t => ids.includes(t.id))
})

function removeFavorite(toolId: number) {
  const ids = getFavoriteIds()
  const idx = ids.indexOf(toolId)
  if (idx >= 0) {
    ids.splice(idx, 1)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
  }
}

function goToTools() {
  router.push('/tools')
}

onMounted(() => {
  if (toolStore.tools.length === 0) {
    toolStore.fetchCategories()
    toolStore.fetchTools()
  }
})
</script>

<style scoped>
.cyber-fav-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 14px;
  padding: 18px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.cyber-fav-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);
  opacity: 0.5;
}
.cyber-fav-card:hover {
  border-color: rgba(0,240,255,0.4);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,240,255,0.12);
}
.cyber-fav-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 10px;
}
.cyber-fav-icon { font-size: 30px; }
.cyber-fav-remove {
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cyber-amber);
  opacity: 0.6;
  transition: all 0.2s;
  padding: 2px 4px;
  line-height: 1;
}
.cyber-fav-remove:hover { opacity: 1; transform: scale(1.2); }
.cyber-fav-name {
  font-size: 15px; font-weight: 700;
  color: var(--cyber-text);
  margin-bottom: 4px;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-fav-desc {
  font-size: 12px;
  color: var(--cyber-text-dim);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 36px;
}
.cyber-fav-foot {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(0,240,255,0.08);
}
.cyber-fav-cost { font-size: 13px; font-weight: 600; }
.cyber-fav-cost.free { color: var(--cyber-green); text-shadow: 0 0 6px rgba(0,255,136,0.3); }
.cyber-fav-cost.paid { color: var(--cyber-amber); text-shadow: 0 0 6px rgba(255,184,0,0.3); }
.cyber-fav-use-btn {
  font-size: 12px;
  color: var(--cyber-cyan);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}
.cyber-fav-use-btn:hover { text-shadow: 0 0 8px rgba(0,240,255,0.5); }

.cyber-empty-state {
  text-align: center;
  padding: 80px 20px;
}
.cyber-empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 12px rgba(0,240,255,0.4));
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}
.cyber-empty-title {
  font-size: 18px;
  color: var(--cyber-text);
  margin-bottom: 8px;
  font-weight: 600;
}
.cyber-empty-desc {
  font-size: 13px;
  color: var(--cyber-text-dim);
  max-width: 360px;
  margin: 0 auto;
  line-height: 1.6;
}
</style>
