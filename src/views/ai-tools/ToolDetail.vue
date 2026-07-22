<template>
  <div class="max-w-5xl mx-auto px-4 py-6 cyber-detail">
    <!-- 返回按钮 -->
    <button @click="$router.back()" class="cyber-back-btn">
      <span>←</span><span>返回</span>
    </button>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="cyber-spinner"></div>
    </div>

    <div v-else-if="!tool" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="text-6xl mb-4">🔍</div>
      <h2 class="text-xl text-gray-300 mb-2">工具加载失败</h2>
      <p class="text-gray-500 mb-6">AI服务暂时不可用，工具信息未加载到，请稍后再试。</p>
      <button @click="$router.push('/tools')" class="cyber-btn cyber-btn-cyan">返回工具中心</button>
    </div>

    <template v-else-if="tool">
      <!-- 工具头部 -->
      <div class="cyber-tool-header">
        <div class="flex items-start gap-4">
          <div class="cyber-tool-icon-big">{{ tool.icon }}</div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="cyber-tool-title">{{ tool.name }}</h1>
              <span class="cyber-badge cyber-badge-cyan">{{ toolTypeLabel(tool.value) }}</span>
            </div>
            <p class="cyber-tool-desc-line">{{ tool.description }}</p>
            <div class="cyber-tool-meta">
              <span class="cyber-provider">{{ tool.provider }}</span>
              <span class="cyber-use-count">{{ (tool.usageCount || 0).toLocaleString() }}次使用</span>
              <span class="cyber-cost" :class="(tool.isFree && !isImageTool && !isVideoTool) ? 'cyber-cost-free' : 'cyber-cost-paid'">
                {{ (tool.isFree && !isImageTool && !isVideoTool) ? `免费(每日${tool.freeDailyLimit}次)` : `${effectiveCost} 圣力` }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具使用界面 -->
      <div class="cyber-use-panel">
        <h2 class="cyber-card-title">
          <span class="title-bar"></span>开始使用
        </h2>

        <!-- 输入区域 -->
        <div class="space-y-4">
          <!-- 工具专属参数面板 -->
          <template v-if="hasParams">
            <div v-for="group in toolParamGroups" :key="group.title" class="cyber-param-group">
              <h3 class="cyber-param-title">
                <span class="title-bar"></span>{{ group.title }}
              </h3>
              <div class="cyber-param-grid">
                <div v-for="param in group.params" :key="param.key" class="cyber-param-item">
                  <label class="cyber-input-label">{{ param.label }}</label>
                  <select
                    v-if="param.type === 'select'"
                    v-model="paramValues[param.key]"
                    class="cyber-select"
                    :disabled="generating"
                  >
                    <option v-for="opt in param.options" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <input
                    v-else-if="param.type === 'input'"
                    v-model="paramValues[param.key]"
                    :placeholder="param.placeholder"
                    class="cyber-input"
                    :disabled="generating"
                  />
                  <textarea
                    v-else-if="param.type === 'textarea'"
                    v-model="paramValues[param.key]"
                    :placeholder="param.placeholder"
                    class="cyber-textarea"
                    :disabled="generating"
                    rows="3"
                  ></textarea>
                  <input
                    v-else-if="param.type === 'number'"
                    v-model.number="paramValues[param.key]"
                    type="number"
                    :placeholder="param.placeholder"
                    class="cyber-input"
                    :disabled="generating"
                  />
                </div>
              </div>
            </div>
          </template>

          <div>
            <label class="cyber-input-label">输入内容</label>
            <el-input v-model="inputContent" type="textarea" :rows="5" :placeholder="inputPlaceholder"
              class="w-full" />
          </div>

          <!-- 图片处理工具：上传区域 -->
          <div v-if="isImageProcessing">
            <label class="cyber-input-label">上传图片</label>
            <div class="cyber-upload-zone" @click="$refs.fileInput?.click()">
              <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleFileUpload" />
              <div class="cyber-upload-inner">
                <span class="upload-icon">📤</span>
                <span class="upload-text">点击上传图片</span>
                <span class="upload-hint">支持 JPG、PNG、WEBP 格式</span>
              </div>
            </div>
          </div>

          <!-- 生成按钮 -->
          <div class="cyber-gen-bar">
            <span class="cyber-cost-tip">
              本次消耗：<strong :class="(tool.isFree && !isImageTool && !isVideoTool) ? 'cyber-cost-free' : 'cyber-cost-paid'">
                {{ (tool.isFree && !isImageTool && !isVideoTool) ? '免费' : `${effectiveCost} 圣力` }}
              </strong>
            </span>
            <button class="cyber-gen-btn" :disabled="generating || !inputContent.trim()" @click="handleGenerate">
              <span class="cyber-btn-shine"></span>
              <span class="cyber-btn-content">{{ generating ? progressText : '✨ 开始生成' }}</span>
            </button>
          </div>
        </div>

        <!-- 生成进度与作品库提示 -->
        <div v-if="generating || generationMessage || generationError" class="cyber-job-panel" :class="{ error: generationError }">
          <div v-if="generating" class="cyber-spinner"></div>
          <div class="job-info">
            <h3>{{ generationError ? '生成失败' : generationTitle }}</h3>
            <p>{{ generationError || generationMessage }}</p>
            <div v-if="!generationError" class="job-steps">
              <span class="active">提交任务</span>
              <span :class="{ active: !generating }">写入作品库</span>
              <span :class="{ active: imageUrls.length || videoUrl || result || videoTaskId }">可查看结果</span>
            </div>
          </div>
          <button v-if="!generating" class="cyber-action-pill cyber-pill-green" @click="goWorks">去我的作品</button>
        </div>

        <!-- 图片结果展示 -->
        <div v-if="isImageTool && imageUrls.length > 0" class="cyber-result-section">
          <div class="cyber-result-head">
            <h3 class="cyber-card-title"><span class="title-bar"></span>生成结果</h3>
            <div class="flex gap-2">
              <button class="cyber-action-pill cyber-pill-green" @click="downloadImage(imageUrls[0])">📥 下载图片</button>
              <button class="cyber-action-pill" @click="imageUrls = []">🗑️ 清除</button>
            </div>
          </div>
          <div class="cyber-image-grid">
            <div v-for="(url, idx) in imageUrls" :key="idx" class="cyber-image-card">
              <img :src="url" class="cyber-image" loading="lazy" @click="downloadImage(url)" />
              <div class="cyber-image-overlay">
                <span class="cyber-image-idx">{{ idx + 1 }}/{{ imageUrls.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 视频结果展示 -->
        <div v-if="isVideoTool && videoUrl" class="cyber-result-section">
          <div class="cyber-result-head">
            <h3 class="cyber-card-title"><span class="title-bar"></span>生成结果</h3>
            <div class="flex gap-2">
              <a :href="videoUrl" target="_blank" download>
                <button class="cyber-action-pill cyber-pill-green">📥 下载视频</button>
              </a>
              <button class="cyber-action-pill" @click="videoUrl = ''">🗑️ 清除</button>
            </div>
          </div>
          <div class="cyber-video-frame">
            <video :src="videoUrl" controls autoplay class="w-full max-h-[500px]" style="max-width: 100%;"></video>
          </div>
        </div>

        <!-- 文本结果展示 -->
        <div v-if="!isVideoTool && !isImageTool && result" class="cyber-result-section">
          <div class="cyber-result-head">
            <h3 class="cyber-card-title"><span class="title-bar"></span>生成结果</h3>
            <div class="flex gap-2">
              <button class="cyber-action-pill" @click="copyResult">📋 复制</button>
              <button class="cyber-action-pill" @click="result = ''">🗑️ 清除</button>
            </div>
          </div>
          <div class="cyber-text-result">
            {{ result }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toolApi } from '@/api'
import { toolTypeMap } from '@/utils'
import { getToolParams, hasToolParams } from '@/utils/toolParams'
import type { Tool } from '@/types'
import { ElMessage } from 'element-plus'
import { useToolStore } from '@/stores/tool'

const route = useRoute()
const router = useRouter()
const tool = ref<Tool | null>(null)
const loading = ref(true)
const generating = ref(false)
const inputContent = ref('')
const result = ref('')
const videoUrl = ref('')
const videoTaskId = ref('')
const selectedDuration = ref(5)
const progressText = ref('生成中...')
const generationMessage = ref('')
const generationError = ref('')

const isVideoTool = computed(() => {
  if (!tool.value) return false
  return tool.value.toolType === 'video' || Number(tool.value.categoryId) === 10 ||
    String(tool.value.category || '').includes('视频') || String(tool.value.subCategory || '').includes('视频')
})
const isImageTool = computed(() => {
  if (!tool.value) return false
  return tool.value.toolType === 'image' || Number(tool.value.categoryId) === 9 ||
    String(tool.value.category || '').includes('图片') || String(tool.value.subCategory || '').includes('图片')
})
const isImageProcessing = computed(() => tool.value?.inputType === 'image')
const generationTitle = computed(() => {
  if (isVideoTool.value) return videoTaskId.value ? '视频任务已提交' : '正在提交视频任务'
  if (isImageTool.value) return '正在生成图片'
  return '正在生成内容'
})

// 图片生成结果
const imageUrls = ref<string[]>([])

// 工具参数配置
const paramValues = ref<Record<string, any>>({})
const toolParamGroups = computed(() => {
  // 视频工具
  if (isVideoTool.value) return getToolParams('视频生成')
  // 图片工具
  if (isImageTool.value) return getToolParams('AI绘画')

  // 有 subCategory 时优先使用
  if (tool.value?.subCategory) {
    return getToolParams(tool.value.subCategory)
  }

  // 用 category 名称匹配参数（覆盖所有内置分类）
  const cat = tool.value?.category || ''
  if (cat.includes('图片') || cat.includes('AI绘画')) return getToolParams('AI绘画')
  if (cat.includes('视频')) return getToolParams('视频生成')
  if (cat.includes('音频')) return getToolParams('对话聊天')
  if (cat.includes('内容创作') || cat.includes('文案')) return getToolParams('文案撰写')
  if (cat.includes('电商')) return getToolParams('商品运营')
  if (cat.includes('教育') || cat.includes('培训')) return getToolParams('学习方法')
  if (cat.includes('宠物')) return getToolParams('养宠指导')
  if (cat.includes('校园')) return getToolParams('校园生活')
  if (cat.includes('生活')) return getToolParams('对话聊天')
  if (cat.includes('办公') || cat.includes('效率')) return getToolParams('对话聊天')
  if (cat.includes('AI智能') || cat.includes('AI')) return getToolParams('对话聊天')

  // 兜底：通用参数
  return getToolParams('对话聊天')
})
const hasParams = computed(() => toolParamGroups.value.length > 0)

// 初始化参数默认值
function initParamValues() {
  const values: Record<string, any> = {}
  toolParamGroups.value.forEach(group => {
    group.params.forEach(param => {
      values[param.key] = param.defaultValue ?? ''
    })
  })
  paramValues.value = values
}

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
    const dur = paramValues.value.videoDuration || '5s'
    const seconds = parseInt(dur)
    const costMult = seconds <= 15 ? 1 : seconds <= 30 ? 2 : 4
    return (tool.value.coinCost || 1) * costMult
  }
  return tool.value.coinCost || 0
})

const inputPlaceholder = computed(() => {
  if (!tool.value) return ''
  if (isVideoTool.value) return '描述你想要生成的视频画面，越详细效果越好...'
  if (isImageTool.value) {
    if (isImageProcessing.value) return '请上传或输入图片URL...'
    return '描述你想要生成的图片内容，越详细效果越好...'
  }
  switch (tool.value.inputType) {
    case 'image': return '请上传或输入图片URL...'
    case 'file': return '请输入文件内容或URL...'
    default: return '请输入您的需求描述，越详细效果越好...'
  }
})

function toolTypeLabel(t: Tool | null | string): string {
  if (!t || typeof t === 'string') return toolTypeMap[t || 'text'] || t || '文本生成'
  const catId = Number(t.categoryId)
  const catName = String(t.category || '').trim()
  const subName = String(t.subCategory || '').trim()
  if (t.toolType === 'image' || catId === 9 || catName.includes('图片') || subName.includes('图片')) return '图片生成'
  if (t.toolType === 'video' || catId === 10 || catName.includes('视频') || subName.includes('视频')) return '视频生成'
  if (t.toolType === 'audio' || catId === 11 || catName.includes('音频') || subName.includes('音频')) return '音频处理'
  return toolTypeMap[t.toolType] || t.toolType || '文本生成'
}

async function handleGenerate() {
  if (!inputContent.value.trim()) return ElMessage.warning('请输入内容')
  generating.value = true
  result.value = ''
  videoUrl.value = ''
  videoTaskId.value = ''
  imageUrls.value = []
  generationError.value = ''
  generationMessage.value = isVideoTool.value
    ? '正在提交视频生成任务，提交成功后可在我的作品里查看进度。'
    : isImageTool.value
      ? '图片正在生成，请稍候；完成后会自动保存到图文库。'
      : '内容正在生成，请稍候；完成后会自动保存到作品库。'

  try {
    if (isVideoTool.value) {
      const durStr = paramValues.value.videoDuration || '5s'
      const seconds = parseInt(durStr)
      const segments = Math.ceil(seconds / 15)
      if (segments > 1) {
        progressText.value = `生成中(共${segments}段)...`
      }

      const res = await toolApi.generateVideo(Number(route.params.id), {
        prompt: inputContent.value,
        duration: seconds,
        resolution: paramValues.value.resolution || '720p',
        style: paramValues.value.videoStyle || 'cinematic',
        aspectRatio: paramValues.value.aspectRatio || '16:9',
      })

      if (res.code !== 0) throw new Error(res.message || '视频任务提交失败')
      videoTaskId.value = res.data?.taskId || ''
      const url = res.data?.videoUrl || res.data?.outputText || ''
      if (url) {
        if (url.startsWith('/')) {
          videoUrl.value = `https://api.lsjyapp.cn${url}`
        } else {
          videoUrl.value = url
        }
      }
      generationMessage.value = videoTaskId.value
        ? '视频任务已提交，已写入视频库。你可以离开当前页面，到我的作品里查看进度和结果。'
        : '视频生成完成，已写入视频库。'
      ElMessage.success('视频任务已提交到作品库')
      recordUsage()
    } else if (isImageTool.value) {
      const res = await toolApi.generateImage(Number(route.params.id), {
        prompt: inputContent.value,
        size: paramValues.value.size,
        style: paramValues.value.style,
        count: Number(paramValues.value.count || 1),
        quality: paramValues.value.quality,
      })
      if (res.code !== 0) throw new Error(res.message || '图片生成失败')
      const urls = res.data?.urls || res.data?.imageUrls || []
      const singleUrl = res.data?.imageUrl || res.data?.outputUrl || ''
      if (urls.length > 0) {
        imageUrls.value = urls
      } else if (singleUrl) {
        imageUrls.value = [singleUrl]
      }
      if (imageUrls.value.length === 0) {
        throw new Error(res.data?.outputText || '生成完成但未返回图片，请稍后重试')
      }
      generationMessage.value = `已生成 ${imageUrls.value.length} 张图片，并保存到图文库。`
      ElMessage.success(imageUrls.value.length > 0 ? `生成 ${imageUrls.value.length} 张图片！` : '生成完成！')
      recordUsage()
    } else {
      const res = await toolApi.callTool(Number(route.params.id), { text: inputContent.value, params: paramValues.value })
      if (res.code !== 0) throw new Error(res.message || '生成失败')
      result.value = res.data?.outputText || res.data?.content || '生成完成，暂无详细输出'
      generationMessage.value = '内容已生成，并保存到作品库。'
      ElMessage.success('生成完成！')
      recordUsage()
    }
  } catch (e: any) {
    // ★ 本地容错：图片工具降级到硅基流动API，文本工具降级到AI模型
    const isLocal = localStorage.getItem('lsjy_local_auth') === 'true'
    if (isLocal && isImageTool.value) {
      const IMAGE_MODELS = [
        { model: 'black-forest-labs/FLUX.1-dev', label: 'FLUX.1-dev' },
        { model: 'stabilityai/stable-diffusion-xl-base-1.0', label: 'SDXL' },
      ]
      let lastErr = ''
      for (const cfg of IMAGE_MODELS) {
        try {
          const sizeStr = paramValues.value.size || '1024x1024'
          const parts = sizeStr.split('x')
          const imgRes = await fetch('https://api.siliconflow.cn/v1/images/generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-ivqkjfcgfoceolvfzyafcgrvvqdzcqoiyprflskmmcujwgtg' },
            body: JSON.stringify({ model: cfg.model, prompt: inputContent.value, image_size: `${parts[0] || 1024}x${parts[1] || 1024}`, num_inference_steps: 20 }),
            signal: AbortSignal.timeout(120000),
          })
          if (imgRes.ok) {
            const imgData = await imgRes.json()
            const url = imgData.images?.[0]?.url || imgData.data?.[0]?.url || ''
            if (url) {
              imageUrls.value = [url]
              generationMessage.value = '图片已生成（本地模式）'
              ElMessage.success('图片生成成功！')
              recordUsage()
              break
            } else throw new Error('未返回图片URL')
          } else {
            const errText = await imgRes.text().catch(() => '')
            const errJson = JSON.parse(errText)
            lastErr = errJson.message || errText
            console.warn(`模型${cfg.label}失败:`, lastErr)
          }
        } catch (e2: any) {
          lastErr = e2.message
          console.warn(`模型${cfg.label}异常:`, lastErr)
        }
      }
      if (!imageUrls.value.length) {
        generationError.value = `图片生成失败：${lastErr || '所有模型均不可用'}`
        ElMessage.error(generationError.value)
      }
    } else if (isLocal && !isVideoTool.value) {
      // 文本工具降级到AI模型
      try {
        const msgs = [{ role: 'user', content: inputContent.value }]
        const r = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer 6b7eb9b814494f66abf8dec556763b9c.THihSRBYUPPdlbtv' },
          body: JSON.stringify({ model: 'glm-4-flash', messages: msgs, max_tokens: 4096 }),
          signal: AbortSignal.timeout(30000),
        })
        if (r.ok) { const d = await r.json(); result.value = d.choices?.[0]?.message?.content || '生成完成'; generationMessage.value = '内容已生成（本地模式）'; ElMessage.success('生成完成！'); recordUsage() }
        else throw new Error(`API返回${r.status}`)
      } catch (e2: any) {
        generationError.value = `生成失败：${e2.message}`
        ElMessage.error(generationError.value)
      }
    } else {
      generationError.value = e?.message || '生成失败，请稍后重试'
      ElMessage.error(generationError.value)
    }
  } finally {
    generating.value = false
    progressText.value = '生成中...'
  }
}

function recordUsage() {
  if (!tool.value) return
  const usedTools = JSON.parse(localStorage.getItem('lsjy_used_tools') || '[]')
  const record = {
    id: tool.value.id,
    name: tool.value.name,
    icon: tool.value.icon || '🤖',
    time: new Date().toLocaleString('zh-CN'),
    category: tool.value.category || tool.value.subCategory || 'AI工具',
  }
  // 去重：如果已有同ID记录，先删除旧的
  const filtered = usedTools.filter((u: any) => u.id !== tool.value!.id)
  filtered.push(record)
  localStorage.setItem('lsjy_used_tools', JSON.stringify(filtered.slice(-20)))

  // 如果是图片/视频/文本生成，记录作品
  if (imageUrls.value.length > 0 || videoUrl.value || result.value) {
    const works = JSON.parse(localStorage.getItem('lsjy_generated_works') || '[]')
    works.push({
      id: Date.now(),
      toolName: tool.value.name,
      inputText: inputContent.value,
      outputText: result.value || (imageUrls.value.length ? `生成图片 ${imageUrls.value.length} 张` : videoTaskId.value ? '视频生成中' : ''),
      outputUrl: imageUrls.value[0] || videoUrl.value || '',
      outputUrls: imageUrls.value.length ? imageUrls.value : (videoUrl.value ? [videoUrl.value] : []),
      time: new Date().toLocaleString('zh-CN'),
      type: tool.value.toolType || 'text',
      status: videoTaskId.value && !videoUrl.value ? 'processing' : 'completed',
      taskId: videoTaskId.value,
    })
    localStorage.setItem('lsjy_generated_works', JSON.stringify(works.slice(-100)))
  }
}

function goWorks() {
  router.push('/profile/works')
}

function copyResult() {
  navigator.clipboard.writeText(result.value)
  ElMessage.success('已复制到剪贴板')
}

function downloadImage(url: string) {
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.download = 'generated-image.png'
  a.click()
}

async function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  // 简单实现：读取为 base64 放入 inputContent
  const reader = new FileReader()
  reader.onload = () => {
    inputContent.value = String(reader.result)
    ElMessage.success('图片已上传')
  }
  reader.readAsDataURL(file)
}

onMounted(async () => {
  const toolStore = useToolStore()
  try {
    const res = await toolApi.getToolDetail(Number(route.params.id))
    tool.value = res.data
  } catch {
    // 后端不可用时从内置数据中查找
    const id = Number(route.params.id)
    // 确保store数据已加载
    if (toolStore.tools.length === 0) await toolStore.fetchTools()
    tool.value = toolStore.tools.find(t => t.id === id) || null
  } finally {
    loading.value = false
    // 初始化参数默认值
    if (tool.value) initParamValues()
  }
})
</script>

<style scoped>
.cyber-detail { position: relative; }

.cyber-back-btn {
  display: inline-flex; align-items: center; gap: 8px;
  margin-bottom: 16px;
  padding: 6px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(0,240,255,0.2);
  color: var(--cyber-text-dim);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-back-btn:hover {
  color: var(--cyber-cyan);
  border-color: rgba(0,240,255,0.5);
  background: rgba(0,240,255,0.05);
  box-shadow: 0 0 10px rgba(0,240,255,0.2);
}

.cyber-spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(0,240,255,0.15);
  border-top-color: var(--cyber-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  box-shadow: 0 0 12px rgba(0,240,255,0.3);
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 工具头部 */
.cyber-tool-header {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 16px;
  padding: 22px 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}
.cyber-tool-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), var(--cyber-magenta), transparent);
}
.cyber-tool-icon-big {
  font-size: 48px;
  filter: drop-shadow(0 0 10px rgba(0,240,255,0.4));
}
.cyber-tool-title {
  font-size: 22px; font-weight: 800;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
  text-shadow: 0 0 8px rgba(0,240,255,0.2);
}
.cyber-tool-desc-line { color: var(--cyber-text-dim); font-size: 13px; margin-bottom: 10px; }
.cyber-tool-meta { display: flex; gap: 16px; align-items: center; font-size: 13px; flex-wrap: wrap; }
.cyber-provider {
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(0,240,255,0.08);
  color: var(--cyber-cyan);
  border: 1px solid rgba(0,240,255,0.25);
  font-size: 12px;
}
.cyber-use-count { color: var(--cyber-text-dim); font-size: 12px; }
.cyber-cost { font-weight: 700; }
.cyber-cost-free { color: var(--cyber-green); text-shadow: 0 0 6px rgba(0,255,136,0.3); }
.cyber-cost-paid { color: var(--cyber-amber); text-shadow: 0 0 6px rgba(255,184,0,0.3); }

/* 使用面板 */
.cyber-use-panel {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 16px;
  padding: 24px;
  position: relative;
}
.cyber-use-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);
}
.cyber-card-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 700;
  color: var(--cyber-text);
  margin-bottom: 18px;
  font-family: 'JetBrains Mono', monospace;
}
.title-bar {
  display: inline-block;
  width: 4px; height: 18px;
  background: linear-gradient(180deg, var(--cyber-cyan), var(--cyber-magenta));
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(0,240,255,0.4);
}

.cyber-input-label {
  display: block;
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-bottom: 8px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 1px;
}

/* 时长按钮 */
.cyber-duration-btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px; font-weight: 600;
  background: rgba(0,240,255,0.03);
  border: 2px solid rgba(0,240,255,0.15);
  color: var(--cyber-text-dim);
  cursor: pointer;
  transition: all 0.25s;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-duration-btn:hover:not(:disabled) {
  border-color: rgba(0,240,255,0.4);
  color: var(--cyber-cyan);
}
.cyber-duration-btn.active {
  border-color: var(--cyber-cyan);
  background: rgba(0,240,255,0.1);
  color: var(--cyber-cyan);
  box-shadow: 0 0 12px rgba(0,240,255,0.2);
  text-shadow: 0 0 6px rgba(0,240,255,0.4);
}
.cyber-duration-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.cyber-warn-text {
  margin-top: 10px;
  font-size: 12px;
  color: var(--cyber-amber);
  background: rgba(255,184,0,0.06);
  border: 1px solid rgba(255,184,0,0.2);
  padding: 8px 12px;
  border-radius: 8px;
}

/* 生成条 */
.cyber-gen-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 12px;
}
.cyber-cost-tip { font-size: 13px; color: var(--cyber-text-dim); }
.cyber-gen-btn {
  position: relative;
  padding: 12px 32px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  color: #000;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 2px;
  min-width: 160px;
  box-shadow: 0 0 18px rgba(0,240,255,0.3);
}
.cyber-gen-btn:hover:not(:disabled) {
  box-shadow: 0 0 30px rgba(0,240,255,0.5), 0 0 60px rgba(0,240,255,0.2);
  transform: translateY(-1px);
}
.cyber-gen-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cyber-btn-shine {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  animation: btnShine 3s ease-in-out infinite;
}
@keyframes btnShine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}
.cyber-btn-content { position: relative; z-index: 1; }

.cyber-job-panel {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(0,240,255,0.22);
  background: rgba(0,240,255,0.05);
}
.cyber-job-panel.error {
  border-color: rgba(255,80,80,0.35);
  background: rgba(255,80,80,0.06);
}
.job-info { flex: 1; min-width: 0; }
.job-info h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--cyber-cyan);
  margin-bottom: 4px;
}
.cyber-job-panel.error .job-info h3 { color: #ff8a8a; }
.job-info p {
  color: var(--cyber-text-dim);
  font-size: 12px;
  line-height: 1.6;
}
.job-steps {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.job-steps span {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  color: var(--cyber-text-dim);
  border: 1px solid rgba(0,240,255,0.12);
}
.job-steps span.active {
  color: var(--cyber-cyan);
  border-color: rgba(0,240,255,0.35);
  background: rgba(0,240,255,0.08);
}

/* 结果区 */
.cyber-result-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0,240,255,0.1);
}
.cyber-result-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px;
}
.cyber-result-head .cyber-card-title { margin-bottom: 0; }

.cyber-action-pill {
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(0,240,255,0.06);
  border: 1px solid rgba(0,240,255,0.25);
  color: var(--cyber-cyan);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-action-pill:hover {
  background: rgba(0,240,255,0.12);
  box-shadow: 0 0 10px rgba(0,240,255,0.2);
}
.cyber-pill-green {
  background: rgba(0,255,136,0.08);
  border-color: rgba(0,255,136,0.3);
  color: var(--cyber-green);
}
.cyber-pill-green:hover { background: rgba(0,255,136,0.15); }

.cyber-video-frame {
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  border: 1px solid rgba(0,240,255,0.2);
  box-shadow: 0 0 30px rgba(0,240,255,0.15);
}
.cyber-text-result {
  background: rgba(0,240,255,0.03);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 12px;
  padding: 16px;
  font-size: 13px;
  color: var(--cyber-text);
  line-height: 1.7;
  white-space: pre-wrap;
  font-family: 'JetBrains Mono', monospace;
}

/* 图片结果展示 */
.cyber-image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
@media (max-width: 480px) {
  .cyber-image-grid { grid-template-columns: 1fr 1fr; }
}
.cyber-image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0,240,255,0.15);
  background: #000;
  aspect-ratio: 1;
  cursor: pointer;
  transition: all 0.3s;
}
.cyber-image-card:hover {
  border-color: var(--cyber-cyan);
  box-shadow: 0 0 20px rgba(0,240,255,0.2);
  transform: translateY(-2px);
}
.cyber-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cyber-image-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 8px 12px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
}
.cyber-image-idx {
  font-size: 11px;
  color: var(--cyber-cyan);
  font-family: 'JetBrains Mono', monospace;
}

/* 图片上传区域 */
.cyber-upload-zone {
  border: 2px dashed rgba(0,240,255,0.2);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(0,240,255,0.02);
}
.cyber-upload-zone:hover {
  border-color: var(--cyber-cyan);
  background: rgba(0,240,255,0.05);
}
.cyber-upload-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.upload-icon { font-size: 28px; }
.upload-text { font-size: 13px; color: var(--cyber-text); font-weight: 600; }
.upload-hint { font-size: 11px; color: var(--cyber-text-dim); }

/* Element Plus 输入框覆盖 */
:deep(.el-textarea__inner) {
  background-color: rgba(0,240,255,0.03) !important;
  box-shadow: 0 0 0 1px rgba(0,240,255,0.2) inset !important;
  border-radius: 10px !important;
  color: var(--cyber-text) !important;
  font-size: 13px !important;
  font-family: 'JetBrains Mono', monospace !important;
}
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--cyber-cyan) inset, 0 0 12px rgba(0,240,255,0.15) !important;
}
:deep(.el-textarea__inner::placeholder) { color: var(--cyber-text-dim) !important; }

/* 参数面板 */
.cyber-param-group {
  background: rgba(0, 240, 255, 0.03);
  border: 1px solid rgba(0, 240, 255, 0.12);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}
.cyber-param-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--cyber-text);
  margin-bottom: 14px;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-param-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (max-width: 480px) {
  .cyber-param-grid { grid-template-columns: 1fr; }
}
.cyber-param-item { display: flex; flex-direction: column; gap: 6px; }

.cyber-select {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--cyber-text);
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  outline: none;
  transition: all 0.25s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2300f0ff' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}
.cyber-select:focus {
  border-color: var(--cyber-cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.15);
}
.cyber-select:disabled { opacity: 0.4; cursor: not-allowed; }
.cyber-select option {
  background: #0d0d2b;
  color: var(--cyber-text);
}

.cyber-input {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--cyber-text);
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  outline: none;
  transition: all 0.25s;
}
.cyber-input:focus {
  border-color: var(--cyber-cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.15);
}
.cyber-input:disabled { opacity: 0.4; cursor: not-allowed; }
.cyber-input::placeholder { color: var(--cyber-text-dim); }

.cyber-textarea {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--cyber-text);
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  outline: none;
  resize: vertical;
  transition: all 0.25s;
}
.cyber-textarea:focus {
  border-color: var(--cyber-cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.15);
}
.cyber-textarea:disabled { opacity: 0.4; cursor: not-allowed; }
.cyber-textarea::placeholder { color: var(--cyber-text-dim); }
</style>
