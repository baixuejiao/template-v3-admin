import { App } from 'vue'
import { mapTwoLevelRouter } from '@/store/help'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { constantRoutes } from './routes/constants'

const router = createRouter({
  history: createWebHashHistory('/sop-admin/'),
  routes: mapTwoLevelRouter([...constantRoutes]),
})

export function useAppRouter(app: App) {
  app.use(router)
}

export default router
