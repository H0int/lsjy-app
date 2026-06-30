<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <button @click="$router.back()" class="flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors">
      <span>←</span><span>返回</span>
    </button>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full mb-4"></div>
      <p class="text-gray-500 dark:text-gray-400">正在生成视频，请稍候...</p>
      <p class="text-sm text-gray-400 mt-2">通常需要30-120秒</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 mb-6 shadow-sm">
        <div class="flex items-start gap-4">
          <div class="text-5xl">🎬</div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">AI视频制作</h1>
              <span class="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Remotion</span>
              <span class="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-500">HyperFrames</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400 mb-3">用代码创作专业视频，支持HTML/React渲染</p>
            <div class="flex items-center gap-4 text-sm">
              <span class="text-gray-400">{{ useCount.toLocaleString() }}次使用</span>
              <span class="font-bold text-amber-500">{{ coinCost }} 圣力/次</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Generation Interface -->
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-sm">
        <h2 class="font-bold text-lg text-gray-900 dark:text-white mb-4">🎬 视频生成</h2>

        <!-- Prompt -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">视频描述</label>
          <textarea
            v-model="prompt"
            rows="4"
            placeholder="描述您想要的视频内容，例如：一段10秒的产品展示动画，包含标题渐入、产品图片展示和字幕效果..."
            class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          ></textarea>
        </div>

        <!-- Parameters -->
        <div class="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">视频时长</label>
            <el-select v-model="duration" placeholder="选择时长" class="w-full">
              <el-option label="5秒" :value="5" />
              <el-option label="10秒" :value="10" />
              <el-option label="15秒" :value="15" />
              <el-option label="30秒" :value="30" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分辨率</label>
            <el-select v-model="resolution" placeholder="选择分辨率" class="w-full">
              <el-option label="720p (1280×720)" value="720p" />
              <el-option label="1080p (1920×1080)" value="1080p" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">渲染引擎</label>
            <el-select v-model="engine" placeholder="选择引擎" class="w-full">
              <el-option label="可灵 AI (API)" value="kling" />
              <el-option label="Remotion (React)" value="remotion" />
              <el-option label="HyperFrames (HTML)" value="hyperframes" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">视频风格</label>
            <el-select v-model="style" placeholder="选择风格" class="w-full">
              <el-option label="科技感" value="tech" />
              <el-option label="商务风" value="business" />
              <el-option label="活力风" value="energetic" />
              <el-option label="简约风" value="minimal" />
              <el-option label="默认" value="default" />
            </el-select>
          </div>
        </div>

        <!-- Generate Button -->
        <button
          @click="generateVideo"
          :disabled="!prompt.trim() || loading"
          class="w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="prompt.trim() ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl' : 'bg-gray-300 dark:bg-gray-600'"
        >
          🎬 生成视频 ({{ coinCost }} 圣力)
        </button>

        <!-- Result -->
        <div v-if="videoUrl" class="mt-6">
          <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-3">生成结果</h3>
          <div class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <video :src="videoUrl" controls class="w-full"></video>
          </div>
          <div class="flex gap-3 mt-4">
            <a :href="videoUrl" download class="flex-1 py-2 px-4 rounded-xl border border-primary text-primary text-center font-medium hover:bg-primary/10 transition-colors">
              下载视频
            </a>
            <button @click="shareVideo" class="flex-1 py-2 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              分享
            </button>
          </div>
        </div>

        <!-- History -->
        <div v-if="history.length" class="mt-8">
          <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-3">历史记录</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div v-for="item in history" :key="item.id" class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <video :src="item.videoUrl" class="w-full aspect-video object-cover"></video>
              <div class="p-2">
                <p class="text-xs text-gray-500 truncate">{{ item.prompt }}</p>
                <p class="text-xs text-gray-400">{{ item.createdAt }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils'

const prompt = ref('')
const duration = ref(5)
const resolution = ref('720p')
const engine = ref('kling')
const style = ref('default')
const loading = ref(false)
const videoUrl = ref('')
const coinCost = ref(20)
const useCount = ref(0)
const route = useRoute()
const toolId = ref<number>(Number(route.params.id) || 11)
const history = ref<any[]>([])

// Load tool info on mount
onMounted(async () => {
  // Try to load tool details from API
  const token = getToken()
  if (token && toolId.value) {
    try {
      const res = await fetch(`/api/v1/ai/tools/${toolId.value}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.data) {
        useCount.value = data.data.usageCount || 0
      }
    } catch {}
  }
})

const generateVideo = async () => {
  if (!prompt.value.trim()) {
    ElMessage.warning('请输入视频描述')
    return
  }

  const token = getToken()
  if (!token) {
    ElMessage.error('请先登录')
    return
  }

  loading.value = true
  videoUrl.value = ''

  try {
    const res = await fetch(`/api/v1/ai/tools/${toolId.value}/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt: prompt.value,
        duration: duration.value,
        resolution: resolution.value,
        style: style.value,
        engine: engine.value
      })
    })

    const data = await res.json()

    if (data.code === 0 && data.data?.videoUrl) {
      videoUrl.value = data.data.videoUrl
      history.value.unshift({
        id: Date.now(),
        videoUrl: data.data.videoUrl,
        prompt: prompt.value,
        createdAt: new Date().toLocaleString()
      })
      useCount.value++
      ElMessage.success(`视频生成成功！消耗${data.data.coinCost}圣力，余额${data.data.balance}`)
    } else if (data.code === 402) {
      ElMessage.error(data.message)
    } else {
      ElMessage.error(data.message || '视频生成失败')
    }
  } catch (err: any) {
    console.error('Generate video error:', err)
    ElMessage.error('视频生成请求失败：' + (err.message || '网络错误'))
  } finally {
    loading.value = false
  }
}

const shareVideo = () => {
  if (navigator.share) {
    navigator.share({ title: 'AI视频制作', url: videoUrl.value })
  } else {
    navigator.clipboard.writeText(videoUrl.value)
    ElMessage.success('链接已复制')
  }
}
</script>
