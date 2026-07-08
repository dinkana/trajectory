import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SkillTree } from '@/types'
import { presetTrees } from '@/data/presetTrees'

function generateUniqueName(baseName: string, existingNames: string[]): string {
  if (!existingNames.includes(baseName)) return baseName
  let counter = 1
  while (existingNames.includes(`${baseName}${counter}`)) {
    counter++
  }
  return `${baseName}${counter}`
}

export const useTreesStore = defineStore('trees', () => {
  const stored = localStorage.getItem('trees')
  const storedTrees: SkillTree[] = stored ? JSON.parse(stored) : []
  const storedIds = new Set(storedTrees.map(t => t.id))
  
  const initialTrees = [
    ...presetTrees.filter(t => !storedIds.has(t.id)),
    ...storedTrees
  ]
  
  const trees = ref<SkillTree[]>(initialTrees)
  const completedNodes = ref<Record<string, string[]>>(JSON.parse(localStorage.getItem('progress') || '{}'))

  function safeSave(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert('Хранилище браузера переполнено. Экспортируйте данные и удалите ненужные маршруты.')
      }
    }
  }

  function saveTrees() { safeSave('trees', trees.value) }
  function saveProgress() { safeSave('progress', completedNodes.value) }

  function addTree(tree: SkillTree) {
    const existingNames = trees.value.map(t => t.title)
    tree.title = generateUniqueName(tree.title, existingNames)
    tree.id = crypto.randomUUID()
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

  function exportAllScenarios(): string {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      trees: trees.value,
      progress: completedNodes.value
    }, null, 2)
  }

  function importAllScenarios(json: string): boolean {
    try {
      const data = JSON.parse(json)
      if (!data || !Array.isArray(data.trees)) return false
      data.trees.forEach((tree: SkillTree) => {
        addTree({ ...tree })
      })
      return true
    } catch {
      return false
    }
  }

  function generateFullReport(): string {
    const treesWithProgress = trees.value.filter(t => getProgress(t.id).length > 0)
    if (treesWithProgress.length === 0) return ''

    let report = `АНАЛИТИЧЕСКИЙ ОТЧЕТ\nО РЕАЛИЗАЦИИ ИНДИВИДУАЛЬНЫХ ПРОГРАММ СОЦИАЛЬНОГО СОПРОВОЖДЕНИЯ\n`
    report += `Дата формирования: ${new Date().toLocaleDateString('ru-RU')}\n`
    report += `Количество подопечных, прошедших маршруты адаптации: ${treesWithProgress.length}\n\n`

    treesWithProgress.forEach((tree, idx) => {
      const completed = tree.nodes.filter(n => getProgress(tree.id).includes(n.id))
      const totalNodes = tree.nodes.length
      const percent = Math.round((completed.length / totalNodes) * 100)
      
      report += `---\n`
      report += `Программа ${idx + 1}: ${tree.title}\n`
      report += `Статус: ${percent}% (${completed.length} из ${totalNodes} этапов)\n`
      
      if (completed.length > 0) {
        report += `Освоенные социальные компетенции:\n`
        completed.forEach((n, i) => {
          report += `  ${i + 1}. ${n.title}\n`
        })
      }
      report += `\n`
    })
    
    report += `---\n`
    report += `Документ сформирован автоматически в системе «Траектория».\n`
    report += `Используется для подтверждения социального эффекта и количественных показателей грантовой отчетности.`
    return report
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
    exportAllScenarios,
    importAllScenarios,
    generateFullReport
  }
})