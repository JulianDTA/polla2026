<template>
  <div id="app-wrapper">
    <Navbar />
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <footer class="footer">
      <p>⚽ Polla Mundialista 2026 &nbsp;·&nbsp; USA · Canada · Mexico</p>
    </footer>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
</script>

<style>
#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}
.footer {
  text-align: center;
  padding: 1rem;
  color: var(--text-muted);
  font-size: .8rem;
  border-top: 1px solid var(--border);
}
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
