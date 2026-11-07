import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const MATERIE = ['Matematica', 'Scienze', 'Info Reti', 'Italiano', 'Storia', 'Inglese', 'Diritto', 'Disegno Tecn.', 'Geografia', 'Motoria']

export default function VerificaNuova() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ materia: '', data: '', argomento: '', descrizione: '' })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const { data: nuovaVerifica, error } = await supabase.from('verifiche').insert({
      materia: form.materia,
      data: form.data,
      argomento: form.argomento || null,
      descrizione: form.descrizione || null,
      creato_da: user.id
    }).select().single()

    if (error) {
      alert('Errore: ' + error.message)
    } else {
      // 🚀 INVIA NOTIFICA TELEGRAM
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'nuova_verifica',
            title: 'Nuova Verifica Programmata',
            body: form.argomento || 'Verifica in programma',
            materia: form.materia,
            link: `${window.location.origin}/verifiche/${nuovaVerifica.id}`
          }
        })
      } catch (err) {
        console.error('Errore notifica:', err)
      }
      navigate('/verifiche')
    }
    setLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '600px' }}>
        <Link to="/verifiche" className="text-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Torna alle verifiche</Link>
        <div className="card">
          <div className="card-header"><h1 className="card-title">📋 Nuova Verifica</h1></div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Materia *</label>
              <select name="materia" className="input" value={form.materia} onChange={handleChange} required>
                <option value="">Seleziona materia...</option>
                {MATERIE.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Data verifica *</label>
              <input type="date" name="data" className="input" value={form.data} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Argomento (opzionale)</label>
              <input type="text" name="argomento" className="input" value={form.argomento} onChange={handleChange} placeholder="Es. Derivate, Capitolo 5, ecc." />
            </div>
            <div className="form-group">
              <label className="form-label">Descrizione / Note (opzionale)</label>
              <textarea name="descrizione" className="input" rows="3" value={form.descrizione} onChange={handleChange} placeholder="Dettagli sulla verifica, modalità, ecc." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Salvataggio...' : 'Salva Verifica'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}