export default function TopBar({ title, rightIcon = 'account_circle', onLeftClick, onRightClick }) {
  return (
    <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-5 h-16 w-full max-w-2xl mx-auto">
        <button
          onClick={onLeftClick}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-stone-600">menu</span>
        </button>
        <h1 className="font-headline font-black text-primary uppercase tracking-widest text-lg select-none">
          {title}
        </h1>
        <button
          onClick={onRightClick}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-primary">{rightIcon}</span>
        </button>
      </div>
      <div className="h-px bg-surface-container-high w-full" />
    </header>
  )
}
