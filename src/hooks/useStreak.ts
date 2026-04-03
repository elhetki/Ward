import { useState, useCallback } from 'react'

const STORAGE_KEY = 'ward_streak'
const DATES_KEY = 'ward_completed_dates' // array of 'YYYY-MM-DD' strings

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function dateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

interface StreakState {
  current_streak: number
  longest_streak: number
  last_completed_date: string
  freeze_available: boolean
}

const DEFAULT_STREAK: StreakState = {
  current_streak: 0,
  longest_streak: 0,
  last_completed_date: '',
  freeze_available: true,
}

function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_STREAK, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_STREAK
}

function loadCompletedDates(): Set<string> {
  try {
    const raw = localStorage.getItem(DATES_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch {}
  return new Set()
}

function saveCompletedDates(dates: Set<string>) {
  // Keep only last 90 days to avoid bloat
  const sorted = Array.from(dates).sort().slice(-90)
  localStorage.setItem(DATES_KEY, JSON.stringify(sorted))
}

export function useStreak() {
  const [streak, setStreakState] = useState<StreakState>(loadStreak)
  const [completedDates, setCompletedDates] = useState<Set<string>>(loadCompletedDates)

  const save = (s: StreakState) => {
    setStreakState(s)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  }

  const markDayComplete = useCallback(() => {
    const current = loadStreak()
    const todayStr = today()
    const yesterdayStr = yesterday()

    // Already marked today
    if (current.last_completed_date === todayStr) return

    // Update completed dates
    const dates = loadCompletedDates()
    dates.add(todayStr)
    saveCompletedDates(dates)
    setCompletedDates(new Set(dates))

    let newStreak: number
    if (
      current.last_completed_date === yesterdayStr ||
      current.last_completed_date === ''
    ) {
      newStreak = current.current_streak + 1
    } else {
      // Streak broken — reset to 1
      newStreak = 1
    }

    save({
      current_streak: newStreak,
      longest_streak: Math.max(current.longest_streak, newStreak),
      last_completed_date: todayStr,
      freeze_available: current.freeze_available,
    })
  }, [])

  const freezeStreak = useCallback(() => {
    const current = loadStreak()
    if (!current.freeze_available) return
    const todayStr = today()
    // Mark today as completed (freeze) without counting as a real reading
    const dates = loadCompletedDates()
    dates.add(todayStr)
    saveCompletedDates(dates)
    setCompletedDates(new Set(dates))
    save({
      ...current,
      last_completed_date: todayStr,
      freeze_available: false,
    })
  }, [])

  const getLast7Days = useCallback((): { date: string; completed: boolean }[] => {
    const dates = loadCompletedDates()
    return Array.from({ length: 7 }, (_, i) => {
      const dateStr = dateNDaysAgo(6 - i) // index 0 = 6 days ago, index 6 = today
      return { date: dateStr, completed: dates.has(dateStr) }
    })
  }, [completedDates])

  return { streak, markDayComplete, freezeStreak, getLast7Days }
}
