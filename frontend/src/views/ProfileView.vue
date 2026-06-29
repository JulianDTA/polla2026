<template>
  <div class="profile-view">
    <div class="page-header">
      <h1>👤 Mi Perfil</h1>
    </div>

    <div class="profile-grid">
      <!-- Profile card -->
      <div class="card profile-card">
        <div class="avatar-lg">{{ initial }}</div>
        <div v-if="!editing">
          <h2 class="username">{{ auth.profile?.username }}</h2>
          <p class="email">{{ auth.user?.email }}</p>
          <p class="full-name">{{ auth.profile?.full_name || 'Sin nombre' }}</p>
          <button class="btn btn-ghost btn-sm mt" @click="editing = true">✏️ Editar perfil</button>
        </div>
        <div v-else class="edit-form">
          <div class="form-group">
            <label>Nombre completo</label>
            <input v-model="editName" type="text" placeholder="Tu nombre" />
          </div>
          <div class="form-group">
            <label>Username</label>
            <input v-model="editUsername" type="text" minlength="3" maxlength="20" />
          </div>
          <p v-if="editError" class="error-msg">{{ editError }}</p>
          <div class="edit-actions">
            <button class="btn btn-ghost btn-sm" @click="cancelEdit">Cancelar</button>
            <button class="btn btn-primary btn-sm" :disabled="editSaving" @click="saveEdit">
              {{ editSaving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats card -->
      <div class="card stats-card">
        <h3 class="stats-title">Mis estadísticas</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-val gold">{{ auth.profile?.total_points || 0 }}</span>
            <span class="stat-label">Puntos totales</span>
          </div>
          <div class="stat-item">
            <span class="stat-val">{{ stats.total }}</span>
            <span class="stat-label">Predicciones</span>
          </div>
          <div class="stat-item">
            <span class="stat-val green">{{ stats.exact }}</span>
            <span class="stat-label">Marcadores exactos</span>
          </div>
          <div class="stat-item">
            <span class="stat-val blue">{{ stats.correct }}</span>
            <span class="stat-label">Resultados correctos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Groups Section -->
    <div class="card groups-card">
      <div class="groups-header">
        <h3 class="section-title">Mis Grupos</h3>
      </div>
      
      <div v-if="groupsStore.loading" class="spinner" />
      <div v-else>
        <!-- No groups warning -->
        <div v-if="groupsStore.groups.length === 0" class="no-groups-warning">
          <p>⚠️ No perteneces a ningún grupo. Para participar, crea un grupo nuevo o únete a uno existente.</p>
        </div>

        <div class="groups-list">
          <div v-for="g in groupsStore.groups" :key="g.id" class="group-row">
            <div>
              <div class="group-name">{{ g.name }}</div>
              <div class="group-code">Código: <strong>{{ g.invite_code }}</strong></div>
            </div>
            <button v-if="g.owner_id === auth.user?.id" class="btn btn-ghost btn-sm text-red" @click="deleteGroup(g.id)">Eliminar</button>
            <button v-else class="btn btn-ghost btn-sm text-red" @click="leaveGroup(g.id)">Salir</button>
          </div>
        </div>

        <div class="group-actions mt">
          <div class="action-box">
            <h4>Unirse</h4>
            <div class="action-flex">
              <input v-model="inviteCode" type="text" placeholder="Código" />
              <button class="btn btn-primary btn-sm" :disabled="!inviteCode" @click="joinGroup">Unirme</button>
            </div>
            <p v-if="joinError" class="error-msg text-sm">{{ joinError }}</p>
          </div>
          
          <div class="action-box">
            <h4>Crear Grupo</h4>
            <div class="action-flex">
              <input v-model="newGroupName" type="text" placeholder="Nombre" />
              <button class="btn btn-gold btn-sm" :disabled="!newGroupName" @click="createGroup">Crear</button>
            </div>
            <p v-if="createError" class="error-msg text-sm">{{ createError }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- My Predictions -->
    <div class="card predictions-section">
      <div class="preds-header">
        <h3 class="section-title">Mis Predicciones</h3>
        <div class="preds-tabs">
          <button class="tab-btn" :class="{ active: predsTab === 'upcoming' }" @click="predsTab = 'upcoming'">Próximas</button>
          <button class="tab-btn" :class="{ active: predsTab === 'past' }" @click="predsTab = 'past'">Jugadas</button>
        </div>
      </div>
      
      <div v-if="predsLoading" class="spinner" />
      <div v-else-if="visiblePredictions.length === 0" class="empty">
        No tienes predicciones en esta sección. <RouterLink v-if="predsTab === 'upcoming'" to="/matches">¡Empieza ahora!</RouterLink>
      </div>
      <div v-else class="preds-list">
        <div v-for="p in visiblePredictions" :key="p.id" class="pred-row">
          <div class="pred-match">
            <img v-if="p.matches?.home_team_flag" :src="p.matches.home_team_flag" class="flag-xs" />
            <span class="pred-team">{{ p.matches?.home_team_name }}</span>
            <span class="pred-vs">vs</span>
            <span class="pred-team">{{ p.matches?.away_team_name }}</span>
            <img v-if="p.matches?.away_team_flag" :src="p.matches.away_team_flag" class="flag-xs" />
          </div>
          <div class="pred-scores">
            <span class="pred-my">{{ p.predicted_home_score }} – {{ p.predicted_away_score }}</span>
            <span v-if="p.matches?.status === 'finished'" class="pred-real">
              (Real: {{ p.matches.home_score }} – {{ p.matches.away_score }})
            </span>
          </div>
          <span v-if="p.points_earned !== null" class="badge" :class="ptsBadge(p.points_earned)">
            +{{ p.points_earned }} pts
          </span>
          <span v-else class="badge badge-gray">Pendiente</span>
        </div>
      </div>
    </div>

    <!-- Logout -->
    <div style="text-align:center; margin-top: 1rem;">
      <button class="btn btn-ghost" @click="handleLogout">Cerrar sesión</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useGroupsStore } from '../stores/groups'
import { getPredictions } from '../services/api'

const auth        = useAuthStore()
const groupsStore = useGroupsStore()
const router      = useRouter()
const editing     = ref(false)
const editName    = ref(auth.profile?.full_name || '')
const editUsername = ref(auth.profile?.username || '')
const editError   = ref(null)
const editSaving  = ref(false)

const predictions = ref([])
const predsLoading = ref(false)
const predsTab    = ref('upcoming') // 'upcoming' or 'past'

const inviteCode   = ref('')
const joinError    = ref(null)
const newGroupName = ref('')
const createError  = ref(null)

const initial = computed(() => (auth.profile?.username || auth.user?.email || '?')[0].toUpperCase())

const stats = computed(() => ({
  total:   predictions.value.length,
  exact:   predictions.value.filter(p => p.points_earned === 3).length,
  correct: predictions.value.filter(p => p.points_earned === 1).length,
}))

const visiblePredictions = computed(() => {
  if (predsTab.value === 'upcoming') {
    return predictions.value
      .filter(p => p.matches?.status === 'upcoming')
      .sort((a, b) => new Date(a.matches.match_date) - new Date(b.matches.match_date))
  } else {
    return predictions.value
      .filter(p => p.matches?.status === 'live' || p.matches?.status === 'finished')
      .sort((a, b) => new Date(b.matches.match_date) - new Date(a.matches.match_date))
  }
})

const ptsBadge = (pts) => {
  if (pts === 3) return 'badge-gold'
  if (pts === 1) return 'badge-green'
  return 'badge-gray'
}

function cancelEdit() {
  editName.value     = auth.profile?.full_name || ''
  editUsername.value = auth.profile?.username || ''
  editError.value    = null
  editing.value      = false
}

async function joinGroup() {
  joinError.value = null
  try {
    await groupsStore.joinGroup(inviteCode.value)
    inviteCode.value = ''
  } catch (e) {
    joinError.value = e.message
  }
}

async function createGroup() {
  createError.value = null
  try {
    await groupsStore.createGroup(newGroupName.value)
    newGroupName.value = ''
  } catch (e) {
    createError.value = e.message
  }
}

async function leaveGroup(groupId) {
  if (!confirm('¿Estás seguro de que quieres abandonar este grupo?')) return
  try {
    await groupsStore.leaveGroup(groupId)
  } catch (e) {
    alert(e.message)
  }
}

async function deleteGroup(groupId) {
  if (!confirm('¿Estás seguro de que quieres ELIMINAR este grupo por completo? Esta acción no se puede deshacer.')) return
  try {
    await groupsStore.deleteGroup(groupId)
  } catch (e) {
    alert(e.message)
  }
}

async function saveEdit() {
  editSaving.value = true
  editError.value  = null
  try {
    await auth.updateProfile({ full_name: editName.value, username: editUsername.value })
    editing.value = false
  } catch (e) {
    editError.value = e.message || 'Error al guardar'
  } finally {
    editSaving.value = false
  }
}

async function handleLogout() {
  await auth.logout()
  router.push('/')
}

onMounted(async () => {
  if (auth.isLoggedIn) {
    groupsStore.fetchGroups()
  }

  predsLoading.value = true
  try {
    const { data } = await getPredictions()
    predictions.value = data.reverse()
  } catch (e) {
    console.error('Failed to load predictions:', e)
  } finally {
    predsLoading.value = false
  }
})
</script>

<style scoped>
.profile-view { display: flex; flex-direction: column; gap: 1.5rem; }
.page-header h1 { font-size: 1.6rem; font-weight: 900; }

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}
.profile-card { display: flex; flex-direction: column; align-items: center; gap: .8rem; text-align: center; }
.avatar-lg {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; font-weight: 900;
}
.username { font-size: 1.2rem; font-weight: 800; }
.email { font-size: .8rem; color: var(--text-muted); }
.full-name { font-size: .9rem; color: var(--text-muted); }
.mt { margin-top: .4rem; }

.edit-form { width: 100%; text-align: left; }
.edit-actions { display: flex; gap: .5rem; justify-content: flex-end; margin-top: .3rem; }

.stats-title { font-size: 1rem; font-weight: 800; margin-bottom: 1rem; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: .2rem; }
.stat-val { font-size: 1.6rem; font-weight: 900; }
.stat-val.gold  { color: var(--gold); }
.stat-val.green { color: var(--green); }
.stat-val.blue  { color: var(--primary); }
.stat-label { font-size: .75rem; color: var(--text-muted); text-align: center; }

.groups-card { margin-top: 1rem; }
.groups-header { margin-bottom: 1rem; }
.no-groups-warning { background: rgba(255,193,7,.1); border: 1px solid var(--gold); color: var(--gold); padding: 1rem; border-radius: var(--radius); text-align: center; }
.groups-list { display: flex; flex-direction: column; gap: .8rem; }
.group-row { display: flex; justify-content: space-between; align-items: center; background: var(--surface2); padding: .8rem 1rem; border-radius: var(--radius); }
.group-name { font-weight: 800; font-size: 1.1rem; }
.group-code { font-size: .85rem; color: var(--text-muted); }
.text-red { color: #f87171 !important; }
.text-red:hover { background: rgba(248,113,113,.1) !important; }

.group-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.action-box { background: var(--surface2); padding: 1rem; border-radius: var(--radius); }
.action-box h4 { font-size: .9rem; margin-bottom: .5rem; }
.action-flex { display: flex; gap: .5rem; }
.action-flex input { flex: 1; min-width: 0; padding: .5rem; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--text); }
.text-sm { font-size: .8rem; margin-top: .4rem; }

.section-title { font-size: 1rem; font-weight: 800; margin-bottom: 0; }
.preds-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: .5rem;
}
.preds-tabs {
  display: flex;
  background: var(--surface2);
  border-radius: 99px;
  padding: .2rem;
}
.tab-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: .85rem;
  font-weight: 600;
  padding: .3rem .8rem;
  border-radius: 99px;
  cursor: pointer;
  transition: all .2s;
}
.tab-btn.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.preds-list { display: flex; flex-direction: column; gap: .5rem; }
.pred-row {
  display: flex;
  align-items: center;
  gap: .6rem;
  flex-wrap: wrap;
  padding: .55rem .7rem;
  background: var(--surface2);
  border-radius: var(--radius);
}
.pred-match { display: flex; align-items: center; gap: .4rem; flex: 1; min-width: 180px; }
.pred-team { font-size: .85rem; font-weight: 600; }
.pred-vs { font-size: .75rem; color: var(--text-muted); }
.flag-xs { width: 22px; height: 16px; object-fit: cover; border-radius: 2px; border: 1px solid var(--border); }
.pred-scores { display: flex; align-items: center; gap: .4rem; font-size: .85rem; }
.pred-my { font-weight: 700; }
.pred-real { color: var(--text-muted); font-size: .8rem; }
.empty { color: var(--text-muted); padding: 2rem; text-align: center; }
</style>
