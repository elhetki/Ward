import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Reader from './pages/Reader'
import QuranBrowser from './pages/QuranBrowser'
import Profile from './pages/Profile'

function hasGoal(): boolean {
  return !!localStorage.getItem('ward_goal')
}

function RootRedirect() {
  return <Navigate to={hasGoal() ? '/home' : '/onboarding'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/read" element={<Reader />} />
        <Route path="/quran" element={<QuranBrowser />} />
        <Route path="/profile" element={<Profile />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
