import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Privacy() {
  return (
    <div>
      <Navbar />
      <div className="legal-container">
        <Link to="/impostazioni" className="text-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Torna alle Impostazioni</Link>
        
        <div className="legal-header">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-update">Ultimo aggiornamento: <span className="placeholder-box">[INSERISCI DATA, es. 24 Ottobre 2023]</span></p>
        </div>

        <div className="legal-section">
          <h2>1. Titolare del Trattamento</h2>
          <p className="legal-text">
            Il Titolare del trattamento dei dati è <span className="placeholder-box">[NOME DEL TITOLARE, es. Prof. Mario Rossi / Nome della Scuola]</span>, 
            con sede in <span className="placeholder-box">[INDIRIZZO COMPLETO]</span>. 
            Per qualsiasi domanda relativa alla privacy, è possibile contattare il Titolare all'indirizzo email: 
            <span className="placeholder-box"> [EMAIL DI CONTATTO, es. privacy@scuola.it]</span>.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Tipologia di Dati Raccolti</h2>
          <p className="legal-text">L'applicazione raccoglie i seguenti dati personali:</p>
          <ul className="legal-list">
            <li><strong>Dati di registrazione:</strong> Nome visualizzato e un indirizzo email fittizio di sistema generato automaticamente.</li>
            <li><strong>Dati di utilizzo:</strong> Compiti, appunti, verifiche e richieste create o condivise all'interno della piattaforma.</li>
            <li><strong>File e Allegati:</strong> Immagini o documenti caricati dagli utenti per rispondere alle richieste o completare i compiti.</li>
            <li><strong>Preferenze:</strong> Impostazioni relative alle notifiche push e all'autenticazione a due fattori (2FA).</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Finalità del Trattamento</h2>
          <p className="legal-text">
            I dati sono raccolti ed elaborati esclusivamente per finalità educative e organizzative, nello specifico:
          </p>
          <ul className="legal-list">
            <li>Consentire la collaborazione e la condivisione di materiale didattico tra gli studenti della classe.</li>
            <li>Gestire le scadenze dei compiti e il calendario delle verifiche.</li>
            <li>Garantire la sicurezza dell'account tramite funzionalità opzionali come la 2FA.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. Conservazione dei Dati</h2>
          <p className="legal-text">
            I dati personali saranno conservati per il tempo strettamente necessario al raggiungimento delle finalità sopra indicate, 
            e comunque non oltre la fine dell'anno scolastico in corso, salvo diverso obbligo di legge. 
            Gli account inattivi per oltre <span className="placeholder-box">[NUMERO, es. 12]</span> mesi potranno essere soggetti a cancellazione automatica.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. I Tuoi Diritti (GDPR)</h2>
          <p className="legal-text">
            In conformità al Regolamento Generale sulla Protezione dei Dati (GDPR), hai il diritto di:
          </p>
          <ul className="legal-list">
            <li>Accedere ai tuoi dati personali e richiederne una copia (puoi usare la funzione "Esporta i miei dati" nelle Impostazioni).</li>
            <li>Richiedere la rettifica di dati inesatti o incompleti (modificando il tuo profilo).</li>
            <li>Richiedere la cancellazione dei tuoi dati (contattando il Titolare o eliminando i tuoi contenuti).</li>
            <li>Revocare il consenso al trattamento in qualsiasi momento.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}