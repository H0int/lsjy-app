<template>
  <div class="ai-model-selector">
    <el-popover placement="bottom" :width="380" trigger="click">
      <template #reference>
        <button type="button" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-200
          hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors text-sm">
          <span class="text-lg">{{ currentProviderIcon }}</span>
          <span class="font-medium">{{ currentModelName }}</span>
          <span class="text-gray-400">▾</span>
        </button>
      </template>

      <div class="model-selector-panel">
        <div class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">选择AI模型</div>

        <!-- Provider Tabs -->
        <div class="flex gap-2 mb-3 flex-wrap">
          <button v-for="group in modelGroups" :key="group.provider"
            type="button"
            @click="selectedProvider = group.provider"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="selectedProvider === group.provider
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-400 hover:bg-gray-200'">
            {{ group.providerName }}
          </button>
        </div>

        <!-- Model List -->
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <template v-for="group in modelGroups" :key="group.provider">
            <template v-if="selectedProvider === group.provider">
              <button v-for="model in group.models" :key="model.id"
                type="button"
                @click="selectModel(group.provider, model)"
                class="w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left"
                :class="selectedModelId === model.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-gray-50 dark:bg-dark-200 hover:bg-gray-100 dark:hover:bg-dark-300 border border-transparent'">
                <div>
                  <div class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ model.name }}</div>
                  <div class="flex items-center gap-2 mt-1">
                    <span v-for="cap in model.capabilities" :key="cap"
                      class="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-dark-100 text-gray-500">
                      {{ capLabel(cap) }}
                    </span>
                    <span v-if="model.supportStream" class="text-[10px] text-green-500">⚡流式</span>
                  </div>
                </div>
                <div class="text-right">
                  <div v-if="model.inputPrice" class="text-xs text-gray-400">
                    入{{ model.inputPrice }}/千token
                  </div>
                  <div v-if="model.outputPrice" class="text-xs text-gray-400">
                    出{{ model.outputPrice }}/千token
                  </div>
                  <div v-if="model.maxContextLength" class="text-[10px] text-gray-300 mt-1">
                    {{ formatContext(model.maxContextLength) }}
                  </div>
                </div>
              </button>
            </template>
          </template>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toolApi } from '@/api'
import type { ProviderModelGroup, ModelInfo } from '@/types'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  /** 过滤能力类型 */
  filterCapability?: string
  /** 当前选中的模型ID */
  modelId?: string
}>()

const emit = defineEmits<{
  (e: 'change', data: { provider: string; model: ModelInfo }): void
}>()

const modelGroups = ref<ProviderModelGroup[]>([])
const selectedProvider = ref('')
const selectedModelId = ref('')
const selectedModel = ref<ModelInfo | null>(null)

const providerIcons: Record<string, string> = {
  doubao: '🫘',
  jimeng: '🎨',
  openai: '🤖',
  tongyi: '🐉',
}

const capLabels: Record<string, string> = {
  text: '文本',
  image: '图像',
  code: '代码',
  multimodal: '多模态',
}

const currentProviderIcon = computed(() => {
  const provider = selectedModel ? getProviderByModel(selectedModelId.value) : ''
  return providerIcons[provider] || '🤖'
})

const currentModelName = computed(() => {
  return selectedModel.value?.name || '选择模型'
})

function capLabel(cap: string): string {
  return capLabels[cap] || cap
}

function formatContext(length: number): string {
  if (length >= 1000000) return `${(length / 1000000).toFixed(0)}M ctx`
  if (length >= 1000) return `${(length / 1000).toFixed(0)}K ctx`
  return `${length} ctx`
}

function getProviderByModel(modelId: string): string {
  for (const group of modelGroups.value) {
    if (group.models.some(m => m.id === modelId)) {
      return group.provider
    }
  }
  return ''
}

function selectModel(provider: string, model: ModelInfo) {
  selectedProvider.value = provider
  selectedModelId.value = model.id
  selectedModel.value = model
  emit('change', { provider, model })
}

onMounted(async () => {
  try {
    const res = await toolApi.getModels(props.filterCapability)
    modelGroups.value = res.data

    // 过滤能力
    if (props.filterCapability) {
      modelGroups.value = modelGroups.value
        .map(g => ({
          ...g,
          models: g.models.filter(m => m.capabilities.includes(props.filterCapability as any)),
        }))
        .filter(g => g.models.length > 0)
    }

    // 设置默认选中
    if (modelGroups.value.length > 0) {
      selectedProvider.value = modelGroups.value[0].provider
      if (props.modelId) {
        selectedModelId.value = props.modelId
        for (const group of modelGroups.value) {
          const found = group.models.find(m => m.id === props.modelId)
          if (found) {
            selectedProvider.value = group.provider
            selectedModel.value = found
            break
          }
        }
      } else if (modelGroups.value[0].models.length > 0) {
        const firstModel = modelGroups.value[0].models[0]
        selectedModelId.value = firstModel.id
        selectedModel.value = firstModel
      }
    }
  } catch {
    ElMessage.error('获取模型列表失败')
  }
})
</script>

<style scoped>
.model-selector-panel {
  padding: 4px 0;
}
</style>
