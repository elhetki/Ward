import { useState, useEffect, useCallback } from 'react'
import { fetchVersesByPage, fetchChapters, fetchJuzs } from '../lib/quranApi'
import type { Verse, Chapter, Juz } from '../types'

interface UseVersesResult {
  verses: Verse[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useVersesByPage(page: number): UseVersesResult {
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!page) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchVersesByPage(page)
      setVerses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verses')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { verses, loading, error, refetch: fetchData }
}

interface UseChaptersResult {
  chapters: Chapter[]
  loading: boolean
  error: string | null
}

export function useChapters(): UseChaptersResult {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChapters()
      .then(setChapters)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load surahs')
      )
      .finally(() => setLoading(false))
  }, [])

  return { chapters, loading, error }
}

interface UseJuzsResult {
  juzs: Juz[]
  loading: boolean
  error: string | null
}

export function useJuzs(): UseJuzsResult {
  const [juzs, setJuzs] = useState<Juz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJuzs()
      .then(setJuzs)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load juzs')
      )
      .finally(() => setLoading(false))
  }, [])

  return { juzs, loading, error }
}
