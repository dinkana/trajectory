import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Theme, Locale, UserRole } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'system')
  const locale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'ru')
  const userRole = ref<UserRole>((localStorage.getItem('userRole') as UserRole) || 'student')

  function applyTheme() {
    const isDark = theme.value === 'dark' || 
      (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    try { localStorage.setItem('theme', newTheme) } catch {}
    applyTheme()
  }

  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    try { localStorage.setItem('locale', newLocale) } catch {}
  }

  function setUserRole(newRole: UserRole) {
    userRole.value = newRole
    try { localStorage.setItem('userRole', newRole) } catch {}
  }

  watch(theme, applyTheme, { immediate: true })

  return {
    theme,
    locale,
    userRole,
    setTheme,
    setLocale,
    setUserRole
  }
})