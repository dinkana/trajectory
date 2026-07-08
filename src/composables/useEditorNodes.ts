import { ref, computed, type Ref } from 'vue'
import type { SkillTree, SkillNode, Resource } from '@/types'

export function useEditorNodes(
  tree: Ref<SkillTree>,
  selectedNodeId: Ref<string | null>,
  pushHistory: () => void
) {
  const showNodeSettingsModal = ref(false)
  const showColorPicker = ref(false)
  
  const titleDraft = ref('')
  const descDraft = ref('')
  const cheatsheetDraft = ref('')
  const timeDraft = ref(0)
  const resourcesDraft = ref<{ title: string, url: string, type: string }[]>([])

  const NODE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280']

  const selectedNode = computed(() => tree.value.nodes.find(n => n.id === selectedNodeId.value))

  function openNodeSettings() {
    if (!selectedNodeId.value) return
    const node = tree.value.nodes.find(n => n.id === selectedNodeId.value)
    if (node) {
      titleDraft.value = node.title
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
      if (titleDraft.value.trim()) node.title = titleDraft.value.trim()
      node.description = descDraft.value.trim() || undefined
      node.cheatsheet = cheatsheetDraft.value.trim() || undefined
      node.timeHours = timeDraft.value > 0 ? timeDraft.value : undefined
      const validResources = resourcesDraft.value.filter(r => r.title.trim() && r.url.trim()).map(r => ({
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

  return {
    showNodeSettingsModal, showColorPicker, titleDraft, descDraft, cheatsheetDraft, timeDraft, resourcesDraft, NODE_COLORS,
    selectedNode, openNodeSettings, addResource, removeResource, saveNodeSettings, deleteSelected, setNodeColor
  }
}