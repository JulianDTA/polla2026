<template>
  <div class="schedule-view">
    <div class="page-header">
      <h1>🗓️ Calendario y Resultados</h1>
      <p class="page-sub">Consulta los horarios por sede y sigue los resultados en vivo</p>
    </div>

    <!-- Loading & Error -->
    <div v-if="loading" class="spinner" />
    <p v-else-if="error" class="error-msg">{{ error }}</p>

    <div v-else>
      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'past' }"
          @click="activeTab = 'past'"
        >
          En Vivo y Jugados
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'upcoming' }"
          @click="activeTab = 'upcoming'"
        >
          Próximos Partidos
        </button>
      </div>

      <!-- Tab: Past / Live -->
      <div v-if="activeTab === 'past'" class="tab-content">
        <div v-if="pastMatches.length === 0" class="empty">
          No hay partidos en vivo o finalizados aún.
        </div>
        <div v-else class="matches-list">
          <MatchCard
            v-for="match in pastMatches"
            :key="match.id"
            :match="match"
            :prediction="match.userPrediction"
            :readonly="true"
          />
        </div>
      </div>

      <!-- Tab: Upcoming -->
      <div v-else-if="activeTab === 'upcoming'" class="tab-content">
        <div v-if="upcomingMatchDays.length === 0" class="empty">
          No hay próximos partidos programados.
        </div>
        
        <div v-for="day in upcomingMatchDays" :key="day.date" class="day-group">
          <h2 class="day-title">{{ formatDateLong(day.date) }}</h2>
          
          <div v-for="venue in day.venues" :key="venue.name" class="venue-group">
            <h3 class="venue-title">🏟️ {{ venue.name || 'Sede por definir' }}</h3>
            <div class="matches-grid">
              <MatchCard
                v-for="match in venue.matches"
                :key="match.id"
                :match="match"
                :prediction="match.userPrediction"
                :readonly="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMatchesStore } from '../stores/matches'
import { useAuthStore }    from '../stores/auth'
import MatchCard         from '../components/MatchCard.vue'

const matchesStore = useMatchesStore()
const auth         = useAuthStore()

const loading      = computed(() => matchesStore.loading)
const error        = computed(() => matchesStore.error)
const activeTab    = ref('past') // 'past' or 'upcoming'

onMounted(() => matchesStore.loadMatches())
watch(() => auth.isLoggedIn, () => matchesStore.loadMatches())

// En Vivo y Finalizados (Ordenados del más reciente al más antiguo)
const pastMatches = computed(() => {
  return matchesStore.matches
    .filter(m => m.status === 'live' || m.status === 'finished')
    .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
})

// Próximos Partidos (Ordenados cronológicamente)
const upcomingMatches = computed(() => {
  return matchesStore.matches
    .filter(m => m.status === 'upcoming')
    .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
})

// Agrupar Próximos por Día y Sede
const upcomingMatchDays = computed(() => {
  const daysMap = {}

  upcomingMatches.value.forEach(match => {
    // Formatear la fecha a YYYY-MM-DD según la zona horaria local
    const dateObj = new Date(match.match_date)
    const dayStr = dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
    
    if (!daysMap[dayStr]) {
      daysMap[dayStr] = { date: dateObj, venuesMap: {} }
    }

    const venue = match.venue || 'Sede por definir'
    if (!daysMap[dayStr].venuesMap[venue]) {
      daysMap[dayStr].venuesMap[venue] = []
    }

    daysMap[dayStr].venuesMap[venue].push(match)
  })

  // Convertir el Map a Arrays para v-for
  return Object.values(daysMap)
    .sort((a, b) => a.date - b.date)
    .map(dayObj => ({
      date: dayObj.date,
      venues: Object.entries(dayObj.venuesMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([venueName, matches]) => ({
          name: venueName,
          matches
        }))
    }))
})

// Helpers
function formatDateLong(date) {
  return new Intl.DateTimeFormat('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(date).toUpperCase()
}
</script>

<style scoped>
.schedule-view { display: flex; flex-direction: column; gap: 1.5rem; }
.page-header h1 { font-size: 1.6rem; font-weight: 900; }
.page-sub { color: var(--text-muted); font-size: .9rem; }

.tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid var(--border);
  margin-bottom: 1.5rem;
}
.tab-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 700;
  padding: .8rem 0;
  cursor: pointer;
  position: relative;
  transition: color .2s;
}
.tab-btn:hover { color: var(--text); }
.tab-btn.active { color: var(--primary); }
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0; right: 0;
  height: 2px;
  background: var(--primary);
  border-radius: 2px 2px 0 0;
}

.tab-content { display: flex; flex-direction: column; gap: 2rem; }
.empty { color: var(--text-muted); text-align: center; padding: 3rem 0; }

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Day Groupings */
.day-group { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 1rem; }
.day-title {
  font-size: 1.2rem;
  font-weight: 900;
  color: #fff;
  border-bottom: 1px solid var(--surface2);
  padding-bottom: .5rem;
}

.venue-group { display: flex; flex-direction: column; gap: .8rem; padding-left: .5rem; }
.venue-title {
  font-size: .95rem;
  font-weight: 700;
  color: var(--gold);
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: .8rem;
}
</style>
