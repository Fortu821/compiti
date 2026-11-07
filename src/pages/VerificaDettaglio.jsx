import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function VerificaDettaglio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [verifica, setVerifica] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVerifica()
  }, [id])

  async function fetchVerifica() {
    const { data, error } = await supabase
      .from('verifiche')
      .select('*, profiles(nome)')
      .eq('id', id)
      .single()
    
    if (!error) setVerifica(data)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questa verifica?')) return
    
    try {
      const { error } = await supabase.from('verifiche').delete().eq('id', id)
      
      if (error) {
        console.error('Errore eliminazione:', error)
        alert('Errore: ' + error.message)
      } else {
        navigate('/verifiche')
      }
    } catch (err) {
      console.error('Errore imprevisto:', err)
      alert('Si è verificato un errore imprevisto.')
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{paddingTop: '2rem', textAlign: 'center'}}>
          Caricamento...
        </div>
      </div>
    )
  }
  
  if (!verifica) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{paddingTop: '2rem'}}>
          Verifica non trovata.
        </div>
      </div>
    )
  }

  const canDelete = user?.ruolo === 'admin' || user?.id === verifica.creato_da
  const dataVerifica = new Date(verifica.data)
  const oggi = new Date()
  const isPassata = dataVerifica < oggi.setHours(0,0,0,0)

  return (
    <div>
      <Navbar />
      <div className="container" style={{ 
        paddingTop: '2rem', 
        paddingBottom: '4rem', 
        maxWidth: '800px' 
      }}>
        <Link to="/verifiche" className="text-link" style={{ 
          marginBottom: '1rem', 
          display: 'inline-block' 
        }}>
          ← Torna alle verifiche
        </Link>
        
        <div className="card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'start' 
          }}>
            <span className="badge badge-danger" style={{ 
              fontSize: '0.9rem', 
              padding: '0.4rem 0.8rem' 
            }}>
              {verifica.materia}
            </span>
            {canDelete && (
              <button 
                onClick={handleDelete} 
                className="btn btn-danger btn-sm"
              >
                🗑️ Elimina
              </button>
            )}
          </div>
          
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            margin: '1rem 0 0.5rem 0', 
            color: 'var(--brand-primary)' 
          }}>
            {verifica.argomento || 'Verifica di ' + verifica.materia}
          </h1>
          
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            marginBottom: '1rem', 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            flexWrap: 'wrap'
          }}>
            <span>
              📅 Data: <strong style={{ 
                color: isPassata ? 'var(--text-secondary)' : 'var(--brand-danger)' 
              }}>
                {verifica.data} {isPassata && '(passata)'}
              </strong>
            </span>
            <span>
              👤 Inserito da: {verifica.profiles?.nome || 'Sconosciuto'}
            </span>
          </div>

          {verifica.descrizione && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'var(--bg-accent)', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.95rem',
              whiteSpace: 'pre-wrap'
            }}>
              <strong>Note:</strong> {verifica.descrizione}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}