import { defineStore } from 'pinia'
import api from '../services/api'
import { useAuthStore } from './auth'

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    groups: [],
    loading: false,
    error: null,
    activeGroupId: null, // To remember which group leaderboard we are looking at
  }),

  actions: {
    async fetchGroups() {
      const auth = useAuthStore()
      if (!auth.isLoggedIn) return

      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/groups/mine')
        this.groups = data
        if (!this.activeGroupId && data.length > 0) {
          this.activeGroupId = data[0].id
        }
      } catch (e) {
        this.error = e.response?.data?.error || e.message
      } finally {
        this.loading = false
      }
    },

    async createGroup(name) {
      try {
        const { data } = await api.post('/groups', { name })
        this.groups.push(data)
        this.activeGroupId = data.id
        return data
      } catch (e) {
        throw new Error(e.response?.data?.error || e.message)
      }
    },

    async joinGroup(invite_code) {
      try {
        const { data } = await api.post('/groups/join', { invite_code })
        await this.fetchGroups() // Reload groups
        this.activeGroupId = data.group.id
        return data.group
      } catch (e) {
        throw new Error(e.response?.data?.error || e.message)
      }
    }
  }
})
