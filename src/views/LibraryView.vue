<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTreesStore } from '@/stores/trees'
import { useSettingsStore } from '@/stores/settings'
import { useRouter, useRoute } from 'vue-router'
import { decodeData, encodeData } from '@/utils/encoding'
import ImportModal from '@/components/ImportModal.vue'
import QRCodeModal from '@/components/QRCodeModal.vue'
import QRScannerModal from '@/components/QRScannerModal.vue'
import LibraryHeader from '@/components/library/LibraryHeader.vue'
import TreeCard from '@/components/library/TreeCard.vue'
import EmptyLibrary from '@/components/library/EmptyLibrary.vue'
import DeleteConfirmModal from '@/components/library/DeleteConfirmModal.vue'
import IosInstallModal from '@/components/library/IosInstallModal.vue'
import { useI18n } from '@/composables/useI18n'
import { useInstallPrompt } from '@/composables/useInstallPrompt'
import type { SkillTree } from '@/types'

const treesStore = useTreesStore()
const settings = useSettingsStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { canInstall, isIOS, install } = useInstallPrompt()

const showImportModal = ref(false)
const showDeleteConfirm = ref<string | null>(null)
const searchQuery = ref('')
const statusToast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const progressFileInput = ref<HTMLInputElement | null>(null)
const showIosInstallModal = ref(false)
const showQRModal = ref(false)
const qrUrl = ref('')
const showScannerModal = ref(false)

const isMentor = computed(() => settings.userRole === 'mentor')

const filteredTrees = computed(() => {
  if (!searchQuery.value.trim()) return treesStore.trees
  const q = searchQuery.value.toLowerCase()
  return treesStore.trees.filter(tree =>
    tree.title.toLowerCase().includes(q) ||
    (tree.description && tree.description.toLowerCase().includes(q))
  )
})

function getProgress(tree: SkillTree) {
  const completed = treesStore.getProgress(tree.id)
  return { done: completed.length, total: tree.nodes.length }
}

function getTreeById(id: string) {
  return treesStore.trees.find(t => t.id === id)
}

function createNew() {
  router.push({ name: 'editor' })
}

function quickStart() {
  const preset = treesStore.trees[0]
  if (!preset) return
  treesStore.addTree({ ...preset })
  router.push({ name: 'tracker', params: { id: treesStore.trees[treesStore.trees.length - 1].id } })
}

function shareTree(id: string) {
  const tree = getTreeById(id)
  if (!tree) return
  const code = encodeData(tree)
  navigator.clipboard.writeText(`${window.location.origin}?data=${code}`)
  statusToast.value = { message: t('copied'), type: 'success' }
  setTimeout(() => { statusToast.value = null }, 2000)
}

function generateQR(id: string) {
  const tree = getTreeById(id)
  if (!tree) return
  qrUrl.value = `${window.location.origin}?data=${encodeData(tree)}`
  showQRModal.value = true
}

function copyTree(id: string) {
  const tree = getTreeById(id)
  if (!tree) return
  treesStore.addTree({ ...tree })
}

function exportTree(id: string) {
  const tree = getTreeById(id)
  if (!tree) return
  const dataStr = JSON.stringify(tree, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${tree.title.replace(/[^a-z0-9а-яё]/gi, '_')}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function exportAllScenarios() {
  const dataStr = treesStore.exportAllScenarios()
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `trajector-all-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function importAllScenarios() {
  progressFileInput.value?.click()
}

function handleProgressFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const success = treesStore.importAllScenarios(e.target?.result as string)
    statusToast.value = { message: success ? t('progressImported') : t('progressImportError'), type: success ? 'success' : 'error' }
    setTimeout(() => { statusToast.value = null }, 2500)
  }
  reader.readAsText(file)
  input.value = ''
}

function handleScannerSuccess(trees: SkillTree[]) {
  trees.forEach(tree => treesStore.addTree(tree))
  showScannerModal.value = false
  statusToast.value = { message: t('progressImported'), type: 'success' }
  setTimeout(() => { statusToast.value = null }, 2500)
}

function generateReport() {
  const report = treesStore.generateFullReport()
  if (!report) {
    statusToast.value = { message: t('noCompletedSteps'), type: 'error' }
    setTimeout(() => { statusToast.value = null }, 2500)
    return
  }
  navigator.clipboard.writeText(report).then(() => {
    statusToast.value = { message: t('reportCopied'), type: 'success' }
    setTimeout(() => { statusToast.value = null }, 3000)
  })
}

function deleteTree() {
  if (showDeleteConfirm.value) {
    treesStore.deleteTree(showDeleteConfirm.value)
    showDeleteConfirm.value = null
  }
}

async function handleInstall() {
  if (isIOS.value) showIosInstallModal.value = true
  else await install()
}

onMounted(() => {
  const data = route.query.data as string
  if (data) {
    const result = decodeData(data)
    if (result) {
      result.trees.forEach(tree => treesStore.addTree(tree))
    }
    router.replace({ query: {} })
  }
})
</script>

<template>
  <div class="p-4 sm:p-8 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
        {{ t('library') }}
      </h1>
      <LibraryHeader
        :can-install="canInstall"
        :is-mentor="isMentor"
        @install="handleInstall"
        @create="createNew"
        @import-by-link="showImportModal = true"
        @import-by-qr="showScannerModal = true"
        @import-all="importAllScenarios"
        @export-all="exportAllScenarios"
        @report="generateReport"
      />
    </div>

    <div class="mb-6">
      <input
        v-model="searchQuery"
        :placeholder="t('searchPlaceholder')"
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>

    <input ref="progressFileInput" type="file" accept=".json" class="hidden" @change="handleProgressFileSelect" />

    <EmptyLibrary
      v-if="filteredTrees.length === 0 && treesStore.trees.length === 0"
      :is-mentor="isMentor"
      @quick-start="quickStart"
      @import="showImportModal = true"
    />

    <p v-else-if="filteredTrees.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">Ничего не найдено</p>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TreeCard
        v-for="tree in filteredTrees"
        :key="tree.id"
        :tree="tree"
        :progress="getProgress(tree)"
        :is-mentor="isMentor"
        @copy="copyTree"
        @share="shareTree"
        @export="exportTree"
        @qr="generateQR"
        @delete="showDeleteConfirm = $event"
      />
    </div>

    <footer class="w-full text-center text-xs text-gray-500 dark:text-gray-400 mt-10 pt-4 pb-6 border-t border-gray-300 dark:border-gray-700">
      Социальный навигатор «Траектория»<br>
      Для сотрудничества:
      <a href="https://t.me/din_kana" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">Telegram</a> ·
      <a href="mailto:1984clients@gmail.com" class="text-blue-600 dark:text-blue-400 hover:underline">Почта</a>
    </footer>

    <ImportModal v-if="showImportModal" @close="showImportModal = false" />
    <QRCodeModal v-if="showQRModal" :url="qrUrl" @close="showQRModal = false" />
    <QRScannerModal v-if="showScannerModal" @close="showScannerModal = false" @success="handleScannerSuccess" />
    <DeleteConfirmModal v-if="showDeleteConfirm" @confirm="deleteTree" @cancel="showDeleteConfirm = null" />
    <IosInstallModal v-if="showIosInstallModal" @close="showIosInstallModal = false" />

    <div v-if="statusToast" class="fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg transition-opacity z-50 text-white" :class="statusToast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'">
      {{ statusToast.message }}
    </div>
  </div>
</template>