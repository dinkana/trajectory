<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTreesStore } from '@/stores/trees'
import { useI18n } from '@/composables/useI18n'
import { useCanvasNavigation } from '@/composables/useCanvasNavigation'
import { useTreeProgress } from '@/composables/useTreeProgress'
import { exportPortfolioToPng } from '@/utils/export'
import TrackerCanvas from '@/components/TrackerCanvas.vue'
import NodeInfoPanel from '@/components/NodeInfoPanel.vue'
import type { SkillTree } from '@/types'

const route = useRoute()
const router = useRouter()
const treesStore = useTreesStore()
const { t } = useI18n()

const isDark = ref(document.documentElement.classList.contains('dark'))
const observer = new MutationObserver(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

const tree = ref<SkillTree | null>(null)
const canvasRef = ref<InstanceType<typeof TrackerCanvas> | null>(null)
const svgRef = computed(() => canvasRef.value?.svgRef || null)
const selectedNodeForInfo = ref<string | null>(null)

const { viewBox, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, focusAvailable } = useCanvasNavigation(svgRef)
const { completedNodes, showWinModal, pulsingEdges, hoursPerDay, remainingHours, totalHours, completionDate, progress, initProgress, isUnlocked, isCompleted, toggleNode, resetProgress, updateHoursPerDay } = useTreeProgress(tree)

const selectedNodeData = computed(() => {
  if (!selectedNodeForInfo.value || !tree.value) return null
  return tree.value.nodes.find(n => n.id === selectedNodeForInfo.value)
})

onMounted(() => {
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  const id = route.params.id as string
  const found = treesStore.getTreeById(id)
  if (!found) { router.replace({ name: 'library' }); return }
  
  tree.value = found
  initProgress()
  if (tree.value.nodes.length > 0) {
    const xs = tree.value.nodes.map(n => n.x)
    const ys = tree.value.nodes.map(n => n.y)
    viewBox.value = {
      x: Math.min(...xs) - 150,
      y: Math.min(...ys) - 100,
      w: Math.max(...xs) - Math.min(...xs) + 300,
      h: Math.max(...ys) - Math.min(...ys) + 200
    }
  }
})

onUnmounted(() => {
  observer.disconnect()
})

function handleBgClick() {
  selectedNodeForInfo.value = null
}

function handleNodeClick(nodeId: string) {
  selectedNodeForInfo.value = nodeId
}

function handleToggleNode() {
  if (selectedNodeForInfo.value) {
    toggleNode(selectedNodeForInfo.value)
    selectedNodeForInfo.value = null
  }
}

async function handleExportPortfolio() {
  if (tree.value) {
    await exportPortfolioToPng(tree.value, completedNodes.value, isDark.value)
  }
}

function handleResetProgress() {
  if (confirm(t('resetConfirm'))) {
    resetProgress()
  }
}
</script>

<template>
  <div v-if="tree" class="flex flex-col h-[calc(100vh-65px)] bg-gray-50 dark:bg-gray-900">
    <div class="p-4 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
      <div class="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
        <button @click="router.push({ name: 'library' })" class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-gray-300 dark:border-gray-600">
          {{ t('trackerBack') }}
        </button>
        
        <div class="flex-1 min-w-[200px]">
          <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ tree.title }}</h1>
          <div class="flex items-center gap-3 mt-1">
            <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-xs">
              <div class="h-full bg-emerald-500 transition-all duration-500" :style="{ width: `${progress}%` }"></div>
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-400 font-medium">
              {{ completedNodes.length }}/{{ tree.nodes.length }} ({{ progress }}%)
            </span>
          </div>
          
          <div class="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <span v-if="totalHours > 0" class="flex items-center gap-1">
              ⏱ <span class="font-medium">{{ t('totalTime') }}:</span> {{ totalHours }}{{ t('hours') }}
            </span>
            <span v-if="remainingHours > 0 && totalHours > 0" class="flex items-center gap-2 flex-wrap">
               <span class="font-medium">{{ t('remaining') }}:</span> {{ remainingHours }}{{ t('hours') }}
              <span class="flex items-center gap-1 ml-2">
                <input 
                  type="number" 
                  min="0.5" 
                  step="0.5" 
                  :value="hoursPerDay" 
                  @input="updateHoursPerDay(Number(($event.target as HTMLInputElement).value))" 
                  class="w-12 px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center text-xs"
                />
                <span>{{ t('hoursPerDay') }}</span>
              </span>
              <span v-if="completionDate" class="font-semibold text-emerald-600 dark:text-emerald-400">
                ({{ t('finishDate') }}: {{ completionDate }})
              </span>
            </span>
          </div>
        </div>

        <button @click="focusAvailable(tree.nodes, isUnlocked, isCompleted)" class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-gray-300 dark:border-gray-600">
          {{ t('focusAvailable') }}
        </button>

        <button @click="handleExportPortfolio" :disabled="completedNodes.length === 0" class="px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition border border-emerald-200 dark:border-emerald-800 disabled:opacity-30 disabled:cursor-not-allowed">
          {{ t('exportPortfolio') }}
        </button>

        <button @click="handleResetProgress" :disabled="completedNodes.length === 0" class="px-3 py-2 text-sm text-gray-700 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition border border-gray-300 dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
          {{ t('trackerReset') }}
        </button>
      </div>
    </div>

    <div 
      class="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing touch-none"
      @mousedown="(e) => handleMouseDown(e, handleBgClick)"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel.prevent="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <TrackerCanvas 
        ref="canvasRef" 
        :tree="tree" 
        :viewBox="viewBox" 
        :completed-nodes="completedNodes" 
        :pulsing-edges="pulsingEdges" 
        :is-dark="isDark"
        @node-click="handleNodeClick"
      />
    </div>

    <NodeInfoPanel 
      :node-data="selectedNodeData" 
      :is-unlocked="selectedNodeForInfo ? isUnlocked(selectedNodeForInfo) : false" 
      :is-completed="selectedNodeForInfo ? isCompleted(selectedNodeForInfo) : false"
      @close="selectedNodeForInfo = null"
      @toggle="handleToggleNode"
    />

    <div v-if="showWinModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-gray-300 dark:border-gray-700 animate-win-modal">
        <div class="text-6xl mb-4"></div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ t('treeCompletedTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ t('treeCompletedMsg') }}</p>
        <button @click="showWinModal = false" class="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium shadow-lg shadow-emerald-500/20">
          {{ t('continue') }}
        </button>
      </div>
    </div>
  </div>
</template>