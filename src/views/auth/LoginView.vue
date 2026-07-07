<template>
  <div class="cyber-login-page">
    <!-- 动态背景 -->
    <div class="cyber-bg">
      <div class="grid-overlay"></div>
      <div class="scan-line"></div>
      <div class="hex-grid"></div>
      <div class="particle" v-for="i in 25" :key="i" :style="particleStyle(i)"></div>
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
      <div class="glow-orb orb-3"></div>
    </div>

    <!-- 登录容器 -->
    <div class="login-container">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-ring">
          <div class="logo-ring-inner">
            <img src="/company-logo.jpg" alt="罗圣纪元" class="logo-img" />
          </div>
          <div class="logo-ring-glow"></div>
        </div>
        <h1 class="cyber-title">
          <span class="title-text">罗圣纪元</span>
        </h1>
        <p class="cyber-subtitle">LUOSHENG EPOCH &middot; AI赋能实体经济</p>
        <div class="cyber-divider">
          <span class="divider-line"></span>
          <span class="divider-diamond">&#9670;</span>
          <span class="divider-line"></span>
        </div>
      </div>

      <!-- 登录面板 -->
      <div class="login-panel cyber-card">
        <div class="panel-header">
          <span class="panel-icon">&#9671;</span>
          <span class="panel-title">身份验证</span>
          <span class="panel-status online">&#9679; ONLINE</span>
        </div>

        <!-- 错误次数提示 -->
        <div v-if="failCount > 0" class="cyber-alert warning">
          <span class="warn-icon">&#9889;</span>
          <span>密码错误 {{ failCount }}/5</span>
          <span class="warn-extra">（{{ 5 - failCount }} 次后提示）</span>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin" class="cyber-form">
          <div class="input-group">
            <label class="input-label"><span class="label-icon">&#10016;</span> 账号</label>
            <el-input v-model="form.username" placeholder="输入身份标识" size="large" :disabled="isLoading" />
          </div>
          <div class="input-group">
            <label class="input-label"><span class="label-icon">&#10016;</span> 密钥</label>
            <el-input v-model="form.password" type="password" placeholder="输入安全密钥" size="large" show-password :disabled="isLoading" @keyup.enter="handleLogin" />
          </div>
          <div class="remember-row">
            <label class="remember-label" @click="rememberMe = !rememberMe">
              <span class="remember-checkbox" :class="{ checked: rememberMe }">
                <span v-if="rememberMe" class="check-mark">&#10003;</span>
              </span>
              <span class="remember-text">记住账号密码</span>
            </label>
          </div>
          <el-form-item>
            <button type="submit" class="cyber-btn cyber-btn-primary cyber-btn-large" :disabled="isLoading">
              <span class="btn-shine"></span>
              <span class="btn-text">{{ isLoading ? '验证中...' : '进入系统' }}</span>
            </button>
          </el-form-item>
        </el-form>

        <div class="register-link">
          <span class="link-text">尚未注册？</span>
          <router-link to="/register" class="cyber-link">创建身份 &rarr;</router-link>
        </div>

        <div class="login-footer">
          <div class="footer-tags">● SYSTEM v2.0 ● ENCRYPTED ● SECURE ●</div>
          <div class="footer-copy">© 2026 罗圣纪元 · 祁阳市罗圣纪元互联网科技有限责任公司</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const rememberMe = ref(false)
const failCount = ref(0)
const REMEMBER_KEY = 'lsjy_remember'

const form = reactive({
  username: '',
  password: ''
})

const isLoading = computed(() => authStore.loading)

onMounted(() => {
  // 恢复记住的账号密码
  const saved = localStorage.getItem(REMEMBER_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      form.username = data.username || ''
      form.password = data.password || ''
      rememberMe.value = true
    } catch (e) {
      console.error('恢复记住的账号失败', e)
    }
  }

  // 如果已登录，直接跳转
  if (authStore.isLoggedIn) {
    router.push('/dashboard')
  }
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

// 粒子动画样式
function particleStyle(i: number) {
  const size = Math.random() * 3 + 1
  const x = Math.random() * 100
  const y = Math.random() * 100
  const duration = Math.random() * 8 + 6
  const delay = Math.random() * 5
  const opacity = Math.random() * 0.4 + 0.1
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    opacity
  }
}

async function handleLogin() {
  if (!formRef.value || isLoading.value) return

  try {
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    const success = await authStore.login(form.username, form.password)
    if (success) {
      // 保存或清除记住的密码
      if (rememberMe.value) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({
          username: form.username,
          password: form.password
        }))
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }

      // 判断跳转地址
      const isAdminSubdomain = window.location.hostname.startsWith('admin')
      if (isAdminSubdomain) {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } else {
      failCount.value++
    }
  } catch (e) {
    console.error('登录提交异常:', e)
  }
}
</script>

<style scoped>
.cyber-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0a0a1a;
}
.cyber-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.04) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}
@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}
.hex-grid {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(124, 58, 237, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(0, 240, 255, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.03) 0%, transparent 60%);
}
.scan-line {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent);
  animation: scanDown 4s ease-in-out infinite;
}
@keyframes scanDown {
  0% { top: -2px; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--cyber-cyan);
  animation: particleFloat 8s ease-in-out infinite;
  box-shadow: 0 0 6px var(--cyber-cyan);
}
@keyframes particleFloat {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.1; }
  25% { transform: translateY(-30px) translateX(10px); opacity: 0.5; }
  50% { transform: translateY(-10px) translateX(-10px); opacity: 0.3; }
  75% { transform: translateY(-40px) translateX(5px); opacity: 0.4; }
}
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  animation: orbFloat 12s ease-in-out infinite;
}
.orb-1 { width: 300px; height: 300px; background: rgba(0, 240, 255, 0.08); top: 10%; left: 10%; }
.orb-2 { width: 250px; height: 250px; background: rgba(124, 58, 237, 0.08); bottom: 10%; right: 10%; animation-delay: -4s; }
.orb-3 { width: 200px; height: 200px; background: rgba(255, 0, 255, 0.05); top: 50%; left: 50%; animation-delay: -8s; }
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  padding: 20px;
  animation: fadeInUp 0.8s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.logo-section { text-align: center; margin-bottom: 32px; }
.logo-ring {
  position: relative;
  width: 100px; height: 100px;
  margin: 0 auto 20px;
}
.logo-ring-inner {
  width: 100%; height: 100%;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.2), 0 0 40px rgba(0, 240, 255, 0.1);
  animation: logoPulse 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
}
.logo-ring-inner::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--cyber-cyan);
  border-right-color: var(--cyber-purple);
  animation: logoSpin 4s linear infinite;
}
@keyframes logoSpin { to { transform: rotate(360deg); } }
@keyframes logoPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.2), 0 0 40px rgba(0, 240, 255, 0.1); }
  50% { box-shadow: 0 0 30px rgba(0, 240, 255, 0.3), 0 0 60px rgba(0, 240, 255, 0.15); }
}
.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.logo-ring-glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%);
  animation: glowPulse 3s ease-in-out infinite;
}
@keyframes glowPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
.cyber-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
  font-family: 'JetBrains Mono', monospace;
}
.title-text {
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple), var(--cyber-magenta));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleShimmer 4s ease-in-out infinite;
}
@keyframes titleShimmer {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}
.cyber-subtitle {
  font-size: 12px;
  color: var(--cyber-text-dim);
  letter-spacing: 3px;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
.divider-line {
  width: 60px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);
}
.divider-diamond {
  color: var(--cyber-cyan);
  font-size: 10px;
  animation: diamondPulse 2s ease-in-out infinite;
}
@keyframes diamondPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
.login-panel {
  padding: 28px;
  background: rgba(18, 18, 31, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 240, 255, 0.1);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}
.login-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), var(--cyber-purple), transparent);
}
.login-panel::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.02), transparent);
  animation: panelShine 6s ease-in-out infinite;
}
@keyframes panelShine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}
.panel-icon { color: var(--cyber-cyan); font-size: 16px; }
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 2px;
}
.panel-status {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 1px;
}
.panel-status.online {
  color: var(--cyber-green);
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
}
.cyber-alert {
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  animation: alertSlide 0.3s ease-out;
}
@keyframes alertSlide {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.cyber-alert.warning {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fde68a;
}
.warn-icon { font-size: 16px; }
.warn-extra { font-size: 11px; color: var(--cyber-text-dim); margin-left: auto; }
.cyber-form { margin-top: 8px; }
.input-group { margin-bottom: 18px; }
.input-label {
  display: block;
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-bottom: 8px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 1px;
}
.label-icon { color: var(--cyber-cyan); margin-right: 4px; }
.cyber-btn {
  position: relative;
  width: 100%;
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 2px;
}
.cyber-btn-large { padding: 16px 28px; font-size: 16px; }
.cyber-btn-primary {
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  color: #000;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}
.cyber-btn-primary:hover:not(:disabled) {
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.2);
  transform: translateY(-2px);
}
.cyber-btn-primary:active:not(:disabled) { transform: translateY(0); }
.cyber-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-shine {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: btnShine 3s ease-in-out infinite;
}
@keyframes btnShine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}
.btn-text { position: relative; z-index: 1; }
.register-link {
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.08);
}
.link-text { font-size: 13px; color: var(--cyber-text-dim); margin-right: 8px; }
.cyber-link {
  font-size: 13px;
  color: var(--cyber-cyan);
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
}
.cyber-link:hover {
  color: #fff;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}
:deep(.el-input__wrapper) {
  background-color: rgba(0, 240, 255, 0.03) !important;
  box-shadow: 0 0 0 1px rgba(26, 26, 46, 0.8) inset !important;
  border-radius: 10px !important;
  transition: all 0.3s ease !important;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(0, 240, 255, 0.3) inset !important;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--cyber-cyan) inset, 0 0 15px rgba(0, 240, 255, 0.15) !important;
}
:deep(.el-input__inner) { color: var(--cyber-text) !important; font-size: 14px !important; }
:deep(.el-input__inner::placeholder) { color: rgba(136, 136, 170, 0.5) !important; }
:deep(.el-input__prefix .el-icon) { color: var(--cyber-cyan) !important; }
:deep(.el-form-item) { margin-bottom: 0 !important; }
.remember-row {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 18px;
  margin-top: -4px;
}
.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.remember-checkbox {
  width: 18px; height: 18px;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: rgba(0, 240, 255, 0.03);
}
.remember-checkbox.checked {
  background: var(--cyber-cyan);
  border-color: var(--cyber-cyan);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}
.check-mark {
  color: #000;
  font-size: 12px;
  font-weight: 700;
}
.remember-text {
  font-size: 13px;
  color: var(--cyber-text-dim);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 1px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
}
.footer-tags {
  font-size: 11px;
  color: var(--cyber-cyan);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 2px;
  margin-bottom: 6px;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
}
.footer-copy {
  font-size: 11px;
  color: var(--cyber-text-dim);
  letter-spacing: 1px;
}

@media (max-width: 480px) {
  .login-container { padding: 12px; }
  .login-panel { padding: 20px 16px; }
  .cyber-title { font-size: 22px; }
  .cyber-subtitle { font-size: 10px; letter-spacing: 2px; }
  .logo-ring { width: 80px; height: 80px; }
}
</style>
