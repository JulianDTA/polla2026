<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">⚽</div>
      <h1 class="auth-title">Crear cuenta</h1>
      <p class="auth-sub">Únete a la polla mundialista</p>

      <div v-if="success" class="success-msg">
        ✅ ¡Cuenta creada! Revisa tu email para confirmar tu cuenta.
        <br /><RouterLink to="/login">Ir al login</RouterLink>
      </div>

      <template v-else>
        <p v-if="error" class="error-msg">{{ error }}</p>

        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label>Nombre de usuario</label>
            <input v-model="username" type="text" required placeholder="golazo123" minlength="3" maxlength="20" />
          </div>
          <div class="form-group">
            <label>Correo electrónico</label>
            <input v-model="email" type="email" required placeholder="tu@correo.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input v-model="password" type="password" required placeholder="Mínimo 8 caracteres" minlength="8" autocomplete="new-password" />
          </div>
          <button type="submit" class="btn btn-gold w-full" :disabled="loading">
            {{ loading ? 'Creando cuenta…' : '🏆 Unirme' }}
          </button>
        </form>

        <p class="auth-footer">
          ¿Ya tienes cuenta? <RouterLink to="/login">Inicia sesión</RouterLink>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth     = useAuthStore()
const username = ref('')
const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref(null)
const success  = ref(false)

async function handleRegister() {
  loading.value = true
  error.value   = null
  try {
    await auth.register(email.value, password.value, username.value)
    success.value = true
  } catch (e) {
    error.value = e.message || 'Error al crear la cuenta'
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
.success-msg {
  background: #063d25;
  border: 1px solid var(--green);
  border-radius: var(--radius);
  color: var(--green);
  padding: 1rem;
  line-height: 1.8;
}
</style>
