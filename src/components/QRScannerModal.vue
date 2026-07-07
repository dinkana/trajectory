<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { useI18n } from '@/composables/useI18n'
import { decodeData } from '@/utils/encoding'
import type { SkillTree } from '@/types'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success', trees: SkillTree[]): void
}>()

const { t } = useI18n()
const scannerRef = ref<HTMLDivElement | null>(null)
const error = ref('')
let html5Qrcode: Html5Qrcode | null = null

onMounted(async () => {
  if (!scannerRef.value) return
  
  html5Qrcode = new Html5Qrcode('qr-scanner-region')
  
  try {
    await html5Qrcode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        let code = decodedText
        if (code.includes('data=')) {
          try {
            const url = new URL(code)
            code = url.searchParams.get('data') || ''
          } catch {}
        }
        
        const result = decodeData(code)
        if (result) {
          html5Qrcode?.stop().then(() => {
            emit('success', result.trees)
          })
        } else {
          error.value = t('importErrorInvalid')
        }
      },
      () => {
        // ignore parse errors
      }
    )
  } catch (err) {
    error.value = 'Не удалось запустить камеру. Проверьте разрешения.'
  }
})

onUnmounted(() => {
  if (html5Qrcode) {
    html5Qrcode.stop().catch(() => {})
  }
})
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-300 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ t('qrScannerTitle') }}</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ t('qrScannerDesc') }}</p>
      
      <div id="qr-scanner-region" ref="scannerRef" class="w-full aspect-square bg-black rounded-lg overflow-hidden mb-4"></div>
      
      <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>
      
      <div class="flex justify-end">
        <button @click="emit('close')" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          {{ t('cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>