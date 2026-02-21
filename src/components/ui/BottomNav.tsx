import { BookOpen, Home, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/quran', icon: BookOpen, label: 'Quran' },
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E8DDD0',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all"
              style={{ color: active ? '#5C8B61' : '#6B6560' }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span
                className="text-xs font-medium"
                style={{ fontSize: '11px', fontWeight: active ? 600 : 400 }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
