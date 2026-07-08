<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

defineProps<{
  historyLength: number
  isCreating: boolean
  selectedNodeId: string | null
  showColorPicker: boolean
  NODE_COLORS: string[]
  selectedNodeColor: string | undefined
}>()

defineEmits<{
  (e: 'undo'): void
  (e: 'toggle-creating'): void
  (e: 'auto-layout'): void
  (e: 'open-settings'): void
  (e: 'toggle-color-picker'): void
  (e: 'set-color', color: string): void
  (e: 'delete'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="hidden sm:flex absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-2 gap-2 border border-gray-300 dark:border-gray-700 z-20">
    <button @click="$emit('undo')" :disabled="historyLength === 0" class="px-4 py-2 rounded-lg text-sm font-medium transition bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed">
      {{ t('editorUndo') }}
    </button>
    <button @click="$emit('toggle-creating')" class="px-4 py-2 rounded-lg text-sm font-medium transition" :class="isCreating ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'">
      {{ t('editorCreate') }}
    </button>
    <button @click="$emit('auto-layout')" class="px-4 py-2 rounded-lg text-sm font-medium transition bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600">
      {{ t('autoLayout') }}
    </button>
    <button @click="$emit('open-settings')" :disabled="!selectedNodeId" class="px-4 py-2 rounded-lg text-sm font-medium transition bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed">
      {{ t('nodeSettings') }}
    </button>
    
    <div class="relative">
      <button @click="$emit('toggle-color-picker')" :disabled="!selectedNodeId" class="px-4 py-2 rounded-lg text-sm font-medium transition bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed">
        {{ t('nodeColor') }}
      </button>
      <div v-if="showColorPicker" class="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl p-2 flex gap-1.5 z-30">
        <button v-for="color in NODE_COLORS" :key="color" @click="$emit('set-color', color)" class="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110" :class="selectedNodeColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'" :style="{ backgroundColor: color }"/>
        <button @click="$emit('set-color', '')" class="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 transition-transform hover:scale-110 flex items-center justify-center text-xs text-gray-500" title="Сбросить цвет">✕</button>
      </div>
    </div>

    <button @click="$emit('delete')" :disabled="!selectedNodeId" class="px-4 py-2 rounded-lg text-sm font-medium transition bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-300 dark:border-red-800 disabled:opacity-40 disabled:cursor-not-allowed">
      {{ t('editorDelete') }}
    </button>
  </div>
</template>