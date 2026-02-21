import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGoal, calcDailyPagesFromGoal } from '../hooks/useGoal'

function getNextRamadanEnd(): string {
  // Approximate: next Ramadan end (Eid al-Fitr)
  // 2026 Ramadan ends ~March 29, 2026
  const today = new Date()
  const year = today.getFullYear()
  // Approximate dates (shifting ~11 days/year)
  const ramadanEnds = [
    new Date(`${year}-03-29`),
    new Date(`${year + 1}-03-18`),
    new Date(`${year + 2}-03-08`),
  ]
  for (const d of ramadanEnds) {
    if (d > today) return d.toISOString().split('T')[0]
  }
  return ramadanEnds[ramadanEnds.length - 1].toISOString().split('T')[0]
}

function addMonths(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

const PRESET_OPTIONS = [
  { label: 'This Ramadan', subLabel: 'Finish by Eid al-Fitr', getValue: getNextRamadanEnd },
  { label: '3 months', subLabel: '', getValue: () => addMonths(3) },
  { label: '6 months', subLabel: '', getValue: () => addMonths(6) },
  { label: '1 year', subLabel: '', getValue: () => addMonths(12) },
]

const DEFAULT_TIMES = ['07:00', '13:00', '21:00']

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 320 : -320,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -320 : 320,
    opacity: 0,
  }),
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { saveGoal } = useGoal()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // Step 2 state
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [customDate, setCustomDate] = useState('')
  const [sessionsPerDay, setSessionsPerDay] = useState(2)

  // Step 3 state
  const [sessionTimes, setSessionTimes] = useState(DEFAULT_TIMES.slice(0, 2))

  const goNext = () => {
    setDirection(1)
    setStep((s) => s + 1)
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  const handleSessionsChange = (n: number) => {
    setSessionsPerDay(n)
    setSessionTimes(DEFAULT_TIMES.slice(0, n))
  }

  const getTargetDate = (): string => {
    if (selectedPreset !== null) return PRESET_OPTIONS[selectedPreset].getValue()
    if (customDate) return customDate
    return addMonths(6)
  }

  const getDailyPages = (): number => {
    return calcDailyPagesFromGoal(getTargetDate())
  }

  const handleFinish = () => {
    const targetDate = getTargetDate()
    saveGoal({
      targetDate,
      sessionsPerDay,
      sessionTimes: sessionTimes.slice(0, sessionsPerDay),
    })
    navigate('/read?page=1')
  }

  const steps = [
    // Step 1 — Welcome
    <div
      key="step1"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: '16px',
        padding: '40px 32px',
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
        style={{
          fontFamily: "'Amiri Quran', serif",
          fontSize: '72px',
          lineHeight: 1.6,
          color: '#5C8B61',
          direction: 'rtl',
          marginBottom: '8px',
        }}
      >
        وَرْد
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: '32px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#1C1917',
          margin: 0,
        }}
      >
        Ward
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#1C1917',
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        Build your daily Quran habit
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ fontSize: '16px', color: '#6B6560', lineHeight: 1.6, maxWidth: '280px', margin: 0 }}
      >
        Read one verse or one juz — every day counts.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ width: '100%', marginTop: '32px' }}
      >
        <button
          onClick={goNext}
          style={{
            background: '#5C8B61',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            padding: '18px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Get started
        </button>
      </motion.div>
    </div>,

    // Step 2 — Set your goal
    <div
      key="step2"
      style={{
        flex: 1,
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto',
      }}
    >
      <div>
        <p style={{ fontSize: '13px', color: '#5C8B61', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Step 2 of 3
        </p>
        <h2
          style={{
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#1C1917',
            margin: 0,
          }}
        >
          When do you want to finish?
        </h2>
      </div>

      {/* Preset options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {PRESET_OPTIONS.map((opt, i) => {
          const selected = selectedPreset === i
          return (
            <button
              key={i}
              onClick={() => {
                setSelectedPreset(i)
                setCustomDate('')
              }}
              style={{
                background: selected ? '#F0F7F1' : '#FFFFFF',
                border: `2px solid ${selected ? '#5C8B61' : '#E8DDD0'}`,
                borderRadius: '14px',
                padding: '16px 20px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917' }}>
                  {opt.label}
                </div>
                {opt.subLabel && (
                  <div style={{ fontSize: '13px', color: '#6B6560', marginTop: '2px' }}>
                    {opt.subLabel}
                  </div>
                )}
              </div>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${selected ? '#5C8B61' : '#D4C9B8'}`,
                  background: selected ? '#5C8B61' : 'transparent',
                  flexShrink: 0,
                }}
              />
            </button>
          )
        })}

        {/* Custom date */}
        <div style={{ marginTop: '4px' }}>
          <label style={{ fontSize: '13px', color: '#6B6560', display: 'block', marginBottom: '6px' }}>
            Or choose a custom date
          </label>
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value)
              setSelectedPreset(null)
            }}
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1.5px solid #E8DDD0',
              padding: '12px 16px',
              fontSize: '15px',
              color: '#1C1917',
              background: '#FFFFFF',
              fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Sessions per day */}
      <div>
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917', margin: '0 0 12px' }}>
          How many sessions per day?
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => handleSessionsChange(n)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '100px',
                border: `2px solid ${sessionsPerDay === n ? '#5C8B61' : '#E8DDD0'}`,
                background: sessionsPerDay === n ? '#5C8B61' : '#FFFFFF',
                color: sessionsPerDay === n ? '#FFFFFF' : '#6B6560',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Daily pages calc */}
      {(selectedPreset !== null || customDate) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#F0F7F1',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#5C8B61',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 700 }}>
              {getDailyPages()}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#3A5C3E', margin: 0 }}>
            That's <strong>{getDailyPages()} {getDailyPages() === 1 ? 'page' : 'pages'}</strong> per day across {sessionsPerDay} {sessionsPerDay === 1 ? 'session' : 'sessions'}
          </p>
        </motion.div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <button
          onClick={goBack}
          style={{
            flex: 1,
            background: 'transparent',
            color: '#6B6560',
            border: '1.5px solid #E8DDD0',
            borderRadius: '14px',
            padding: '16px',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Back
        </button>
        <button
          onClick={goNext}
          style={{
            flex: 2,
            background: '#5C8B61',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            padding: '16px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Continue
        </button>
      </div>
    </div>,

    // Step 3 — Session times
    <div
      key="step3"
      style={{
        flex: 1,
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div>
        <p style={{ fontSize: '13px', color: '#5C8B61', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Step 3 of 3
        </p>
        <h2
          style={{
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#1C1917',
            margin: 0,
          }}
        >
          When do you want to read?
        </h2>
        <p style={{ fontSize: '15px', color: '#6B6560', marginTop: '8px' }}>
          We'll remind you at these times each day.
        </p>
      </div>

      {/* Time pickers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: sessionsPerDay }).map((_, i) => {
          const labels = ['Morning session', 'Afternoon session', 'Evening session']
          return (
            <div key={i}>
              <label
                style={{
                  fontSize: '13px',
                  color: '#6B6560',
                  fontWeight: 500,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {labels[i]}
              </label>
              <input
                type="time"
                value={sessionTimes[i] ?? DEFAULT_TIMES[i]}
                onChange={(e) => {
                  const next = [...sessionTimes]
                  next[i] = e.target.value
                  setSessionTimes(next)
                }}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  border: '1.5px solid #E8DDD0',
                  padding: '14px 16px',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1C1917',
                  background: '#FFFFFF',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )
        })}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={goBack}
          style={{
            flex: 1,
            background: 'transparent',
            color: '#6B6560',
            border: '1.5px solid #E8DDD0',
            borderRadius: '14px',
            padding: '16px',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Back
        </button>
        <button
          onClick={handleFinish}
          style={{
            flex: 2,
            background: '#5C8B61',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            padding: '16px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Start reading
        </button>
      </div>
    </div>,
  ]

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#F9F5EE',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxWidth: '480px',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Step indicators */}
      {step > 0 && (
        <div style={{ display: 'flex', gap: '6px', padding: '20px 24px 0', justifyContent: 'center' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: '3px',
                flex: 1,
                borderRadius: '100px',
                background: i <= step ? '#5C8B61' : '#E8DDD0',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
