<template>
  <div class="match-card" :class="statusClass">
    <!-- Header: date + group badge -->
    <div class="match-meta">
      <span class="badge" :class="stageBadgeClass">{{ stageLabel }}</span>
      <span class="match-date">{{ formattedDate }}</span>
      <span v-if="match.status === 'live'" class="live-dot">LIVE</span>
    </div>

    <!-- Teams + score -->
    <div class="match-teams">
      <div class="team home" :class="{ winner: homeWins }">
        <img v-if="match.home_team_flag" :src="match.home_team_flag" :alt="match.home_team_name" class="flag" />
        <span class="team-name">{{ match.home_team_name }}</span>
      </div>

      <div class="score-block">
        <template v-if="match.status !== 'upcoming'">
          <span class="score">{{ match.home_score ?? '–' }}</span>
          <span class="score-sep">:</span>
          <span class="score">{{ match.away_score ?? '–' }}</span>
        </template>
        <span v-else class="vs">VS</span>
      </div>

      <div class="team away" :class="{ winner: awayWins }">
        <span class="team-name">{{ match.away_team_name }}</span>
        <img v-if="match.away_team_flag" :src="match.away_team_flag" :alt="match.away_team_name" class="flag" />
      </div>
    </div>

    <!-- Venue -->
    <p v-if="match.city" class="venue">📍 {{ match.city }}</p>

    <!-- User prediction -->
    <template v-if="!readonly">
      <div v-if="prediction" class="prediction-row">
        <span class="pred-label">Tu predicción:</span>
        <span class="pred-score">{{ prediction.predicted_home_score }} – {{ prediction.predicted_away_score }}</span>
        <span v-if="prediction.points_earned !== null" class="badge" :class="pointsBadge(prediction.points_earned)">
          +{{ prediction.points_earned }} pts
        </span>
        <button v-if="canPredict" class="btn btn-ghost btn-sm btn-edit" @click="$emit('predict', match)">✏️ Editar</button>
      </div>
      <div v-else-if="canPredict" class="prediction-row">
        <button class="btn btn-gold btn-sm btn-predict" @click="$emit('predict', match)">⚽ Predecir</button>
      </div>
      <div v-else-if="!canPredict && !prediction && isLoggedIn" class="prediction-row locked">
        🔒 Predicciones cerradas
      </div>
      <div v-else-if="!isLoggedIn" class="prediction-row locked">
        <RouterLink to="/login">Inicia sesión para predecir</RouterLink>
      </div>
    </template>
    
    <template v-else>
      <div v-if="match.status !== 'upcoming'" class="prediction-row">
        <button class="btn btn-ghost btn-sm btn-predict" @click="$emit('viewPredictions', match)">👥 Ver grupo</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  match:      { type: Object, required: true },
  prediction: { type: Object, default: null },
  readonly:   { type: Boolean, default: false },
})
defineEmits(['predict', 'viewPredictions'])

const auth      = useAuthStore()
const isLoggedIn = computed(() => auth.isLoggedIn)

const canPredict = computed(() => {
  if (!auth.isLoggedIn) return false
  const matchDate = new Date(props.match.match_date)
  return props.match.status === 'upcoming' && matchDate > new Date()
})

const homeWins = computed(() =>
  props.match.status === 'finished' && props.match.home_score > props.match.away_score
)
const awayWins = computed(() =>
  props.match.status === 'finished' && props.match.away_score > props.match.home_score
)

const statusClass = computed(() => ({
  'status-live':     props.match.status === 'live',
  'status-finished': props.match.status === 'finished',
}))

const stageLabel = computed(() => {
  if (props.match.stage === 'group') return `Grupo ${props.match.group_name || ''}`
  const map = {
    round_of_32:    'Ronda de 32',
    round_of_16:    'Octavos',
    quarter_final:  'Cuartos',
    semi_final:     'Semifinal',
    third_place:    '3er Puesto',
    final:          'FINAL',
  }
  return map[props.match.stage] || props.match.stage
})

const stageBadgeClass = computed(() => {
  if (props.match.stage === 'final')         return 'badge-gold'
  if (props.match.stage === 'semi_final')    return 'badge-blue'
  if (props.match.stage === 'quarter_final') return 'badge-blue'
  return 'badge-gray'
})

const formattedDate = computed(() => {
  const d = new Date(props.match.match_date)
  return d.toLocaleString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
})

const pointsBadge = (pts) => {
  if (pts === 3) return 'badge-gold'
  if (pts === 1) return 'badge-green'
  return 'badge-gray'
}
</script>

<style scoped>
.match-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.1rem .9rem;
  transition: border-color .2s;
}
.match-card:hover { border-color: var(--primary); }
.status-live     { border-color: var(--green) !important; }
.status-finished { opacity: .88; }

.match-meta {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: .7rem;
  flex-wrap: wrap;
}
.match-date { font-size: .78rem; color: var(--text-muted); margin-left: auto; }
.live-dot {
  background: var(--green);
  color: #fff;
  font-size: .68rem;
  font-weight: 700;
  padding: .1rem .45rem;
  border-radius: 99px;
  animation: pulse 1.4s infinite;
}
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }

.match-teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: .5rem;
  margin-bottom: .6rem;
}
.team { display: flex; align-items: center; gap: .5rem; }
.team.home { justify-content: flex-end; text-align: right; }
.team.away { justify-content: flex-start; }
.team.winner .team-name { color: var(--gold); font-weight: 700; }
.flag { width: 28px; height: 20px; object-fit: cover; border-radius: 3px; border: 1px solid var(--border); }
.team-name { font-size: .9rem; font-weight: 600; }

.score-block { display: flex; align-items: center; gap: .3rem; }
.score { font-size: 1.4rem; font-weight: 800; min-width: 1.5ch; text-align: center; }
.score-sep { color: var(--text-muted); font-weight: 300; }
.vs { color: var(--text-muted); font-size: .85rem; font-weight: 700; padding: 0 .3rem; }

.venue { font-size: .75rem; color: var(--text-muted); margin-bottom: .6rem; }

.prediction-row {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding-top: .6rem;
  border-top: 1px solid var(--border);
  font-size: .85rem;
  flex-wrap: wrap;
}
.pred-label { color: var(--text-muted); }
.pred-score { font-weight: 700; }
.btn-edit { margin-left: auto; }
.btn-predict { width: 100%; }
.locked { color: var(--text-muted); font-size: .8rem; }
</style>
