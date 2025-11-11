import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/store/authStore'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Header() {
  const { t } = useTranslation()
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
          🌬️ {t('app.name')}
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-zen-700 hover:text-zen-900 transition-colors">
                {t('navigation.dashboard')}
              </Link>
              <Link to="/history" className="text-zen-700 hover:text-zen-900 transition-colors">
                {t('navigation.history')}
              </Link>
              <LanguageSwitcher />
              <button onClick={handleLogout} className="btn-secondary text-sm">
                {t('navigation.logout')}
              </button>
            </>
          ) : (
            <>
              <LanguageSwitcher />
              <Link to="/login" className="text-zen-700 hover:text-zen-900 transition-colors">
                {t('navigation.login')}
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                {t('navigation.register')}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
