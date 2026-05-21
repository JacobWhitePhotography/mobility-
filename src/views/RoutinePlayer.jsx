import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRoutineById, getExerciseById } from '../lib/data'
import { completeRoutine } from '../lib/progress'

function buildQueue(routine) {
  return routine.blocks.flatMap(block =>
    block.exercises.flatMap(ref => {
      const ex = getExerciseById(ref.id)
      if (!ex) return []
      return [{
        exercise: ex,
        blockName: block.name,
        duration: ref.duration !== undefined ? ref.duration : (ex.defaultDuration ?? null),
        reps: ref.reps !== undefined ? ref.reps : (ex.defaultReps ?? null),
        note: ref.note ?? null,
      }]
    })
  )
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  } catch {}
}

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function RoutinePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const routine = useMemo(() => getRoutineById(id), [id])
  const queue = useMemo(() => routine ? buildQueue(routine) : [], [routine])

  const [screen, setScreen] = useState('intro') // intro | exercise | done
  const [index, setIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerState, setTimerState] = useState('idle') // idle | running | paused | complete

  const intervalRef = useRef(null)
  const indexRef = useRef(0)

  // Keep indexRef in sync
  useEffect(() => { indexRef.current = index }, [index])

  // Clean up on unmount
  useEffect(() => () => clearInterval(intervalRef.current), [])

  // Reset timer when exercise changes
  useEffect(() => {
    if (screen !== 'exercise') return
    const item = queue[index]
    if (item?.duration) {
      setTimeLeft(item.duration)
      setTimerState('idle')
    }
  }, [index, screen, queue])

  // Timer tick
  useEffect(() => {
    if (timerState !== 'running') {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          playBeep()
          setTimerState('complete')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [timerState])

  const advance = useCallback(() => {
    clearInterval(intervalRef.current)
    const i = indexRef.current
    if (i < queue.length - 1) {
      setIndex(i + 1)
      setTimerState('idle')
    } else {
      setScreen('done')
      completeRoutine(routine.id, routine.duration)
    }
  }, [queue.length, routine])

  // Auto-advance 1.2s after timer completes
  useEffect(() => {
    if (timerState !== 'complete') return
    const t = setTimeout(advance, 1200)
    return () => clearTimeout(t)
  }, [timerState, advance])

  const goBack = useCallback(() => {
    clearInterval(intervalRef.current)
    const i = indexRef.current
    if (i > 0) {
      setIndex(i - 1)
      setTimerState('idle')
    } else {
      setScreen('intro')
    }
  }, [])

  if (!routine) {
    return (
      <div className="min-h-svh bg-bg flex items-center justify-center">
        <p className="font-mono text-xs text-muted uppercase tracking-widest">ROUTINE NOT FOUND</p>
      </div>
    )
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (screen === 'intro') {
    return (
      <div className="min-h-svh bg-bg text-fg flex flex-col">
        <div className="scanline" />
        <button
          onClick={() => navigate(-1)}
          className="px-4 pt-safe-top pb-4 text-left font-mono text-xs text-muted uppercase tracking-widest min-h-[44px] flex items-center"
        >
          ← BACK
        </button>
        <div className="flex-1 flex flex-col justify-end px-4 pb-safe-bottom">
          <p className="font-mono text-xs text-accent uppercase tracking-widest mb-3">
            {routine.duration} MIN — {routine.category}
          </p>
          <h1 className="font-display font-bold text-4xl uppercase leading-tight mb-4">
            {routine.name}
          </h1>
          <p className="text-dim mb-6 leading-relaxed">{routine.description}</p>
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-10">
            {queue.length} EXERCISES — {routine.blocks.length} BLOCKS
          </p>
          <button
            onClick={() => { setIndex(0); setScreen('exercise') }}
            className="w-full bg-accent text-bg font-mono font-bold text-sm py-5 uppercase tracking-widest active:opacity-80"
          >
            BEGIN
          </button>
        </div>
      </div>
    )
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  if (screen === 'done') {
    return (
      <div className="min-h-svh bg-bg text-fg flex flex-col items-center justify-center px-4">
        <div className="scanline" />
        <div className="w-2 h-2 bg-accent mb-8" />
        <p className="font-mono text-xs text-accent uppercase tracking-widest mb-4">SESSION COMPLETE</p>
        <h1 className="font-display font-bold text-7xl uppercase mb-4">DONE</h1>
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-16">
          {routine.name} — {routine.duration} MIN
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-accent text-bg font-mono font-bold text-sm py-5 uppercase tracking-widest active:opacity-80"
        >
          GO TRAIN
        </button>
      </div>
    )
  }

  // ── Exercise ───────────────────────────────────────────────────────────────
  const item = queue[index]
  const isTimer = item.duration !== null
  const isLastFive = isTimer && timeLeft <= 5 && timerState === 'running'
  const progress = queue.length > 1 ? (index / (queue.length - 1)) * 100 : 100

  return (
    <div className="min-h-svh bg-bg text-fg flex flex-col">
      <div className="scanline" />

      {/* Progress bar */}
      <div className="h-0.5 bg-border shrink-0">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pt-8 overflow-hidden">
        {/* Block tag */}
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-4">
          {item.blockName}
          <span className="text-border mx-2">·</span>
          <span className="text-muted">{index + 1} / {queue.length}</span>
        </p>

        {/* Exercise name */}
        <h1 className="font-display font-bold text-3xl uppercase leading-tight mb-1">
          {item.exercise.name}
        </h1>

        {/* Note (e.g. "Other side") */}
        {item.note
          ? <p className="font-mono text-xs text-accent mb-5 uppercase tracking-wider">{item.note}</p>
          : <div className="mb-5" />
        }

        {/* Cue */}
        <div className="border-l-2 border-accent pl-4 mb-8">
          <p className="text-dim leading-relaxed text-sm">{item.exercise.cue}</p>
        </div>

        {/* Timer or reps */}
        {isTimer ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 pb-4">
            <div
              className={`font-mono font-bold text-7xl tabular-nums transition-colors duration-300 ${
                isLastFive ? 'text-accent animate-pulse' : 'text-fg'
              }`}
            >
              {formatTime(timeLeft)}
            </div>

            {timerState === 'idle' && (
              <button
                onClick={() => setTimerState('running')}
                className="w-full bg-accent text-bg font-mono font-bold text-sm py-5 uppercase tracking-widest active:opacity-80"
              >
                START
              </button>
            )}
            {timerState === 'running' && (
              <button
                onClick={() => setTimerState('paused')}
                className="w-full border border-fg text-fg font-mono font-bold text-sm py-5 uppercase tracking-widest active:opacity-80"
              >
                PAUSE
              </button>
            )}
            {timerState === 'paused' && (
              <button
                onClick={() => setTimerState('running')}
                className="w-full bg-accent text-bg font-mono font-bold text-sm py-5 uppercase tracking-widest active:opacity-80"
              >
                RESUME
              </button>
            )}
            {timerState === 'complete' && (
              <button
                onClick={advance}
                className="w-full bg-accent text-bg font-mono font-bold text-sm py-5 uppercase tracking-widest active:opacity-80"
              >
                NEXT
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 pb-4">
            <p className="font-mono font-bold text-4xl text-accent uppercase tracking-wider text-center">
              {item.reps}
            </p>
            <button
              onClick={advance}
              className="w-full bg-accent text-bg font-mono font-bold text-sm py-5 uppercase tracking-widest active:opacity-80"
            >
              DONE
            </button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex gap-2 px-4 pt-4 pb-safe-bottom border-t border-border shrink-0">
        <button
          onClick={goBack}
          className="flex-1 py-3 font-mono text-xs text-muted uppercase tracking-widest border border-border active:border-fg active:text-fg min-h-[44px]"
        >
          BACK
        </button>
        <button
          onClick={advance}
          className="flex-1 py-3 font-mono text-xs text-muted uppercase tracking-widest border border-border active:border-fg active:text-fg min-h-[44px]"
        >
          SKIP
        </button>
      </div>
    </div>
  )
}
