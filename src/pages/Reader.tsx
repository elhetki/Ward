import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  X, SlidersHorizontal, Play, Pause,
  Bookmark, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useVersesByPage } from '../hooks/useQuranApi'
import { useGoal, useProgress, useSessions } from '../hooks/useGoal'
import { useStreak } from '../hooks/useStreak'
import { getAudioUrl, cleanUthmaniText } from '../lib/quranApi'
import SessionComplete from '../components/ui/SessionComplete'
import { cn } from '../lib/utils'
import type { ReadingPreferences } from '../types'

const FONT_SIZE_MAP = { small: 22, medium: 30, large: 36, huge: 44 }
const SPEED_OPTIONS: ReadingPreferences['playback_speed'][] = [0.75, 1, 1.25, 1.5]

const DEFAULT_PREFS: ReadingPreferences = {
  font_size: 'medium',
  show_translation: true,
  show_transliteration: false,
  show_tajweed: false,
  reciter: 'Alafasy_128kbps',
  playback_speed: 1,
  haptics: true,
  sounds: true,
}

function loadPrefs(): ReadingPreferences {
  try {
    const raw = localStorage.getItem('ward_preferences')
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch { /* noop */ }
  return DEFAULT_PREFS
}

function savePrefs(prefs: ReadingPreferences) {
  localStorage.setItem('ward_preferences', JSON.stringify(prefs))
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function VerseSkeleton() {
  return (
    <div
      className="bg-white rounded-[24px] px-7 py-8"
      style={{ minHeight: '340px', boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)' }}
    >
      <div className="h-3 bg-[#F2EBE0] rounded-full w-1/3 ml-auto mb-8" />
      <div className="h-8 bg-[#F2EBE0] rounded-full mb-3" />
      <div className="h-8 bg-[#F2EBE0] rounded-full w-4/5 mx-auto mb-10" />
      <div className="h-px bg-[#F0EDE8] mb-6" />
      <div className="h-4 bg-[#F2EBE0] rounded-full mb-2 w-full" />
      <div className="h-4 bg-[#F2EBE0] rounded-full w-3/4 mx-auto" />
    </div>
  )
}

// ─── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        'relative w-[52px] h-7 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer',
        on ? 'bg-[#5C8B61]' : 'bg-[#E7E5E4]'
      )}
      style={{ border: 'none', padding: 0 }}
    >
      <span
        className="absolute top-[3px] left-[3px] w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-transform duration-200"
        style={{ transform: on ? 'translateX(24px)' : 'translateX(0)' }}
      />
    </button>
  )
}

// ─── Settings sheet ──────────────────────────────────────────────────────────
interface SettingsSheetProps {
  prefs: ReadingPreferences
  onChange: (prefs: ReadingPreferences) => void
  onClose: () => void
}

function SettingsSheet({ prefs, onChange, onClose }: SettingsSheetProps) {
  const update = (partial: Partial<ReadingPreferences>) => {
    const next = { ...prefs, ...partial }
    onChange(next)
    savePrefs(next)
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 350, damping: 35 }}
      className="fixed bottom-0 left-0 right-0 bg-white overflow-y-auto"
      style={{
        borderTopLeftRadius: '28px',
        borderTopRightRadius: '28px',
        padding: '24px 24px 40px',
        zIndex: 80,
        maxHeight: '80vh',
        maxWidth: '480px',
        margin: '0 auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
      }}
    >
      {/* Handle */}
      <div className="w-10 h-1 bg-[#E7E5E4] rounded-full mx-auto mb-6" />

      <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1C1917', margin: '0 0 24px' }}>
        Reading preferences
      </h2>

      {/* Font size */}
      <div className="mb-6">
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '12px' }}>
          Arabic font size
        </label>
        <div className="flex gap-2">
          {(['small', 'medium', 'large', 'huge'] as const).map((size) => (
            <button
              key={size}
              onClick={() => update({ font_size: size })}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-colors duration-150 capitalize',
                prefs.font_size === size
                  ? 'bg-[#F4FAF5] text-[#5C8B61] border-[#5C8B61]'
                  : 'bg-white text-[#78716C] border-[#E7E5E4]'
              )}
              style={{ border: `1.5px solid ${prefs.font_size === size ? '#5C8B61' : '#E7E5E4'}`, cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      {[
        { key: 'show_translation' as const, label: 'Show Translation' },
        { key: 'show_transliteration' as const, label: 'Show Transliteration' },
        { key: 'sounds' as const, label: 'Sounds' },
        { key: 'haptics' as const, label: 'Haptics' },
      ].map(({ key, label }, idx, arr) => (
        <div
          key={key}
          className={cn(
            'flex items-center justify-between py-4',
            idx < arr.length - 1 && 'border-b border-[#F0EDE8]'
          )}
        >
          <span style={{ fontSize: '15px', color: '#1C1917', fontWeight: 500 }}>{label}</span>
          <Toggle on={!!prefs[key]} onToggle={() => update({ [key]: !prefs[key] })} />
        </div>
      ))}

      {/* Reciter */}
      <div className="mt-6">
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '12px' }}>
          Reciter
        </label>
        <div className="flex gap-2">
          {[
            { id: 'Alafasy_128kbps' as const, label: 'Alafasy' },
            { id: 'Abdul_Basit_Murattal_192kbps' as const, label: 'Abdul Basit' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => update({ reciter: id })}
              className={cn(
                'flex-1 py-3 rounded-full text-[14px] font-semibold transition-colors duration-150',
                prefs.reciter === id ? 'bg-[#1C1917] text-white' : 'bg-white text-[#78716C]'
              )}
              style={{ border: `1.5px solid ${prefs.reciter === id ? '#1C1917' : '#E7E5E4'}`, cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="w-full mt-6 py-4 rounded-2xl text-[15px] font-semibold transition-colors duration-150"
        style={{ background: '#F9F5EE', color: '#1C1917', border: 'none', cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}
      >
        Done
      </button>
    </motion.div>
  )
}

// ─── Main Reader ─────────────────────────────────────────────────────────────
export default function Reader() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialPage = parseInt(searchParams.get('page') ?? '1', 10)

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [verseIndex, setVerseIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [prefs, setPrefs] = useState<ReadingPreferences>(loadPrefs)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [progressPulse, setProgressPulse] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { verses, loading, error } = useVersesByPage(currentPage)
  const { goal } = useGoal()
  const { saveProgress } = useProgress()
  const { sessions, completeSession, doneCount } = useSessions(goal)
  const { streak, markDayComplete } = useStreak()

  const totalVerses = verses.length
  const currentVerse = verses[verseIndex]
  const sessionsPerDay = goal?.sessionsPerDay ?? 2
  const currentSessionIdx = doneCount
  const sessionProgressPercent = totalVerses > 0
    ? Math.round(((verseIndex + 1) / totalVerses) * 100)
    : 0

  const fontSize = FONT_SIZE_MAP[prefs.font_size]
  const [surahId, verseNum] = currentVerse
    ? currentVerse.verse_key.split(':')
    : ['', '']

  // Save progress
  useEffect(() => {
    if (currentVerse) {
      saveProgress({
        currentPage,
        currentSurah: currentVerse.chapter_id,
        currentAyah: currentVerse.verse_number,
      })
    }
  }, [currentVerse, currentPage, saveProgress])

  // Audio helpers
  const getAudio = useCallback(() => {
    if (!currentVerse) return null
    const [sId, aId] = currentVerse.verse_key.split(':')
    const url = getAudioUrl(parseInt(sId), parseInt(aId), prefs.reciter)
    if (!audioRef.current) {
      audioRef.current = new Audio(url)
    } else {
      audioRef.current.src = url
    }
    audioRef.current.playbackRate = prefs.playback_speed
    return audioRef.current
  }, [currentVerse, prefs.reciter, prefs.playback_speed])

  const togglePlay = useCallback(() => {
    const audio = getAudio()
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch(() => {})
      setIsPlaying(true)
      audio.ontimeupdate = () => { /* intentionally empty */ }
      audio.onended = () => { setIsPlaying(false) }
    }
  }, [getAudio, isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
    }
  }, [verseIndex, currentPage])

  const triggerProgressPulse = useCallback(() => {
    setProgressPulse(true)
    setTimeout(() => setProgressPulse(false), 600)
  }, [])

  const goToNextVerse = useCallback(() => {
    triggerProgressPulse()
    if (verseIndex < totalVerses - 1) {
      setDirection(1)
      setVerseIndex((i) => i + 1)
    } else {
      if (currentPage < 604) {
        setDirection(1)
        setCurrentPage((p) => p + 1)
        setVerseIndex(0)
      }
      completeSession(currentSessionIdx)
      if (currentSessionIdx < sessionsPerDay - 1 || sessions.completed.every(Boolean)) {
        markDayComplete()
      }
      setShowComplete(true)
    }
  }, [verseIndex, totalVerses, currentPage, triggerProgressPulse, completeSession, currentSessionIdx, sessionsPerDay, sessions, markDayComplete])

  const goToPrevVerse = useCallback(() => {
    if (verseIndex > 0) {
      setDirection(-1)
      setVerseIndex((i) => i - 1)
    } else if (currentPage > 1) {
      setDirection(-1)
      setCurrentPage((p) => p - 1)
      setVerseIndex(0)
    }
  }, [verseIndex, currentPage])

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(prefs.playback_speed)
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]
    const newPrefs = { ...prefs, playback_speed: next }
    setPrefs(newPrefs)
    savePrefs(newPrefs)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: '#F9F5EE', maxWidth: '480px', margin: '0 auto' }}
    >
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={() => navigate('/home')}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <X size={18} color="#78716C" strokeWidth={2} />
        </button>

        <span style={{ fontSize: '13px', fontWeight: 500, color: '#78716C' }}>
          Page {currentPage}
        </span>

        <button
          onClick={() => setShowSettings(true)}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <SlidersHorizontal size={18} color="#78716C" strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Progress bar ─────────────────────────────────────── */}
      <div className="mx-5 mb-6 h-0.5 bg-[#E7E5E4] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${sessionProgressPercent}%`,
            background: progressPulse ? '#7AA37E' : '#5C8B61',
            transition: 'width 0.4s ease, background 0.2s',
          }}
        />
      </div>

      {/* ── Card area ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5">
        {loading ? (
          <div className="w-full"><VerseSkeleton /></div>
        ) : error ? (
          <div className="text-center px-8">
            <p style={{ fontSize: '16px', color: '#78716C', marginBottom: '8px' }}>Could not load verses.</p>
            <p style={{ fontSize: '14px', color: '#A8A29E' }}>{error}</p>
          </div>
        ) : currentVerse ? (
          <div className="relative w-full">
            {/* Stacked cards behind */}
            <div
              className="absolute inset-x-0 bg-white rounded-[24px]"
              style={{
                top: 0, bottom: 0,
                transform: 'translateY(8px) scaleX(0.91)',
                opacity: 0.5,
                zIndex: -2,
              }}
            />
            <div
              className="absolute inset-x-0 bg-white rounded-[24px]"
              style={{
                top: 0, bottom: 0,
                transform: 'translateY(4px) scaleX(0.96)',
                opacity: 0.75,
                zIndex: -1,
              }}
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${currentPage}-${verseIndex}`}
                custom={direction}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) goToNextVerse()
                  else if (info.offset.x > 80) goToPrevVerse()
                }}
                initial={{ x: direction * 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -60, opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                style={{ position: 'relative', zIndex: 1, cursor: 'grab', touchAction: 'pan-y', userSelect: 'none' }}
              >
                {/* Main card */}
                <div
                  className="bg-white rounded-[24px] px-7 py-8 flex flex-col"
                  style={{
                    minHeight: '340px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Card header */}
                  <div className="flex justify-between items-center mb-6">
                    <span style={{ fontSize: '12px', color: '#A8A29E', fontWeight: 500, letterSpacing: '0.04em' }}>
                      Surah {currentVerse.chapter_id}
                    </span>
                    <span
                      style={{ fontSize: '12px', color: '#A8A29E', fontFamily: "'Amiri Quran', serif", direction: 'rtl' }}
                    >
                      صفحة {currentVerse.page_number} | جزء {currentVerse.juz_number}
                    </span>
                  </div>

                  {/* Arabic text — centered, dir rtl, cleaned text_uthmani */}
                  <div
                    className="flex-1 flex items-center justify-center flex-col"
                  >
                    {/* Arabic text */}
                    <div
                      className="w-full text-center"
                      style={{
                        fontFamily: "'Amiri Quran', 'Traditional Arabic', serif",
                        fontSize: `${fontSize}px`,
                        lineHeight: 2.6,
                        color: '#1C1917',
                        direction: 'rtl',
                      }}
                    >
                      {cleanUthmaniText(currentVerse.text_uthmani)}
                    </div>

                    {/* Verse number ornament — manual, font-independent */}
                    <div className="flex justify-center mt-3 mb-1">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold"
                        style={{
                          border: '1.5px solid #C9C5C0',
                          color: '#78716C',
                          fontFamily: "'Geist', sans-serif",
                        }}
                      >
                        {currentVerse.verse_number}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-[#F0EDE8] my-5" />

                  {/* Translation — centered, clean, not italic */}
                  {prefs.show_translation && currentVerse.translations?.[0] && (
                    <div>
                      <p
                        className="text-center"
                        style={{ fontSize: '17px', color: '#4A4540', lineHeight: 1.8, margin: 0 }}
                        dangerouslySetInnerHTML={{ __html: currentVerse.translations[0].text }}
                      />
                      {/* Verse reference in parentheses */}
                      <p
                        className="text-center mt-3"
                        style={{ fontSize: '15px', color: '#A8A29E', margin: '12px 0 0' }}
                      >
                        ({surahId}:{verseNum})
                      </p>
                    </div>
                  )}

                  {/* Footer — verse ref (if no translation showing) */}
                  {!prefs.show_translation && (
                    <p
                      className="text-center mt-4"
                      style={{ fontSize: '15px', color: '#A8A29E' }}
                    >
                      ({surahId}:{verseNum})
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}
      </div>

      {/* ── Arrow navigation ─────────────────────────────────── */}
      <div className="flex justify-between px-4 mt-4">
        <button
          onClick={goToPrevVerse}
          className="w-8 h-8 flex items-center justify-center transition-colors duration-150 text-[#C9C5C0] hover:text-[#78716C]"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ChevronLeft size={32} strokeWidth={1.5} />
        </button>
        <button
          onClick={goToNextVerse}
          className="w-8 h-8 flex items-center justify-center transition-colors duration-150 text-[#C9C5C0] hover:text-[#78716C]"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ChevronRight size={32} strokeWidth={1.5} />
        </button>
      </div>

      {/* ── Audio bar ────────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 px-6"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid #F0EDE8',
          paddingTop: '16px',
          paddingBottom: 'max(32px, env(safe-area-inset-bottom, 32px))',
          marginTop: '8px',
        }}
      >
        {/* Bookmark */}
        <button
          onClick={() => setIsBookmarked((b) => !b)}
          className="flex items-center justify-center"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Bookmark
            size={20}
            color={isBookmarked ? '#5C8B61' : '#A8A29E'}
            fill={isBookmarked ? '#5C8B61' : 'none'}
            strokeWidth={1.8}
          />
        </button>

        {/* Center group */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          <button
            onClick={goToPrevVerse}
            className="transition-colors duration-150 text-[#78716C] hover:text-[#1C1917]"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: '#1C1917', border: 'none', cursor: 'pointer' }}
          >
            {isPlaying
              ? <Pause size={18} color="#FFFFFF" fill="#FFFFFF" />
              : <Play size={18} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: '2px' }} />
            }
          </button>

          <button
            onClick={goToNextVerse}
            className="transition-colors duration-150 text-[#78716C] hover:text-[#1C1917]"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Speed pill */}
        <button
          onClick={cycleSpeed}
          className="rounded-full px-2.5 py-1"
          style={{ fontSize: '12px', fontWeight: 600, color: '#78716C', background: '#F0EDE8', border: 'none', cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}
        >
          {prefs.playback_speed}x
        </button>
      </div>

      {/* ── Settings backdrop + sheet ────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0"
              style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)', zIndex: 79 }}
            />
            <SettingsSheet
              prefs={prefs}
              onChange={setPrefs}
              onClose={() => setShowSettings(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Session complete ─────────────────────────────────── */}
      <AnimatePresence>
        {showComplete && (
          <SessionComplete
            streakCount={streak.current_streak}
            onKeepReading={() => setShowComplete(false)}
            onDone={() => setShowComplete(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
