<template>
  <div class="cyber-login-page">
    <div class="cyber-bg">
      <div class="grid-overlay"></div>
      <div class="scan-line"></div>
      <div class="particle" v-for="i in 20" :key="i" :style="particleStyle(i)"></div>
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
    </div>
    <div class="login-container">
      <div class="logo-section">
        <div class="logo-ring" style="--ring-color: #ff00ff;">
          <div class="logo-ring-inner">
            <img src="/company-logo.jpg" alt="罗圣纪元" class="company-logo-img" />
          </div>
          <div class="logo-ring-glow" style="--glow-color: rgba(255,0,255,0.3);"></div>
        </div>
        <h1 class="cyber-title"><span class="title-text">罗圣纪元</span></h1>
        <p class="cyber-subtitle" style="color: #ff00ff;">ADMIN CONSOLE · 管理后台</p>
        <div class="cyber-divider">
          <span class="divider-line" style="background: linear-gradient(90deg, transparent, #ff00ff);"></span>
          <span class="divider-diamond" style="color: #ff00ff;">&#9670;</span>
          <span class="divider-line" style="background: linear-gradient(90deg, #ff00ff, transparent);"></span>
        </div>
      </div>
      <div class="login-panel cyber-card">
        <div class="panel-header">
          <span class="panel-icon" style="color: #ff00ff;">&#9671;</span>
          <span class="panel-title">管理员身份验证</span>
          <span class="panel-status online">&#9679; SECURE</span>
        </div>
        <div v-if="isLocked" class="cyber-alert danger">
          <div class="alert-icon">&#9888;</div>
          <div class="alert-text">
            <div class="alert-title">系统锁定</div>
            <div class="alert-desc">密码连续错误5次，账号已锁定</div>
            <div class="lock-timer">{{ lockCountdown }}</div>
          </div>
        </div>
        <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin" class="cyber-form">
          <div class="input-group">
            <label class="input-label"><span class="label-icon">&#10016;</span> 管理员账号</label>
            <el-input v-model="form.account" placeholder="输入管理员身份标识" size="large" :disabled="isLocked" />
          </div>
          <div class="input-group">
            <label class="input-label"><span class="label-icon">&#10016;</span> 安全密钥</label>
            <el-input v-model="form.password" type="password" placeholder="输入安全密钥" size="large" show-password :disabled="isLocked" @keyup.enter="handleLogin" />
          </div>
          <el-form-item>
            <button type="submit" class="cyber-btn cyber-btn-primary cyber-btn-large" :disabled="isLocked || loading" style="--btn-color: #ff00ff;">
              <span class="btn-shine"></span>
              <span class="btn-text">{{ loading ? '验证中...' : '进入管理后台' }}</span>
            </button>
          </el-form-item>
        </el-form>
        <div class="register-link">
          <router-link to="/login" class="cyber-link" style="color: #00f0ff;">← 返回前台登录</router-link>
        </div>
      </div>
      <div class="footer-info">
        <p class="footer-text">&copy; 2026 罗圣纪元 · 管理后台 v2.0</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ account: '', password: '' })
const rules = {
  account: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密钥', trigger: 'blur' }, { min: 6, message: '密钥至少6位', trigger: 'blur' }]
}
const isLocked = ref(false)
const lockCountdown = ref('')
const failCount = ref(0)
let lockTimer: any = null
async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    loading.value = true
    try {
      const ok = await authStore.login(form.account, form.password)
      if (ok) {
        if (!authStore.isAdmin) {
          ElMessage.error('该账号无管理员权限')
          await authStore.logout()
          return
        }
        ElMessage.success('管理员验证通过')
        router.push('/admin/dashboard')
      } else {
        failCount.value++
        if (failCount.value >= 5) {
          isLocked.value = true
          let sec = 600
          lockTimer = setInterval(() => {
            sec--
            const m = Math.floor(sec / 60)
            const s = sec % 60
            lockCountdown.value = `${m}:${s.toString().padStart(2, '0')}`
            if (sec <= 0) { clearInterval(lockTimer); isLocked.value = false; failCount.value = 0 }
          }, 1000)
        }
      }
    } catch (e: any) {
      ElMessage.error(e?.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}
function particleStyle(i: number) {
  const x = Math.random() * 100, y = Math.random() * 100
  const d = 5 + Math.random() * 15, s = 1 + Math.random() * 3
  return { left: `${x}%`, top: `${y}%`, width: `${s}px`, height: `${s}px`, animationDuration: `${d}s`, animationDelay: `${Math.random() * 5}s` }
}
onUnmounted(() => { if (lockTimer) clearInterval(lockTimer) })
</script>
<style scoped>
.cyber-login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0f; position: relative; overflow: hidden; }
.cyber-bg { position: absolute; inset: 0; z-index: 0; }
.grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,0,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }
.scan-line { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(255,0,255,0.4), transparent); animation: scan 4s linear infinite; }
@keyframes scan { 0% { top: -2px; } 100% { top: 100%; } }
.particle { position: absolute; border-radius: 50%; background: rgba(255,0,255,0.6); animation: float linear infinite; }
@keyframes float { 0%, 100% { opacity: 0; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-30px); } }
.glow-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15; }
.orb-1 { width: 300px; height: 300px; background: #ff00ff; top: 10%; left: 10%; }
.orb-2 { width: 200px; height: 200px; background: #00f0ff; bottom: 15%; right: 15%; }
.login-container { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; padding: 2rem; max-width: 420px; width: 100%; }
.logo-section { text-align: center; margin-bottom: 2rem; }
.logo-ring { width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--ring-color, #ff00ff); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; position: relative; }
.logo-ring-inner { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; }
.company-logo-img { width: 100%; height: 100%; object-fit: cover; }
.logo-ring-glow { position: absolute; inset: -4px; border-radius: 50%; box-shadow: 0 0 20px var(--glow-color, rgba(255,0,255,0.3)); }
.cyber-title { font-size: 1.8rem; font-weight: 700; color: #fff; font-family: 'JetBrains Mono', monospace; }
.cyber-subtitle { color: #ff00ff; font-size: 0.85rem; margin-top: 0.5rem; letter-spacing: 2px; }
.cyber-divider { display: flex; align-items: center; gap: 8px; margin-top: 1rem; }
.divider-line { width: 40px; height: 1px; background: linear-gradient(90deg, transparent, #ff00ff); }
.login-panel { width: 100%; background: rgba(18,18,31,0.9); border: 1px solid rgba(255,0,255,0.15); border-radius: 12px; padding: 2rem; backdrop-filter: blur(20px); }
.panel-header { display: flex; align-items: center; gap: 8px; margin-bottom: 1.5rem; font-family: 'JetBrains Mono', monospace; }
.panel-icon { font-size: 1.2rem; }
.panel-title { font-size: 1rem; font-weight: 600; color: #e0e0ff; flex: 1; }
.panel-status { font-size: 0.7rem; color: #00ff88; }
.cyber-alert { padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; }
.cyber-alert.danger { background: rgba(255,60,60,0.1); border: 1px solid rgba(255,60,60,0.3); color: #ff6666; }
.input-group { margin-bottom: 1rem; }
.input-label { display: block; font-size: 0.8rem; color: #8888aa; margin-bottom: 0.4rem; font-family: 'JetBrains Mono', monospace; }
.label-icon { color: #ff00ff; margin-right: 4px; }
.cyber-form :deep(.el-input__wrapper) { background: rgba(255,0,255,0.05) !important; box-shadow: 0 0 0 1px rgba(255,0,255,0.2) inset !important; border-radius: 8px; }
.cyber-form :deep(.el-input__inner) { color: #e0e0ff !important; }
.cyber-btn { width: 100%; padding: 0.8rem; border: 1px solid var(--btn-color, #ff00ff); background: rgba(255,0,255,0.1); color: var(--btn-color, #ff00ff); border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; font-family: 'JetBrains Mono', monospace; }
.cyber-btn:hover:not(:disabled) { background: rgba(255,0,255,0.2); box-shadow: 0 0 20px rgba(255,0,255,0.2); }
.cyber-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-shine { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); animation: shine 3s infinite; }
@keyframes shine { 0% { left: -100%; } 100% { left: 200%; } }
.register-link { text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: #8888aa; }
.cyber-link { color: #00f0ff; text-decoration: none; font-weight: 500; }
.footer-info { text-align: center; margin-top: 2rem; }
.footer-text { font-size: 0.75rem; color: #4a4a6a; }
</style>
