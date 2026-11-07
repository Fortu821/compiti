import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Le password non coincidono.')
      return
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.')
      return
    }

    setLoading(true)

    try {
      await signUp(username, password)
      // Reindirizza al login con un messaggio di successo gestito lì, o mostra un alert
      alert('Registrazione completata! Ora puoi accedere.')
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Si è verificato un errore durante la registrazione.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <div className="card-header text-center">
          <h1 className="card-title">📚 Registrati</h1>
          <p className="card-description">Crea un account per la piattaforma della classe</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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
            <span className="form-hint">Il tuo nome sarà usato per identificarti nella classe.</span>
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
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Conferma password</label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>

          <div className="text-center mt-sm">
            <span className="text-secondary">Hai già un account? </span>
            <Link to="/login" className="text-link">Accedi</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
