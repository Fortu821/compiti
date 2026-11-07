import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function Calendario() {
  const [eventi, setEventi] = useState([])
  const [meseCorrente, setMeseCorrente] = useState(new Date())
  const [filtroTipo, setFiltroTipo] = useState('tutti')
  const [filtroMateria, setFiltroMateria] = useState('tutte')
  const [materie, setMaterie] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEventi()
  }, [filtroTipo, filtroMateria])

  async function fetchEventi() {
    setLoading(true)
    
    // Fetch compiti
    const { data: compiti } = await supabase
      .from('compiti')
      .select('id, materia, richiesta, data_consegna')
    
    // Fetch verifiche
    const { data: verifiche } = await supabase
      .from('verifiche')
      .select('id, materia, argomento, data')
    
    // Combina e filtra
    let tuttiEventi = [
      ...(compiti || []).map(c => ({
        id: c.id,
        tipo: 'compito',
        materia: c.materia,
        titolo: c.richiesta,
        data: c.data_consegna
      })),
      ...(verifiche || []).map(v => ({
        id: v.id,
        tipo: 'verifica',
        materia: v.materia,
        titolo: v.argomento || 'Verifica',
        data: v.data
      }))
    ]

    // Applica filtri
    if (filtroTipo !== 'tutti') {
      tuttiEventi = tuttiEventi.filter(e => e.tipo === filtroTipo)
    }
    if (filtroMateria !== 'tutte') {
      tuttiEventi = tuttiEventi.filter(e => e.materia === filtroMateria)
    }

    setEventi(tuttiEventi)
    
    // Estrai materie uniche
    const tutteMaterie = [...new Set(tuttiEventi.map(e => e.materia))]
    setMaterie(tutteMaterie)
    
    setLoading(false)
  }

  function cambiaMese(delta) {
    const nuovoMese = new Date(meseCorrente)
    nuovoMese.setMonth(nuovoMese.getMonth() + delta)
    setMeseCorrente(nuovoMese)
  }

  function getGiorniMese() {
    const anno = meseCorrente.getFullYear()
    const mese = meseCorrente.getMonth()
    const primoGiorno = new Date(anno, mese, 1)
    const ultimoGiorno = new Date(anno, mese + 1, 0)
    const giorniNelMese = ultimoGiorno.getDate()
    const giornoSettimanaInizio = primoGiorno.getDay()
    
    const giorni = []
    for (let i = 0; i < giornoSettimanaInizio; i++) {
      giorni.push(null)
    }
    for (let i = 1; i <= giorniNelMese; i++) {
      giorni.push(i)
    }
    return giorni
  }

  function getEventiPerGiorno(giorno) {
    if (!giorno) return []
    const anno = meseCorrente.getFullYear()
    const mese = String(meseCorrente.getMonth() + 1).padStart(2, '0')
    const giornoStr = String(giorno).padStart(2, '0')
    const dataStr = `${anno}-${mese}-${giornoStr}`
    
    return eventi.filter(e => e.data === dataStr)
  }

  const giorni = getGiorniMese()
  const nomiGiorni = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
  const nomeMese = meseCorrente.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
           Calendario Classe
        </h1>

        {/* Filtri */}
        <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
          <select 
            className="select-input" 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="tutti">Tutti i tipi</option>
            <option value="compito">Solo compiti</option>
            <option value="verifica">Solo verifiche</option>
          </select>

          <select 
            className="select-input" 
            value={filtroMateria} 
            onChange={(e) => setFiltroMateria(e.target.value)}
          >
            <option value="tutte">Tutte le materie</option>
            {materie.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Calendario */}
        <div className="card" style={{ padding: '1.5rem' }}>
          {/* Header calendario */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem' 
          }}>
            <button 
              onClick={() => cambiaMese(-1)} 
              className="btn btn-secondary btn-sm"
            >
              ← Mese prec.
            </button>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              textTransform: 'capitalize',
              color: 'var(--brand-primary)'
            }}>
              {nomeMese}
            </h2>
            <button 
              onClick={() => cambiaMese(1)} 
              className="btn btn-secondary btn-sm"
            >
              Mese succ. →
            </button>
          </div>

          {/* Griglia giorni */}
          {loading ? (
            <p className="text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>
              Caricamento...
            </p>
          ) : (
            <div>
              {/* Nomi giorni */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                {nomiGiorni.map(g => (
                  <div key={g} style={{ 
                    textAlign: 'center', 
                    fontWeight: '600', 
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    padding: '0.5rem'
                  }}>
                    {g}
                  </div>
                ))}
              </div>

              {/* Giorni del mese */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '0.5rem'
              }}>
                {giorni.map((giorno, idx) => {
                  const eventiGiorno = getEventiPerGiorno(giorno)
                  const isOggi = giorno === new Date().getDate() && 
                                 meseCorrente.getMonth() === new Date().getMonth() &&
                                 meseCorrente.getFullYear() === new Date().getFullYear()
                  
                  return (
                    <div 
                      key={idx}
                      style={{ 
                        minHeight: '80px',
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isOggi ? 'var(--bg-accent)' : 'var(--bg-secondary)',
                        position: 'relative'
                      }}
                    >
                      {giorno && (
                        <>
                          <div style={{ 
                            fontWeight: '600', 
                            fontSize: '0.9rem',
                            marginBottom: '0.25rem',
                            color: isOggi ? 'var(--brand-primary)' : 'var(--text-primary)'
                          }}>
                            {giorno}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {eventiGiorno.slice(0, 3).map((evento, eIdx) => (
                              <Link
                                key={eIdx}
                                to={`/${evento.tipo === 'compito' ? 'compiti' : 'verifiche'}/${evento.id}`}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '0.2rem 0.4rem',
                                  borderRadius: '3px',
                                  backgroundColor: evento.tipo === 'compito' 
                                    ? 'var(--brand-primary)' 
                                    : 'var(--brand-danger)',
                                  color: 'white',
                                  textDecoration: 'none',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={evento.titolo}
                              >
                                {evento.materia}
                              </Link>
                            ))}
                            {eventiGiorno.length > 3 && (
                              <div style={{ 
                                fontSize: '0.7rem', 
                                color: 'var(--text-secondary)',
                                textAlign: 'center'
                              }}>
                                +{eventiGiorno.length - 3} altri
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Legenda */}
        <div style={{ 
          marginTop: '1.5rem', 
          display: 'flex', 
          gap: '1.5rem',
          justifyContent: 'center',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: 'var(--brand-primary)',
              borderRadius: '3px'
            }}></div>
            <span>Compiti</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: 'var(--brand-danger)',
              borderRadius: '3px'
            }}></div>
            <span>Verifiche</span>
          </div>
        </div>
      </div>
    </div>
  )
}