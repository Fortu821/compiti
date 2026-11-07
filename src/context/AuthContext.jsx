import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function enrichUserWithProfile(authUser) {
    if (!authUser) return null
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('nome, email, ruolo, two_factor_enabled, two_factor_method, email_reale, telegram_chat_id')
        .eq('id', authUser.id)
        .single()

      if (error) {
        return { ...authUser, nome: authUser.email?.split('@')[0] || 'Utente', ruolo: 'user' }
      }

      return {
        ...authUser,
        nome: profile.nome || authUser.email?.split('@')[0],
        email_reale: profile.email_reale,
        telegram_chat_id: profile.telegram_chat_id,
        ruolo: profile.ruolo || 'user',
        two_factor_enabled: profile.two_factor_enabled || false,
        two_factor_method: profile.two_factor_method
      }
    } catch (err) {
      console.error('❌ Errore nel recupero del profilo:', err)
      return { ...authUser, ruolo: 'user' }
    }
  }

  useEffect(() => {
    async function initializeAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const enrichedUser = await enrichUserWithProfile(session.user)
        setUser(enrichedUser)
      }
      setLoading(false)
    }

    initializeAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const enrichedUser = await enrichUserWithProfile(session.user)
          setUser(enrichedUser)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => listener?.subscription.unsubscribe()
  }, [])

  const signUp = async (username, password) => {
    // Usa .com per garantire il passaggio della regex di validazione di Supabase
    const fauxEmail = username.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '') + '@classeapp.com'
    
    const { data, error } = await supabase.auth.signUp({
      email: fauxEmail,
      password,
      options: { data: { username } }
    })
    if (error) throw error
    return data
  }

  const signIn = async (username, password) => {
    const fauxEmail = username.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '') + '@classeapp.com'
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: fauxEmail,
      password
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  const value = { user, loading, signUp, signIn, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve essere usato dentro un AuthProvider')
  }
  return context
}
