<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import type { SkillTree } from '@/types'

const router = useRouter()

defineProps<{
  tree: SkillTree
  progress: { done: number; total: number }
  isMentor: boolean
}>()

const emit = defineEmits<{
  (e: 'copy', id: string): void
  (e: 'share', id: string): void
  (e: 'export', id: string): void
  (e: 'qr', id: string): void
  (e: 'delete', id: string): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 flex flex-col shadow-sm">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ tree.title }}</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">{{ tree.description || t('noDescription') }}</p>
    
    <div class="mb-3">
      <div v-if="progress.done > 0" class="flex items-center gap-2">
        <div class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-500 rounded-full transition-all" :style="{ width: `${(progress.done / progress.total) * 100}%` }"></div>
        </div>
        <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          {{ t('studied') }} {{ progress.done }}/{{ progress.total }}
        </span>
      </div>
      <span v-else class="text-xs text-gray-500 dark:text-gray-500">{{ t('notStarted') }}</span>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <button @click="router.push({ name: 'tracker', params: { id: tree.id } })" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium">
        {{ t('study') }}
      </button>
      <button v-if="isMentor" @click="router.push({ name: 'editor', params: { id: tree.id } })" class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition text-sm font-medium">
        {{ t('edit') }}
      </button>
      
      <div v-if="isMentor" class="flex items-center gap-1 ml-auto">
        <button @click="emit('qr', tree.id)" :title="t('generateQR')" class="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition border border-transparent hover:border-indigo-300 dark:hover:border-indigo-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
          </svg>
        </button>
        <button @click="emit('copy', tree.id)" :title="t('copyTree')" class="p-2 text-gray-600 dark:text-gray-400 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition border border-transparent hover:border-cyan-300 dark:hover:border-cyan-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </button>
        <button @click="emit('share', tree.id)" :title="t('share')" class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition border border-transparent hover:border-blue-300 dark:hover:border-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
        </button>
        <button @click="emit('export', tree.id)" :title="t('export')" class="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition border border-transparent hover:border-purple-300 dark:hover:border-purple-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
        </button>
        <button @click="emit('delete', tree.id)" :title="t('delete')" class="p-2 text-gray-600 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition border border-transparent hover:border-red-300 dark:hover:border-red-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>