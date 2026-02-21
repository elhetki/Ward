import { useState } from 'react'
import { Settings, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import BottomNav from '../components/ui/BottomNav'
import { useGoal, useProgress, calcDaysUntil } from '../hooks/useGoal'
import { useStreak } from '../hooks/useStreak'

const TOTAL_QURAN_PAGES = 604

function getJoinDate(): string {
  const raw = localStorage.getItem('ward_goal')
  if (raw) {
    const parsed = JSON.parse(raw)
    return new Date(parsed.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }
  return 'Recently'
}

// Generate weekly activity grid (last 4 weeks)
function getWeeklyActivity(): { date: string; active: boolean }[][] {
  const weeks: { date: string; active: boolean }[][] = []
  const today = new Date()
  // 4 weeks × 7 days = 28 days
  for (let w = 3; w >= 0; w--) {
    const week: { date: string; active: boolean }[] = []
    for (let d = 6; d >= 0; d--) {
      const dt = new Date(today)
      dt.setDate(today.getDate() - (w * 7 + d))
      week.push({
        date: dt.toISOString().split('T')[0],
        active: Math.random() > 0.3, // placeholder — in real app, track actual days
      })
    }
    weeks.push(week)
  }
  return weeks
}

export default function Profile() {
  const { goal } = useGoal()
  const { progress } = useProgress()
  const { streak } = useStreak()
  const [showPrefs, setShowPrefs] = useState(false)

  const totalPagesRead = progress.totalPagesRead
  const overallPercent = Math.round((totalPagesRead / TOTAL_QURAN_PAGES) * 100)
  const joinDate = getJoinDate()
  const weeklyActivity = getWeeklyActivity()

  // Goal status
  let goalStatus: 'on-track' | 'behind' | 'ahead' = 'on-track'
  let daysLeft = 0
  if (goal) {
    daysLeft = calcDaysUntil(goal.targetDate)
    const expectedProgress = Math.round(
      ((calcDaysUntil(goal.createdAt ?? goal.targetDate) - daysLeft) /
        Math.max(1, calcDaysUntil(goal.createdAt ?? goal.targetDate))) *
        TOTAL_QURAN_PAGES
    )
    if (totalPagesRead > expectedProgress + 10) goalStatus = 'ahead'
    else if (totalPagesRead < expectedProgress - 10) goalStatus = 'behind'
  }

  const StatusIcon = goalStatus === 'ahead' ? TrendingUp : goalStatus === 'behind' ? TrendingDown : Minus
  const statusColor = goalStatus === 'ahead' ? '#5C8B61' : goalStatus === 'behind' ? '#C0504D' : '#6B6560'
  const statusLabel = goalStatus === 'ahead' ? 'Ahead of schedule' : goalStatus === 'behind' ? 'Behind schedule' : 'On track'

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
          padding: '56px 24px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#5C8B61',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontFamily: "'Amiri Quran', serif",
                fontSize: '24px',
                color: '#FFFFFF',
              }}
            >
              و
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1C1917', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            Your profile
          </h1>
          <p style={{ fontSize: '14px', color: '#6B6560', margin: 0 }}>
            Reading since {joinDate}
          </p>
        </div>

        <button
          onClick={() => setShowPrefs((s) => !s)}
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
          <Settings size={18} color="#6B6560" strokeWidth={1.8} />
        </button>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Streak card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            display: 'flex',
            gap: '0',
          }}
        >
          <div style={{ flex: 1, borderRight: '1px solid #F2EBE0', paddingRight: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
              Current streak
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '40px', fontWeight: 800, color: '#5C8B61', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {streak.current_streak}
              </span>
              <span style={{ fontSize: '14px', color: '#6B6560' }}>days</span>
            </div>
          </div>
          <div style={{ flex: 1, paddingLeft: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
              Longest streak
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '40px', fontWeight: 800, color: '#1C1917', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {streak.longest_streak}
              </span>
              <span style={{ fontSize: '14px', color: '#6B6560' }}>days</span>
            </div>
          </div>
        </div>

        {/* Overall progress */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
            Overall progress
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917' }}>
              {totalPagesRead} / {TOTAL_QURAN_PAGES} pages
            </span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#5C8B61' }}>
              {overallPercent}%
            </span>
          </div>
          <div
            style={{
              height: '8px',
              background: '#F2EBE0',
              borderRadius: '100px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${overallPercent}%`,
                background: 'linear-gradient(90deg, #5C8B61, #7AA37E)',
                borderRadius: '100px',
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>

        {/* Goal card */}
        {goal && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            }}
          >
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
              Completion goal
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#1C1917' }}>
                {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span style={{ fontSize: '13px', color: '#6B6560' }}>
                {daysLeft} days left
              </span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: goalStatus === 'ahead' ? '#F0F7F1' : goalStatus === 'behind' ? '#FEF2F2' : '#F9F5EE',
                borderRadius: '100px',
                padding: '6px 12px',
              }}
            >
              <StatusIcon size={14} color={statusColor} strokeWidth={2.5} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: statusColor }}>
                {statusLabel}
              </span>
            </div>
          </div>
        )}

        {/* Weekly activity grid */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
            Activity (last 4 weeks)
          </p>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            {weeklyActivity.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={day.date}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: day.active ? '#5C8B61' : '#F2EBE0',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', justifyContent: 'flex-end' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#F2EBE0' }} />
            <span style={{ fontSize: '11px', color: '#9B9690' }}>No reading</span>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#5C8B61', marginLeft: '8px' }} />
            <span style={{ fontSize: '11px', color: '#9B9690' }}>Read</span>
          </div>
        </div>

        {/* Preferences panel (simple inline toggle) */}
        {showPrefs && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            }}
          >
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#1C1917', margin: '0 0 16px' }}>
              Settings
            </p>
            <button
              onClick={() => {
                if (confirm('Reset all your progress and goal? This cannot be undone.')) {
                  localStorage.clear()
                  window.location.href = '/onboarding'
                }
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1.5px solid #F2EBE0',
                background: 'transparent',
                color: '#C0504D',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Reset all progress
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
