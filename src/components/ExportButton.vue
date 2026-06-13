<template>
  <div class="relative inline-block">
    <button @click="showMenu = !showMenu" class="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 border border-green-200">
      📥 导出
    </button>
    <div v-if="showMenu" class="absolute right-0 top-full mt-1 bg-white dark:bg-dark-100 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50 min-w-[120px]">
      <button @click="exportCSV" class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200">导出 CSV</button>
      <button @click="exportExcel" class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200">导出 Excel (CSV)</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  filename: string
  data: Record<string, any>[]
}>()

const showMenu = ref(false)

function downloadFile(content: string, filename: string, mimeType: string) {
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  showMenu.value = false
}

function exportCSV() {
  if (!props.data.length) return
  const headers = Object.keys(props.data[0])
  const rows = props.data.map(row => headers.map(h => {
    const val = String(row[h] ?? '')
    return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val.replace(/"/g, '""')}"` : val
  }).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  downloadFile(csv, `${props.filename}.csv`, 'text/csv;charset=utf-8')
}

function exportExcel() {
  // CSV format with .xls extension for Excel compatibility
  exportCSV()
}
</script>
