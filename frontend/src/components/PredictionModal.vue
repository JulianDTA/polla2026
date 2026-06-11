<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal" role="dialog" aria-modal="true">
        <button class="modal-close" @click="$emit('close')">✕</button>

        <h2 class="modal-title">⚽ Tu predicción</h2>

        <div class="match-preview">
          <div class="team-preview">
            <img v-if="match.home_team_flag" :src="match.home_team_flag" class="flag-lg" :alt="match.home_team_name" />
            <span>{{ match.home_team_name }}</span>
          </div>
          <span class="vs-sep">VS</span>
          <div class="team-preview right">
            <span>{{ match.away_team_name }}</span>
            <img v-if="match.away_team_flag" :src="match.away_team_flag" class="flag-lg" :alt="match.away_team_name" />
          </div>
        </div>

        <p class="match-info">
          {{ formattedDate }} · {{ match.city }}
        </p>

        <!-- Score inputs -->
        <div class="score-inputs">
          <div class="score-field">
            <label>{{ match.home_team_name }}</label>
            <input
              v-model.number="homeScore"
              type="number" min="0" max="20"
              placeholder="0"
              class="score-input"
              @keyup.enter="submit"
            />
          </div>
          <span class="sep">–</span>
          <div class="score-field">
            <label>{{ match.away_team_name }}</label>
            <input
              v-model.number="awayScore"
              type="number" min="0" max="20"
              placeholder="0"
              class="score-input"
              @keyup.enter="submit"
            />
          </div>
        </div>

        <!-- Points guide -->
        <div class="points-guide">
          <span class="badge badge-gold">+3 pts</span> marcador exacto &nbsp;
          <span class="badge badge-green">+1 pt</span> resultado correcto
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="modal-actions">
          <button class="btn btn-gold btn-block" :disabled="saving || !isValid" @click="submit">
            {{ saving ? 'Guardando…' : (existing ? 'Actualizar predicción' : 'Guardar predicción') }}
          </button>
          <button class="btn btn-ghost btn-block" @click="$emit('close')">Cancelar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { savePrediction } from '../services/api'

const props = defineProps({
  match:    { type: Object, required: true },
  existing: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const homeScore = ref(props.existing?.predicted_home_score ?? '')
const awayScore = ref(props.existing?.predicted_away_score ?? '')
const saving    = ref(false)
const error     = ref(null)

const isValid = computed(() =>
  homeScore.value !== '' && awayScore.value !== '' &&
  homeScore.value >= 0   && awayScore.value >= 0
)

const formattedDate = computed(() => {
  const d = new Date(props.match.match_date)
  return d.toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
})

async function submit() {
  if (!isValid.value || saving.value) return
  saving.value = true
  error.value  = null
  try {
    const { data } = await savePrediction({
      match_id:              props.match.id,
      predicted_home_score:  homeScore.value,
      predicted_away_score:  awayScore.value,
    })
    emit('saved', data)
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar. Intenta de nuevo.'
  } finally {
    saving.value = false
  }
}

// Prevent body scroll while modal is open; always restore on close
onMounted(()   => { document.body.style.overflow = 'hidden' })
onUnmounted(() => { document.body.style.overflow = '' })
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
  backdrop-filter: blur(4px);
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.8rem;
  width: 100%;
  max-width: 440px;
  position: relative;
}
.modal-close {
  position: absolute; top: 1rem; right: 1rem;
  background: none; border: none;
  color: var(--text-muted); font-size: 1.1rem;
}
.modal-close:hover { color: var(--text); }
.modal-title { font-size: 1.2rem; font-weight: 800; margin-bottom: 1.2rem; }

.match-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .5rem;
}
.team-preview {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .4rem;
  font-weight: 700;
  font-size: .95rem;
  max-width: 35%;
}
.team-preview.right { align-items: flex-end; }
.flag-lg { width: 44px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); }
.vs-sep { color: var(--text-muted); font-weight: 700; }
.match-info { font-size: .78rem; color: var(--text-muted); margin-bottom: 1.3rem; text-align: center; }

.score-inputs {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
}
.score-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: .3rem;
}
.score-input {
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  padding: .5rem;
  width: 100%;
}
.sep {
  font-size: 2rem;
  font-weight: 300;
  color: var(--text-muted);
  padding-bottom: .55rem;
}

.points-guide {
  font-size: .8rem;
  color: var(--text-muted);
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: .4rem;
  flex-wrap: wrap;
}
.modal-actions {
  display: flex;
  flex-direction: column;
  gap: .7rem;
  margin-top: 1rem;
}
.modal-actions .btn {
  width: 100%;
}
</style>
