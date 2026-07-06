<template>
  <div class="max-w-4xl mx-auto px-4 py-6 cyber-profile">
    <h1 class="text-2xl font-bold mb-6 cyber-glow-text" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace;">
      <span class="mr-2">👤</span>个人中心
    </h1>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- 左侧用户卡片 -->
      <div class="md:col-span-1">
        <div class="cyber-user-card">
          <div class="cyber-user-avatar">
            {{ (authStore.nickname || 'U')[0] }}
          </div>
          <h2 class="cyber-user-name">{{ authStore.user?.nickname }}</h2>
          <p class="cyber-user-handle">@{{ authStore.user?.username }}</p>
          <span class="cyber-role-badge" :class="roleBadge.cls">{{ roleBadge.label }}</span>

          <div class="cyber-info-list">
            <div class="cyber-info-row">
              <span class="cyber-info-label">⚡ 圣点余额</span>
              <span class="cyber-info-value cyber-amber">{{ authStore.coinBalance.toFixed(2) }}</span>
            </div>
            <div class="cyber-info-row">
              <span class="cyber-info-label">📅 注册日期</span>
              <span class="cyber-info-value">{{ formatDate(authStore.user?.createdAt || '') }}</span>
            </div>
            <div class="cyber-info-row">
              <span class="cyber-info-label">🏷️ 用户类型</span>
              <span class="cyber-info-value">{{ userTypeLabel }}</span>
            </div>
          </div>

          <div class="cyber-action-list">
            <router-link to="/profile/wallet" class="cyber-action-btn primary">
              <span>💰</span><span>圣点账户</span>
            </router-link>
            <button class="cyber-action-btn">
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
              <el-button type="primary" @click="saveProfile" :loading="saving">保存修改</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 快捷功能 -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div v-for="item in quickActions" :key="item.label" class="cyber-quick-card">
            <div class="cyber-quick-icon">{{ item.icon }}</div>
            <div class="cyber-quick-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api'
import { formatDate, userTypeMap } from '@/utils'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const saving = ref(false)

const profileForm = reactive({
  nickname: '',
  username: '',
  phone: '',
  email: '',
  bio: '',
  gender: 0
})

function syncFormFromUser() {
  if (authStore.user) {
    profileForm.nickname = authStore.user.nickname || ''
    profileForm.username = authStore.user.username || ''
    profileForm.phone = authStore.user.phone || ''
    profileForm.email = authStore.user.email || ''
    profileForm.bio = authStore.user.bio || ''
    profileForm.gender = authStore.user.gender || 0
  }
}

onMounted(() => {
  syncFormFromUser()
  if (!authStore.user) {
    authStore.fetchUserProfile().then(() => syncFormFromUser())
  }
})

watch(() => authStore.user, () => syncFormFromUser())

const roleBadge = computed(() => {
  const roles = authStore.userRoles
  if (roles.includes('super_admin')) return { label: '👑 超级管理员', cls: 'role-super' }
  if (roles.includes('operator')) return { label: '🔧 运营', cls: 'role-op' }
  if (roles.includes('merchant')) return { label: '🏢 商户', cls: 'role-merchant' }
  return { label: '👤 普通用户', cls: 'role-normal' }
})

const userTypeLabel = computed(() => {
  return userTypeMap[authStore.user?.userType || 'personal'] || '个人版'
})

const quickActions = [
  { icon: '📋', label: '我的订单' },
  { icon: '🎨', label: '我的作品' },
  { icon: '⭐', label: '收藏工具' },
  { icon: '🎧', label: '联系客服' },
]

async function saveProfile() {
  saving.value = true
  try {
    await userApi.updateProfile({
      nickname: profileForm.nickname,
      bio: profileForm.bio,
      gender: profileForm.gender
    })
    await authStore.fetchUserProfile()
    ElMessage.success('保存成功')
  } catch {
    // 错误由拦截器处理
  } finally {
    saving.value = false
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
.cyber-user-avatar {
  width: 80px; height: 80px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta));
  display: flex; align-items: center; justify-content: center;
  color: #000;
  font-size: 32px; font-weight: 900;
  box-shadow: 0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(255,0,255,0.2);
  position: relative;
}
.cyber-user-avatar::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1.5px solid transparent;
  border-top-color: var(--cyber-cyan);
  border-right-color: rgba(0,240,255,0.2);
  animation: avatarSpin 4s linear infinite;
}
@keyframes avatarSpin { to { transform: rotate(360deg); } }
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
.cyber-role-badge {
  display: inline-block;
  margin-top: 10px;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  border: 1px solid;
}
.role-super { color: var(--cyber-magenta); border-color: rgba(255,0,255,0.4); background: rgba(255,0,255,0.08); text-shadow: 0 0 6px rgba(255,0,255,0.4); }
.role-op { color: var(--cyber-green); border-color: rgba(0,255,136,0.4); background: rgba(0,255,136,0.08); }
.role-merchant { color: var(--cyber-amber); border-color: rgba(255,184,0,0.4); background: rgba(255,184,0,0.08); }
.role-normal { color: var(--cyber-cyan); border-color: rgba(0,240,255,0.4); background: rgba(0,240,255,0.08); }

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
.cyber-amber { color: var(--cyber-amber) !important; text-shadow: 0 0 6px rgba(255,184,0,0.4); }

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

/* Element Plus 覆盖 */
:deep(.el-form-item__label) { color: var(--cyber-text-dim) !important; }
</style>
