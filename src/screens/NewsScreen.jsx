import { useState, useEffect } from 'react'
import TopBar from '../components/TopBar.jsx'
import { NEWS as FALLBACK_NEWS } from '../lib/data.js'

const DOT_COLORS = ['bg-primary', 'bg-secondary', 'bg-outline', 'bg-primary', 'bg-secondary']
const SOURCE_TAGS = { Telex: 'bg-primary-fixed text-on-primary-fixed-variant', '444': 'bg-secondary-container text-on-secondary-container', HVG: 'bg-secondary-fixed text-on-secondary-container' }

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m} perce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} órája`
  return `${Math.floor(h / 24)} napja`
}

export default function NewsScreen({ onNavigate, onMenuClick, onProfileClick, leftIcon = 'menu' }) {
  const [articles, setArticles] = useState(null) // null = loading

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(data => setArticles(data?.length ? data : []))
      .catch(() => setArticles([]))
  }, [])

  // If API failed/empty, use fallback static data
  const items = articles
    ? articles.map((a, i) => ({
        id: a.id,
        time: timeAgo(a.pubDate),
        tag: a.source,
        tagColor: SOURCE_TAGS[a.source] ?? 'bg-surface-container text-on-surface-variant',
        title: a.title,
        body: a.description?.slice(0, 180) || '',
        link: a.link,
        image: a.image,
      }))
    : FALLBACK_NEWS

  const loading = articles === null && !FALLBACK_NEWS

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <TopBar title="Választási Bingó 2026" leftIcon={leftIcon} rightIcon="filter_list" onLeftClick={onMenuClick} onRightClick={onProfileClick} />
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

          {articles === null ? (
            // Skeleton loaders
            [...Array(3)].map((_, i) => (
              <div key={i} className="relative pl-10">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-high border-4 border-surface animate-pulse" />
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 space-y-3 animate-pulse">
                  <div className="h-3 w-24 bg-surface-container-high rounded" />
                  <div className="h-5 bg-surface-container-high rounded" />
                  <div className="h-4 w-3/4 bg-surface-container-high rounded" />
                </div>
              </div>
            ))
          ) : (
            items.map((item, idx) => (
              <article key={item.id} className="relative pl-10 group slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${DOT_COLORS[idx % DOT_COLORS.length]} border-4 border-surface z-10`} />

                <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/10 relative overflow-hidden">
                  {item.image && (
                    <img src={item.image} alt="" className="w-full aspect-video object-cover"
                      onError={e => { e.target.style.display = 'none' }} loading="lazy" />
                  )}
                  <div className="p-5">
                    <div className="absolute left-0 top-0 w-1 h-full bg-primary/10 rounded-l-xl" />

                    <header className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">{item.time}</span>
                      <span className={`${item.tagColor} text-[11px] font-headline font-bold px-2 py-0.5 rounded uppercase tracking-wide`}>
                        {item.tag}
                      </span>
                    </header>

                    <h3 className="font-headline font-bold text-lg leading-snug text-on-surface mb-2">{item.title}</h3>
                    {item.body && <p className="text-on-surface-variant text-sm leading-relaxed mb-4">{item.body}</p>}

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
                      </div>
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-headline font-bold text-primary active:scale-95">
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                          ELOLVASOM
                        </a>
                      ) : (
                        <button className="flex items-center gap-1.5 text-xs font-headline font-bold text-on-surface-variant hover:text-primary transition-colors active:scale-95">
                          <span className="material-symbols-outlined text-base">share</span>
                          MEGOSZTÁS
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

      </main>
    </div>
  )
}
