<script setup lang="ts">
import { ref } from 'vue'
import { decodeTree } from '@/utils/encoding'
import { useTreesStore } from '@/stores/trees'
import { useI18n } from '@/composables/useI18n'

const emit = defineEmits(['close'])
const treesStore = useTreesStore()
const { t } = useI18n()

const inputCode = ref('')
const error = ref('')

function handleImport() {
  error.value = ''
  if (!inputCode.value.trim()) {
    error.value = t('importErrorEmpty')
    return
  }

  let code = inputCode.value.trim()
  if (code.includes('data=')) {
    try {
      const url = new URL(code)
      code = url.searchParams.get('data') || ''
    } catch {
      // Not a valid URL
    }
  }

  const tree = decodeTree(code)
  if (!tree) {
    error.value = t('importErrorInvalid')
    return
  }

  if (treesStore.getTreeById(tree.id)) {
    tree.id = crypto.randomUUID()
  }

  treesStore.addTree(tree)
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{{ t('importTitle') }}</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {{ t('importDesc') }}
      </p>
      
      <textarea 
        v-model="inputCode" 
        rows="4" 
        :placeholder="t('importPlaceholder')"
        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
      ></textarea>
      
      <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>

      <div class="flex justify-end gap-3 mt-6">
        <button 
          @click="emit('close')" 
          class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          {{ t('cancel') }}
        </button>
        <button 
          @click="handleImport" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {{ t('importBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>