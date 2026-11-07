import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import CompitiList from './pages/CompitiList'
import CompitoNuovo from './pages/CompitoNuovo'
import CompitoDettaglio from './pages/CompitoDettaglio'
import AppuntiList from './pages/AppuntiList'
import AppuntoNuovo from './pages/AppuntoNuovo'
import AppuntoDettaglio from './pages/AppuntoDettaglio'
import VerificheList from './pages/VerificheList'
import VerificaNuova from './pages/VerificaNuova'
import VerificaDettaglio from './pages/VerificaDettaglio'
import Calendario from './pages/Calendario'
import RichiesteList from './pages/RichiesteList'
import RichiestaNuova from './pages/RichiestaNuova'
import RichiestaDettaglio from './pages/RichiestaDettaglio'
import RichiesteArchivio from './pages/RichiesteArchivio'
import Impostazioni from './pages/Impostazioni'
// NUOVI IMPORT PER LE PAGINE LEGALI
import Privacy from './pages/Privacy'
import Cookie from './pages/Cookie'
import Termini from './pages/Termini'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="auth-layout"><div className="card text-center">Caricamento...</div></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      <Route path="/compiti" element={<ProtectedRoute><CompitiList /></ProtectedRoute>} />
      <Route path="/compiti/nuovo" element={<ProtectedRoute><CompitoNuovo /></ProtectedRoute>} />
      <Route path="/compiti/:id" element={<ProtectedRoute><CompitoDettaglio /></ProtectedRoute>} />
      
      <Route path="/appunti" element={<ProtectedRoute><AppuntiList /></ProtectedRoute>} />
      <Route path="/appunti/nuovo" element={<ProtectedRoute><AppuntoNuovo /></ProtectedRoute>} />
      <Route path="/appunti/:id" element={<ProtectedRoute><AppuntoDettaglio /></ProtectedRoute>} />
      
      <Route path="/verifiche" element={<ProtectedRoute><VerificheList /></ProtectedRoute>} />
      <Route path="/verifiche/nuova" element={<ProtectedRoute><VerificaNuova /></ProtectedRoute>} />
      <Route path="/verifiche/:id" element={<ProtectedRoute><VerificaDettaglio /></ProtectedRoute>} />
      
      <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />

      <Route path="/richieste" element={<ProtectedRoute><RichiesteList /></ProtectedRoute>} />
      <Route path="/richieste/nuova" element={<ProtectedRoute><RichiestaNuova /></ProtectedRoute>} />
      <Route path="/richieste/:id" element={<ProtectedRoute><RichiestaDettaglio /></ProtectedRoute>} />
      <Route path="/richieste/archivio" element={<ProtectedRoute><RichiesteArchivio /></ProtectedRoute>} />

      <Route path="/impostazioni" element={<ProtectedRoute><Impostazioni /></ProtectedRoute>} />
      
      {/* ROTTE PUBBLICHE PER LE PAGINE LEGALI (non richiedono ProtectedRoute) */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/cookie" element={<Cookie />} />
      <Route path="/termini" element={<Termini />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
export default App