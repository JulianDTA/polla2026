<template>
  <nav class="navbar">
    <div class="nav-inner">
      <RouterLink to="/" class="nav-brand">⚽ <span>Polla 2026</span></RouterLink>

      <div class="nav-links">
        <RouterLink to="/matches">Predicciones</RouterLink>
        <RouterLink to="/schedule">Resultados</RouterLink>
        <RouterLink to="/leaderboard">Tabla</RouterLink>
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/profile" class="nav-user">
            <span class="avatar">{{ initial }}</span>
            {{ auth.profile?.username || 'Perfil' }}
          </RouterLink>
          <button class="btn btn-ghost btn-sm" @click="handleLogout">Salir</button>
        </template>
        <template v-else>
          <RouterLink to="/login"    class="btn btn-ghost btn-sm">Entrar</RouterLink>
          <RouterLink to="/register" class="btn btn-primary btn-sm">Registrarse</RouterLink>
        </template>
      </div>

      <!-- Mobile hamburger -->
      <button class="hamburger" @click="open = !open" :aria-expanded="open">
        <span />
        <span :class="{ rotate: open }" />
        <span :class="{ hide: open }" />
      </button>
    </div>

    <div v-if="open" class="mobile-menu" @click="open = false">
      <RouterLink to="/matches">Predicciones</RouterLink>
      <RouterLink to="/schedule">Resultados en vivo</RouterLink>
      <RouterLink to="/leaderboard">Tabla de posiciones</RouterLink>
      <template v-if="auth.isLoggedIn">
        <RouterLink to="/profile">Mi perfil</RouterLink>
        <button @click="handleLogout">Cerrar sesión</button>
      </template>
      <template v-else>
        <RouterLink to="/login">Entrar</RouterLink>
        <RouterLink to="/register">Registrarse</RouterLink>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()
const open   = ref(false)

const initial = computed(() => {
  const u = auth.profile?.username || auth.user?.email || '?'
  return u[0].toUpperCase()
})

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  background: rgba(10,14,26,.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: .7rem 1rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.nav-brand {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: .4rem;
}
.nav-brand span { color: var(--gold); }
.nav-links {
  display: flex;
  align-items: center;
  gap: .8rem;
  margin-left: auto;
}
.nav-links a {
  color: var(--text-muted);
  font-size: .9rem;
  font-weight: 500;
  text-decoration: none;
  padding: .3rem .1rem;
  transition: color .15s;
}
.nav-links a:hover,
.nav-links a.router-link-active { color: var(--text); }
.nav-user {
  display: flex;
  align-items: center;
  gap: .4rem;
}
.avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: .8rem;
  font-weight: 700;
}
.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; padding: .3rem; margin-left: auto; }
.hamburger span { display: block; width: 22px; height: 2px; background: var(--text); border-radius: 2px; transition: .2s; }
.mobile-menu {
  display: flex;
  flex-direction: column;
  padding: .75rem 1rem;
  border-top: 1px solid var(--border);
  gap: .1rem;
}
.mobile-menu a, .mobile-menu button {
  padding: .65rem .5rem;
  color: var(--text);
  font-size: .95rem;
  border: none;
  background: none;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
@media (max-width: 640px) {
  .nav-links { display: none; }
  .hamburger { display: flex; }
}
</style>
