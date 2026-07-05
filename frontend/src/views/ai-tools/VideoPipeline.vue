<template>
  <div class="video-page">
    <section class="hero">
      <div>
        <p class="eyebrow">CYBERPUNK VIDEO PIPELINE</p>
        <h1>开源 Skill 短视频流水线</h1>
        <p>并行于原生视频生成模块，先提供 15 秒短视频脚本、镜头提示词、电子配音文案和霓虹字幕方案；MoneyPrinterTurbo、GPT-SoVITS、auto-subtitle 部署后可继续升级为自动成片。</p>
      </div>
      <div class="cost">3 圣力/次</div>
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
          <el-button type="primary" size="large" :loading="loading" @click="generate">生成短视频方案</el-button>
        </el-form>

        <div class="skill-note">
          <b>隔离策略</b>
          <span>不替换原生视频生成；不直接调用未部署容器；生成结果记录到作品历史和工具统计。</span>
        </div>
      </div>

      <div class="panel result-panel">
        <template v-if="plan">
          <div class="result-head">
            <div>
              <p class="eyebrow">RESULT</p>
              <h2>{{ plan.title }}</h2>
            </div>
            <el-tag effect="dark">{{ plan.duration }}秒</el-tag>
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
          <div class="next">
            <span v-for="step in plan.nextSteps" :key="step">{{ step }}</span>
          </div>
        </template>
        <div v-else class="empty">
          <div>🎬</div>
          <p>输入主题后生成赛博朋克短视频方案</p>
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
const form = ref({ topic: '', style: '赛博朋克霓虹', duration: 15 })
const plan = ref<any>(null)

async function generate() {
  if (!form.value.topic.trim()) return ElMessage.warning('请输入短视频主题')
  loading.value = true
  try {
    const res = await service.post('/skills/video-pipeline/generate', form.value)
    plan.value = res.data.data.plan
    ElMessage.success(`已生成，消耗 ${res.data.data.cost} 圣力`)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '生成失败')
  } finally {
    loading.value = false
  }
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
h2 { margin: 0 0 14px; color: #fff; }
.block { margin-top: 14px; padding: 14px; background: rgba(0,240,255,.05); border-radius: 12px; }
h3 { color: #00f0ff; margin: 0 0 8px; font-size: 14px; }
pre { white-space: pre-wrap; word-break: break-word; color: #dce7ff; line-height: 1.7; font-family: inherit; margin: 0; }
.shot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 14px; }
.shot-card { padding: 14px; border-radius: 12px; border: 1px solid rgba(0,240,255,.14); background: rgba(0,0,0,.22); }
.shot-card span { color: #ffb800; font-size: 12px; } .shot-card b { display: block; margin: 6px 0; color: #fff; } .shot-card p { color: #8fa0c4; font-size: 12px; }
.next { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.next span { border: 1px solid rgba(255,0,255,.24); color: #ff8cff; border-radius: 999px; padding: 6px 10px; font-size: 12px; }
.empty { min-height: 420px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #7f8aae; }
.empty div { font-size: 54px; margin-bottom: 10px; }
@media (max-width: 860px) { .hero { flex-direction: column; align-items: flex-start; } .workspace { grid-template-columns: 1fr; } }
</style>
