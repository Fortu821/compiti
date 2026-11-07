import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function AppuntiList() {
  const [appunti, setAppunti] = useState([])
  const [materie, setMaterie] = useState([])
  const [filtro, setFiltro] = useState('tutte')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: materieData } = await supabase
      .from('appunti')
      .select('materia')
      .order('materia')
    
    if (materieData) {
      const uniqueMaterie = [...new Set(materieData.map(m => m.materia))]
      setMaterie(uniqueMaterie)
    }

    let query = supabase
      .from('appunti')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filtro !== 'tutte') {
      query = query.eq('materia', filtro)
    }

    const { data } = await query
    setAppunti(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [filtro])

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <h1 className="card-title" style={{ fontSize: '1.5rem' }}>
            📓 Appunti della Classe
          </h1>
          <Link to="/appunti/nuovo" className="btn btn-primary">
            + Nuovo Appunto
          </Link>
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
        ) : appunti.length === 0 ? (
          <div className="card empty-state">
            Nessun appunto trovato per questo filtro.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appunti.map((a) => (
              <Link 
                key={a.id} 
                to={`/appunti/${a.id}`} 
                className="card list-item" 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start' 
                }}>
                  <span className="badge badge-primary">{a.materia}</span>
                  {a.data_lezione && (
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--text-secondary)', 
                      fontWeight: '600' 
                    }}>
                      📅 {a.data_lezione}
                    </span>
                  )}
                </div>
                <h3 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '600', 
                  margin: '0.75rem 0 0.25rem 0' 
                }}>
                  {a.argomento}
                </h3>
                {a.descrizione && (
                  <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                    {a.descrizione}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}