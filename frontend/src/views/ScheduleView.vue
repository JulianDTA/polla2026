<template>
  <div class="schedule-view">
    <div class="page-header">
      <h1>Calendario y Resultados</h1>
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
            @viewPredictions="openPredictionsModal"
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
          <div class="matches-grid">
            <MatchCard
              v-for="match in day.matches"
              :key="match.id"
              :match="match"
              :prediction="match.userPrediction"
              :readonly="true"
              @viewPredictions="openPredictionsModal"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Predictions Modal -->
    <div v-if="modalOpen" class="modal-overlay" @click.self="closePredictionsModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 v-if="modalMatch">{{ modalMatch.home_team_name }} vs {{ modalMatch.away_team_name }}</h3>
          <button class="btn-close" @click="closePredictionsModal">✕</button>
        </div>
        
        <div class="modal-body">
          <div v-if="modalLoading" class="spinner" />
          <p v-else-if="modalError" class="error-msg">{{ modalError }}</p>
          <div v-else-if="groupPreds.length === 0" class="empty">Nadie de tu grupo predijo este partido.</div>
          
          <div v-else class="group-preds-list">
            <div v-for="(p, i) in groupPreds" :key="i" class="gpred-row">
              <div class="gpred-user">
                <div class="gpred-avatar">{{ p.username[0].toUpperCase() }}</div>
                <span class="gpred-name">{{ p.username }}</span>
              </div>
              <div class="gpred-score">
                {{ p.predicted_home_score }} – {{ p.predicted_away_score }}
              </div>
              <div class="gpred-pts">
                <span v-if="p.points_earned !== null" class="badge" :class="ptsBadge(p.points_earned)">
                  +{{ p.points_earned }}
                </span>
              </div>
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
import { useGroupsStore }  from '../stores/groups'
import { getMatchGroupPredictions } from '../services/api'
import MatchCard         from '../components/MatchCard.vue'

const matchesStore = useMatchesStore()
const auth         = useAuthStore()
const groupsStore  = useGroupsStore()

const loading      = computed(() => matchesStore.loading)
const error        = computed(() => matchesStore.error)
const activeTab    = ref('past') // 'past' or 'upcoming'

// Modal state
const modalOpen    = ref(false)
const modalMatch   = ref(null)
const groupPreds   = ref([])
const modalLoading = ref(false)
const modalError   = ref(null)

onMounted(async () => {
  matchesStore.loadMatches()
  if (auth.isLoggedIn) {
    await groupsStore.fetchGroups()
  }
})

watch(() => auth.isLoggedIn, (val) => {
  matchesStore.loadMatches()
  if (val) groupsStore.fetchGroups()
})

async function openPredictionsModal(match) {
  if (!groupsStore.activeGroupId) {
    alert('Necesitas unirte a un grupo primero para ver las predicciones de otros.')
    return
  }
  
  modalMatch.value = match
  modalOpen.value = true
  modalLoading.value = true
  modalError.value = null
  groupPreds.value = []

  try {
    const { data } = await getMatchGroupPredictions(match.id, groupsStore.activeGroupId)
    groupPreds.value = data
  } catch (err) {
    modalError.value = err.response?.data?.error || err.message
  } finally {
    modalLoading.value = false
  }
}

function closePredictionsModal() {
  modalOpen.value = false
  modalMatch.value = null
}

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

// Agrupar Próximos por Día
const upcomingMatchDays = computed(() => {
  const daysMap = {}

  upcomingMatches.value.forEach(match => {
    // Formatear la fecha a YYYY-MM-DD según la zona horaria local
    const dateObj = new Date(match.match_date)
    const dayStr = dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })
    
    if (!daysMap[dayStr]) {
      daysMap[dayStr] = { date: dateObj, matches: [] }
    }
    daysMap[dayStr].matches.push(match)
  })

  // Convertir el Map a Arrays para v-for
  return Object.values(daysMap)
    .sort((a, b) => a.date - b.date)
})

// Helpers
function formatDateLong(date) {
  return new Intl.DateTimeFormat('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(date).toUpperCase()
}

const ptsBadge = (pts) => {
  if (pts === 3) return 'badge-gold'
  if (pts === 1) return 'badge-green'
  return 'badge-gray'
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-content {
  background: var(--surface);
  border-radius: var(--radius);
  width: 100%;
  max-width: 400px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 { margin: 0; font-size: 1.1rem; }
.btn-close {
  background: none; border: none; color: var(--text-muted); font-size: 1.2rem; cursor: pointer;
}
.btn-close:hover { color: var(--text); }
.modal-body {
  padding: 1rem;
  overflow-y: auto;
}
.group-preds-list { display: flex; flex-direction: column; gap: .6rem; }
.gpred-row {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface2); padding: .6rem .8rem; border-radius: var(--radius);
}
.gpred-user { display: flex; align-items: center; gap: .6rem; flex: 1; }
.gpred-avatar {
  width: 28px; height: 28px; border-radius: 50%; background: var(--primary);
  display: flex; justify-content: center; align-items: center; font-size: .8rem; font-weight: 700; color: #fff;
}
.gpred-name { font-size: .9rem; font-weight: 600; }
.gpred-score { font-weight: 800; font-size: 1rem; padding: 0 1rem; }
.gpred-pts { min-width: 50px; text-align: right; }
</style>
