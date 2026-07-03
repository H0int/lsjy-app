import { visitorApi } from '@/api'

let lastClickAt = 0
let installed = false

function buildTargetPath(el: HTMLElement) {
  const parts: string[] = []
  let current: HTMLElement | null = el
  while (current && current !== document.body && parts.length < 4) {
    const name = current.tagName.toLowerCase()
    const id = current.id ? `#${current.id}` : ''
    const cls = current.className && typeof current.className === 'string'
      ? `.${current.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.')}`
      : ''
    parts.unshift(`${name}${id}${cls}`)
    current = current.parentElement
  }
  return parts.join(' > ')
}

function isTrackable(el: HTMLElement | null) {
  return !!el?.closest('button,a,[role="button"],.cursor-pointer,.cyber-card')
}

export function installClickTracker() {
  if (installed || typeof window === 'undefined') return
  installed = true

  document.addEventListener('click', (event) => {
    const now = Date.now()
    if (now - lastClickAt < 800) return
    lastClickAt = now

    const target = event.target as HTMLElement | null
    const clickable = target?.closest('button,a,[role="button"],.cursor-pointer,.cyber-card') as HTMLElement | null
    if (!isTrackable(clickable)) return

    const targetText = (clickable?.innerText || clickable?.getAttribute('aria-label') || clickable?.getAttribute('title') || '').trim()
    visitorApi.trackClick({
      page: window.location.hash || window.location.pathname,
      targetText,
      targetTag: clickable?.tagName || '',
      targetPath: clickable ? buildTargetPath(clickable) : '',
    }).catch(() => {
      // 点击记录不影响主流程
    })
  }, true)
}
