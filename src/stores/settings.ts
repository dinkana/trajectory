import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Theme, Locale, UserRole, FontSize } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'system')
  const locale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'ru')
  const userRole = ref<UserRole>((localStorage.getItem('userRole') as UserRole) || 'student')
  const fontSize = ref<FontSize>((localStorage.getItem('fontSize') as FontSize) || 'base')

  function applyTheme() {
    const isDark = theme.value === 'dark' || (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }

  function applyFontSize() {
    document.documentElement.classList.remove('text-base', 'text-lg', 'text-xl')
    document.documentElement.classList.add(`text-${fontSize.value}`)
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

  function setFontSize(newSize: FontSize) {
    fontSize.value = newSize
    try { localStorage.setItem('fontSize', newSize) } catch {}
    applyFontSize()
  }

  watch(theme, applyTheme, { immediate: true })
  watch(fontSize, applyFontSize, { immediate: true })

  return {
    theme,
    locale,
    userRole,
    fontSize,
    setTheme,
    setLocale,
    setUserRole,
    setFontSize
  }
})