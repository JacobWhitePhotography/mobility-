import { useNavigate } from 'react-router-dom'

export default function Custom() {
  const navigate = useNavigate()
  return (
    <div className="min-h-svh bg-bg text-fg flex flex-col">
      <button
        onClick={() => navigate('/')}
        className="px-4 pt-safe-top pb-4 text-left font-mono text-xs text-muted uppercase tracking-widest min-h-[44px] flex items-center border-b border-border"
      >
        ← BACK
      </button>
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-4">
        <p className="font-mono text-xs text-accent uppercase tracking-widest">COMING SOON</p>
        <h1 className="font-display font-bold text-3xl uppercase">Custom Routines</h1>
        <p className="text-sm text-dim leading-relaxed max-w-xs">
          Build your own routine from the exercise library. Choose blocks, set durations, save for later.
        </p>
      </div>
    </div>
  )
}
