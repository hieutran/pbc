import { User, UserLogin, UserRegistration, AuthTokens } from './user'
import { ExerciseSession, ExerciseStats } from './exercise'

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Auth endpoints
export interface RegisterRequest extends UserRegistration {}
export interface RegisterResponse {
  user: User
  tokens: AuthTokens
}

export interface LoginRequest extends UserLogin {}
export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  tokens: AuthTokens
}

// Exercise endpoints
export interface CreateSessionRequest {
  technique: string
  duration: number
  settings: Record<string, unknown>
}

export interface CreateSessionResponse {
  session: ExerciseSession
}

export interface GetSessionsRequest {
  limit?: number
  offset?: number
  technique?: string
  startDate?: string
  endDate?: string
}

export interface GetSessionsResponse {
  sessions: ExerciseSession[]
  total: number
}

export interface GetStatsResponse {
  stats: ExerciseStats
}

// User endpoints
export interface UpdateUserSettingsRequest {
  settings: Record<string, unknown>
}

export interface UpdateUserSettingsResponse {
  user: User
}
