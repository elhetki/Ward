import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  X, SlidersHorizontal, Play, Pause, SkipBack, SkipForward,
  Bookmark, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useVersesByPage } from '../hooks/useQuranApi'
import { useGoal, useProgress, useSessions } from '../hooks/useGoal'
import { useStreak } from '../hooks/useStreak'
import { getAudioUrl } from '../lib/quranApi'
import SessionComplete from '../components/ui/SessionComplete'
import type { ReadingPreferences } from '../types'

const FONT_SIZE_MAP = { small: 22, medium: 28, large: 34, huge: 42 }
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

// Verse skeleton
function VerseSkeleton() {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '32px 28px',
        minHeight: '320px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      }}
    >
      <div style={{ height: '12px', background: '#F2EBE0', borderRadius: '6px', width: '40%', marginLeft: 'auto', marginBottom: '24px' }} />
      <div style={{ height: '28px', background: '#F2EBE0', borderRadius: '6px', marginBottom: '12px' }} />
      <div style={{ height: '28px', background: '#F2EBE0', borderRadius: '6px', width: '80%', marginLeft: 'auto', marginBottom: '24px' }} />
      <div style={{ height: '1px', background: '#E8DDD0', marginBottom: '20px' }} />
      <div style={{ height: '14px', background: '#F2EBE0', borderRadius: '6px', marginBottom: '8px' }} />
      <div style={{ height: '14px', background: '#F2EBE0', borderRadius: '6px', width: '70%' }} />
    </div>
  )
}

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
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: '#FFFFFF',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '24px',
        zIndex: 80,
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      {/* Handle */}
      <div style={{ width: '36px', height: '4px', background: '#E8DDD0', borderRadius: '100px', margin: '0 auto 20px' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1C1917', margin: 0 }}>Preferences</h2>
        <button
          onClick={onClose}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1.5px solid #E8DDD0', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={16} color="#6B6560" />
        </button>
      </div>

      {/* Font size */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '12px' }}>
          Arabic font size
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['small', 'medium', 'large', 'huge'] as const).map((size) => (
            <button
              key={size}
              onClick={() => update({ font_size: size })}
              style={{
                flex: 1,
                padding: '10px 4px',
                borderRadius: '10px',
                border: `2px solid ${prefs.font_size === size ? '#5C8B61' : '#E8DDD0'}`,
                background: prefs.font_size === size ? '#F0F7F1' : '#FFFFFF',
                color: prefs.font_size === size ? '#5C8B61' : '#6B6560',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                textTransform: 'capitalize',
              }}
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
      ].map(({ key, label }) => (
        <div
          key={key}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F2EBE0' }}
        >
          <span style={{ fontSize: '15px', color: '#1C1917', fontWeight: 500 }}>{label}</span>
          <button
            onClick={() => update({ [key]: !prefs[key] })}
            style={{
              width: '48px', height: '28px',
              borderRadius: '100px',
              background: prefs[key] ? '#5C8B61' : '#E8DDD0',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: prefs[key] ? '23px' : '3px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                transition: 'left 0.2s',
              }}
            />
          </button>
        </div>
      ))}

      {/* Reciter */}
      <div style={{ marginTop: '20px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '12px' }}>
          Reciter
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'Alafasy_128kbps' as const, label: 'Alafasy' },
            { id: 'Abdul_Basit_Murattal_192kbps' as const, label: 'Abdul Basit' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => update({ reciter: id })}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '100px',
                border: `2px solid ${prefs.reciter === id ? '#5C8B61' : '#E8DDD0'}`,
                background: prefs.reciter === id ? '#5C8B61' : '#FFFFFF',
                color: prefs.reciter === id ? '#FFFFFF' : '#6B6560',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Reader() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialPage = parseInt(searchParams.get('page') ?? '1', 10)

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [verseIndex, setVerseIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1 prev, 1 next
  const [showSettings, setShowSettings] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [prefs, setPrefs] = useState<ReadingPreferences>(loadPrefs)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
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

  // Session tracking
  const sessionsPerDay = goal?.sessionsPerDay ?? 2
  const currentSessionIdx = doneCount

  // Progress within session (approximate: 1 session = 1 page or so)
  const sessionProgressPercent = totalVerses > 0
    ? Math.round(((verseIndex + 1) / totalVerses) * 100)
    : 0

  // Save progress whenever verse changes
  useEffect(() => {
    if (currentVerse) {
      saveProgress({
        currentPage,
        currentSurah: currentVerse.chapter_id,
        currentAyah: currentVerse.verse_number,
      })
    }
  }, [currentVerse, currentPage, saveProgress])

  // Audio
  const getAudio = useCallback(() => {
    if (!currentVerse) return null
    const [surahStr, ayahStr] = currentVerse.verse_key.split(':')
    const url = getAudioUrl(parseInt(surahStr), parseInt(ayahStr), prefs.reciter)
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
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100)
        }
      }
      audio.onended = () => {
        setIsPlaying(false)
        setAudioProgress(0)
      }
    }
  }, [getAudio, isPlaying])

  // Stop audio when verse changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
      setAudioProgress(0)
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
      // Move to next page
      if (currentPage < 604) {
        setDirection(1)
        setCurrentPage((p) => p + 1)
        setVerseIndex(0)
      }
      // Check session complete
      if (verseIndex === totalVerses - 1) {
        completeSession(currentSessionIdx)
        if (currentSessionIdx < sessionsPerDay - 1 || sessions.completed.every(Boolean)) {
          markDayComplete()
        }
        setShowComplete(true)
      }
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

  const surahName = currentVerse
    ? `Surah ${currentVerse.chapter_id}`
    : ''

  const fontSize = FONT_SIZE_MAP[prefs.font_size]

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
      style={{
        minHeight: '100dvh',
        background: '#F9F5EE',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '480px',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Session progress bar */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0,
          height: '3px',
          width: `${sessionProgressPercent}%`,
          background: progressPulse ? '#7AA37E' : '#5C8B61',
          transition: progressPulse
            ? 'background 0.1s, width 0.5s ease'
            : 'background 0.4s, width 0.5s ease',
          zIndex: 10,
        }}
      />

      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '52px 20px 16px',
        }}
      >
        <button
          onClick={() => navigate('/home')}
          style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            border: '1.5px solid #E8DDD0',
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} color="#1C1917" strokeWidth={2} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', margin: 0 }}>
            Page {currentPage}
          </p>
          <p style={{ fontSize: '11px', color: '#6B6560', margin: '2px 0 0' }}>
            {verseIndex + 1} / {totalVerses} verses
          </p>
        </div>

        <button
          onClick={() => setShowSettings(true)}
          style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            border: '1.5px solid #E8DDD0',
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={18} color="#1C1917" strokeWidth={1.8} />
        </button>
      </div>

      {/* Card area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 20px',
          position: 'relative',
        }}
      >
        {loading ? (
          <div style={{ width: '100%' }}>
            <VerseSkeleton />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#6B6560', padding: '32px' }}>
            <p style={{ fontSize: '16px', marginBottom: '16px' }}>Could not load verses.</p>
            <p style={{ fontSize: '14px' }}>{error}</p>
          </div>
        ) : currentVerse ? (
          <div style={{ width: '100%', position: 'relative' }}>
            {/* Stacked cards behind */}
            <div
              style={{
                position: 'absolute', inset: 0,
                borderRadius: '20px',
                background: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transform: 'translateY(8px) scale(0.97)',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'absolute', inset: 0,
                borderRadius: '20px',
                background: '#FFFFFF',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transform: 'translateY(16px) scale(0.94)',
                zIndex: -1,
              }}
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${currentPage}-${verseIndex}`}
                custom={direction}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) goToNextVerse()
                  if (info.offset.x > 80) goToPrevVerse()
                }}
                initial={{ x: direction * 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -320, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  cursor: 'grab',
                  touchAction: 'pan-y',
                  userSelect: 'none',
                }}
              >
                {/* Card */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)',
                    padding: '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    minHeight: '280px',
                  }}
                >
                  {/* Page/Juz */}
                  <div
                    style={{
                      textAlign: 'right',
                      direction: 'rtl',
                      fontSize: '12px',
                      color: '#9B9690',
                      fontFamily: "'Amiri Quran', serif",
                    }}
                  >
                    صفحة {currentVerse.page_number} | جزء {currentVerse.juz_number}
                  </div>

                  {/* Arabic text */}
                  <div
                    style={{
                      fontFamily: "'Amiri Quran', 'Traditional Arabic', serif",
                      fontSize: `${fontSize}px`,
                      lineHeight: 2.4,
                      direction: 'rtl',
                      textAlign: 'right',
                      color: '#1C1917',
                      wordSpacing: '4px',
                    }}
                  >
                    {currentVerse.text_uthmani}
                    {' '}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        border: '1px solid #5C8B61',
                        fontSize: '10px',
                        color: '#5C8B61',
                        fontFamily: "'Amiri Quran', serif",
                        verticalAlign: 'middle',
                      }}
                    >
                      {currentVerse.verse_key.split(':')[1]}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: '#E8DDD0' }} />

                  {/* Translation */}
                  {prefs.show_translation && currentVerse.translations?.[0] && (
                    <p
                      style={{
                        fontSize: '16px',
                        lineHeight: 1.7,
                        color: '#6B6560',
                        fontStyle: 'italic',
                        margin: 0,
                      }}
                      dangerouslySetInnerHTML={{ __html: currentVerse.translations[0].text }}
                    />
                  )}

                  {/* Caption */}
                  <div style={{ fontSize: '12px', color: '#9B9690', fontWeight: 500, marginTop: 'auto' }}>
                    {currentVerse.verse_key} of {totalVerses} — {surahName}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}
      </div>

      {/* Arrow navigation + swipe hint */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 20px 8px',
        }}
      >
        <button
          onClick={goToPrevVerse}
          style={{
            width: '44px', height: '44px',
            borderRadius: '50%',
            border: '1.5px solid #E8DDD0',
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            opacity: verseIndex === 0 && currentPage === 1 ? 0.4 : 1,
          }}
        >
          <ChevronLeft size={20} color="#1C1917" />
        </button>

        <p style={{ fontSize: '12px', color: '#9B9690', margin: 0 }}>
          Swipe to navigate
        </p>

        <button
          onClick={goToNextVerse}
          style={{
            width: '44px', height: '44px',
            borderRadius: '50%',
            border: '1.5px solid #E8DDD0',
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronRight size={20} color="#1C1917" />
        </button>
      </div>

      {/* Audio bar */}
      <div
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #E8DDD0',
          padding: '12px 20px 28px',
          paddingBottom: 'max(28px, env(safe-area-inset-bottom, 28px))',
        }}
      >
        {/* Seek slider */}
        <input
          type="range"
          min={0}
          max={100}
          value={audioProgress}
          onChange={(e) => {
            const pct = parseInt(e.target.value)
            setAudioProgress(pct)
            if (audioRef.current && audioRef.current.duration) {
              audioRef.current.currentTime = (pct / 100) * audioRef.current.duration
            }
          }}
          style={{
            width: '100%',
            height: '3px',
            appearance: 'none',
            background: `linear-gradient(to right, #5C8B61 ${audioProgress}%, #E8DDD0 ${audioProgress}%)`,
            borderRadius: '100px',
            outline: 'none',
            marginBottom: '12px',
            cursor: 'pointer',
          }}
        />

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Bookmark */}
          <button
            onClick={() => setIsBookmarked((b) => !b)}
            style={{
              width: '40px', height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Bookmark
              size={20}
              color={isBookmarked ? '#5C8B61' : '#6B6560'}
              fill={isBookmarked ? '#5C8B61' : 'none'}
              strokeWidth={1.8}
            />
          </button>

          {/* Prev */}
          <button
            onClick={goToPrevVerse}
            style={{
              width: '40px', height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <SkipBack size={20} color="#1C1917" strokeWidth={1.8} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            style={{
              width: '52px', height: '52px',
              borderRadius: '50%',
              border: 'none',
              background: '#5C8B61',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(92,139,97,0.3)',
            }}
          >
            {isPlaying
              ? <Pause size={22} color="#FFFFFF" fill="#FFFFFF" />
              : <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
            }
          </button>

          {/* Next */}
          <button
            onClick={goToNextVerse}
            style={{
              width: '40px', height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <SkipForward size={20} color="#1C1917" strokeWidth={1.8} />
          </button>

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            style={{
              height: '40px',
              padding: '0 12px',
              borderRadius: '100px',
              border: '1.5px solid #E8DDD0',
              background: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1C1917',
              fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {prefs.playback_speed}x
          </button>
        </div>
      </div>

      {/* Backdrop for settings */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.3)',
                zIndex: 79,
              }}
            />
            <SettingsSheet
              prefs={prefs}
              onChange={setPrefs}
              onClose={() => setShowSettings(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Session complete */}
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
