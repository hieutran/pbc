import type { ApiResponse } from '@pbc/shared'

/**
 * Base API client with authentication and error handling
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface RequestConfig extends RequestInit {
  requiresAuth?: boolean
  baseURL?: string
}

class ApiClient {
  private baseURL: string
  private getAccessToken: () => string | null

  constructor(baseURL: string, getAccessToken: () => string | null) {
    this.baseURL = baseURL
    this.getAccessToken = getAccessToken
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { requiresAuth = false, baseURL = this.baseURL, ...fetchConfig } = config

    const url = `${baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    }

    // Add auth token if required
    if (requiresAuth) {
      const token = this.getAccessToken()
      if (!token) {
        throw new ApiError(401, 'UNAUTHORIZED', 'No access token available')
      }
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.error?.code || 'UNKNOWN_ERROR',
          data.error?.message || 'An error occurred',
          data.error?.details
        )
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Network or other errors
      throw new ApiError(0, 'NETWORK_ERROR', error instanceof Error ? error.message : 'Network error')
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// Create API client instance
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

// This will be set by the auth store
let getAccessTokenFn: () => string | null = () => null

export function setTokenGetter(fn: () => string | null) {
  getAccessTokenFn = fn
}

export const apiClient = new ApiClient(API_BASE_URL, () => getAccessTokenFn())
