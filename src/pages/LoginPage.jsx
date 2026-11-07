import { useState, useEffect, Suspense } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { generateFauxEmail } from '../lib/auth-utils'

function LoginForm() {
  const navigate = useNavigate()
  const searchParams = useSearchParams()[0]
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show2FA, setShow2FA] = useState(false)
  const [twoFACode, setTwoFACode] = useState('')
  const [userId, setUserId] = useState(null)

  // 🛡️ FIX SICUREZZA: Se l'utente è già loggato, reindirizzalo alla home
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        navigate('/', { replace: true })
      }
    }
    checkAuth()
    
    if (searchParams.get('registered') === 'true') setError('')
  }, [navigate, searchParams])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fauxEmail = generateFauxEmail(username)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: fauxEmail,
      password,
    })

    if (loginError) {
      setError('Nome utente o password non corretti.')
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('two_factor_enabled, two_factor_method')
        .eq('id', data.user.id)
        .single()

      if (profile?.two_factor_enabled && profile.two_factor_method === 'telegram') {
        setUserId(data.user.id)
        setShow2FA(true)
        setLoading(false)
        await send2FACode()
      } else {
        navigate('/')
      }
    }
  }

  async function send2FACode() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Nessuna sessione attiva")

      const { data, error } = await supabase.functions.invoke('send-2fa-code', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      
      if (error) {
        console.error("ERRORE RAW 2FA:", error)
        console.error("ERROR.CONTEXT:", error.context)
        console.error("ERROR.CONTEXT TYPE:", typeof error.context)
        
        let errorMsg = "Errore sconosciuto del server"
        
        // Caso 1: error.context è una stringa JSON
        if (typeof error.context === 'string') {
          try {
            const parsed = JSON.parse(error.context)
            errorMsg = parsed.error || parsed.message || errorMsg
          } catch (e) {
            errorMsg = error.context
          }
        }
        // Caso 2: error.context è un oggetto Response di Fetch
        else if (error.context && typeof error.context.json === 'function') {
          try {
            const responseClone = error.context.clone()
            const body = await responseClone.json()
            errorMsg = body.error || body.message || errorMsg
          } catch (e) {
            errorMsg = "Errore nel parsing della risposta del server"
          }
        }
        // Caso 3: error.message esiste
        else if (error.message) {
          errorMsg = error.message
        }
        
        throw new Error(errorMsg)
      }
    } catch (err) {
      console.error('Errore invio 2FA:', err)
      setError('Impossibile inviare il codice 2FA: ' + err.message)
    }
  }

  async function handle2FAVerify(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: codes, error } = await supabase
      .from('two_factor_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', twoFACode)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (error || !codes || codes.length === 0) {
      setError('Codice 2FA non valido o scaduto.')
      setLoading(false)
      return
    }

    await supabase.from('two_factor_codes').update({ used: true }).eq('id', codes[0].id)
    navigate('/')
  }

  if (show2FA) {
    return (
      <div className="auth-layout">
        <div className="card auth-card">
          <div className="card-header text-center">
            <h1 className="card-title">🔐 Verifica 2FA</h1>
            <p className="card-description">Inserisci il codice a 6 cifre inviato su Telegram</p>
          </div>
          <form onSubmit={handle2FAVerify} className="auth-form">
            <div className="form-group">
              <label htmlFor="code" className="form-label">Codice</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                className="input"
                placeholder="123456"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                required
                maxLength={6}
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Verifica...' : 'Verifica codice'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <div className="card-header text-center">
          <h1 className="card-title">📚 Classe App</h1>
          <p className="card-description">Accedi alla piattaforma della tua classe</p>
        </div>
        <form onSubmit={handleLogin} className="auth-form">
          {searchParams.get('registered') === 'true' && (
            <div className="success-message">Registrazione completata! Ora puoi accedere.</div>
          )}
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="username" className="form-label">Nome completo</label>
            <input
              id="username"
              type="text"
              className="input"
              placeholder="Mario Rossi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
          <div className="text-center mt-sm">
            <span className="text-secondary">Non hai un account? </span>
            <Link to="/register" className="text-link">Registrati</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}