import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const MATERIE = ['Matematica', 'Scienze', 'Info Reti', 'Italiano', 'Storia', 'Inglese', 'Diritto', 'Disegno Tecn.', 'Geografia', 'Motoria']

export default function AppuntoNuovo() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ materia: '', argomento: '', data_lezione: '', descrizione: '' })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const { data: nuovoAppunto, error } = await supabase.from('appunti').insert({
      materia: form.materia,
      argomento: form.argomento,
      data_lezione: form.data_lezione || null,
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
            type: 'nuovo_appunto',
            title: 'Nuovo Appunto Condiviso',
            body: form.argomento + (form.descrizione ? ` - ${form.descrizione}` : ''),
            materia: form.materia,
            link: `${window.location.origin}/appunti/${nuovoAppunto.id}`
          }
        })
      } catch (err) {
        console.error('Errore notifica:', err)
      }
      navigate('/appunti')
    }
    setLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '600px' }}>
        <Link to="/appunti" className="text-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Torna agli appunti</Link>
        <div className="card">
          <div className="card-header"><h1 className="card-title">📓 Nuovo Appunto</h1></div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Materia *</label>
              <select name="materia" className="input" value={form.materia} onChange={handleChange} required>
                <option value="">Seleziona materia...</option>
                {MATERIE.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Argomento *</label>
              <input type="text" name="argomento" className="input" value={form.argomento} onChange={handleChange} required placeholder="Es. Derivate, Funzioni, ecc." />
            </div>
            <div className="form-group">
              <label className="form-label">Data lezione (opzionale)</label>
              <input type="date" name="data_lezione" className="input" value={form.data_lezione} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Descrizione / Note (opzionale)</label>
              <textarea name="descrizione" className="input" rows="3" value={form.descrizione} onChange={handleChange} placeholder="Contenuto dell'appunto, formule, definizioni..." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Salvataggio...' : 'Salva Appunto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}