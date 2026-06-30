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
              <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">{{ toolTypeLabel(tool.toolType) }}</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400 mb-3">{{ tool.description }}</p>
            <div class="flex items-center gap-4 text-sm">
              <span class="px-3 py-1 rounded-full bg-primary/10 text-primary">{{ tool.provider }}</span>
              <span class="text-gray-400">{{ tool.usageCount.toLocaleString() }}次使用</span>
              <span class="font-bold" :class="tool.isFree ? 'text-green-500' : 'text-amber-500'">
                {{ tool.isFree ? `免费(每日${tool.freeDailyLimit}次)` : `${effectiveCost} 圣点` }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具使用界面 -->
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-sm">
        <h2 class="font-bold text-lg text-gray-900 dark:text-white mb-4">开始使用</h2>

        <!-- 输入区域 -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">输入内容</label>
            <el-input v-model="inputContent" type="textarea" :rows="5" :placeholder="inputPlaceholder"
              class="w-full" />
          </div>

          <!-- 视频工具：时长选择器 -->
          <div v-if="isVideoTool">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">视频时长</label>
            <div class="flex flex-wrap gap-3">
              <button v-for="d in durationOptions" :key="d.value"
                @click="selectedDuration = d.value"
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all border-2"
                :class="selectedDuration === d.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary/50'"
                :disabled="generating">
                {{ d.label }}
                <span v-if="d.cost > 1" class="ml-1 text-xs opacity-70">({{ d.cost }}倍)</span>
              </button>
            </div>
            <p v-if="selectedDuration > 15" class="mt-2 text-xs text-amber-500">
              ⚡ 超过15秒将自动分段生成并拼接，生成时间较长
            </p>
          </div>

          <!-- 生成按钮 -->
          <div class="flex items-center justify-between pt-2">
            <span class="text-sm text-gray-500">
              本次消耗：<strong :class="tool.isFree ? 'text-green-500' : 'text-amber-500'">
                {{ tool.isFree ? '免费' : `${effectiveCost} 圣点` }}
              </strong>
            </span>
            <el-button type="primary" size="large" :loading="generating" @click="handleGenerate"
              :disabled="!inputContent.trim()"
              style="background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; min-width: 160px;">
              {{ generating ? progressText : '✨ 开始生成' }}
            </el-button>
          </div>
        </div>

        <!-- 视频结果展示 -->
        <div v-if="isVideoTool && videoUrl" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-900 dark:text-white">生成结果</h3>
            <div class="flex gap-2">
              <a :href="videoUrl" target="_blank" download>
                <el-button size="small" type="success">📥 下载视频</el-button>
              </a>
              <el-button size="small" @click="videoUrl = ''">🗑️ 清除</el-button>
            </div>
          </div>
          <div class="rounded-xl overflow-hidden bg-black">
            <video :src="videoUrl" controls autoplay class="w-full max-h-[500px]" style="max-width: 100%;"></video>
          </div>
        </div>

        <!-- 文本结果展示 -->
        <div v-if="!isVideoTool && result" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-900 dark:text-white">生成结果</h3>
            <div class="flex gap-2">
              <el-button size="small" @click="copyResult">📋 复制</el-button>
              <el-button size="small" @click="result = ''">🗑️ 清除</el-button>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-dark-200 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {{ result }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { toolApi } from '@/api'
import { toolTypeMap } from '@/utils'
import type { Tool } from '@/types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const tool = ref<Tool | null>(null)
const loading = ref(true)
const generating = ref(false)
const inputContent = ref('')
const result = ref('')
const videoUrl = ref('')
const selectedDuration = ref(5)
const progressText = ref('生成中...')

const isVideoTool = computed(() => tool.value?.toolType === 'video')

const durationOptions = [
  { value: 5, label: '5秒', cost: 1 },
  { value: 10, label: '10秒', cost: 1 },
  { value: 15, label: '15秒', cost: 1 },
  { value: 30, label: '30秒', cost: 2 },
  { value: 60, label: '60秒', cost: 4 },
]

const effectiveCost = computed(() => {
  if (!tool.value) return 0
  if (isVideoTool.value) {
    const opt = durationOptions.find(d => d.value === selectedDuration.value)
    return (tool.value.coinCost || 1) * (opt?.cost || 1)
  }
  return tool.value.coinCost || 0
})

const inputPlaceholder = computed(() => {
  if (!tool.value) return ''
  if (isVideoTool.value) return '描述你想要生成的视频画面，越详细效果越好...'
  switch (tool.value.inputType) {
    case 'image': return '请上传或输入图片URL...'
    case 'file': return '请输入文件内容或URL...'
    default: return '请输入您的需求描述，越详细效果越好...'
  }
})

function toolTypeLabel(type: string): string {
  return toolTypeMap[type] || type
}

async function handleGenerate() {
  if (!inputContent.value.trim()) return ElMessage.warning('请输入内容')
  generating.value = true
  result.value = ''
  videoUrl.value = ''

  try {
    if (isVideoTool.value) {
      const segments = Math.ceil(selectedDuration.value / 15)
      if (segments > 1) {
        progressText.value = `生成中(共${segments}段)...`
      }

      const res = await toolApi.generateVideo(Number(route.params.id), {
        prompt: inputContent.value,
        duration: selectedDuration.value,
        resolution: '720P',
      })

      const url = res.data?.videoUrl || res.data?.outputText || ''
      if (url) {
        if (url.startsWith('/')) {
          videoUrl.value = `https://api.lsjyapp.cn${url}`
        } else {
          videoUrl.value = url
        }
      }
      ElMessage.success('视频生成完成！')
    } else {
      const res = await toolApi.callTool(Number(route.params.id), { text: inputContent.value })
      result.value = res.data?.outputText || '生成完成，暂无详细输出'
      ElMessage.success('生成完成！')
    }
  } catch (e: any) {
    // error handled by interceptor
  } finally {
    generating.value = false
    progressText.value = '生成中...'
  }
}

function copyResult() {
  navigator.clipboard.writeText(result.value)
  ElMessage.success('已复制到剪贴板')
}

onMounted(async () => {
  try {
    const res = await toolApi.getToolDetail(Number(route.params.id))
    tool.value = res.data
  } finally { loading.value = false }
})
</script>
