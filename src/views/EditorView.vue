<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useTreesStore } from '@/stores/trees'
import { useI18n } from '@/composables/useI18n'
import type { SkillTree, SkillNode, Resource } from '@/types'

const route = useRoute()
const router = useRouter()
const treesStore = useTreesStore()
const { t } = useI18n()

const GRID_SIZE = 20
const snap = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE

const isDark = ref(document.documentElement.classList.contains('dark'))
const observer = new MutationObserver(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

const tree = ref<SkillTree>({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  nodes: [],
  edges: []
})

const history = ref<SkillTree[]>([])
const selectedNodeId = ref<string | null>(null)
const isCreating = ref(false)
const isDirty = ref(false)

const connectingFrom = ref<string | null>(null)
const ghostLine = ref({ x1: 0, y1: 0, x2: 0, y2: 0 })

const draggingNode = ref<string | null>(null)
const dragStart = ref({ x: 0, y: 0 })
const nodeStartPos = ref({ x: 0, y: 0 })
const hasDragged = ref(false)

const viewBox = ref({ x: 0, y: 0, w: 1200, h: 800 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

const svgRef = ref<SVGSVGElement | null>(null)
const isEditing = ref(false)

const touchStartDist = ref(0)
const touchStartViewBox = ref({ x: 0, y: 0, w: 0, h: 0 })

const showNodeSettingsModal = ref(false)
const showColorPicker = ref(false)
const showMetaModal = ref(false)
const showToolsSheet = ref(false)
const showColorPickerSheet = ref(false)

// Drafts for Node Settings
const descDraft = ref('')
const cheatsheetDraft = ref('')
const timeDraft = ref(0)
const resourcesDraft = ref<{ title: string, url: string, type: string }[]>([])

const NODE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280'
]

const selectedNode = computed(() => tree.value.nodes.find(n => n.id === selectedNodeId.value))

onMounted(() => {
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  const id = route.params.id as string
  if (id) {
    const existing = treesStore.getTreeById(id)
    if (existing) {
      tree.value = JSON.parse(JSON.stringify(existing))
      isEditing.value = true
      if (tree.value.nodes.length > 0) {
        const xs = tree.value.nodes.map(n => n.x)
        const ys = tree.value.nodes.map(n => n.y)
        const minX = Math.min(...xs) - 200
        const minY = Math.min(...ys) - 100
        const maxX = Math.max(...xs) + 200
        const maxY = Math.max(...ys) + 100
        viewBox.value = { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
      }
    } else {
      router.push({ name: 'library' })
      return
    }
  }
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  observer.disconnect()
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave((_to, _from, next) => {
  if (isDirty.value && !confirm(t('editorUnsavedWarning'))) {
    next(false)
  } else {
    next()
  }
})

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (isDirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

function pushHistory() {
  history.value.push(JSON.parse(JSON.stringify(tree.value)))
  if (history.value.length > 50) history.value.shift()
  isDirty.value = true
}

function undo() {
  if (history.value.length === 0) return
  tree.value = history.value.pop()!
  selectedNodeId.value = null
}

function getSVGPointFromClient(clientX: number, clientY: number) {
  if (!svgRef.value) return { x: 0, y: 0 }
  const pt = svgRef.value.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const svgP = pt.matrixTransform(svgRef.value.getScreenCTM()?.inverse())
  return { x: svgP.x, y: svgP.y }
}

function getSVGPoint(e: MouseEvent) {
  return getSVGPointFromClient(e.clientX, e.clientY)
}

function getEdgePath(fromId: string, toId: string): string {
  const fromNode = tree.value.nodes.find(n => n.id === fromId)
  const toNode = tree.value.nodes.find(n => n.id === toId)
  if (!fromNode || !toNode) return ''
  const x1 = fromNode.x
  const y1 = fromNode.y
  const x2 = toNode.x
  const y2 = toNode.y
  const midX = (x1 + x2) / 2
  return `M${x1} ${y1} C${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
}

const ghostLinePath = computed(() => {
  if (!connectingFrom.value) return ''
  const fromNode = tree.value.nodes.find(n => n.id === connectingFrom.value)
  if (!fromNode) return ''
  const x1 = fromNode.x
  const y1 = fromNode.y
  const x2 = ghostLine.value.x2
  const y2 = ghostLine.value.y2
  const midX = (x1 + x2) / 2
  return `M${x1} ${y1} C${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
})

function autoLayout() {
  if (tree.value.nodes.length === 0) return
  pushHistory()
  const nodes = tree.value.nodes
  const edges = tree.value.edges
  const incomingMap = new Map<string, string[]>()
  nodes.forEach(n => incomingMap.set(n.id, []))
  edges.forEach(e => incomingMap.get(e.to)?.push(e.from))
  const levelMap = new Map<string, number>()
  const visited = new Set<string>()

  function computeLevel(nodeId: string): number {
    if (levelMap.has(nodeId)) return levelMap.get(nodeId)!
    if (visited.has(nodeId)) return 0
    visited.add(nodeId)
    const parents = incomingMap.get(nodeId) || []
    if (parents.length === 0) { levelMap.set(nodeId, 0); return 0 }
    let maxParentLevel = 0
    for (const parentId of parents) {
      maxParentLevel = Math.max(maxParentLevel, computeLevel(parentId))
    }
    const level = maxParentLevel + 1
    levelMap.set(nodeId, level)
    return level
  }

  nodes.forEach(n => computeLevel(n.id))
  const layers = new Map<number, SkillNode[]>()
  nodes.forEach(n => {
    const level = levelMap.get(n.id) || 0
    if (!layers.has(level)) layers.set(level, [])
    layers.get(level)!.push(n)
  })

  const horizontalSpacing = 220
  const verticalSpacing = 130
  const startY = 80

  layers.forEach((layerNodes, level) => {
    const layerWidth = (layerNodes.length - 1) * horizontalSpacing
    const startX = 600 - layerWidth / 2
    layerNodes.forEach((node, index) => {
      node.x = snap(startX + index * horizontalSpacing)
      node.y = snap(startY + level * verticalSpacing)
    })
  })

  const allYs = nodes.map(n => n.y)
  const minY = Math.min(...allYs)
  const offsetX = 600 - (Math.min(...nodes.map(n => n.x)) + Math.max(...nodes.map(n => n.x))) / 2
  const offsetY = 100 - minY

  nodes.forEach(n => {
    n.x = snap(n.x + offsetX)
    n.y = snap(n.y + offsetY)
  })

  const xs = nodes.map(n => n.x)
  const ys = nodes.map(n => n.y)
  viewBox.value = {
    x: Math.min(...xs) - 200,
    y: Math.min(...ys) - 100,
    w: Math.max(...xs) - Math.min(...xs) + 400,
    h: Math.max(...ys) - Math.min(...ys) + 200
  }
}

function processMove(clientX: number, clientY: number) {
  if (isPanning.value) {
    const dx = (clientX - panStart.value.x) * (viewBox.value.w / window.innerWidth)
    const dy = (clientY - panStart.value.y) * (viewBox.value.h / window.innerHeight)
    viewBox.value.x -= dx
    viewBox.value.y -= dy
    panStart.value = { x: clientX, y: clientY }
    return
  }
  if (draggingNode.value) {
    const { x, y } = getSVGPointFromClient(clientX, clientY)
    const dx = x - dragStart.value.x
    const dy = y - dragStart.value.y
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasDragged.value = true
    const node = tree.value.nodes.find(n => n.id === draggingNode.value)
    if (node) {
      node.x = snap(nodeStartPos.value.x + dx)
      node.y = snap(nodeStartPos.value.y + dy)
    }
    return
  }
  if (connectingFrom.value) {
    const { x, y } = getSVGPointFromClient(clientX, clientY)
    ghostLine.value.x2 = x
    ghostLine.value.y2 = y
  }
}

function processEnd(clientX: number, clientY: number) {
  if (isPanning.value) { isPanning.value = false; return }
  if (draggingNode.value) {
    if (hasDragged.value) pushHistory()
    draggingNode.value = null
    hasDragged.value = false
    return
  }
  if (connectingFrom.value) {
    const target = document.elementFromPoint(clientX, clientY) as Element
    const nodeGroup = target?.closest('.node-group')
    const targetNodeId = nodeGroup?.getAttribute('data-node-id')
    if (targetNodeId && targetNodeId !== connectingFrom.value) {
      const exists = tree.value.edges.some(e => e.from === connectingFrom.value && e.to === targetNodeId)
      if (!exists) {
        pushHistory()
        tree.value.edges.push({ id: crypto.randomUUID(), from: connectingFrom.value, to: targetNodeId })
      }
    }
    connectingFrom.value = null
  }
}

function handleCanvasMouseDown(e: MouseEvent) {
  const target = e.target as Element
  const isBg = target.tagName === 'svg' || (target.tagName === 'rect' && target.id === 'bg-editor')
  if (isBg) {
    if (isCreating.value) {
      const { x, y } = getSVGPoint(e)
      pushHistory()
      tree.value.nodes.push({ id: crypto.randomUUID(), title: 'New Topic', x: snap(x), y: snap(y) })
      isCreating.value = false
    } else {
      isPanning.value = true
      panStart.value = { x: e.clientX, y: e.clientY }
      selectedNodeId.value = null
      showColorPicker.value = false
    }
  }
}

function handleNodeMouseDown(e: MouseEvent, node: SkillNode) {
  e.stopPropagation()
  e.preventDefault()
  draggingNode.value = node.id
  hasDragged.value = false
  const { x, y } = getSVGPoint(e)
  dragStart.value = { x, y }
  nodeStartPos.value = { x: node.x, y: node.y }
  selectedNodeId.value = node.id
  showColorPicker.value = false
}

function handleHandleMouseDown(e: MouseEvent, node: SkillNode) {
  e.stopPropagation()
  e.preventDefault()
  connectingFrom.value = node.id
  const { x, y } = getSVGPoint(e)
  ghostLine.value = { x1: node.x, y1: node.y, x2: x, y2: y }
}

function handleMouseMove(e: MouseEvent) { processMove(e.clientX, e.clientY) }
function handleMouseUp(e: MouseEvent) { processEnd(e.clientX, e.clientY) }

function handleWheel(e: WheelEvent) {
  const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
  const newW = viewBox.value.w * zoomFactor
  const newH = viewBox.value.h * zoomFactor
  const rect = svgRef.value?.getBoundingClientRect()
  if (!rect) return
  const mx = (e.clientX - rect.left) / rect.width
  const my = (e.clientY - rect.top) / rect.height
  viewBox.value.x += (viewBox.value.w - newW) * mx
  viewBox.value.y += (viewBox.value.h - newH) * my
  viewBox.value.w = newW
  viewBox.value.h = newH
}

function getTouchDistance(touches: TouchList) {
  return Math.sqrt((touches[0].clientX - touches[1].clientX) ** 2 + (touches[0].clientY - touches[1].clientY) ** 2)
}

function handleCanvasTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    const target = e.target as Element
    const isBg = target.tagName === 'svg' || (target.tagName === 'rect' && target.id === 'bg-editor')
    if (isBg) {
      if (isCreating.value) {
        const { x, y } = getSVGPointFromClient(e.touches[0].clientX, e.touches[0].clientY)
        pushHistory()
        tree.value.nodes.push({ id: crypto.randomUUID(), title: 'New Topic', x: snap(x), y: snap(y) })
        isCreating.value = false
      } else {
        isPanning.value = true
        panStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        selectedNodeId.value = null
        showColorPicker.value = false
      }
    }
  } else if (e.touches.length === 2) {
    isPanning.value = false
    touchStartDist.value = getTouchDistance(e.touches)
    touchStartViewBox.value = { ...viewBox.value }
  }
}

function handleNodeTouchStart(e: TouchEvent, node: SkillNode) {
  e.stopPropagation()
  draggingNode.value = node.id
  hasDragged.value = false
  const touch = e.touches[0]
  const { x, y } = getSVGPointFromClient(touch.clientX, touch.clientY)
  dragStart.value = { x, y }
  nodeStartPos.value = { x: node.x, y: node.y }
  selectedNodeId.value = node.id
  showColorPicker.value = false
}

function handleCanvasTouchMove(e: TouchEvent) {
  if (e.touches.length === 1) {
    processMove(e.touches[0].clientX, e.touches[0].clientY)
  } else if (e.touches.length === 2) {
    const dist = getTouchDistance(e.touches)
    const scale = touchStartDist.value / dist
    const newW = touchStartViewBox.value.w * scale
    const newH = touchStartViewBox.value.h * scale
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
    const rect = svgRef.value?.getBoundingClientRect()
    if (!rect) return
    const mx = (cx - rect.left) / rect.width
    const my = (cy - rect.top) / rect.height
    viewBox.value.x = touchStartViewBox.value.x + (touchStartViewBox.value.w - newW) * mx
    viewBox.value.y = touchStartViewBox.value.y + (touchStartViewBox.value.h - newH) * my
    viewBox.value.w = newW
    viewBox.value.h = newH
  }
}

function handleCanvasTouchEnd(e: TouchEvent) {
  if (e.touches.length === 0) {
    const touch = e.changedTouches[0]
    processEnd(touch?.clientX ?? 0, touch?.clientY ?? 0)
  }
}

function handleNodeDblClick(e: MouseEvent, node: SkillNode) {
  e.stopPropagation()
  e.preventDefault()
  renameNode(node)
}

function renameNode(node: SkillNode) {
  const newTitle = prompt(t('editorPromptRename'), node.title)
  if (newTitle && newTitle.trim()) {
    pushHistory()
    node.title = newTitle.trim()
  }
}

function openNodeSettings() {
  if (!selectedNodeId.value) return
  const node = tree.value.nodes.find(n => n.id === selectedNodeId.value)
  if (node) {
    descDraft.value = node.description || ''
    cheatsheetDraft.value = node.cheatsheet || ''
    timeDraft.value = node.timeHours || 0
    resourcesDraft.value = node.resources ? JSON.parse(JSON.stringify(node.resources)) : []
    showNodeSettingsModal.value = true
  }
}

function addResource() {
  resourcesDraft.value.push({ title: '', url: '', type: 'article' })
}

function removeResource(index: number) {
  resourcesDraft.value.splice(index, 1)
}

function saveNodeSettings() {
  if (!selectedNodeId.value) return
  const node = tree.value.nodes.find(n => n.id === selectedNodeId.value)
  if (node) {
    pushHistory()
    node.description = descDraft.value.trim() || undefined
    node.cheatsheet = cheatsheetDraft.value.trim() || undefined
    node.timeHours = timeDraft.value > 0 ? timeDraft.value : undefined
    
    const validResources = resourcesDraft.value
      .filter(r => r.title.trim() && r.url.trim())
      .map(r => ({
        title: r.title.trim(),
        url: r.url.trim(),
        type: r.type as Resource['type']
      }))
    node.resources = validResources.length > 0 ? validResources : undefined
  }
  showNodeSettingsModal.value = false
}

function deleteSelected() {
  if (!selectedNodeId.value) return
  pushHistory()
  tree.value.nodes = tree.value.nodes.filter(n => n.id !== selectedNodeId.value)
  tree.value.edges = tree.value.edges.filter(e => e.from !== selectedNodeId.value && e.to !== selectedNodeId.value)
  selectedNodeId.value = null
  showColorPicker.value = false
}

function setNodeColor(color: string) {
  if (!selectedNodeId.value) return
  const node = tree.value.nodes.find(n => n.id === selectedNodeId.value)
  if (node) {
    pushHistory()
    node.color = node.color === color ? undefined : color
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault()
    undo()
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedNodeId.value) {
      e.preventDefault()
      deleteSelected()
    }
  } else if (e.key === 'F2') {
    if (selectedNodeId.value) {
      e.preventDefault()
      const node = tree.value.nodes.find(n => n.id === selectedNodeId.value)
      if (node) renameNode(node)
    }
  } else if (e.key === 'Escape') {
    isCreating.value = false
    selectedNodeId.value = null
    connectingFrom.value = null
    showNodeSettingsModal.value = false
    showColorPicker.value = false
    showMetaModal.value = false
    showToolsSheet.value = false
    showColorPickerSheet.value = false
  }
}

function saveTree() {
  if (!tree.value.title.trim()) {
    alert(t('editorErrorNoTitle'))
    return
  }
  if (isEditing.value) treesStore.updateTree(tree.value)
  else treesStore.addTree(tree.value)
  isDirty.value = false
  router.push({ name: 'library' })
}

const isRenameActive = computed(() => !!selectedNodeId.value)
const isDeleteActive = computed(() => !!selectedNodeId.value)
const isSettingsActive = computed(() => !!selectedNodeId.value)
const isColorActive = computed(() => !!selectedNodeId.value)
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-65px)] bg-gray-100 dark:bg-gray-900">
    <div class="h-12 sm:h-16 px-2 sm:px-4 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 z-10 flex items-center justify-between">
      <button @click="router.push({ name: 'library' })" class="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button @click="showMetaModal = true" class="flex-1 mx-2 text-center truncate text-sm font-semibold text-gray-900 dark:text-gray-100 sm:hidden">
        {{ tree.title || t('editorTitlePlaceholder') }}
      </button>
      <div class="hidden sm:flex flex-1 gap-3 items-center justify-center">
        <input v-model="tree.title" @input="isDirty = true" :placeholder="t('editorTitlePlaceholder')" class="w-64 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" />
        <input v-model="tree.description" @input="isDirty = true" :placeholder="t('editorDescPlaceholder')" class="w-64 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <button @click="saveTree" class="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium whitespace-nowrap">
        {{ t('editorSave') }}
      </button>
    </div>

    <div class="flex-1 overflow-hidden relative touch-none" :class="{ 'cursor-crosshair': isCreating, 'cursor-grab': !isCreating && !draggingNode }">
      <svg
        ref="svgRef"
        class="w-full h-full touch-none"
        :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @wheel.prevent="handleWheel"
        @touchstart.prevent="handleCanvasTouchStart"
        @touchmove.prevent="handleCanvasTouchMove"
        @touchend.prevent="handleCanvasTouchEnd"
        @contextmenu.prevent
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="0.5" class="text-gray-300 dark:text-gray-800" />
          </pattern>
        </defs>
        <rect id="bg-editor" x="-10000" y="-10000" width="20000" height="20000" fill="url(#grid)" />
        <g>
          <path
            v-for="edge in tree.edges"
            :key="edge.id"
            :d="getEdgePath(edge.from, edge.to)"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            class="text-gray-500 dark:text-gray-500"
          />
        </g>
        <path
          v-if="connectingFrom"
          :d="ghostLinePath"
          fill="none"
          stroke="#3b82f6"
          stroke-width="2"
          stroke-dasharray="6,6"
          stroke-linecap="round"
          class="pointer-events-none"
        />
        <g
          v-for="node in tree.nodes"
          :key="node.id"
          :data-node-id="node.id"
          :transform="`translate(${node.x}, ${node.y})`"
          class="node-group"
          :class="draggingNode === node.id ? 'cursor-grabbing' : 'cursor-grab'"
          @mousedown="handleNodeMouseDown($event, node)"
          @dblclick="handleNodeDblClick($event, node)"
          @touchstart="handleNodeTouchStart($event, node)"
        >
          <rect
            x="-70" y="-24" width="140" height="48" rx="12"
            class="transition-all duration-200"
            :class="{
              'stroke-blue-500 dark:stroke-blue-400 stroke-2 shadow-lg': selectedNodeId === node.id,
              'stroke-gray-400 dark:stroke-gray-600 stroke-1.5 shadow-sm': selectedNodeId !== node.id
            }"
            :fill="node.color || (isDark ? '#1f2937' : '#ffffff')"
          />
          <text
            x="0" y="5"
            text-anchor="middle"
            class="text-sm font-semibold pointer-events-none select-none"
            :fill="node.color ? '#ffffff' : (isDark ? '#f3f4f6' : '#111827')"
          >
            {{ node.title.length > 16 ? node.title.substring(0, 16) + '...' : node.title }}
          </text>
          <circle
            cx="70" cy="0" r="6"
            class="fill-blue-500 dark:fill-blue-400 stroke-white dark:stroke-gray-800 stroke-2 cursor-crosshair opacity-0 hover:opacity-100 transition-opacity"
            :class="{ 'opacity-100': selectedNodeId === node.id }"
            @mousedown="handleHandleMouseDown($event, node)"
          />
        </g>
      </svg>

      <!-- Desktop Toolbar -->
      <div class="hidden sm:flex absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-2 gap-2 border border-gray-300 dark:border-gray-700 z-20">
        <button @click="undo" :disabled="history.length === 0" class="px-4 py-2 rounded-lg text-sm font-medium transition bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed">
          {{ t('editorUndo') }}
        </button>
        <button @click="isCreating = !isCreating" class="px-4 py-2 rounded-lg text-sm font-medium transition" :class="isCreating ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'">
          {{ t('editorCreate') }}
        </button>
        <button @click="autoLayout" :disabled="tree.nodes.length === 0" class="px-4 py-2 rounded-lg text-sm font-medium transition bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed">
          {{ t('autoLayout') }}
        </button>
        <button @click="selectedNodeId && renameNode(tree.nodes.find(n => n.id === selectedNodeId)!)" :disabled="!isRenameActive" class="px-4 py-2 rounded-lg text-sm font-medium transition bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed">
          {{ t('editorRename') }}
        </button>
        <button @click="openNodeSettings" :disabled="!isSettingsActive" class="px-4 py-2 rounded-lg text-sm font-medium transition bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed">
          {{ t('nodeSettings') }}
        </button>
        <div class="relative">
          <button @click="showColorPicker = !showColorPicker" :disabled="!isColorActive" class="px-4 py-2 rounded-lg text-sm font-medium transition bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed">
            {{ t('nodeColor') }}
          </button>
          <div v-if="showColorPicker" class="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl p-2 flex gap-1.5 z-30">
            <button
              v-for="color in NODE_COLORS"
              :key="color"
              @click="setNodeColor(color)"
              class="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              :class="selectedNodeId && tree.nodes.find(n => n.id === selectedNodeId)?.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'"
              :style="{ backgroundColor: color }"
            />
            <button @click="setNodeColor('')" class="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 transition-transform hover:scale-110 flex items-center justify-center text-xs text-gray-500" title="Сбросить цвет">✕</button>
          </div>
        </div>
        <button @click="deleteSelected" :disabled="!isDeleteActive" class="px-4 py-2 rounded-lg text-sm font-medium transition bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-300 dark:border-red-800 disabled:opacity-40 disabled:cursor-not-allowed">
          {{ t('editorDelete') }}
        </button>
      </div>

      <!-- Mobile FAB -->
      <button @click="showToolsSheet = true" class="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center z-20 hover:bg-blue-700 transition-transform active:scale-95 border-4 border-white dark:border-gray-900 sm:hidden">
        <svg v-if="!selectedNodeId" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
      </button>
    </div>

    <!-- Mobile Bottom Sheet -->
    <Teleport to="body">
      <div v-if="showToolsSheet || showColorPickerSheet" class="fixed inset-0 z-50 sm:hidden flex items-end justify-center">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showToolsSheet = false; showColorPickerSheet = false"></div>
        <div class="relative w-full bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl p-5 pb-8 border-t border-gray-200 dark:border-gray-700 transform transition-transform">
          <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
          <template v-if="showColorPickerSheet">
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">{{ t('nodeColor') }}</h3>
            <div class="flex flex-wrap justify-center gap-3 mb-2">
              <button v-for="color in NODE_COLORS" :key="color" @click="setNodeColor(color); showColorPickerSheet = false" class="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110" :class="selectedNode?.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'" :style="{ backgroundColor: color }" />
              <button @click="setNodeColor(''); showColorPickerSheet = false" class="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 transition-transform hover:scale-110 flex items-center justify-center text-sm text-gray-500">✕</button>
            </div>
          </template>
          <template v-else>
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
              {{ selectedNodeId ? t('nodeSettings') : t('treeSettings') }}
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <template v-if="!selectedNodeId">
                <button @click="isCreating = !isCreating; showToolsSheet = false" class="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                  <span class="text-sm font-medium">{{ t('editorCreate') }}</span>
                </button>
                <button @click="autoLayout(); showToolsSheet = false" :disabled="tree.nodes.length === 0" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 disabled:opacity-40">
                  <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                  <span class="text-sm font-medium">{{ t('autoLayout') }}</span>
                </button>
                <button @click="undo(); showToolsSheet = false" :disabled="history.length === 0" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 disabled:opacity-40">
                  <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                  <span class="text-sm font-medium">{{ t('editorUndo') }}</span>
                </button>
                <button @click="showMetaModal = true; showToolsSheet = false" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                  <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span class="text-sm font-medium">{{ t('treeSettings') }}</span>
                </button>
              </template>
              <template v-else>
                <button @click="selectedNode && renameNode(selectedNode); showToolsSheet = false" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                  <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  <span class="text-sm font-medium">{{ t('editorRename') }}</span>
                </button>
                <button @click="openNodeSettings(); showToolsSheet = false" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                  <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span class="text-sm font-medium">{{ t('nodeSettings') }}</span>
                </button>
                <button @click="showColorPickerSheet = true" class="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                  <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                  <span class="text-sm font-medium">{{ t('nodeColor') }}</span>
                </button>
                <button @click="deleteSelected(); showToolsSheet = false" class="flex flex-col items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                  <svg class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  <span class="text-sm font-medium">{{ t('editorDelete') }}</span>
                </button>
              </template>
            </div>
          </template>
        </div>
      </div>
    </Teleport>

    <!-- Node Settings Modal -->
    <div v-if="showNodeSettingsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 border border-gray-300 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{{ t('nodeSettings') }}</h2>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('editorDescription') }}</label>
          <textarea v-model="descDraft" rows="2" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('cheatsheet') }}</label>
          <textarea v-model="cheatsheetDraft" rows="3" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"></textarea>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('timeHours') }}</label>
          <input type="number" min="0" step="0.5" v-model.number="timeDraft" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('resources') }}</label>
            <button @click="addResource" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">+ {{ t('addResource') }}</button>
          </div>
          <div class="space-y-2">
            <div v-for="(res, index) in resourcesDraft" :key="index" class="flex gap-2 items-start p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div class="flex-1 space-y-2">
                <input v-model="res.title" :placeholder="t('resTitle')" class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                <input v-model="res.url" :placeholder="t('resUrl')" class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                <select v-model="res.type" class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="article">{{ t('typeArticle') }}</option>
                  <option value="video">{{ t('typeVideo') }}</option>
                  <option value="course">{{ t('typeCourse') }}</option>
                  <option value="docs">{{ t('typeDocs') }}</option>
                  <option value="tool">{{ t('typeTool') }}</option>
                  <option value="book">{{ t('typeBook') }}</option>
                </select>
              </div>
              <button @click="removeResource(index)" class="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">✕</button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showNodeSettingsModal = false" class="px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-gray-300 dark:border-gray-600">{{ t('cancel') }}</button>
          <button @click="saveNodeSettings" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{{ t('save') }}</button>
        </div>
      </div>
    </div>

    <!-- Meta Modal -->
    <div v-if="showMetaModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-300 dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{{ t('treeSettings') }}</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('editorTitlePlaceholder') }}</label>
            <input v-model="tree.title" @input="isDirty = true" :placeholder="t('editorTitlePlaceholder')" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('editorDescPlaceholder') }}</label>
            <textarea v-model="tree.description" @input="isDirty = true" :placeholder="t('editorDescPlaceholder')" rows="3" class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showMetaModal = false" class="px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-gray-300 dark:border-gray-600">{{ t('cancel') }}</button>
          <button @click="showMetaModal = false" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">{{ t('editorSave') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>