import axios from 'axios'
import { supabase } from '../supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// ── Matches ──────────────────────────────────────────────────
export const getMatches    = (params = {}) => api.get('/matches', { params })
export const getMatch      = (id)          => api.get(`/matches/${id}`)
export const getStandings  = ()            => api.get('/matches/standings')
export const getTeams      = ()            => api.get('/matches/teams')

// ── Predictions ──────────────────────────────────────────────
export const getPredictions  = ()      => api.get('/predictions')
export const savePrediction  = (body)  => api.post('/predictions', body)
export const getMatchGroupPredictions = (matchId, groupId) => api.get(`/predictions/match/${matchId}?group_id=${groupId}`)

export const getChampionPick  = ()     => api.get('/predictions/champion')
export const saveChampionPick = (body) => api.post('/predictions/champion', body)

// ── Leaderboard ──────────────────────────────────────────────
export const getLeaderboard = (limit = 50, group_id = null) => 
  api.get('/leaderboard', { params: { limit, group_id } })

export default api
