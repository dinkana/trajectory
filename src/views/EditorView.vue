<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useTreesStore } from '@/stores/trees'
import { useI18n } from '@/composables/useI18n'
import type { SkillTree } from '@/types'

import EditorCanvas from '@/components/Editor/EditorCanvas.vue'
import EditorToolbar from '@/components/Editor/EditorToolbar.vue'
import EditorMobileTools from '@/components/Editor/EditorMobileTools.vue'
import NodeSettingsModal from '@/components/Editor/NodeSettingsModal.vue'
import TreeSettingsModal from '@/components/Editor/TreeSettingsModal.vue'

import { useEditorCanvas } from '@/composables/useEditorCanvas'
import { useEditorNodes } from '@/composables/useEditorNodes'

const route = useRoute()
const router = useRouter()
const treesStore = useTreesStore()
const { t } = useI18n()

const tree = ref<SkillTree>({
  id: crypto.randomUUID(), title: '', description: '', nodes: [], edges: []
})
const history = ref<SkillTree[]>([])
const isDirty = ref(false)
const isEditing = ref(false)
const showMetaModal = ref(false)

const isDark = ref(document.documentElement.classList.contains('dark'))
const observer = new MutationObserver(() => { isDark.value = document.documentElement.classList.contains('dark') })

const canvasRef = ref<InstanceType<typeof EditorCanvas> | null>(null)
const svgRef = computed(() => canvasRef.value?.svgRef || null)

function pushHistory() {
  history.value.push(JSON.parse(JSON.stringify(tree.value)))
  if (history.value.length > 50) history.value.shift()
  isDirty.value = true
}

function undo() {
  if (history.value.length === 0) return
  tree.value = history.value.pop()!
  canvas.selectedNodeId = null
}

const canvasComposable = useEditorCanvas(tree, svgRef as any, pushHistory)
const nodesComposable = useEditorNodes(tree, canvasComposable.selectedNodeId, pushHistory)

const canvas = reactive(canvasComposable)
const nodes = reactive(nodesComposable)

function handleKeydown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
  else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (canvas.selectedNodeId) { e.preventDefault(); nodes.deleteSelected() }
  }
  else if (e.key === 'F2') {
    if (canvas.selectedNodeId) {
      e.preventDefault()
      nodes.openNodeSettings()
    }
  }
  else if (e.key === 'Escape') {
    canvas.isCreating = false
    canvas.selectedNodeId = null
    canvas.connectingFrom = null
    nodes.showNodeSettingsModal = false
    nodes.showColorPicker = false
    showMetaModal.value = false
  }
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (isDirty.value) { e.preventDefault(); e.returnValue = '' }
}

function saveTree() {
  if (!tree.value.title.trim()) { alert(t('editorErrorNoTitle')); return }
  if (isEditing.value) treesStore.updateTree(tree.value)
  else treesStore.addTree(tree.value)
  isDirty.value = false
  router.push({ name: 'library' })
}

function updateResource(index: number, field: string, val: string) {
  ;(nodes.resourcesDraft[index] as any)[field] = val
}

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
        canvas.viewBox = { x: Math.min(...xs) - 200, y: Math.min(...ys) - 100, w: Math.max(...xs) - Math.min(...xs) + 400, h: Math.max(...ys) - Math.min(...ys) + 200 }
      }
    } else {
      router.push({ name: 'library' }); return
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
  if (isDirty.value && !confirm(t('editorUnsavedWarning'))) next(false)
  else next()
})
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-65px)] bg-gray-100 dark:bg-gray-900">
    <div class="h-12 sm:h-16 px-2 sm:px-4 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 z-10 flex items-center justify-between">
      <button @click="router.push({ name: 'library' })" class="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      
      <button @click="showMetaModal = true" class="flex-1 mx-2 text-center truncate text-sm font-semibold text-gray-900 dark:text-gray-100 sm:hidden">
        {{ tree.title || t('editorTitlePlaceholder') }}
      </button>

      <div class="hidden sm:flex flex-1 gap-3 items-center justify-center">
        <input v-model="tree.title" @input="isDirty = true" :placeholder="t('editorTitlePlaceholder')" class="w-64 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"/>
        <input v-model="tree.description" @input="isDirty = true" :placeholder="t('editorDescPlaceholder')" class="w-64 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"/>
      </div>

      <button @click="saveTree" class="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium whitespace-nowrap">{{ t('editorSave') }}</button>
    </div>

    <EditorCanvas 
      ref="canvasRef"
      :tree="tree"
      :viewBox="canvas.viewBox"
      :ghost-line-path="canvas.ghostLinePath"
      :is-creating="canvas.isCreating"
      :dragging-node="canvas.draggingNode"
      :selected-node-id="canvas.selectedNodeId"
      :is-dark="isDark"
      :get-edge-path="canvas.getEdgePath"
      @canvas-mousedown="canvas.handleCanvasMouseDown"
      @node-mousedown="canvas.handleNodeMouseDown"
      @handle-mousedown="canvas.handleHandleMouseDown"
      @mousemove="canvas.handleMouseMove"
      @mouseup="canvas.handleMouseUp"
      @wheel="canvas.handleWheel"
      @touchstart="canvas.handleCanvasTouchStart"
      @node-touchstart="canvas.handleNodeTouchStart"
      @touchmove="canvas.handleCanvasTouchMove"
      @touchend="canvas.handleCanvasTouchEnd"
      @node-dblclick="nodes.openNodeSettings"
    />

    <EditorToolbar 
      :history-length="history.length"
      :is-creating="canvas.isCreating"
      :selected-node-id="canvas.selectedNodeId"
      :show-color-picker="nodes.showColorPicker"
      :NODE_COLORS="nodes.NODE_COLORS"
      :selected-node-color="nodes.selectedNode?.color"
      @undo="undo"
      @toggle-creating="canvas.isCreating = !canvas.isCreating"
      @auto-layout="canvas.autoLayout"
      @open-settings="nodes.openNodeSettings"
      @toggle-color-picker="nodes.showColorPicker = !nodes.showColorPicker"
      @set-color="nodes.setNodeColor"
      @delete="nodes.deleteSelected"
    />

    <EditorMobileTools 
      :selected-node-id="canvas.selectedNodeId"
      :NODE_COLORS="nodes.NODE_COLORS"
      :selected-node-color="nodes.selectedNode?.color"
      :history-length="history.length"
      @toggle-creating="canvas.isCreating = !canvas.isCreating"
      @auto-layout="canvas.autoLayout"
      @undo="undo"
      @open-tree-settings="showMetaModal = true"
      @open-node-settings="nodes.openNodeSettings"
      @set-color="nodes.setNodeColor"
      @delete="nodes.deleteSelected"
    />

    <NodeSettingsModal 
      :show="nodes.showNodeSettingsModal"
      :title-draft="nodes.titleDraft"
      :desc-draft="nodes.descDraft"
      :cheatsheet-draft="nodes.cheatsheetDraft"
      :time-draft="nodes.timeDraft"
      :resources-draft="nodes.resourcesDraft"
      @update:show="nodes.showNodeSettingsModal = $event"
      @update:title-draft="nodes.titleDraft = $event"
      @update:desc-draft="nodes.descDraft = $event"
      @update:cheatsheet-draft="nodes.cheatsheetDraft = $event"
      @update:time-draft="nodes.timeDraft = $event"
      @add-resource="nodes.addResource"
      @remove-resource="nodes.removeResource"
      @update-resource="updateResource"
      @save="nodes.saveNodeSettings"
    />

    <TreeSettingsModal 
      :show="showMetaModal"
      :title="tree.title"
      :description="tree.description"
      @update:show="showMetaModal = $event"
      @update:title="tree.title = $event; isDirty = true"
      @update:description="tree.description = $event; isDirty = true"
      @save="showMetaModal = false"
    />
  </div>
</template>