<template>
  <div class="matches-view">
    <div class="page-header">
      <h1>⚽ Partidos</h1>
      <p class="page-sub">Haz tus predicciones antes de que empiece cada partido</p>
    </div>

    <!-- Champion picker (only for logged-in users) -->
    <ChampionPicker v-if="auth.isLoggedIn" />

    <!-- Filters -->
    <div class="filters">
      <button
        v-for="f in filters"
        :key="f.value"
        class="filter-btn"
        :class="{ active: activeFilter === f.value }"
        @click="activeFilter = f.value"
      >{{ f.label }}</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="spinner" />

    <!-- Error -->
    <p v-else-if="error" class="error-msg">{{ error }}</p>

    <!-- Group stage: grouped by group -->
    <template v-else-if="activeFilter === 'group'">
      <div v-for="(groupMatches, groupName) in groupedByGroup" :key="groupName" class="group-section">
        <h2 class="group-title">Grupo {{ groupName }}</h2>
        <div class="matches-grid">
          <MatchCard
            v-for="match in groupMatches"
            :key="match.id"
            :match="match"
            :prediction="match.userPrediction"
            @predict="openModal"
          />
        </div>
      </div>
    </template>

    <!-- Other stages: flat list -->
    <template v-else>
      <div v-if="filteredMatches.length === 0" class="empty">
        No hay partidos disponibles aún para esta fase.
      </div>
      <div v-else class="matches-grid">
        <MatchCard
          v-for="match in filteredMatches"
          :key="match.id"
          :match="match"
          :prediction="match.userPrediction"
          @predict="openModal"
        />
      </div>
    </template>

    <!-- Prediction modal -->
    <PredictionModal
      v-if="modalMatch"
      :match="modalMatch"
      :existing="modalMatch.userPrediction"
      @close="modalMatch = null"
      @saved="onPredictionSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMatchesStore } from '../stores/matches'
import { useAuthStore }    from '../stores/auth'
import MatchCard         from '../components/MatchCard.vue'
import PredictionModal   from '../components/PredictionModal.vue'
import ChampionPicker    from '../components/ChampionPicker.vue'

const matchesStore = useMatchesStore()
const auth         = useAuthStore()

const loading      = computed(() => matchesStore.loading)
const error        = computed(() => matchesStore.error)
const activeFilter = ref('group')
const modalMatch   = ref(null)

const filters = [
  { label: 'Fase de grupos',   value: 'group'         },
  { label: 'Ronda de 32',      value: 'round_of_32'   },
  { label: 'Octavos',          value: 'round_of_16'   },
  { label: 'Cuartos',          value: 'quarter_final' },
  { label: 'Semifinales',      value: 'semi_final'    },
  { label: 'Final',            value: 'final'         },
]

// Determine active stage based on matches
function determineActiveStage() {
  if (!matchesStore.matches.length) return
  
  // Find the first stage that has 'live' or 'upcoming' matches
  const STAGES_ORDER = ['group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'final']
  
  let foundStage = null
  for (const stage of STAGES_ORDER) {
    const hasActive = matchesStore.matches.some(m => m.stage === stage && (m.status === 'upcoming' || m.status === 'live'))
    if (hasActive) {
      foundStage = stage
      break
    }
  }
  
  // If all matches are finished, default to final
  activeFilter.value = foundStage || 'final'
}

// Reload matches when auth state changes (so predictions show/hide)
onMounted(async () => {
  await matchesStore.loadMatches()
  determineActiveStage()
})
watch(() => auth.isLoggedIn, () => matchesStore.loadMatches())

const filteredMatches = computed(() =>
  matchesStore.matches.filter(m => m.stage === activeFilter.value)
)

const groupedByGroup = computed(() => {
  const groups = {}
  // Only include group-stage matches that have a known group_name (excludes TBD knockout matches)
  for (const m of matchesStore.matches.filter(m => m.stage === 'group' && m.group_name)) {
    const g = m.group_name
    if (!groups[g]) groups[g] = []
    groups[g].push(m)
  }
  // Sort group names A–L
  return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)))
})

function openModal(match) {
  modalMatch.value = match
}

function onPredictionSaved(prediction) {
  matchesStore.updateMatchPrediction(prediction.match_id, prediction)
  modalMatch.value = {
    ...modalMatch.value,
    userPrediction: prediction,
  }
  modalMatch.value = null
  document.body.style.overflow = ''
}
</script>

<style scoped>
.matches-view { display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { margin-bottom: .5rem; }
.page-header h1 { font-size: 1.6rem; font-weight: 900; }
.page-sub { color: var(--text-muted); font-size: .9rem; }

.filters {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
}
.filter-btn {
  padding: .4rem .9rem;
  border-radius: 99px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  font-size: .82rem;
  font-weight: 600;
  transition: all .15s;
}
.filter-btn:hover { border-color: var(--primary); color: var(--text); }
.filter-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }

.group-section { display: flex; flex-direction: column; gap: .8rem; }
.group-title { font-size: 1rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; }

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: .8rem;
}
.empty { color: var(--text-muted); text-align: center; padding: 3rem 0; }
</style>
