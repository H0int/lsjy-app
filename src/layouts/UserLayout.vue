<template>
  <div class="min-h-screen" style="background:#0d0d1a;">
    <header class="fixed top-0 left-0 right-0 z-50 h-16 flex items-center" style="background:#0d0d1aee;backdrop-filter:blur(10px);border-bottom:1px solid #00f0ff20;">
      <div class="max-w-7xl mx-auto px-4 w-full h-16 flex items-center justify-between">
        <div class="flex items-center gap-3 cursor-pointer" @click="$router.push('/dashboard')">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style="background:linear-gradient(135deg,#00f0ff,#b700ff);">罗</div>
          <span class="text-lg font-bold cyber-glow-text hidden sm:block" style="color:#00f0ff;">罗圣纪元</span>
        </div>
        <nav class="hidden md:flex items-center gap-1">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            :style="isActive(item.path)?'background:#00f0ff15;color:#00f0ff;box-shadow:0 0 10px #00f0ff20;':'color:#a0a0cc;'">
            <span class="mr-1.5">{{item.icon}}</span>{{item.label}}
          </router-link>
        </nav>
        <div class="flex items-center gap-2">
          <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium" style="background:#ffe60015;color:#ffe600;border:1px solid #ffe60030;">
            <span>⚡</span><span>{{authStore.coinBalance?.toFixed(1)||'0.0'}}</span>
          </div>
          <el-dropdown trigger="click">
            <div class="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style="background:linear-gradient(135deg,#00f0ff,#b700ff);">{{(authStore.nickname||'U')[0]}}</div>
              <span class="text-sm hidden sm:block" style="color:#e0e0ff;">{{authStore.nickname}}</span>
            </div>
            <template #dropdown><el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/profile')">👤 个人中心</el-dropdown-item>
              <el-dropdown-item @click="$router.push('/profile/wallet')">💰 圣点账户</el-dropdown-item>
              <el-dropdown-item v-if="authStore.isAdmin" divided @click="$router.push('/admin')">⚙️ 管理后台</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">🚪 退出登录</el-dropdown-item>
            </el-dropdown-menu></template>
          </el-dropdown>
        </div>
      </div>
    </header>
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 py-1" style="background:#0d0d1aee;backdrop-filter:blur(10px);border-top:1px solid #00f0ff20;">
      <div class="flex justify-around">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex flex-col items-center py-1.5 px-3 rounded-lg"
          :style="isActive(item.path)?'color:#00f0ff;':'color:#505080;'">
          <span class="text-xl">{{item.icon}}</span><span class="text-xs mt-0.5">{{item.label}}</span>
        </router-link>
      </div>
    </nav>
    <main class="pt-16 pb-20 md:pb-8">
      <router-view v-slot="{Component}"><transition name="fade" mode="out-in"><component :is="Component"/></transition></router-view>
    </main>
  </div>
</template>
<script setup lang="ts">
import {useRoute,useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import {useAppStore} from '@/stores/app'
const route=useRoute(),router=useRouter(),authStore=useAuthStore(),appStore=useAppStore()
const navItems=[{path:'/dashboard',label:'控制台',icon:'🏠'},{path:'/chat',label:'罗圣AI',icon:'🤖'},{path:'/tools',label:'AI工具',icon:'🧰'},{path:'/profile',label:'我的',icon:'👤'}]
function isActive(p:string){return route.path===p||route.path.startsWith(p+'/')}
function handleLogout(){authStore.logout();router.push('/login')}
</script>
<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .2s}.fade-enter-from,.fade-leave-to{opacity:0}
.cyber-glow-text{text-shadow:0 0 10px #00f0ff,0 0 20px #00f0ff40}
</style>
