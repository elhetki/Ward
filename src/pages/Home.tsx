import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import BottomNav from '../components/ui/BottomNav'
import { useGoal, useProgress, useSessions } from '../hooks/useGoal'
import { useStreak } from '../hooks/useStreak'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getGregorianDate(): string {
  const now = new Date()
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

// Simple Hijri date approximation
function getHijriDate(): string {
  // Using a simple algorithm: reference point 1 Muharram 1447 = July 7, 2025
  const reference = new Date('2025-07-07')
  const today = new Date()
  const diffDays = Math.floor((today.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24))
  const hijriDay = (diffDays % 354) + 1

  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ]

  let monthDay = hijriDay
  let monthIdx = 0
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]
  for (let i = 0; i < 12; i++) {
    if (monthDay <= monthLengths[i]) {
      monthIdx = i
      break
    }
    monthDay -= monthLengths[i]
  }

  const hijriYear = 1447 + Math.floor(diffDays / 354)
  return `${monthDay} ${hijriMonths[monthIdx]} ${hijriYear}`
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

  // SVG circular progress
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (progressPercent / 100) * circumference

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#F9F5EE',
        paddingBottom: '80px',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '56px 24px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1C1917',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            {getGregorianDate()}
          </p>
          <p style={{ fontSize: '13px', color: '#6B6560', margin: '2px 0 0', fontWeight: 400 }}>
            {getHijriDate()}
          </p>
        </div>

        <button
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1.5px solid #E8DDD0',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Bell size={18} color="#6B6560" strokeWidth={1.8} />
        </button>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Werd card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
            Your werd today
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Left side info */}
            <div style={{ flex: 1 }}>
              {/* Session dots */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                {Array.from({ length: sessionsPerDay }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: i < doneCount ? '#5C8B61' : 'transparent',
                      border: `2px solid ${i < doneCount ? '#5C8B61' : '#D4C9B8'}`,
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
                <span style={{ fontSize: '12px', color: '#6B6560', marginLeft: '4px' }}>
                  Session {doneCount + 1} of {sessionsPerDay}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>
                    {pagesReadToday} / {dailyPages} pages
                  </span>
                  <span style={{ fontSize: '12px', color: '#6B6560' }}>
                    Pages {startPage}–{endPage}
                  </span>
                </div>
                <div
                  style={{
                    height: '5px',
                    background: '#E8DDD0',
                    borderRadius: '100px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      background: '#5C8B61',
                      borderRadius: '100px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Circular progress */}
            <svg width="88" height="88" style={{ flexShrink: 0 }}>
              <circle cx="44" cy="44" r={radius} fill="none" stroke="#E8DDD0" strokeWidth="6" />
              <circle
                cx="44"
                cy="44"
                r={radius}
                fill="none"
                stroke="#5C8B61"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 44 44)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
              <text
                x="44"
                y="44"
                textAnchor="middle"
                dy="0.35em"
                fontSize="14"
                fontWeight="700"
                fill="#1C1917"
                fontFamily="Geist, sans-serif"
              >
                {progressPercent}%
              </text>
            </svg>
          </div>

          {/* Continue reading button */}
          <button
            onClick={() => navigate(`/read?page=${progress.currentPage}`)}
            style={{
              width: '100%',
              background: '#5C8B61',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '16px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Continue reading
          </button>
        </div>

        {/* Streak section */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
            Your streak
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px' }}>
            <span
              style={{
                fontSize: '48px',
                fontWeight: 800,
                color: '#5C8B61',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              {streak.current_streak}
            </span>
            <span style={{ fontSize: '16px', color: '#6B6560', fontWeight: 500 }}>days</span>
          </div>

          {/* Weekly strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {last7Days.map((day, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: day.completed ? '#5C8B61' : '#F2EBE0',
                    border: `2px solid ${day.completed ? '#5C8B61' : '#E8DDD0'}`,
                    transition: 'all 0.2s',
                  }}
                />
                <span style={{ fontSize: '10px', color: '#9B9690', fontWeight: 500 }}>
                  {DAY_LABELS[new Date(day.date).getDay() === 0 ? 6 : new Date(day.date).getDay() - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Continue reading preview */}
        <button
          onClick={() => navigate(`/read?page=${progress.currentPage}`)}
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '20px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
            Continue reading
          </p>
          <p
            style={{
              fontFamily: "'Amiri Quran', serif",
              fontSize: '20px',
              lineHeight: 2.2,
              direction: 'rtl',
              textAlign: 'right',
              color: '#1C1917',
              margin: '0 0 8px',
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p style={{ fontSize: '13px', color: '#6B6560', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
          </p>
          <p style={{ fontSize: '12px', color: '#9B9690', margin: '8px 0 0', fontWeight: 500 }}>
            Page {progress.currentPage} — Al-Fatiha 1:1
          </p>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
