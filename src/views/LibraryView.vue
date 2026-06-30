<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTreesStore } from '@/stores/trees'
import { useRouter, useRoute } from 'vue-router'
import { decodeTree, encodeTree } from '@/utils/encoding'
import ImportModal from '@/components/ImportModal.vue'
import { useI18n } from '@/composables/useI18n'
import type { SkillTree } from '@/types'

const treesStore = useTreesStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const showImportModal = ref(false)
const showShareToast = ref(false)
const showDeleteConfirm = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')

const filteredTrees = computed(() => {
  if (!searchQuery.value.trim()) return treesStore.trees
  const q = searchQuery.value.toLowerCase()
  return treesStore.trees.filter(tree => 
    tree.title.toLowerCase().includes(q) || 
    (tree.description && tree.description.toLowerCase().includes(q))
  )
})

function createNew() {
  router.push({ name: 'editor' })
}

function shareTree(tree: SkillTree) {
  const code = encodeTree(tree)
  const url = `${window.location.origin}?data=${code}`
  navigator.clipboard.writeText(url)
  showShareToast.value = true
  setTimeout(() => { showShareToast.value = false }, 2000)
}

function copyTree(tree: SkillTree) {
  const newTree: SkillTree = JSON.parse(JSON.stringify(tree))
  newTree.id = crypto.randomUUID()
  newTree.title += t('copySuffix')
  treesStore.addTree(newTree)
}

function exportTree(tree: SkillTree) {
  const dataStr = JSON.stringify(tree, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${tree.title.replace(/[^a-z0-9а-яё]/gi, '_')}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function importFromFile() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const tree = JSON.parse(e.target?.result as string) as SkillTree
      if (!tree.id || !tree.nodes || !tree.edges) {
        alert('Неверный формат файла')
        return
      }
      if (treesStore.getTreeById(tree.id)) {
        tree.id = crypto.randomUUID()
      }
      treesStore.addTree(tree)
    } catch (err) {
      alert('Ошибка чтения файла')
    }
  }
  reader.readAsText(file)
  input.value = ''
}

function confirmDelete(treeId: string) {
  showDeleteConfirm.value = treeId
}

function deleteTree(treeId: string) {
  treesStore.deleteTree(treeId)
  showDeleteConfirm.value = null
}

function cancelDelete() {
  showDeleteConfirm.value = null
}

onMounted(() => {
  const data = route.query.data as string
  if (data) {
    const tree = decodeTree(data)
    if (tree && !treesStore.getTreeById(tree.id)) {
      treesStore.addTree(tree)
    }
    router.replace({ query: {} })
  }
})
</script>

<template>
  <div class="p-4 sm:p-8 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{{ t('library') }}</h1>
      <div class="flex gap-2">
        <button
          @click="importFromFile"
          class="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
        >
          {{ t('importFile') }}
        </button>
        <button
          @click="showImportModal = true"
          class="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
        >
          {{ t('import') }}
        </button>
        <button
          @click="createNew"
          class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          {{ t('createNew') }}
        </button>
      </div>
    </div>

    <div class="mb-6">
      <input
        v-model="searchQuery"
        :placeholder="t('searchPlaceholder')"
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleFileSelect"
    />

    <div v-if="filteredTrees.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-12">
      {{ treesStore.trees.length === 0 ? t('noTrees') : 'Ничего не найдено' }}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="tree in filteredTrees"
        :key="tree.id"
        class="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col"
      >
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ tree.title }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">{{ tree.description || t('noDescription') }}</p>
        
        <div class="flex items-center gap-2 flex-wrap mt-2">
          <router-link
            :to="{ name: 'tracker', params: { id: tree.id } }"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
          >
            {{ t('study') }}
          </router-link>
          <router-link
            :to="{ name: 'editor', params: { id: tree.id } }"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium"
          >
            {{ t('edit') }}
          </router-link>

          <div class="flex items-center gap-1 ml-auto">
            <button
              @click="copyTree(tree)"
              :title="t('copyTree')"
              class="p-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              @click="shareTree(tree)"
              :title="t('share')"
              class="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button
              @click="exportTree(tree)"
              :title="t('export')"
              class="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              @click="confirmDelete(tree.id)"
              :title="t('delete')"
              class="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ImportModal v-if="showImportModal" @close="showImportModal = false" />

    <div
      v-if="showShareToast"
      class="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity z-50"
    >
      {{ t('copied') }}
    </div>

    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{{ t('deleteTitle') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ t('deleteMessage') }}
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="cancelDelete"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {{ t('cancel') }}
          </button>
          <button
            @click="deleteTree(showDeleteConfirm)"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            {{ t('delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>