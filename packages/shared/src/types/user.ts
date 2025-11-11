export interface User {
  id: string
  email: string
  createdAt: string
  settings?: UserSettings
}

import type { SupportedLocale } from '../constants/locales'

export type BackgroundMusicType = 'zen' | 'nature' | 'rain' | 'ocean' | 'forest' | 'none'

export interface UserSettings {
  defaultTechnique?: BreathingTechnique
  theme?: 'light' | 'dark' | 'auto'
  language?: SupportedLocale
  soundEnabled?: boolean
  tickSoundEnabled?: boolean
  backgroundMusicEnabled?: boolean
  backgroundMusicType?: BackgroundMusicType
  audioVolume?: number // 0-100
  musicVolume?: number // 0-100
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
