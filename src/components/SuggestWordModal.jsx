import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function SuggestWordModal({ isOpen, onClose, user }) {
  const [word, setWord] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const submit = async () => {
    const trimmed = word.trim()
    if (!trimmed || trimmed.length < 2) return
    setSending(true)
    setError(null)

    const displayName = user?.user_metadata?.full_name || 'Névtelen'

    const { error: err } = await supabase
      .from('word_suggestions')
      .insert({
        word: trimmed,
        submitted_by: user?.id || null,
        submitter_name: user ? displayName : 'Vendég',
        status: 'pending',
      })

    if (err) {
      setError('Hiba a beküldésnél. Próbáld újra!')
    } else {
      setDone(true)
    }
    setSending(false)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-background rounded-t-3xl p-6 shadow-2xl space-y-4 slide-up"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        {/* Húzócsík */}
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto" />

        {done ? (
          <div className="text-center py-4 space-y-3">
            <span className="material-symbols-outlined text-5xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <h3 className="font-headline font-bold text-xl text-on-surface">Beküldve!</h3>
            <p className="text-sm text-on-surface-variant">Köszönjük a javaslatot! Az adminok hamarosan átnézik.</p>
            <button
              onClick={() => { setDone(false); setWord(''); onClose() }}
              className="w-full py-3 bg-primary text-on-primary rounded-2xl font-headline font-bold active:scale-95 transition-transform"
            >
              Bezárás
            </button>
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-headline font-bold text-xl text-on-surface">Javasolj varázsszót! 💡</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Hallottál egy tipikus közéleti szólamot, ami hiányzik a listáról? Küldd be!
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={word}
                onChange={e => setWord(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                maxLength={40}
                placeholder="pl. &quot;Összefogás&quot;, &quot;Demokrácia&quot;..."
                className="w-full px-4 py-3.5 bg-surface-container rounded-2xl text-sm font-body text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
                autoFocus
              />
              <p className="text-[10px] text-on-surface-variant text-right">{word.length}/40</p>
            </div>

            {error && (
              <p className="text-xs text-error font-body">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-surface-container text-on-surface-variant rounded-2xl font-headline font-bold text-sm active:scale-95 transition-transform"
              >
                Mégse
              </button>
              <button
                onClick={submit}
                disabled={sending || word.trim().length < 2}
                className="flex-1 py-3 bg-primary text-on-primary rounded-2xl font-headline font-bold text-sm active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <span className="material-symbols-outlined text-base animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-base">send</span>
                )}
                {sending ? 'Küldés…' : 'Beküldés'}
              </button>
            </div>

            <p className="text-[10px] text-on-surface-variant text-center">
              A beküldött szavakat moderáljuk, nem minden kerül be automatikusan.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
