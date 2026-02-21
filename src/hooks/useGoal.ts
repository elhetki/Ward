import { useState, useCallback } from 'react'

export interface GoalData {
  targetDate: string // ISO string
  sessionsPerDay: number
  sessionTimes: string[]
  dailyPages: number
  createdAt: string
}

const STORAGE_KEY = 'ward_goal'
const PROGRESS_KEY = 'ward_progress'
const SESSIONS_KEY = 'ward_sessions'
const TOTAL_QURAN_PAGES = 604

export interface ProgressData {
  currentPage: number
  currentSurah: number
  currentAyah: number
  totalPagesRead: number
  lastReadAt: string
}

export interface SessionsData {
  date: string // YYYY-MM-DD
  completed: boolean[]
  pagesReadToday: number
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function calcDailyPages(targetDate: string): number {
  const today = new Date()
  const target = new Date(targetDate)
  const daysLeft = Math.max(1, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  const pagesLeft = TOTAL_QURAN_PAGES
  return Math.ceil(pagesLeft / daysLeft)
}

export function useGoal() {
  const [goal, setGoalState] = useState<GoalData | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const saveGoal = useCallback((data: Omit<GoalData, 'dailyPages' | 'createdAt'>) => {
    const dailyPages = calcDailyPages(data.targetDate)
    const fullGoal: GoalData = {
      ...data,
      dailyPages,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullGoal))
    setGoalState(fullGoal)
    return fullGoal
  }, [])

  const clearGoal = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setGoalState(null)
  }, [])

  return { goal, saveGoal, clearGoal }
}

export function useProgress() {
  const [progress, setProgressState] = useState<ProgressData>(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY)
      if (raw) return JSON.parse(raw)
    } catch { /* noop */ }
    return {
      currentPage: 1,
      currentSurah: 1,
      currentAyah: 1,
      totalPagesRead: 0,
      lastReadAt: new Date().toISOString(),
    }
  })

  const saveProgress = useCallback((data: Partial<ProgressData>) => {
    setProgressState((prev) => {
      const next = { ...prev, ...data, lastReadAt: new Date().toISOString() }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { progress, saveProgress }
}

export function useSessions(goal: GoalData | null) {
  const [sessions, setSessionsState] = useState<SessionsData>(() => {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY)
      if (raw) {
        const parsed: SessionsData = JSON.parse(raw)
        if (parsed.date === getTodayStr()) return parsed
      }
    } catch { /* noop */ }
    const count = goal?.sessionsPerDay ?? 2
    return { date: getTodayStr(), completed: Array(count).fill(false), pagesReadToday: 0 }
  })

  const completeSession = useCallback((sessionIndex: number) => {
    setSessionsState((prev) => {
      const next = {
        ...prev,
        completed: prev.completed.map((v, i) => (i === sessionIndex ? true : v)),
      }
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const addPages = useCallback((pages: number) => {
    setSessionsState((prev) => {
      const next = { ...prev, pagesReadToday: prev.pagesReadToday + pages }
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const allDone = sessions.completed.every(Boolean)
  const doneCount = sessions.completed.filter(Boolean).length

  return { sessions, completeSession, addPages, allDone, doneCount }
}

export function calcDailyPagesFromGoal(targetDate: string): number {
  return calcDailyPages(targetDate)
}

export function calcDaysUntil(targetDate: string): number {
  const today = new Date()
  const target = new Date(targetDate)
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
}
