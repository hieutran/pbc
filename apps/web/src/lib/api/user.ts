import { apiClient } from './client'
import type { UpdateUserSettingsRequest, UpdateUserSettingsResponse } from '@pbc/shared'

/**
 * User API endpoints
 */

export const userApi = {
  /**
   * Get current user
   */
  getMe: async () => {
    const response = await apiClient.get<{ user: any }>('/user/me', { requiresAuth: true })
    return response.data!
  },

  /**
   * Update user settings
   */
  updateSettings: async (settings: UpdateUserSettingsRequest['settings']) => {
    const response = await apiClient.patch<UpdateUserSettingsResponse>(
      '/user/settings',
      settings,
      { requiresAuth: true }
    )
    return response.data!
  },
}
