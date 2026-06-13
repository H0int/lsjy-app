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
                {{ tool.isFree ? `免费(每日${tool.freeDailyLimit}次)` : `${tool.coinCost} 圣点/次` }}
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

          <!-- 生成按钮 -->
          <div class="flex items-center justify-between pt-2">
            <span class="text-sm text-gray-500">
              本次消耗：<strong :class="tool.isFree ? 'text-green-500' : 'text-amber-500'">
                {{ tool.isFree ? '免费' : `${tool.coinCost} 圣点` }}
              </strong>
            </span>
            <el-button type="primary" size="large" :loading="generating" @click="handleGenerate"
              style="background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; min-width: 160px;">
              {{ generating ? '生成中...' : '✨ 开始生成' }}
            </el-button>
          </div>
        </div>

        <!-- 结果展示 -->
        <div v-if="result" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
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

const inputPlaceholder = computed(() => {
  if (!tool.value) return ''
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
  try {
    const res = await toolApi.callTool(Number(route.params.id), { text: inputContent.value })
    result.value = res.outputText || '生成完成，暂无详细输出'
    ElMessage.success('生成完成！')
  } catch (e: any) {
    // 错误由拦截器处理
  } finally {
    generating.value = false
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
