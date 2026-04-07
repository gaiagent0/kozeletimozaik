import { useState, useEffect } from 'react'
import TopBar from '../components/TopBar.jsx'

const GENERATED_NAMES = [
  'Névtelen Szavazó', 'Titkos Bingós', 'Brüsszel Bajnok',
  'Rezsi Harcos', 'Szuverén Játékos', 'Béke Vadász',
  'Kétharmad Király', 'Hatvanpusztai', 'Konzultációs Hős',
  'Ukrán Kém 🕵️', 'Da-da-da Mester', 'Pálinkás Hős',
  'Gundalf a Nagy', 'PADME Lovag', 'Lázárinfós',
  'Feketeruhás', 'Pancser Százados', 'Százados Fan',
]

function getRandomNames(n = 6) {
  const shuffled = [...GENERATED_NAMES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
import LegalFooter from '../components/LegalFooter.jsx'
import { signInWithGoogle, signInAnonymously, signOut } from '../lib/auth.js'
import { supabase } from '../lib/supabase.js'
import { getSettings, saveSettings, requestNotifPermission } from '../lib/settings.js'

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-surface-container-high after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
    </label>
  )
}

function SettingRow({ icon, iconBg, title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div>
          <p className="font-body font-bold text-sm text-on-surface">{title}</p>
          {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

export default function SettingsScreen({ user, loading, onNavigate, onMenuClick, onProfileClick, leftIcon = 'menu' }) {
  const [settings, setSettings] = useState(getSettings())
  const [profile, setProfile] = useState(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [suggestedNames, setSuggestedNames] = useState([])
  const [savingName, setSavingName] = useState(false)
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const updateSetting = (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
    if (key === 'notifs' && value) requestNotifPermission()
  }

  useEffect(() => {
    console.log('[Supabase] client initialized, URL:', import.meta.env.VITE_SUPABASE_URL ?? 'MISSING')
  }, [])

  useEffect(() => {
    if (!user) { setProfile(null); return }
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user])

  const displayName = profile?.display_name || user?.user_metadata?.full_name || 'Névtelen Választó'
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url

  const handleGoogleLogin = async () => { setAuthBusy(true); await signInWithGoogle(); setAuthBusy(false) }
  const handleAnonLogin = async () => { setAuthBusy(true); await signInAnonymously(); setAuthBusy(false) }
  const handleSignOut = async () => { setAuthBusy(true); await signOut(); setAuthBusy(false) }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar title="Beállítások" leftIcon={leftIcon} rightIcon="more_vert" onLeftClick={onMenuClick} onRightClick={onProfileClick} />
      <main className="flex-1 px-5 pt-6 pb-32 max-w-2xl mx-auto w-full space-y-8 slide-up">

        {/* Profile card */}
        <section>
          {user ? (
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm flex flex-col items-center text-center border border-outline-variant/10">
              <div className="relative mb-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-surface-container ring-4 ring-secondary-container/30" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center text-3xl font-headline font-black text-secondary border-4 border-surface-container ring-4 ring-secondary-container/30">
                    {initials}
                  </div>
                )}
              </div>
              <h2 className="font-headline font-bold text-xl text-on-surface">{displayName}</h2>
              <p className="text-on-surface-variant text-sm mt-1">
                {user.is_anonymous ? 'Vendég fiók' : (user.email || 'Google fiók')} • Szint {profile?.level ?? 1}
              </p>
              <div className="mt-5 flex gap-3 w-full">
                {[
                  { val: profile?.total_bingos ?? 0, label: 'Bingó', color: 'text-primary' },
                  { val: profile?.total_tips ?? 0, label: 'Tipp', color: 'text-secondary' },
                  { val: profile?.total_points ?? 0, label: 'Pont', color: 'text-tertiary' },
                ].map(s => (
                  <div key={s.label} className="flex-1 bg-surface-container-low p-3 rounded-2xl text-center">
                    <span className={`block ${s.color} font-headline font-bold text-lg`}>{s.val}</span>
                    <span className="text-[10px] uppercase tracking-wider font-headline font-bold text-on-surface-variant">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Névválasztó */}
              {!editingName ? (
                <button
                  onClick={() => {
                    setNameInput(displayName)
                    setSuggestedNames(getRandomNames(6))
                    setEditingName(true)
                  }}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-surface-container rounded-2xl text-sm font-headline font-bold text-on-surface-variant active:scale-95 transition-transform border border-outline-variant/20"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Megjelenítési név módosítása
                </button>
              ) : (
                <div className="w-full mt-3 space-y-3">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    maxLength={30}
                    placeholder="Írd be a neved..."
                    className="w-full px-4 py-3 bg-surface-container rounded-2xl text-sm font-body text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
                  />
                  <div className="flex flex-wrap gap-2">
                    {suggestedNames.map(name => (
                      <button
                        key={name}
                        onClick={() => setNameInput(name)}
                        className={`text-xs px-3 py-1.5 rounded-full font-body border transition-all ${
                          nameInput === name
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface-container text-on-surface-variant border-outline-variant/30 active:scale-95'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!nameInput.trim()) return
                        setSavingName(true)
                        const { error } = await supabase
                          .from('profiles')
                          .update({ display_name: nameInput.trim() })
                          .eq('id', user.id)
                        if (!error) {
                          setProfile(p => ({ ...p, display_name: nameInput.trim() }))
                          showToast('✓ Név mentve!')
                          setEditingName(false)
                        } else {
                          showToast('Hiba a mentésnél, próbáld újra')
                        }
                        setSavingName(false)
                      }}
                      disabled={savingName || !nameInput.trim()}
                      className="flex-1 py-2.5 bg-primary text-on-primary rounded-2xl text-sm font-headline font-bold active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {savingName ? 'Mentés…' : 'Mentés'}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="px-4 py-2.5 bg-surface-container text-on-surface-variant rounded-2xl text-sm font-headline font-bold active:scale-95 transition-transform"
                    >
                      Mégse
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm flex flex-col items-center text-center border border-outline-variant/10 space-y-4">
              <div className="text-5xl">🗳️</div>
              <div>
                <h2 className="font-headline font-bold text-xl text-on-surface">Csatlakozz a közösséghez!</h2>
                <p className="text-on-surface-variant text-sm mt-2">Jelentkezz be, hogy pontjaid megjelenjenek a toplistán.</p>
              </div>

              {/* Google */}
              <button onClick={handleGoogleLogin} disabled={authBusy}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-surface-container border border-outline-variant rounded-2xl font-headline font-bold text-sm active:scale-95 transition-transform disabled:opacity-60">
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Bejelentkezés Google-lel
              </button>

              {/* Elválasztó */}
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-px bg-outline-variant/40" />
                <span className="text-[10px] text-on-surface-variant font-headline uppercase tracking-wider">vagy</span>
                <div className="flex-1 h-px bg-outline-variant/40" />
              </div>

              {/* Vendég */}
              <button onClick={handleAnonLogin} disabled={authBusy}
                className="w-full py-3.5 bg-surface-container-low border border-outline-variant/30 text-on-surface-variant font-headline font-bold text-sm rounded-2xl active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">person_outline</span>
                Folytatás vendégként
              </button>

              <p className="text-[10px] text-on-surface-variant text-center opacity-60">
                További bejelentkezési lehetőségek hamarosan
              </p>
            </div>
          )}
        </section>

        {/* Notifications & Game settings */}
        <section className="space-y-3">
          <p className="text-[10px] font-headline font-extrabold uppercase tracking-[0.2em] text-on-surface-variant px-1">
            Játék és Értesítések
          </p>
          <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/10">
            <SettingRow
              icon="notifications_active"
              iconBg="bg-secondary-container text-secondary"
              title="Hírértesítések"
              subtitle="Friss közéleti események"
              right={<Toggle checked={settings.notifs} onChange={() => updateSetting('notifs', !settings.notifs)} />}
            />
            <div className="h-px mx-4 bg-surface-container" />
            <SettingRow
              icon="vibration"
              iconBg="bg-surface-container-high text-on-surface-variant"
              title="Haptikus visszajelzés"
              subtitle="Rezgés bingó esetén"
              right={<Toggle checked={settings.haptic} onChange={() => updateSetting('haptic', !settings.haptic)} />}
            />
            <div className="h-px mx-4 bg-surface-container" />
            <SettingRow
              icon="volume_up"
              iconBg="bg-surface-container-high text-on-surface-variant"
              title="Játék hanghatások"
              subtitle="Hangok kattintáskor"
              right={<Toggle checked={settings.sounds} onChange={() => updateSetting('sounds', !settings.sounds)} />}
            />
          </div>
        </section>

        {/* Logout */}
        {user && (
          <div className="pt-2">
            <button onClick={handleSignOut} disabled={authBusy}
              className="w-full bg-primary/5 text-primary font-headline font-bold py-4 rounded-3xl border border-primary/10 flex items-center justify-center gap-2 active:bg-primary active:text-on-primary transition-all duration-200 disabled:opacity-60">
              <span className="material-symbols-outlined">logout</span>
              {authBusy ? 'Kijelentkezés…' : 'Kijelentkezés'}
            </button>
          </div>
        )}

        <LegalFooter />
      </main>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-on-surface text-surface text-sm font-headline font-bold px-5 py-3 rounded-2xl shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
