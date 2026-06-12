import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/',             name: 'home',        component: () => import('../views/HomeView.vue') },
  { path: '/login',        name: 'login',       component: () => import('../views/LoginView.vue'),    meta: { guestOnly: true } },
  { path: '/register',     name: 'register',    component: () => import('../views/RegisterView.vue'), meta: { guestOnly: true } },
  { path: '/matches',      name: 'matches',     component: () => import('../views/MatchesView.vue') },
  { path: '/schedule',     name: 'schedule',    component: () => import('../views/ScheduleView.vue') },
  { path: '/leaderboard',  name: 'leaderboard', component: () => import('../views/LeaderboardView.vue') },
  { path: '/profile',      name: 'profile',     component: () => import('../views/ProfileView.vue'),  meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (auth.loading) {
    // Wait for auth to initialise
    await new Promise(resolve => {
      const stop = setInterval(() => {
        if (!auth.loading) { clearInterval(stop); resolve() }
      }, 50)
    })
  }
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.guestOnly   &&  auth.isLoggedIn) return { name: 'home' }
})

export default router
