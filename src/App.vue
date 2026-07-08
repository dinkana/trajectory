<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

const settings = useSettingsStore()
const router = useRouter()
const { t } = useI18n()

const isDark = computed(() => {
  if (settings.theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return settings.theme === 'dark'
})

function toggleTheme() {
  settings.setTheme(isDark.value ? 'light' : 'dark')
}

function toggleRole() {
  settings.setUserRole(settings.userRole === 'mentor' ? 'student' : 'mentor')
}

function cycleFontSize() {
  const sizes: ('base' | 'lg' | 'xl')[] = ['base', 'lg', 'xl']
  const idx = sizes.indexOf(settings.fontSize)
  settings.setFontSize(sizes[(idx + 1) % sizes.length])
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors text-gray-900 dark:text-gray-100">
    <header class="border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center flex-wrap gap-2">
        <button @click="router.push('/')" class="text-xl font-bold text-blue-600 dark:text-blue-400">
          {{ t('appTitle') }}
        </button>
        <div class="flex gap-2 items-center flex-wrap">
          <button
            v-if="settings.userRole === 'mentor'"
            @click="router.push('/methodology')"
            class="px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
          >
            {{ t('methodology') }}
          </button>
          <button
            @click="toggleRole"
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-700"
            :class="settings.userRole === 'mentor' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'"
          >
            {{ settings.userRole === 'mentor' ? t('roleMentor') : t('roleStudent') }}
          </button>
          <button
            @click="cycleFontSize"
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            :title="t('accessibility')"
          >
            <span v-if="settings.fontSize === 'base'">A</span>
            <span v-else-if="settings.fontSize === 'lg'" class="text-lg font-bold">A</span>
            <span v-else class="text-xl font-bold">A</span>
          </button>
          <button
            @click="toggleTheme"
            class="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center transition hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-gray-100" viewBox="0 0 24 24">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 10-1.41 1.41l1.06 1.06a.996.996 0 101.41-1.41L5.99 4.58zm12.37 12.37a.996.996 0 10-1.41 1.41l1.06 1.06a.996.996 0 101.41-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 10-1.41-1.41l-1.06 1.06a.996.996 0 101.41 1.41l1.06-1.06zM7.05 18.36a.996.996 0 10-1.41-1.41l-1.06 1.06a.996.996 0 101.41 1.41l1.06-1.06z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-gray-900" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
    <main>
      <router-view/>
    </main>
  </div>
</template>