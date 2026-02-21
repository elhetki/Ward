import { useState, useCallback } from 'react'
import type { Streak } from '../types'

const STORAGE_KEY = 'ward_streak'

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function getDefaultStreak(): Streak {
  return {
    current_streak: 0,
    longest_streak: 0,
    last_completed_date: '',
    freeze_available: true,
  }
}

function loadStreak(): Streak {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* noop */ }
  return getDefaultStreak()
}

export function useStreak() {
  const [streak, setStreakState] = useState<Streak>(loadStreak)

  const saveStreak = useCallback((s: Streak) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    setStreakState(s)
  }, [])

  const markDayComplete = useCallback(() => {
    const today = getTodayStr()
    const yesterday = getYesterdayStr()
    const current = loadStreak()

    if (current.last_completed_date === today) {
      // Already completed today, no change
      return current
    }

    let newStreak: number
    if (
      current.last_completed_date === yesterday ||
      current.last_completed_date === '' // first time
    ) {
      newStreak = current.current_streak + 1
    } else {
      // Streak broken
      newStreak = 1
    }

    const updated: Streak = {
      current_streak: newStreak,
      longest_streak: Math.max(current.longest_streak, newStreak),
      last_completed_date: today,
      freeze_available: current.freeze_available,
    }

    saveStreak(updated)
    return updated
  }, [saveStreak])

  const freezeStreak = useCallback(() => {
    const current = loadStreak()
    if (!current.freeze_available) return false

    // Use a freeze to keep streak alive for today without reading
    const today = getTodayStr()
    const updated: Streak = {
      ...current,
      last_completed_date: today,
      freeze_available: false,
    }
    saveStreak(updated)
    return true
  }, [saveStreak])

  // Get last 7 days activity
  const getLast7Days = useCallback((): { date: string; completed: boolean }[] => {
    const current = loadStreak()
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      // Simple heuristic: if last_completed_date is within range of current streak
      // This is approximate without a full history store
      const dayOffset = i
      const streakLength = current.current_streak
      // A day is "completed" if it falls within the current streak window
      const completed = dayOffset < streakLength
      days.push({ date: dateStr, completed })
    }
    return days
  }, [])

  return { streak, markDayComplete, freezeStreak, getLast7Days }
}
