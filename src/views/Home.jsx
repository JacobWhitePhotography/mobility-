import { useNavigate } from 'react-router-dom'
import { getRoutineById, getRoutinesByCategory, CATEGORIES, TODAY_ROUTINE_ID } from '../lib/data'
import { getStreak } from '../lib/progress'

export default function Home() {
  const navigate = useNavigate()
  const todayRoutine = getRoutineById(TODAY_ROUTINE_ID)
  const streak = getStreak()

  return (
    <div className="min-h-svh bg-bg text-fg">
      {/* Scanline */}
      <div className="scanline" />

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-safe-top pb-4 border-b border-border sticky top-0 bg-bg z-10">
        <span className="font-display font-bold text-base tracking-widest uppercase">MOBILITY.SYS</span>
        <span className="font-mono text-xs text-accent">
          {streak > 0 ? `${streak} DAY STREAK` : 'NO STREAK'}
        </span>
      </header>

      {/* Today hero */}
      <section className="px-4 pt-6 pb-2">
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">TODAY</p>
        {todayRoutine && (
          <button
            onClick={() => navigate(`/routine/${todayRoutine.id}`)}
            className="w-full text-left border border-accent p-5 active:bg-surface transition-colors"
          >
            <p className="font-mono text-xs text-accent uppercase tracking-widest mb-2">
              {todayRoutine.duration} MIN — {todayRoutine.blocks.length} BLOCKS
            </p>
            <h1 className="font-display font-bold text-3xl uppercase leading-tight mb-2">
              {todayRoutine.name}
            </h1>
            <p className="text-sm text-dim mb-6 leading-relaxed">{todayRoutine.description}</p>
            <div className="inline-block bg-accent text-bg font-mono font-bold text-sm px-6 py-3 uppercase tracking-widest">
              BEGIN
            </div>
          </button>
        )}
      </section>

      {/* Categories */}
      <section className="px-4 pb-16 pt-6">
        {CATEGORIES.map(category => {
          const routines = getRoutinesByCategory(category)
          if (!routines.length) return null
          return (
            <div key={category} className="mb-8">
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3 pt-4 border-t border-border">
                {category}
              </p>
              <div className="flex flex-col gap-px">
                {routines.map(routine => (
                  <button
                    key={routine.id}
                    onClick={() => navigate(`/routine/${routine.id}`)}
                    className="w-full text-left border border-border p-4 active:border-accent active:bg-surface transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-sm uppercase tracking-wide">
                          {routine.name}
                        </p>
                        <p className="text-xs text-dim mt-1 leading-relaxed">{routine.description}</p>
                      </div>
                      <span className="font-mono text-xs text-muted shrink-0 pt-0.5">
                        {routine.duration}M
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
