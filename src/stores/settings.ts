import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Theme, Locale } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'system')
  const locale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'ru')
  
  const lastActiveDate = ref<string>(localStorage.getItem('lastActiveDate') || '')
  const streak = ref<number>(parseInt(localStorage.getItem('streak') || '0'))

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

  function recordActivity() {
    const today = new Date().toDateString()
    if (lastActiveDate.value === today) return
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (lastActiveDate.value === yesterday.toDateString()) {
      streak.value++
    } else {
      streak.value = 1
    }
    
    lastActiveDate.value = today
    localStorage.setItem('lastActiveDate', today)
    localStorage.setItem('streak', streak.value.toString())
  }

  watch(theme, applyTheme, { immediate: true })

  return { 
    theme, 
    locale, 
    setTheme, 
    setLocale, 
    streak, 
    recordActivity 
  }
})