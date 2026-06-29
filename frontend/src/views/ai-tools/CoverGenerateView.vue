<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <button @click="$router.back()" class="flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors">
      <span>←</span><span>返回</span>
    </button>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full mb-4"></div>
      <p class="text-gray-500 dark:text-gray-400">正在生成封面，请稍候...</p>
      <p class="text-sm text-gray-400 mt-2">通常需要5-15秒</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 mb-6 shadow-sm">
        <div class="flex items-start gap-4">
          <div class="text-5xl">🖼️</div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">AI封面生成</h1>
              <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">免费</span>
              <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-500">FreeImageGen</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400 mb-3">小红书封面、知识卡片、文章配图，免费本地生成</p>
            <div class="flex items-center gap-4 text-sm">
              <span class="text-gray-400">{{ useCount.toLocaleString() }}次使用</span>
              <span class="font-bold text-green-500">免费</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cover Generation Interface -->
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-sm">
        <h2 class="font-bold text-lg text-gray-900 dark:text-white mb-4">🖼️ 封面生成</h2>

        <!-- Cover Type -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">封面类型</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              v-for="type in coverTypes"
              :key="type.value"
              @click="coverType = type.value"
              class="p-3 rounded-xl border-2 transition-all text-center"
              :class="coverType === type.value ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'"
            >
              <div class="text-2xl mb-1">{{ type.icon }}</div>
              <div class="text-xs text-gray-700 dark:text-gray-300">{{ type.label }}</div>
            </button>
          </div>
        </div>

        <!-- Title -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标题文字</label>
          <input
            v-model="title"
            type="text"
            placeholder="输入封面标题，例如：5个提高效率的AI工具"
            class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <!-- Subtitle -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">副标题（可选）</label>
          <input
            v-model="subtitle"
            type="text"
            placeholder="输入副标题或描述"
            class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <!-- Parameters -->
        <div class="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">尺寸</label>
            <el-select v-model="size" placeholder="选择尺寸" class="w-full">
              <el-option label="小红书封面 (1080×1440)" value="1080x1440" />
              <el-option label="公众号封面 (900×383)" value="900x383" />
              <el-option label="方形 (1080×1080)" value="1080x1080" />
              <el-option label="横版 (1920×1080)" value="1920x1080" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">配色方案</label>
            <el-select v-model="colorScheme" placeholder="选择配色" class="w-full">
              <el-option label="渐变蓝紫" value="gradient-purple" />
              <el-option label="暖橙色调" value="warm-orange" />
              <el-option label="清新绿色" value="fresh-green" />
              <el-option label="商务蓝" value="business-blue" />
              <el-option label="暗黑风" value="dark" />
              <el-option label="简约白" value="minimal-white" />
            </el-select>
          </div>
        </div>

        <!-- Generate Button -->
        <button
          @click="generateCover"
          :disabled="!title.trim() || loading"
          class="w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="title.trim() ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg hover:shadow-xl' : 'bg-gray-300 dark:bg-gray-600'"
        >
          🖼️ 生成封面（免费）
        </button>

        <!-- Result -->
        <div v-if="imageUrl" class="mt-6">
          <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-3">生成结果</h3>
          <div class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <img :src="imageUrl" :alt="title" class="w-full" />
          </div>
          <div class="flex gap-3 mt-4">
            <a :href="imageUrl" download class="flex-1 py-2 px-4 rounded-xl border border-primary text-primary text-center font-medium hover:bg-primary/10 transition-colors">
              下载图片
            </a>
            <button @click="shareImage" class="flex-1 py-2 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              分享
            </button>
          </div>
        </div>

        <!-- History -->
        <div v-if="history.length" class="mt-8">
          <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-3">历史记录</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div v-for="item in history" :key="item.id" class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img :src="item.imageUrl" :alt="item.title" class="w-full aspect-video object-cover" />
              <div class="p-2">
                <p class="text-xs text-gray-500 truncate">{{ item.title }}</p>
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils'

const coverTypes = [
  { value: 'xiaohongshu', label: '小红书封面', icon: '📕' },
  { value: 'knowledge', label: '知识卡片', icon: '💡' },
  { value: 'article', label: '文章配图', icon: '📝' },
  { value: 'custom', label: '自定义', icon: '🎨' }
]

const coverType = ref('xiaohongshu')
const title = ref('')
const subtitle = ref('')
const size = ref('1080x1440')
const colorScheme = ref('gradient-purple')
const loading = ref(false)
const imageUrl = ref('')
const useCount = ref(0)
const history = ref<any[]>([])

const generateCover = async () => {
  if (!title.value.trim()) {
    ElMessage.warning('请输入标题文字')
    return
  }

  const token = getToken()
  if (!token) {
    ElMessage.error('请先登录')
    return
  }

  loading.value = true
  imageUrl.value = ''

  try {
    // Parse size
    const [width, height] = size.value.split('x').map(Number)

    const res = await fetch('https://api.lsjyapp.cn/api/v1/ai/tools/12/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt: `${coverType.value}风格封面，标题：${title.value}${subtitle.value ? '，副标题：' + subtitle.value : ''}`,
        width,
        height,
        style: colorScheme.value,
        type: coverType.value
      })
    })

    const data = await res.json()

    if (data.code === 0 && data.data?.urls?.[0]) {
      imageUrl.value = data.data.urls[0]
      history.value.unshift({
        id: Date.now(),
        imageUrl: data.data.urls[0],
        title: title.value,
        createdAt: new Date().toLocaleString()
      })
      useCount.value++
      ElMessage.success('封面生成成功！')
    } else if (data.code === 402) {
      ElMessage.error(data.message)
    } else {
      ElMessage.error(data.message || '封面生成失败')
    }
  } catch (err: any) {
    console.error('Generate cover error:', err)
    ElMessage.error('封面生成请求失败：' + (err.message || '网络错误'))
  } finally {
    loading.value = false
  }
}

const shareImage = () => {
  if (navigator.share) {
    navigator.share({ title: 'AI封面生成', url: imageUrl.value })
  } else {
    navigator.clipboard.writeText(imageUrl.value)
    ElMessage.success('链接已复制')
  }
}
</script>
