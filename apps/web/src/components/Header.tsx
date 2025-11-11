import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/store/authStore'

export function Header() {
  const { isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-zen-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-display font-bold text-zen-900">
          🌬️ Breath Coach
        </Link>

        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-zen-700 hover:text-zen-900 transition-colors">
                Dashboard
              </Link>
              <Link to="/history" className="text-zen-700 hover:text-zen-900 transition-colors">
                History
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-zen-700 hover:text-zen-900 transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
