<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">⚽</div>
      <h1 class="auth-title">Iniciar sesión</h1>
      <p class="auth-sub">Bienvenido de vuelta</p>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Correo electrónico</label>
          <input v-model="email" type="email" required placeholder="tu@correo.com" autocomplete="email" />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="password" type="password" required placeholder="••••••••" autocomplete="current-password" />
        </div>
        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>

      <p class="auth-footer">
        ¿No tienes cuenta? <RouterLink to="/register">Regístrate aquí</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth     = useAuthStore()
const router   = useRouter()
const route    = useRoute()
const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref(null)

async function handleLogin() {
  loading.value = true
  error.value   = null
  try {
    await auth.login(email.value, password.value)
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    error.value = e.message || 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 3rem;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  text-align: center;
}
.auth-logo { font-size: 2.5rem; margin-bottom: .5rem; }
.auth-title { font-size: 1.5rem; font-weight: 800; margin-bottom: .3rem; }
.auth-sub { color: var(--text-muted); margin-bottom: 1.5rem; font-size: .9rem; }
.w-full { width: 100%; justify-content: center; margin-top: .5rem; }
.auth-footer { margin-top: 1.2rem; font-size: .88rem; color: var(--text-muted); }
</style>
