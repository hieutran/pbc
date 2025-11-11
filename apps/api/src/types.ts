export interface Env {
  DB: D1Database
  KV: KVNamespace
  JWT_SECRET: string
  REFRESH_SECRET: string
  API_VERSION: string
  ENVIRONMENT: string
}

export interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}
