import { useState, useCallback, useRef, useEffect } from 'react'
import TopBar from '../components/TopBar.jsx'
import LegalFooter from '../components/LegalFooter.jsx'
import { BUZZWORDS } from '../lib/data.js'
import { SIZE, CENTER, makeBoard, checkWin, launchConfetti } from '../lib/bingo.js'
import { supabase } from '../lib/supabase.js'
import { playSound, vibrate, getSettings } from '../lib/settings.js'

function HungarianFlag({ size = 28 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 3 2"
      style={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.2)', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect width="3" height="0.667" y="0" fill="#CE2939" />
      <rect width="3" height="0.667" y="0.667" fill="#FFFFFF" />
      <rect width="3" height="0.667" y="1.333" fill="#477050" />
    </svg>
  )
}

const ELECTION_TARGET = new Date('2026-04-12T17:00:00Z').getTime() // 2026-04-12 19:00 CEST = 17:00 UTC

function useCountdown() {
  function calcDisplay() {
    const remaining = Math.max(0, ELECTION_TARGET - Date.now())
    const totalHours = Math.floor(remaining / 3600000)
    const mins = Math.floor((remaining % 3600000) / 60000)
    const secs = Math.floor((remaining % 60000) / 1000)
    const pad  = n => String(n).padStart(2, '0')
    return { totalHours, sub: `${pad(mins)}:${pad(secs)}`, done: remaining === 0 }
  }

  const [display, setDisplay] = useState(() => calcDisplay())

  useEffect(() => {
    const id = setInterval(() => {
      const d = calcDisplay()
      setDisplay(d)
      if (d.done) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return display
}

export default function BingoScreen({ user, onNavigate, onMenuClick, onProfileClick }) {
  const [phase, setPhase] = useState('welcome')
  const [board, setBoard] = useState([])
  const [selected, setSelected] = useState(new Set([CENTER]))
  const [winCells, setWinCells] = useState(new Set())
  const [isBingo, setIsBingo] = useState(false)
  const [copied, setCopied] = useState(false)
  const [totalBingos, setTotalBingos] = useState(0)
  const [stats, setStats] = useState({ bingos: 0, players: 0, topWord: '—' })
  const savedRef = useRef(false)
  const countdown = useCountdown()

  useEffect(() => {
    const today = new Date().toLocaleDateString('sv-SE')
    supabase
      .from('bingo_sessions')
      .select('id', { count: 'exact', head: true })
      .gte('completed_at', today + 'T00:00:00')
      .then(({ count }) => setStats(s => ({ ...s, bingos: count ?? 0 })))

    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setStats(s => ({ ...s, players: count ?? 0 })))

    supabase
      .from('bingo_sessions')
      .select('words_matched')
      .gte('completed_at', today + 'T00:00:00')
      .limit(20)
      .then(({ data }) => {
        if (!data?.length) return
        const freq = {}
        data.forEach(row => (row.words_matched || []).forEach(w => { freq[w] = (freq[w] || 0) + 1 }))
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]
        if (top) setStats(s => ({ ...s, topWord: top[0] }))
      })
  }, [])

  const saveBingoSession = async (sel, currentBoard) => {
    if (!user || savedRef.current) return
    savedRef.current = true
    const count = sel.size - 1
    try {
      await supabase.from('bingo_sessions').insert({
        user_id: user.id,
        points_earned: count * 10,
        words_matched: Array.from(sel).filter(i => i !== CENTER).map(i => currentBoard[i])
      })
      await supabase.rpc('increment_profile_stats', { p_user_id: user.id, p_points: count * 10 })
    } catch (err) {
      console.error('Failed to save bingo session:', err)
    }
  }

  const startGame = useCallback(() => {
    const b = makeBoard(BUZZWORDS)
    setBoard(b)
    setSelected(new Set([CENTER]))
    setWinCells(new Set())
    setIsBingo(false)
    savedRef.current = false
    setPhase('game')
  }, [])

  const newBoard = useCallback(() => {
    const b = makeBoard(BUZZWORDS)
    setBoard(b)
    setSelected(new Set([CENTER]))
    setWinCells(new Set())
    setIsBingo(false)
  }, [])

  const toggleCell = (i) => {
    if (i === CENTER) return
    const s = getSettings()
    if (s.sounds) playSound('tap')
    if (s.haptic) vibrate([30])
    const next = new Set(selected)
    next.has(i) ? next.delete(i) : next.add(i)
    const wins = checkWin(next)
    const bingo = wins.size > 0
    if (bingo && !isBingo) {
      launchConfetti()
      if (s.sounds) playSound('bingo')
      if (s.haptic) vibrate([100, 50, 100, 50, 200])
      setTotalBingos(n => n + 1)
      saveBingoSession(next, board)
    }
    setSelected(next)
    setWinCells(wins)
    setIsBingo(bingo)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
      .catch(() => {
        const ta = document.createElement('textarea')
        ta.value = text; document.body.appendChild(ta); ta.select()
        try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2500) } catch {}
        document.body.removeChild(ta)
      })
  }

  const handleShare = async () => {
    const count = selected.size - 1
    const url = import.meta.env.VITE_APP_URL || 'https://valasztasibingo.hu'
    const words = Array.from(selected)
      .filter(i => i !== CENTER)
      .map(i => board[i])
      .slice(0, 5)
    const encoded = encodeURIComponent(words.join(','))
    const shareUrl = `${url}?words=${encoded}&score=${count}`
    const text = isBingo
      ? `🇭🇺 BINGÓ! ${count} mezőm volt!\n"${words.slice(0, 3).join('", "')}" – és más szavak.\n▶ Próbáld ki: ${shareUrl}\n#valasztas2026 #bingo2026`
      : `🗳️ ${count}/24 mezőnél tartok a Választási Bingón!\n▶ Próbáld ki: ${shareUrl}\n#valasztas2026 #bingo2026`

    try {
      const { default: html2canvas } = await import('html2canvas')
      const grid = document.getElementById('bingo-grid')
      const canvas = await html2canvas(grid, {
        backgroundColor: '#f5f0eb',
        scale: 3,
        logging: false,
        useCORS: true,
        imageTimeout: 0,
        removeContainer: true,
      })
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'valasztasi-bingo.png', { type: 'image/png' })
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'Választási Bingó 2026', text, files: [file] })
        } else if (navigator.share) {
          await navigator.share({ title: 'Választási Bingó 2026', text, url: shareUrl })
        } else {
          copyToClipboard(text)
        }
      }, 'image/png')
    } catch {
      if (navigator.share) {
        navigator.share({ title: 'Választási Bingó 2026', text, url: shareUrl }).catch(() => copyToClipboard(text))
      } else {
        copyToClipboard(text)
      }
    }
  }

  if (phase === 'welcome') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <TopBar title="Választási Bingó 2026" onLeftClick={onMenuClick} onRightClick={onProfileClick} />
        <main className="flex-1 px-4 pt-6 pb-32 max-w-2xl mx-auto w-full space-y-6 slide-up">
          {/* Hero card */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg" style={{ aspectRatio: '4/3' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-stone-900" />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
              backgroundSize: '60px'
            }} />
            <div className="absolute bottom-0 left-0 p-8 text-on-primary">
              <div className="flex items-center gap-2 mb-3">
                <HungarianFlag size={24} />
                <span className="text-xs font-headline font-bold uppercase tracking-widest opacity-80">Választási Bingó 2026</span>
              </div>
              <h2 className="text-3xl font-headline font-extrabold tracking-tight mb-2 leading-tight">
                Fedezze fel a közéleti párbeszéd varázsszavait
              </h2>
              <p className="text-sm font-body opacity-80 max-w-xs leading-relaxed">
                Hallgat egy vitát vagy kampánybeszédet? Kattintson a szóra, ha elhangzik!
              </p>
            </div>
            {totalBingos > 0 && (
              <div className="absolute top-4 right-4 bg-secondary-container text-on-secondary-container text-xs font-bold px-3 py-1 rounded-full font-headline">
                {totalBingos} bingó ✓
              </div>
            )}
          </div>

          {/* Election countdown */}
          <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/20 text-center shadow-sm">
            <p className="text-[10px] font-headline font-extrabold uppercase tracking-[0.2em] text-on-surface-variant mb-3">
              {countdown.done ? 'A szavazás lezárult' : 'Visszaszámláló – Választás 2026. április 12.'}
            </p>
            {countdown.done ? (
              <p className="font-headline font-black text-4xl text-primary">Az urnák zárva</p>
            ) : (
              <p className="font-headline font-black text-5xl text-on-surface tabular-nums tracking-widest">
                {String(countdown.totalHours).padStart(3, '0')}:{countdown.sub}
              </p>
            )}
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between h-36 cursor-pointer active:scale-95 transition-transform"
              onClick={() => onNavigate('community')}
            >
              <span className="material-symbols-outlined text-secondary text-3xl">groups</span>
              <div>
                <h3 className="font-headline font-bold text-base leading-tight">Közösségi Játék</h3>
                <p className="text-xs text-on-surface-variant mt-1">Játsszon barátaival élőben</p>
              </div>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between h-36">
              <span className="material-symbols-outlined text-primary text-3xl">trending_up</span>
              <div>
                <h3 className="font-headline font-bold text-base leading-tight">Napi Statisztika</h3>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-on-surface-variant">
                    <span className="font-bold text-on-surface">{stats.bingos}</span> bingó ma
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    <span className="font-bold text-on-surface">{stats.players}</span> játékos
                  </span>
                </div>
                {stats.topWord !== '—' && (
                  <p className="text-xs text-primary font-bold mt-0.5 truncate">🔥 {stats.topWord}</p>
                )}
              </div>
            </div>
          </div>

          {/* Buzzword chips preview */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20">
            <p className="text-xs font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-3">Néhány varázsszó</p>
            <div className="flex flex-wrap gap-2">
              {["Brüsszel", "Szuverenitás", "Migráció", "Béke", "Gyurcsány", "Rezsi", "Stabilitás", "Előre megyünk"].map(w => (
                <span key={w} className="text-xs bg-surface-container text-on-surface-variant px-3 py-1 rounded-full font-body font-medium border border-outline-variant/30">
                  {w}
                </span>
              ))}
              <span className="text-xs bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full font-body font-medium">
                +26 más...
              </span>
            </div>
          </div>

          {/* Játék leírás */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/20 space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <h3 className="font-headline font-bold text-base text-on-surface">Hogyan játssz?</h3>
            </div>
            <ol className="space-y-2">
              {[
                { n: '1', text: 'Indíts el egy bingó táblát és hallgasd a közvetítést vagy kampánybeszédet.' },
                { n: '2', text: 'Ha elhangzik egy szó a táblán, kattints rá – a cella megjelölődik.' },
                { n: '3', text: 'Ha egy teljes sort, oszlopot vagy átlót bejelöltél: BINGÓ!' },
                { n: '4', text: 'Oszd meg az eredményed és versenyezz a közösséggel a ranglistán.' },
              ].map(item => (
                <li key={item.n} className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{item.n}</span>
                  <p className="text-sm font-body text-on-surface-variant leading-snug">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* CTA */}
          <button
            onClick={startGame}
            className="w-full bg-primary text-on-primary py-4 rounded-2xl font-headline font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            Játék Indítása
            <span className="material-symbols-outlined">play_arrow</span>
          </button>
          <LegalFooter />
        </main>
      </div>
    )
  }

  // Game screen
  const count = selected.size - 1
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar title="Választási Bingó 2026" onLeftClick={onMenuClick} onRightClick={onProfileClick} />
      <main className="flex-1 px-4 pt-4 pb-32 max-w-2xl mx-auto w-full space-y-4 slide-up">

        {/* Game header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Élő Közvetítés</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Kattintson az elhangzott szavakra!</p>
          </div>
          <div className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-headline font-bold">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse-dot" />
            AKTÍV
          </div>
        </div>

        {/* Bingo banner */}
        {isBingo && (
          <div className="slide-up bg-surface-container-lowest border-2 border-primary rounded-2xl p-3 flex items-center justify-center gap-3 shadow-md">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <span className="font-headline font-black text-lg text-primary uppercase tracking-wide">BINGÓ! Megvan a sor!</span>
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-on-surface-variant font-body">
            <span className="font-bold text-on-surface">{count}</span> / {SIZE * SIZE - 1} mező
          </span>
          <div className="h-1.5 flex-1 mx-3 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-300"
              style={{ width: `${(count / (SIZE * SIZE - 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs font-headline font-bold text-secondary">{Math.round((count / (SIZE * SIZE - 1)) * 100)}%</span>
        </div>

        {/* Bingo Grid */}
        <div
          id="bingo-grid"
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #eae8e5, #efeeeb)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.15)',
            padding: '10px',
          }}
        >
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}>
            {board.map((word, i) => {
              const isCenter = i === CENTER
              const isWin = winCells.has(i)
              const isSel = selected.has(i)

              const baseStyle = {
                borderRadius: '12px',
                transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                userSelect: 'none',
              }
              const raisedStyle = {
                background: 'linear-gradient(160deg, #ffffff 0%, #f8f6f3 100%)',
                boxShadow: '0 4px 0 rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                transform: 'translateY(-1px)',
                border: '1px solid rgba(0,0,0,0.06)',
              }
              const pressedStyle = {
                background: 'linear-gradient(160deg, #c0eec6 0%, #a5d1ab 100%)',
                boxShadow: '0 1px 0 rgba(0,0,0,0.10), inset 0 2px 4px rgba(0,0,0,0.10)',
                transform: 'translateY(1px)',
                border: '1px solid rgba(0,0,0,0.04)',
              }
              const winStyle = {
                background: 'linear-gradient(135deg, #aa0424 0%, #7a0019 100%)',
                boxShadow: '0 4px 0 rgba(170,4,36,0.35), 0 0 20px rgba(170,4,36,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                transform: 'translateY(-2px) scale(1.03)',
                border: '1px solid rgba(255,255,255,0.1)',
              }
              const centerStyle = {
                background: 'linear-gradient(135deg, rgba(170,4,36,0.12) 0%, rgba(170,4,36,0.06) 100%)',
                boxShadow: '0 2px 0 rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                border: '2px solid rgba(170,4,36,0.2)',
              }

              const cellStyle = isCenter ? centerStyle : isWin ? winStyle : isSel ? pressedStyle : raisedStyle

              return (
                <button
                  key={i}
                  onClick={() => toggleCell(i)}
                  className={`aspect-square flex flex-col items-center justify-center p-1 text-center active:scale-95 ${isCenter ? 'cursor-default' : 'cursor-pointer'} ${isWin ? 'bingo-pop' : ''}`}
                  style={{ ...baseStyle, ...cellStyle }}
                >
                  {isCenter ? (
                    <>
                      <span className="material-symbols-outlined text-primary text-xl mb-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_vote</span>
                      <span className="text-[7px] font-black uppercase tracking-widest text-primary leading-none">FREE</span>
                    </>
                  ) : (
                    <span
                      className="leading-tight break-words w-full"
                      style={{
                        fontSize: 'clamp(7px, 1.9vw, 10px)',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontWeight: isWin ? 800 : isSel ? 700 : 600,
                        textAlign: 'center',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        color: isWin ? '#ffffff' : isSel ? '#446d4e' : '#1b1c1a',
                        textShadow: isWin ? '0 1px 2px rgba(0,0,0,0.25)' : 'none',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {word}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className={`flex-1 py-3.5 rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${copied ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'}`}
          >
            <span className="material-symbols-outlined text-base">{copied ? 'check' : 'share'}</span>
            {copied ? 'Másolva!' : 'Megosztás'}
          </button>
          <button onClick={newBoard} className="py-3.5 px-4 bg-surface-container-high rounded-xl text-on-surface active:scale-95 transition-transform">
            <span className="material-symbols-outlined">refresh</span>
          </button>
          <button onClick={() => setPhase('welcome')} className="py-3.5 px-4 bg-surface-container-high rounded-xl text-on-surface active:scale-95 transition-transform">
            <span className="material-symbols-outlined">home</span>
          </button>
        </div>

        {/* Related news */}
        <div className="bg-surface-container p-4 rounded-2xl flex gap-4 items-center border border-outline-variant/10">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary">newspaper</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-headline font-bold text-primary uppercase tracking-widest mb-0.5">Kapcsolódó</p>
            <h4 className="font-headline font-bold text-sm leading-snug truncate">Újabb konzultáció indul jövő héten</h4>
            <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">A részletek már elérhetők a hivatalos oldalakon...</p>
          </div>
        </div>
        <LegalFooter />
      </main>
    </div>
  )
}
