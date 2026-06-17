<template>
  <div class="leaderboard-view">
    <div class="page-header">
      <h1>🏆 Tabla de posiciones</h1>
      <p class="page-sub">Ranking actualizado en tiempo real</p>
    </div>

    <div v-if="!auth.isLoggedIn" class="empty-state card">
      <h2>Inicia sesión</h2>
      <p>Debes iniciar sesión para ver tus grupos y la tabla de posiciones.</p>
      <br>
      <RouterLink to="/login" class="btn btn-primary">Iniciar Sesión</RouterLink>
    </div>
    
    <div v-else-if="groupsStore.loading" class="spinner" />

    <div v-else-if="groupsStore.groups.length === 0" class="empty-state card">
      <h2>¡No perteneces a ningún grupo!</h2>
      <p>Para participar en la polla, necesitas unirte a un grupo existente usando un código de invitación, o crear tu propio grupo para invitar a tus amigos.</p>
      
      <div class="group-actions">
        <div class="action-box">
          <h3>Unirse a un grupo</h3>
          <input v-model="inviteCode" type="text" placeholder="Código (ej. X7A9P2)" />
          <button class="btn btn-primary btn-sm" :disabled="!inviteCode" @click="joinGroup">Unirme</button>
          <p v-if="joinError" class="error-msg">{{ joinError }}</p>
        </div>
        
        <div class="action-box">
          <h3>Crear un grupo nuevo</h3>
          <input v-model="newGroupName" type="text" placeholder="Nombre del grupo" />
          <button class="btn btn-gold btn-sm" :disabled="!newGroupName" @click="createGroup">Crear Grupo</button>
          <p v-if="createError" class="error-msg">{{ createError }}</p>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- Group Selector -->
      <div class="group-selector card">
        <div class="selector-header">
          <h3>Viendo grupo:</h3>
          <select v-model="groupsStore.activeGroupId" @change="loadLeaderboard" class="group-select">
            <option v-for="g in groupsStore.groups" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
        </div>
        <div class="group-info" v-if="activeGroup">
          <p>Código de invitación: <strong class="gold-text">{{ activeGroup.invite_code }}</strong></p>
          <p class="hint-text">Comparte este código con tus amigos para que se unan.</p>
        </div>
      </div>

      <div v-if="loading" class="spinner mt" />
      <p v-else-if="error" class="error-msg">{{ error }}</p>
      <div v-else class="leaderboard-content mt">
        <!-- Top 3 podium -->
        <div v-if="leaders.length >= 3" class="podium">
          <div class="podium-item second">
            <img v-if="leaders[1]?.avatar_url" :src="leaders[1].avatar_url" class="podium-avatar" />
            <div v-else class="podium-avatar-placeholder">{{ initial(leaders[1]) }}</div>
            <p class="podium-name">{{ leaders[1]?.username }}</p>
            <div class="podium-block block-2">
              <span class="medal">🥈</span>
              <span class="podium-pts">{{ leaders[1]?.total_points }} pts</span>
            </div>
          </div>
          <div class="podium-item first">
            <img v-if="leaders[0]?.avatar_url" :src="leaders[0].avatar_url" class="podium-avatar" />
            <div v-else class="podium-avatar-placeholder gold">{{ initial(leaders[0]) }}</div>
            <p class="podium-name">{{ leaders[0]?.username }}</p>
            <div class="podium-block block-1">
              <span class="medal">🥇</span>
              <span class="podium-pts">{{ leaders[0]?.total_points }} pts</span>
            </div>
          </div>
          <div class="podium-item third">
            <img v-if="leaders[2]?.avatar_url" :src="leaders[2].avatar_url" class="podium-avatar" />
            <div v-else class="podium-avatar-placeholder">{{ initial(leaders[2]) }}</div>
            <p class="podium-name">{{ leaders[2]?.username }}</p>
            <div class="podium-block block-3">
              <span class="medal">🥉</span>
              <span class="podium-pts">{{ leaders[2]?.total_points }} pts</span>
            </div>
          </div>
        </div>

        <!-- Full table -->
        <div class="table-card card">
          <table class="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Jugador</th>
                <th>Exactos</th>
                <th>Correctos</th>
                <th>Campeón</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in leaders"
                :key="row.user_id"
                :class="{ 'my-row': isMe(row.user_id) }"
              >
                <td class="rank-cell">
                  <span v-if="idx === 0">🥇</span>
                  <span v-else-if="idx === 1">🥈</span>
                  <span v-else-if="idx === 2">🥉</span>
                  <span v-else class="rank-num">{{ idx + 1 }}</span>
                </td>
                <td class="user-cell">
                  <span class="avatar-sm">{{ initial(row) }}</span>
                  <span class="username">{{ row.username }}</span>
                  <span v-if="isMe(row.user_id)" class="badge badge-blue you-tag">Tú</span>
                </td>
                <td class="num-cell">
                  <span class="badge badge-gold">{{ row.exact_scores }}</span>
                </td>
                <td class="num-cell">
                  <span class="badge badge-green">{{ row.correct_results }}</span>
                </td>
                <td class="num-cell">
                  <span v-if="row.champion_pick" :title="row.champion_pick">⚽ {{ row.champion_pick }}</span>
                  <span v-else class="text-muted">–</span>
                </td>
                <td class="pts-cell">{{ row.total_points }}</td>
              </tr>
              <tr v-if="leaders.length === 0">
                <td colspan="6" class="empty-row">Aún no hay participantes en este grupo.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getLeaderboard } from '../services/api'
import { useAuthStore }   from '../stores/auth'
import { useGroupsStore } from '../stores/groups'

const auth        = useAuthStore()
const groupsStore = useGroupsStore()
const leaders     = ref([])
const loading     = ref(false)
const error       = ref(null)

const inviteCode   = ref('')
const joinError    = ref(null)
const newGroupName = ref('')
const createError  = ref(null)

const isMe = (id) => auth.user?.id === id

const activeGroup = computed(() => {
  return groupsStore.groups.find(g => g.id === groupsStore.activeGroupId)
})

function initial(row) {
  return (row?.username || '?')[0].toUpperCase()
}

async function loadLeaderboard() {
  if (!groupsStore.activeGroupId) return
  
  loading.value = true
  error.value   = null
  try {
    const { data } = await getLeaderboard(100, groupsStore.activeGroupId)
    leaders.value = data
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al cargar la tabla'
  } finally {
    loading.value = false
  }
}

async function joinGroup() {
  joinError.value = null
  try {
    await groupsStore.joinGroup(inviteCode.value)
    await loadLeaderboard()
  } catch (e) {
    joinError.value = e.message
  }
}

async function createGroup() {
  createError.value = null
  try {
    await groupsStore.createGroup(newGroupName.value)
    await loadLeaderboard()
  } catch (e) {
    createError.value = e.message
  }
}

onMounted(async () => {
  if (auth.isLoggedIn) {
    await groupsStore.fetchGroups()
    if (groupsStore.activeGroupId) {
      await loadLeaderboard()
    }
  }
})

watch(() => auth.isLoggedIn, async (loggedIn) => {
  if (loggedIn) {
    await groupsStore.fetchGroups()
    if (groupsStore.activeGroupId) {
      await loadLeaderboard()
    }
  } else {
    leaders.value = []
  }
})
</script>

<style scoped>
.leaderboard-view { display: flex; flex-direction: column; gap: 1.5rem; }
.page-header h1 { font-size: 1.6rem; font-weight: 900; }
.page-sub { color: var(--text-muted); font-size: .9rem; }
.mt { margin-top: 1.5rem; }

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.empty-state h2 { font-size: 1.4rem; color: var(--gold); }
.empty-state p { color: var(--text-muted); max-width: 500px; line-height: 1.5; }

.group-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 2rem;
  width: 100%;
  justify-content: center;
}
.action-box {
  background: var(--surface2);
  padding: 1.5rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: .8rem;
  width: 100%;
  max-width: 320px;
}
.action-box h3 { font-size: 1.1rem; text-align: left; }
.action-box input {
  padding: .6rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}

.group-selector {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: .8rem;
}
.selector-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.selector-header h3 { font-size: 1.1rem; color: var(--text-muted); }
.group-select {
  padding: .6rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  font-weight: 700;
  min-width: 200px;
}
.group-info {
  font-size: .95rem;
  padding-top: .8rem;
  border-top: 1px solid var(--border);
}
.gold-text { color: var(--gold); font-size: 1.1rem; letter-spacing: 1px; }
.hint-text { color: var(--text-muted); font-size: .8rem; margin-top: .2rem; }

/* Podium and Table styles (unchanged) */
.podium { display: flex; align-items: flex-end; justify-content: center; gap: .5rem; margin-bottom: .5rem; }
.podium-item { display: flex; flex-direction: column; align-items: center; gap: .4rem; min-width: 90px; }
.podium-avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold); }
.podium-avatar-placeholder {
  width: 52px; height: 52px; border-radius: 50%; background: var(--surface2); border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem;
}
.podium-avatar-placeholder.gold { border-color: var(--gold); color: var(--gold); }
.podium-name { font-size: .8rem; font-weight: 700; text-align: center; }
.podium-block {
  width: 80px; border-radius: 8px 8px 0 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: .4rem .2rem; gap: .2rem;
}
.block-1 { height: 80px; background: linear-gradient(180deg, #7c5a00, #3d2f0e); border: 1px solid var(--gold); }
.block-2 { height: 60px; background: var(--surface2); border: 1px solid var(--border); }
.block-3 { height: 44px; background: #1a2010; border: 1px solid #555; }
.medal { font-size: 1.1rem; }
.podium-pts { font-size: .75rem; font-weight: 700; color: var(--text-muted); }

.table-card { padding: 0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.lb-table { width: 100%; border-collapse: collapse; min-width: 500px; }
.lb-table th { background: var(--surface2); padding: .7rem 1rem; font-size: .78rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); text-align: left; }
.lb-table td { padding: .7rem 1rem; border-bottom: 1px solid var(--border); font-size: .88rem; }
.lb-table tr:last-child td { border-bottom: none; }
.lb-table tr:hover td { background: var(--surface2); }
.my-row td { background: #1e3a5f !important; }

.rank-cell { width: 40px; text-align: center; }
.rank-num { color: var(--text-muted); font-size: .85rem; }
.user-cell { display: flex; align-items: center; gap: .5rem; }
.avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: .78rem; font-weight: 700; flex-shrink: 0; }
.username { font-weight: 600; }
.you-tag { margin-left: .3rem; }
.num-cell { text-align: center; }
.pts-cell { text-align: right; font-weight: 800; font-size: 1rem; color: var(--gold); }
.text-muted { color: var(--text-muted); }
.empty-row { text-align: center; color: var(--text-muted); padding: 2rem; }
</style>
