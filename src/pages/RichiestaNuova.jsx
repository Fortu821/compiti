import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const MATERIE = ['Matematica', 'Scienze', 'Info Reti', 'Italiano', 'Storia', 'Inglese', 'Diritto', 'Disegno Tecn.', 'Geografia', 'Motoria']

export default function RichiestaNuova() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ tipologia: 'appunti', materia: '', data: '', argomento: '' })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('richieste').insert({
      tipologia: form.tipologia,
      materia: form.materia,
      data: form.data || null,
      argomento: form.argomento || null,
      stato: 'aperta',
      creato_da: user.id
    })

    if (error) {
      alert('Errore: ' + error.message)
    } else {
      navigate('/richieste')
    }
    setLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '600px' }}>
        <Link to="/richieste" className="text-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Torna alle richieste</Link>
        
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">🙋 Nuova Richiesta</h1>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Cosa ti serve? *</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="tipologia" value="appunti" checked={form.tipologia === 'appunti'} onChange={handleChange} />
                  📓 Appunti
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="tipologia" value="compiti" checked={form.tipologia === 'compiti'} onChange={handleChange} />
                  📝 Compiti
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Materia *</label>
              <select name="materia" className="input" value={form.materia} onChange={handleChange} required>
                <option value="">Seleziona...</option>
                {MATERIE.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data di riferimento (opzionale)</label>
              <input type="date" name="data" className="input" value={form.data} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Argomento / Dettagli (opzionale)</label>
              <textarea name="argomento" className="input" rows="3" value={form.argomento} onChange={handleChange} placeholder="Es. Appunti di ieri sui limiti, o esercizi pagina 40..." />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Pubblicazione...' : 'Pubblica Richiesta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}