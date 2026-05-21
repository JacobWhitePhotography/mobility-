const KEY = 'mobility-progress'

const DEFAULT = {
  lastDate: null,
  lastCompletedDate: null,
  streak: 0,
  sessionsToday: 0,
  history: [],
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function yesterday() {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10)
}

export function getProgress() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT }
  } catch {
    return { ...DEFAULT }
  }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getStreak() {
  return getProgress().streak
}

export function completeRoutine(routineId, durationMin) {
  const progress = getProgress()
  const t = today()
  const alreadyCompletedToday = progress.lastCompletedDate === t

  let streak = progress.streak
  if (!alreadyCompletedToday) {
    if (progress.lastCompletedDate === yesterday()) {
      streak = streak + 1
    } else {
      streak = 1
    }
  }

  const history = [
    { routineId, completedAt: new Date().toISOString(), durationMin },
    ...progress.history,
  ].slice(0, 30)

  save({
    ...progress,
    lastDate: t,
    lastCompletedDate: t,
    streak,
    sessionsToday: alreadyCompletedToday ? progress.sessionsToday + 1 : 1,
    history,
  })

  return streak
}
