import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'

interface SessionCompleteProps {
  streakCount: number
  onKeepReading: () => void
  onDone: () => void
}

export default function SessionComplete({
  streakCount,
  onKeepReading,
  onDone,
}: SessionCompleteProps) {
  const navigate = useNavigate()

  const handleDone = () => {
    onDone()
    navigate('/home')
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        background: '#F9F5EE',
      }}
    >
      {/* Green top section */}
      <div
        style={{
          background: '#5C8B61',
          padding: '60px 32px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          borderBottomLeftRadius: '32px',
          borderBottomRightRadius: '32px',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Star size={36} color="#FFFFFF" fill="#FFFFFF" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            color: '#FFFFFF',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Session complete
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: 0 }}
        >
          Excellent work today
        </motion.p>
      </div>

      {/* Stats */}
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        {/* Streak card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#F0F7F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#5C8B61' }}>
              {streakCount}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1C1917' }}>
              Day streak
            </div>
            <div style={{ fontSize: '14px', color: '#6B6560', marginTop: '2px' }}>
              Keep it going tomorrow
            </div>
          </div>
        </motion.div>

        {/* Inspirational verse */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: '#F0F7F1',
            borderRadius: '20px',
            padding: '24px',
            direction: 'rtl',
            textAlign: 'right',
          }}
        >
          <p
            style={{
              fontFamily: "'Amiri Quran', serif",
              fontSize: '22px',
              lineHeight: 2.2,
              color: '#3A5C3E',
              margin: '0 0 12px',
            }}
          >
            وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
          </p>
          <p style={{ fontSize: '13px', color: '#5C8B61', margin: 0, direction: 'ltr', textAlign: 'left' }}>
            "And recite the Quran with measured recitation." — 73:4
          </p>
        </motion.div>

        <div style={{ flex: 1 }} />

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <button
            onClick={onKeepReading}
            style={{
              background: '#5C8B61',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Keep reading
          </button>
          <button
            onClick={handleDone}
            style={{
              background: 'transparent',
              color: '#6B6560',
              border: '1.5px solid #E8DDD0',
              borderRadius: '14px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              width: '100%',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Done for today
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
