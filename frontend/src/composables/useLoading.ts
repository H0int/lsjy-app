import { ref } from 'vue'

/**
 * 通用加载状态管理
 */
export function useLoading() {
  const loading = ref(false)

  async function withLoading<T>(fn: () => Promise<T>): Promise<T | undefined> {
    loading.value = true
    try {
      return await fn()
    } catch (e) {
      console.error(e)
      return undefined
    } finally {
      loading.value = false
    }
  }

  return { loading, withLoading }
}
