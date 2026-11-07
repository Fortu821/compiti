import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { user } = useAuth()
  const [ultimiCompiti, setUltimiCompiti] = useState([])
  const [ultimiAppunti, setUltimiAppunti] = useState([])
  const [prossimeVerifiche, setProssimeVerifiche] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    const oggi = new Date().toISOString().split('T')[0]

    // Fetch ultimi 3 compiti
    const { data: compitiData } = await supabase
      .from('compiti')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    
    setUltimiCompiti(compitiData || [])

    // Fetch ultimi 3 appunti
    const { data: appuntiData } = await supabase
      .from('appunti')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    
    setUltimiAppunti(appuntiData || [])

    // Fetch prossime 3 verifiche (future)
    const { data: verificheData } = await supabase
      .from('verifiche')
      .select('*')
      .gte('data', oggi)
      .order('data', { ascending: true })
      .limit(3)
    
    setProssimeVerifiche(verificheData || [])
    setLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="card-title" style={{ fontSize: '1.5rem' }}>
            👋 Benvenuto, {user?.nome || 'Utente'}!
          </h1>
          <p className="text-secondary">
            Dashboard della classe - Accesso rapido alle risorse
          </p>
        </div>

        {/* Accesso Rapido */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2.5rem' 
        }}>
          <Link to="/compiti" className="card quick-access" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              Compiti
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
              Visualizza e gestisci i compiti della classe
            </p>
          </Link>

          <Link to="/appunti" className="card quick-access" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📓</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              Appunti
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
              Visualizza e gestisci gli appunti della classe
            </p>
          </Link>

          <Link to="/verifiche" className="card quick-access" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              Verifiche
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
              Calendario delle verifiche programmate
            </p>
          </Link>

          <Link to="/calendario" className="card quick-access" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              Calendario
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
              Vista mensile di compiti e verifiche
            </p>
          </Link>
        </div>

        {/* Prossime Verifiche */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1rem' 
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              📋 Prossime Verifiche
            </h2>
            <Link to="/verifiche" className="text-link" style={{ fontSize: '0.9rem' }}>
              Vedi tutte →
            </Link>
          </div>

          {loading ? (
            <p className="text-secondary">Caricamento...</p>
          ) : prossimeVerifiche.length === 0 ? (
            <div className="card empty-state">
              Nessuna verifica programmata.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {prossimeVerifiche.map((v) => (
                <Link 
                  key={v.id} 
                  to={`/verifiche/${v.id}`} 
                  className="card list-item" 
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'start' 
                  }}>
                    <span className="badge badge-danger">{v.materia}</span>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--brand-danger)', 
                      fontWeight: '600' 
                    }}>
                      📅 {v.data}
                    </span>
                  </div>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    margin: '0.5rem 0 0.25rem 0' 
                  }}>
                    {v.argomento || 'Verifica'}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Ultimi Compiti */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1rem' 
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>
               Ultimi Compiti
            </h2>
            <Link to="/compiti" className="text-link" style={{ fontSize: '0.9rem' }}>
              Vedi tutti →
            </Link>
          </div>

          {loading ? (
            <p className="text-secondary">Caricamento...</p>
          ) : ultimiCompiti.length === 0 ? (
            <div className="card empty-state">
              Nessun compito trovato.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ultimiCompiti.map((c) => (
                <Link 
                  key={c.id} 
                  to={`/compiti/${c.id}`} 
                  className="card list-item" 
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'start' 
                  }}>
                    <span className="badge badge-primary">{c.materia}</span>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--text-secondary)', 
                      fontWeight: '600' 
                    }}>
                       {c.data_consegna}
                    </span>
                  </div>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    margin: '0.5rem 0 0.25rem 0' 
                  }}>
                    {c.richiesta}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Ultimi Appunti */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1rem' 
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              📓 Ultimi Appunti
            </h2>
            <Link to="/appunti" className="text-link" style={{ fontSize: '0.9rem' }}>
              Vedi tutti →
            </Link>
          </div>

          {loading ? (
            <p className="text-secondary">Caricamento...</p>
          ) : ultimiAppunti.length === 0 ? (
            <div className="card empty-state">
              Nessun appunto trovato.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ultimiAppunti.map((a) => (
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
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    margin: '0.5rem 0 0.25rem 0' 
                  }}>
                    {a.argomento}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}