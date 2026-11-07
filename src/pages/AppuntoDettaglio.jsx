import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import GalleriaAllegati from '../components/GalleriaAllegati'
import UploadFoto from '../components/UploadFoto'

export default function AppuntoDettaglio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [appunto, setAppunto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshGallery, setRefreshGallery] = useState(0)

  useEffect(() => {
    fetchAppunto()
  }, [id])

  async function fetchAppunto() {
    const { data, error } = await supabase
      .from('appunti')
      .select('*, profiles(nome)')
      .eq('id', id)
      .single()
    
    if (!error) setAppunto(data)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questo appunto?')) return
    
    try {
      const { data: allegati } = await supabase
        .from('allegati')
        .select('storage_path')
        .eq('appunto_id', id)
      
      if (allegati && allegati.length > 0) {
        const paths = allegati.map(a => a.storage_path)
        await supabase.storage.from('allegati').remove(paths)
      }

      const { error } = await supabase.from('appunti').delete().eq('id', id)
      
      if (error) {
        console.error('Errore eliminazione:', error)
        alert('Errore: ' + error.message)
      } else {
        navigate('/appunti')
      }
    } catch (err) {
      console.error('Errore imprevisto:', err)
      alert('Si è verificato un errore imprevisto.')
    }
  }

  function handleUploadSuccess() {
    setRefreshGallery(prev => prev + 1)
    fetchAppunto()
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
  
  if (!appunto) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{paddingTop: '2rem'}}>
          Appunto non trovato.
        </div>
      </div>
    )
  }

  const canDelete = user?.ruolo === 'admin' || user?.id === appunto.creato_da

  return (
    <div>
      <Navbar />
      <div className="container" style={{ 
        paddingTop: '2rem', 
        paddingBottom: '4rem', 
        maxWidth: '800px' 
      }}>
        <Link to="/appunti" className="text-link" style={{ 
          marginBottom: '1rem', 
          display: 'inline-block' 
        }}>
          ← Torna agli appunti
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
              {appunto.materia}
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
            {appunto.argomento}
          </h1>
          
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            marginBottom: '1rem', 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            flexWrap: 'wrap'
          }}>
            {appunto.data_lezione && (
              <span>
                📅 Lezione del: <strong>{appunto.data_lezione}</strong>
              </span>
            )}
            <span>
              👤 Inserito da: {appunto.profiles?.nome || 'Sconosciuto'}
            </span>
          </div>

          {appunto.descrizione && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'var(--bg-accent)', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.95rem',
              whiteSpace: 'pre-wrap'
            }}>
              {appunto.descrizione}
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