import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'library',
      component: () => import('@/views/LibraryView.vue')
    },
    {
      path: '/editor/:id?',
      name: 'editor',
      component: () => import('@/views/EditorView.vue')
    },
    {
      path: '/tree/:id',
      name: 'tracker',
      component: () => import('@/views/TrackerView.vue')
    }
  ]
})

export default router