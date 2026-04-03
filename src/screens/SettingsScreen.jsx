import { useState, useEffect } from 'react'
import TopBar from '../components/TopBar.jsx'
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

export default function SettingsScreen({ user, loading, onNavigate, onMenuClick, onProfileClick }) {
  const [settings, setSettings] = useState(getSettings())

  const updateSetting = (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
    if (key === 'notifs' && value) requestNotifPermission()
  }
  const [profile, setProfile] = useState(null)
  const [authBusy, setAuthBusy] = useState(false)

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
      <TopBar title="Beállítások" rightIcon="more_vert" onLeftClick={onMenuClick} onRightClick={onProfileClick} />
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
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm flex flex-col items-center text-center border border-outline-variant/10 space-y-4">
              <div className="text-5xl">🗳️</div>
              <div>
                <h2 className="font-headline font-bold text-xl text-on-surface">Csatlakozz a közösséghez!</h2>
                <p className="text-on-surface-variant text-sm mt-2">Jelentkezz be, hogy pontjaid megjelenjenek a toplistán.</p>
              </div>
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
              <button onClick={handleAnonLogin} disabled={authBusy}
                className="w-full py-3 text-on-surface-variant font-headline font-bold text-sm active:scale-95 transition-transform disabled:opacity-60">
                Folytatás vendégként
              </button>
            </div>
          )}
        </section>

        {/* Notifications */}
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

        {/* Security */}
        <section className="space-y-3">
          <p className="text-[10px] font-headline font-extrabold uppercase tracking-[0.2em] text-on-surface-variant px-1">
            Fiók Biztonság
          </p>
          <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/10">
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors active:scale-[0.99]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div className="text-left">
                  <p className="font-body font-bold text-sm">Jelszó megváltoztatása</p>
                  <p className="text-xs text-on-surface-variant">Legutóbb 3 hónapja módosítva</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant opacity-40">chevron_right</span>
            </button>
            <div className="h-px mx-4 bg-surface-container" />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">shield_person</span>
                </div>
                <div>
                  <p className="font-body font-bold text-sm">Kétlépcsős azonosítás (2FA)</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-tight">Aktív</p>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant opacity-40">chevron_right</span>
            </div>
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
          <p className="text-center text-[10px] text-on-surface-variant mt-6 uppercase tracking-widest font-headline font-bold opacity-40">
            Választási Bingó 2026 v2.0.0
          </p>
        </div>
        )}

      </main>
    </div>
  )
}
