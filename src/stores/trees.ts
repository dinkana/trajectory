import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SkillTree } from '@/types'
import { presetTrees } from '@/data/presetTrees'

export const useTreesStore = defineStore('trees', () => {
  const stored = localStorage.getItem('trees')
  const initialTrees = stored ? JSON.parse(stored) : [...presetTrees]
  
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

  return {
    trees,
    addTree,
    updateTree,
    deleteTree,
    resetProgress,
    toggleNode,
    getTreeById,
    getProgress
  }
})