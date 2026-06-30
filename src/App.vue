<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from '@/composables/useI18n'
import { onMounted } from 'vue'

const settings = useSettingsStore()
const { t } = useI18n()

onMounted(() => {
  settings.setTheme(settings.theme)
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors">
    <header class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold text-blue-600 dark:text-blue-400">
          {{ t('appTitle') }}
        </router-link>
        
        <div class="flex gap-4 items-center">
          <select 
            :value="settings.locale" 
            @change="settings.setLocale(($event.target as HTMLSelectElement).value as any)"
            class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm"
          >
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>

          <select 
            :value="settings.theme" 
            @change="settings.setTheme(($event.target as HTMLSelectElement).value as any)"
            class="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm"
          >
            <option value="system">{{ t('themeSystem') }}</option>
            <option value="light">{{ t('themeLight') }}</option>
            <option value="dark">{{ t('themeDark') }}</option>
          </select>
        </div>
      </div>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>