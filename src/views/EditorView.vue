<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useTreesStore } from '@/stores/trees'
import { useI18n } from '@/composables/useI18n'
import type { SkillTree, SkillNode } from '@/types'

const route = useRoute()
const router = useRouter()
const treesStore = useTreesStore()
const { t } = useI18n()

const GRID_SIZE = 20
const snap = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE

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

const showDescModal = ref(false)
const descDraft = ref('')

onMounted(() => {
  const id = route.params.id as string
  if (id) {
    const existing = treesStore.getTreeById(id)
    if (existing) {
      tree.value = JSON.parse(JSON.stringify(existing))
      isEditing.value = true
    }
  }
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave((to, from, next) => {
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
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
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
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
})

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
  if (isPanning.value) {
    isPanning.value = false
    return
  }

  if (draggingNode.value) {
    if (hasDragged.value) {
      pushHistory()
    }
    draggingNode.value = null
    hasDragged.value = false
    return
  }

  if (connectingFrom.value) {
    const target = document.elementFromPoint(clientX, clientY) as Element
    const nodeGroup = target?.closest('.node-group')
    const targetNodeId = nodeGroup?.getAttribute('data-node-id')
    
    if (targetNodeId && targetNodeId !== connectingFrom.value) {
      const exists = tree.value.edges.some(
        edge => edge.from === connectingFrom.value && edge.to === targetNodeId
      )
      if (!exists) {
        pushHistory()
        tree.value.edges.push({
          id: crypto.randomUUID(),
          from: connectingFrom.value,
          to: targetNodeId
        })
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
      tree.value.nodes.push({
        id: crypto.randomUUID(),
        title: 'New Topic',
        x: snap(x),
        y: snap(y)
      })
      isCreating.value = false
    } else {
      isPanning.value = true
      panStart.value = { x: e.clientX, y: e.clientY }
      selectedNodeId.value = null
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
}

function handleHandleMouseDown(e: MouseEvent, node: SkillNode) {
  e.stopPropagation()
  e.preventDefault()
  connectingFrom.value = node.id
  const { x, y } = getSVGPoint(e)
  ghostLine.value = { x1: node.x, y1: node.y, x2: x, y2: y }
}

function handleMouseMove(e: MouseEvent) {
  processMove(e.clientX, e.clientY)
}

function handleMouseUp(e: MouseEvent) {
  processEnd(e.clientX, e.clientY)
}

function handleWheel(e: WheelEvent) {
  e.preventDefault()
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
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function handleCanvasTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    const target = e.target as Element
    const isBg = target.tagName === 'svg' || (target.tagName === 'rect' && target.id === 'bg-editor')
    
    if (isBg) {
      if (isCreating.value) {
        const { x, y } = getSVGPointFromClient(e.touches[0].clientX, e.touches[0].clientY)
        pushHistory()
        tree.value.nodes.push({
          id: crypto.randomUUID(),
          title: 'New Topic',
          x: snap(x),
          y: snap(y)
        })
        isCreating.value = false
      } else {
        isPanning.value = true
        panStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        selectedNodeId.value = null
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
  e.preventDefault()
  draggingNode.value = node.id
  hasDragged.value = false
  const touch = e.touches[0]
  const { x, y } = getSVGPointFromClient(touch.clientX, touch.clientY)
  dragStart.value = { x, y }
  nodeStartPos.value = { x: node.x, y: node.y }
  selectedNodeId.value = node.id
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
    if (touch) {
      processEnd(touch.clientX, touch.clientY)
    } else {
      processEnd(0, 0)
    }
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

function openDescModal() {
  if (!selectedNodeId.value) return
  const node = tree.value.nodes.find(n => n.id === selectedNodeId.value)
  if (node) {
    descDraft.value = node.description || ''
    showDescModal.value = true
  }
}

function saveDesc() {
  if (!selectedNodeId.value) return
  const node = tree.value.nodes.find(n => n.id === selectedNodeId.value)
  if (node) {
    pushHistory()
    node.description = descDraft.value.trim() || undefined
  }
  showDescModal.value = false
}

function deleteSelected() {
  if (!selectedNodeId.value) return
  pushHistory()
  tree.value.nodes = tree.value.nodes.filter(n => n.id !== selectedNodeId.value)
  tree.value.edges = tree.value.edges.filter(e => e.from !== selectedNodeId.value && e.to !== selectedNodeId.value)
  selectedNodeId.value = null
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
    showDescModal.value = false
  }
}

function saveTree() {
  if (!tree.value.title.trim()) {
    alert(t('editorErrorNoTitle'))
    return
  }
  if (isEditing.value) {
    treesStore.updateTree(tree.value)
  } else {
    treesStore.addTree(tree.value)
  }
  isDirty.value = false
  router.push({ name: 'library' })
}

const isRenameActive = computed(() => !!selectedNodeId.value)
const isDeleteActive = computed(() => !!selectedNodeId.value)
const isDescActive = computed(() => !!selectedNodeId.value)
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-65px)] bg-gray-100 dark:bg-gray-900">
    <div class="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center z-10">
      <button @click="router.push({ name: 'library' })" class="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
        {{ t('editorBack') }}
      </button>
      <input
        v-model="tree.title"
        @input="isDirty = true"
        :placeholder="t('editorTitlePlaceholder')"
        class="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <input
        v-model="tree.description"
        @input="isDirty = true"
        :placeholder="t('editorDescPlaceholder')"
        class="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <button @click="saveTree" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium">
        {{ t('editorSave') }}
      </button>
    </div>

    <div class="flex-1 overflow-hidden relative touch-none" :class="{ 'cursor-crosshair': isCreating, 'cursor-grab': !isCreating && !draggingNode }">
      <svg
        ref="svgRef"
        class="w-full h-full"
        :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @wheel="handleWheel"
        @touchstart="handleCanvasTouchStart"
        @touchmove.prevent="handleCanvasTouchMove"
        @touchend="handleCanvasTouchEnd"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="0.5" class="text-gray-200 dark:text-gray-800" />
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
            class="text-gray-400 dark:text-gray-500"
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
              'fill-white dark:fill-gray-800 stroke-blue-500 dark:stroke-blue-400 stroke-2 shadow-lg': selectedNodeId === node.id,
              'fill-white dark:fill-gray-800 stroke-gray-300 dark:stroke-gray-600 stroke-1.5 shadow-sm': selectedNodeId !== node.id
            }"
          />
          
          <text
            x="0" y="5"
            text-anchor="middle"
            class="text-sm font-semibold pointer-events-none select-none fill-gray-900 dark:fill-gray-100"
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

      <div class="absolute top-6 left-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-2 flex gap-2 border border-gray-200 dark:border-gray-700 z-20 flex-wrap">
        <button
          @click="undo"
          :disabled="history.length === 0"
          class="px-4 py-2 rounded-lg text-sm font-medium transition bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ t('editorUndo') }}
        </button>
        
        <button
          @click="isCreating = !isCreating"
          class="px-4 py-2 rounded-lg text-sm font-medium transition"
          :class="isCreating ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'"
        >
          {{ t('editorCreate') }}
        </button>
        
        <button
          @click="selectedNodeId && renameNode(tree.nodes.find(n => n.id === selectedNodeId)!)"
          :disabled="!isRenameActive"
          class="px-4 py-2 rounded-lg text-sm font-medium transition bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ t('editorRename') }}
        </button>

        <button
          @click="openDescModal"
          :disabled="!isDescActive"
          class="px-4 py-2 rounded-lg text-sm font-medium transition bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ t('editorDescription') }}
        </button>
        
        <button
          @click="deleteSelected"
          :disabled="!isDeleteActive"
          class="px-4 py-2 rounded-lg text-sm font-medium transition bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ t('editorDelete') }}
        </button>
      </div>
    </div>

    <div v-if="showDescModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{{ t('editorDescModalTitle') }}</h2>
        <textarea
          v-model="descDraft"
          rows="5"
          :placeholder="t('editorDescPlaceholderModal')"
          class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        ></textarea>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showDescModal = false"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {{ t('cancel') }}
          </button>
          <button
            @click="saveDesc"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {{ t('save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>