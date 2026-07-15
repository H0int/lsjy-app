<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 返回按钮 -->
    <div class="mb-4">
      <router-link to="/tools" class="text-sm flex items-center gap-1 hover:underline" style="color:#00f0ff;">
        ← 返回AI工具中心
      </router-link>
    </div>

    <!-- 技能概览 -->
    <div class="rounded-xl p-6 mb-6" style="background:#1a1a2eee;border:1px solid #00f0ff25;">
      <div class="flex items-center gap-4 mb-4">
        <span class="text-4xl">{{ skillMeta.icon }}</span>
        <div>
          <h1 class="text-2xl font-bold" style="color:#00f0ff;">{{ skillMeta.displayName }}</h1>
          <p class="text-sm mt-1" style="color:#808099;">{{ skillMeta.description }}</p>
        </div>
      </div>
      <div class="flex gap-4 flex-wrap">
        <div class="cyber-stat-card">
          <span class="text-2xl font-bold" style="color:#00f0ff;">{{ matchedTools.length }}</span>
          <span class="text-xs" style="color:#808099;">平台匹配工具</span>
        </div>
        <div class="cyber-stat-card">
          <span class="text-2xl font-bold" style="color:#00ff88;">{{ matchedTools.filter(t => t.isFree).length }}</span>
          <span class="text-xs" style="color:#808099;">免费可用</span>
        </div>
        <div class="cyber-stat-card">
          <span class="text-2xl font-bold" style="color:#f59e0b;">{{ matchedTools.filter(t => !t.isFree).length }}</span>
          <span class="text-xs" style="color:#808099;">圣力付费</span>
        </div>
        <div class="cyber-stat-card">
          <span class="text-2xl font-bold" style="color:#c084fc;">{{ totalUsage }}</span>
          <span class="text-xs" style="color:#808099;">累计使用次数</span>
        </div>
      </div>
    </div>

    <!-- 分类分布分析 -->
    <div class="rounded-xl p-6 mb-6" style="background:#1a1a2eee;border:1px solid #00f0ff25;">
      <h2 class="text-lg font-bold mb-4" style="color:#e0e0ff;">工具分类分布</h2>
      <div class="flex flex-wrap gap-3">
        <div v-for="cat in categoryStats" :key="cat.name" class="flex-1 min-w-[120px] rounded-lg p-4 text-center" style="background:#0f0f1a;border:1px solid #00f0ff15;">
          <div class="text-2xl font-bold" style="color:#00f0ff;">{{ cat.count }}</div>
          <div class="text-xs mt-1" style="color:#808099;">{{ cat.name }}</div>
        </div>
      </div>
    </div>

    <!-- 匹配工具列表 -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-bold" style="color:#e0e0ff;">匹配工具列表（共 {{ matchedTools.length }} 个）</h2>
      <el-input v-model="searchKeyword" placeholder="搜索工具..." size="small" clearable style="width:200px;" />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="cyber-spinner"></div>
    </div>

    <!-- 工具网格 -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <router-link v-for="tool in filteredTools" :key="tool.id" :to="`/tools/${tool.id}`"
        class="rounded-xl p-4 transition-all hover:scale-[1.02] cursor-pointer"
        style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-2xl">{{ tool.icon || '🔧' }}</span>
            <div>
              <h3 class="font-bold text-sm" style="color:#e0e0ff;">{{ tool.name }}</h3>
            </div>
          </div>
          <span class="text-xs px-2 py-0.5 rounded" :style="tool.isFree ? 'background:#00ff8820;color:#00ff88;' : 'background:#f59e0b20;color:#f59e0b;'">
            {{ tool.isFree ? '免费' : `${tool.coinCost || 50}圣力` }}
          </span>
        </div>
        <p class="text-xs mb-3 line-clamp-2" style="color:#808099;">{{ tool.description }}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs" style="color:#606080;">{{ tool.usageCount || 0 }}次使用</span>
          <span class="text-xs px-2 py-0.5 rounded" style="background:#00f0ff15;color:#00f0ff;">
            {{ toolTypeLabel(tool.toolType) }}
          </span>
        </div>
      </router-link>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredTools.length === 0" class="text-center py-20" style="color:#808099;">
      <div class="text-4xl mb-4">📭</div>
      <p>未找到匹配的工具</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toolApi } from '@/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const skillName = (route.query.skill as string) || 'crawl4ai'

const skillMetaMap: Record<string, { icon: string; displayName: string; description: string; keywords: string[] }> = {
  crawl4ai: {
    icon: '🕷️', displayName: 'AI网页爬虫',
    description: '输入URL自动爬取网页内容，输出LLM友好的Markdown格式。平台已为你匹配以下AI工具，可直接使用。',
    keywords: ['数据', '分析', '搜索', '信息', '采集', '爬虫', '网页', '提取', '抓取', '情报', '收集', '检索', '调查', '挖掘'],
  },
  whisper: {
    icon: '🎙️', displayName: 'AI语音识别',
    description: '语音转文字，支持中文、英文、日文等99+语言。平台已为你匹配以下AI工具，可直接使用。',
    keywords: ['语音', '音', '翻译', '音乐', '声音', '音频', '转', '听', '说', '录', '播', '朗读', '配音', '歌词'],
  },
  tabby: {
    icon: '💻', displayName: 'AI编程助手',
    description: '代码智能补全与解释，支持多语言开发。平台已为你匹配以下AI工具，可直接使用。',
    keywords: ['代码', '编程', '程序', '开发', 'API', '调试', '测试', '后端', '前端', '工程师', '架构', '审查', '自动化', '部署'],
  },
}

const skillMeta = skillMetaMap[skillName] || skillMetaMap.crawl4ai

const loading = ref(false)
const allTools = ref<any[]>([])
const searchKeyword = ref('')

const matchedTools = computed(() => {
  const keywords = skillMeta.keywords
  return allTools.value.filter(t => {
    const name = (t.name || '').toLowerCase()
    const desc = (t.description || '').toLowerCase()
    return keywords.some(kw =>
      name.includes(kw.toLowerCase()) ||
      desc.includes(kw.toLowerCase())
    )
  })
})

const filteredTools = computed(() => {
  if (!searchKeyword.value) return matchedTools.value
  const kw = searchKeyword.value.toLowerCase()
  return matchedTools.value.filter(t =>
    t.name.toLowerCase().includes(kw) ||
    (t.description || '').toLowerCase().includes(kw)
  )
})

const categoryStats = computed(() => {
  const map = new Map<string, number>()
  for (const t of matchedTools.value) {
    const cat = t.categoryName || t.toolType || '通用'
    map.set(cat, (map.get(cat) || 0) + 1)
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }))
})

const totalUsage = computed(() => matchedTools.value.reduce((sum: number, t: any) => sum + (t.usageCount || 0), 0))

function toolTypeLabel(type: string) {
  return { text: '文本', image: '图片', video: '视频', audio: '音频', code: '代码', data: '数据', agent: '智能体' }[type] || type || '通用'
}

async function loadTools() {
  loading.value = true
  try {
    const res = await toolApi.getTools({ page: 1, pageSize: 500 })
    allTools.value = (res.data?.items || res.data?.list || [])
  } catch (e: any) {
    ElMessage.error('加载工具列表失败')
    allTools.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTools()
})
</script>

<style scoped>
.cyber-spinner {
  width: 40px; height: 40px;
  border: 3px solid #00f0ff20;
  border-top-color: #00f0ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.cyber-stat-card {
  background: #0f0f1a;
  border: 1px solid #00f0ff15;
  border-radius: 12px;
  padding: 16px 24px;
  text-align: center;
  min-width: 120px;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>