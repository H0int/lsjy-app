import { createApp } from 'vue'
import {
  ElButton,
  ElButtonGroup,
  ElCheckbox,
  ElDatePicker,
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElPagination,
  ElPopconfirm,
  ElPopover,
  ElProgress,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag,
  ElUpload,
} from 'element-plus'
import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/el-button.css'
import 'element-plus/theme-chalk/el-button-group.css'
import 'element-plus/theme-chalk/el-checkbox.css'
import 'element-plus/theme-chalk/el-date-picker.css'
import 'element-plus/theme-chalk/el-dialog.css'
import 'element-plus/theme-chalk/el-dropdown.css'
import 'element-plus/theme-chalk/el-form.css'
import 'element-plus/theme-chalk/el-input.css'
import 'element-plus/theme-chalk/el-input-number.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-option.css'
import 'element-plus/theme-chalk/el-overlay.css'
import 'element-plus/theme-chalk/el-pagination.css'
import 'element-plus/theme-chalk/el-popconfirm.css'
import 'element-plus/theme-chalk/el-popover.css'
import 'element-plus/theme-chalk/el-progress.css'
import 'element-plus/theme-chalk/el-select.css'
import 'element-plus/theme-chalk/el-slider.css'
import 'element-plus/theme-chalk/el-switch.css'
import 'element-plus/theme-chalk/el-tab-pane.css'
import 'element-plus/theme-chalk/el-table.css'
import 'element-plus/theme-chalk/el-tag.css'
import 'element-plus/theme-chalk/el-tabs.css'
import 'element-plus/theme-chalk/el-upload.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import './assets/style.css'

const app = createApp(App)

app.config.errorHandler = (err) => {
  console.error('[LSJY Frontend Error]', err)
  const root = document.getElementById('app')
  if (root && !root.children.length) {
    root.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050812;color:#00f0ff;font-family:Arial,sans-serif;text-align:center;padding:24px;"><div><h2>页面加载异常</h2><p style="color:#9aa4c7;">请刷新页面，或关闭微信网页后重新打开。</p></div></div>'
  }
}

;[
  ElButton,
  ElButtonGroup,
  ElCheckbox,
  ElDatePicker,
  ElDialog,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElPagination,
  ElPopconfirm,
  ElPopover,
  ElProgress,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag,
  ElUpload,
].forEach((component) => app.use(component))

app.use(router)
app.use(pinia)
app.mount('#app')
