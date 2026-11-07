import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Cookie() {
  return (
    <div>
      <Navbar />
      <div className="legal-container">
        <Link to="/impostazioni" className="text-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Torna alle Impostazioni</Link>
        
        <div className="legal-header">
          <h1 className="legal-title">Cookie Policy</h1>
          <p className="legal-update">Ultimo aggiornamento: <span className="placeholder-box">[INSERISCI DATA]</span></p>
        </div>

        <div className="legal-section">
          <h2>1. Cosa sono i Cookie</h2>
          <p className="legal-text">
            I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo (computer, tablet o smartphone) 
            quando li visiti. Servono a far funzionare il sito in modo efficiente e a fornire informazioni al proprietario del sito.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Cookie Utilizzati da Questa Applicazione</h2>
          <p className="legal-text">
            Questa applicazione utilizza <strong>esclusivamente cookie tecnici essenziali</strong>. 
            Non utilizziamo cookie di profilazione, cookie di terze parti per scopi di marketing, né tracker pubblicitari.
          </p>
          <ul className="legal-list">
            <li>
              <strong>Cookie di Autenticazione (Supabase):</strong> 
              Necessari per mantenere la tua sessione attiva e permetterti di navigare nell'app senza dover effettuare il login a ogni pagina. 
              Questi cookie sono gestiti in modo sicuro e scadono automaticamente.
            </li>
            <li>
              <strong>Cookie di Preferenze (Local Storage):</strong> 
              Utilizzati per memorizzare temporaneamente alcune impostazioni del browser (come lo stato del tema, se attivato in futuro) 
              per migliorare l'esperienza utente. Nessun dato viene inviato a server esterni.
            </li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Come Gestire i Cookie</h2>
          <p className="legal-text">
            Poiché utilizziamo solo cookie tecnici essenziali per il funzionamento del servizio, 
            non è richiesto un banner di consenso preventivo. Tuttavia, puoi gestire o disabilitare i cookie 
            direttamente dalle impostazioni del tuo browser (Chrome, Safari, Firefox, Edge, ecc.). 
            <br/><br/>
            <em>Nota: La disabilitazione dei cookie tecnici potrebbe compromettere il funzionamento dell'applicazione, 
            impedendoti di effettuare l'accesso.</em>
          </p>
        </div>

        <div className="legal-section">
          <h2>4. Contatti</h2>
          <p className="legal-text">
            Per qualsiasi chiarimento riguardo all'uso dei cookie, puoi contattare il Titolare all'indirizzo: 
            <span className="placeholder-box"> [EMAIL DI CONTATTO]</span>.
          </p>
        </div>
      </div>
    </div>
  )
}