import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function GalleriaAllegati({ entityId, refreshTrigger }) {
  const { user } = useAuth()
  const [allegati, setAllegati] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchAllegati() {
    setLoading(true)
    const { data, error } = await supabase
      .from('allegati')
      .select('*')
      .eq('compito_id', entityId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const allegatiConUrl = await Promise.all(
        data.map(async (a) => {
          const { data: urlData } = await supabase.storage
            .from('allegati')
            .createSignedUrl(a.storage_path, 3600)
          return { ...a, signedUrl: urlData?.signedUrl }
        })
      )
      setAllegati(allegatiConUrl)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAllegati()
  }, [entityId])

  useEffect(() => {
    if (refreshTrigger) {
      fetchAllegati()
    }
  }, [refreshTrigger])

  async function handleDelete(allegato) {
    if (!confirm('Sei sicuro di voler eliminare questa foto?')) return

    try {
      // 1. Elimina dal DB
      const { error: dbError } = await supabase
        .from('allegati')
        .delete()
        .eq('id', allegato.id)
      
      if (dbError) {
        console.error('Errore DB eliminazione allegato:', dbError)
        if (dbError.code === '42501') {
          alert('Non hai i permessi per eliminare questo allegato.')
        } else {
          alert('Errore: ' + dbError.message)
        }
        return
      }

      // 2. Elimina dallo Storage
      await supabase.storage.from('allegati').remove([allegato.storage_path])
      
      fetchAllegati()
    } catch (err) {
      console.error('Errore imprevisto:', err)
      alert('Si è verificato un errore imprevisto.')
    }
  }

  if (loading) return <p className="text-secondary">Caricamento galleria...</p>

  return (
    <div>
      <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
        📎 Allegati ({allegati.length})
      </h3>
      {allegati.length === 0 ? (
        <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
          Nessuna foto allegata.
        </p>
      ) : (
        <div className="image-grid">
          {allegati.map((a) => (
            <div key={a.id} className="image-card">
              <img src={a.signedUrl} alt="Allegato" />
              {(user?.id === a.uploaded_by || user?.ruolo === 'admin') && (
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(a)}
                  title="Elimina"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}