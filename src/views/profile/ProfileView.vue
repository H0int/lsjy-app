<template>
  <div class="max-w-4xl mx-auto px-4 py-6 cyber-profile">
    <h1 class="text-2xl font-bold mb-6 cyber-glow-text" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">
      <span class="mr-2">👤</span>个人中心
    </h1>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- 左侧用户卡片 -->
      <div class="md:col-span-1">
        <div class="cyber-user-card">
          <!-- 头像上传 -->
          <div class="cyber-avatar-wrapper" @click="triggerAvatarUpload">
            <img v-if="avatarUrl" :src="avatarUrl" class="cyber-user-avatar-img" />
            <div v-else class="cyber-user-avatar">
              {{ (authStore.nickname || 'U')[0] }}
            </div>
            <div class="cyber-avatar-overlay">
              <span class="cyber-avatar-edit-icon">📷</span>
            </div>
            <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="handleAvatarUpload" />
          </div>

          <h2 class="cyber-user-name">{{ authStore.user?.nickname }}</h2>
          <p class="cyber-user-handle">@{{ authStore.user?.username }}</p>

          <!-- 角色标签 -->
          <span v-if="isBoss" class="cyber-role-badge role-boss">
            <span class="badge-icon">💎</span> 罗总专属
          </span>
          <span v-else-if="isVip" class="cyber-role-badge role-vip">
            <span class="badge-icon">👑</span> {{ vipLabel }}
          </span>

          <div class="cyber-info-list">
            <div class="cyber-info-row">
              <span class="cyber-info-label">⚡ 圣力余额</span>
              <span class="cyber-info-value cyber-amber">
                {{ isBoss ? '∞ 无限' : (authStore.coinBalance?.toLocaleString() || '0') }}
              </span>
            </div>
            <div class="cyber-info-row">
              <span class="cyber-info-label">📅 注册日期</span>
              <span class="cyber-info-value">{{ formatDate(authStore.user?.createdAt || '') }}</span>
            </div>
            <div class="cyber-info-row">
              <span class="cyber-info-label">🏷️ 用户类型</span>
              <span class="cyber-info-value cyber-cyan">{{ getUserTypeLabel() }}</span>
            </div>
          </div>

          <div class="cyber-action-list">
            <router-link to="/profile/wallet" class="cyber-action-btn primary">
              <span>💰</span><span>圣力账户</span>
            </router-link>
            <button class="cyber-action-btn" @click="showSecurity = true">
              <span>🔒</span><span>安全设置</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧信息编辑 -->
      <div class="md:col-span-2">
        <div class="cyber-edit-card">
          <h3 class="cyber-card-title">
            <span class="title-bar"></span>编辑个人信息
          </h3>
          <el-form :model="profileForm" label-position="top">
            <div class="grid sm:grid-cols-2 gap-4">
              <el-form-item label="昵称">
                <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
              </el-form-item>
              <el-form-item label="用户名">
                <el-input v-model="profileForm.username" disabled />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="个人简介">
                <el-input v-model="profileForm.bio" type="textarea" :rows="2" placeholder="介绍一下自己..." />
              </el-form-item>
              <el-form-item label="性别">
                <el-select v-model="profileForm.gender" class="w-full">
                  <el-option label="未设置" :value="0" />
                  <el-option label="男" :value="1" />
                  <el-option label="女" :value="2" />
                </el-select>
              </el-form-item>
            </div>
            <el-form-item>
              <el-button type="primary" @click="saveProfile" :loading="saving" class="cyber-save-btn">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 快捷功能 -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div
            v-for="item in quickActions"
            :key="item.label"
            class="cyber-quick-card"
            @click="handleQuickAction(item)"
          >
            <div class="cyber-quick-icon">{{ item.icon }}</div>
            <div class="cyber-quick-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全设置弹窗 -->
    <Teleport to="body">
      <div
        v-if="showSecurity"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);"
        @click.self="showSecurity = false"
      >
        <div class="cyber-modal rounded-2xl p-6 max-w-md w-full mx-4">
          <div class="flex items-center justify-between mb-6">
            <h3 class="cyber-card-title m-0"><span class="title-bar"></span>🔒 安全设置</h3>
            <button class="cyber-close-btn" @click="showSecurity = false">✕</button>
          </div>

          <div class="space-y-4">
            <!-- 修改密码 -->
            <div class="cyber-security-section">
              <h4 class="cyber-section-title">修改密码</h4>
              <el-form :model="pwdForm" label-position="top">
                <el-form-item label="当前密码">
                  <el-input v-model="pwdForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
                </el-form-item>
                <el-form-item label="新密码">
                  <el-input v-model="pwdForm.newPassword" type="password" placeholder="请输入新密码（至少6位）" show-password />
                </el-form-item>
                <el-form-item label="确认新密码">
                  <el-input v-model="pwdForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
                </el-form-item>
                <el-button type="primary" @click="changePassword" :loading="pwdLoading" class="cyber-save-btn w-full">
                  确认修改
                </el-button>
              </el-form>
            </div>

            <!-- 绑定手机 -->
            <div class="cyber-security-section">
              <h4 class="cyber-section-title">绑定手机</h4>
              <div class="flex items-center justify-between p-3 rounded-lg" style="background: rgba(0,240,255,0.03); border: 1px solid rgba(0,240,255,0.1);">
                <div>
                  <div class="text-sm" style="color: var(--cyber-text);">{{ authStore.user?.phone || '未绑定' }}</div>
                  <div class="text-xs mt-1" style="color: var(--cyber-text-dim);">用于找回密码和接收通知</div>
                </div>
                <el-button size="small" type="primary" plain>{{ authStore.user?.phone ? '更换' : '绑定' }}</el-button>
              </div>
            </div>

            <!-- 绑定邮箱 -->
            <div class="cyber-security-section">
              <h4 class="cyber-section-title">绑定邮箱</h4>
              <div class="flex items-center justify-between p-3 rounded-lg" style="background: rgba(0,240,255,0.03); border: 1px solid rgba(0,240,255,0.1);">
                <div>
                  <div class="text-sm" style="color: var(--cyber-text);">{{ authStore.user?.email || '未绑定' }}</div>
                  <div class="text-xs mt-1" style="color: var(--cyber-text-dim);">用于找回密码和接收通知</div>
                </div>
                <el-button size="small" type="primary" plain>{{ authStore.user?.email ? '更换' : '绑定' }}</el-button>
              </div>
            </div>

            <!-- 登录设备 -->
            <div class="cyber-security-section">
              <h4 class="cyber-section-title">登录设备</h4>
              <div class="p-3 rounded-lg" style="background: rgba(0,240,255,0.03); border: 1px solid rgba(0,240,255,0.1);">
                <div class="flex items-center gap-3">
                  <span class="text-xl">📱</span>
                  <div class="flex-1">
                    <div class="text-sm" style="color: var(--cyber-text);">当前设备</div>
                    <div class="text-xs" style="color: var(--cyber-text-dim);">微信内置浏览器 · {{ new Date().toLocaleDateString('zh-CN') }}</div>
                  </div>
                  <span class="cyber-online-badge text-xs px-2 py-0.5 rounded">在线</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 联系客服弹窗 -->
    <Teleport to="body">
      <div
        v-if="showContact"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);"
        @click.self="showContact = false"
      >
        <div class="cyber-modal rounded-2xl p-6 max-w-sm w-full mx-4 text-center">
          <div class="flex items-center justify-between mb-4">
            <h3 class="cyber-card-title m-0"><span class="title-bar"></span>🎧 联系客服</h3>
            <button class="cyber-close-btn" @click="showContact = false">✕</button>
          </div>
          <div class="text-4xl mb-4">📞</div>
          <div class="text-lg font-bold mb-2" style="color: var(--cyber-text);">客服热线</div>
          <a href="tel:18890000368" class="cyber-phone-link text-2xl font-bold">
            188-9000-0368
          </a>
          <div class="text-xs mt-4" style="color: var(--cyber-text-dim);">
            工作时间：周一至周日 09:00 - 22:00
          </div>
          <div class="text-xs mt-1" style="color: var(--cyber-cyan);">
            点击号码直接拨打
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api'
import { formatDate } from '@/utils'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const saving = ref(false)
const showSecurity = ref(false)
const showContact = ref(false)
const avatarUrl = ref('')
const avatarInput = ref<HTMLInputElement>()

const isBoss = computed(() => authStore.user?.username === 'KF02V9')

const isVip = computed(() => {
  const roles = authStore.user?.roles || []
  const hasVipRole = Array.isArray(roles) && roles.some((role: any) => {
    const value = typeof role === 'string' ? role : role?.code || role?.name
    return value === 'vip' || value === 'VIP'
  })
  return hasVipRole || (authStore.user?.vipLevel && authStore.user.vipLevel > 0)
})

const vipLabel = computed(() => {
  if (authStore.user?.vipLevel && authStore.user.vipLevel > 0) {
    return `VIP${authStore.user.vipLevel}`
  }
  return 'VIP会员'
})

function getUserTypeLabel() {
  if (isBoss.value) return '创始人版本'
  if (isVip.value) return vipLabel.value
  const type = authStore.user?.userType
  if (type === 'enterprise') return '企业版'
  if (type === 'merchant') return '商户版'
  return '个人版'
}

const profileForm = reactive({
  nickname: '',
  username: '',
  phone: '',
  email: '',
  bio: '',
  gender: 0
})

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const pwdLoading = ref(false)

function syncFormFromUser() {
  if (!authStore.user) return
  const u = authStore.user
  const isBoss = u.username === 'KF02V9'
  profileForm.nickname = u.nickname || ''
  profileForm.username = u.username || ''
  profileForm.phone = u.phone || (isBoss ? '18874682566' : '')
  profileForm.email = u.email || (isBoss ? 'ceo@lsjyapp.cn' : '')
  profileForm.bio = u.bio || (isBoss ? '罗圣纪元创始人' : '')
  profileForm.gender = u.gender ?? (isBoss ? 1 : 0)
  avatarUrl.value = u.avatar || ''
}

onMounted(() => {
  syncFormFromUser()
  if (!authStore.user) {
    authStore.fetchUserProfile().then(() => syncFormFromUser())
  }
})

watch(() => authStore.user, () => syncFormFromUser())

// 头像上传
function triggerAvatarUpload() {
  avatarInput.value?.click()
}

function handleAvatarUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 读取并显示预览
  const reader = new FileReader()
  reader.onload = () => {
    avatarUrl.value = String(reader.result)
    ElMessage.success('头像已更新')
    // 保存到 localStorage 作为临时方案
    localStorage.setItem('lsjy_user_avatar', avatarUrl.value)
    // ★ 同步更新 auth store 和 lsjy_user，确保全平台头像一致
    if (authStore.user) {
      authStore.user.avatar = avatarUrl.value
      const saved = JSON.parse(localStorage.getItem('lsjy_user') || '{}')
      saved.avatar = avatarUrl.value
      localStorage.setItem('lsjy_user', JSON.stringify(saved))
    }
  }
  reader.readAsDataURL(file)
}

// 从 localStorage 读取头像
const savedAvatar = localStorage.getItem('lsjy_user_avatar')
if (savedAvatar) avatarUrl.value = savedAvatar

const quickActions = [
  { icon: '📋', label: '我的订单', action: 'orders' },
  { icon: '🎨', label: '我的作品', action: 'works' },
  { icon: '⭐', label: '收藏工具', action: 'favorites' },
  { icon: '🎧', label: '联系客服', action: 'contact' },
]

function handleQuickAction(item: any) {
  switch (item.action) {
    case 'orders':
      router.push('/profile/wallet')
      ElMessage.info('我的订单功能开发中')
      break
    case 'works':
      router.push('/profile/works')
      break
    case 'favorites':
      router.push('/profile/favorites')
      break
    case 'contact':
      showContact.value = true
      break
  }
}

async function saveProfile() {
  saving.value = true
  try {
    const profileData = {
      nickname: profileForm.nickname,
      bio: profileForm.bio,
      gender: profileForm.gender,
      phone: profileForm.phone,
      email: profileForm.email,
      avatar: avatarUrl.value
    }

    if (authStore.isLocalAuth) {
      // 本地模式：直接更新 localStorage 和 store，不请求后端
      const userData = JSON.parse(localStorage.getItem('lsjy_user') || '{}')
      Object.assign(userData, profileData)
      localStorage.setItem('lsjy_user', JSON.stringify(userData))
      authStore.user = { ...userData } as any
      ElMessage.success('保存成功')
    } else {
      await userApi.updateProfile(profileData)
      await authStore.fetchUserProfile()
      ElMessage.success('保存成功')
    }
  } catch {
    // 错误由拦截器处理
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
    return ElMessage.warning('请填写所有密码字段')
  }
  if (pwdForm.newPassword.length < 6) {
    return ElMessage.warning('新密码至少6位')
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    return ElMessage.warning('两次新密码不一致')
  }

  if (authStore.isLocalAuth) {
    return ElMessage.info('服务器维护中，密码修改功能暂时不可用')
  }

  pwdLoading.value = true
  try {
    await userApi.updateProfile({
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword
    })
    ElMessage.success('密码修改成功')
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    showSecurity.value = false
  } catch {
    // 错误由拦截器处理
  } finally {
    pwdLoading.value = false
  }
}
</script>

<style scoped>
.cyber-profile { position: relative; }

/* 用户卡片 */
.cyber-user-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.cyber-user-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), var(--cyber-magenta), transparent);
}

/* 头像上传 */
.cyber-avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 14px;
  cursor: pointer;
  border-radius: 50%;
}
.cyber-user-avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0,240,255,0.4);
  box-shadow: 0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(255,0,255,0.2);
}
.cyber-user-avatar {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta));
  display: flex; align-items: center; justify-content: center;
  color: #000;
  font-size: 32px; font-weight: 900;
  box-shadow: 0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(255,0,255,0.2);
  position: relative;
}
.cyber-avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}
.cyber-avatar-wrapper:hover .cyber-avatar-overlay {
  opacity: 1;
}
.cyber-avatar-edit-icon {
  font-size: 24px;
}

.cyber-user-name {
  font-size: 18px; font-weight: 700;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
}
.cyber-user-handle {
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-top: 4px;
}

/* 罗总专属标签 - 黄色赛博朋克风格 */
.cyber-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  border: 1px solid;
}
.role-boss {
  color: #ffb800;
  border-color: rgba(255,184,0,0.5);
  background: rgba(255,184,0,0.1);
  text-shadow: 0 0 8px rgba(255,184,0,0.5);
  box-shadow: 0 0 15px rgba(255,184,0,0.15);
  animation: bossGlow 2s ease-in-out infinite alternate;
}
@keyframes bossGlow {
  from { box-shadow: 0 0 15px rgba(255,184,0,0.15); }
  to { box-shadow: 0 0 25px rgba(255,184,0,0.3); }
}
.role-vip {
  color: var(--cyber-magenta);
  border-color: rgba(255,0,229,0.4);
  background: rgba(255,0,229,0.08);
  text-shadow: 0 0 8px rgba(255,0,229,0.4);
  box-shadow: 0 0 15px rgba(255,0,229,0.1);
}
.badge-icon {
  font-size: 12px;
}

.cyber-info-list {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(0,240,255,0.1);
}
.cyber-info-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0;
  font-size: 13px;
}
.cyber-info-label { color: var(--cyber-text-dim); }
.cyber-info-value { color: var(--cyber-text); font-weight: 600; }
.cyber-amber { color: #ffb800 !important; text-shadow: 0 0 6px rgba(255,184,0,0.4); }
.cyber-cyan { color: var(--cyber-cyan) !important; }

.cyber-action-list { margin-top: 18px; display: flex; flex-direction: column; gap: 8px; }
.cyber-action-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  background: rgba(0,240,255,0.04);
  border: 1px solid rgba(0,240,255,0.15);
  color: var(--cyber-text-dim);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s;
  text-decoration: none;
}
.cyber-action-btn:hover {
  background: rgba(0,240,255,0.08);
  border-color: rgba(0,240,255,0.4);
  color: var(--cyber-cyan);
}
.cyber-action-btn.primary {
  background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(124,58,237,0.1));
  border-color: rgba(0,240,255,0.35);
  color: var(--cyber-cyan);
}

/* 编辑卡片 */
.cyber-edit-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 16px;
  padding: 24px;
  position: relative;
}
.cyber-edit-card::before {
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
.cyber-save-btn {
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  border: none;
  color: #000;
  font-weight: 600;
}

/* 快捷功能卡片 */
.cyber-quick-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
}
.cyber-quick-card:hover {
  border-color: rgba(0,240,255,0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,240,255,0.12);
}
.cyber-quick-icon { font-size: 26px; margin-bottom: 8px; }
.cyber-quick-label {
  font-size: 12px;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
}

/* 弹窗 */
.cyber-modal {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.2);
  position: relative;
}
.cyber-modal::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);
}
.cyber-close-btn {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--cyber-text-dim);
  background: rgba(255,255,255,0.05);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.cyber-close-btn:hover {
  color: var(--cyber-text);
  background: rgba(255,255,255,0.1);
}

.cyber-security-section {
  padding: 16px;
  border-radius: 12px;
  background: rgba(0,240,255,0.02);
  border: 1px solid rgba(0,240,255,0.08);
}
.cyber-section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--cyber-text);
  margin-bottom: 12px;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-online-badge {
  background: rgba(0,255,136,0.15);
  color: #00ff88;
  border: 1px solid rgba(0,255,136,0.2);
}
.cyber-phone-link {
  display: block;
  color: var(--cyber-cyan);
  text-decoration: none;
  margin: 12px 0;
  text-shadow: 0 0 10px rgba(0,240,255,0.3);
  transition: all 0.3s;
}
.cyber-phone-link:hover {
  text-shadow: 0 0 20px rgba(0,240,255,0.5);
  transform: scale(1.05);
}

/* Element Plus 覆盖 */
:deep(.el-form-item__label) { color: var(--cyber-text-dim) !important; }
</style>
