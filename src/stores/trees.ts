import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SkillTree } from '@/types'
import { presetTrees } from '@/data/presetTrees'

export const useTreesStore = defineStore('trees', () => {
  const stored = localStorage.getItem('trees')
  const storedTrees: SkillTree[] = stored ? JSON.parse(stored) : []
  const storedIds = new Set(storedTrees.map(t => t.id))
  const initialTrees = [
    ...presetTrees.filter(t => !storedIds.has(t.id)),
    ...storedTrees
  ]

  const trees = ref<SkillTree[]>(initialTrees)
  const completedNodes = ref<Record<string, string[]>>(
    JSON.parse(localStorage.getItem('progress') || '{}')
  )

  function saveTrees() {
    localStorage.setItem('trees', JSON.stringify(trees.value))
  }

  function saveProgress() {
    localStorage.setItem('progress', JSON.stringify(completedNodes.value))
  }

  function addTree(tree: SkillTree) {
    trees.value.push(tree)
    saveTrees()
  }

  function updateTree(tree: SkillTree) {
    const index = trees.value.findIndex(t => t.id === tree.id)
    if (index !== -1) {
      trees.value[index] = tree
      saveTrees()
    }
  }

  function deleteTree(id: string) {
    trees.value = trees.value.filter(t => t.id !== id)
    delete completedNodes.value[id]
    saveTrees()
    saveProgress()
  }

  function resetProgress(treeId: string) {
    completedNodes.value[treeId] = []
    saveProgress()
  }

  function toggleNode(treeId: string, nodeId: string) {
    if (!completedNodes.value[treeId]) {
      completedNodes.value[treeId] = []
    }
    const nodes = completedNodes.value[treeId]
    const index = nodes.indexOf(nodeId)
    if (index === -1) {
      nodes.push(nodeId)
    } else {
      nodes.splice(index, 1)
    }
    saveProgress()
  }

  function getTreeById(id: string) {
    return trees.value.find(t => t.id === id)
  }

  function getProgress(treeId: string) {
    return completedNodes.value[treeId] || []
  }

  function exportProgress(): string {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: completedNodes.value
    }, null, 2)
  }

  function importProgress(json: string): boolean {
    try {
      const data = JSON.parse(json)
      if (!data || typeof data !== 'object') return false
      const progress = data.progress
      if (!progress || typeof progress !== 'object') return false

      for (const treeId in progress) {
        if (!Array.isArray(progress[treeId])) continue
        const validNodes = progress[treeId].filter(
          (id: unknown) => typeof id === 'string' && id.length > 0
        )
        if (validNodes.length > 0) {
          completedNodes.value[treeId] = validNodes
        }
      }
      saveProgress()
      return true
    } catch {
      return false
    }
  }

  return {
    trees,
    addTree,
    updateTree,
    deleteTree,
    resetProgress,
    toggleNode,
    getTreeById,
    getProgress,
    exportProgress,
    importProgress
  }
})