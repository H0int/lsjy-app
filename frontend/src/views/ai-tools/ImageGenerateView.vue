<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <!-- 返回按钮 -->
    <button @click="$router.back()" class="flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors">
      <span>←</span><span>返回</span>
    </button>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full"></div>
    </div>

    <template v-else-if="tool">
      <!-- 工具头部 -->
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 mb-6 shadow-sm">
        <div class="flex items-start gap-4">
          <div class="text-5xl">{{ tool.icon }}</div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ tool.name }}</h1>
              <span v-if="tool.isHot" class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-500">🔥 热门</span>
              <span class="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{{ tool.subCategory }}</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400 mb-3">{{ tool.description }}</p>
            <div class="flex items-center gap-4 text-sm">
              <span class="text-gray-400">{{ tool.useCount.toLocaleString() }}次使用</span>
              <span class="font-bold" :class="tool.isFree ? 'text-green-500' : 'text-amber-500'">
                {{ tool.isFree ? '免费' : `${tool.cost} 圣点/次` }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI文生图专用界面 -->
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-sm">
        <h2 class="font-bold text-lg text-gray-900 dark:text-white mb-4"> 图像生成</h2>

        <!-- 画面描述 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">画面描述</label>
          <textarea
            v-model="prompt"
            rows="4"
            placeholder="请详细描述您想要的画面内容，越详细效果越好。例如：赛博朋克风格的未来城市，霓虹灯光，雨天街道..."
            class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          ></textarea>
        </div>

        <!-- 参数配置 -->
        <div class="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">尺寸</label>
            <el-select v-model="size" placeholder="选择尺寸" class="w-full">
              <el-option label="1:1 正方形 (1024×1024)" value="1:1" />
              <el-option label="16:9 横版 (1536×1024)" value="16:9" />
              <el-option label="9:16 竖版 (1024×1536)" value="9:16" />
              <el-option label="4:3 标准 (1152×896)" value="4:3" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">风格</label>
            <el-select v-model="style" placeholder="选择风格" class="w-full">
              <el-option label="写实摄影" value="realistic" />
              <el-option label="动漫风格" value="anime" />
              <el-option label="赛博朋克" value="cyberpunk" />
              <el-option label="油画风格" value="oil-painting" />
              <el-option label="水彩画" value="watercolor" />
              <el-option label="3D渲染" value="3d" />
              <el-option label="像素艺术" value="pixel-art" />
              <el-option label="默认" value="default" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">数量</label>
            <el-select v-model="count" placeholder="生成数量" class="w-full">
              <el-option label="1张" :value="1" />
              <el-option label="2张" :value="2" />
              <el-option label="4张" :value="4" />
            </el-select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">质量</label>
            <el-select v-model="quality" placeholder="选择质量" class="w-full">
              <el-option label="标准" value="standard" />
              <el-option label="高清" value="hd" />
              <el-option label="超清" value="ultra" />
            </el-select>
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="flex items-center justify-between pt-2 mb-6">
          <span class="text-sm text-gray-500">
            消耗：<strong :class="tool.isFree ? 'text-green-500' : 'text-amber-500'">
              {{ tool.isFree ? '免费' : `${tool.cost * count} 圣点` }}
            </strong>
          </span>
          <el-button 
            type="primary" 
            size="large" 
            :loading="generating" 
            @click="handleGenerate"
            :disabled="!prompt.trim()"
            style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; min-width: 180px; font-size: 16px; padding: 12px 32px;"
          >
            {{ generating ? ' 生成中...' : ' 开始生成' }}
          </el-button>
        </div>

        <!-- 错误提示 -->
        <div v-if="generateError" class="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div class="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <span>⚠️</span>
            <span>{{ generateError }}</span>
          </div>
        </div>

        <!-- 生成结果 -->
        <div v-if="generatedImages.length > 0 || generating" class="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-900 dark:text-white">🖼️ 生成结果</h3>
            <el-button v-if="!generating" size="small" @click="clearResults">🗑️ 清除</el-button>
          </div>
          
          <!-- 加载中 -->
          <div v-if="generating" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="n in count" :key="n" class="aspect-square rounded-xl bg-gray-100 dark:bg-dark-200 flex items-center justify-center">
              <div class="text-center">
                <div class="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                <p class="text-sm text-gray-500">正在生成第{{ n }}张...</p>
              </div>
            </div>
          </div>
          
          <!-- 结果展示 -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="(img, index) in generatedImages" :key="index" class="relative group">
              <div class="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-200">
                <img :src="img.url" :alt="img.prompt" class="w-full h-full object-cover" />
              </div>
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button @click="downloadImage(img)" class="px-4 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium">📥 下载</button>
                <button @click="useAsReference(img)" class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">🔄 以此为基础</button>
              </div>
              <div class="mt-2 text-xs text-gray-500 truncate">{{ img.prompt }}</div>
            </div>
          </div>
          
          <!-- 生成信息 -->
          <div v-if="!generating && generatedImages.length > 0" class="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
              <span>💰</span>
              <span>本次消耗 {{ tool.cost * count }} 圣点 | 耗时 {{ (generateTime / 1000).toFixed(1) }}s</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { toolApi, aiApi } from '@/api'
import type { Tool } from '@/types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const tool = ref<Tool | null>(null)
const loading = ref(true)
const generating = ref(false)
const prompt = ref('')
const size = ref('1:1')
const style = ref('default')
const count = ref(1)
const quality = ref('standard')
const generatedImages = ref<Array<{ url: string; prompt: string }>>([])
const generateTime = ref(0)
const generateError = ref('')

const categoryName = computed(() => {
  const categoryMap: Record<string, string> = {
    'ai': 'AI人工智能',
    'media': '自媒体',
    'ecommerce': '电商',
    'pet': '宠物',
    'education': '教育',
    'campus': '伯雅校园'
  }
  return tool.value ? categoryMap[tool.value.category] || '' : ''
})

// 风格对应的英文提示词后缀
const stylePrompts: Record<string, string> = {
  'realistic': ', photorealistic, high detail, professional photography, 8k',
  'anime': ', anime style, vibrant colors, detailed illustration, studio ghibli quality',
  'cyberpunk': ', cyberpunk style, neon lights, futuristic, dark atmosphere, blade runner',
  'oil-painting': ', oil painting style, rich colors, artistic, masterpiece',
  'watercolor': ', watercolor painting, soft colors, artistic, flowing',
  '3d': ', 3D render, high quality, detailed, octane render',
  'pixel-art': ', pixel art style, retro game aesthetic, 16-bit',
  'default': ''
}

async function handleGenerate() {
  if (!prompt.value.trim()) return ElMessage.warning('请输入画面描述')
  generating.value = true
  generatedImages.value = []
  generateError.value = ''
  const startTime = Date.now()
  
  try {
    // 构建完整的提示词
    const fullPrompt = `${prompt.value}${stylePrompts[style.value] || ''}`.trim()
    
    // 调用后端 AI 图片生成 API
    const response = await aiApi.generateImage(Number(route.params.id), prompt.value, {
      size: size.value,
      style: style.value,
      count: count.value
    })
    
    if (response.code === 0 && response.data?.images) {
      generatedImages.value = response.data.images.map((img: any) => ({
        url: img.url,
        prompt: prompt.value
      }))
    } else {
      throw new Error(response.message || '图片生成失败')
    }
    
    generateTime.value = Date.now() - startTime
    ElMessage.success(`生成完成！共${generatedImages.value.length}张图片`)
  } catch (error: any) {
    console.error('Image generation error:', error)
    generateError.value = error.message || '图片生成失败，请检查后端 AI 图片服务是否已部署'
    ElMessage.error('图片生成失败，请重试')
  } finally {
    generating.value = false
  }
}

function clearResults() {
  generatedImages.value = []
  generateTime.value = 0
  generateError.value = ''
}

function downloadImage(img: { url: string; prompt: string }) {
  const link = document.createElement('a')
  link.href = img.url
  link.download = `ai-generated-${Date.now()}.png`
  link.target = '_blank'
  link.click()
  ElMessage.success('图片下载中...')
}

function useAsReference(img: { url: string; prompt: string }) {
  prompt.value = img.prompt
  ElMessage.success('已将描述填入输入框')
}

onMounted(async () => {
  try {
    const res = await toolApi.getToolDetail(route.params.id as string)
    tool.value = res.data
  } catch (error) {
    ElMessage.error('获取工具信息失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
