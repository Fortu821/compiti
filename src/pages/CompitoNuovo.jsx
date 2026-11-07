import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import AvvisoDuplicato from '../components/AvvisoDuplicato'

const MATERIE = ['Matematica', 'Scienze', 'Info Reti', 'Italiano', 'Storia', 'Inglese', 'Diritto', 'Disegno Tecn.', 'Geografia', 'Motoria']

export default function CompitoNuovo() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [form, setForm] = useState({ materia: '', data_consegna: '', richiesta: '', descrizione: '' })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function checkAndSubmit(e, force = false) {
    e.preventDefault()
    setLoading(true)

    if (!force) {
      const { data: esistenti } = await supabase.from('compiti').select('id').eq('materia', form.materia).eq('data_consegna', form.data_consegna).limit(1)
      if (esistenti && esistenti.length > 0) {
        setShowDuplicateWarning(true)
        setLoading(false)
        return
      }
    }

    const { data: nuovoCompito, error } = await supabase.from('compiti').insert({ ...form, creato_da: user.id }).select().single()

    if (error) {
      alert('Errore: ' + error.message)
    } else {
      // 🚀 INVIA NOTIFICA TELEGRAM
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'nuovo_compito',
            title: 'Nuovo Compito Assegnato',
            body: form.richiesta,
            materia: form.materia,
            link: `${window.location.origin}/compiti/${nuovoCompito.id}`
          }
        })
      } catch (err) {
        console.error('Errore notifica:', err)
      }
      navigate('/compiti')
    }
    setLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '600px' }}>
        <Link to="/compiti" className="text-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Torna ai compiti</Link>
        <div className="card">
          <div className="card-header"><h1 className="card-title">📝 Nuovo Compito</h1></div>
          <form onSubmit={(e) => checkAndSubmit(e, false)} className="auth-form">
            <div className="form-group">
              <label className="form-label">Materia *</label>
              <select name="materia" className="input" value={form.materia} onChange={handleChange} required>
                <option value="">Seleziona materia...</option>
                {MATERIE.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Data di consegna *</label>
              <input type="date" name="data_consegna" className="input" value={form.data_consegna} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Richiesta (dal registro) *</label>
              <textarea name="richiesta" className="input" rows="3" value={form.richiesta} onChange={handleChange} required placeholder="Es. Pag. 45 esercizi 1-5" />
            </div>
            <div className="form-group">
              <label className="form-label">Descrizione (opzionale)</label>
              <textarea name="descrizione" className="input" rows="2" value={form.descrizione} onChange={handleChange} placeholder="Note o dettagli extra..." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Salvataggio...' : 'Salva Compito'}
            </button>
          </form>
        </div>
      </div>
      {showDuplicateWarning && (
        <AvvisoDuplicato 
          onAnnulla={() => { setShowDuplicateWarning(false); setLoading(false); }}
          onConferma={() => { setShowDuplicateWarning(false); checkAndSubmit({ preventDefault: () => {} }, true); }}
        />
      )}
    </div>
  )
}