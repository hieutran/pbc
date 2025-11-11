/**
 * Supported locales and language configuration
 */

export const SUPPORTED_LOCALES = ['en', 'vi', 'es', 'fr', 'de', 'ja', 'zh'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'en'

export const LOCALE_NAMES: Record<SupportedLocale, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  vi: { native: 'Tiếng Việt', english: 'Vietnamese' },
  es: { native: 'Español', english: 'Spanish' },
  fr: { native: 'Français', english: 'French' },
  de: { native: 'Deutsch', english: 'German' },
  ja: { native: '日本語', english: 'Japanese' },
  zh: { native: '中文', english: 'Chinese' },
}

export const RTL_LOCALES: SupportedLocale[] = []

export function isRTL(locale: SupportedLocale): boolean {
  return RTL_LOCALES.includes(locale)
}

export function getLocaleName(locale: SupportedLocale, useNative = true): string {
  return useNative ? LOCALE_NAMES[locale].native : LOCALE_NAMES[locale].english
}
