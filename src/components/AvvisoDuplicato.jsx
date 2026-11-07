export default function AvvisoDuplicato({ onAnnulla, onConferma }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>
          ⚠️ Compito simile già esistente
        </h3>
        <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
          Esiste già un compito per questa materia nella stessa data.
          Vuoi crearlo comunque o vuoi annullare?
        </p>
        <div className="modal-actions">
          <button onClick={onAnnulla} className="btn btn-secondary">
            Annulla
          </button>
          <button onClick={onConferma} className="btn btn-primary">
            Crea comunque
          </button>
        </div>
      </div>
    </div>
  )
}