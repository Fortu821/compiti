import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import UpvoteButton from '../components/UpvoteButton'

export default function RichiesteList() {
  const [richieste, setRichieste] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRichieste()
  }, [])

  async function fetchRichieste() {
    // Prendiamo le richieste aperte, ordinate per upvote (tramite join) o data
    const { data, error } = await supabase
      .from('richieste')
      .select(`
        id, tipologia, materia, data, argomento, stato, created_at,
        upvotes(count)
      `)
      .eq('stato', 'aperta')
      .order('created_at', { ascending: false })

    if (!error) {
      // Ordiniamo manualmente per conteggio upvote decrescente
      const sorted = (data || []).sort((a, b) => {
        const countA = a.upvotes?.[0]?.count || 0
        const countB = b.upvotes?.[0]?.count || 0
        return countB - countA
      })
      setRichieste(sorted)
    }
    setLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 className="card-title" style={{ fontSize: '1.5rem' }}>🙋 Richieste Aperte</h1>
            <Link to="/richieste/archivio" className="text-link" style={{ fontSize: '0.9rem' }}>Vedi archivio completate →</Link>
          </div>
          <Link to="/richieste/nuova" className="btn btn-primary">+ Nuova Richiesta</Link>
        </div>

        {loading ? (
          <p className="text-secondary">Caricamento...</p>
        ) : richieste.length === 0 ? (
          <div className="card empty-state">Nessuna richiesta aperta. La classe è organizzata! 🎉</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {richieste.map((r) => {
              const upvoteCount = r.upvotes?.[0]?.count || 0
              return (
                <div key={r.id} className="card request-card">
                  <UpvoteButton richiestaId={r.id} initialCount={upvoteCount} />
                  
                  <Link to={`/richieste/${r.id}`} className="request-content" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className={`badge ${r.tipologia === 'compiti' ? 'badge-primary' : 'badge-success'}`}>
                        {r.tipologia === 'compiti' ? '📝 Compiti' : '📓 Appunti'}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.materia}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {r.argomento || `Richiesta di ${r.tipologia}`}
                    </h3>
                    {r.data && (
                      <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        📅 Riferimento data: {r.data}
                      </p>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}