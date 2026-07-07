<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-300 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{{ t('deleteTitle') }}</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">{{ t('deleteMessage') }}</p>
      <div class="flex justify-end gap-3">
        <button @click="emit('cancel')" class="px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-gray-300 dark:border-gray-600">
          {{ t('cancel') }}
        </button>
        <button @click="emit('confirm')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          {{ t('delete') }}
        </button>
      </div>
    </div>
  </div>
</template>