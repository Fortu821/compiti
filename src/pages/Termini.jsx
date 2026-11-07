import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Termini() {
  return (
    <div>
      <Navbar />
      <div className="legal-container">
        <Link to="/impostazioni" className="text-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Torna alle Impostazioni</Link>
        
        <div className="legal-header">
          <h1 className="legal-title">Termini di Servizio (ToS)</h1>
          <p className="legal-update">Ultimo aggiornamento: <span className="placeholder-box">[INSERISCI DATA]</span></p>
        </div>

        <div className="legal-section">
          <h2>1. Accettazione dei Termini</h2>
          <p className="legal-text">
            Accedendo e utilizzando l'applicazione "Classe App", l'utente accetta di essere vincolato dai presenti Termini di Servizio. 
            Se non si accettano questi termini, si prega di non utilizzare l'applicazione.
          </p>
        </div>

        <div className="legal-section">
          <h2>2. Descrizione del Servizio</h2>
          <p className="legal-text">
            "Classe App" è una piattaforma web privata destinata esclusivamente agli studenti della classe 
            <span className="placeholder-box"> [NOME DELLA CLASSE, es. 3^A Informatica]</span> 
            dell'Istituto <span className="placeholder-box">[NOME DELLA SCUOLA]</span>. 
            Lo scopo è facilitare la condivisione di compiti, appunti, verifiche e richieste di materiale didattico.
          </p>
        </div>

        <div className="legal-section">
          <h2>3. Regole di Condotta e Utilizzo Accettabile</h2>
          <p className="legal-text">
            Gli utenti si impegnano a utilizzare la piattaforma in modo responsabile. È severamente vietato:
          </p>
          <ul className="legal-list">
            <li>Caricare o condividere contenuti offensivi, discriminatori, minacciosi o inappropriati.</li>
            <li>Utilizzare la piattaforma per atti di cyberbullismo o molestie verso altri compagni o docenti.</li>
            <li>Condividere materiale protetto da copyright senza autorizzazione (es. fotocopie integrali di libri di testo).</li>
            <li>Tentare di accedere agli account di altri utenti o compromettere la sicurezza del sistema.</li>
            <li>Utilizzare l'app per scopi commerciali o di lucro.</li>
          </ul>
          <p className="legal-text">
            Il Titolare si riserva il diritto di rimuovere qualsiasi contenuto che violi queste regole e di sospendere o terminare 
            l'accesso dell'utente responsabile, previa segnalazione.
          </p>
        </div>

        <div className="legal-section">
          <h2>4. Proprietà Intellettuale</h2>
          <p className="legal-text">
            I materiali didattici originali caricati dagli utenti rimangono di loro proprietà. Tuttavia, condividendo tali materiali 
            sulla piattaforma, l'utente concede agli altri membri della classe una licenza limitata, non esclusiva e revocabile 
            per l'uso esclusivamente personale e di studio. Il codice sorgente dell'applicazione è di proprietà di 
            <span className="placeholder-box"> [TUO NOME / SVILUPPATORE]</span>.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. Limitazione di Responsabilità</h2>
          <p className="legal-text">
            L'applicazione è fornita "così com'è" (as is). Il Titolare non garantisce che il servizio sarà ininterrotto, 
            tempestivo, sicuro o privo di errori. Non siamo responsabili per eventuali perdite di dati (si consiglia agli utenti 
            di mantenere copie di backup dei propri appunti importanti) o per danni derivanti dall'uso o dall'impossibilità di usare il servizio.
          </p>
        </div>

        <div className="legal-section">
          <h2>6. Modifiche ai Termini</h2>
          <p className="legal-text">
            Ci riserviamo il diritto di modificare questi Termini di Servizio in qualsiasi momento. Le modifiche entreranno in vigore 
            non appena pubblicate sull'applicazione. L'uso continuato della piattaforma dopo tali modifiche costituisce accettazione 
            dei nuovi termini.
          </p>
        </div>
      </div>
    </div>
  )
}