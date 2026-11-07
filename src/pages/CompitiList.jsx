import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function CompitiList() {
  const [compiti, setCompiti] = useState([])
  const [materie, setMaterie] = useState([])
  const [filtro, setFiltro] = useState('tutte')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    // Prendi tutte le materie disponibili per il filtro
    const { data: materieData } = await supabase
      .from('compiti')
      .select('materia')
      .order('materia')
    
    if (materieData) {
      const uniqueMaterie = [...new Set(materieData.map(m => m.materia))]
      setMaterie(uniqueMaterie)
    }

    // Prendi i compiti
    let query = supabase.from('compiti').select('*').order('data_consegna', { ascending: true })
    if (filtro !== 'tutte') {
      query = query.eq('materia', filtro)
    }

    const { data } = await query
    setCompiti(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [filtro])

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 className="card-title" style={{ fontSize: '1.5rem' }}>📝 Compiti Assegnati</h1>
          <Link to="/compiti/nuovo" className="btn btn-primary">+ Nuovo Compito</Link>
        </div>

        <div className="filter-bar">
          <select 
            className="select-input" 
            value={filtro} 
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="tutte">Tutte le materie</option>
            {materie.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-secondary">Caricamento...</p>
        ) : compiti.length === 0 ? (
          <div className="card empty-state">Nessun compito trovato per questo filtro.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {compiti.map((c) => (
              <Link key={c.id} to={`/compiti/${c.id}`} className="card list-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span className="badge badge-primary">{c.materia}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--brand-danger)', fontWeight: '600' }}>
                    Scadenza: {c.data_consegna}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0.75rem 0 0.25rem 0' }}>{c.richiesta}</h3>
                {c.descrizione && <p className="text-secondary" style={{ fontSize: '0.9rem' }}>{c.descrizione}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}