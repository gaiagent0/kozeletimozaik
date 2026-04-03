import TopBar from '../components/TopBar.jsx'
import { NEWS } from '../lib/data.js'

const DOT_COLORS = ['bg-primary', 'bg-secondary', 'bg-outline', 'bg-primary', 'bg-secondary']

export default function NewsScreen() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopBar title="Közéleti Mozaik" rightIcon="filter_list" />
      <main className="flex-1 px-5 pt-6 pb-32 max-w-2xl mx-auto w-full slide-up">

        {/* Editorial header */}
        <div className="mb-8 relative">
          <div className="absolute -right-4 -top-6 opacity-[0.06] pointer-events-none select-none">
            <span className="material-symbols-outlined text-[120px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          </div>
          <h2 className="font-headline font-extrabold text-4xl tracking-tighter text-on-surface mb-2">Hírek</h2>
          <p className="text-on-surface-variant font-body font-medium leading-relaxed text-sm max-w-xs">
            Friss, ropogós és teljesen szubjektív jelentések a nemzeti politika útvesztőiből.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-8 relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-outline-variant/30 z-0" />

          {NEWS.map((item, idx) => (
            <article key={item.id} className="relative pl-10 group slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${DOT_COLORS[idx]} border-4 border-surface z-10`} />

              <div className="bg-surface-container-lowest p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/10 relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1 h-full bg-primary/10 rounded-l-xl" />

                <header className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">{item.time}</span>
                  <span className={`${item.tagColor} text-[11px] font-headline font-bold px-2 py-0.5 rounded uppercase tracking-wide`}>
                    {item.tag}
                  </span>
                </header>

                <h3 className="font-headline font-bold text-lg leading-snug text-on-surface mb-2">{item.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{item.body}</p>

                <div className="flex items-center justify-between pt-3 border-t border-surface-container">
                  <div className="flex items-center gap-3">
                    {item.likes !== undefined && (
                      <button className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        <span className="text-xs font-headline font-bold">{item.likes}</span>
                      </button>
                    )}
                    {item.comments !== undefined && (
                      <button className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-base">chat_bubble</span>
                        <span className="text-xs font-headline font-bold">{item.comments}</span>
                      </button>
                    )}
                    {item.reactionIcon && (
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-base">{item.reactionIcon}</span>
                        <span className="text-xs font-semibold">{item.reactionCount}</span>
                      </div>
                    )}
                  </div>
                  <button className="flex items-center gap-1.5 text-xs font-headline font-bold text-on-surface-variant hover:text-primary transition-colors active:scale-95">
                    <span className="material-symbols-outlined text-base">share</span>
                    MEGOSZTÁS
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load more */}
        <div className="mt-12 text-center">
          <button className="bg-surface-container-highest text-on-surface font-headline font-bold text-sm px-8 py-3 rounded-full hover:bg-surface-dim transition-all active:scale-95">
            KORÁBBI HÍREK
          </button>
        </div>

      </main>
    </div>
  )
}
