<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

defineProps<{
  show: boolean
  title: string
  description: string
}>()

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
  (e: 'update:title', val: string): void
  (e: 'update:description', val: string): void
  (e: 'save'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-300 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{{ t('treeSettings') }}</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('editorTitlePlaceholder') }}</label>
          <input :value="title" @input="$emit('update:title', ($event.target as HTMLInputElement).value)" :placeholder="t('editorTitlePlaceholder')" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('editorDescPlaceholder') }}</label>
          <textarea :value="description" @input="$emit('update:description', ($event.target as HTMLTextAreaElement).value)" :placeholder="t('editorDescPlaceholder')" rows="3" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button @click="$emit('update:show', false)" class="px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-gray-300 dark:border-gray-600">{{ t('cancel') }}</button>
        <button @click="$emit('save')" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">{{ t('editorSave') }}</button>
      </div>
    </div>
  </div>
</template>