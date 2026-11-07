import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import UpvoteButton from '../components/UpvoteButton'
import imageCompression from 'browser-image-compression'

export default function RichiestaDettaglio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [richiesta, setRichiesta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rispondendo, setRispondendo] = useState(false)
  const [file, setFile] = useState(null)

  useEffect(() => { fetchRichiesta() }, [id])

  async function fetchRichiesta() {
    const { data, error } = await supabase.from('richieste').select('*, profiles:creato_da(nome), upvotes(count)').eq('id', id).single()
    if (!error) setRichiesta(data)
    setLoading(false)
  }

  async function handleRispondi(e) {
    e.preventDefault()
    if (!file) { alert('Seleziona un file da allegare per rispondere.'); return }

    setRispondendo(true)
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }
      const compressedFile = await imageCompression(file, options)
      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${user.id}/${id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from('allegati').upload(filePath, compressedFile, { contentType: compressedFile.type })
      if (uploadError) throw uploadError

      const { data: rpcResult, error: rpcError } = await supabase.rpc('rispondi_richiesta', {
        p_richiesta_id: id,
        p_storage_path: filePath,
        p_tipo_file: compressedFile.type
      })
      if (rpcError) throw rpcError

      // 🚀 INVIA NOTIFICA TELEGRAM A TUTTI
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'risposta_richiesta',
            title: 'Richiesta Soddisfatta',
            body: `Qualcuno ha risposto alla richiesta di ${richiesta.materia}.`,
            materia: richiesta.materia,
            link: `${window.location.origin}/${richiesta.tipologia === 'compiti' ? 'compiti' : 'appunti'}/${rpcResult.nuovo_id}`
          }
        })
      } catch (err) {
        console.error('Errore notifica:', err)
      }

      alert('Richiesta soddisfatta con successo!')
      const nuovoId = rpcResult.nuovo_id
      const percorso = richiesta.tipologia === 'compiti' ? `/compiti/${nuovoId}` : `/appunti/${nuovoId}`
      navigate(percorso)

    } catch (error) {
      console.error('Errore risposta:', error)
      alert('Errore durante la risposta: ' + error.message)
    } finally {
      setRispondendo(false)
    }
  }

  if (loading) return <div><Navbar /><div className="container" style={{paddingTop: '2rem'}}>Caricamento...</div></div>
  if (!richiesta) return <div><Navbar /><div className="container" style={{paddingTop: '2rem'}}>Non trovata.</div></div>

  const upvoteCount = richiesta.upvotes?.[0]?.count || 0

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px' }}>
        <Link to="/richieste" className="text-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Torna alle richieste</Link>
        
        <div className="card request-card" style={{ marginBottom: '2rem' }}>
          <UpvoteButton richiestaId={id} initialCount={upvoteCount} />
          <div className="request-content">
            <span className={`status-badge status-${richiesta.stato}`}>{richiesta.stato === 'aperta' ? '🟡 Aperta' : '🟢 Completata'}</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0.5rem 0', color: 'var(--brand-primary)' }}>
              {richiesta.argomento || `Richiesta di ${richiesta.tipologia}`}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{richiesta.materia}</span>
              <span>👤 {richiesta.profiles?.nome || 'Sconosciuto'}</span>
              {richiesta.data && <span>📅 {richiesta.data}</span>}
            </div>
          </div>
        </div>

        {richiesta.stato === 'aperta' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">💡 Rispondi a questa richiesta</h2>
              <p className="card-description">Carica la foto o il file. Il sistema creerà automaticamente la voce e archiverà questa richiesta.</p>
            </div>
            <form onSubmit={handleRispondi} className="auth-form">
              <div className="form-group">
                <label className="form-label">Allega file (Foto, PDF, ecc.) *</label>
                <input type="file" className="input" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={rispondendo} style={{ marginTop: '1rem' }}>
                {rispondendo ? 'Elaborazione e creazione in corso...' : 'Invia Risposta e Chiudi Richiesta'}
              </button>
            </form>
          </div>
        )}

        {richiesta.stato === 'completata' && (
          <div className="card" style={{ backgroundColor: 'var(--bg-accent)', border: '1px solid var(--brand-success)' }}>
            <h3 style={{ color: 'var(--brand-success)', marginBottom: '0.5rem' }}>✅ Questa richiesta è stata soddisfatta!</h3>
            <p className="setting-desc">È stato creato un nuovo {richiesta.tipologia === 'compiti' ? 'compito' : 'appunto'} con gli allegati forniti.</p>
            <Link to={`/${richiesta.tipologia === 'compiti' ? 'compiti' : 'appunti'}/${richiesta.compito_generato_id || richiesta.appunto_generato_id}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Vai al {richiesta.tipologia === 'compiti' ? 'Compito' : 'Appunto'} creato
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}