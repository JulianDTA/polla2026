<template>
  <div class="champion-card card">
    <h3 class="title">🏆 ¿Quién será el campeón?</h3>

    <div v-if="existing" class="current-pick">
      <img v-if="existing.predicted_champion_flag" :src="existing.predicted_champion_flag" class="flag-md" :alt="existing.predicted_champion" />
      <div>
        <p class="pick-name">{{ existing.predicted_champion }}</p>
        <p class="pick-sub">Tu selección actual</p>
      </div>
      <span v-if="existing.points_earned > 0" class="badge badge-gold">+{{ existing.points_earned }} pts 🏆</span>
      <button v-if="!locked" class="btn btn-ghost btn-sm" @click="editing = true">Cambiar</button>
    </div>

    <div v-if="!existing || editing">
      <p v-if="locked" class="locked-msg">🔒 Las predicciones de campeón están cerradas</p>
      <template v-else>
        <p class="help">Selecciona el equipo que crees que ganará la Copa del Mundo. Vale <strong>5 puntos</strong>.</p>
        <div class="search-box">
          <input v-model="search" placeholder="Buscar equipo…" />
        </div>
        <div class="teams-grid">
          <button
            v-for="team in filteredTeams"
            :key="team.id"
            class="team-btn"
            :class="{ selected: selected?.id === team.id }"
            @click="selected = team"
          >
            <img v-if="team.flag" :src="team.flag" :alt="team.name" class="flag-sm" />
            <span>{{ team.name }}</span>
          </button>
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <div class="actions">
          <button v-if="editing" class="btn btn-ghost btn-sm" @click="editing = false">Cancelar</button>
          <button class="btn btn-gold" :disabled="!selected || saving" @click="save">
            {{ saving ? 'Guardando…' : '✅ Confirmar campeón' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTeams, getChampionPick, saveChampionPick } from '../services/api'

const teams    = ref([])
const existing = ref(null)
const selected = ref(null)
const search   = ref('')
const saving   = ref(false)
const editing  = ref(false)
const error    = ref(null)

const TOURNAMENT_START = new Date('2026-06-11T19:30:00Z')
const locked = computed(() => new Date() >= TOURNAMENT_START)

const filteredTeams = computed(() => {
  const s = search.value.toLowerCase()
  return s ? teams.value.filter(t => t.name.toLowerCase().includes(s)) : teams.value
})

async function load() {
  try {
    const [teamsRes, pickRes] = await Promise.all([getTeams(), getChampionPick()])
    teams.value    = teamsRes.data
    existing.value = pickRes.data
  } catch (e) {
    console.error('ChampionPicker load error:', e)
  }
}

async function save() {
  if (!selected.value || saving.value) return
  saving.value = true
  error.value  = null
  try {
    const { data } = await saveChampionPick({
      predicted_champion:      selected.value.name,
      predicted_champion_flag: selected.value.flag,
    })
    existing.value = data
    editing.value  = false
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.champion-card { margin-bottom: 2rem; }
.title { font-size: 1.1rem; font-weight: 800; margin-bottom: 1rem; }
.help { font-size: .85rem; color: var(--text-muted); margin-bottom: .8rem; }
.locked-msg { color: var(--text-muted); font-size: .9rem; }

.current-pick {
  display: flex;
  align-items: center;
  gap: .8rem;
  padding: .8rem;
  background: var(--surface2);
  border-radius: var(--radius);
  margin-bottom: .8rem;
}
.pick-name { font-weight: 700; }
.pick-sub  { font-size: .75rem; color: var(--text-muted); }
.flag-md { width: 44px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); }
.flag-sm { width: 28px; height: 20px; object-fit: cover; border-radius: 3px; border: 1px solid var(--border); }

.search-box { margin-bottom: .8rem; }
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: .5rem;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding-right: .3rem;
}
.team-btn {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .5rem .7rem;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-size: .82rem;
  font-weight: 500;
  transition: border-color .15s, background .15s;
}
.team-btn:hover { background: var(--surface); border-color: var(--primary); }
.team-btn.selected { border-color: var(--gold); background: #3d2f0e; color: var(--gold); }
.actions { display: flex; gap: .7rem; justify-content: flex-end; }
</style>
