import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import BottomNav from '../components/ui/BottomNav'
import { useGoal, useProgress, useSessions } from '../hooks/useGoal'
import { useStreak } from '../hooks/useStreak'
import { cn } from '../lib/utils'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getGregorianDate(): string {
  const now = new Date()
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

// Simple Hijri date approximation
function getHijriDate(): string {
  // Reference: 1 Muharram 1447 = July 7, 2025
  const reference = new Date('2025-07-07')
  const today = new Date()
  const diffDays = Math.floor((today.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24))

  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah',
  ]

  let monthDay = (diffDays % 354) + 1
  let monthIdx = 0
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]
  for (let i = 0; i < 12; i++) {
    if (monthDay <= monthLengths[i]) { monthIdx = i; break }
    monthDay -= monthLengths[i]
  }

  const hijriYear = 1447 + Math.floor(diffDays / 354)
  return `${monthDay} ${hijriMonths[monthIdx]} ${hijriYear}`
}

// SVG circular progress
function CircularProgress({ percent }: { percent: number }) {
  const r = 24
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="flex-shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#E7E5E4" strokeWidth="4" />
      <circle
        cx="28" cy="28" r={r}
        fill="none" stroke="#5C8B61" strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x="28" y="28" textAnchor="middle" dy="0.35em"
        fontSize="10" fontWeight="700" fill="#5C8B61"
        fontFamily="Geist, sans-serif"
      >
        {percent}%
      </text>
    </svg>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { goal } = useGoal()
  const { progress } = useProgress()
  const { sessions, doneCount } = useSessions(goal)
  const { streak, getLast7Days } = useStreak()

  const sessionsPerDay = goal?.sessionsPerDay ?? 2
  const dailyPages = goal?.dailyPages ?? 4
  const startPage = progress.currentPage
  const endPage = Math.min(604, startPage + dailyPages - 1)
  const pagesReadToday = sessions.pagesReadToday
  const progressPercent = Math.min(100, Math.round((pagesReadToday / dailyPages) * 100))
  const last7Days = getLast7Days()

  return (
    <div
      className="min-h-dvh pb-24"
      style={{ background: '#F9F5EE', maxWidth: '480px', margin: '0 auto' }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-6 pt-12 pb-2">
        <div>
          <p style={{ fontSize: '13px', color: '#78716C', letterSpacing: '0.01em', margin: 0 }}>
            {getGregorianDate()}
          </p>
          <p style={{ fontSize: '11px', color: '#A8A29E', letterSpacing: '0.03em', margin: '2px 0 0' }}>
            {getHijriDate()}
          </p>
        </div>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{ border: '1px solid #E7E5E4', background: '#FFFFFF', cursor: 'pointer' }}
        >
          <Bell size={20} color="#78716C" strokeWidth={1.6} />
        </button>
      </div>

      {/* ── Streak ──────────────────────────────────────────── */}
      <div className="px-6 pt-8 pb-6">
        {/* Big number */}
        <div className="flex items-baseline gap-2">
          <span
            style={{ fontSize: '72px', fontWeight: 700, letterSpacing: '-0.04em', color: '#1C1917', lineHeight: 1 }}
          >
            {streak.current_streak}
          </span>
          <span style={{ fontSize: '15px', color: '#78716C', fontWeight: 400 }}>day streak</span>
        </div>

        {/* Weekly dots */}
        <div className="flex gap-2 mt-4">
          {last7Days.map((day, i) => {
            const isToday = i === 6
            const dow = new Date(day.date).getDay()
            const label = DAY_LABELS[dow === 0 ? 6 : dow - 1]
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full',
                    day.completed
                      ? isToday
                        ? 'bg-[#5C8B61] ring-2 ring-[#5C8B61] ring-offset-2 ring-offset-[#F9F5EE]'
                        : 'bg-[#5C8B61]'
                      : 'bg-[#E7E5E4]'
                  )}
                />
                <span style={{ fontSize: '10px', color: '#A8A29E', letterSpacing: '0.05em', textAlign: 'center' }}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Werd card ───────────────────────────────────────── */}
      <div
        className="mx-6 rounded-[20px] p-5"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8A29E' }}>
            Today
          </span>
          <button
            className="text-[11px] font-medium"
            style={{ color: '#5C8B61', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}
          >
            mark done
          </button>
        </div>

        {/* Middle */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p style={{ fontSize: '13px', color: '#78716C', margin: 0 }}>
              Session {doneCount + 1} of {sessionsPerDay}
            </p>
            <p
              style={{ fontSize: '22px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em', margin: '4px 0 2px', lineHeight: 1.2 }}
            >
              {pagesReadToday} / {dailyPages} pages
            </p>
            <p style={{ fontSize: '13px', color: '#A8A29E', margin: 0 }}>
              Pages {startPage} – {endPage}
            </p>
          </div>
          <CircularProgress percent={progressPercent} />
        </div>

        {/* Session dots */}
        <div className="flex gap-1.5 mt-4">
          {Array.from({ length: sessionsPerDay }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: i < doneCount ? '#5C8B61' : '#E7E5E4' }}
            />
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={() => navigate(`/read?page=${progress.currentPage}`)}
          className="w-full rounded-xl mt-4 transition-colors duration-150"
          style={{
            background: '#1C1917', color: '#F9F5EE',
            padding: '14px', fontSize: '14px', fontWeight: 600,
            border: 'none', cursor: 'pointer', fontFamily: "'Geist', sans-serif",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#2C2926')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#1C1917')}
        >
          Continue reading →
        </button>
      </div>

      {/* ── Continue reading preview ─────────────────────────── */}
      <div
        className="mx-6 mt-4 rounded-[20px] p-5"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8A29E', margin: '0 0 12px' }}>
          Continue reading
        </p>

        {/* Arabic preview */}
        <p
          className="text-right"
          style={{
            fontFamily: "'Amiri Quran', serif",
            fontSize: '20px',
            lineHeight: 2.2,
            direction: 'rtl',
            color: '#1C1917',
            margin: '0 0 8px',
          }}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        {/* Translation */}
        <p
          style={{ fontSize: '13px', color: '#78716C', lineHeight: 1.6, margin: 0 }}
          className="line-clamp-2"
        >
          In the name of Allah, the Entirely Merciful, the Especially Merciful.
        </p>
      </div>

      <BottomNav />
    </div>
  )
}
