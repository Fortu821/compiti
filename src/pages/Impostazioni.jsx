import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import GithubButton from '../components/GithubButton'
import { generateFauxEmail } from '../lib/auth-utils'

// Icone SVG FontAwesome
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20" fill="currentColor"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>
const IconShield = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/></svg>
const IconBell = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20" fill="currentColor"><path d="M224 0c-17.7 0-32 14.3-32 32V51.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416H416c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.8 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"/></svg>
const IconPalette = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3H344c-26.5 0-48 21.5-48 48c0 3.4 .4 6.7 1 9.9c2.1 10.2 6.5 20 10.8 29.9c6.1 13.8 12.1 27.5 12.1 42.2c0 31.8-21.6 60.7-53.4 62c-3.5 .1-7 .2-10.5 .2C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>
const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20" fill="currentColor"><path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"/></svg>
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" fill="currentColor"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>
const IconRightFromBracket = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/></svg>
const IconFileContract = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20" fill="currentColor"><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>
const IconCookieBite = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M344 24c-13.3 0-24 10.7-24 24v8c0 13.3 10.7 24 24 24h8c13.3 0 24-10.7 24-24V48c0-13.3-10.7-24-24-24h-8zM152 72c-13.3 0-24 10.7-24 24v8c0 13.3 10.7 24 24 24h8c13.3 0 24-10.7 24-24V96c0-13.3-10.7-24-24-24h-8zm-56 88c-13.3 0-24 10.7-24 24v8c0 13.3 10.7 24 24 24h8c13.3 0 24-10.7 24-24v-8c0-13.3-10.7-24-24-24h-8zm280 16c-13.3 0-24 10.7-24 24v8c0 13.3 10.7 24 24 24h8c13.3 0 24-10.7 24-24v-8c0-13.3-10.7-24-24-24h-8zM120 280c-13.3 0-24 10.7-24 24v8c0 13.3 10.7 24 24 24h8c13.3 0 24-10.7 24-24v-8c0-13.3-10.7-24-24-24h-8zm168 40c-13.3 0-24 10.7-24 24v8c0 13.3 10.7 24 24 24h8c13.3 0 24-10.7 24-24v-8c0-13.3-10.7-24-24-24h-8zM256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0z"/></svg>
const IconScaleBalanced = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20" fill="currentColor"><path d="M384 32H512c17.7 0 32 14.3 32 32s-14.3 32-32 32H392.7l51.9 51.9c9.4 9.4 14.7 22.1 14.7 35.4V256c0 26.5-21.5 48-48 48H32c-26.5 0-48-21.5-48-48V183.3c0-13.3 5.3-26 14.7-35.4L50.6 96H24c-17.7 0-32-14.3-32-32S6.3 32 24 32H128c13.3 0 26 5.3 35.4 14.7l64 64c9.4 9.4 14.7 22.1 14.7 35.4V256c0 26.5-21.5 48-48 48H256c26.5 0 48-21.5 48-48V183.3c0-13.3 5.3-26 14.7-35.4L384 32zM160 384h320v32c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32v-32z"/></svg>
const IconMoon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20" fill="currentColor"><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/></svg>
const IconSun = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor"><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z"/></svg>

export default function Impostazioni() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('profilo')
  
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const [nomeModificato, setNomeModificato] = useState(user?.nome || '')
  const [passwordForm, setPasswordForm] = useState({ new: '', confirm: '' })
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const [profile, setProfile] = useState({ email_reale: '', telegram_chat_id: '', two_factor_enabled: false, two_factor_method: 'email' })
  const [notifiche, setNotifiche] = useState({ nuovo_compito: true, nuovo_appunto: true, nuova_verifica: true, risposta_richiesta: true, promemoria_scadenze: true })

  useEffect(() => {
    if (user) loadData()
  }, [user])

  async function loadData() {
    const { data: pData } = await supabase.from('profiles').select('nome, email_reale, telegram_chat_id, two_factor_enabled, two_factor_method').eq('id', user.id).single()
    if (pData) {
      setProfile(pData)
      setNomeModificato(pData.nome || user?.nome || '')
    }
    const { data: nData } = await supabase.from('notifiche_preferenze').select('*').eq('user_id', user.id).single()
    if (nData) setNotifiche(nData)
    setLoading(false)
  }

  async function handleSaveProfiloESicurezza() {
    setSaving(true)
    try {
      await supabase.from('profiles').update({
        nome: nomeModificato,
        email: generateFauxEmail(nomeModificato),
        email_reale: profile.email_reale || null,
        telegram_chat_id: profile.telegram_chat_id || null,
        two_factor_enabled: profile.two_factor_enabled,
        two_factor_method: profile.two_factor_enabled ? profile.two_factor_method : null
      }).eq('id', user.id)
      alert('Impostazioni salvate con successo! ✅')
    } catch (error) {
      alert('Errore: ' + error.message)
    } finally { setSaving(false) }
  }

  async function handleUpdatePassword() {
    if (passwordForm.new !== passwordForm.confirm) return alert('Le password non coincidono.')
    if (passwordForm.new.length < 6) return alert('Minimo 6 caratteri.')
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new })
      if (error) throw error
      alert('Password aggiornata! ✅')
      setPasswordForm({ new: '', confirm: '' })
      setShowPasswordForm(false)
    } catch (error) {
      alert('Errore: ' + error.message)
    } finally { setSaving(false) }
  }

  async function handleSaveNotifiche() {
    setSaving(true)
    try {
      await supabase.from('notifiche_preferenze').update(notifiche).eq('user_id', user.id)
      alert('Preferenze notifiche salvate! ✅')
    } catch (error) {
      alert('Errore: ' + error.message)
    } finally { setSaving(false) }
  }

  async function handleExportData() {
    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: compiti } = await supabase.from('compiti').select('*').eq('creato_da', user.id)
      const { data: appunti } = await supabase.from('appunti').select('*').eq('creato_da', user.id)
      const { data: verifiche } = await supabase.from('verifiche').select('*').eq('creato_da', user.id)
      const { data: richieste } = await supabase.from('richieste').select('*').eq('creato_da', user.id)
      
      const blob = new Blob([JSON.stringify({ export_date: new Date().toISOString(), user: profileData, notifications: notifiche, content: { compiti, appunti, verifiche, richieste } }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `classe-app-dati-${(profileData?.nome || 'utente').replace(/\s+/g, '-').toLowerCase()}.json`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Errore esportazione: ' + error.message)
    }
  }

  async function handleLogout() {
    if (confirm('Uscire dall\'account?')) {
      await signOut()
      navigate('/login')
    }
  }

  if (loading) return <div><Navbar /><div className="container" style={{paddingTop: '2rem', textAlign: 'center'}}>Caricamento...</div></div>

  const navItems = [
    { id: 'profilo', label: 'Profilo', icon: <IconUser /> },
    { id: 'sicurezza', label: 'Sicurezza', icon: <IconShield /> },
    { id: 'notifiche', label: 'Notifiche', icon: <IconBell /> },
    { id: 'aspetto', label: 'Aspetto', icon: <IconPalette /> },
    { id: 'privacy', label: 'Privacy e Dati', icon: <IconLock /> },
  ]

  return (
    <div>
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
        <Link to="/" className="text-link" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>← Torna alla Home</Link>
        
        <div className="settings-layout">
          <aside className="settings-sidebar">
            <h1 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>Impostazioni</h1>
            <nav className="sidebar-nav">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setActiveSection(item.id)} className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}>
                  <span style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="settings-content">
            
            {activeSection === 'profilo' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="icon-circle"><IconUser /></div>
                  <h2 className="settings-card-title">Profilo e Account</h2>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <div className="setting-title">Nome visualizzato</div>
                    <div className="setting-desc">Il nome che vedono i compagni. L'email di sistema si aggiornerà automaticamente.</div>
                  </div>
                  <input className="input" value={nomeModificato} onChange={(e) => setNomeModificato(e.target.value)} style={{ width: '220px' }} />
                </div>
                <div className="setting-row" style={{ borderBottom: 'none' }}>
                  <div className="setting-info">
                    <div className="setting-title">Email di sistema</div>
                    <div className="setting-desc">Generata automaticamente dal tuo nome.</div>
                  </div>
                  <input className="input" value={generateFauxEmail(nomeModificato)} disabled style={{ width: '250px', opacity: 0.7 }} />
                </div>
                <button onClick={handleSaveProfiloESicurezza} className="btn btn-primary" disabled={saving} style={{ marginTop: '1rem' }}>
                  {saving ? 'Salvataggio...' : '💾 Salva Modifiche'}
                </button>
              </div>
            )}

            {activeSection === 'sicurezza' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="icon-circle"><IconShield /></div>
                  <h2 className="settings-card-title">Sicurezza e Accesso</h2>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <div className="setting-title">Autenticazione a due fattori (2FA)</div>
                    <div className="setting-desc">Richiedi un codice extra all'accesso per maggiore sicurezza.</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={profile.two_factor_enabled} onChange={(e) => setProfile({...profile, two_factor_enabled: e.target.checked})} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {profile.two_factor_enabled && (
                  <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-accent)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div className="setting-title" style={{ marginBottom: '0.75rem' }}>Metodo di ricezione</div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <label className="radio-label" style={{ flex: 1 }}><input type="radio" name="2fa" value="email" checked={profile.two_factor_method === 'email'} onChange={() => setProfile({...profile, two_factor_method: 'email'})} /> 📧 Email</label>
                      <label className="radio-label" style={{ flex: 1 }}><input type="radio" name="2fa" value="telegram" checked={profile.two_factor_method === 'telegram'} onChange={() => setProfile({...profile, two_factor_method: 'telegram'})} /> 📱 Telegram</label>
                    </div>
                    <input className="input" placeholder={profile.two_factor_method === 'email' ? "La tua email reale" : "Chat ID numerico di Telegram"} value={profile.two_factor_method === 'email' ? profile.email_reale : profile.telegram_chat_id} onChange={(e) => setProfile({...profile, [profile.two_factor_method === 'email' ? 'email_reale' : 'telegram_chat_id']: e.target.value})} />
                  </div>
                )}
                <div className="setting-row" style={{ borderBottom: 'none' }}>
                  <div className="setting-info">
                    <div className="setting-title">Cambia password</div>
                    <div className="setting-desc">Aggiorna la tua password di accesso.</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>{showPasswordForm ? 'Annulla' : 'Modifica'}</button>
                </div>
                {showPasswordForm && (
                  <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-accent)', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label">Nuova password</label>
                      <input type="password" className="input" value={passwordForm.new} onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})} placeholder="Minimo 6 caratteri" />
                    </div>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label">Conferma password</label>
                      <input type="password" className="input" value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} placeholder="Ripeti la password" />
                    </div>
                    <button onClick={handleUpdatePassword} className="btn btn-primary btn-sm" disabled={saving}>Aggiorna Password</button>
                  </div>
                )}
                
                {/* PULSANTE DI SALVATAGGIO AGGIUNTO QUI */}
                <button onClick={handleSaveProfiloESicurezza} className="btn btn-primary" disabled={saving} style={{ marginTop: '1.5rem' }}>
                  {saving ? 'Salvataggio...' : '💾 Salva Impostazioni di Sicurezza'}
                </button>
              </div>
            )}

            {activeSection === 'notifiche' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="icon-circle"><IconBell /></div>
                  <h2 className="settings-card-title">Notifiche Push</h2>
                </div>
                {Object.entries(notifiche).map(([key, value]) => (
                  <div className="setting-row" key={key}>
                    <div className="setting-info">
                      <div className="setting-title">
                        {key === 'nuovo_compito' && 'Nuovo compito assegnato'}
                        {key === 'nuovo_appunto' && 'Nuovo appunto condiviso'}
                        {key === 'nuova_verifica' && 'Nuova verifica programmata'}
                        {key === 'risposta_richiesta' && 'Risposta a una tua richiesta'}
                        {key === 'promemoria_scadenze' && 'Promemoria scadenze (1 giorno prima)'}
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={value} onChange={(e) => setNotifiche({...notifiche, [key]: e.target.checked})} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
                <button onClick={handleSaveNotifiche} className="btn btn-primary" disabled={saving} style={{ marginTop: '1rem' }}>
                  {saving ? 'Salvataggio...' : '💾 Salva Preferenze'}
                </button>
              </div>
            )}

            {activeSection === 'aspetto' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="icon-circle"><IconPalette /></div>
                  <h2 className="settings-card-title">Aspetto e Interfaccia</h2>
                </div>
                <div className="setting-row" style={{ borderBottom: 'none' }}>
                  <div className="setting-info">
                    <div className="setting-title">Tema dell'applicazione</div>
                    <div className="setting-desc">Scegli tra il tema chiaro istituzionale e il tema scuro moderno.</div>
                  </div>
                  <button onClick={() => setIsDark(!isDark)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isDark ? <><IconSun /> Tema Chiaro</> : <><IconMoon /> Tema Scuro</>}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="icon-circle"><IconLock /></div>
                  <h2 className="settings-card-title">Privacy e Dati</h2>
                </div>
                <a href="/privacy" className="policy-link">
                  <div className="icon-circle"><IconFileContract /></div>
                  <div><div className="setting-title">Privacy Policy</div><div className="setting-desc">Come gestiamo i tuoi dati personali.</div></div>
                </a>
                <a href="/cookie" className="policy-link">
                  <div className="icon-circle"><IconCookieBite /></div>
                  <div><div className="setting-title">Cookie Policy</div><div className="setting-desc">Informazioni sull'uso dei cookie.</div></div>
                </a>
                <a href="/termini" className="policy-link">
                  <div className="icon-circle"><IconScaleBalanced /></div>
                  <div><div className="setting-title">Termini di Servizio</div><div className="setting-desc">Regole e condizioni di utilizzo.</div></div>
                </a>

                <div className="setting-row" style={{ paddingTop: '1.5rem' }}>
                  <div className="setting-info">
                    <div className="setting-title">Esporta i miei dati (GDPR)</div>
                    <div className="setting-desc">Scarica una copia di tutti i dati associati al tuo account in formato JSON.</div>
                  </div>
                  <button onClick={handleExportData} className="btn btn-secondary btn-sm">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><IconDownload /> Esporta</span>
                  </button>
                </div>

                <div className="danger-zone">
                  <div className="setting-row" style={{ border: 'none', padding: '1.5rem 0 0 0' }}>
                    <div className="setting-info">
                      <div className="setting-title" style={{ color: 'var(--brand-danger)' }}>Esci dall'account</div>
                      <div className="setting-desc">Termina la sessione corrente su questo dispositivo.</div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-danger">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><IconRightFromBracket /> Esci</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
              <p className="setting-desc" style={{ marginBottom: '0.5rem' }}>Classe App v1.0.0</p>
              <p className="setting-desc" style={{ marginBottom: '1.5rem' }}>Sviluppato con cura per la classe</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GithubButton />
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}