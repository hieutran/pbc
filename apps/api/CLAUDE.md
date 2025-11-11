# CLAUDE.md - Backend API

> Context for working with the Cloudflare Workers backend

## 🎯 Overview

**Stack**: Cloudflare Workers + Hono + D1 + KV
**Purpose**: RESTful API for Personal Breath Coach
**Runtime**: V8 Isolate (Cloudflare Workers)

---

## 📁 Directory Structure

```
apps/api/
├── src/
│   ├── lib/              # Core utilities
│   │   ├── crypto.ts     # PBKDF2 password hashing
│   │   ├── jwt.ts        # JWT generation & verification
│   │   ├── errors.ts     # Custom error classes
│   │   ├── logger.ts     # Structured JSON logging
│   │   └── rateLimiter.ts # Sliding window rate limiting
│   │
│   ├── middleware/       # Hono middleware
│   │   ├── auth.ts       # JWT verification
│   │   ├── errorHandler.ts # Global error handling
│   │   └── rateLimiter.ts # Rate limit middleware
│   │
│   ├── services/         # Business logic layer
│   │   ├── authService.ts  # Auth operations
│   │   └── repositories.ts # Database access
│   │
│   ├── routes/           # API endpoints
│   │   ├── auth.ts       # POST /auth/register, /login, /refresh, /logout
│   │   ├── exercise.ts   # GET/POST /exercises/sessions, /stats
│   │   └── user.ts       # GET /user/me, PATCH /user/settings
│   │
│   ├── types.ts          # TypeScript types (Env, JWTPayload)
│   └── index.ts          # App entry point
│
├── migrations/           # D1 SQL migrations
│   ├── 0000_meta.json
│   └── 0001_initial_schema.sql
│
├── wrangler.toml         # Cloudflare Workers config
├── package.json
└── tsconfig.json
```

---

## 🏗️ Architecture Layers

### ⚠️ CRITICAL: Follow This Pattern

```
Routes → Services → Repositories → Database
```

**Each layer has a specific responsibility:**

1. **Routes** (`src/routes/`): HTTP handling only
   - Parse request
   - Validate input with Zod
   - Call service layer
   - Format response
   - Handle HTTP-specific concerns

2. **Services** (`src/services/`): Business logic only
   - Orchestrate operations
   - Apply business rules
   - Manage transactions
   - NO HTTP concerns
   - NO direct database queries

3. **Repositories** (`src/services/repositories.ts`): Database only
   - Execute SQL queries
   - Map database rows to objects
   - Handle database errors
   - NO business logic

---

## 🔑 Key Patterns

### Pattern 1: Route Handler

```typescript
// src/routes/auth.ts
authRoutes.post('/login', async c => {
  const body = await c.req.json()

  // 1. Validate input
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw new ValidationError('Invalid input', result.error.errors)
  }

  // 2. Call service
  const authService = new AuthService(c.env, c.env.DB)
  const data = await authService.login(result.data)

  // 3. Return response
  return c.json({ success: true, data }, HTTP_STATUS.OK)
})
```

**✅ DO:**
- Validate all input with Zod
- Use service layer
- Throw custom errors
- Return consistent format

**❌ DON'T:**
- Query database directly
- Implement business logic
- Return inconsistent responses
- Swallow errors

---

### Pattern 2: Service Class

```typescript
// src/services/authService.ts
export class AuthService {
  private userRepo: UserRepository

  constructor(
    private env: Env,
    private db: D1Database
  ) {
    this.userRepo = new UserRepository(db)
  }

  async login(input: LoginInput): Promise<AuthResult> {
    // 1. Fetch from repository
    const user = await this.userRepo.findByEmail(input.email)
    if (!user) {
      throw new AuthenticationError('Invalid credentials')
    }

    // 2. Business logic
    const isValid = await verifyPassword(input.password, user.password_hash)
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials')
    }

    // 3. Generate tokens
    const tokens = await generateTokenPair(
      user.id,
      user.email,
      this.env.JWT_SECRET,
      this.env.REFRESH_SECRET
    )

    // 4. Store refresh token
    await this.env.KV.put(`refresh_token:${user.id}`, tokens.refreshToken, {
      expirationTtl: 7 * 24 * 60 * 60,
    })

    // 5. Return result
    return {
      user: { id: user.id, email: user.email, createdAt: user.created_at },
      tokens,
    }
  }
}
```

**✅ DO:**
- Inject dependencies via constructor
- Use repositories for data access
- Throw custom errors
- Apply business rules
- Manage external services (KV, etc.)

**❌ DON'T:**
- Access HTTP request/response
- Execute raw SQL
- Return HTTP responses
- Handle HTTP errors

---

### Pattern 3: Repository Class

```typescript
// src/services/repositories.ts
export class UserRepository {
  constructor(private db: D1Database) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM users WHERE email = ?')
        .bind(email)
        .first<UserRow>()

      return result
    } catch (error) {
      logger.error('Failed to find user', error as Error, { email })
      throw new DatabaseError('Failed to query user')
    }
  }

  async create(id: string, email: string, passwordHash: string): Promise<UserRow> {
    try {
      await this.db
        .prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)')
        .bind(id, email, passwordHash)
        .run()

      const user = await this.findById(id)
      if (!user) throw new DatabaseError('Failed to create user')

      logger.info('User created', { userId: id, email })
      return user
    } catch (error) {
      logger.error('Failed to create user', error as Error, { email })
      throw new DatabaseError('Failed to create user')
    }
  }
}
```

**✅ DO:**
- Use prepared statements with `.bind()`
- Wrap in try/catch
- Log errors with context
- Throw DatabaseError
- Return typed results

**❌ DON'T:**
- Build SQL with string concatenation
- Apply business logic
- Access environment variables
- Throw generic errors

---

## 🔐 Security Utilities

### Password Hashing (`src/lib/crypto.ts`)

```typescript
import { hashPassword, verifyPassword } from './lib/crypto'

// Hash when registering
const hash = await hashPassword('mypassword123')
// Returns: "100000:salt_hex:hash_hex"

// Verify when logging in
const isValid = await verifyPassword('mypassword123', storedHash)
// Returns: boolean
```

**Algorithm**: PBKDF2-SHA256, 100,000 iterations

---

### JWT Tokens (`src/lib/jwt.ts`)

```typescript
import { generateTokenPair, verifyToken } from './lib/jwt'

// Generate both tokens
const tokens = await generateTokenPair(userId, email, JWT_SECRET, REFRESH_SECRET)
// Returns: { accessToken: string, refreshToken: string }

// Verify token
const payload = await verifyToken(token, JWT_SECRET)
// Returns: { userId, email, type: 'access'|'refresh', iat, exp }
```

**Token Expiry:**
- Access: 15 minutes
- Refresh: 7 days

---

### Rate Limiting (`src/lib/rateLimiter.ts`)

```typescript
import { rateLimiter } from './middleware/rateLimiter'
import { RATE_LIMITS } from './lib/rateLimiter'

// Apply to route group
authRoutes.use('*', rateLimiter(RATE_LIMITS.auth))    // 5 req/15min
apiRoutes.use('*', rateLimiter(RATE_LIMITS.api))      // 100 req/min

// Custom rate limit
const customLimit = { maxRequests: 10, windowMs: 60000 }
route.use('*', rateLimiter(customLimit))
```

---

## 🚨 Error Handling

### Custom Error Classes (`src/lib/errors.ts`)

```typescript
import {
  ValidationError,      // 400 - Invalid input
  AuthenticationError,  // 401 - Auth failed
  NotFoundError,        // 404 - Resource not found
  ConflictError,        // 409 - Duplicate resource
  RateLimitError,       // 429 - Too many requests
  DatabaseError,        // 500 - Database error
} from './lib/errors'

// Usage in code
throw new ValidationError('Invalid email', { field: 'email' })
throw new AuthenticationError('Invalid credentials')
throw new NotFoundError('User')
throw new ConflictError('Email already exists')
throw new RateLimitError()
throw new DatabaseError('Query failed')
```

### Error Response Format

All errors return:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { /* optional */ }
  }
}
```

---

## 📝 Logging (`src/lib/logger.ts`)

```typescript
import { createLogger } from './lib/logger'

const logger = createLogger('ServiceName')

logger.info('User logged in', { userId: '123' })
logger.warn('Rate limit approaching', { ip: '1.2.3.4' })
logger.error('Database error', error, { query: 'SELECT...' })
logger.debug('Processing request', { data: {...} })
```

**Output format** (JSON):
```json
{
  "timestamp": "2025-11-11T10:30:00.000Z",
  "level": "INFO",
  "context": "AuthService",
  "message": "User logged in",
  "userId": "123"
}
```

---

## 🗄️ Database (D1)

### Accessing Database

**Always use repositories:**
```typescript
const userRepo = new UserRepository(c.env.DB)
const sessionRepo = new SessionRepository(c.env.DB)
```

### Running Migrations

```bash
# Local development
wrangler d1 migrations apply pbc-db --local

# Or via package.json
pnpm db:migrate

# Production
wrangler d1 migrations apply pbc-db
pnpm db:migrate:prod
```

### Creating Migrations

1. Create file: `migrations/NNNN_description.sql`
2. Write SQL:
   ```sql
   CREATE TABLE IF NOT EXISTS new_table (
     id TEXT PRIMARY KEY,
     created_at TEXT NOT NULL DEFAULT (datetime('now'))
   );

   CREATE INDEX IF NOT EXISTS idx_new_table_id ON new_table(id);
   ```
3. Run migration

### Query Guidelines

**✅ DO:**
```typescript
// Prepared statements
await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()

// Proper error handling
try {
  const result = await db.prepare('...').bind(...).first()
  return result
} catch (error) {
  logger.error('Query failed', error as Error)
  throw new DatabaseError('Operation failed')
}
```

**❌ DON'T:**
```typescript
// String concatenation (SQL injection!)
await db.prepare(`SELECT * FROM users WHERE email = '${email}'`).first()

// Unhandled errors
const result = await db.prepare('...').first()
```

---

## 🔧 Development

### Local Development

```bash
# Start dev server
pnpm dev

# Or directly
wrangler dev

# Opens on http://localhost:8787
```

### Environment Variables

Create `.dev.vars`:
```bash
JWT_SECRET=your-secret-here-minimum-32-chars
REFRESH_SECRET=your-refresh-secret-minimum-32-chars
```

**Never commit `.dev.vars`** (it's in .gitignore)

### Production Secrets

```bash
# Set via Wrangler CLI
wrangler secret put JWT_SECRET
wrangler secret put REFRESH_SECRET

# Secrets are encrypted in Cloudflare
```

---

## 🧪 Testing (To Be Implemented)

### Unit Tests

Test services and utilities:

```typescript
// Example: authService.test.ts
import { describe, it, expect } from 'vitest'
import { AuthService } from './authService'

describe('AuthService', () => {
  it('should hash password correctly', async () => {
    // Test implementation
  })
})
```

### Integration Tests

Test routes with Miniflare:

```typescript
// Example: auth.test.ts
import { describe, it, expect } from 'vitest'
import app from './index'

describe('POST /auth/login', () => {
  it('should return 401 for invalid credentials', async () => {
    // Test implementation
  })
})
```

---

## 📡 API Endpoints

### Authentication Routes (`/api/v1/auth`)

```typescript
POST /auth/register
  Body: { email: string, password: string }
  Rate limit: 5 req/15min
  Returns: { user, tokens }

POST /auth/login
  Body: { email: string, password: string }
  Rate limit: 5 req/15min
  Returns: { user, tokens }

POST /auth/refresh
  Body: { refreshToken: string }
  Rate limit: 5 req/15min
  Returns: { tokens }

POST /auth/logout (requires auth)
  Rate limit: 5 req/15min
  Returns: { message }
```

### Exercise Routes (`/api/v1/exercises`)

```typescript
POST /exercises/sessions (requires auth)
  Body: { technique, duration, cycles?, settings }
  Rate limit: 100 req/min
  Returns: { session }

GET /exercises/sessions?limit=20&offset=0 (requires auth)
  Rate limit: 100 req/min
  Returns: { sessions, total, limit, offset }

GET /exercises/sessions/:id (requires auth)
  Rate limit: 100 req/min
  Returns: { session }

GET /exercises/stats (requires auth)
  Rate limit: 100 req/min
  Returns: { stats }
```

### User Routes (`/api/v1/user`)

```typescript
GET /user/me (requires auth)
  Rate limit: 100 req/min
  Returns: { user }

PATCH /user/settings (requires auth)
  Body: { defaultTechnique?, theme?, soundEnabled?, ... }
  Rate limit: 100 req/min
  Returns: { user }
```

---

## 🚀 Deployment

### Via GitHub Actions (Automatic)

Push to `main` branch triggers `.github/workflows/deploy-api.yml`

### Manual Deployment

```bash
# Build and deploy
pnpm deploy

# Or directly
wrangler deploy
```

### Deployment Checklist

- [ ] Secrets configured (`wrangler secret list`)
- [ ] Database migrations run (`pnpm db:migrate:prod`)
- [ ] `wrangler.toml` has correct database_id
- [ ] KV namespace exists and is bound
- [ ] Routes are correct in `wrangler.toml`

---

## 🐛 Debugging

### View Logs

```bash
# Tail production logs
wrangler tail

# Filter by status
wrangler tail --status error

# Filter by method
wrangler tail --method POST
```

### Common Issues

**"Database not found"**
- Check `wrangler.toml` database_id
- Run migrations: `pnpm db:migrate`

**"KV not bound"**
- Check `wrangler.toml` KV binding
- Create KV namespace: `wrangler kv:namespace create KV`

**"Token verification failed"**
- Check JWT_SECRET is set
- Verify token hasn't expired
- Check token type (access vs refresh)

**"Rate limit not working"**
- Verify KV namespace is bound
- Check IP extraction in rate limiter

---

## 📋 Checklist for Adding New Endpoint

- [ ] Define types in `packages/shared/src/types/api.ts`
- [ ] Create/update service method
- [ ] Add repository method if needed
- [ ] Create route handler with validation
- [ ] Apply appropriate rate limiting
- [ ] Add error handling
- [ ] Test locally
- [ ] Update frontend API client
- [ ] Document in CLAUDE.md

---

## 🎯 Best Practices

### DO ✅

- Follow 3-layer architecture (Routes → Services → Repositories)
- Use dependency injection for services
- Validate all input with Zod schemas
- Use prepared statements for SQL
- Throw custom error classes
- Log errors with context
- Apply rate limiting to sensitive routes
- Store secrets in Cloudflare (not in code)
- Use TypeScript strict mode

### DON'T ❌

- Query database directly in routes
- Use string concatenation for SQL
- Return inconsistent response formats
- Swallow errors without logging
- Store secrets in code or git
- Use `any` type
- Implement business logic in routes
- Access HTTP context in services

---

## 📚 References

- **Main docs**: See `../../ARCHITECTURE.md`
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Cloudflare D1**: https://developers.cloudflare.com/d1/
- **Hono**: https://hono.dev/
- **Zod**: https://zod.dev/

---

**Version**: 0.1.0
**Runtime**: Cloudflare Workers (V8 Isolate)
**Database**: Cloudflare D1 (SQLite)
**Status**: Production Ready ✅
