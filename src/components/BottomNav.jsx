const TABS = [
  { id: 'bingo', icon: 'grid_view', label: 'Bingó' },
  { id: 'community', icon: 'groups', label: 'Közösség' },
  { id: 'news', icon: 'newspaper', label: 'Hírek' },
  { id: 'settings', icon: 'settings', label: 'Beállítások' },
]

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-surface/90 backdrop-blur-xl rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {TABS.map(tab => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-secondary-container text-secondary rounded-full px-5 py-1.5'
                : 'text-stone-500 px-4 py-2 hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined mb-0.5"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {tab.icon}
            </span>
            <span className="font-body text-[11px] font-semibold tracking-wide">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
