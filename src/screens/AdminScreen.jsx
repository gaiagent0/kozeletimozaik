import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import TopBar from '../components/TopBar.jsx'

// Admin email-ek – ide vedd fel a saját email-ed
const ADMIN_EMAILS = ['szechist@gmail.com']

export default function AdminScreen({ user, onMenuClick }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [toast, setToast] = useState(null)

  const isAdmin = user && (ADMIN_EMAILS.includes(user.email) || user.user_metadata?.is_admin)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('word_suggestions')
      .select('*')
      .eq('status', filter)
      .order('created_at', { ascending: false })
    setSuggestions(data || [])
    setLoading(false)
  }

  useEffect(() => { if (isAdmin) load() }, [filter, isAdmin])

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('word_suggestions')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) {
      showToast(status === 'approved' ? '✅ Jóváhagyva!' : '❌ Elutasítva')
      setSuggestions(s => s.filter(x => x.id !== id))
    } else {
      showToast('Hiba: ' + error.message)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <TopBar title="Admin" leftIcon="home" onLeftClick={onMenuClick} />
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">lock</span>
            <p className="mt-4 font-headline font-bold text-on-surface">Bejelentkezés szükséges</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <TopBar title="Admin" leftIcon="home" onLeftClick={onMenuClick} />
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <span className="material-symbols-outlined text-5xl text-error">block</span>
            <p className="mt-4 font-headline font-bold text-on-surface">Nincs admin jogosultságod</p>
            <p className="text-sm text-on-surface-variant mt-2">{user.email}</p>
          </div>
        </div>
      </div>
    )
  }

  const counts = { pending: '?', approved: '?', rejected: '?' }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar title="Admin – Szó javaslatok" leftIcon="home" onLeftClick={onMenuClick} />

      <main className="flex-1 px-4 pt-4 pb-32 max-w-2xl mx-auto w-full space-y-4">

        {/* Filter tabs */}
        <div className="flex gap-2 bg-surface-container-lowest rounded-2xl p-1 border border-outline-variant/20">
          {[
            { key: 'pending', label: 'Várakozó', icon: 'pending' },
            { key: 'approved', label: 'Jóváhagyott', icon: 'check_circle' },
            { key: 'rejected', label: 'Elutasított', icon: 'cancel' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-headline font-bold transition-all ${
                filter === tab.key
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant active:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">inbox</span>
            <p className="mt-3 font-headline font-bold text-on-surface-variant">Nincs {filter === 'pending' ? 'várakozó' : filter === 'approved' ? 'jóváhagyott' : 'elutasított'} javaslat</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map(s => (
              <div key={s.id} className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 space-y-3">
                {/* Szó */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-lg font-headline font-black text-on-surface">{s.word}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-on-surface-variant">
                        {s.submitter_name || 'Névtelen'}
                      </span>
                      <span className="text-[10px] text-on-surface-variant opacity-60">
                        {new Date(s.created_at).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-headline font-bold px-2 py-1 rounded-full ${
                    s.status === 'pending' ? 'bg-tertiary-container text-on-tertiary-container' :
                    s.status === 'approved' ? 'bg-secondary-container text-on-secondary-container' :
                    'bg-error-container text-on-error-container'
                  }`}>
                    {s.status === 'pending' ? 'Várakozó' : s.status === 'approved' ? 'Jóváhagyva' : 'Elutasítva'}
                  </span>
                </div>

                {/* Gombok – csak pending-nél */}
                {s.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(s.id, 'approved')}
                      className="flex-1 py-2.5 bg-secondary text-on-secondary rounded-xl text-sm font-headline font-bold active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">check</span>
                      Jóváhagyás
                    </button>
                    <button
                      onClick={() => updateStatus(s.id, 'rejected')}
                      className="flex-1 py-2.5 bg-error-container text-on-error-container rounded-xl text-sm font-headline font-bold active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                      Elutasítás
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SQL segítség */}
        <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20">
          <p className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-2">Supabase tábla (ha még nincs)</p>
          <pre className="text-[10px] text-on-surface-variant overflow-auto leading-relaxed">{`create table word_suggestions (
  id uuid default gen_random_uuid() primary key,
  word text not null,
  submitted_by uuid references auth.users(id),
  submitter_name text,
  status text default 'pending',
  created_at timestamptz default now(),
  reviewed_at timestamptz
);
alter table word_suggestions enable row level security;
create policy "Anyone can insert"
  on word_suggestions for insert to authenticated, anon
  with check (true);
create policy "Anyone can read approved"
  on word_suggestions for select
  using (status = 'approved');
create policy "Admins can do all"
  on word_suggestions for all
  using (auth.jwt() ->> 'email' = 'szechist@gmail.com');`}</pre>
        </div>

      </main>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-on-surface text-surface text-sm font-headline font-bold px-5 py-3 rounded-2xl shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
