export default function LegalFooter() {
  return (
    <div className="w-full text-center py-3 space-y-1.5 pb-36">
      <p className="text-[10px] text-on-surface-variant opacity-20 font-headline uppercase tracking-widest">
        Választási Bingó 2026 v2.0.0
      </p>
      <a
        href="https://gaiagent.cc/"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-[10px] text-on-surface-variant opacity-30 hover:opacity-60 transition-opacity font-body"
      >
        © 2026 Gai Agent TechServices · gaiagent.cc
      </a>
      <div className="flex items-center justify-center gap-2">
        <a href="/privacy" target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-on-surface-variant opacity-30 hover:opacity-60 transition-opacity font-body">
          Adatvédelem
        </a>
        <span className="text-on-surface-variant opacity-20 text-[10px]">·</span>
        <a href="/terms" target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-on-surface-variant opacity-30 hover:opacity-60 transition-opacity font-body">
          ÁSZF
        </a>
        <span className="text-on-surface-variant opacity-20 text-[10px]">·</span>
        <a href="/delete" target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-on-surface-variant opacity-30 hover:opacity-60 transition-opacity font-body">
          Adattörlés
        </a>
      </div>
    </div>
  )
}
