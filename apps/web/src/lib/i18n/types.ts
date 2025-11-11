/**
 * Type-safe translation keys
 *
 * This file provides TypeScript autocompletion for translation keys.
 * Update this when adding new translation keys.
 */

export type TranslationNamespace =
  | 'common'
  | 'auth'
  | 'techniques'
  | 'dashboard'
  | 'exercise'
  | 'history'
  | 'settings'

// Common namespace keys
export type CommonTranslationKey =
  | 'app.name'
  | 'app.tagline'
  | 'navigation.home'
  | 'navigation.dashboard'
  | 'navigation.history'
  | 'navigation.login'
  | 'navigation.register'
  | 'navigation.logout'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.close'
  | 'common.back'
  | 'common.next'
  | 'common.submit'
  | 'common.confirm'
  | 'common.search'
  | 'common.filter'
  | 'common.sort'
  | 'common.settings'
  | 'common.profile'
  | 'common.language'
  | 'errors.generic'
  | 'errors.network'
  | 'errors.unauthorized'
  | 'errors.notFound'
  | 'errors.validation'
  | 'errors.serverError'

// Auth namespace keys
export type AuthTranslationKey =
  | 'login.title'
  | 'login.subtitle'
  | 'login.email'
  | 'login.password'
  | 'login.submit'
  | 'register.title'
  | 'register.subtitle'
  | 'register.email'
  | 'register.password'
  | 'register.confirmPassword'
  | 'register.submit'

// Type-safe useTranslation hook
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: Record<CommonTranslationKey, string>
      auth: Record<AuthTranslationKey, string>
      techniques: Record<string, unknown>
      dashboard: Record<string, unknown>
      exercise: Record<string, unknown>
      history: Record<string, unknown>
      settings: Record<string, unknown>
    }
  }
}
