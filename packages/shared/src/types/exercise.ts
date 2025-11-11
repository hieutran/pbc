import { BreathingTechnique } from './user'

export interface ExerciseSession {
  id: string
  userId: string
  technique: BreathingTechnique
  duration: number // in seconds
  settings: ExerciseSettings
  completedAt: string
  cycles?: number
}

export interface ExerciseSettings {
  inhale?: number // seconds
  exhale?: number // seconds
  holdInhale?: number // seconds
  holdExhale?: number // seconds
  cycles?: number
  pace?: 'slow' | 'medium' | 'fast'
  soundEnabled?: boolean
  hapticEnabled?: boolean
}

export interface TechniqueConfig {
  id: BreathingTechnique
  name: string
  description: string
  benefits: string[]
  defaultSettings: ExerciseSettings
  instructions: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: {
    min: number
    max: number
    default: number
  }
}

export interface ExerciseHistoryItem {
  date: string
  sessions: ExerciseSession[]
  totalDuration: number
  totalCycles: number
}

export interface ExerciseStats {
  totalSessions: number
  totalDuration: number
  totalCycles: number
  favoriteTechnique: BreathingTechnique
  currentStreak: number
  longestStreak: number
  sessionsPerTechnique: Record<BreathingTechnique, number>
}
