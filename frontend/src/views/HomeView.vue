<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">🌎 USA · Canada · Mexico</div>
      <h1 class="hero-title">Polla Mundialista<br /><span>FIFA World Cup 2026</span></h1>
      <p class="hero-sub">Haz tus predicciones, acumula puntos y demuestra que sabes de fútbol.</p>
      <div class="hero-actions">
        <RouterLink v-if="!auth.isLoggedIn" to="/register" class="btn btn-gold">
          🏆 Únete gratis
        </RouterLink>
        <RouterLink to="/matches" class="btn btn-primary">
          ⚽ Ver partidos
        </RouterLink>
      </div>
    </section>

    <!-- Points system -->
    <section class="points-section">
      <h2 class="section-title">Sistema de puntos</h2>
      <div class="points-grid">
        <div class="point-card card">
          <div class="point-icon gold">3</div>
          <div>
            <p class="point-label">Marcador exacto</p>
            <p class="point-desc">Predices el resultado exacto del partido</p>
          </div>
        </div>
        <div class="point-card card">
          <div class="point-icon green">1</div>
          <div>
            <p class="point-label">Resultado correcto</p>
            <p class="point-desc">Predices correctamente quién gana o si hay empate</p>
          </div>
        </div>
        <div class="point-card card">
          <div class="point-icon blue">5</div>
          <div>
            <p class="point-label">Campeón correcto</p>
            <p class="point-desc">Predices correctamente al equipo campeón</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tournament info -->
    <section class="tournament-section">
      <h2 class="section-title">FIFA World Cup 2026</h2>
      <div class="info-grid">
        <div class="info-item card">
          <span class="info-icon">🗓️</span>
          <div>
            <p class="info-label">Fechas</p>
            <p class="info-val">11 Jun – 19 Jul 2026</p>
          </div>
        </div>
        <div class="info-item card">
          <span class="info-icon">🏟️</span>
          <div>
            <p class="info-label">Sedes</p>
            <p class="info-val">USA, Canadá, México</p>
          </div>
        </div>
        <div class="info-item card">
          <span class="info-icon">🌍</span>
          <div>
            <p class="info-label">Equipos</p>
            <p class="info-val">48 selecciones</p>
          </div>
        </div>
        <div class="info-item card">
          <span class="info-icon">⚽</span>
          <div>
            <p class="info-label">Partidos</p>
            <p class="info-val">104 en total</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section v-if="!auth.isLoggedIn" class="cta-section card">
      <h3>¿Listo para competir?</h3>
      <p>Regístrate gratis, haz tus predicciones y sube al top del ranking.</p>
      <div class="cta-actions">
        <RouterLink to="/register" class="btn btn-gold">Crear cuenta</RouterLink>
        <RouterLink to="/login"    class="btn btn-ghost">Ya tengo cuenta</RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
</script>

<style scoped>
.home { display: flex; flex-direction: column; gap: 2.5rem; }

.hero {
  text-align: center;
  padding: 3rem 1rem;
  background: radial-gradient(ellipse at 50% 0%, #1e3a5f 0%, transparent 70%);
  border-radius: 16px;
}
.hero-badge {
  display: inline-block;
  background: #1e3a5f;
  color: var(--primary);
  font-size: .8rem;
  font-weight: 700;
  padding: .3rem .9rem;
  border-radius: 99px;
  border: 1px solid var(--primary);
  margin-bottom: 1rem;
  letter-spacing: .05em;
}
.hero-title {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: .9rem;
}
.hero-title span { color: var(--gold); }
.hero-sub { color: var(--text-muted); font-size: 1.05rem; max-width: 500px; margin: 0 auto 1.8rem; }
.hero-actions { display: flex; gap: .8rem; justify-content: center; flex-wrap: wrap; }

.section-title { font-size: 1.15rem; font-weight: 800; margin-bottom: 1rem; }

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.point-card { display: flex; align-items: flex-start; gap: 1rem; }
.point-icon {
  width: 44px; height: 44px; min-width: 44px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; font-weight: 900;
}
.point-icon.gold  { background: #3d2f0e; color: var(--gold); }
.point-icon.green { background: #063d25; color: var(--green); }
.point-icon.blue  { background: #1e3a5f; color: var(--primary); }
.point-label { font-weight: 700; margin-bottom: .2rem; }
.point-desc { font-size: .82rem; color: var(--text-muted); }

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: .8rem;
}
.info-item { display: flex; align-items: center; gap: .8rem; }
.info-icon { font-size: 1.5rem; }
.info-label { font-size: .78rem; color: var(--text-muted); }
.info-val { font-weight: 700; }

.cta-section { text-align: center; padding: 2rem; }
.cta-section h3 { font-size: 1.3rem; font-weight: 800; margin-bottom: .5rem; }
.cta-section p { color: var(--text-muted); margin-bottom: 1.2rem; }
.cta-actions { display: flex; gap: .8rem; justify-content: center; flex-wrap: wrap; }
</style>
