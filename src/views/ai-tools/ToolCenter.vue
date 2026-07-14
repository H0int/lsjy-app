<template>
  <div class="max-w-7xl mx-auto px-4 py-6 cyber-tools">
    <!-- 顶部区域 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold cyber-glow-text" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">
          🤖 AI工具中心
        </h1>
        <p class="cyber-sub-text mt-1">专业AI工具集，覆盖多种业务场景 · 共 <span class="cyber-cyan-text">{{ totalCount }}</span> 个工具</p>
      </div>
      <!-- 搜索框 -->
      <div class="flex items-center gap-3">
        <el-input v-model="searchQuery" placeholder="搜索工具..." size="large" clearable class="w-64"
          prefix-icon="Search" />
        <el-button-group>
          <el-button :type="viewMode === 'grid' ? 'primary' : ''" @click="viewMode = 'grid'">▦</el-button>
          <el-button :type="viewMode === 'list' ? 'primary' : ''" @click="viewMode = 'list'">☰</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 一级分类标签 -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button v-for="cat in categoryList" :key="cat.id ?? 'all'"
        @click="selectCategory(cat.id)"
        class="cyber-cat-btn"
        :class="{ active: currentCategoryId === cat.id }">
        <span class="cat-icon">{{ cat.icon }}</span>
        <span>{{ cat.label }}</span>
        <span v-if="cat.count !== undefined" class="cat-count">({{ cat.count }})</span>
      </button>
    </div>

    <!-- 二级子分类标签 -->
    <div v-if="subCategories.length > 0" class="flex flex-wrap gap-2 mb-6 pl-3 cyber-sub-border">
      <button v-for="sub in subCategories" :key="sub.value"
        @click="selectSubCategory(sub.value)"
        class="cyber-sub-btn"
        :class="{ active: currentSubCategory === sub.value }">
        {{ sub.label }}
      </button>
    </div>

    <!-- 开源AI技能区 -->
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-lg">🔧</span>
        <h2 class="text-lg font-bold cyber-glow-text" style="color: var(--cyber-cyan);">开源AI技能</h2>
        <span class="text-xs text-gray-400">Docker独立部署 · 永久免费</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="skill in skillsList" :key="skill.name" class="cyber-skill-card" :class="{ 'opacity-60': !skill.available }" @click="skill.available && openSkill(skill)">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">{{ skill.icon }}</span>
            <div>
              <h3 class="font-bold text-sm">{{ skill.displayName }}</h3>
              <span class="text-xs px-1.5 py-0.5 rounded" :class="skill.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">{{ skill.available ? '运行中' : '未就绪' }}</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ skill.description }}</p>
          <div class="mt-2 flex gap-2">
            <el-tag size="small" type="success">免费</el-tag>
            <el-tag size="small" type="info">{{ skill.tag }}</el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="toolStore.loading" class="flex justify-center py-20">
      <div class="cyber-spinner"></div>
    </div>

    <!-- 工具统计 -->
    <div v-if="!toolStore.loading" class="flex items-center gap-4 mb-4 text-sm cyber-stat-row">
      <span>共 <strong class="cyber-cyan-text">{{ filteredTools.length }}</strong> 个工具</span>
      <span v-if="searchQuery" class="cyber-amber-text">搜索: "{{ searchQuery }}"</span>
      <div class="flex gap-1">
        <span v-for="tag in popularTags" :key="tag"
          @click="selectTag(tag)"
          class="cyber-tag-hot"
          :class="{ active: currentTag === tag }">🔥{{ tag }}</span>
      </div>
    </div>

    <!-- 网格视图 -->
    <div v-if="!toolStore.loading && viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <router-link v-for="tool in filteredTools" :key="tool.id" :to="`/tools/${tool.id}`"
        class="cyber-tool-card group">
        <button @click="toggleFavorite(tool.id, $event)" class="cyber-fav-btn" :class="{ active: favoriteToolIds.has(tool.id) }" title="收藏">
          ★
        </button>
        <div class="cyber-tool-tags">
          <span v-for="tag in tool.tags?.slice(0, 2)" :key="tag" class="cyber-tool-tag">{{ tag }}</span>
        </div>
        <div class="cyber-tool-head">
          <span class="cyber-tool-icon">{{ tool.icon }}</span>
          <div class="flex gap-1">
            <span v-if="tool.isFree" class="cyber-badge cyber-badge-green">免费</span>
            <span class="cyber-badge cyber-badge-cyan">{{ toolTypeLabel(tool.toolType) }}</span>
          </div>
        </div>
        <h3 class="cyber-tool-name">{{ tool.name }}</h3>
        <p class="cyber-tool-desc">{{ tool.description }}</p>
        <div class="cyber-tool-foot">
          <span class="cyber-cost" :class="tool.isFree ? 'cyber-cost-free' : 'cyber-cost-paid'">
            {{ tool.isFree ? '免费使用' : `${tool.coinCost} 圣点/次` }}
          </span>
          <span class="cyber-use-count">{{ formatUseCount(tool.usageCount) }}次使用</span>
        </div>
      </router-link>
    </div>

    <!-- 列表视图 -->
    <div v-else-if="!toolStore.loading" class="space-y-3">
      <router-link v-for="tool in filteredTools" :key="tool.id" :to="`/tools/${tool.id}`"
        class="cyber-tool-list-row">
        <button @click="toggleFavorite(tool.id, $event)" class="cyber-fav-btn-list" :class="{ active: favoriteToolIds.has(tool.id) }" title="收藏">
          ★
        </button>
        <span class="cyber-tool-icon">{{ tool.icon }}</span>
        <div class="cyber-list-info">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="cyber-tool-name">{{ tool.name }}</h3>
            <span v-for="tag in tool.tags?.slice(0, 2)" :key="tag" class="cyber-tool-tag">{{ tag }}</span>
            <span class="cyber-badge cyber-badge-cyan">{{ toolTypeLabel(tool.toolType) }}</span>
          </div>
          <p class="cyber-tool-desc truncate mt-1">{{ tool.description }}</p>
        </div>
        <div class="cyber-list-right">
          <div class="cyber-cost" :class="tool.isFree ? 'cyber-cost-free' : 'cyber-cost-paid'">
            {{ tool.isFree ? '免费' : `${tool.coinCost} 圣点` }}
          </div>
          <div class="cyber-use-count">{{ formatUseCount(tool.usageCount) }}次使用</div>
        </div>
      </router-link>
    </div>

    <!-- 空状态 -->
    <div v-if="!toolStore.loading && filteredTools.length === 0" class="cyber-empty">
      <div class="cyber-empty-icon">🔍</div>
      <p class="cyber-empty-text">未找到相关工具</p>
      <button @click="resetFilters" class="cyber-clear-btn">清除筛选条件</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToolStore } from '@/stores/tool'
import type { Tool } from '@/types'
import { toolTypeMap } from '@/utils'


// 收藏功能 - 使用 localStorage
const FAVORITES_KEY = 'lsjy_favorites'

function getFavorites(): number[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveFavorites(ids: number[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
}

const favoriteToolIds = ref<Set<number>>(new Set(getFavorites()))

function toggleFavorite(toolId: number, e: Event) {
  e.preventDefault()
  e.stopPropagation()
  const favs = getFavorites()
  const idx = favs.indexOf(toolId)
  if (idx >= 0) {
    favs.splice(idx, 1)
    favoriteToolIds.value.delete(toolId)
  } else {
    favs.push(toolId)
    favoriteToolIds.value.add(toolId)
  }
  saveFavorites(favs)
}

const toolStore = useToolStore()
const searchQuery = ref('')
const currentCategoryId = ref<number | null>(null)
const currentSubCategory = ref<string>('')
const currentTag = ref('')
const viewMode = ref<'grid' | 'list'>('grid')

const popularTags = ['热门', '免费']

const subCategoryIconMap: Record<string, string> = {
  内容策划: '💡',
  文案撰写: '✍️',
  视频脚本: '📝',
  直播运营: '📺',
  视觉设计: '🖼️',
  账号运营: '📱',
  数据复盘: '📈',
  变现指导: '💎',
  对话聊天: '💬',
  AI绘画: '🎨',
  AI视频: '🎬',
  AI音频: '🎙️',
  编程开发: '💻',
  知识库: '🧠',
  效率自动化: '⚙️',
  合规法务: '📑',
  财务分析: '📊',
  商业策划: '🚀',
  商品运营: '🏷️',
  店铺管理: '🏪',
  直播带货: '🔴',
  客服售后: '💬',
  供应链: '🚚',
  跨境电商: '🌍',
  学科辅导: '📖',
  考试备考: '📝',
  语言学习: '🗣️',
  素质教育: '🎨',
  职业教育: '💼',
  教学方案: '👨‍🏫',
  学习方法: '🧠',
  宠物健康: '🏥',
  宠物喂养: '🍖',
  宠物训练: '🐶',
  宠物用品: '🛍️',
  行为纠正: '🔍',
  术后护理: '🏥',
  宠物商业: '🏪',
  宠物内容: '🎬',
  养宠指导: '🐾',
  校园生活: '🏫',
  校园活动: '🎪',
  社团运营: '📣',
  校园安全: '🛡️',
  职业启蒙: '🧭',
  校园公文: '📌',
  班级管理: '👥',
  心理支持: '🌱',
}

const totalCount = computed(() => toolStore.total)

const categoryList = computed(() => {
  const countByCategory = (id: number) => {
    // 图片生成(id=9)和视频生成(id=10)按toolType计数
    if (id === 9) return toolStore.tools.filter(t => t.toolType === 'image').length
    if (id === 10) return toolStore.tools.filter(t => t.toolType === 'video').length
    return toolStore.tools.filter(t => Number(t.categoryId) === Number(id)).length
  }
  const cats = [
    { id: null, label: '全部工具', icon: '📦', count: totalCount.value },
    ...toolStore.categories.map(c => ({ id: c.id, label: c.name, icon: c.icon || '📁', count: countByCategory(c.id) }))
  ]
  return cats
})

function toolsByCategory(catId: number) {
  if (catId === 9) return toolStore.tools.filter(t => t.toolType === 'image')
  if (catId === 10) return toolStore.tools.filter(t => t.toolType === 'video')
  return toolStore.tools.filter(t => Number(t.categoryId) === Number(catId))
}

const subCategories = computed(() => {
  if (!currentCategoryId.value) return []
  const names = Array.from(new Set(
    toolsByCategory(currentCategoryId.value)
      .map(t => String(t.subCategory || '').trim())
      .filter(Boolean)
  ))
  return [
    { label: '全部', value: '' },
    ...names.map(name => ({
      label: `${subCategoryIconMap[name] || '🔹'} ${name}`,
      value: name,
    }))
  ]
})

const filteredTools = computed(() => {
  let list = toolStore.tools
  // 按分类筛选
  if (currentCategoryId.value) {
    const catId = currentCategoryId.value
    // 图片生成(id=9)和视频生成(id=10)按toolType筛选
    if (catId === 9) {
      list = list.filter(t => t.toolType === 'image')
    } else if (catId === 10) {
      list = list.filter(t => t.toolType === 'video')
    } else {
      list = list.filter(t => Number(t.categoryId) === Number(catId))
    }
  }
  // 按二级小框架筛选，使用后端真实 subCategory 精确匹配
  if (currentSubCategory.value) {
    list = list.filter(t => String(t.subCategory || '').trim() === currentSubCategory.value)
  }
  // 热门/免费筛选
  if (currentTag.value === '热门') {
    list = list.filter(t => Boolean((t as any).isHot))
  } else if (currentTag.value === '免费') {
    list = list.filter(t => Boolean(t.isFree))
  }
  // 搜索筛选
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description?.toLowerCase().includes(q)) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    )
  }
  return list
})

function toolTypeLabel(type: string): string {
  return toolTypeMap[type] || type
}

function formatUseCount(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1) + '万'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return String(count)
}

function selectCategory(catId: number | null) {
  currentCategoryId.value = catId
  currentSubCategory.value = ''
}

function selectSubCategory(sub: string) {
  currentSubCategory.value = sub
}

function selectTag(tag: string) {
  currentTag.value = currentTag.value === tag ? '' : tag
}

function resetFilters() {
  searchQuery.value = ''
  currentCategoryId.value = null
  currentSubCategory.value = ''
  currentTag.value = ''
}

// ===== 开源技能 =====
import { skillsApi } from '@/api'
import { ElMessage } from 'element-plus'

const skillsList = ref([
  { name: 'crawl4ai', displayName: 'AI网页爬虫', icon: '🕷️', available: false, description: '输入URL自动爬取网页内容，输出LLM友好的Markdown格式', tag: '数据采集' },
  { name: 'whisper', displayName: 'AI语音识别', icon: '🎙️', available: false, description: '语音转文字，支持中文、英文、日文等99+语言', tag: '语音处理' },
  { name: 'tabby', displayName: 'AI编程助手', icon: '💻', available: false, description: '代码智能补全与解释，支持VSCode/JetBrains插件', tag: '代码开发' },
])

async function loadSkillsStatus() {
  // 优先通过后端API获取（含认证）；失败则直接探测Nginx代理的健康端点
  try {
    const res = await skillsApi.getStatus()
    if (res.code === 0 && Array.isArray(res.data)) {
      for (const s of res.data) {
        const found = skillsList.value.find(x => x.name === s.name)
        if (found) {
          found.available = s.available
          found.displayName = s.displayName
          found.description = s.description
        }
      }
      return
    }
  } catch { /* 后端API不可用，降级到直接探测 */ }

  // 降级：直接探测各服务的Nginx代理路径
  const probes = [
    { name: 'crawl4ai', path: '/api/v1/skills/crawl/' },
    { name: 'whisper', path: '/api/v1/skills/whisper/' },
    { name: 'tabby', path: '/api/v1/skills/tabby/' },
  ]
  const results = await Promise.allSettled(
    probes.map(async (p) => {
      try {
        const ctrl = new AbortController()
        const timeout = setTimeout(() => ctrl.abort(), 3000)
        const r = await fetch(p.path, { method: 'OPTIONS', signal: ctrl.signal })
        clearTimeout(timeout)
        return { name: p.name, available: r.ok || r.status === 405 || r.status === 404 }
      } catch { return { name: p.name, available: false } }
    })
  )
  for (const r of results) {
    if (r.status === 'fulfilled') {
      const found = skillsList.value.find(x => x.name === r.value.name)
      if (found) found.available = r.value.available
    }
  }
}

function openSkill(skill: any) {
  if (skill.name === 'crawl4ai') {
    ElMessage.info('网页爬虫功能开发中，请通过API调用')
  } else if (skill.name === 'whisper') {
    ElMessage.info('语音识别功能开发中，请通过API调用')
  } else if (skill.name === 'tabby') {
    ElMessage.info('编程助手功能开发中，请通过API调用')
  }
}

onMounted(() => {
  toolStore.fetchCategories()
  toolStore.fetchTools()
  loadSkillsStatus()
})
</script>

<style scoped>
.cyber-tools { position: relative; }
.cyber-glow-text { text-shadow: 0 0 10px var(--cyber-cyan), 0 0 20px rgba(0,240,255,0.25); }
.cyber-sub-text { color: var(--cyber-text-dim); font-size: 13px; }
.cyber-cyan-text { color: var(--cyber-cyan); text-shadow: 0 0 6px rgba(0,240,255,0.4); }
.cyber-amber-text { color: var(--cyber-amber); }

/* 一级分类按钮 */
.cyber-cat-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px; font-weight: 500;
  background: rgba(13,13,40,0.6);
  border: 1px solid rgba(0,240,255,0.15);
  color: var(--cyber-text-dim);
  cursor: pointer;
  transition: all 0.25s;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-cat-btn:hover {
  border-color: rgba(0,240,255,0.4);
  color: var(--cyber-cyan);
  background: rgba(0,240,255,0.05);
}
.cyber-cat-btn.active {
  background: linear-gradient(135deg, rgba(0,240,255,0.18), rgba(124,58,237,0.18));
  border-color: var(--cyber-cyan);
  color: var(--cyber-cyan);
  box-shadow: 0 0 12px rgba(0,240,255,0.25);
  text-shadow: 0 0 6px rgba(0,240,255,0.5);
}
.cat-icon { font-size: 14px; }
.cat-count { opacity: 0.7; font-size: 11px; }

/* 二级子分类 */
.cyber-sub-border { border-left: 3px solid rgba(0,240,255,0.3); }
.cyber-sub-btn {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(0,240,255,0.03);
  border: 1px solid rgba(0,240,255,0.1);
  color: var(--cyber-text-dim);
  cursor: pointer;
  transition: all 0.2s;
}
.cyber-sub-btn:hover { color: var(--cyber-cyan); border-color: rgba(0,240,255,0.3); }
.cyber-sub-btn.active {
  background: rgba(0,240,255,0.12);
  border-color: var(--cyber-cyan);
  color: var(--cyber-cyan);
}

/* 加载器 */
.cyber-spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(0,240,255,0.15);
  border-top-color: var(--cyber-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  box-shadow: 0 0 12px rgba(0,240,255,0.3);
}
@keyframes spin { to { transform: rotate(360deg); } }

.cyber-stat-row { color: var(--cyber-text-dim); font-size: 13px; }
.cyber-tag-hot {
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(255,140,0,0.1);
  color: var(--cyber-amber);
  font-size: 11px;
  border: 1px solid rgba(255,140,0,0.2);
}
.cyber-tag-hot:hover { background: rgba(255,140,0,0.2); }

/* 工具卡片 */
.cyber-tool-card {
  display: block;
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 14px;
  padding: 18px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.cyber-tool-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);
  opacity: 0.5;
}
.cyber-tool-card:hover {
  border-color: rgba(0,240,255,0.4);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,240,255,0.12);
}
.cyber-tool-tags {
  position: absolute;
  top: 8px; right: 8px;
  display: flex; gap: 4px;
}
.cyber-tool-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255,0,255,0.1);
  color: var(--cyber-magenta);
  border: 1px solid rgba(255,0,255,0.25);
  font-weight: 500;
}
.cyber-tool-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 10px;
}
.cyber-tool-icon { font-size: 30px; transition: transform 0.3s; }
.cyber-tool-card:hover .cyber-tool-icon { transform: scale(1.1); filter: drop-shadow(0 0 8px rgba(0,240,255,0.4)); }

.cyber-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}
.cyber-badge-green { background: rgba(0,255,136,0.12); color: var(--cyber-green); border: 1px solid rgba(0,255,136,0.3); }
.cyber-badge-cyan { background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.3); }

.cyber-tool-name {
  font-size: 15px; font-weight: 700;
  color: var(--cyber-text);
  margin-bottom: 4px;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-tool-desc {
  font-size: 12px;
  color: var(--cyber-text-dim);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 36px;
}
.cyber-tool-foot {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(0,240,255,0.08);
}
.cyber-cost { font-size: 13px; font-weight: 600; }
.cyber-cost-free { color: var(--cyber-green); text-shadow: 0 0 6px rgba(0,255,136,0.3); }
.cyber-cost-paid { color: var(--cyber-amber); text-shadow: 0 0 6px rgba(255,184,0,0.3); }
.cyber-use-count { font-size: 11px; color: var(--cyber-text-dim); }

/* 列表视图 */
.cyber-tool-list-row {
  display: flex; align-items: center; gap: 16px;
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 12px;
  padding: 14px 18px;
  transition: all 0.25s;
}
.cyber-tool-list-row:hover {
  border-color: rgba(0,240,255,0.4);
  box-shadow: 0 4px 16px rgba(0,240,255,0.1);
}
.cyber-tool-list-row .cyber-tool-icon { font-size: 28px; width: 44px; text-align: center; flex-shrink: 0; }
.cyber-list-info { flex: 1; min-width: 0; }
.cyber-list-info .cyber-tool-name { margin-bottom: 0; }
.cyber-list-right { text-align: right; flex-shrink: 0; }
.cyber-list-right .cyber-use-count { margin-top: 4px; }

/* 空状态 */
.cyber-empty { text-align: center; padding: 80px 20px; }
.cyber-empty-icon { font-size: 56px; margin-bottom: 16px; filter: drop-shadow(0 0 12px rgba(0,240,255,0.4)); }
.cyber-empty-text { color: var(--cyber-text-dim); margin-bottom: 12px; font-size: 14px; }
.cyber-clear-btn {
  background: transparent;
  border: 1px solid rgba(0,240,255,0.4);
  color: var(--cyber-cyan);
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-clear-btn:hover { background: rgba(0,240,255,0.1); box-shadow: 0 0 12px rgba(0,240,255,0.3); }

/* 搜索框样式覆盖 */
:deep(.el-input__wrapper) {
  background-color: rgba(0,240,255,0.03) !important;
  box-shadow: 0 0 0 1px rgba(0,240,255,0.2) inset !important;
  border-radius: 10px !important;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(0,240,255,0.4) inset !important;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--cyber-cyan) inset, 0 0 12px rgba(0,240,255,0.15) !important;
}
:deep(.el-input__inner) { color: var(--cyber-text) !important; }
:deep(.el-input__inner::placeholder) { color: var(--cyber-text-dim) !important; }
:deep(.el-input__prefix .el-icon) { color: var(--cyber-cyan) !important; }

/* 收藏按钮 - 网格视图 */
.cyber-fav-btn {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  font-size: 18px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  padding: 4px 6px;
  line-height: 1;
  transition: all 0.25s;
  backdrop-filter: blur(4px);
}
.cyber-fav-btn:hover {
  color: var(--cyber-amber);
  border-color: rgba(255,184,0,0.4);
  background: rgba(255,184,0,0.1);
  transform: scale(1.15);
}
.cyber-fav-btn.active {
  color: var(--cyber-amber);
  border-color: rgba(255,184,0,0.5);
  background: rgba(255,184,0,0.15);
  text-shadow: 0 0 8px rgba(255,184,0,0.5);
}

/* 收藏按钮 - 列表视图 */
.cyber-fav-btn-list {
  font-size: 16px;
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  padding: 4px 6px;
  line-height: 1;
  transition: all 0.25s;
  flex-shrink: 0;
}
.cyber-fav-btn-list:hover {
  color: var(--cyber-amber);
  border-color: rgba(255,184,0,0.4);
}
.cyber-fav-btn-list.active {
  color: var(--cyber-amber);
  border-color: rgba(255,184,0,0.5);
  text-shadow: 0 0 8px rgba(255,184,0,0.5);
}

/* 开源技能卡片 */
.cyber-skill-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 14px;
  padding: 16px;
  transition: all 0.3s;
  cursor: pointer;
}
.cyber-skill-card:hover {
  border-color: rgba(0,240,255,0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,240,255,0.1);
}
</style>
