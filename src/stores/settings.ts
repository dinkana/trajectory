import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Theme, Locale } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'system')
  const locale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'ru')

  function applyTheme() {
    const isDark = theme.value === 'dark' ||
      (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }

  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
  }

  watch(theme, applyTheme, { immediate: true })

  return {
    theme,
    locale,
    setTheme,
    setLocale
  }
})