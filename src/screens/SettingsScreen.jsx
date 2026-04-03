import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'

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

export default function SettingsScreen() {
  const [notifs, setNotifs] = useState(true)
  const [haptic, setHaptic] = useState(false)
  const [sounds, setSounds] = useState(true)
  const [lang, setLang] = useState('hu')

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar title="Beállítások" rightIcon="more_vert" />
      <main className="flex-1 px-5 pt-6 pb-32 max-w-2xl mx-auto w-full space-y-8 slide-up">

        {/* Profile card */}
        <section>
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm flex flex-col items-center text-center border border-outline-variant/10">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center text-3xl font-headline font-black text-secondary border-4 border-surface-container ring-4 ring-secondary-container/30">
                KI
              </div>
              <button className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full flex items-center justify-center text-on-primary shadow-lg border-2 border-surface-container-lowest active:scale-90 transition-transform">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <h2 className="font-headline font-bold text-xl text-on-surface">Kovács István</h2>
            <p className="text-on-surface-variant text-sm mt-1">Hűséges Választó • Szint 12</p>
            <div className="mt-5 flex gap-3 w-full">
              {[
                { val: '24', label: 'Bingó', color: 'text-primary' },
                { val: '156', label: 'Tipp', color: 'text-secondary' },
                { val: '890', label: 'Pont', color: 'text-tertiary' },
              ].map(s => (
                <div key={s.label} className="flex-1 bg-surface-container-low p-3 rounded-2xl text-center">
                  <span className={`block ${s.color} font-headline font-bold text-lg`}>{s.val}</span>
                  <span className="text-[10px] uppercase tracking-wider font-headline font-bold text-on-surface-variant">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
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
              right={<Toggle checked={notifs} onChange={() => setNotifs(!notifs)} />}
            />
            <div className="h-px mx-4 bg-surface-container" />
            <SettingRow
              icon="vibration"
              iconBg="bg-surface-container-high text-on-surface-variant"
              title="Haptikus visszajelzés"
              subtitle="Rezgés bingó esetén"
              right={<Toggle checked={haptic} onChange={() => setHaptic(!haptic)} />}
            />
            <div className="h-px mx-4 bg-surface-container" />
            <SettingRow
              icon="volume_up"
              iconBg="bg-surface-container-high text-on-surface-variant"
              title="Játék hanghatások"
              subtitle="Hangok kattintáskor"
              right={<Toggle checked={sounds} onChange={() => setSounds(!sounds)} />}
            />
          </div>
        </section>

        {/* Language */}
        <section className="space-y-3">
          <p className="text-[10px] font-headline font-extrabold uppercase tracking-[0.2em] text-on-surface-variant px-1">Nyelv</p>
          <div className="grid grid-cols-2 p-1.5 bg-surface-container-high rounded-xl gap-1">
            {[
              { id: 'hu', label: 'Magyar', icon: 'check_circle' },
              { id: 'en', label: 'English', icon: null },
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`py-2.5 px-4 rounded-lg font-body font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  lang === l.id
                    ? 'bg-surface-container-lowest shadow-sm text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container/50'
                }`}
              >
                {l.icon && lang === l.id && <span className="material-symbols-outlined text-base">{l.icon}</span>}
                {l.label}
              </button>
            ))}
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
        <div className="pt-2">
          <button className="w-full bg-primary/5 text-primary font-headline font-bold py-4 rounded-3xl border border-primary/10 flex items-center justify-center gap-2 active:bg-primary active:text-on-primary transition-all duration-200">
            <span className="material-symbols-outlined">logout</span>
            Kijelentkezés
          </button>
          <p className="text-center text-[10px] text-on-surface-variant mt-6 uppercase tracking-widest font-headline font-bold opacity-40">
            Közéleti Mozaik v2.0.0 · 2026
          </p>
        </div>

      </main>
    </div>
  )
}
