import { apiClient } from './client'
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  GetSessionsResponse,
  GetStatsResponse,
} from '@pbc/shared'

/**
 * Exercise API endpoints
 */

export const exerciseApi = {
  /**
   * Create a new exercise session
   */
  createSession: async (data: CreateSessionRequest) => {
    const response = await apiClient.post<CreateSessionResponse>('/exercises/sessions', data, {
      requiresAuth: true,
    })
    return response.data!
  },

  /**
   * Get user's exercise sessions
   */
  getSessions: async (params?: { limit?: number; offset?: number; technique?: string }) => {
    const queryString = new URLSearchParams(
      Object.entries(params || {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString()

    const endpoint = queryString ? `/exercises/sessions?${queryString}` : '/exercises/sessions'

    const response = await apiClient.get<GetSessionsResponse>(endpoint, { requiresAuth: true })
    return response.data!
  },

  /**
   * Get exercise statistics
   */
  getStats: async () => {
    const response = await apiClient.get<GetStatsResponse>('/exercises/stats', {
      requiresAuth: true,
    })
    return response.data!
  },
}
