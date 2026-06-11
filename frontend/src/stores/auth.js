import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    profile.value = data
  }

  async function init() {
    loading.value = true
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = session.user
      await fetchProfile(session.user.id)
    }
    loading.value = false

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        profile.value = null
      }
    })
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function register(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value    = null
    profile.value = null
  }

  async function updateProfile(updates) {
    if (!user.value) return
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()
    if (error) throw error
    profile.value = data
    return data
  }

  return { user, profile, loading, isLoggedIn, init, login, register, logout, updateProfile, fetchProfile }
})
