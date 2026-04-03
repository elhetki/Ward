import type { Chapter, Verse, Juz } from '../types'

const BASE_URL = 'https://api.quran.com/api/v4'

// Simple in-memory cache
const cache = new Map<string, unknown>()

async function fetchWithCache<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  const data = await res.json()
  cache.set(url, data)
  return data as T
}

export async function fetchChapters(): Promise<Chapter[]> {
  const data = await fetchWithCache<{ chapters: Chapter[] }>(
    `${BASE_URL}/chapters`
  )
  return data.chapters
}

export async function fetchChapter(id: number): Promise<Chapter> {
  const data = await fetchWithCache<{ chapter: Chapter }>(
    `${BASE_URL}/chapters/${id}`
  )
  return data.chapter
}

export async function fetchVersesByPage(page: number): Promise<Verse[]> {
  const fields = 'text_uthmani,verse_key,chapter_id,page_number,juz_number'
  const data = await fetchWithCache<{ verses: Verse[] }>(
    `${BASE_URL}/verses/by_page/${page}?translations=20&fields=${fields}`
  )
  return data.verses
}

export async function fetchVersesBySurah(
  surahId: number,
  page?: number
): Promise<Verse[]> {
  const fields = 'text_uthmani,verse_key,chapter_id,page_number,juz_number'
  const pageParam = page ? `&page=${page}` : ''
  const data = await fetchWithCache<{ verses: Verse[] }>(
    `${BASE_URL}/verses/by_chapter/${surahId}?translations=20&fields=${fields}&per_page=50${pageParam}`
  )
  return data.verses
}

export async function fetchJuzs(): Promise<Juz[]> {
  const data = await fetchWithCache<{ juzs: Juz[] }>(
    `${BASE_URL}/juzs`
  )
  return data.juzs
}

export async function fetchVersesByJuz(juzNumber: number): Promise<Verse[]> {
  const fields = 'text_uthmani,verse_key,chapter_id,page_number,juz_number'
  const data = await fetchWithCache<{ verses: Verse[] }>(
    `${BASE_URL}/verses/by_juz/${juzNumber}?translations=20&fields=${fields}&per_page=50`
  )
  return data.verses
}

export function getAudioUrl(
  surahId: number,
  ayahNumber: number,
  reciter = 'Alafasy_128kbps'
): string {
  const s = String(surahId).padStart(3, '0')
  const a = String(ayahNumber).padStart(3, '0')
  return `https://everyayah.com/data/${reciter}/${s}${a}.mp3`
}

// Strip the Arabic End of Ayah character (U+06DD) and trailing numbers from uthmani text
export function cleanUthmaniText(text: string): string {
  // Remove U+06DD and any numbers/arabic-extended digits that follow it
  return text.replace(/\u06DD[\u0660-\u0669\u06F0-\u06F90-9]*/g, '').trim()
}

// Clear specific page from cache (to force refresh)
export function invalidatePageCache(page: number): void {
  const fields = 'text_uthmani,verse_key,chapter_id,page_number,juz_number'
  const url = `${BASE_URL}/verses/by_page/${page}?translations=20&fields=${fields}`
  cache.delete(url)
}
