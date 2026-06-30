<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from '@/composables/useI18n'
import { onMounted, computed } from 'vue'

const settings = useSettingsStore()
const { t } = useI18n()

const isDark = computed(() => {
  if (settings.theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return settings.theme === 'dark'
})

onMounted(() => {
  settings.setTheme(settings.theme)
})

function toggleTheme() {
  settings.setTheme(isDark.value ? 'light' : 'dark')
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors">
    <header class="border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold text-blue-600 dark:text-blue-400">
          {{ t('appTitle') }}
        </router-link>
        <div class="flex gap-3 items-center">
          <select
            :value="settings.locale"
            @change="settings.setLocale(($event.target as HTMLSelectElement).value as any)"
            class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm"
          >
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
          <button
            @click="toggleTheme"
            class="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center transition hover:bg-gray-100 dark:hover:bg-gray-700"
            :title="isDark ? t('themeLight') : t('themeDark')"
          >
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-gray-100" viewBox="0 0 24 24">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
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