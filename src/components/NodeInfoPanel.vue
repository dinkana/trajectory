<script setup lang="ts">
import type { SkillNode } from '@/types'
import { useI18n } from '@/composables/useI18n'

defineProps<{
  nodeData: SkillNode | null
  isUnlocked: boolean
  isCompleted: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggle'): void
}>()

const { t } = useI18n()

function getResourceIcon(type: string) {
  switch (type) {
    case 'video': return '▶'
    case 'article': return '📄'
    case 'course': return '🎓'
    case 'docs': return '📘'
    case 'tool': return '🛠'
    case 'book': return '📚'
    default: return '🔗'
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="nodeData" class="fixed inset-0 z-40 flex justify-end sm:justify-end items-end sm:items-stretch pointer-events-none">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" @click="emit('close')"></div>
      <div class="relative w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl rounded-t-2xl sm:rounded-none sm:rounded-l-2xl border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 max-h-[85vh] sm:max-h-full flex flex-col overflow-hidden pointer-events-auto animate-slide-up sm:animate-slide-right">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-4">{{ nodeData.title }}</h3>
          <button @click="emit('close')" class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition flex-shrink-0">
            <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-5">
          <div v-if="nodeData.timeHours" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
            <span class="text-lg">⏱</span>
            <span>{{ t('studyTime') }}: <b class="text-gray-900 dark:text-gray-100">{{ nodeData.timeHours }}{{ t('hours') }}</b></span>
          </div>

          <div v-if="nodeData.description">
            <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{{ t('editorDescription') }}</h4>
            <p class="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{{ nodeData.description }}</p>
          </div>

          <div v-if="nodeData.cheatsheet">
            <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{{ t('cheatsheet') }}</h4>
            <pre class="bg-gray-900 dark:bg-black text-emerald-400 text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono border border-gray-700 leading-relaxed">{{ nodeData.cheatsheet }}</pre>
          </div>

          <div v-if="nodeData.resources && nodeData.resources.length > 0">
            <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{{ t('materials') }}</h4>
            <div class="space-y-2">
              <a
                v-for="res in nodeData.resources"
                :key="res.url"
                :href="res.url"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-3 p-3 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition group"
              >
                <div class="flex-shrink-0 w-9 h-9 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center text-lg font-bold">
                  {{ getResourceIcon(res.type) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{{ res.title }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ res.type }}</div>
                </div>
                <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>

          <div v-if="!nodeData.description && !nodeData.cheatsheet && !nodeData.resources?.length" class="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            {{ t('noMaterials') }}
          </div>
        </div>

        <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            @click="emit('toggle')"
            :disabled="!isUnlocked && !isCompleted"
            class="w-full py-3 rounded-xl font-medium transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            :class="isCompleted ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-gray-500/10' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'"
          >
            <svg v-if="!isCompleted" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            {{ isCompleted ? t('removeMark') : t('markAsStudied') }}
          </button>
          <p v-if="!isUnlocked && !isCompleted" class="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            {{ t('lockedHint') }}
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>