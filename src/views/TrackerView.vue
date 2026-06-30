<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTreesStore } from '@/stores/trees'
import { useI18n } from '@/composables/useI18n'
import type { SkillTree } from '@/types'

const route = useRoute()
const router = useRouter()
const treesStore = useTreesStore()
const { t } = useI18n()

const isDark = ref(document.documentElement.classList.contains('dark'))
const observer = new MutationObserver(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

onMounted(() => { observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }) })
onUnmounted(() => { observer.disconnect() })

const tree = ref<SkillTree | null>(null)
const completedNodes = ref<string[]>([])
const pulsingEdges = ref<string[]>([])
const hoveredNodeId = ref<string | null>(null)
const showWinModal = ref(false)
const viewBox = ref({ x: 0, y: 0, w: 1000, h: 600 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const svgRef = ref<SVGSVGElement | null>(null)
const canvasRef = ref<HTMLDivElement | null>(null)
const touchStartDist = ref(0)
const touchStartViewBox = ref({ x: 0, y: 0, w: 0, h: 0 })

onMounted(() => {
  const id = route.params.id as string
  const found = treesStore.getTreeById(id)
  if (!found) { router.replace({ name: 'library' }); return }
  tree.value = found
  completedNodes.value = treesStore.getProgress(id)
  if (tree.value.nodes.length > 0) {
    const xs = tree.value.nodes.map(n => n.x); const ys = tree.value.nodes.map(n => n.y)
    viewBox.value = { x: Math.min(...xs) - 150, y: Math.min(...ys) - 100, w: Math.max(...xs) - Math.min(...xs) + 300, h: Math.max(...ys) - Math.min(...ys) + 200 }
  }
})

watch(() => completedNodes.value.length, (newLen) => {
  if (tree.value && tree.value.nodes.length > 0 && newLen === tree.value.nodes.length) {
    setTimeout(() => { showWinModal.value = true }, 800)
  }
})

function getEdgePath(fromId: string, toId: string): string {
  const fromNode = tree.value?.nodes.find(n => n.id === fromId)
  const toNode = tree.value?.nodes.find(n => n.id === toId)
  if (!fromNode || !toNode) return ''
  const midX = (fromNode.x + toNode.x) / 2
  return `M${fromNode.x} ${fromNode.y} C${midX} ${fromNode.y},${midX} ${toNode.y},${toNode.x} ${toNode.y}`
}

const isUnlocked = (nodeId: string): boolean => {
  if (!tree.value) return false
  const incoming = tree.value.edges.filter(e => e.to === nodeId)
  if (incoming.length === 0) return true
  return incoming.every(e => completedNodes.value.includes(e.from))
}

const isCompleted = (nodeId: string): boolean => completedNodes.value.includes(nodeId)

const progress = computed(() => {
  if (!tree.value || tree.value.nodes.length === 0) return 0
  return Math.round((completedNodes.value.length / tree.value.nodes.length) * 100)
})

function toggleNode(nodeId: string) {
  if (!tree.value) return
  if (!isUnlocked(nodeId) && !isCompleted(nodeId)) return
  treesStore.toggleNode(tree.value.id, nodeId)
  completedNodes.value = treesStore.getProgress(tree.value.id)
  if (isCompleted(nodeId)) triggerPulse(nodeId)
}

function resetProgress() {
  if (!tree.value) return
  if (confirm(t('resetConfirm'))) {
    treesStore.resetProgress(tree.value.id); completedNodes.value = []; showWinModal.value = false
  }
}

async function exportToPng() {
  if (!canvasRef.value || !tree.value || !svgRef.value) return
  const svg = svgRef.value
  const clone = svg.cloneNode(true) as SVGSVGElement
  const originalElements = svg.querySelectorAll('*')
  const clonedElements = clone.querySelectorAll('*')
  const styleProps = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'font-size', 'font-weight', 'font-family', 'text-anchor', 'opacity', 'color', 'background-color']
  for (let i = 0; i < clonedElements.length; i++) {
    const clonedEl = clonedElements[i]; const origEl = originalElements[i]
    if (!origEl || !(origEl instanceof Element)) continue
    const computed = window.getComputedStyle(origEl as Element)
    for (const prop of styleProps) {
      const val = computed.getPropertyValue(prop)
      if (val && val !== '' && val !== 'none') clonedEl.setAttribute(prop, val)
    }
    if (clonedEl.tagName === 'text' || clonedEl.tagName === 'TEXT') {
      const textColor = computed.color
      if (textColor && textColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'rgb(0, 0, 0)') clonedEl.setAttribute('fill', textColor)
    }
  }
  clone.querySelectorAll('foreignObject').forEach(fo => fo.remove())
  clone.querySelectorAll('pattern path').forEach(p => { p.setAttribute('stroke', '#9ca3af'); p.setAttribute('opacity', '0.25') })
  const nodes = tree.value.nodes
  if (nodes.length === 0) return
  const xs = nodes.map(n => n.x); const ys = nodes.map(n => n.y)
  const padding = 120
  const minX = Math.min(...xs) - padding; const minY = Math.min(...ys) - padding
  const maxX = Math.max(...xs) + padding; const maxY = Math.max(...ys) + padding
  const width = maxX - minX; const height = maxY - minY
  clone.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`)
  clone.setAttribute('width', String(width)); clone.setAttribute('height', String(height))
  let svgString = new XMLSerializer().serializeToString(clone)
  if (!svgString.includes('xmlns=')) svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  const bgColor = isDark.value ? '#111827' : '#f9fafb'
  const canvas = document.createElement('canvas'); const scale = 2
  canvas.width = width * scale; canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(scale, scale); ctx.fillStyle = bgColor; ctx.fillRect(0, 0, width, height)
  const img = new Image()
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  img.onload = () => {
    ctx.drawImage(img, 0, 0); URL.revokeObjectURL(url)
    const link = document.createElement('a')
    link.download = `${tree.value!.title || 'tree'}.png`; link.href = canvas.toDataURL('image/png'); link.click()
  }
  img.onerror = () => { console.error('Export failed'); URL.revokeObjectURL(url) }
  img.src = url
}

function triggerPulse(nodeId: string) {
  if (!tree.value) return
  tree.value.edges.filter(e => e.from === nodeId).forEach(e => {
    pulsingEdges.value.push(e.id)
    setTimeout(() => { pulsingEdges.value = pulsingEdges.value.filter(id => id !== e.id) }, 1000)
  })
}

function handleMouseDown(e: MouseEvent) {
  if ((e.target as Element).tagName === 'svg' || ((e.target as Element).tagName === 'rect' && (e.target as Element).id === 'bg')) {
    isPanning.value = true; panStart.value = { x: e.clientX, y: e.clientY }
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!isPanning.value) return
  const dx = (e.clientX - panStart.value.x) * (viewBox.value.w / window.innerWidth)
  const dy = (e.clientY - panStart.value.y) * (viewBox.value.h / window.innerHeight)
  viewBox.value.x -= dx; viewBox.value.y -= dy
  panStart.value = { x: e.clientX, y: e.clientY }
}

function handleMouseUp() { isPanning.value = false }

function handleWheel(e: WheelEvent) {
  e.preventDefault()
  const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
  const newW = viewBox.value.w * zoomFactor; const newH = viewBox.value.h * zoomFactor
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height
  viewBox.value.x += (viewBox.value.w - newW) * mx; viewBox.value.y += (viewBox.value.h - newH) * my
  viewBox.value.w = newW; viewBox.value.h = newH
}

function getTouchDistance(touches: TouchList) {
  return Math.sqrt((touches[0].clientX - touches[1].clientX) ** 2 + (touches[0].clientY - touches[1].clientY) ** 2)
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) { isPanning.value = true; panStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  else if (e.touches.length === 2) { isPanning.value = false; touchStartDist.value = getTouchDistance(e.touches); touchStartViewBox.value = { ...viewBox.value } }
}

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length === 1 && isPanning.value) {
    const dx = (e.touches[0].clientX - panStart.value.x) * (viewBox.value.w / window.innerWidth)
    const dy = (e.touches[0].clientY - panStart.value.y) * (viewBox.value.h / window.innerHeight)
    viewBox.value.x -= dx; viewBox.value.y -= dy
    panStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  } else if (e.touches.length === 2) {
    const dist = getTouchDistance(e.touches); const scale = touchStartDist.value / dist
    const newW = touchStartViewBox.value.w * scale; const newH = touchStartViewBox.value.h * scale
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2; const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
    const rect = svgRef.value?.getBoundingClientRect()
    if (!rect) return
    const mx = (cx - rect.left) / rect.width; const my = (cy - rect.top) / rect.height
    viewBox.value.x = touchStartViewBox.value.x + (touchStartViewBox.value.w - newW) * mx
    viewBox.value.y = touchStartViewBox.value.y + (touchStartViewBox.value.h - newH) * my
    viewBox.value.w = newW; viewBox.value.h = newH
  }
}

function handleTouchEnd(e: TouchEvent) { if (e.touches.length === 0) isPanning.value = false }

function getNodeFill(nodeId: string): string {
  const node = tree.value?.nodes.find(n => n.id === nodeId)
  if (isCompleted(nodeId)) return '#10b981'
  if (node?.color) return node.color
  if (!isUnlocked(nodeId)) return isDark.value ? '#1f2937' : '#f3f4f6'
  return isDark.value ? '#1f2937' : '#ffffff'
}

function getNodeStroke(nodeId: string): string {
  if (isCompleted(nodeId)) return '#059669'
  const node = tree.value?.nodes.find(n => n.id === nodeId)
  if (node?.color) return node.color
  if (!isUnlocked(nodeId)) return isDark.value ? '#374151' : '#d1d5db'
  return '#3b82f6'
}

function getNodeTextColor(nodeId: string): string {
  const node = tree.value?.nodes.find(n => n.id === nodeId)
  if (isCompleted(nodeId) || node?.color) return '#ffffff'
  if (!isUnlocked(nodeId)) return isDark.value ? '#6b7280' : '#9ca3af'
  return isDark.value ? '#f3f4f6' : '#111827'
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
        </div>
        <button @click="exportToPng" class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-gray-300 dark:border-gray-600">
          {{ t('exportPng') }}
        </button>
        <button @click="resetProgress" :disabled="completedNodes.length === 0" class="px-3 py-2 text-sm text-gray-700 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition border border-gray-300 dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-700">
          {{ t('trackerReset') }}
        </button>
      </div>
    </div>
    <div ref="canvasRef" class="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing touch-none">
      <svg
        ref="svgRef" class="w-full h-full"
        :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
        @mousedown="handleMouseDown" @mousemove="handleMouseMove"
        @mouseup="handleMouseUp" @mouseleave="handleMouseUp"
        @wheel="handleWheel" @touchstart="handleTouchStart"
        @touchmove.prevent="handleTouchMove" @touchend="handleTouchEnd"
      >
        <rect id="bg" x="-10000" y="-10000" width="20000" height="20000" fill="transparent" />
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3" class="text-gray-300 dark:text-gray-700" />
          </pattern>
        </defs>
        <rect x="-10000" y="-10000" width="20000" height="20000" fill="url(#grid)" />
        <g>
          <template v-for="edge in tree.edges" :key="edge.id">
            <path :d="getEdgePath(edge.from, edge.to)" fill="none" stroke-width="2.5" stroke-linecap="round" :class="isCompleted(edge.from) ? 'stroke-emerald-500 dark:stroke-emerald-400' : 'stroke-gray-400 dark:stroke-gray-600'" />
            <path v-if="pulsingEdges.includes(edge.id)" :d="getEdgePath(edge.from, edge.to)" fill="none" stroke="#34d399" stroke-width="4" stroke-linecap="round" class="edge-pulse" />
          </template>
        </g>
        <g v-for="node in tree.nodes" :key="node.id" :transform="`translate(${node.x},${node.y})`" class="transition-transform" :class="{ 'cursor-pointer': isUnlocked(node.id) || isCompleted(node.id) }" @click.stop="toggleNode(node.id)" @mouseenter="hoveredNodeId = node.id" @mouseleave="hoveredNodeId = null">
          <rect x="-80" y="-24" width="160" height="48" rx="24" stroke-width="2" :fill="getNodeFill(node.id)" :stroke="getNodeStroke(node.id)" />
          <text x="0" y="5" text-anchor="middle" class="text-sm font-semibold pointer-events-none select-none" :fill="getNodeTextColor(node.id)">
            {{ node.title.length > 18 ? node.title.substring(0, 18) + '...' : node.title }}
          </text>
          <g v-if="isCompleted(node.id)" transform="translate(60, 0)">
            <circle cx="0" cy="0" r="10" fill="#ffffff" class="opacity-20" />
            <path d="M-4 0 L-1 3 L4-3" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </g>
          <g v-if="!isCompleted(node.id) && !isUnlocked(node.id)" transform="translate(60, 0)" class="text-gray-400 dark:text-gray-600">
            <rect x="-4.5" y="-1" width="9" height="7" rx="1.5" fill="currentColor" />
            <path d="M-2.5-1 V-3.5 A2.5 2.5 0 0 1 2.5-3.5 V-1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </g>
          <foreignObject v-if="hoveredNodeId === node.id && node.description" :x="-100" :y="30" width="200" height="100" class="pointer-events-none overflow-visible export-hide">
            <div xmlns="http://www.w3.org/1999/xhtml" class="bg-gray-900 dark:bg-gray-700 text-white text-xs p-3 rounded-lg shadow-xl border border-gray-700 dark:border-gray-600 break-words leading-relaxed">
              {{ node.description }}
            </div>
          </foreignObject>
        </g>
      </svg>
    </div>
    <div v-if="showWinModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-gray-300 dark:border-gray-700 animate-win-modal">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{{ t('treeCompletedTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ t('treeCompletedMsg') }}</p>
        <button @click="showWinModal = false" class="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium shadow-lg shadow-emerald-500/20">
          {{ t('continue') }}
        </button>
      </div>
    </div>
  </div>
</template>