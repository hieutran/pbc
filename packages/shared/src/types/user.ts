export interface User {
  id: string
  email: string
  createdAt: string
  settings?: UserSettings
}

import type { SupportedLocale } from '../constants/locales'

export interface UserSettings {
  defaultTechnique?: BreathingTechnique
  theme?: 'light' | 'dark' | 'auto'
  language?: SupportedLocale
  soundEnabled?: boolean
  reminderEnabled?: boolean
  reminderTime?: string
}

export interface UserRegistration {
  email: string
  password: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export type BreathingTechnique =
  | 'nadi-shodhana'
  | 'ujjayi'
  | 'kapalbhati'
  | 'bhramari'
  | 'wim-hof'
  | 'box-breathing'
  | '4-7-8'
