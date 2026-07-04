<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <!-- 返回按钮 -->
    <button @click="$router.back()" class="flex items-center gap-2 mb-4 transition-colors"
      style="color: var(--cyber-text-dim);"
      @mouseover="($event.currentTarget as HTMLElement).style.color='var(--cyber-cyan)'"
      @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--cyber-text-dim)'">
      <span>←</span><span>返回</span>
    </button>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="pulse-glow w-8 h-8 rounded-full" style="background: var(--cyber-cyan);"></div>
    </div>

    <template v-else-if="tool">
      <!-- 工具头部 - 赛博朋克 -->
      <div class="cyber-card p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="text-5xl" style="filter: drop-shadow(0 0 8px rgba(0,240,255,0.5));">{{ tool.icon }}</div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-1 flex-wrap">
              <h1 class="text-2xl font-bold" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">{{ tool.name }}</h1>
              <span class="text-xs px-2 py-1 rounded-full"
                style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);">{{ toolTypeLabel(tool.toolType) }}</span>
              <span class="text-xs px-2 py-1 rounded-full" :style="providerBadgeStyle">
                {{ providerDisplayName }}
              </span>
            </div>
            <p class="mb-3" style="color: var(--cyber-text-dim);">{{ tool.description }}</p>
            <div class="flex items-center gap-4 text-sm flex-wrap">
              <span style="color: var(--cyber-text-dim);">{{ tool.modelId }}</span>
              <span style="color: var(--cyber-text-dim);">{{ tool.usageCount.toLocaleString() }}次使用</span>
              <span class="font-bold" :style="{ color: tool.isFree ? 'var(--cyber-green)' : 'var(--cyber-amber)' }">
                {{ tool.isFree ? `免费(每日${tool.freeDailyLimit}次)` : `${tool.coinCost} 圣力/次` }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具使用界面 -->
      <div class="cyber-card p-6">
        <h2 class="font-bold text-lg mb-4" style="color: var(--cyber-text); font-family: 'JetBrains Mono', monospace;">
          <span style="color: var(--cyber-cyan);">▍</span>{{ isImageTool ? '图像生成' : isVideoTool ? '视频生成' : '开始对话' }}
        </h2>

        <!-- ===== 文本对话模式 ===== -->
        <template v-if="!isImageTool && !isVideoTool">
          <!-- 对话历史 -->
          <div v-if="chatHistory.length > 0" class="space-y-3 mb-4 max-h-96 overflow-y-auto">
            <div v-for="(msg, idx) in chatHistory" :key="idx"
              class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              <div class="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
                :style="msg.role === 'user'
                  ? 'background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple)); color: #000; border-radius: 16px 16px 4px 16px;'
                  : 'background: rgba(0,240,255,0.05); color: var(--cyber-text); border: 1px solid var(--cyber-border); border-radius: 16px 16px 16px 4px;'">
                <div class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</div>
                <div class="text-xs mt-1 opacity-60">
                  {{ msg.role === 'user' ? '我' : tool.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- 精细化输入区域 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--cyber-text-dim);">需求描述</label>
              <el-input v-model="inputContent" type="textarea" :rows="4" :placeholder="inputPlaceholder"
                class="w-full" :disabled="generating" @keydown.ctrl.enter="handleSend" />
              <div class="flex justify-between items-center mt-1">
                <span class="text-xs" style="color: var(--cyber-text-dim);">把目标、对象、限制写清楚，效果更精准</span>
              </div>
            </div>

            <!-- 参数设置：文本类工具也像图像生成一样可选择 -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">使用场景</label>
                <el-select v-model="textScene" size="small" class="w-full">
                  <el-option v-for="item in textSceneOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">输出格式</label>
                <el-select v-model="textFormat" size="small" class="w-full">
                  <el-option label="完整方案" value="完整方案" />
                  <el-option label="步骤清单" value="步骤清单" />
                  <el-option label="表格对比" value="表格对比" />
                  <el-option label="话术模板" value="话术模板" />
                  <el-option label="文案成稿" value="文案成稿" />
                  <el-option label="复盘报告" value="复盘报告" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">语气风格</label>
                <el-select v-model="textTone" size="small" class="w-full">
                  <el-option label="专业严谨" value="专业严谨" />
                  <el-option label="通俗易懂" value="通俗易懂" />
                  <el-option label="营销转化" value="营销转化" />
                  <el-option label="亲和温暖" value="亲和温暖" />
                  <el-option label="简洁直接" value="简洁直接" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">内容长度</label>
                <el-select v-model="textLength" size="small" class="w-full">
                  <el-option label="精简版" value="精简版" />
                  <el-option label="标准版" value="标准版" />
                  <el-option label="详细版" value="详细版" />
                  <el-option label="深度版" value="深度版" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">适用平台</label>
                <el-select v-model="textPlatform" size="small" class="w-full">
                  <el-option v-for="item in textPlatformOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </div>
            </div>

            <!-- 操作栏 -->
            <div class="flex items-center justify-between pt-2 flex-wrap gap-3">
              <div class="flex items-center gap-3">
                <span class="text-sm" style="color: var(--cyber-text-dim);">
                  消耗：<strong :style="{ color: tool.isFree ? 'var(--cyber-green)' : 'var(--cyber-amber)' }">
                    {{ tool.isFree ? '免费' : `${tool.coinCost} 圣力` }}
                  </strong>
                </span>
                <button v-if="chatHistory.length > 0" @click="clearChat"
                  class="text-xs transition-colors" style="color: var(--cyber-text-dim);"
                  @mouseover="($event.currentTarget as HTMLElement).style.color='#ff4444'"
                  @mouseleave="($event.currentTarget as HTMLElement).style.color='var(--cyber-text-dim)'">
                  🗑️ 清空对话
                </button>
              </div>
              <el-button type="primary" size="large" :loading="generating" @click="handleSend"
                :disabled="!inputContent.trim()"
                style="min-width: 160px; height: 44px; background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple)) !important;">
                {{ generating ? '生成中...' : '✨ 开始生成' }}
              </el-button>
            </div>
          </div>

          <!-- 生成结果 -->
          <div v-if="singleResult" class="mt-6 pt-6" style="border-top: 1px solid var(--cyber-border);">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold" style="color: var(--cyber-text);">生成结果</h3>
              <div class="flex gap-2">
                <el-button size="small" @click="copyResult(singleResult)">📋 复制</el-button>
              </div>
            </div>
            <div class="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap"
              style="background: rgba(0,240,255,0.03); border: 1px solid var(--cyber-border); color: var(--cyber-text);">
              {{ singleResult }}
            </div>
          </div>
        </template>

        <!-- ===== 图像生成模式 ===== -->
        <template v-else-if="isImageTool">
          <div class="space-y-4">
            <div class="flex items-center justify-between gap-3 flex-wrap p-3 rounded-xl"
              style="background: rgba(255,0,255,0.05); border: 1px solid rgba(255,0,255,0.16);">
              <div>
                <div class="font-bold text-sm" style="color: var(--cyber-text);">当前：AI文生图</div>
                <div class="text-xs mt-0.5" style="color: var(--cyber-text-dim);">需要动态画面时，可切换到 AI视频生成。</div>
              </div>
              <router-link to="/tools/50"
                class="px-3 py-1.5 rounded-lg text-sm font-medium"
                style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.25);">
                🎬 去生成视频
              </router-link>
            </div>
            <!-- Prompt输入 -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--cyber-text-dim);">画面描述</label>
              <el-input v-model="imagePrompt" type="textarea" :rows="4"
                placeholder="请描述您想生成的画面，越详细效果越好。例如：一只穿着宇航服的猫咪在月球上漫步，背景是地球，写实风格，4K高清"
                class="w-full" :disabled="generating" />
            </div>

            <!-- 参数设置 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">尺寸</label>
                <el-select v-model="imageSize" size="small" class="w-full">
                  <el-option label="1:1 正方形" value="1:1" />
                  <el-option label="16:9 横版" value="16:9" />
                  <el-option label="9:16 竖版" value="9:16" />
                  <el-option label="512x512 小图" value="4:3" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">风格</label>
                <el-select v-model="imageStyle" size="small" class="w-full" placeholder="请选择风格">
                  <el-option label="自动" value="" />
                  <el-option label="写实" value="realistic" />
                  <el-option label="动漫" value="anime" />
                  <el-option label="油画" value="oil-painting" />
                  <el-option label="水彩" value="watercolor" />
                  <el-option label="像素" value="pixel-art" />
                  <el-option label="赛博朋克" value="cyberpunk" />
                  <el-option label="3D渲染" value="3d" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">数量</label>
                <el-select v-model="imageCount" size="small" class="w-full">
                  <el-option :label="'1张'" :value="1" />
                  <el-option :label="'2张'" :value="2" />
                  <el-option :label="'4张'" :value="4" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">质量</label>
                <el-select v-model="imageQuality" size="small" class="w-full">
                  <el-option label="标准 2K" value="standard" />
                  <el-option label="高清 HD" value="hd" />
                  <el-option label="超清 Ultra" value="ultra" />
                  <el-option label="大师 Master" value="master" />
                </el-select>
              </div>
            </div>

            <!-- 生成按钮 -->
            <div class="flex items-center justify-between pt-2 flex-wrap gap-3">
              <span class="text-sm" style="color: var(--cyber-text-dim);">
                消耗：<strong :style="{ color: tool.isFree ? 'var(--cyber-green)' : 'var(--cyber-amber)' }">
                  {{ tool.isFree ? '免费' : `${tool.coinCost * imageCount} 圣力` }}
                </strong>
              </span>
              <el-button type="primary" size="large" :loading="generating" @click="handleGenerateImage"
                :disabled="!imagePrompt.trim()"
                style="min-width: 160px; height: 44px; background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple)) !important;">
                {{ generating ? '生成中...' : '🎨 开始生成' }}
              </el-button>
            </div>
          </div>

          <!-- 生成的图片 -->
          <div v-if="generatedImages.length > 0 || generating" ref="mediaResultRef" class="mt-6 pt-6" style="border-top: 1px solid var(--cyber-border);">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold" style="color: var(--cyber-text);">生成结果 · 可直接查看/下载</h3>
              <el-button v-if="generatedImages.length > 0" size="small" @click="generatedImages = []">🗑️ 清除</el-button>
            </div>
            <!-- 加载中占位 -->
            <div v-if="generating && generatedImages.length === 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="i in imageCount" :key="i"
                class="rounded-xl overflow-hidden cyber-card flex items-center justify-center"
                style="height: 400px; background: rgba(0,240,255,0.03);">
                <div class="text-center">
                  <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style="background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple));">
                    <span class="text-3xl animate-spin">🎨</span>
                  </div>
                  <p class="text-sm" style="color: var(--cyber-text-dim);">AI正在创作中...</p>
                  <p class="text-xs mt-1" style="color: var(--cyber-text-dim);">预计需要 5-30 秒</p>
                </div>
              </div>
            </div>
            <!-- 图片结果 -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(url, idx) in generatedImages" :key="idx"
                class="relative group rounded-xl overflow-hidden cyber-card">
                <img :src="url" :alt="`生成图片 ${idx + 1}`" class="w-full h-auto min-h-[260px] object-contain"
                  loading="eager" @error="markMediaLoadError(url)" />
                <div v-if="mediaLoadErrors.includes(url)" class="p-3 text-xs"
                  style="color: var(--cyber-amber); background: rgba(255,184,0,0.08);">
                  微信内置浏览器没有直接渲染这张图，请点“打开原图”查看。
                </div>
                <div class="p-3 flex gap-2 flex-wrap">
                  <a :href="url" target="_blank" rel="noopener"
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.25);">
                    🔍 打开原图
                  </a>
                  <a :href="url" target="_blank" download
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style="background: rgba(255,184,0,0.1); color: var(--cyber-amber); border: 1px solid rgba(255,184,0,0.25);">
                    ⬇️ 下载图片
                  </a>
                  <button @click="copyResult(url)"
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style="background: rgba(255,255,255,0.06); color: var(--cyber-text); border: 1px solid var(--cyber-border);">
                    🔗 复制链接
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ===== 视频生成模式 ===== -->
        <template v-else-if="isVideoTool">
          <div class="space-y-4">
            <div class="flex items-center justify-between gap-3 flex-wrap p-3 rounded-xl"
              style="background: rgba(0,240,255,0.05); border: 1px solid rgba(0,240,255,0.16);">
              <div>
                <div class="font-bold text-sm" style="color: var(--cyber-text);">当前：AI视频生成</div>
                <div class="text-xs mt-0.5" style="color: var(--cyber-text-dim);">输入视频描述，选择时长和分辨率后开始生成。</div>
              </div>
              <router-link to="/tools/3"
                class="px-3 py-1.5 rounded-lg text-sm font-medium"
                style="background: rgba(255,0,255,0.1); color: var(--cyber-magenta); border: 1px solid rgba(255,0,255,0.25);">
                🎨 去生成图片
              </router-link>
            </div>
            <!-- Prompt输入 -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--cyber-text-dim);">视频描述</label>
              <el-input v-model="videoPrompt" type="textarea" :rows="4"
                placeholder="请描述您想生成的视频内容，越详细效果越好。例如：一只猫咪在草地上追逐蝴蝶，阳光明媚，慢动作，电影质感"
                class="w-full" :disabled="generating" />
            </div>

            <!-- 参数设置 -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">时长（真实上限15秒）</label>
                <el-select v-model="videoDuration" size="small" class="w-full">
                  <el-option :label="'2秒 快速测试'" :value="2" />
                  <el-option :label="'5秒'" :value="5" />
                  <el-option :label="'8秒'" :value="8" />
                  <el-option :label="'10秒'" :value="10" />
                  <el-option :label="'12秒'" :value="12" />
                  <el-option :label="'15秒 最长'" :value="15" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs mb-1" style="color: var(--cyber-text-dim);">分辨率</label>
                <el-select v-model="videoResolution" size="small" class="w-full">
                  <el-option label="720p 高清" value="720p" />
                  <el-option label="1080p 全高清" value="1080p" />
                </el-select>
              </div>
            </div>

            <!-- 生成按钮 -->
            <div class="flex items-center justify-between pt-2 flex-wrap gap-3">
              <span class="text-sm" style="color: var(--cyber-text-dim);">
                消耗：<strong :style="{ color: tool.isFree ? 'var(--cyber-green)' : 'var(--cyber-amber)' }">
                  {{ tool.isFree ? '免费' : `${tool.coinCost} 圣力` }}
                </strong>
              </span>
              <el-button type="primary" size="large" :loading="generating" @click="handleGenerateVideo"
                :disabled="!videoPrompt.trim()"
                style="min-width: 160px; height: 44px; background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple)) !important;">
                {{ generating ? '生成中...' : '🎬 开始生成' }}
              </el-button>
            </div>
          </div>

          <!-- 生成的视频 -->
          <div v-if="generatedVideo || generating" ref="mediaResultRef" class="mt-6 pt-6" style="border-top: 1px solid var(--cyber-border);">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold" style="color: var(--cyber-text);">生成结果 · 可直接播放/下载</h3>
              <el-button v-if="generatedVideo" size="small" @click="generatedVideo = ''">🗑️ 清除</el-button>
            </div>

            <!-- 加载中 -->
            <div v-if="generating && !generatedVideo"
              class="rounded-xl overflow-hidden cyber-card flex items-center justify-center"
              style="height: 400px; background: rgba(0,240,255,0.03);">
              <div class="text-center">
                <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style="background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple));">
                  <span class="text-2xl animate-spin">🎬</span>
                </div>
                <p class="text-sm" style="color: var(--cyber-text-dim);">视频生成中，预计需要 1-3 分钟...</p>
              </div>
            </div>

            <!-- 视频结果 -->
            <div v-if="generatedVideo" class="rounded-xl overflow-hidden cyber-card" style="background: rgba(0,240,255,0.03);">
              <video :src="generatedVideo" controls playsinline webkit-playsinline preload="metadata" class="w-full"
                style="max-height: 500px;" @error="markMediaLoadError(generatedVideo)"></video>
              <div v-if="mediaLoadErrors.includes(generatedVideo)" class="p-3 text-xs"
                style="color: var(--cyber-amber); background: rgba(255,184,0,0.08);">
                微信内置浏览器没有直接播放该视频，请点“打开视频”查看。
              </div>
              <div class="p-4 flex items-center justify-between flex-wrap gap-3">
                <div class="text-xs" style="color: var(--cyber-text-dim);">
                  模型: {{ lastModel }} | 耗时: {{ lastDurationMs }}ms
                </div>
                <div class="flex gap-2">
                  <a :href="generatedVideo" target="_blank" rel="noopener"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style="background: rgba(255,0,255,0.1); color: var(--cyber-magenta); border: 1px solid rgba(255,0,255,0.2);">
                    ▶️ 打开视频
                  </a>
                  <a :href="generatedVideo" target="_blank" download
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);">
                    ⬇️ 下载
                  </a>
                  <button @click="copyResult(generatedVideo)"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style="background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);">
                    🔗 复制链接
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 消耗提示 -->
        <div v-if="lastCoinCost > 0" class="mt-4 p-3 rounded-xl text-sm"
          style="background: rgba(255,184,0,0.08); border: 1px solid rgba(255,184,0,0.2); color: var(--cyber-amber);">
          💰 本次消耗 {{ lastCoinCost }} 圣力 | 耗时 {{ lastDurationMs }}ms | 模型: {{ lastModel }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { toolApi } from '@/api'
import service from '@/api/request'
import { toolTypeMap } from '@/utils'
import type { Tool, ChatMessage } from '@/types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const tool = ref<Tool | null>(null)
const loading = ref(true)
const generating = ref(false)

// ===== 文本对话状态 =====
const inputContent = ref('')
const chatHistory = ref<ChatMessage[]>([])
const singleResult = ref('')
const textScene = ref('自动匹配')
const textFormat = ref('完整方案')
const textTone = ref('专业严谨')
const textLength = ref('标准版')
const textPlatform = ref('通用')

// ===== 图像生成状态 =====
const imagePrompt = ref('')
const imageSize = ref('1024x1024')
const imageStyle = ref('')
const imageCount = ref(1)
const imageQuality = ref('standard')
const generatedImages = ref<string[]>([])
const mediaResultRef = ref<HTMLElement | null>(null)
const mediaLoadErrors = ref<string[]>([])

// ===== 视频生成状态 =====
const videoPrompt = ref('')
const videoDuration = ref(5)
const videoResolution = ref('720p')
const generatedVideo = ref<string>('')

// ===== 消耗信息 =====
const lastCoinCost = ref(0)
const lastDurationMs = ref(0)
const lastModel = ref('')

// ===== 计算属性 =====
const isImageTool = computed(() => tool.value?.toolType === 'image')
const isVideoTool = computed(() => tool.value?.toolType === 'video')

const toolText = computed(() => `${tool.value?.name || ''} ${tool.value?.description || ''} ${(tool.value as any)?.subCategory || ''}`)

const toolModule = computed(() => {
  const text = toolText.value
  if (/宠物|猫|狗|动物/.test(text)) return 'pet'
  if (/校园|伯雅|博雅|社团|班级|学生|教务/.test(text)) return 'campus'
  if (/电商|商品|店铺|门店|团购|成交|差评|供应链|直播带货/.test(text)) return 'ecommerce'
  if (/教育|教学|学习|课程|考试|刷题|教案|单词|口语/.test(text)) return 'education'
  if (/自媒体|内容|文案|抖音|小红书|公众号|短视频|脚本|直播|粉丝|热点/.test(text)) return 'media'
  return 'ai'
})

const textSceneOptions = computed(() => {
  const map: Record<string, string[]> = {
    media: ['自动匹配', '爆款选题', '短视频脚本', '小红书文案', '公众号文章', '直播话术', '账号诊断', '变现方案'],
    ecommerce: ['自动匹配', '商品上架', '店铺运营', '本地生活团购', '直播带货', '私域成交', '售后客服', '差评处理'],
    education: ['自动匹配', '课程设计', '教案课件', '学习规划', '考试备考', '错题分析', '语言学习', '职业提升'],
    pet: ['自动匹配', '喂养配餐', '行为训练', '健康护理', '用品选购', '宠物店经营', '宠物内容创作'],
    campus: ['自动匹配', '校园通知', '社团活动', '班级管理', '校园安全', '学习辅导', '职业启蒙', '心理支持'],
    ai: ['自动匹配', '通用问答', '方案策划', '数据分析', '合同审阅', '财务解读', '工作流拆解', '知识库问答'],
  }
  return map[toolModule.value] || map.ai
})

const textPlatformOptions = computed(() => {
  const map: Record<string, string[]> = {
    media: ['通用', '抖音', '小红书', '视频号', '公众号', 'B站', '快手'],
    ecommerce: ['通用', '抖音电商', '淘宝', '拼多多', '京东', '美团/本地生活', '私域社群'],
    education: ['通用', '课堂教学', '线上课程', '家校沟通', '考试训练', '职业培训'],
    pet: ['通用', '宠物店', '猫咪', '狗狗', '宠物医院', '宠物短视频'],
    campus: ['通用', '班级', '社团', '校园公众号', '家校通知', '就业服务'],
    ai: ['通用', '企业办公', '个人效率', '管理汇报', '项目策划', '数据报告'],
  }
  return map[toolModule.value] || map.ai
})

const providerDisplayName = computed(() => {
  if (!tool.value) return ''
  const map: Record<string, string> = {
    doubao: '豆包',
    jimeng: '即梦',
    openai: 'OpenAI',
    tongyi: '通义千问',
    deepseek: 'DeepSeek',
    yuanbao: '元宝',
    stability: 'Stability AI',
    'stability-ai': 'Stability AI',
  }
  return map[tool.value.provider] || tool.value.provider
})

const providerBadgeStyle = computed(() => {
  if (!tool.value) return 'background: rgba(136,136,170,0.1); color: var(--cyber-text-dim);'
  const map: Record<string, string> = {
    doubao: 'background: rgba(0,240,255,0.1); color: var(--cyber-cyan); border: 1px solid rgba(0,240,255,0.2);',
    jimeng: 'background: rgba(255,0,255,0.1); color: var(--cyber-magenta); border: 1px solid rgba(255,0,255,0.2);',
    openai: 'background: rgba(0,255,136,0.1); color: var(--cyber-green); border: 1px solid rgba(0,255,136,0.2);',
    tongyi: 'background: rgba(255,184,0,0.1); color: var(--cyber-amber); border: 1px solid rgba(255,184,0,0.2);',
    deepseek: 'background: rgba(88,166,255,0.1); color: #58a6ff; border: 1px solid rgba(88,166,255,0.2);',
    yuanbao: 'background: rgba(255,100,130,0.1); color: #ff6482; border: 1px solid rgba(255,100,130,0.2);',
    stability: 'background: rgba(255,107,107,0.1); color: #ff6b6b; border: 1px solid rgba(255,107,107,0.2);',
    'stability-ai': 'background: rgba(255,107,107,0.1); color: #ff6b6b; border: 1px solid rgba(255,107,107,0.2);',
  }
  return (map[tool.value.provider] || 'background: rgba(136,136,170,0.1); color: var(--cyber-text-dim);') + ' border: 1px solid transparent;'
})

const inputPlaceholder = computed(() => {
  if (!tool.value) return ''
  switch (tool.value.inputType) {
    case 'image': return '请上传或输入图片URL...'
    case 'file': return '请输入文件内容或URL...'
    default: return '请输入您的问题或需求，越详细效果越好...'
  }
})

function toolTypeLabel(type: string): string {
  return toolTypeMap[type] || type
}

// ===== 文本对话 =====
async function handleSend() {
  if (!inputContent.value.trim() || !tool.value) return ElMessage.warning('请输入内容')
  if (generating.value) return

  const rawInput = inputContent.value.trim()
  const userMessage = buildTextToolPrompt(rawInput)
  chatHistory.value.push({ role: 'user', content: userMessage })
  inputContent.value = ''
  generating.value = true

  try {
    const res = await toolApi.chat(Number(route.params.id), chatHistory.value)
    const assistantContent = res.data.content || '生成完成，暂无详细输出'
    chatHistory.value.push({ role: 'assistant', content: assistantContent })

    lastCoinCost.value = res.data.coinCost || 0
    lastDurationMs.value = res.data.durationMs || 0
    lastModel.value = res.data.model || tool.value.modelId

    ElMessage.success('生成完成！')
    await nextTick()
    scrollToBottom()
  } catch (e: any) {
    chatHistory.value.pop()
    inputContent.value = userMessage
    ElMessage.error(e?.message || '生成失败，请重试')
  } finally {
    generating.value = false
  }
}

function buildTextToolPrompt(rawInput: string): string {
  const toolName = tool.value?.name || 'AI工具'
  return [
    `工具：${toolName}`,
    `使用场景：${textScene.value}`,
    `适用平台：${textPlatform.value}`,
    `输出格式：${textFormat.value}`,
    `语气风格：${textTone.value}`,
    `内容长度：${textLength.value}`,
    '',
    `用户需求：${rawInput}`,
    '',
    '请严格按以上参数输出。结果要具体、可直接使用，不要空泛解释；如果是方案类，请给步骤；如果是文案类，请直接给成稿；如果是分析类，请给结论、原因和建议。'
  ].join('\n')
}

function clearChat() {
  chatHistory.value = []
  singleResult.value = ''
  lastCoinCost.value = 0
}

// ===== 图像生成 =====
async function handleGenerateImage() {
  if (!imagePrompt.value.trim() || !tool.value) return ElMessage.warning('请输入画面描述')
  if (generating.value) return

  generating.value = true
  try {
    const res = await toolApi.generateImage(
      Number(route.params.id),
      imagePrompt.value,
      {
        size: imageSize.value,
        style: imageStyle.value || undefined,
        count: imageCount.value,
        quality: imageQuality.value as 'standard' | 'hd' | 'ultra' | 'master',
      },
    )

    generatedImages.value = normalizeImageUrls(res.data)
    mediaLoadErrors.value = []
    lastCoinCost.value = res.data.coinCost || 0
    lastDurationMs.value = res.data.durationMs || 0
    lastModel.value = res.data.model || tool.value.modelId

    if (generatedImages.value.length > 0) {
      ElMessage.success(`成功生成 ${generatedImages.value.length} 张图片！`)
      await nextTick()
      scrollMediaResultIntoView()
    } else {
      ElMessage.warning('图片已生成，但暂未拿到可展示的图片链接，请稍后重试')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '图片生成失败，请重试')
  } finally {
    generating.value = false
  }
}

function normalizeImageUrls(data: any): string[] {
  const urls = data?.urls || data?.imageUrls || data?.images || []
  if (!Array.isArray(urls)) return []
  return urls.map((item: any) => {
    if (typeof item === 'string') return item
    return item?.url || item?.imageUrl || item?.src || item?.b64_json || ''
  }).filter(Boolean)
}

// ===== 视频生成 =====
async function handleGenerateVideo() {
  if (!videoPrompt.value.trim() || !tool.value) return ElMessage.warning('请输入视频描述')
  if (generating.value) return

  generating.value = true
  try {
    const res = await service.post(`/ai/tools/${route.params.id}/video`, {
      prompt: videoPrompt.value,
      duration: videoDuration.value,
      resolution: videoResolution.value,
    })

    if (res.data?.code !== 0) {
      throw new Error(res.data?.message || '视频生成失败，请重试')
    }
    generatedVideo.value = res.data.data?.videoUrl || ''
    if (!generatedVideo.value) {
      throw new Error('视频生成完成，但没有返回可播放的视频链接')
    }
    mediaLoadErrors.value = []
    lastCoinCost.value = res.data.data?.coinCost || 0
    lastDurationMs.value = res.data.data?.durationMs || 0
    lastModel.value = res.data.data?.model || tool.value.modelId

    ElMessage.success('视频生成成功！')
    await nextTick()
    scrollMediaResultIntoView()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || e?.message || '视频生成失败，请重试')
  } finally {
    generating.value = false
  }
}

// ===== 工具函数 =====
function copyResult(text: string) {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

function markMediaLoadError(url: string) {
  if (url && !mediaLoadErrors.value.includes(url)) mediaLoadErrors.value.push(url)
}

function scrollMediaResultIntoView() {
  mediaResultRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToBottom() {
  const el = document.querySelector('.max-h-96')
  if (el) el.scrollTop = el.scrollHeight
}

onMounted(async () => {
  try {
    const res = await toolApi.getToolDetail(Number(route.params.id))
    tool.value = res.data
  } finally {
    loading.value = false
  }
})
</script>
