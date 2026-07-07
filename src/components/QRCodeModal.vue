<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  url: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()
const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  if (canvasRef.value) {
    await QRCode.toCanvas(canvasRef.value, props.url, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    })
  }
})
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-300 dark:border-gray-700">
      <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ t('qrTitle') }}</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ t('qrDesc') }}</p>
      
      <div class="flex justify-center mb-4">
        <canvas ref="canvasRef" class="rounded-lg border border-gray-300 dark:border-gray-600"></canvas>
      </div>
      
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
        <p class="text-xs text-gray-600 dark:text-gray-400 break-all">{{ url }}</p>
      </div>
      
      <div class="flex justify-end gap-3">
        <button @click="emit('close')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          {{ t('close') }}
        </button>
      </div>
    </div>
  </div>
</template>