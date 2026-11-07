import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function VerificheList() {
  const [verifiche, setVerifiche] = useState([])
  const [materie, setMaterie] = useState([])
  const [filtro, setFiltro] = useState('tutte')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: materieData } = await supabase
      .from('verifiche')
      .select('materia')
      .order('materia')
    
    if (materieData) {
      const uniqueMaterie = [...new Set(materieData.map(m => m.materia))]
      setMaterie(uniqueMaterie)
    }

    let query = supabase
      .from('verifiche')
      .select('*')
      .order('data', { ascending: true })
    
    if (filtro !== 'tutte') {
      query = query.eq('materia', filtro)
    }

    const { data } = await query
    setVerifiche(data || [])
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
            📋 Verifiche Programmate
          </h1>
          <Link to="/verifiche/nuova" className="btn btn-primary">
            + Nuova Verifica
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
        ) : verifiche.length === 0 ? (
          <div className="card empty-state">
            Nessuna verifica trovata per questo filtro.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {verifiche.map((v) => {
              const dataVerifica = new Date(v.data)
              const oggi = new Date()
              const isPassata = dataVerifica < oggi.setHours(0,0,0,0)
              
              return (
                <Link 
                  key={v.id} 
                  to={`/verifiche/${v.id}`} 
                  className="card list-item" 
                  style={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    opacity: isPassata ? 0.6 : 1
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'start' 
                  }}>
                    <span className="badge badge-danger">{v.materia}</span>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: isPassata ? 'var(--text-secondary)' : 'var(--brand-danger)', 
                      fontWeight: '600' 
                    }}>
                       {v.data} {isPassata && '(passata)'}
                    </span>
                  </div>
                  <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '600', 
                    margin: '0.75rem 0 0.25rem 0' 
                  }}>
                    {v.argomento || 'Argomento non specificato'}
                  </h3>
                  {v.descrizione && (
                    <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                      {v.descrizione}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}