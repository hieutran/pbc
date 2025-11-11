import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Env } from './types'
import { authRoutes } from './routes/auth'
import { exerciseRoutes } from './routes/exercise'
import { userRoutes } from './routes/user'
import { errorHandler } from './middleware/errorHandler'
import { API_VERSION } from '@pbc/shared'

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://breathcoach.app'],
    credentials: true,
  })
)

// Health check
app.get('/health', c => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: API_VERSION,
  })
})

// API Routes
const api = app.basePath(`/api/${API_VERSION}`)
api.route('/auth', authRoutes)
api.route('/exercises', exerciseRoutes)
api.route('/user', userRoutes)

// 404 handler
app.notFound(c => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
      },
    },
    404
  )
})

// Error handler
app.onError(errorHandler)

export default app
