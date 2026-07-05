<template>
  <div class="video-page">
    <section class="hero">
      <div>
        <p class="eyebrow">CYBERPUNK VIDEO PIPELINE</p>
        <h1>开源 Skill 短视频流水线</h1>
        <p>并行于原生视频生成模块，生成短视频任务包：脚本、镜头、配音、字幕和成片任务都会一次性生成；下方三个 Skill 按钮可继续生成成片、配音、字幕后处理任务。</p>
      </div>
      <div class="cost">50 圣力/次</div>
    </section>

    <section class="workspace">
      <div class="panel form-panel">
        <h2>创作输入</h2>
        <el-form label-position="top">
          <el-form-item label="短视频主题">
            <el-input v-model="form.topic" maxlength="80" show-word-limit placeholder="例如：罗圣纪元 AI 赋能本地商家" />
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
          <el-button type="primary" size="large" :loading="loading" @click="generate">生成短视频任务</el-button>
        </el-form>

        <div class="skill-note">
          <b>隔离策略</b>
          <span>本页生成的是可执行视频任务包；后处理按钮可生成成片/配音/字幕任务，接入完整容器后自动输出视频文件。</span>
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
          <div class="video-task">
            <div class="play-mark">▶</div>
            <div>
              <b>{{ plan.videoTask?.estimatedRender || '短视频任务包' }}</b>
              <p>{{ plan.videoTask?.note }}</p>
            </div>
          </div>
          <div class="block">
            <h3>口播脚本</h3>
            <pre>{{ plan.script }}</pre>
          </div>
          <div class="block">
            <h3>电子配音</h3>
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
          <div class="action-panel">
            <button
              v-for="item in plan.actions"
              :key="item.id"
              class="action-pill"
              :disabled="actionLoading === item.id"
              @click="runAction(item.id)"
            >
              <span>{{ actionLoading === item.id ? '生成中...' : item.label }}</span>
              <small>{{ item.skill }}</small>
            </button>
          </div>
          <div class="task-results" v-if="tasks.length">
            <h3>后处理任务</h3>
            <div v-for="task in tasks" :key="task.id" class="task-card">
              <b>{{ task.label }} · {{ statusText(task.status) }}</b>
              <p>{{ task.result }}</p>
              <pre v-if="task.subtitles">{{ task.subtitles.join('\n') }}</pre>
            </div>
          </div>
        </template>
        <div v-else class="empty">
          <div>🎬</div>
          <p>输入主题后生成赛博朋克短视频任务包</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import service from '@/api/request'

const loading = ref(false)
const actionLoading = ref('')
const form = ref({ topic: '', style: '赛博朋克霓虹', duration: 15 })
const plan = ref<any>(null)
const tasks = ref<any[]>([])

async function generate() {
  if (!form.value.topic.trim()) return ElMessage.warning('请输入短视频主题')
  loading.value = true
  try {
    const res = await service.post('/skills/video-pipeline/generate', form.value)
    plan.value = res.data.data.plan
    tasks.value = []
    ElMessage.success(`已生成，消耗 ${res.data.data.cost} 圣力`)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '生成失败')
  } finally {
    loading.value = false
  }
}

async function runAction(action: string) {
  if (!plan.value?.jobId) return ElMessage.warning('请先生成短视频任务')
  actionLoading.value = action
  try {
    const res = await service.post('/skills/video-pipeline/action', { jobId: plan.value.jobId, action, plan: plan.value })
    tasks.value.unshift(res.data.data.task)
    ElMessage.success(res.data.message || '后处理任务已生成')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '后处理失败')
  } finally {
    actionLoading.value = ''
  }
}

function statusText(status: string) {
  return { queued: '已排队', done: '已完成', failed: '失败' }[status] || status
}
</script>

<style scoped>
.video-page { max-width: 1180px; margin: 0 auto; padding: 28px 16px 48px; color: #e6f6ff; }
.hero { display: flex; justify-content: space-between; gap: 20px; align-items: center; padding: 26px; border-radius: 22px; border: 1px solid rgba(0,240,255,.2); background: radial-gradient(circle at top left, rgba(0,240,255,.16), transparent 35%), rgba(10,12,22,.85); margin-bottom: 20px; }
.eyebrow { color: #00f0ff; letter-spacing: 2px; font: 700 12px 'JetBrains Mono', monospace; margin: 0 0 8px; }
h1 { margin: 0; font-size: 30px; } .hero p { color: #99a8c9; line-height: 1.8; max-width: 780px; }
.cost { color: #ffb800; border: 1px solid rgba(255,184,0,.28); border-radius: 999px; padding: 10px 16px; white-space: nowrap; }
.workspace { display: grid; grid-template-columns: 360px 1fr; gap: 18px; }
.panel { border: 1px solid rgba(0,240,255,.16); border-radius: 18px; background: rgba(10,12,22,.88); padding: 20px; }
.w-full { width: 100%; }
.skill-note { margin-top: 18px; padding: 14px; border-radius: 12px; background: rgba(255,0,255,.06); color: #9aa4c7; }
.skill-note b { color: #ff00ff; display: block; margin-bottom: 6px; }
.result-head { display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; }
.job-line { color: #8ea1c8; margin: 4px 0 0; font-size: 12px; }
h2 { margin: 0 0 14px; color: #fff; }
.video-task { display: flex; gap: 14px; align-items: center; margin-top: 10px; padding: 16px; border: 1px solid rgba(255,0,255,.2); border-radius: 14px; background: linear-gradient(135deg, rgba(255,0,255,.08), rgba(0,240,255,.06)); }
.play-mark { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #050812; background: linear-gradient(135deg, #00f0ff, #ff00ff); font-weight: 900; box-shadow: 0 0 22px rgba(255,0,255,.35); }
.video-task b { color: #fff; } .video-task p { color: #9aa4c7; margin: 6px 0 0; line-height: 1.6; }
.block { margin-top: 14px; padding: 14px; background: rgba(0,240,255,.05); border-radius: 12px; }
h3 { color: #00f0ff; margin: 0 0 8px; font-size: 14px; }
pre { white-space: pre-wrap; word-break: break-word; color: #dce7ff; line-height: 1.7; font-family: inherit; margin: 0; }
.shot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 14px; }
.shot-card { padding: 14px; border-radius: 12px; border: 1px solid rgba(0,240,255,.14); background: rgba(0,0,0,.22); }
.shot-card span { color: #ffb800; font-size: 12px; } .shot-card b { display: block; margin: 6px 0; color: #fff; } .shot-card p { color: #8fa0c4; font-size: 12px; }
.action-panel { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.action-pill { cursor: pointer; border: 1px solid rgba(255,0,255,.38); color: #ff91ff; background: rgba(255,0,255,.06); border-radius: 999px; padding: 8px 13px; font-size: 12px; transition: .2s; }
.action-pill small { display: block; color: #9aa4c7; font-size: 10px; margin-top: 2px; }
.action-pill:active { transform: scale(.98); }
.action-pill:disabled { opacity: .6; cursor: wait; }
.task-results { margin-top: 16px; }
.task-card { margin-top: 10px; padding: 12px; border-radius: 12px; background: rgba(255,0,255,.06); border: 1px solid rgba(255,0,255,.14); }
.task-card b { color: #ffb8ff; } .task-card p { color: #9aa4c7; margin: 6px 0; }
.empty { min-height: 420px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #7f8aae; }
.empty div { font-size: 54px; margin-bottom: 10px; }
@media (max-width: 860px) { .hero { flex-direction: column; align-items: flex-start; } .workspace { grid-template-columns: 1fr; } }
</style>
