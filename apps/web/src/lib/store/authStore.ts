import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@pbc/shared'
import { setTokenGetter, authApi, ApiError } from '../api'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => Promise<void>
  clearError: () => void
  refreshAccessToken: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          error: null,
        })
      },

      logout: async () => {
        try {
          // Call logout API if we have a token
          if (get().accessToken) {
            await authApi.logout()
          }
        } catch (error) {
          // Ignore logout errors, still clear local state
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          })
        }
      },

      clearError: () => set({ error: null }),

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken
        if (!refreshToken) {
          return false
        }

        try {
          const data = await authApi.refreshToken(refreshToken)
          set({
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
          })
          return true
        } catch (error) {
          // Refresh failed, logout
          get().logout()
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Setup token getter for API client
setTokenGetter(() => useAuthStore.getState().accessToken)

// Setup automatic token refresh on 401 errors
// This could be enhanced with axios interceptors or similar
export async function handleApiError(error: unknown) {
  if (error instanceof ApiError && error.statusCode === 401) {
    const refreshed = await useAuthStore.getState().refreshAccessToken()
    return refreshed
  }
  return false
}
