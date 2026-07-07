<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

defineProps<{
  isMentor: boolean
}>()

const emit = defineEmits<{
  (e: 'quick-start'): void
  (e: 'import'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="text-center py-12">
    <div class="flex flex-col items-center gap-6">
      <p class="text-gray-500 dark:text-gray-400 text-lg max-w-md">{{ t('noTrees') }}</p>
      <div class="flex gap-3 flex-wrap justify-center">
        <button @click="emit('quick-start')" class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium shadow-sm">
          {{ t('quickStart') }}
        </button>
        <button v-if="isMentor" @click="emit('import')" class="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition text-sm font-medium">
          {{ t('import') }}
        </button>
      </div>
    </div>
  </div>
</template>