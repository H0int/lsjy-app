import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import './assets/style.css'
// build-v20260707b - vision image recognition fix
const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(pinia)
document.documentElement.classList.add('dark')
app.mount('#app')
