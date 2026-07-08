<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

defineProps<{
  show: boolean
  titleDraft: string
  descDraft: string
  cheatsheetDraft: string
  timeDraft: number
  resourcesDraft: { title: string, url: string, type: string }[]
}>()

defineEmits<{
  (e: 'update:show', val: boolean): void
  (e: 'update:titleDraft', val: string): void
  (e: 'update:descDraft', val: string): void
  (e: 'update:cheatsheetDraft', val: string): void
  (e: 'update:timeDraft', val: number): void
  (e: 'add-resource'): void
  (e: 'remove-resource', index: number): void
  (e: 'update-resource', index: number, field: string, val: string): void
  (e: 'save'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 border border-gray-300 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{{ t('nodeSettings') }}</h2>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название этапа</label>
        <input :value="titleDraft" @input="$emit('update:titleDraft', ($event.target as HTMLInputElement).value)" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"/>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('editorDescription') }}</label>
        <textarea :value="descDraft" @input="$emit('update:descDraft', ($event.target as HTMLTextAreaElement).value)" rows="2" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('cheatsheet') }}</label>
        <textarea :value="cheatsheetDraft" @input="$emit('update:cheatsheetDraft', ($event.target as HTMLTextAreaElement).value)" rows="3" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"></textarea>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('timeHours') }}</label>
        <input type="number" min="0" step="0.5" :value="timeDraft" @input="$emit('update:timeDraft', Number(($event.target as HTMLInputElement).value))" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"/>
      </div>
      
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('resources') }}</label>
          <button @click="$emit('add-resource')" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">+{{ t('addResource') }}</button>
        </div>
        <div class="space-y-2">
          <div v-for="(res, index) in resourcesDraft" :key="index" class="flex gap-2 items-start p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div class="flex-1 space-y-2">
              <input :value="res.title" @input="$emit('update-resource', index, 'title', ($event.target as HTMLInputElement).value)" :placeholder="t('resTitle')" class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"/>
              <input :value="res.url" @input="$emit('update-resource', index, 'url', ($event.target as HTMLInputElement).value)" :placeholder="t('resUrl')" class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"/>
              <select :value="res.type" @change="$emit('update-resource', index, 'type', ($event.target as HTMLSelectElement).value)" class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="article">{{ t('typeArticle') }}</option>
                <option value="video">{{ t('typeVideo') }}</option>
                <option value="course">{{ t('typeCourse') }}</option>
                <option value="docs">{{ t('typeDocs') }}</option>
                <option value="tool">{{ t('typeTool') }}</option>
                <option value="book">{{ t('typeBook') }}</option>
              </select>
            </div>
            <button @click="$emit('remove-resource', index)" class="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">✕</button>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end gap-3 mt-6">
        <button @click="$emit('update:show', false)" class="px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-gray-300 dark:border-gray-600">{{ t('cancel') }}</button>
        <button @click="$emit('save')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{{ t('save') }}</button>
      </div>
    </div>
  </div>
</template>