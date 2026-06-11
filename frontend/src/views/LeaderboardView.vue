<template>
  <div class="leaderboard-view">
    <div class="page-header">
      <h1>🏆 Tabla de posiciones</h1>
      <p class="page-sub">Ranking actualizado en tiempo real</p>
    </div>

    <div v-if="loading" class="spinner" />
    <p v-else-if="error" class="error-msg">{{ error }}</p>
    <div v-else>
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
              :key="row.id"
              :class="{ 'my-row': isMe(row.id) }"
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
                <span v-if="isMe(row.id)" class="badge badge-blue you-tag">Tú</span>
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
              <td colspan="6" class="empty-row">Aún no hay participantes. ¡Sé el primero!</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getLeaderboard } from '../services/api'
import { useAuthStore }   from '../stores/auth'

const auth    = useAuthStore()
const leaders = ref([])
const loading = ref(false)
const error   = ref(null)

const isMe = (id) => auth.user?.id === id

function initial(row) {
  return (row?.username || '?')[0].toUpperCase()
}

onMounted(async () => {
  loading.value = true
  error.value   = null
  try {
    const { data } = await getLeaderboard(100)
    leaders.value = data
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al cargar la tabla'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.leaderboard-view { display: flex; flex-direction: column; gap: 1.5rem; }
.page-header h1 { font-size: 1.6rem; font-weight: 900; }
.page-sub { color: var(--text-muted); font-size: .9rem; }

.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: .5rem;
  margin-bottom: .5rem;
}
.podium-item { display: flex; flex-direction: column; align-items: center; gap: .4rem; min-width: 90px; }
.podium-avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold); }
.podium-avatar-placeholder {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: var(--surface2);
  border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1.2rem;
}
.podium-avatar-placeholder.gold { border-color: var(--gold); color: var(--gold); }
.podium-name { font-size: .8rem; font-weight: 700; text-align: center; }
.podium-block {
  width: 80px;
  border-radius: 8px 8px 0 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: .4rem .2rem;
  gap: .2rem;
}
.block-1 { height: 80px; background: linear-gradient(180deg, #7c5a00, #3d2f0e); border: 1px solid var(--gold); }
.block-2 { height: 60px; background: var(--surface2); border: 1px solid var(--border); }
.block-3 { height: 44px; background: #1a2010; border: 1px solid #555; }
.medal { font-size: 1.1rem; }
.podium-pts { font-size: .75rem; font-weight: 700; color: var(--text-muted); }

.table-card { padding: 0; overflow: hidden; }
.lb-table { width: 100%; border-collapse: collapse; }
.lb-table th {
  background: var(--surface2);
  padding: .7rem 1rem;
  font-size: .78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--text-muted);
  text-align: left;
}
.lb-table td { padding: .7rem 1rem; border-bottom: 1px solid var(--border); font-size: .88rem; }
.lb-table tr:last-child td { border-bottom: none; }
.lb-table tr:hover td { background: var(--surface2); }
.my-row td { background: #1e3a5f !important; }

.rank-cell { width: 40px; text-align: center; }
.rank-num { color: var(--text-muted); font-size: .85rem; }
.user-cell { display: flex; align-items: center; gap: .5rem; }
.avatar-sm {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: .78rem; font-weight: 700; flex-shrink: 0;
}
.username { font-weight: 600; }
.you-tag { margin-left: .3rem; }
.num-cell { text-align: center; }
.pts-cell { text-align: right; font-weight: 800; font-size: 1rem; color: var(--gold); }
.text-muted { color: var(--text-muted); }
.empty-row { text-align: center; color: var(--text-muted); padding: 2rem; }
</style>
