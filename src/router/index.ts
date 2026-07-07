import { createRouter, createWebHistory } from 'vue-router'
import LibraryView from '@/views/LibraryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'library',
      component: LibraryView
    },
    {
      path: '/editor/:id?',
      name: 'editor',
      component: () => import('@/views/EditorView.vue')
    },
    {
      path: '/tracker/:id',
      name: 'tracker',
      component: () => import('@/views/TrackerView.vue')
    },
    {
      path: '/methodology',
      name: 'methodology',
      component: () => import('@/views/MethodologyView.vue')
    }
  ]
})

export default router