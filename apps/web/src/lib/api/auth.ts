import { apiClient } from './client'
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from '@pbc/shared'

/**
 * Authentication API endpoints
 */

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data)
    return response.data!
  },

  /**
   * Login a user
   */
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data!
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data!
  },

  /**
   * Logout
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout', undefined, { requiresAuth: true })
    return response.data
  },
}
