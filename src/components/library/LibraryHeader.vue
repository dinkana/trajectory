<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/composables/useI18n'

defineProps<{
  canInstall: boolean
  isMentor: boolean
}>()

const emit = defineEmits<{
  (e: 'install'): void
  (e: 'create'): void
  (e: 'import-by-link'): void
  (e: 'import-by-qr'): void
  (e: 'import-all'): void
  (e: 'export-all'): void
  (e: 'report'): void
}>()

const { t } = useI18n()
const showMenu = ref(false)

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function closeMenu() {
  showMenu.value = false
}
</script>

<template>
  <div class="flex gap-2 items-center">
    <button v-if="canInstall" @click="emit('install')" class="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium flex items-center gap-2 shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
      </svg>
      {{ t('installApp') }}
    </button>
    
    <div class="relative">
      <button @click="toggleMenu" class="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition text-sm font-medium flex items-center gap-2">
        {{ t('menu') }}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      
      <div v-if="showMenu" class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl z-30 overflow-hidden">
        <template v-if="isMentor">
          <button @click="emit('create'); closeMenu()" class="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {{ t('createScenario') }}
          </button>
          <div class="border-t border-gray-200 dark:border-gray-700"></div>
          <button @click="emit('import-by-link'); closeMenu()" class="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {{ t('importByLink') }}
          </button>
          <button @click="emit('import-by-qr'); closeMenu()" class="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {{ t('importByQR') }}
          </button>
          <div class="border-t border-gray-200 dark:border-gray-700"></div>
          <button @click="emit('import-all'); closeMenu()" class="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {{ t('importAllScenarios') }}
          </button>
          <button @click="emit('export-all'); closeMenu()" class="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {{ t('exportAllScenarios') }}
          </button>
        </template>
        <template v-else>
          <button @click="emit('report'); closeMenu()" class="w-full text-left px-4 py-3 text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition font-medium">
            {{ t('reportForMentor') }}
          </button>
          <div class="border-t border-gray-200 dark:border-gray-700"></div>
          <button @click="emit('import-all'); closeMenu()" class="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {{ t('importAllScenarios') }}
          </button>
          <button @click="emit('import-by-link'); closeMenu()" class="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {{ t('importByLink') }}
          </button>
          <button @click="emit('import-by-qr'); closeMenu()" class="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {{ t('importByQR') }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>