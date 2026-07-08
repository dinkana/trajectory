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
import type { SkillTree, SkillNode } from '@/types'

const route = useRoute()
const router = useRouter()
const treesStore = useTreesStore()
const { t } = useI18n()

const isDark = ref(document.documentElement.classList.contains('dark'))
const observer = new MutationObserver(() => { isDark.value = document.documentElement.classList.contains('dark') })

const tree = ref<SkillTree | null>(null)
const canvasRef = ref<InstanceType<typeof TrackerCanvas> | null>(null)
const svgRef = computed(() => canvasRef.value?.svgRef || null)

const selectedNodeForInfo = ref<string | null>(null)
const showReportToast = ref(false)
const showMobileMenu = ref(false)

const statusToast = ref<{ message: string, type: 'success' | 'error' } | null>(null)

const { viewBox, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, focusAvailable } = useCanvasNavigation(svgRef)
const { completedNodes, showWinModal, pulsingEdges, hoursPerDay, remainingHours, totalHours, completionDate, progress, initProgress, isUnlocked, isCompleted, toggleNode, resetProgress, updateHoursPerDay, generateTextReport } = useTreeProgress(tree)

const selectedNodeData = computed((): SkillNode | null => {
  if (!selectedNodeForInfo.value || !tree.value) return null
  return tree.value.nodes.find(n => n.id === selectedNodeForInfo.value) || null
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

onUnmounted(() => { observer.disconnect() })

function handleBgClick() { selectedNodeForInfo.value = null }
function handleNodeClick(nodeId: string) { selectedNodeForInfo.value = nodeId }

function handleToggleNode() {
  if (selectedNodeForInfo.value) {
    toggleNode(selectedNodeForInfo.value)
    selectedNodeForInfo.value = null
  }
}

async function handleExportPortfolio() {
  if (tree.value) await exportPortfolioToPng(tree.value, completedNodes.value, isDark.value)
}

function handleCopyReport() {
  if (completedNodes.value.length === 0) {
    statusToast.value = { message: t('noCompletedSteps'), type: 'error' }
    setTimeout(() => { statusToast.value = null }, 2500)
    return
  }
  const report = generateTextReport()
  navigator.clipboard.writeText(report).then(() => {
    showReportToast.value = true
    setTimeout(() => { showReportToast.value = false }, 3000)
  })
}

function handleResetProgress() {
  if (confirm(t('resetConfirm'))) resetProgress()
}
</script>

<template>
  <div v-if="tree" class="flex flex-col h-[calc(100vh-65px)] bg-gray-50 dark:bg-gray-900">
    
    <!-- Mobile Header (Compact) -->
    <div class="sm:hidden h-12 px-2 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex items-center gap-2 z-20 flex-shrink-0">
      <button @click="router.push({ name: 'library' })" class="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex-shrink-0">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <div class="flex-1 min-w-0">
        <h1 class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{{ tree.title }}</h1>
        <div class="flex items-center gap-2 mt-0.5">
          <div class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 transition-all" :style="{ width: `${progress}%` }"></div>
          </div>
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ progress }}%</span>
        </div>
      </div>
      <button @click="showMobileMenu = true" class="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex-shrink-0">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
      </button>
    </div>

    <!-- PC Header (Full) -->
    <div class="hidden sm:block p-4 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
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
              ⏱<span class="font-medium">{{ t('totalTime') }}:</span>{{ totalHours }}{{ t('hours') }}
            </span>
            <span v-if="remainingHours > 0 && totalHours > 0" class="flex items-center gap-2 flex-wrap">
              <span class="font-medium">{{ t('remaining') }}:</span>{{ remainingHours }}{{ t('hours') }}
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
        <button @click="handleCopyReport" class="px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition border border-blue-200 dark:border-blue-800">
          {{ t('reportForMentor') }}
        </button>
        <button @click="handleExportPortfolio" :disabled="completedNodes.length === 0" class="px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition border border-emerald-200 dark:border-emerald-800 disabled:opacity-30 disabled:cursor-not-allowed">
          {{ t('exportPortfolio') }}
        </button>
        <button @click="handleResetProgress" :disabled="completedNodes.length === 0" class="px-3 py-2 text-sm text-gray-700 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition border border-gray-300 dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
          {{ t('trackerReset') }}
        </button>
      </div>
    </div>

    <!-- Canvas Area -->
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

    <!-- Mobile Bottom Sheet Menu -->
    <Teleport to="body">
      <div v-if="showMobileMenu" class="fixed inset-0 z-50 sm:hidden flex items-end justify-center">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showMobileMenu = false"></div>
        <div class="relative w-full bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl p-5 pb-8 border-t border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto">
          <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">Управление маршрутом</h3>
          
          <div class="space-y-2 mb-6">
            <div v-if="totalHours > 0" class="flex justify-between text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <span>{{ t('totalTime') }}:</span>
              <span class="font-semibold text-gray-900 dark:text-gray-100">{{ totalHours }} {{ t('hours') }}</span>
            </div>
            <div v-if="remainingHours > 0" class="flex justify-between text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <span>{{ t('remaining') }}:</span>
              <span class="font-semibold text-gray-900 dark:text-gray-100">{{ remainingHours }} {{ t('hours') }}</span>
            </div>
            <div v-if="completionDate" class="flex justify-between text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <span>{{ t('finishDate') }}:</span>
              <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ completionDate }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button @click="focusAvailable(tree.nodes, isUnlocked, isCompleted); showMobileMenu = false" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
              <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <span class="text-sm font-medium text-center">{{ t('focusAvailable') }}</span>
            </button>
            <button @click="handleCopyReport(); showMobileMenu = false" class="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span class="text-sm font-medium text-center">{{ t('reportForMentor') }}</span>
            </button>
            <button @click="handleExportPortfolio(); showMobileMenu = false" :disabled="completedNodes.length === 0" class="flex flex-col items-center justify-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 disabled:opacity-40">
              <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span class="text-sm font-medium text-center">{{ t('exportPortfolio') }}</span>
            </button>
            <button @click="handleResetProgress(); showMobileMenu = false" :disabled="completedNodes.length === 0" class="flex flex-col items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 disabled:opacity-40">
              <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span class="text-sm font-medium text-center">{{ t('trackerReset') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Win Modal -->
    <div v-if="showWinModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-gray-300 dark:border-gray-700 animate-win-modal">
        <div class="text-6xl mb-4">🏆</div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ t('treeCompletedTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ t('treeCompletedMsg') }}</p>
        <button @click="showWinModal = false" class="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium shadow-lg shadow-emerald-500/20">
          {{ t('continue') }}
        </button>
      </div>
    </div>

    <!-- Toasts -->
    <div v-if="showReportToast" class="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity z-50">
      {{ t('reportCopied') }}
    </div>
    <div v-if="statusToast" class="fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg transition-opacity z-50 text-white" :class="statusToast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'">
      {{ statusToast.message }}
    </div>
  </div>
</template>