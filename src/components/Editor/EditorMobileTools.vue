<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/composables/useI18n'

defineProps<{
  selectedNodeId: string | null
  NODE_COLORS: string[]
  selectedNodeColor: string | undefined
  historyLength: number
}>()

const emit = defineEmits<{
  (e: 'toggle-creating'): void
  (e: 'auto-layout'): void
  (e: 'undo'): void
  (e: 'open-tree-settings'): void
  (e: 'open-node-settings'): void
  (e: 'set-color', color: string): void
  (e: 'delete'): void
}>()

const { t } = useI18n()
const showToolsSheet = ref(false)
const showColorPickerSheet = ref(false)

function closeSheets() {
  showToolsSheet.value = false
  showColorPickerSheet.value = false
}
</script>

<template>
  <button @click="showToolsSheet = true" class="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center z-20 hover:bg-blue-700 transition-transform active:scale-95 border-4 border-white dark:border-gray-900 sm:hidden">
    <svg v-if="!selectedNodeId" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
    <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
  </button>

  <Teleport to="body">
    <div v-if="showToolsSheet || showColorPickerSheet" class="fixed inset-0 z-50 sm:hidden flex items-end justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeSheets"></div>
      <div class="relative w-full bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl p-5 pb-8 border-t border-gray-200 dark:border-gray-700 transform transition-transform">
        <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
        
        <template v-if="showColorPickerSheet">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">{{ t('nodeColor') }}</h3>
          <div class="flex flex-wrap justify-center gap-3 mb-2">
            <button v-for="color in NODE_COLORS" :key="color" @click="$emit('set-color', color); closeSheets()" class="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110" :class="selectedNodeColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'" :style="{ backgroundColor: color }"/>
            <button @click="$emit('set-color', ''); closeSheets()" class="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 transition-transform hover:scale-110 flex items-center justify-center text-sm text-gray-500">✕</button>
          </div>
        </template>
        
        <template v-else>
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">{{ selectedNodeId ? t('nodeSettings') : t('treeSettings') }}</h3>
          <div class="grid grid-cols-2 gap-3">
            <template v-if="!selectedNodeId">
              <button @click="$emit('toggle-creating'); closeSheets()" class="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span class="text-sm font-medium">{{ t('editorCreate') }}</span>
              </button>
              <button @click="$emit('auto-layout'); closeSheets()" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
                <span class="text-sm font-medium">{{ t('autoLayout') }}</span>
              </button>
              <button @click="$emit('undo'); closeSheets()" :disabled="historyLength === 0" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 disabled:opacity-40">
                <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                <span class="text-sm font-medium">{{ t('editorUndo') }}</span>
              </button>
              <button @click="$emit('open-tree-settings'); closeSheets()" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span class="text-sm font-medium">{{ t('treeSettings') }}</span>
              </button>
            </template>
            <template v-else>
              <button @click="$emit('open-node-settings'); closeSheets()" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span class="text-sm font-medium">{{ t('nodeSettings') }}</span>
              </button>
              <button @click="showColorPickerSheet = true" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
                <span class="text-sm font-medium">{{ t('nodeColor') }}</span>
              </button>
              <button @click="$emit('delete'); closeSheets()" class="flex flex-col items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                <span class="text-sm font-medium">{{ t('editorDelete') }}</span>
              </button>
            </template>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>