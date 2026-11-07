import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function RichiesteArchivio() {
  const [richieste, setRichieste] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArchivio()
  }, [])

  async function fetchArchivio() {
    const { data } = await supabase
      .from('richieste')
      .select('id, tipologia, materia, argomento, completata_at')
      .eq('stato', 'completata')
      .order('completata_at', { ascending: false })
      .limit(20)

    setRichieste(data || [])
    setLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="card-title" style={{ fontSize: '1.5rem' }}>🗄️ Archivio Richieste</h1>
          <Link to="/richieste" className="text-link" style={{ fontSize: '0.9rem' }}>← Torna alle richieste aperte</Link>
        </div>

        {loading ? (
          <p className="text-secondary">Caricamento...</p>
        ) : richieste.length === 0 ? (
          <div className="card empty-state">Nessuna richiesta completata in archivio.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {richieste.map((r) => (
              <Link key={r.id} to={`/richieste/${r.id}`} className="card list-item" style={{ textDecoration: 'none', color: 'inherit', opacity: 0.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-success">Completata</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {r.completata_at ? new Date(r.completata_at).toLocaleDateString('it-IT') : ''}
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0.5rem 0' }}>
                  {r.materia}: {r.argomento || `Richiesta di ${r.tipologia}`}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}