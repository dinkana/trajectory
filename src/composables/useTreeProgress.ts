import { ref, computed, watch, type Ref } from 'vue'
import { useTreesStore } from '@/stores/trees'
import { useSettingsStore } from '@/stores/settings'
import type { SkillTree } from '@/types'

export function useTreeProgress(tree: Ref<SkillTree | null>) {
  const treesStore = useTreesStore()
  const settings = useSettingsStore()

  const completedNodes = ref<string[]>([])
  const showWinModal = ref(false)
  const pulsingEdges = ref<string[]>([])
  
  const hoursPerDay = ref(Number(localStorage.getItem('hoursPerDay')) || 1)

  const remainingHours = computed(() => {
    if (!tree.value) return 0
    return tree.value.nodes
      .filter(n => !completedNodes.value.includes(n.id))
      .reduce((sum, n) => sum + (n.timeHours || 0), 0)
  })

  const totalHours = computed(() => {
    if (!tree.value) return 0
    return tree.value.nodes.reduce((sum, n) => sum + (n.timeHours || 0), 0)
  })

  const completionDate = computed(() => {
    if (remainingHours.value === 0 || hoursPerDay.value <= 0) return null
    const daysNeeded = Math.ceil(remainingHours.value / hoursPerDay.value)
    const date = new Date()
    date.setDate(date.getDate() + daysNeeded)
    return date.toLocaleDateString(settings.locale === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  })

  const progress = computed(() => {
    if (!tree.value || tree.value.nodes.length === 0) return 0
    return Math.round((completedNodes.value.length / tree.value.nodes.length) * 100)
  })

  function initProgress() {
    if (!tree.value) return
    completedNodes.value = treesStore.getProgress(tree.value.id)
  }

  function isUnlocked(nodeId: string): boolean {
    if (!tree.value) return false
    const incoming = tree.value.edges.filter(e => e.to === nodeId)
    if (incoming.length === 0) return true
    return incoming.every(e => completedNodes.value.includes(e.from))
  }

  function isCompleted(nodeId: string): boolean {
    return completedNodes.value.includes(nodeId)
  }

  function toggleNode(nodeId: string) {
    if (!tree.value) return
    if (!isUnlocked(nodeId) && !isCompleted(nodeId)) return
    treesStore.toggleNode(tree.value.id, nodeId)
    completedNodes.value = treesStore.getProgress(tree.value.id)
    if (isCompleted(nodeId)) triggerPulse(nodeId)
  }

  function resetProgress() {
    if (!tree.value) return
    treesStore.resetProgress(tree.value.id)
    completedNodes.value = []
    showWinModal.value = false
  }

  function updateHoursPerDay(val: number) {
    if (val < 0.5) val = 0.5
    hoursPerDay.value = val
    localStorage.setItem('hoursPerDay', String(val))
  }

  function triggerPulse(nodeId: string) {
    if (!tree.value) return
    tree.value.edges.filter(e => e.from === nodeId).forEach(e => {
      pulsingEdges.value.push(e.id)
      setTimeout(() => {
        pulsingEdges.value = pulsingEdges.value.filter(id => id !== e.id)
      }, 1000)
    })
  }

  function generateTextReport(): string {
    if (!tree.value) return ''
    const completed = tree.value.nodes.filter(n => completedNodes.value.includes(n.id))
    if (completed.length === 0) return 'Нет освоенных этапов.'

    let report = `ОТЧЕТ ОБ ОСВОЕНИИ МАРШРУТА АДАПТАЦИИ\n`
    report += `Индивидуальная программа: ${tree.value.title}\n`
    report += `Дата формирования: ${new Date().toLocaleDateString('ru-RU')}\n`
    report += `Прогресс: ${completed.length} из ${tree.value.nodes.length} этапов\n\n`
    report += `Освоенные социальные компетенции:\n`
    completed.forEach((n, i) => {
      report += `${i + 1}. ${n.title}\n`
    })
    report += `\nДокумент сформирован в системе «Траектория» для подтверждения социального эффекта.`
    return report
  }

  watch(() => completedNodes.value.length, (newLen) => {
    if (tree.value && tree.value.nodes.length > 0 && newLen === tree.value.nodes.length) {
      setTimeout(() => { showWinModal.value = true }, 800)
    }
  })

  return {
    completedNodes,
    showWinModal,
    pulsingEdges,
    hoursPerDay,
    remainingHours,
    totalHours,
    completionDate,
    progress,
    initProgress,
    isUnlocked,
    isCompleted,
    toggleNode,
    resetProgress,
    updateHoursPerDay,
    generateTextReport
  }
}