import { useTranslation } from 'react-i18next'
import { SUPPORTED_LOCALES, getLocaleName, type SupportedLocale } from '@pbc/shared'
import { userApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store/authStore'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  const handleLanguageChange = async (locale: SupportedLocale) => {
    // Change language in i18n
    await i18n.changeLanguage(locale)

    // Update user settings if authenticated
    if (isAuthenticated) {
      try {
        await userApi.updateSettings({ language: locale })
      } catch (error) {
        console.error('Failed to update language preference:', error)
      }
    }
  }

  const currentLanguage = i18n.language as SupportedLocale

  return (
    <div className="relative inline-block">
      <select
        value={currentLanguage}
        onChange={e => handleLanguageChange(e.target.value as SupportedLocale)}
        className="appearance-none bg-white border border-zen-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-zen-900 hover:border-zen-400 focus:outline-none focus:ring-2 focus:ring-zen-200 transition-all cursor-pointer"
        aria-label="Select language"
      >
        {SUPPORTED_LOCALES.map(locale => (
          <option key={locale} value={locale}>
            {getLocaleName(locale, true)}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zen-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  )
}

// Compact version for mobile
export function LanguageSwitcherCompact() {
  const { i18n } = useTranslation()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  const handleLanguageChange = async (locale: SupportedLocale) => {
    await i18n.changeLanguage(locale)

    if (isAuthenticated) {
      try {
        await userApi.updateSettings({ language: locale })
      } catch (error) {
        console.error('Failed to update language preference:', error)
      }
    }
  }

  const currentLanguage = i18n.language as SupportedLocale

  return (
    <button
      onClick={() => {
        const currentIndex = SUPPORTED_LOCALES.indexOf(currentLanguage)
        const nextIndex = (currentIndex + 1) % SUPPORTED_LOCALES.length
        handleLanguageChange(SUPPORTED_LOCALES[nextIndex])
      }}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zen-700 hover:text-zen-900 hover:bg-zen-100 rounded-lg transition-colors"
      aria-label="Switch language"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span className="uppercase">{currentLanguage}</span>
    </button>
  )
}
