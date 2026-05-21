import { useNavigate } from 'react-router-dom'
import { getProgress } from '../lib/progress'
import { getRoutineById } from '../lib/data'

export default function History() {
  const navigate = useNavigate()
  const { history, streak } = getProgress()

  return (
    <div className="min-h-svh bg-bg text-fg flex flex-col">
      <div className="scanline" />
      <header className="flex items-center justify-between px-4 pt-safe-top pb-4 border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="font-mono text-xs text-muted uppercase tracking-widest min-h-[44px] flex items-center"
        >
          ← BACK
        </button>
        <span className="font-mono text-xs text-accent">{streak > 0 ? `${streak} DAY STREAK` : 'NO STREAK'}</span>
      </header>

      <div className="px-4 pt-6 pb-16">
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-6">SESSION HISTORY</p>

        {history.length === 0 ? (
          <p className="font-mono text-xs text-muted uppercase tracking-widest pt-8 text-center">
            No sessions yet
          </p>
        ) : (
          <div className="flex flex-col gap-px">
            {history.map((entry, i) => {
              const routine = getRoutineById(entry.routineId)
              const date = new Date(entry.completedAt)
              const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={i} className="border border-border p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm uppercase">
                      {routine?.name ?? entry.routineId}
                    </p>
                    <p className="font-mono text-xs text-muted mt-1 uppercase tracking-widest">
                      {dateStr} — {timeStr}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted shrink-0 pt-0.5">
                    {entry.durationMin}M
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
