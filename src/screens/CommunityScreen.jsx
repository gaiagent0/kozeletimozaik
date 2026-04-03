import { useState, useEffect } from 'react'
import TopBar from '../components/TopBar.jsx'
import { LEADERBOARD as FALLBACK } from '../lib/data.js'
import { supabase } from '../lib/supabase.js'
import { useDailyChallenge } from '../hooks/useDailyChallenge.js'

const INITIALS_COLORS = [
  'bg-secondary text-on-secondary',
  'bg-primary-fixed text-on-primary-fixed-variant',
  'bg-secondary-fixed text-on-secondary-container',
  'bg-surface-container-high text-on-surface-variant',
  'bg-surface-container-high text-on-surface-variant',
]

const FALLBACK_LEADERS = FALLBACK.map(p => ({
  id: p.rank, display_name: p.name, total_points: p.points,
  total_bingos: 0, level: 1, rank: p.rank
}))

function toInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

function relativeTime(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60) return 'most'
  if (diff < 3600) return `${Math.floor(diff / 60)} perce`
  if (diff < 86400) return `${Math.floor(diff / 3600)} órája`
  return `${Math.floor(diff / 86400)} napja`
}

export default function CommunityScreen({ user, onNavigate, onMenuClick, onProfileClick }) {
  const [leaders, setLeaders] = useState(null)
  const [activity, setActivity] = useState([])
  const [toast, setToast] = useState(null)
  const [dailyChamp, setDailyChamp] = useState(null)
  const { challenge, completed } = useDailyChallenge(user)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    const loadLeaders = async () => {
      const { data } = await supabase.from('leaderboard').select('*').limit(5)
      if (data?.length) setLeaders(data)
      else setLeaders(FALLBACK_LEADERS)
    }
    loadLeaders()

    const channel = supabase
      .channel('leaderboard-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bingo_sessions' },
        () => loadLeaders()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    const loadActivity = async () => {
      const { data, error } = await supabase
        .from('bingo_sessions')
        .select('id, completed_at, points_earned, profiles(display_name, avatar_url)')
        .order('completed_at', { ascending: false })
        .limit(5)
      if (data?.length) {
        setActivity(data)
      } else {
        const { data: plain } = await supabase
          .from('bingo_sessions')
          .select('id, completed_at, points_earned')
          .order('completed_at', { ascending: false })
          .limit(5)
        setActivity((plain ?? []).map(d => ({ ...d, profiles: { display_name: 'Játékos' } })))
      }
    }
    loadActivity()

    const channel2 = supabase
      .channel('activity-feed')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bingo_sessions' },
        () => loadActivity()
      )
      .subscribe()

    return () => supabase.removeChannel(channel2)
  }, [])

  useEffect(() => {
    const today = new Date().toLocaleDateString('sv-SE')
    supabase
      .from('bingo_sessions')
      .select('user_id, points_earned, profiles(display_name, avatar_url)')
      .gte('completed_at', today + 'T00:00:00')
      .order('points_earned', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setDailyChamp(data[0])
      })
  }, [])

  const LEADERBOARD = leaders ?? FALLBACK_LEADERS
  const loading = leaders === null

  return (
    <div className="flex flex-col min-h-screen bg-background tapestry-bg">
      <TopBar title="Választási Bingó 2026" onLeftClick={onMenuClick} onRightClick={onProfileClick} />
      <main className="flex-1 px-5 pt-6 pb-32 max-w-2xl mx-auto w-full space-y-8 slide-up">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface leading-none">Közösség</h2>
            <p className="text-on-surface-variant font-body mt-2 text-sm">A nép szava és a játékosok versenye.</p>
          </div>
          <div className="bg-secondary-container px-3 py-1 rounded-full">
            <span className="text-on-secondary-container text-xs font-headline font-bold uppercase tracking-wider">ÉLŐ</span>
          </div>
        </div>

        {/* Leaderboard */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <h3 className="text-lg font-headline font-bold text-on-surface">Top Játékosok</h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-surface-container-high rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* #1 hero card */}
              {(() => {
                const p = LEADERBOARD[0]
                const isMe = user && p?.id === user.id
                return (
                  <div className={`p-5 rounded-2xl shadow-sm border-l-4 border-secondary flex items-center justify-between ${isMe ? 'bg-primary/5' : 'bg-surface-container-lowest'}`}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {p?.avatar_url ? (
                          <img src={p.avatar_url} className="w-14 h-14 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center font-headline font-black text-lg text-secondary border-2 border-secondary-container">
                            {toInitials(p?.display_name)}
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-headline">1</div>
                      </div>
                      <div>
                        <p className="font-headline font-bold text-on-surface text-base flex items-center gap-1">
                          {p?.display_name}
                          {isMe && <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1">TE</span>}
                        </p>
                        <p className="font-body text-xs text-on-surface-variant">{p?.total_points ?? 0} Bingó Pont</p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Ranks 2–3 */}
              <div className="grid grid-cols-2 gap-3">
                {LEADERBOARD.slice(1, 3).map((p, idx) => {
                  const isMe = user && p.id === user.id
                  return (
                    <div key={p.id ?? p.rank} className={`p-4 rounded-xl flex items-center gap-3 ${isMe ? 'bg-primary/5 border border-primary/20' : 'bg-surface-container-low'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold text-sm ${INITIALS_COLORS[idx + 1]}`}>
                        {idx + 2}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-headline font-bold text-sm truncate flex items-center gap-1">
                          {p.display_name}
                          {isMe && <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">TE</span>}
                        </p>
                        <p className="font-body text-[10px] text-on-surface-variant">{p.total_points ?? 0} pont</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Ranks 4–5 */}
              <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10">
                {LEADERBOARD.slice(3).map((p, idx) => {
                  const isMe = user && p.id === user.id
                  return (
                    <div key={p.id ?? p.rank} className={isMe ? 'bg-primary/5' : ''}>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <span className="font-headline font-bold text-on-surface-variant w-5 text-center">{p.rank ?? idx + 4}</span>
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-headline font-bold text-xs text-on-surface-variant">
                            {toInitials(p.display_name)}
                          </div>
                          <p className="font-body font-semibold text-sm flex items-center gap-1">
                            {p.display_name}
                            {isMe && <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">TE</span>}
                          </p>
                        </div>
                        <span className="font-headline font-bold text-xs text-on-surface-variant">{p.total_points ?? 0} pt</span>
                      </div>
                      {idx < LEADERBOARD.slice(3).length - 1 && <div className="h-px mx-4 bg-surface-container" />}
                    </div>
                  )
                })}
              </div>

              {/* Saját pozíció kártya ha nem top 5 */}
              {user && !leaders?.find(l => l.id === user.id) && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center gap-3 mt-2">
                  <span className="material-symbols-outlined text-primary text-sm">person</span>
                  <div className="flex-1">
                    <p className="font-headline font-bold text-sm text-primary">A te pozíciód</p>
                    <p className="font-body text-xs text-on-surface-variant">Bingózz többet a top 5-be kerüléshez!</p>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Aktivitás feed */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <h3 className="text-lg font-headline font-bold text-on-surface">Friss aktivitás</h3>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10">
            {activity.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-outline-variant/10 last:border-0">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-secondary flex-shrink-0">
                  {toInitials(item.profiles?.display_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body">
                    <span className="font-bold">{item.profiles?.display_name ?? 'Névtelen'}</span>
                    <span className="text-on-surface-variant"> bingózott</span>
                  </p>
                  <p className="text-xs text-on-surface-variant">{relativeTime(item.completed_at)} • +{item.points_earned} pont</p>
                </div>
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-4">
                Még nincs aktivitás – légy az első! 🎯
              </p>
            )}
          </div>
        </section>

        {/* Challenges */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <h3 className="text-lg font-headline font-bold text-on-surface">Legújabb Kihívások</h3>
            </div>
            <button
              onClick={() => showToast('Hamarosan több kihívás! 🚀')}
              className="text-primary font-headline text-xs font-bold uppercase tracking-widest active:opacity-60 transition-opacity"
            >
              Összes
            </button>
          </div>

          {/* Napi küldetés */}
          <div className="bg-surface-container-low rounded-2xl overflow-hidden">
            <div className="h-28 w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-container" />
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 20-20 20L0 20z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
                backgroundSize: '40px'
              }} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent" />
            </div>
            <div className="p-5 -mt-8 relative z-10">
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
                <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-widest mb-1 block">Napi küldetés</span>
                <h4 className="font-headline font-extrabold text-lg text-on-surface mb-1">
                  {challenge?.title ?? 'A Parlament Hangjai'}
                </h4>
                <p className="font-body text-sm text-on-surface-variant mb-4">
                  {challenge?.description ?? 'Tölts ki 3 mezőt a mai közvetítés alatt!'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">people</span>
                    <span>+{challenge?.bonus_points ?? 50} pont</span>
                  </div>
                  {completed ? (
                    <span className="bg-secondary-container text-on-secondary-container text-xs font-headline font-bold px-3 py-1.5 rounded-lg">
                      ✓ Teljesítve +{challenge?.bonus_points ?? 50} pont
                    </span>
                  ) : (
                    <button
                      onClick={() => onNavigate('bingo')}
                      className="bg-primary text-on-primary text-xs font-headline font-bold py-2 px-5 rounded-lg active:scale-95 transition-transform shadow-sm"
                    >
                      Csatlakozom
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Közös Bingó Est */}
          <div className="bg-surface-container-low p-5 rounded-2xl flex items-center gap-4">
            <div className="bg-secondary-container p-3.5 rounded-xl flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-2xl">groups</span>
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-on-surface text-sm">Közös Bingó Est</h4>
              <p className="font-body text-xs text-on-surface-variant mt-0.5">Ma 20:00 • Élő közvetítés</p>
            </div>
            <button
              onClick={() => showToast('Értesítés beállítva! 🔔')}
              className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-outline-variant text-primary active:scale-90 transition-transform flex-shrink-0"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
          </div>

          {/* Napi Bajnok */}
          <div className="bg-surface-container-low p-5 rounded-2xl flex items-center gap-4">
            <div className="bg-primary-fixed p-3.5 rounded-xl flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl">emoji_events</span>
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-on-surface text-sm">Napi Bajnok</h4>
              {dailyChamp ? (
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  {dailyChamp.profiles?.display_name ?? 'Játékos'} • +{dailyChamp.points_earned} pont ma
                </p>
              ) : (
                <p className="font-body text-xs text-on-surface-variant mt-0.5">Ma még nincs bajnok – légy az első!</p>
              )}
            </div>
            {dailyChamp ? (
              <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center font-headline font-bold text-sm text-secondary flex-shrink-0">
                {toInitials(dailyChamp.profiles?.display_name)}
              </div>
            ) : (
              <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            )}
          </div>
        </section>

      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-on-surface text-surface text-sm font-headline font-bold px-5 py-3 rounded-2xl shadow-lg animate-fade-in whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
