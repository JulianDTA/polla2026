import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMatches, getStandings } from '../services/api'

export const useMatchesStore = defineStore('matches', () => {
  const matches   = ref([])
  const standings = ref([])
  const loading   = ref(false)
  const error     = ref(null)

  const byStage = computed(() => {
    const groups = {}
    for (const m of matches.value) {
      const key = m.stage
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    }
    return groups
  })

  const groupMatches = computed(() =>
    matches.value.filter(m => m.stage === 'group')
  )

  const knockoutMatches = computed(() =>
    matches.value.filter(m => m.stage !== 'group')
  )

  async function loadMatches(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await getMatches(params)
      if (Array.isArray(data)) {
        matches.value = data
      } else {
        matches.value = []
        error.value = 'Respuesta inválida del servidor (posible error de VITE_API_URL)'
      }
    } catch (e) {
      error.value = e.response?.data?.error || e.message
    } finally {
      loading.value = false
    }
  }

  async function loadStandings() {
    try {
      const { data } = await getStandings()
      if (Array.isArray(data)) {
        standings.value = data
      }
    } catch (e) {
      console.error('loadStandings error:', e)
    }
  }

  function updateMatchPrediction(matchId, prediction) {
    const idx = matches.value.findIndex(m => m.id === matchId)
    if (idx !== -1) {
      matches.value[idx] = { ...matches.value[idx], userPrediction: prediction }
    }
  }

  return {
    matches, standings, loading, error,
    byStage, groupMatches, knockoutMatches,
    loadMatches, loadStandings, updateMatchPrediction,
  }
})
