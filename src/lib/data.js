import exercisesData from '../data/exercises.json'
import routinesData from '../data/routines.json'

const exercises = exercisesData.exercises
const routines = routinesData.routines

export function getExerciseById(id) {
  return exercises.find(e => e.id === id) ?? null
}

export function getRoutineById(id) {
  return routines.find(r => r.id === id) ?? null
}

export function getRoutinesByCategory(category) {
  return routines.filter(r => r.category === category)
}

// Daily is shown as the hero on Home — not repeated in the category scroll
export const CATEGORIES = ['Pre-Training', 'Recovery', 'Injury-Specific', 'Mobility']

export const TODAY_ROUTINE_ID = 'morning-mobility'
