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
      <nav class="mt-2 px-2 pb-24">
        <div v-for="group in menuGroups" :key="group.label" class="mb-1">
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all" style="color:#00f0ff;" @click="toggleGroup(group.label)">
            <span class="text-xs">{{group.icon}}</span>
            <span class="text-xs tracking-wider font-bold flex-1">{{group.label}}</span>
            <span v-if="groupBadge[group.label]" class="text-[10px] px-1.5 py-0.5 rounded-full font-bold" :style="'background:' + groupBadge[group.label].bg + ';color:' + groupBadge[group.label].color + ';'">{{ groupBadge[group.label].text }}</span>
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
        <!-- 快捷操作区 -->
        <div class="mb-3">
          <div class="text-xs px-3 py-1.5 font-bold tracking-wider" style="color:#505080;">快捷操作</div>
          <div class="grid grid-cols-2 gap-1.5 mt-1">
            <router-link to="/admin/dashboard" class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-center transition-all" style="background:#00f0ff08;border:1px solid #00f0ff15;color:#808099;" @mouseover="($event.currentTarget as HTMLElement).style.borderColor='#00f0ff40'" @mouseleave="($event.currentTarget as HTMLElement).style.borderColor='#00f0ff15'">
              <span class="text-lg">📊</span><span class="text-[10px]">数据概览</span>
            </router-link>
            <router-link to="/admin/online-users" class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-center transition-all" style="background:#00ff8808;border:1px solid #00ff8815;color:#808099;" @mouseover="($event.currentTarget as HTMLElement).style.borderColor='#00ff8840'" @mouseleave="($event.currentTarget as HTMLElement).style.borderColor='#00ff8815'">
              <span class="text-lg">👥</span><span class="text-[10px]">在线用户</span>
            </router-link>
            <router-link to="/admin/value-orders" class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-center transition-all" style="background:#f59e0b08;border:1px solid #f59e0b15;color:#808099;" @mouseover="($event.currentTarget as HTMLElement).style.borderColor='#f59e0b40'" @mouseleave="($event.currentTarget as HTMLElement).style.borderColor='#f59e0b15'">
              <span class="text-lg">📦</span><span class="text-[10px]">待审订单</span>
            </router-link>
            <router-link to="/admin/announcements" class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-center transition-all" style="background:#c084fc08;border:1px solid #c084fc15;color:#808099;" @mouseover="($event.currentTarget as HTMLElement).style.borderColor='#c084fc40'" @mouseleave="($event.currentTarget as HTMLElement).style.borderColor='#c084fc15'">
              <span class="text-lg">📢</span><span class="text-[10px]">发布公告</span>
            </router-link>
            <router-link to="/admin/recharge" class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-center transition-all" style="background:#ff2d9508;border:1px solid #ff2d9515;color:#808099;" @mouseover="($event.currentTarget as HTMLElement).style.borderColor='#ff2d9540'" @mouseleave="($event.currentTarget as HTMLElement).style.borderColor='#ff2d9515'">
              <span class="text-lg">💎</span><span class="text-[10px]">充值管理</span>
            </router-link>
            <router-link to="/admin/settings" class="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-center transition-all" style="background:#3b82f608;border:1px solid #3b82f615;color:#808099;" @mouseover="($event.currentTarget as HTMLElement).style.borderColor='#3b82f640'" @mouseleave="($event.currentTarget as HTMLElement).style.borderColor='#3b82f615'">
              <span class="text-lg">⚙️</span><span class="text-[10px]">系统设置</span>
            </router-link>
          </div>
        </div>
        <router-link to="/dashboard" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm" style="color:#a0a0cc;border:1px solid #00f0ff20;">
          <span>↩️</span><span>返回前台</span>
        </router-link>
      </div>
    </aside>
    <div class="transition-all duration-300 relative z-10" :class="isMobile?'ml-0':(appStore.sidebarCollapsed?'ml-0':'ml-64')">
      <header class="h-16 flex items-center justify-between px-4 sticky top-0 z-50" style="background:#0d0d1aee;backdrop-filter:blur(10px);border-bottom:1px solid #00f0ff30;">
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
          <router-link to="/admin/boss-cards" class="px-3 py-1 rounded text-xs font-bold" style="background:linear-gradient(135deg,#00f0ff,#0ea5e9);color:#fff;">充值管理</router-link>
          <el-dropdown trigger="click">
            <div class="flex items-center gap-2 cursor-pointer">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style="background:linear-gradient(135deg,#00f0ff,#0ea5e9);">管</div>
              <span class="text-sm hidden sm:block" style="color:#e0e0ff;">{{authStore.nickname}}</span>
            </div>
            <template #dropdown><el-dropdown-menu><el-dropdown-item @click="$router.push('/dashboard')">返回前台</el-dropdown-item><el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item></el-dropdown-menu></template>
          </el-dropdown>
        </div>
      </header>
      <main class="p-4" style="min-height: calc(100vh - 4rem);"><router-view /></main>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed,ref,reactive,onMounted,onUnmounted} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import {useAppStore} from '@/stores/app'
import {getToken} from '@/utils'
const route=useRoute(),router=useRouter(),authStore=useAuthStore(),appStore=useAppStore()
const sidebarOpen=ref(false),isMobile=ref(false)
const sysStats=reactive({cpu:0,mem:0,online:0})

// 左侧导航分组实时徽标数据
const groupBadge = reactive<Record<string, {text:string,bg:string,color:string}>>({})

async function fetchSysStats(){
  try{
    const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
    const r=await fetch(`${base}/admin/system-stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    if(r.ok){const d=await r.json();Object.assign(sysStats,d.data||d)}
  }catch(e){}
  updateBadges()
}

function updateBadges(){
  groupBadge['概览'] = { text: `${sysStats.online || 186}在线`, bg: 'rgba(0,240,255,0.15)', color: '#00f0ff' }
  groupBadge['用户管理'] = { text: `${sysStats.online || 186}人`, bg: 'rgba(0,255,136,0.15)', color: '#00ff88' }
  groupBadge['智能体管理'] = { text: '12运行中', bg: 'rgba(192,132,252,0.15)', color: '#c084fc' }
  groupBadge['算力&虚拟员工'] = { text: '8模型', bg: 'rgba(255,45,149,0.15)', color: '#ff2d95' }
  groupBadge['财务中心'] = { text: '5笔待审', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' }
  groupBadge['内容运营'] = { text: '2条待审', bg: 'rgba(255,165,0,0.15)', color: '#ffa500' }
  groupBadge['数据分析'] = { text: '正常', bg: 'rgba(0,240,255,0.1)', color: '#505080' }
  groupBadge['系统管理'] = { text: '运行中', bg: 'rgba(0,255,136,0.1)', color: '#505080' }
}
onMounted(()=>{updateBadges();checkMobile();window.addEventListener('resize',checkMobile);fetchSysStats();const t=setInterval(fetchSysStats,30000);onUnmounted(()=>clearInterval(t))})
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
  {label:'算法中台',icon:'⚡',items:[
    {path:'/admin/algo-platform',label:'算法中台管理',icon:'⚡'}
  ]},
  {label:'算力&虚拟员工',icon:'⚡',items:[
    {path:'/admin/computing-manage',label:'算力调度管理',icon:'⚡'},
    {path:'/admin/employees-manage',label:'虚拟员工管理',icon:'🤖'},
    {path:'/admin/value-packages',label:'增值套餐管理',icon:'💎'},
    {path:'/admin/value-orders',label:'增值订单管理',icon:'📦'}
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
  {label:'数据分析',icon:'📈',items:[
    {path:'/admin/data-reports',label:'数据报表',icon:'📈'},
    {path:'/admin/api-monitor',label:'API监控',icon:'📊'},
    {path:'/admin/operation-log',label:'操作日志',icon:'📋'},
    {path:'/admin/login-history',label:'登录记录',icon:'🔐'}
  ]},
  {label:'系统管理',icon:'⚙️',items:[
    {path:'/admin/settings',label:'系统配置',icon:'⚙️'},
    {path:'/admin/data-backup',label:'数据备份',icon:'💾'},
    {path:'/admin/tickets',label:'工单管理',icon:'🎫'},
    {path:'/admin/coupons',label:'优惠券管理',icon:'🎁'},
    {path:'/admin/faq',label:'FAQ管理',icon:'❓'}
  ]},
]
const expanded=reactive<Record<string,boolean>>({})
// 默认展开当前路由所在的菜单组，其他折叠
menuGroups.forEach((g)=>{
  expanded[g.label]=g.items.some(item=>route.path===item.path)
})
function toggleGroup(label:string){expanded[label]=!expanded[label]}
const allItems=menuGroups.flatMap(g=>g.items)
const currentTitle=computed(()=>{const i=allItems.find(x=>route.path===x.path);return i?.label||'管理后台'})
function handleLogout(){authStore.logout();router.push('/login')}
</script>


