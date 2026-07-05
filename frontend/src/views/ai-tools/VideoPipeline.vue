<template>
  <div class="video-page">
    <section class="hero">
      <div>
        <p class="eyebrow">CYBERPUNK VIDEO PIPELINE</p>
        <h1>开源 Skill 短视频流水线</h1>
        <p>文字方案和完整成片分开生成、分开扣圣力：文字方案只输出策划脚本，完整成片会串联配音、画面、字幕并生成可播放 MP4。</p>
      </div>
      <div class="cost-box">
        <span>文字方案 10 圣力</span>
        <b>完整成片 50 圣力</b>
      </div>
    </section>

    <section class="workspace">
      <div class="panel form-panel">
        <h2>创作输入</h2>
        <el-form label-position="top">
          <el-form-item label="短视频主题">
            <el-input v-model="form.topic" maxlength="80" show-word-limit placeholder="例如：祁阳本地餐饮开业促销" />
          </el-form-item>
          <el-form-item label="视觉风格">
            <el-select v-model="form.style" class="w-full">
              <el-option label="赛博朋克霓虹" value="赛博朋克霓虹" />
              <el-option label="电子商务爆款" value="电子商务爆款" />
              <el-option label="企业科技宣传" value="企业科技宣传" />
              <el-option label="校园活力短片" value="校园活力短片" />
            </el-select>
          </el-form-item>
          <el-form-item label="时长">
            <el-slider v-model="form.duration" :min="10" :max="60" :step="5" show-input />
          </el-form-item>
          <div class="button-grid">
            <el-button type="info" size="large" :loading="planLoading" @click="generatePlan">生成文字方案 · 10圣力</el-button>
            <el-button type="primary" size="large" :loading="renderLoading" @click="renderVideo">生成完整成片 · 50圣力</el-button>
          </div>
        </el-form>

        <div class="skill-note">
          <b>功能区别</b>
          <span>文字方案只生成脚本和分镜；完整成片会生成真实 MP4 视频，右侧“成片预览”可直接播放。</span>
        </div>
      </div>

      <div class="panel result-panel">
        <template v-if="plan">
          <div class="result-head">
            <div>
              <p class="eyebrow">RESULT</p>
              <h2>{{ plan.title }}</h2>
              <p class="job-line">任务编号：{{ plan.jobId }} · {{ plan.statusLabel }}</p>
            </div>
            <el-tag effect="dark">{{ plan.duration }}秒</el-tag>
          </div>

          <el-tabs v-model="activeTab" class="result-tabs">
            <el-tab-pane label="文字方案" name="plan">
              <div class="block">
                <h3>口播脚本</h3>
                <pre>{{ plan.script }}</pre>
              </div>
              <div class="block">
                <h3>电子配音文案</h3>
                <p>{{ plan.voiceover }}</p>
              </div>
              <div class="shot-grid">
                <div v-for="shot in plan.shots" :key="shot.time" class="shot-card">
                  <span>{{ shot.time }}</span>
                  <b>{{ shot.scene }}</b>
                  <p>{{ shot.prompt }}</p>
                </div>
              </div>
              <div class="block" v-if="plan.aiText">
                <h3>豆包增强方案</h3>
                <pre>{{ plan.aiText }}</pre>
              </div>
            </el-tab-pane>

            <el-tab-pane label="成片预览" name="preview">
              <div class="render-card" :class="{ playable: !!videoSrc }" @click="playVideo">
                <div class="play-mark">{{ videoSrc ? '▶' : '...' }}</div>
                <div>
                  <b>{{ plan.videoTask?.estimatedRender || '竖屏短视频' }}</b>
                  <p>{{ plan.videoTask?.note }}</p>
                </div>
              </div>

              <div class="progress-card">
                <div v-for="stage in pipelineStages" :key="stage.name" class="stage-row">
                  <div>
                    <b>{{ stage.name }}</b>
                    <span>{{ stage.tool }}</span>
                  </div>
                  <el-progress :percentage="stage.progress" :status="stage.status === 'failed' ? 'exception' : stage.progress === 100 ? 'success' : undefined" />
                </div>
              </div>

              <div v-if="videoSrc" class="video-player-card">
                <video ref="videoRef" :src="videoSrc" controls playsinline preload="metadata"></video>
                <div class="video-actions">
                  <el-button size="small" type="primary" @click.stop="playVideo">播放视频</el-button>
                  <el-button size="small" @click.stop="openVideo">打开视频</el-button>
                </div>
              </div>
              <div v-else class="no-video">
                当前还没有成片。请点击左侧“生成完整成片 · 50圣力”。
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>
        <div v-else class="empty">
          <div>🎬</div>
          <p>先选择“文字方案”或“完整成片”</p>
        </div>
      </div>
    </section>

    <section class="pipeline-visual">
      <div class="pipeline-node"><b>1. 文本方案</b><span>CopilotKit / Doubao</span></div>
      <div class="pipeline-arrow">→</div>
      <div class="pipeline-node"><b>2. 电子配音</b><span>GPT-SoVITS 适配</span></div>
      <div class="pipeline-arrow">→</div>
      <div class="pipeline-node"><b>3. 画面成片</b><span>MoneyPrinterTurbo 适配</span></div>
      <div class="pipeline-arrow">→</div>
      <div class="pipeline-node"><b>4. 字幕合成</b><span>auto-subtitle</span></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import service from '@/api/request'

const planLoading = ref(false)
const renderLoading = ref(false)
const activeTab = ref('plan')
const form = ref({ topic: '', style: '赛博朋克霓虹', duration: 15 })
const plan = ref<any>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

const videoSrc = computed(() => {
  const url = plan.value?.videoUrl || plan.value?.videoTask?.previewUrl || ''
  if (!url) return ''
  return url.startsWith('http') ? url : `https://api.lsjyapp.cn${url}`
})

const pipelineStages = computed(() => {
  return plan.value?.pipelineStages || [
    { name: '文字方案', tool: 'CopilotKit/Doubao', progress: plan.value ? 100 : 0, status: plan.value ? 'done' : 'waiting' },
    { name: '配音合成', tool: 'GPT-SoVITS', progress: 0, status: 'waiting' },
    { name: '画面成片', tool: 'MoneyPrinterTurbo', progress: 0, status: 'waiting' },
    { name: '字幕合成', tool: 'auto-subtitle', progress: 0, status: 'waiting' },
  ]
})

function validateTopic() {
  if (!form.value.topic.trim()) {
    ElMessage.warning('请输入短视频主题')
    return false
  }
  return true
}

async function generatePlan() {
  if (!validateTopic()) return
  planLoading.value = true
  try {
    const res = await service.post('/skills/video-pipeline/plan', form.value)
    plan.value = res.data.data.plan
    activeTab.value = 'plan'
    ElMessage.success(`文字方案已生成，消耗 ${res.data.data.cost} 圣力`)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '生成失败')
  } finally {
    planLoading.value = false
  }
}

async function renderVideo() {
  if (!validateTopic()) return
  renderLoading.value = true
  activeTab.value = 'preview'
  plan.value = {
    title: `《${form.value.topic}》完整成片生成中`,
    jobId: `render-${Date.now()}`,
    statusLabel: '正在生成完整成片',
    duration: form.value.duration,
    videoTask: { estimatedRender: `${form.value.duration}秒竖屏短视频`, note: '正在串联文字、配音、画面、字幕，请稍等...' },
    pipelineStages: [
      { name: '文字方案', tool: 'CopilotKit/Doubao', status: 'done', progress: 100 },
      { name: '配音合成', tool: 'GPT-SoVITS', status: 'running', progress: 45 },
      { name: '画面成片', tool: 'MoneyPrinterTurbo', status: 'running', progress: 55 },
      { name: '字幕合成', tool: 'auto-subtitle', status: 'running', progress: 35 },
    ],
    shots: [],
  }
  try {
    const res = await service.post('/skills/video-pipeline/render', form.value)
    plan.value = res.data.data.plan
    activeTab.value = 'preview'
    ElMessage.success(`完整成片已生成，消耗 ${res.data.data.cost} 圣力`)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '成片失败')
  } finally {
    renderLoading.value = false
  }
}

function playVideo() {
  if (!videoSrc.value) return ElMessage.warning('视频还没有生成成功')
  videoRef.value?.play()
}

function openVideo() {
  if (!videoSrc.value) return ElMessage.warning('视频还没有生成成功')
  window.open(videoSrc.value, '_blank')
}
</script>

<style scoped>
.video-page { max-width: 1180px; margin: 0 auto; padding: 28px 16px 48px; color: #e6f6ff; }
.hero { display: flex; justify-content: space-between; gap: 20px; align-items: center; padding: 26px; border-radius: 22px; border: 1px solid rgba(0,240,255,.2); background: radial-gradient(circle at top left, rgba(0,240,255,.16), transparent 35%), rgba(10,12,22,.85); margin-bottom: 20px; }
.eyebrow { color: #00f0ff; letter-spacing: 2px; font: 700 12px 'JetBrains Mono', monospace; margin: 0 0 8px; }
h1 { margin: 0; font-size: 30px; } .hero p { color: #99a8c9; line-height: 1.8; max-width: 780px; }
.cost-box { border: 1px solid rgba(255,184,0,.28); border-radius: 14px; padding: 10px 16px; white-space: nowrap; text-align: right; }
.cost-box span { display: block; color: #9aa4c7; font-size: 12px; } .cost-box b { color: #ffb800; }
.workspace { display: grid; grid-template-columns: 360px 1fr; gap: 18px; }
.panel { border: 1px solid rgba(0,240,255,.16); border-radius: 18px; background: rgba(10,12,22,.88); padding: 20px; }
.w-full { width: 100%; }
.button-grid { display: grid; gap: 10px; }
.skill-note { margin-top: 18px; padding: 14px; border-radius: 12px; background: rgba(255,0,255,.06); color: #9aa4c7; }
.skill-note b { color: #ff00ff; display: block; margin-bottom: 6px; }
.result-head { display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; }
.job-line { color: #8ea1c8; margin: 4px 0 0; font-size: 12px; }
h2 { margin: 0 0 14px; color: #fff; }
.result-tabs { margin-top: 12px; }
.block { margin-top: 14px; padding: 14px; background: rgba(0,240,255,.05); border-radius: 12px; }
h3 { color: #00f0ff; margin: 0 0 8px; font-size: 14px; }
pre { white-space: pre-wrap; word-break: break-word; color: #dce7ff; line-height: 1.7; font-family: inherit; margin: 0; }
.shot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; margin-top: 14px; }
.shot-card { padding: 14px; border-radius: 12px; border: 1px solid rgba(0,240,255,.14); background: rgba(0,0,0,.22); }
.shot-card span { color: #ffb800; font-size: 12px; } .shot-card b { display: block; margin: 6px 0; color: #fff; } .shot-card p { color: #8fa0c4; font-size: 12px; }
.render-card { display: flex; gap: 14px; align-items: center; padding: 16px; border: 1px solid rgba(255,0,255,.22); border-radius: 14px; background: linear-gradient(135deg, rgba(255,0,255,.08), rgba(0,240,255,.06)); }
.render-card.playable { cursor: pointer; box-shadow: 0 0 26px rgba(255,0,255,.2); }
.play-mark { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #050812; background: linear-gradient(135deg, #00f0ff, #ff00ff); font-weight: 900; }
.render-card b { color: #fff; } .render-card p { color: #9aa4c7; margin: 6px 0 0; line-height: 1.6; }
.progress-card { margin-top: 14px; padding: 14px; border-radius: 12px; background: rgba(0,240,255,.04); }
.stage-row { display: grid; grid-template-columns: 180px 1fr; gap: 12px; align-items: center; margin-bottom: 10px; }
.stage-row b { color: #eaf6ff; display: block; } .stage-row span { color: #8fa0c4; font-size: 12px; }
.video-player-card { margin-top: 14px; padding: 12px; border-radius: 16px; border: 1px solid rgba(0,240,255,.18); background: rgba(0,0,0,.28); }
.video-player-card video { width: 100%; max-height: 640px; border-radius: 12px; background: #000; display: block; }
.video-actions { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
.no-video { color: #9aa4c7; text-align: center; padding: 40px 0; }
.empty { min-height: 420px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #7f8aae; }
.empty div { font-size: 54px; margin-bottom: 10px; }
.pipeline-visual { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; gap: 10px; align-items: center; margin-top: 18px; }
.pipeline-node { border: 1px solid rgba(0,240,255,.16); background: rgba(10,12,22,.8); border-radius: 14px; padding: 14px; }
.pipeline-node b { color: #00f0ff; display: block; } .pipeline-node span { color: #9aa4c7; font-size: 12px; }
.pipeline-arrow { color: #ff00ff; font-weight: 900; }
@media (max-width: 860px) { .hero { flex-direction: column; align-items: flex-start; } .workspace, .pipeline-visual { grid-template-columns: 1fr; } .pipeline-arrow { display: none; } .stage-row { grid-template-columns: 1fr; } }
</style>
