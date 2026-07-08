import { ref, onMounted, onUnmounted } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const canInstall = ref(false)
  const isIOS = ref(false)
  let deferredPrompt: BeforeInstallPromptEvent | null = null

  function checkIOS() {
    const ua = window.navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)
    const isStandalone = (window.navigator as any).standalone === true
    return isIOSDevice && isSafari && !isStandalone
  }

  function checkDisplayMode() {
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
  }

  function handleBeforeInstallPrompt(e: Event) {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    if (!checkDisplayMode()) canInstall.value = true
  }

  function handleAppInstalled() { canInstall.value = false; deferredPrompt = null }

  function handleDisplayModeChange() { if (checkDisplayMode()) canInstall.value = false }

  onMounted(() => {
    isIOS.value = checkIOS()
    if (checkDisplayMode()) { canInstall.value = false; return }
    if (isIOS.value) { canInstall.value = true; return }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
    window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange)
  })

  async function install() {
    if (!deferredPrompt) return false
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') canInstall.value = false
    deferredPrompt = null
    return outcome === 'accepted'
  }

  return { canInstall, isIOS, install }
}