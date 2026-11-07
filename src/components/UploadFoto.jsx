import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import imageCompression from 'browser-image-compression'

export default function UploadFoto({ entityId, onUploadSuccess }) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const options = { 
        maxSizeMB: 1, 
        maxWidthOrHeight: 1920, 
        useWebWorker: true 
      }
      const compressedFile = await imageCompression(file, options)

      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${user.id}/${entityId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('allegati')
        .upload(filePath, compressedFile, { 
          contentType: compressedFile.type,
          upsert: false 
        })

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase
        .from('allegati')
        .insert({
          storage_path: filePath,
          tipo_file: compressedFile.type,
          uploaded_by: user.id,
          compito_id: entityId
        })

      if (dbError) throw dbError

      // Reset input
      e.target.value = ''
      
      // Chiama callback per refresh
      if (onUploadSuccess) onUploadSuccess()
      
    } catch (error) {
      console.error('Errore upload:', error)
      alert('Errore durante il caricamento: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-zone" style={{ position: 'relative' }}>
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        onChange={handleFileChange} 
        disabled={uploading}
        style={{ 
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          opacity: 0,
          cursor: 'pointer'
        }} 
      />
      <div style={{ pointerEvents: 'none' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
        <p style={{ fontWeight: '600', color: 'var(--brand-primary)', marginBottom: '0.25rem' }}>
          {uploading ? 'Caricamento...' : 'Tocca per scattare o caricare'}
        </p>
        <p className="form-hint" style={{ margin: 0 }}>
          Max 1MB • Compressione automatica
        </p>
      </div>
    </div>
  )
}