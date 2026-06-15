<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style="background:linear-gradient(135deg,#0d0d1a,#1a1a2e,#16213e);">
    <div class="absolute inset-0 opacity-10" style="background-image:linear-gradient(#00f0ff 1px,transparent 1px),linear-gradient(90deg,#00f0ff 1px,transparent 1px);background-size:50px 50px;"></div>
    <div class="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20" style="background:#00f0ff;"></div>
    <div class="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20" style="background:#ff2d95;"></div>
    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white text-2xl font-bold mb-4" style="background:linear-gradient(135deg,#00f0ff,#b700ff);box-shadow:0 0 20px #00f0ff60,0 0 40px #b700ff30;">罗</div>
        <h1 class="text-2xl font-bold cyber-glow-text" style="color:#00f0ff;">欢迎回到罗圣纪元</h1>
        <p class="mt-1 text-sm tracking-wider" style="color:#ff2d95;">AI EMPOWERED DIGITAL PLATFORM</p>
      </div>
      <div class="rounded-2xl p-8 relative" style="background:#1a1a2eee;border:1px solid #00f0ff30;backdrop-filter:blur(20px);">
        <div class="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl" style="border-color:#00f0ff;"></div>
        <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-2xl" style="border-color:#ff2d95;"></div>
        <div class="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-2xl" style="border-color:#b700ff;"></div>
        <div class="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-2xl" style="border-color:#00f0ff;"></div>
        <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
          <el-form-item prop="username"><el-input v-model="form.username" placeholder="用户名 / 邮箱" prefix-icon="User" size="large" /></el-form-item>
          <el-form-item prop="password"><el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" size="large" show-password /></el-form-item>
          <el-form-item><el-checkbox v-model="rememberMe" label="记住账号密码" /></el-form-item>
          <el-form-item><button type="submit" class="w-full py-3 rounded-lg cyber-btn text-sm">LOGIN →</button></el-form-item>
        </el-form>
        <div class="text-center text-sm" style="color:#a0a0cc;">还没有账号？<router-link to="/register" style="color:#00f0ff;">立即注册</router-link></div>
      </div>
      <div class="text-center mt-6 text-xs" style="color:#505080;">登录即表示同意《用户协议》和《隐私政策》</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref,reactive,onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth'
import type {FormInstance} from 'element-plus'
const router=useRouter(),authStore=useAuthStore()
const loading=ref(false),formRef=ref<FormInstance>(),rememberMe=ref(false)
const form=reactive({username:'',password:''})
onMounted(()=>{const s=localStorage.getItem('lsjy_remember');if(s){try{const d=JSON.parse(s);form.username=d.username||'';form.password=d.password||'';rememberMe.value=true}catch(e){}}})
const rules={username:[{required:true,message:'请输入用户名',trigger:'blur'}],password:[{required:true,message:'请输入密码',trigger:'blur'},{min:6,message:'密码至少6位',trigger:'blur'}]}
async function handleLogin(){
  if(!formRef.value)return
  await formRef.value.validate(async(valid)=>{
    if(!valid)return
    loading.value=true
    const s=await authStore.login(form.username,form.password)
    loading.value=false
    if(s){if(rememberMe.value)localStorage.setItem('lsjy_remember',JSON.stringify({username:form.username,password:form.password}));else localStorage.removeItem('lsjy_remember');if(window.location.hostname.startsWith('admin'))router.push('/admin/dashboard');else router.push('/dashboard')}
  })
}
</script>
<style scoped>
.cyber-glow-text{text-shadow:0 0 10px #00f0ff,0 0 20px #00f0ff40}
.cyber-btn{background:linear-gradient(135deg,#00f0ff20,#ff2d9520);border:1px solid #00f0ff;color:#00f0ff;transition:all .3s;letter-spacing:2px;font-weight:700;cursor:pointer}
.cyber-btn:hover{background:linear-gradient(135deg,#00f0ff40,#ff2d9540);box-shadow:0 0 15px #00f0ff60,0 0 30px #ff2d9530;transform:translateY(-1px)}
</style>
