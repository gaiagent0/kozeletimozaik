import TopBar from '../components/TopBar.jsx'
import { LEADERBOARD } from '../lib/data.js'

const INITIALS_COLORS = [
  'bg-secondary text-on-secondary',
  'bg-primary-fixed text-on-primary-fixed-variant',
  'bg-secondary-fixed text-on-secondary-container',
  'bg-surface-container-high text-on-surface-variant',
  'bg-surface-container-high text-on-surface-variant',
]

export default function CommunityScreen() {
  return (
    <div className="flex flex-col min-h-screen bg-background tapestry-bg">
      <TopBar title="Közéleti Mozaik" />
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

          {/* #1 hero card */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border-l-4 border-secondary flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center font-headline font-black text-lg text-secondary border-2 border-secondary-container">
                  {LEADERBOARD[0].initials}
                </div>
                <div className="absolute -top-1 -right-1 bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-headline">1</div>
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface text-base">{LEADERBOARD[0].name}</p>
                <p className="font-body text-xs text-on-surface-variant">{LEADERBOARD[0].points} Bingó Pont</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-secondary font-headline font-bold text-sm">{LEADERBOARD[0].today} ma</span>
            </div>
          </div>

          {/* Ranks 2–3 */}
          <div className="grid grid-cols-2 gap-3">
            {LEADERBOARD.slice(1, 3).map((p, idx) => (
              <div key={p.rank} className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold text-sm ${INITIALS_COLORS[idx + 1]}`}>
                  {p.rank}
                </div>
                <div className="overflow-hidden">
                  <p className="font-headline font-bold text-sm truncate">{p.name}</p>
                  <p className="font-body text-[10px] text-on-surface-variant">{p.points} pont</p>
                </div>
              </div>
            ))}
          </div>

          {/* Ranks 4–5 */}
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10">
            {LEADERBOARD.slice(3).map((p, idx) => (
              <div key={p.rank}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="font-headline font-bold text-on-surface-variant w-5 text-center">{p.rank}</span>
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-headline font-bold text-xs text-on-surface-variant">
                      {p.initials}
                    </div>
                    <p className="font-body font-semibold text-sm">{p.name}</p>
                  </div>
                  <span className="font-headline font-bold text-xs text-on-surface-variant">{p.points} pt</span>
                </div>
                {idx < LEADERBOARD.slice(3).length - 1 && <div className="h-px mx-4 bg-surface-container" />}
              </div>
            ))}
          </div>
        </section>

        {/* Challenges */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <h3 className="text-lg font-headline font-bold text-on-surface">Legújabb Kihívások</h3>
            </div>
            <button className="text-primary font-headline text-xs font-bold uppercase tracking-widest">Összes</button>
          </div>

          {/* Challenge 1 */}
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
                <h4 className="font-headline font-extrabold text-lg text-on-surface mb-1">A Parlament Hangjai</h4>
                <p className="font-body text-sm text-on-surface-variant mb-4">Tölts ki 3 mezőt a mai parlamenti közvetítés alatt!</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">people</span>
                    <span>+120 játékos</span>
                  </div>
                  <button className="bg-primary text-on-primary text-xs font-headline font-bold py-2 px-5 rounded-lg active:scale-95 transition-transform shadow-sm">
                    Csatlakozom
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Challenge 2 */}
          <div className="bg-surface-container-low p-5 rounded-2xl flex items-center gap-4">
            <div className="bg-secondary-container p-3.5 rounded-xl flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-2xl">groups</span>
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-on-surface text-sm">Közös Bingó Est</h4>
              <p className="font-body text-xs text-on-surface-variant mt-0.5">Ma 20:00 • Élő közvetítés</p>
            </div>
            <button className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-outline-variant text-primary active:scale-90 transition-transform flex-shrink-0">
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
          </div>

          {/* Challenge 3 */}
          <div className="bg-surface-container-low p-5 rounded-2xl flex items-center gap-4">
            <div className="bg-primary-fixed p-3.5 rounded-xl flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl">emoji_events</span>
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-on-surface text-sm">Heti Bajnok</h4>
              <p className="font-body text-xs text-on-surface-variant mt-0.5">Legtöbb bingó a héten • Zárul: 3 nap</p>
            </div>
            <span className="bg-secondary-container text-on-secondary-container text-[10px] font-headline font-bold px-2 py-1 rounded-full">ÚJ</span>
          </div>
        </section>

      </main>
    </div>
  )
}
