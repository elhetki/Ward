// Quran API types
export interface Verse {
  id: number
  verse_number: number
  verse_key: string // e.g. "2:255"
  chapter_id: number
  page_number: number
  juz_number: number
  text_uthmani: string
  translations: { text: string }[]
}

export interface Chapter {
  id: number
  name_simple: string
  name_arabic: string
  verses_count: number
  pages: [number, number]
}

export interface Juz {
  id: number
  verse_mapping: Record<string, string>
  first_verse_id: number
  last_verse_id: number
  verses_count: number
}

// App types
export interface Goal {
  id: string
  user_id: string
  target_date: string
  daily_pages: number
  sessions_per_day: number
  session_times: string[] // e.g. ["07:00", "13:00", "21:00"]
  created_at: string
}

export interface ReadingProgress {
  id: string
  user_id: string
  current_page: number
  current_surah: number
  current_ayah: number
  total_pages_read: number
  last_read_at: string
}

export interface DailySession {
  id: string
  user_id: string
  date: string
  session_number: number
  target_pages: number
  pages_read: number
  completed: boolean
  completed_at?: string
}

export interface Streak {
  current_streak: number
  longest_streak: number
  last_completed_date: string
  freeze_available: boolean
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  goal?: Goal
  progress?: ReadingProgress
  streak?: Streak
}

// Reading preferences
export interface ReadingPreferences {
  font_size: 'small' | 'medium' | 'large' | 'huge'
  show_translation: boolean
  show_transliteration: boolean
  show_tajweed: boolean
  reciter: 'Alafasy_128kbps' | 'Abdul_Basit_Murattal_192kbps'
  playback_speed: 0.75 | 1 | 1.25 | 1.5
  haptics: boolean
  sounds: boolean
}
