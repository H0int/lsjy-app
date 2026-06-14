<template>
  <div class="cyber-register-page">
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

    <!-- 注册容器 -->
    <div class="register-container">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-ring">
          <div class="logo-ring-inner">
            <img src="/company-logo.jpg" alt="罗圣纪元" class="company-logo-img" />
          </div>
          <div class="logo-ring-glow"></div>
        </div>
        <h1 class="cyber-title">
          <span class="title-text">创建身份</span>
        </h1>
        <p class="cyber-subtitle">JOIN LUOSHENG EPOCH &middot; 开启AI新时代</p>
        <div class="cyber-divider">
          <span class="divider-line"></span>
          <span class="divider-diamond">&#9670;</span>
          <span class="divider-line"></span>
        </div>
      </div>

      <!-- 注册面板 -->
      <div class="register-panel cyber-card">
        <div class="panel-header">
          <span class="panel-icon">&#9671;</span>
          <span class="panel-title">身份注册</span>
          <span class="panel-status">&#9679; READY</span>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleRegister" class="cyber-form">
          <div class="input-group">
            <label class="input-label"><span class="label-icon">&#10016;</span> 身份标识</label>
            <el-input v-model="form.account" placeholder="4-20位字母数字下划线" size="large" />
          </div>
          <div class="input-group">
            <label class="input-label"><span class="label-icon">&#10016;</span> 显示名称</label>
            <el-input v-model="form.nickname" placeholder="你的昵称" size="large" />
          </div>
          <div class="input-group">
            <label class="input-label"><span class="label-icon">&#10016;</span> 安全密钥</label>
            <el-input v-model="form.password" type="password" placeholder="至少6位密码" size="large" show-password />
          </div>
          <div class="input-group">
            <label class="input-label"><span class="label-icon">&#10016;</span> 确认密钥</label>
            <el-input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" size="large" show-password @keyup.enter="handleRegister" />
          </div>

          <el-form-item>
            <button type="submit" class="cyber-btn cyber-btn-magenta cyber-btn-large" :loading="loading" @click="handleRegister">
              <span class="btn-shine"></span>
              <span class="btn-text">{{ loading ? '注册中...' : '立即注册' }}</span>
            </button>
          </el-form-item>
        </el-form>

        <div class="login-link">
          <span class="link-text">已有身份？</span>
          <router-link to="/login" class="cyber-link">返回登录 &rarr;</router-link>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="footer-info">
        <p class="footer-text">注册即表示同意《用户协议》和《隐私政策》</p>
        <div class="footer-line">
          <span class="footer-dot"></span>
          <span>SYSTEM v2.0</span>
          <span class="footer-dot"></span>
          <span>ENCRYPTED</span>
          <span class="footer-dot"></span>
          <span>SECURE</span>
          <span class="footer-dot"></span>
        </div>
        <p class="footer-text">&copy; 2026 罗圣纪元 &middot; 祁阳市罗圣纪元互联网科技有限责任公司</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  account: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 20, message: '账号长度为4-20位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// ===== 粒子动画 =====
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

async function handleRegister() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const { authApi } = await import('@/api')
      const res = await authApi.register({
        username: form.account,
        password: form.password,
        nickname: form.nickname
      })
      if (res.code === 0) {
        ElMessage.success('注册成功！')
        // 自动登录
        const success = await authStore.login(form.account, form.password)
        if (success) router.push('/dashboard')
        else router.push('/login')
      } else {
        ElMessage.error(res.message || '注册失败')
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '注册失败，请稍后重试'
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.cyber-register-page {
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
    linear-gradient(rgba(255, 0, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 0, 255, 0.04) 1px, transparent 1px);
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
    radial-gradient(circle at 25% 25%, rgba(255, 0, 255, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(124, 58, 237, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.03) 0%, transparent 60%);
}
.scan-line {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.3), transparent);
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
  background: var(--cyber-magenta);
  animation: particleFloat 8s ease-in-out infinite;
  box-shadow: 0 0 6px var(--cyber-magenta);
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
.orb-1 { width: 300px; height: 300px; background: rgba(255, 0, 255, 0.08); top: 10%; left: 10%; }
.orb-2 { width: 250px; height: 250px; background: rgba(124, 58, 237, 0.08); bottom: 10%; right: 10%; animation-delay: -4s; }
.orb-3 { width: 200px; height: 200px; background: rgba(0, 240, 255, 0.05); top: 50%; left: 50%; animation-delay: -8s; }
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}
.register-container {
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
  border: 2px solid rgba(255, 0, 255, 0.4);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.2), 0 0 40px rgba(255, 0, 255, 0.1);
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
  border-top-color: var(--cyber-magenta);
  border-right-color: var(--cyber-purple);
  animation: logoSpin 4s linear infinite;
}
@keyframes logoSpin { to { transform: rotate(360deg); } }
@keyframes logoPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 0, 255, 0.2), 0 0 40px rgba(255, 0, 255, 0.1); }
  50% { box-shadow: 0 0 30px rgba(255, 0, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.15); }
}
.company-logo-img { width: 100%; height: 100%; object-fit: cover; }
.logo-ring-glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 0, 255, 0.1) 0%, transparent 70%);
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
  background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple), var(--cyber-cyan));
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
  background: linear-gradient(90deg, transparent, var(--cyber-magenta), transparent);
}
.divider-diamond {
  color: var(--cyber-magenta);
  font-size: 10px;
  animation: diamondPulse 2s ease-in-out infinite;
}
@keyframes diamondPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
.register-panel {
  padding: 28px;
  background: rgba(18, 18, 31, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 0, 255, 0.1);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}
.register-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyber-magenta), var(--cyber-purple), transparent);
}
.register-panel::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.02), transparent);
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
  border-bottom: 1px solid rgba(255, 0, 255, 0.1);
}
.panel-icon { color: var(--cyber-magenta); font-size: 16px; }
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
  color: var(--cyber-magenta);
  text-shadow: 0 0 8px rgba(255, 0, 255, 0.5);
}
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
.label-icon { color: var(--cyber-magenta); margin-right: 4px; }
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
.cyber-btn-magenta {
  background: linear-gradient(135deg, var(--cyber-magenta), var(--cyber-purple));
  color: #fff;
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
}
.cyber-btn-magenta:hover:not(:disabled) {
  box-shadow: 0 0 30px rgba(255, 0, 255, 0.5), 0 0 60px rgba(255, 0, 255, 0.2);
  transform: translateY(-2px);
}
.cyber-btn-magenta:active:not(:disabled) { transform: translateY(0); }
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
.login-link {
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 0, 255, 0.08);
}
.link-text { font-size: 13px; color: var(--cyber-text-dim); margin-right: 8px; }
.cyber-link {
  font-size: 13px;
  color: var(--cyber-magenta);
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
}
.cyber-link:hover {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 0, 255, 0.6);
}
.footer-info { text-align: center; margin-top: 28px; }
.footer-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--cyber-text-dim);
  letter-spacing: 2px;
  margin-bottom: 8px;
}
.footer-dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--cyber-magenta);
  box-shadow: 0 0 6px var(--cyber-magenta);
  animation: dotPulse 2s ease-in-out infinite;
}
.footer-dot:nth-child(3) { animation-delay: 0.3s; }
.footer-dot:nth-child(5) { animation-delay: 0.6s; }
.footer-dot:nth-child(7) { animation-delay: 0.9s; }
@keyframes dotPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
.footer-text { font-size: 11px; color: rgba(136, 136, 170, 0.5); margin-bottom: 4px; }
:deep(.el-input__wrapper) {
  background-color: rgba(255, 0, 255, 0.03) !important;
  box-shadow: 0 0 0 1px rgba(26, 26, 46, 0.8) inset !important;
  border-radius: 10px !important;
  transition: all 0.3s ease !important;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(255, 0, 255, 0.3) inset !important;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--cyber-magenta) inset, 0 0 15px rgba(255, 0, 255, 0.15) !important;
}
:deep(.el-input__inner) { color: var(--cyber-text) !important; font-size: 14px !important; }
:deep(.el-input__inner::placeholder) { color: rgba(136, 136, 170, 0.5) !important; }
:deep(.el-input__prefix .el-icon) { color: var(--cyber-magenta) !important; }
:deep(.el-form-item) { margin-bottom: 0 !important; }
@media (max-width: 480px) {
  .register-container { padding: 12px; }
  .register-panel { padding: 20px; }
  .cyber-title { font-size: 24px; }
  .logo-ring { width: 80px; height: 80px; }
}
</style>
