<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-300 dark:border-gray-700 animate-win-modal">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ t('iosInstallTitle') }}</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">{{ t('iosInstallDesc') }}</p>
      <ol class="space-y-3 mb-6">
        <li class="flex items-start gap-3 text-gray-800 dark:text-gray-200">
          <span class="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
          <span class="text-sm">{{ t('iosInstallStep1') }}</span>
        </li>
        <li class="flex items-start gap-3 text-gray-800 dark:text-gray-200">
          <span class="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
          <span class="text-sm">{{ t('iosInstallStep2') }}</span>
        </li>
      </ol>
      <button @click="emit('close')" class="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium">
        {{ t('gotIt') }}
      </button>
    </div>
  </div>
</template>