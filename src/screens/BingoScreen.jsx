import { useState, useCallback, useRef } from 'react'
import TopBar from '../components/TopBar.jsx'
import { BUZZWORDS } from '../lib/data.js'
import { SIZE, CENTER, makeBoard, checkWin, launchConfetti } from '../lib/bingo.js'
import { supabase } from '../lib/supabase.js'

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

export default function BingoScreen({ user }) {
  const [phase, setPhase] = useState('welcome')
  const [board, setBoard] = useState([])
  const [selected, setSelected] = useState(new Set([CENTER]))
  const [winCells, setWinCells] = useState(new Set())
  const [isBingo, setIsBingo] = useState(false)
  const [copied, setCopied] = useState(false)
  const [totalBingos, setTotalBingos] = useState(0)
  const savedRef = useRef(false)

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
    const next = new Set(selected)
    next.has(i) ? next.delete(i) : next.add(i)
    const wins = checkWin(next)
    const bingo = wins.size > 0
    if (bingo && !isBingo) {
      launchConfetti()
      setTotalBingos(n => n + 1)
      saveBingoSession(next, board)
    }
    setSelected(next)
    setWinCells(wins)
    setIsBingo(bingo)
  }

  const handleShare = () => {
    const count = selected.size - 1
    const url = 'https://valasztasibingo.hu'
    const text = isBingo
      ? `🇭🇺 BINGÓ! ${count} megjelölt mező, kijött a sor! Próbáld ki: ${url} #valasztas2026`
      : `🗳️ ${count}/24 mezőnél tartok a Választási Bingón – Közéleti Mozaik. Próbáld ki: ${url} #valasztas2026`
    navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  if (phase === 'welcome') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <TopBar title="Közéleti Mozaik" />
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

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between h-36">
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
                <p className="text-xs text-on-surface-variant mt-1">Friss hívószavak</p>
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

          {/* CTA */}
          <button
            onClick={startGame}
            className="w-full bg-primary text-on-primary py-4 rounded-2xl font-headline font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            Játék Indítása
            <span className="material-symbols-outlined">play_arrow</span>
          </button>
        </main>
      </div>
    )
  }

  // Game screen
  const count = selected.size - 1
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar title="Közéleti Mozaik" />
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
        <div className="p-2 bg-surface-container-high rounded-3xl shadow-inner">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}>
            {board.map((word, i) => {
              const isCenter = i === CENTER
              const isWin = winCells.has(i)
              const isSel = selected.has(i)
              let cellClass = 'bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant/20'
              if (isCenter) cellClass = 'bg-primary/10 text-primary border-2 border-primary/20'
              else if (isWin) cellClass = 'bg-primary text-on-primary border-primary shadow-md bingo-pop'
              else if (isSel) cellClass = 'bg-secondary-container text-on-secondary-container border-secondary-container'
              return (
                <button
                  key={i}
                  onClick={() => toggleCell(i)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1.5 text-center transition-all duration-200 active:scale-95 ${cellClass} ${isCenter ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                >
                  {isCenter ? (
                    <>
                      <span className="material-symbols-outlined text-lg mb-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-[8px] font-black uppercase tracking-tight leading-none">FREE</span>
                    </>
                  ) : (
                    <span className="text-[9px] md:text-[10px] font-headline font-bold leading-tight break-words w-full line-clamp-4">
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

      </main>
    </div>
  )
}
