import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import GalleriaAllegati from '../components/GalleriaAllegati'
import UploadFoto from '../components/UploadFoto'

export default function CompitoDettaglio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [compito, setCompito] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshGallery, setRefreshGallery] = useState(0)

  useEffect(() => {
    fetchCompito()
  }, [id])

  async function fetchCompito() {
    const { data, error } = await supabase
      .from('compiti')
      .select('*, profiles(nome)')
      .eq('id', id)
      .single()
    
    if (!error) setCompito(data)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questo compito?')) return
    
    try {
      // 1. Prendi gli allegati per eliminarli anche dallo storage
      const { data: allegati } = await supabase
        .from('allegati')
        .select('storage_path')
        .eq('compito_id', id)
      
      if (allegati && allegati.length > 0) {
        const paths = allegati.map(a => a.storage_path)
        await supabase.storage.from('allegati').remove(paths)
      }

      // 2. Elimina il compito
      const { error } = await supabase.from('compiti').delete().eq('id', id)
      
      if (error) {
        console.error('Errore eliminazione compito:', error)
        if (error.code === '42501') {
          alert('Non hai i permessi per eliminare questo compito.')
        } else {
          alert('Errore: ' + error.message)
        }
      } else {
        navigate('/compiti')
      }
    } catch (err) {
      console.error('Errore imprevisto:', err)
      alert('Si è verificato un errore imprevisto.')
    }
  }

  function handleUploadSuccess() {
    setRefreshGallery(prev => prev + 1)
    fetchCompito()
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
  
  if (!compito) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{paddingTop: '2rem'}}>
          Compito non trovato.
        </div>
      </div>
    )
  }

  // Mostra il pulsante elimina se l'utente è admin O è il creatore del compito
  const canDelete = user?.ruolo === 'admin' || user?.id === compito.creato_da

  return (
    <div>
      <Navbar />
      <div className="container" style={{ 
        paddingTop: '2rem', 
        paddingBottom: '4rem', 
        maxWidth: '800px' 
      }}>
        <Link to="/compiti" className="text-link" style={{ 
          marginBottom: '1rem', 
          display: 'inline-block' 
        }}>
          ← Torna ai compiti
        </Link>
        
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'start' 
          }}>
            <span className="badge badge-primary" style={{ 
              fontSize: '0.9rem', 
              padding: '0.4rem 0.8rem' 
            }}>
              {compito.materia}
            </span>
            {canDelete && (
              <button 
                onClick={handleDelete} 
                className="btn btn-danger btn-sm"
              >
                ️ Elimina
              </button>
            )}
          </div>
          
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            margin: '1rem 0 0.5rem 0', 
            color: 'var(--brand-primary)' 
          }}>
            {compito.richiesta}
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
              📅 Consegna: <strong style={{ color: 'var(--brand-danger)' }}>
                {compito.data_consegna}
              </strong>
            </span>
            <span>
              👤 Inserito da: {compito.profiles?.nome || 'Sconosciuto'}
            </span>
          </div>

          {compito.descrizione && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'var(--bg-accent)', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.95rem' 
            }}>
              <strong>Note:</strong> {compito.descrizione}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📎 Foto e Allegati</h2>
          </div>
          
          <UploadFoto 
            entityId={id} 
            onUploadSuccess={handleUploadSuccess} 
          />
          
          <div style={{ marginTop: '2rem' }}>
            <GalleriaAllegati 
              entityId={id} 
              refreshTrigger={refreshGallery}
            />
          </div>
        </div>
      </div>
    </div>
  )
}