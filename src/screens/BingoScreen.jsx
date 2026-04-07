import { useState, useCallback, useRef, useEffect } from 'react'
import TopBar from '../components/TopBar.jsx'
import LegalFooter from '../components/LegalFooter.jsx'
import SuggestWordModal from '../components/SuggestWordModal.jsx'
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

const ELECTION_TARGET = new Date('2026-04-12T17:00:00Z').getTime()

function useCountdown() {
  function calcDisplay() {
    const remaining = Math.max(0, ELECTION_TARGET - Date.now())
    const totalHours = Math.floor(remaining / 3600000)
    const mins = Math.floor((remaining % 3600000) / 60000)
    const secs = Math.floor((remaining % 60000) / 1000)
    const pad = n => String(n).padStart(2, '0')
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

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const test = current ? current + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 3)
}

export default function BingoScreen({ user, onNavigate, onMenuClick, onProfileClick }) {
  const [phase, setPhase] = useState('welcome')
  const [showAllWords, setShowAllWords] = useState(false)
  const [showSuggest, setShowSuggest] = useState(false)
  const [board, setBoard] = useState([])
  const [selected, setSelected] = useState(new Set([CENTER]))
  const [winCells, setWinCells] = useState(new Set())
  const [isBingo, setIsBingo] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const [totalBingos, setTotalBingos] = useState(0)
  const [stats, setStats] = useState({ bingos: 0, players: 0, topWord: '—' })
  const [allWords, setAllWords] = useState(BUZZWORDS)
  const [communityCount, setCommunityCount] = useState(0)
  const savedRef = useRef(false)
  const countdown = useCountdown()

  // Betöltjük a jóváhagyott közösségi szavakat és merge-öljük a statikusakkal
  useEffect(() => {
    supabase
      .from('word_suggestions')
      .select('word')
      .eq('status', 'approved')
      .then(({ data }) => {
        if (data && data.length > 0) {
          const newWords = data.map(r => r.word).filter(w => !BUZZWORDS.includes(w))
          setCommunityCount(newWords.length)
          if (newWords.length > 0) setAllWords([...BUZZWORDS, ...newWords])
        }
      })
  }, [])

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
    const b = makeBoard(allWords)
    setBoard(b)
    setSelected(new Set([CENTER]))
    setWinCells(new Set())
    setIsBingo(false)
    savedRef.current = false
    setPhase('game')
    if (typeof window !== 'undefined' && window.umami) window.umami.track('game_started')
  }, [allWords])

  const newBoard = useCallback(() => {
    const b = makeBoard(allWords)
    setBoard(b)
    setSelected(new Set([CENTER]))
    setWinCells(new Set())
    setIsBingo(false)
  }, [allWords])

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
      if (typeof window !== 'undefined' && window.umami) window.umami.track('bingo_achieved', { count: next.size - 1 })
      setTotalBingos(n => n + 1)
      saveBingoSession(next, board)
    }
    setSelected(next)
    setWinCells(wins)
    setIsBingo(bingo)
  }

  const handleShare = async () => {
    if (typeof window !== 'undefined' && window.umami) window.umami.track('share_clicked', { isBingo })
    const count = selected.size - 1
    const url = 'https://valasztasibingo.hu'
    const words = Array.from(selected).filter(i => i !== CENTER).map(i => board[i]).slice(0, 3)
    const shareTexts = {
      bingo: [
        `🇭🇺 BINGÓ! Kiszúrtam ${count} politikai varázsszót!\n"${words.join('", "')}" – és még több.\n🗳️ Játssz te is! → ${url}\n#ValasztasiBingo #valasztas2026`,
        `🎯 BINGÓ! ${count} mezőm van – köztük: "${words[0]}"!\nHallgatod a kampánybeszédeket? Játssz velem!\n→ ${url}\n#bingo2026 #valasztas2026`,
        `🏆 Megcsináltam! ${count}/24 mező – BINGÓ!\nA magyar politika legjobb játéka.\n→ ${url} #ValasztasiBingo`,
      ],
      playing: [
        `🗳️ ${count}/24 mezőnél tartok a Választási Bingón!\nMár hallottam: "${words[0] || 'Brüsszel'}"...\n→ ${url}\n#valasztas2026 #bingo2026`,
        `🎮 Élőben játszom a Választási Bingót – ${count} szó eddig!\nPróbáld ki te is!\n→ ${url}`,
        `📻 Hallgatom a kampányt és bingózok 🎯\n${count}/24 – ki tudja mi hangzik el még!\n→ ${url} #ValasztasiBingo`,
      ]
    }
    const textPool = isBingo ? shareTexts.bingo : shareTexts.playing
    const shareText = textPool[Math.floor(Math.random() * textPool.length)]
    const COLS = 5, CELL = 110, GAP = 6, PAD = 16, HEADER = 90, OUTER_PAD = 20
    const gridW = COLS * CELL + (COLS - 1) * GAP + PAD * 2
    const gridH = COLS * CELL + (COLS - 1) * GAP + PAD * 2
    const totalW = gridW + OUTER_PAD * 2
    const totalH = HEADER + gridH + 70 + OUTER_PAD * 2
    const canvas = document.createElement('canvas')
    canvas.width = totalW; canvas.height = totalH
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#f5f0eb'; ctx.fillRect(0, 0, totalW, totalH)
    const S = 7
    ctx.fillStyle = '#CE2939'; ctx.fillRect(0, 0, totalW, S)
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, S, totalW, S)
    ctx.fillStyle = '#477050'; ctx.fillRect(0, S * 2, totalW, S)
    ctx.fillStyle = '#aa0424'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('VÁLASZTÁSI BINGÓ 2026', totalW / 2, S * 3 + 30)
    ctx.font = '14px sans-serif'; ctx.fillStyle = '#888'
    ctx.fillText('valasztasibingo.hu', totalW / 2, S * 3 + 52)
    const gx = OUTER_PAD, gy = HEADER
    ctx.fillStyle = '#e8e4e0'; ctx.beginPath(); ctx.roundRect(gx, gy, gridW, gridH, 16); ctx.fill()
    board.forEach((word, i) => {
      const col = i % COLS, row = Math.floor(i / COLS)
      const cx = gx + PAD + col * (CELL + GAP), cy = gy + PAD + row * (CELL + GAP)
      const isCenter = i === CENTER, isWin = winCells.has(i), isSel = selected.has(i)
      ctx.fillStyle = isCenter ? 'rgba(170,4,36,0.10)' : isWin ? '#aa0424' : isSel ? '#c0eec6' : '#ffffff'
      ctx.beginPath(); ctx.roundRect(cx, cy, CELL, CELL, 10); ctx.fill()
      if (isCenter) {
        ctx.fillStyle = '#aa0424'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText('FREE', cx + CELL / 2, cy + CELL / 2 + 5)
      } else {
        ctx.fillStyle = isWin ? '#ffffff' : isSel ? '#2d5a35' : '#1b1c1a'
        ctx.textAlign = 'center'
        const fontSize = 11; ctx.font = `${isWin ? 'bold ' : ''}${fontSize}px sans-serif`
        const lines = wrapText(ctx, word, CELL - 12)
        const lineH = fontSize + 3
        const startY = cy + CELL / 2 - ((lines.length - 1) * lineH) / 2
        lines.forEach((line, li) => ctx.fillText(line, cx + CELL / 2, startY + li * lineH))
      }
    })
    const footerY = HEADER + gridH + OUTER_PAD + 16
    ctx.fillStyle = isBingo ? '#aa0424' : '#555'
    ctx.font = `bold ${isBingo ? 20 : 16}px sans-serif`; ctx.textAlign = 'center'
    ctx.fillText(isBingo ? `🏆 BINGÓ! ${count}/24 mező` : `${count}/24 mező megjelölve`, totalW / 2, footerY)
    ctx.fillStyle = '#999'; ctx.font = '13px sans-serif'
    ctx.fillText('#ValasztasiBingo #valasztas2026', totalW / 2, footerY + 22)
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'valasztasi-bingo-2026.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Választási Bingó 2026', text: shareText, files: [file] })
        return
      }
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = 'valasztasi-bingo-2026.png'; a.click()
      URL.revokeObjectURL(a.href)
      await navigator.clipboard?.writeText(shareText).catch(() => {})
      setCopied(true)
      setShareMsg('📥 Kép letöltve + szöveg másolva! Illeszd be közösségi médiába.')
      setTimeout(() => { setCopied(false); setShareMsg('') }, 5000)
    }, 'image/png')
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

          {/* Varázsszavak + javaslat gomb */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-headline font-bold uppercase tracking-widest text-on-surface-variant">
                  {showAllWords ? 'Összes varázsszó' : 'Néhány varázsszó'}
                </p>
                {communityCount > 0 && (
                  <p className="text-[10px] text-secondary font-body mt-0.5">
                    +{communityCount} közösségi szó
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant font-body">{allWords.length} szó</span>
                <button
                  onClick={() => setShowSuggest(true)}
                  className="flex items-center gap-1 text-[10px] bg-primary text-on-primary px-2.5 py-1.5 rounded-full font-headline font-bold active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Javaslat
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(showAllWords ? allWords : allWords.slice(0, 8)).map(w => (
                <span key={w} className={`text-xs px-3 py-1 rounded-full font-body font-medium border ${
                  BUZZWORDS.includes(w)
                    ? 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                    : 'bg-secondary-container text-on-secondary-container border-secondary/20'
                }`}>
                  {w}
                </span>
              ))}
              {!showAllWords && (
                <button
                  onClick={() => setShowAllWords(true)}
                  className="text-xs bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full font-body font-medium active:scale-95 transition-transform"
                >
                  +{allWords.length - 8} más...
                </button>
              )}
              {showAllWords && (
                <button
                  onClick={() => setShowAllWords(false)}
                  className="text-xs bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-body font-medium active:scale-95 transition-transform"
                >
                  Kevesebb ↑
                </button>
              )}
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

        <SuggestWordModal isOpen={showSuggest} onClose={() => setShowSuggest(false)} user={user} />
      </div>
    )
  }

  // Game screen
  const count = selected.size - 1
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar title="Választási Bingó 2026" onLeftClick={onMenuClick} onRightClick={onProfileClick} />
      <main className="flex-1 px-4 pt-4 pb-32 max-w-2xl mx-auto w-full space-y-4 slide-up">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Élő Közvetítés</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Kattintson az elhangzott szavakra!</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSuggest(true)}
              className="flex items-center gap-1 text-[10px] bg-surface-container-high text-on-surface-variant px-2.5 py-1.5 rounded-full font-headline font-bold active:scale-95 transition-transform border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Javaslat
            </button>
            <div className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-headline font-bold">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse-dot" />
              AKTÍV
            </div>
          </div>
        </div>

        {isBingo && (
          <div className="slide-up bg-surface-container-lowest border-2 border-primary rounded-2xl p-3 flex items-center justify-center gap-3 shadow-md">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <span className="font-headline font-black text-lg text-primary uppercase tracking-wide">BINGÓ! Megvan a sor!</span>
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          </div>
        )}

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
              const baseStyle = { borderRadius: '12px', transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)', userSelect: 'none' }
              const raisedStyle = { background: 'linear-gradient(160deg, #ffffff 0%, #f8f6f3 100%)', boxShadow: '0 4px 0 rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)', transform: 'translateY(-1px)', border: '1px solid rgba(0,0,0,0.06)' }
              const pressedStyle = { background: 'linear-gradient(160deg, #c0eec6 0%, #a5d1ab 100%)', boxShadow: '0 1px 0 rgba(0,0,0,0.10), inset 0 2px 4px rgba(0,0,0,0.10)', transform: 'translateY(1px)', border: '1px solid rgba(0,0,0,0.04)' }
              const winStyle = { background: 'linear-gradient(135deg, #aa0424 0%, #7a0019 100%)', boxShadow: '0 4px 0 rgba(170,4,36,0.35), 0 0 20px rgba(170,4,36,0.25), inset 0 1px 0 rgba(255,255,255,0.2)', transform: 'translateY(-2px) scale(1.03)', border: '1px solid rgba(255,255,255,0.1)' }
              const centerStyle = { background: 'linear-gradient(135deg, rgba(170,4,36,0.12) 0%, rgba(170,4,36,0.06) 100%)', boxShadow: '0 2px 0 rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)', border: '2px solid rgba(170,4,36,0.2)' }
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

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className={`flex-1 py-3.5 rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${copied ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'}`}
          >
            <span className="material-symbols-outlined text-base">{copied ? 'download_done' : 'share'}</span>
            {copied ? 'Letöltve + Másolva!' : 'Megosztás'}
          </button>
          <button onClick={newBoard} className="py-3.5 px-4 bg-surface-container-high rounded-xl text-on-surface active:scale-95 transition-transform">
            <span className="material-symbols-outlined">refresh</span>
          </button>
          <button onClick={() => setPhase('welcome')} className="py-3.5 px-4 bg-surface-container-high rounded-xl text-on-surface active:scale-95 transition-transform">
            <span className="material-symbols-outlined">home</span>
          </button>
        </div>

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

      <SuggestWordModal isOpen={showSuggest} onClose={() => setShowSuggest(false)} user={user} />

      {shareMsg && (
        <div className="fixed bottom-32 left-4 right-4 z-50 bg-on-surface text-surface text-sm font-headline font-bold px-5 py-3 rounded-2xl shadow-lg text-center">
          {shareMsg}
        </div>
      )}
    </div>
  )
}
