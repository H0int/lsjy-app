<template>
  <div class="min-h-screen cyber-circuit-bg" style="background-color: var(--cyber-bg); position: relative;">
    <!-- 赛博朋克背景网格 -->
    <div class="fixed inset-0 pointer-events-none" style="z-index:0; background-image: linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px); background-size: 40px 40px;"></div>
    <div v-if="sidebarOpen && isMobile" class="fixed inset-0 z-30" style="background:rgba(0,0,0,0.7); backdrop-filter: blur(4px);" @click="sidebarOpen=false"></div>
    <aside class="fixed left-0 top-0 bottom-0 z-40 w-64 transition-transform duration-300 overflow-y-auto cyber-sidebar"
      :class="isMobile ? (sidebarOpen?'':'-translate-x-full') : (appStore.sidebarCollapsed?'-translate-x-full':'')"
      style="scrollbar-width:thin;scrollbar-color:#00f0ff40 transparent;">
      <div class="h-16 flex items-center px-5 gap-3" style="border-bottom:1px solid #00f0ff30;">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style="background:linear-gradient(135deg,#00f0ff,#b700ff);">罗</div>
        <div><div class="font-bold text-sm cyber-glow-text" style="color:#00f0ff;">罗圣纪元</div><div class="text-xs" style="color:#00f0ff;">COMMAND CENTER</div></div>
        <button v-if="isMobile" @click="sidebarOpen=false" class="ml-auto p-2" style="color:#00f0ff;">✕</button>
      </div>
      <nav class="mt-2 px-2 pb-20">
        <div v-for="group in menuGroups" :key="group.label" class="mb-1">
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all" style="color:#00f0ff;" @click="toggleGroup(group.label)">
            <span class="text-xs">{{group.icon}}</span>
            <span class="text-xs tracking-wider font-bold flex-1">{{group.label}}</span>
            <span class="text-xs" :style="expanded[group.label]?'color:#00f0ff;':'color:#505080;'">{{group.items.length}}</span>
            <span class="text-xs transition-transform" :style="'color:#505080;'+(expanded[group.label]?'transform:rotate(90deg);':'')">▶</span>
          </div>
          <div v-show="expanded[group.label]" class="ml-2 pl-2" style="border-left:1px solid #00f0ff15;">
            <router-link v-for="item in group.items" :key="item.path" :to="item.path"
              class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all my-0.5"
              :style="route.path===item.path?'background:#00f0ff18;color:#00f0ff;border-left:2px solid #00f0ff;padding-left:10px;':'color:#808099;border-left:2px solid transparent;padding-left:10px;'"
              @click="handleNav(item.path)">
              <span class="text-sm w-5 text-center">{{item.icon}}</span><span>{{item.label}}</span>
            </router-link>
          </div>
        </div>
      </nav>
      <div class="absolute bottom-4 left-0 right-0 px-3">
        <router-link to="/dashboard" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm" style="color:#a0a0cc;border:1px solid #00f0ff20;">
          <span>↩️</span><span>返回前台</span>
        </router-link>
      </div>
    </aside>
    <div class="transition-all duration-300" :class="isMobile?'ml-0':(appStore.sidebarCollapsed?'ml-0':'ml-64')">
      <header class="h-16 flex items-center justify-between px-4 sticky top-0 z-30" style="background:#0d0d1aee;backdrop-filter:blur(10px);border-bottom:1px solid #00f0ff30;">
        <div class="flex items-center gap-3">
          <button v-if="isMobile" @click="sidebarOpen=!sidebarOpen" class="p-2 text-xl" style="color:#00f0ff;">☰</button>
          <button v-else @click="appStore.toggleSidebar()" class="p-2 text-xl" style="color:#00f0ff;">☰</button>
          <h1 class="text-base font-bold cyber-glow-text" style="color:#00f0ff;">{{currentTitle}}</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="hidden md:flex items-center gap-3 text-xs" style="color:#808099;">
            <span>● CPU {{sysStats.cpu}}%</span>
            <span>● MEM {{sysStats.mem}}G</span>
            <span style="color:#00f0ff;">● ONLINE {{sysStats.online}}</span>
          </div>
          <router-link to="/coin" class="px-3 py-1 rounded text-xs font-bold" style="background:linear-gradient(135deg,#00f0ff,#0ea5e9);color:#fff;">充值</router-link>
          <el-dropdown trigger="click">
            <div class="flex items-center gap-2 cursor-pointer">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style="background:linear-gradient(135deg,#00f0ff,#0ea5e9);">管</div>
              <span class="text-sm hidden sm:block" style="color:#e0e0ff;">{{authStore.nickname}}</span>
            </div>
            <template #dropdown><el-dropdown-menu><el-dropdown-item @click="$router.push('/dashboard')">返回前台</el-dropdown-item><el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item></el-dropdown-menu></template>
          </el-dropdown>
        </div>
      </header>
      <main class="p-4"><router-view v-slot="{Component}"><transition name="fade" mode="out-in"><component :is="Component"/></transition></router-view></main>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed,ref,reactive,onMounted,onUnmounted} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import {useAppStore} from '@/stores/app'
const route=useRoute(),router=useRouter(),authStore=useAuthStore(),appStore=useAppStore()
const sidebarOpen=ref(false),isMobile=ref(false)
const sysStats=reactive({cpu:0,mem:0,online:0})
async function fetchSysStats(){
  try{
    const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
    const r=await fetch(`${base}/admin/system-stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    if(r.ok){const d=await r.json();Object.assign(sysStats,d.data||d)}
  }catch(e){}
}
onMounted(()=>{checkMobile();window.addEventListener('resize',checkMobile);fetchSysStats();const t=setInterval(fetchSysStats,30000);onUnmounted(()=>clearInterval(t))})
function checkMobile(){isMobile.value=window.innerWidth<768;if(!isMobile.value)sidebarOpen.value=false}
function handleNav(path:string){router.push(path);if(isMobile.value)sidebarOpen.value=false}

const menuGroups=[
  {label:'概览',icon:'📊',items:[
    {path:'/admin/dashboard',label:'数据看板',icon:'📊'},
    {path:'/admin/decision',label:'决策中心',icon:'🧭'},
    {path:'/admin/realtime',label:'实时定位',icon:'🕐'}
  ]},
  {label:'用户管理',icon:'👥',items:[
    {path:'/admin/online-users',label:'在线用户',icon:'🟢'},
    {path:'/admin/user-tags',label:'用户标签',icon:'🏷️'},
    {path:'/admin/blacklist',label:'黑名单管理',icon:'🚫'}
  ]},
  {label:'智能体管理',icon:'🤖',items:[
    {path:'/admin/ai-agents',label:'AI智能体',icon:'🤖'},
    {path:'/admin/chat-history',label:'对话记录',icon:'💬'},
    {path:'/admin/model-config',label:'模型配置',icon:'⚙️'},
    {path:'/admin/knowledge',label:'知识库管理',icon:'📚'}
  ]},
  {label:'财务中心',icon:'💰',items:[
    {path:'/admin/coin-packages',label:'圣力套餐',icon:'⚡'},
    {path:'/admin/boss-cards',label:'Boss充值卡',icon:'👑'},
    {path:'/admin/payment',label:'支付',icon:'💳'},
    {path:'/admin/recharge',label:'充值管理',icon:'💎'},
    {path:'/admin/orders',label:'订单管理',icon:'📦'},
    {path:'/admin/commission',label:'佣金记录',icon:'💵'}
  ]},
  {label:'内容运营',icon:'📝',items:[
    {path:'/admin/announcements',label:'公告管理',icon:'📢'},
    {path:'/admin/content-moderation',label:'内容审核',icon:'📝'},
    {path:'/admin/push',label:'消息推送',icon:'📨'}
  ]},
  {label:'系统管理',icon:'⚙️',items:[
    {path:'/admin/settings',label:'系统配置',icon:'⚙️'},
    {path:'/admin/oplog',label:'操作日志',icon:'📋'},
    {path:'/admin/login-history',label:'登录记录',icon:'🔐'}
  ]},
]
const expanded=reactive<Record<string,boolean>>({})
menuGroups.forEach((g,i)=>{expanded[g.label]=i<5})
function toggleGroup(label:string){expanded[label]=!expanded[label]}
const allItems=menuGroups.flatMap(g=>g.items)
const currentTitle=computed(()=>{const i=allItems.find(x=>route.path===x.path);return i?.label||'管理后台'})
function handleLogout(){authStore.logout();router.push('/login')}
</script>

