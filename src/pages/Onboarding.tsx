import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useGoal, calcDailyPagesFromGoal } from '../hooks/useGoal'
import { cn } from '../lib/utils'

function getNextRamadanEnd(): string {
  const today = new Date()
  const year = today.getFullYear()
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
  { label: '3 months', subLabel: 'A focused sprint', getValue: () => addMonths(3) },
  { label: '6 months', subLabel: 'Steady and sure', getValue: () => addMonths(6) },
  { label: '1 year', subLabel: 'One page at a time', getValue: () => addMonths(12) },
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

  // ─── Step 1: Welcome ────────────────────────────────────────────────────────
  const StepWelcome = (
    <div key="step1" className="flex flex-col items-center flex-1 overflow-hidden">
      {/* Top space */}
      <div style={{ height: '15vh' }} />

      {/* وَرْد */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
        style={{ fontFamily: "'Amiri Quran', serif", fontSize: 'clamp(80px, 20vw, 96px)', color: '#5C8B61', direction: 'rtl', letterSpacing: '0.02em', lineHeight: 1.4 }}
      >
        وَرْد
      </motion.div>

      {/* Ward label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="text-center mt-1"
        style={{ fontFamily: "'Geist', sans-serif", fontSize: '15px', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#78716C' }}
      >
        Ward
      </motion.p>

      {/* Gap */}
      <div style={{ height: '8vh' }} />

      {/* Tagline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center px-8"
        style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: '#1C1917', maxWidth: '260px', margin: '0 auto' }}
      >
        Build your daily Quran habit.
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        style={{ fontSize: '15px', color: '#78716C', marginTop: '8px' }}
        className="text-center"
      >
        One verse at a time.
      </motion.p>

      {/* Push button to bottom */}
      <div className="flex-1" />

      {/* CTA button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full px-6 pb-12"
        style={{ paddingBottom: 'max(48px, env(safe-area-inset-bottom, 48px))' }}
      >
        <button
          onClick={goNext}
          className="w-full rounded-[14px] text-[#F9F5EE] transition-colors duration-150"
          style={{ background: '#1C1917', padding: '18px 24px', fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em', border: 'none', cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#2C2926')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#1C1917')}
        >
          Get started
        </button>
      </motion.div>
    </div>
  )

  // ─── Step 2: Goal ───────────────────────────────────────────────────────────
  const StepGoal = (
    <div key="step2" className="flex flex-col flex-1 overflow-y-auto" style={{ padding: '0 24px 32px' }}>
      {/* Header row */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <button
          onClick={goBack}
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{ border: '1px solid #E7E5E4', background: '#FFFFFF', cursor: 'pointer' }}
        >
          <ChevronLeft size={18} color="#78716C" />
        </button>
        <span style={{ fontSize: '13px', color: '#A8A29E', fontWeight: 500 }}>2 / 3</span>
      </div>

      <h2
        style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#1C1917', margin: '0 0 28px' }}
      >
        When do you want to finish?
      </h2>

      {/* Preset cards */}
      <div className="flex flex-col gap-3 mb-5">
        {PRESET_OPTIONS.map((opt, i) => {
          const selected = selectedPreset === i
          return (
            <button
              key={i}
              onClick={() => { setSelectedPreset(i); setCustomDate('') }}
              className={cn(
                'flex items-center justify-between rounded-2xl p-4 text-left transition-colors duration-150',
                selected
                  ? 'border-[#5C8B61] bg-[#F4FAF5]'
                  : 'border-[#E7E5E4] bg-white hover:border-[#C5D9C7]'
              )}
              style={{ border: `1.5px solid ${selected ? '#5C8B61' : '#E7E5E4'}`, cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}
            >
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917' }}>{opt.label}</div>
                {opt.subLabel && (
                  <div style={{ fontSize: '13px', color: '#78716C', marginTop: '2px' }}>{opt.subLabel}</div>
                )}
              </div>
              <div
                className="flex-shrink-0"
                style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: `2px solid ${selected ? '#5C8B61' : '#D4D0C8'}`,
                  background: selected ? '#5C8B61' : 'transparent',
                }}
              />
            </button>
          )
        })}

        {/* Custom date */}
        <div className="mt-1">
          <label style={{ fontSize: '13px', color: '#78716C', display: 'block', marginBottom: '6px' }}>
            Or choose a custom date
          </label>
          <input
            type="date"
            value={customDate}
            onChange={(e) => { setCustomDate(e.target.value); setSelectedPreset(null) }}
            className="w-full rounded-xl"
            style={{
              border: '1.5px solid #E7E5E4', padding: '12px 16px', fontSize: '15px',
              color: '#1C1917', background: '#FFFFFF', fontFamily: "'Geist', sans-serif",
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Sessions per day */}
      <div className="mb-5">
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#1C1917', margin: '0 0 12px' }}>
          Sessions per day
        </p>
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => handleSessionsChange(n)}
              className={cn(
                'flex-1 py-3 rounded-full text-[15px] font-semibold transition-colors duration-150',
                sessionsPerDay === n
                  ? 'bg-[#1C1917] text-white border-[#1C1917]'
                  : 'bg-white text-[#78716C] border-[#E7E5E4]'
              )}
              style={{ border: `1.5px solid ${sessionsPerDay === n ? '#1C1917' : '#E7E5E4'}`, cursor: 'pointer', fontFamily: "'Geist', sans-serif" }}
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
          className="rounded-2xl p-4 mb-5"
          style={{ background: '#F4FAF5' }}
        >
          <p style={{ fontSize: '14px', color: '#3A5C3E', margin: 0 }}>
            <strong style={{ fontSize: '22px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em', display: 'block' }}>
              {getDailyPages()} pages per day
            </strong>
            Across {sessionsPerDay} {sessionsPerDay === 1 ? 'session' : 'sessions'} — you can do this.
          </p>
        </motion.div>
      )}

      <div className="flex-1" />

      {/* Continue button */}
      <button
        onClick={goNext}
        className="w-full rounded-2xl transition-colors duration-150"
        style={{ background: '#1C1917', color: '#F9F5EE', padding: '16px', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: "'Geist', sans-serif", letterSpacing: '-0.01em' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#2C2926')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#1C1917')}
      >
        Continue
      </button>
    </div>
  )

  // ─── Step 3: Times ──────────────────────────────────────────────────────────
  const StepTimes = (
    <div key="step3" className="flex flex-col flex-1" style={{ padding: '0 24px 32px' }}>
      {/* Header row */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <button
          onClick={goBack}
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{ border: '1px solid #E7E5E4', background: '#FFFFFF', cursor: 'pointer' }}
        >
          <ChevronLeft size={18} color="#78716C" />
        </button>
        <span style={{ fontSize: '13px', color: '#A8A29E', fontWeight: 500 }}>3 / 3</span>
      </div>

      <h2
        style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: '#1C1917', margin: '0 0 8px' }}
      >
        When do you want to read?
      </h2>
      <p style={{ fontSize: '15px', color: '#78716C', margin: '0 0 32px' }}>
        We'll remind you at these times each day.
      </p>

      {/* Time pickers */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: sessionsPerDay }).map((_, i) => {
          const labels = ['Morning session', 'Afternoon session', 'Evening session']
          return (
            <div key={i}>
              <label style={{ fontSize: '13px', color: '#78716C', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
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
                className="w-full rounded-xl"
                style={{
                  border: '1.5px solid #E7E5E4', padding: '14px 16px',
                  fontSize: '18px', fontWeight: 600, color: '#1C1917',
                  background: '#FFFFFF', fontFamily: "'Geist', sans-serif",
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )
        })}
      </div>

      <div className="flex-1" />

      {/* Start reading button */}
      <button
        onClick={handleFinish}
        className="w-full rounded-2xl transition-colors duration-150"
        style={{ background: '#5C8B61', color: '#FFFFFF', padding: '16px', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: "'Geist', sans-serif", letterSpacing: '-0.01em' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#4A7450')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#5C8B61')}
      >
        Start reading
      </button>
    </div>
  )

  const steps = [StepWelcome, StepGoal, StepTimes]

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ minHeight: '100dvh', background: '#F9F5EE', maxWidth: '480px', margin: '0 auto', position: 'relative' }}
    >
      {/* Step progress bar (steps 2 & 3 only) */}
      {step > 0 && (
        <div className="flex gap-1.5 px-6 pt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-300"
              style={{ height: '2px', background: i < step ? '#5C8B61' : '#E7E5E4' }}
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
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="flex flex-col flex-1"
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
