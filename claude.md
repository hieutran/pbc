# Claude Context - Personal Breath Coach

This file provides context for Claude AI when working with this codebase.

## Project Overview

**Personal Breath Coach** is a production-grade web application for practicing various breathing techniques (Nadi Shodhana, Ujjayi, Kapalbhati, Bhramari, Wim Hof, etc.). Built with a modern, serverless architecture deployed on Cloudflare's edge network.

**Tech Stack:**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Cloudflare Workers + Hono + D1 (SQLite)
- **Storage**: Cloudflare KV
- **State**: Zustand
- **Animation**: Framer Motion
- **Deployment**: Cloudflare Pages (frontend) + Workers (backend)

---

## Project Structure

```
pbc/
├── apps/
│   ├── web/              # React frontend application
│   │   ├── src/
│   │   │   ├── components/    # Shared React components
│   │   │   ├── features/      # Feature modules (auth, dashboard, exercise, history)
│   │   │   ├── lib/
│   │   │   │   ├── api/       # Type-safe API client
│   │   │   │   └── store/     # Zustand state management
│   │   │   └── styles/        # Global styles
│   │   └── package.json
│   │
│   └── api/              # Cloudflare Workers backend
│       ├── src/
│       │   ├── lib/           # Core utilities (crypto, JWT, errors, logger, rate limiting)
│       │   ├── middleware/    # Hono middleware (auth, error handling, rate limiting)
│       │   ├── services/      # Business logic (AuthService, repositories)
│       │   ├── routes/        # API endpoints (auth, exercise, user)
│       │   └── index.ts       # App entry point
│       ├── migrations/        # D1 database migrations
│       └── wrangler.toml      # Cloudflare Workers config
│
├── packages/
│   └── shared/           # Shared TypeScript types and constants
│       └── src/
│           ├── types/         # Shared types (User, Exercise, API)
│           └── constants/     # Constants (breathing techniques, error codes)
│
├── .github/
│   └── workflows/        # CI/CD pipelines
│       ├── ci.yml            # Lint, type-check, build
│       ├── deploy-api.yml    # Deploy backend to Workers
│       └── deploy-web.yml    # Deploy frontend to Pages
│
├── ARCHITECTURE.md       # Detailed architecture documentation
├── TECH_STACK.md        # Technology choices and analysis
├── README.md            # Getting started guide
└── package.json         # Root monorepo config
```

---

## Architecture Principles

### **1. Layered Architecture (Backend)**

Follow this pattern strictly:

```
Routes → Services → Repositories → Database
```

- **Routes** (`apps/api/src/routes/`): Handle HTTP, validation, response formatting
- **Services** (`apps/api/src/services/`): Business logic, orchestration
- **Repositories** (`apps/api/src/services/repositories.ts`): Database operations only

**Example:**
```typescript
// ✅ CORRECT: Route calls service
authRoutes.post('/login', async c => {
  const authService = new AuthService(c.env, c.env.DB)
  const data = await authService.login(result.data)
  return c.json({ success: true, data })
})

// ❌ WRONG: Route directly accesses database
authRoutes.post('/login', async c => {
  const user = await c.env.DB.prepare('SELECT * FROM users...').first()
})
```

### **2. Dependency Injection**

Services receive dependencies via constructor:

```typescript
// ✅ CORRECT
export class AuthService {
  private userRepo: UserRepository

  constructor(private env: Env, private db: D1Database) {
    this.userRepo = new UserRepository(db)
  }
}

// ❌ WRONG: Service accesses globals
export class AuthService {
  login() {
    const user = globalDb.query(...) // Don't do this
  }
}
```

### **3. Error Handling**

Always use custom error classes:

```typescript
// ✅ CORRECT
throw new AuthenticationError('Invalid credentials')
throw new ValidationError('Invalid input', zodError.errors)
throw new NotFoundError('User')

// ❌ WRONG
throw new Error('Something went wrong')
return c.json({ error: 'Failed' }, 500)
```

### **4. Type Safety**

- Use Zod for runtime validation
- Define TypeScript types in `packages/shared/src/types/`
- Never use `any` type (use `unknown` if needed)

---

## Code Conventions

### **File Naming**

- **Components**: PascalCase (e.g., `LoginPage.tsx`, `Header.tsx`)
- **Utilities**: camelCase (e.g., `crypto.ts`, `logger.ts`)
- **Services**: camelCase + Service suffix (e.g., `authService.ts`)
- **Repositories**: camelCase + Repository suffix (e.g., `repositories.ts`)

### **Import Order**

```typescript
// 1. External dependencies
import { Hono } from 'hono'
import { z } from 'zod'

// 2. Internal types
import type { Env } from '../types'

// 3. Shared packages
import { HTTP_STATUS } from '@pbc/shared'

// 4. Local modules
import { AuthService } from '../services/authService'
import { ValidationError } from '../lib/errors'
```

### **Async/Await**

- Always use `async/await` (never raw Promises)
- Always handle errors with try/catch or let middleware catch

```typescript
// ✅ CORRECT
async function login(email: string) {
  const user = await userRepo.findByEmail(email)
  if (!user) throw new NotFoundError('User')
  return user
}

// ❌ WRONG
function login(email: string) {
  return userRepo.findByEmail(email).then(user => {
    if (!user) throw new NotFoundError('User')
    return user
  })
}
```

### **Validation**

Always validate input with Zod schemas:

```typescript
// ✅ CORRECT
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Too short')
})

const result = schema.safeParse(body)
if (!result.success) {
  throw new ValidationError('Invalid input', result.error.errors)
}

// ❌ WRONG
if (!body.email || !body.password) {
  return c.json({ error: 'Missing fields' }, 400)
}
```

---

## Security Guidelines

### **1. Password Hashing**

**Always** use the PBKDF2 implementation in `apps/api/src/lib/crypto.ts`:

```typescript
import { hashPassword, verifyPassword } from '../lib/crypto'

// Hash when creating user
const passwordHash = await hashPassword(password)

// Verify when logging in
const isValid = await verifyPassword(password, user.password_hash)
```

**Never** implement custom hashing or use weak algorithms.

### **2. JWT Tokens**

Use the JWT utilities in `apps/api/src/lib/jwt.ts`:

```typescript
import { generateTokenPair, verifyToken } from '../lib/jwt'

// Generate tokens
const tokens = await generateTokenPair(userId, email, JWT_SECRET, REFRESH_SECRET)

// Verify tokens
const payload = await verifyToken(token, JWT_SECRET)
```

### **3. Rate Limiting**

Apply rate limiting to sensitive routes:

```typescript
import { rateLimiter } from '../middleware/rateLimiter'
import { RATE_LIMITS } from '../lib/rateLimiter'

// Auth routes: 5 requests per 15 minutes
authRoutes.use('*', rateLimiter(RATE_LIMITS.auth))

// API routes: 100 requests per minute
apiRoutes.use('*', rateLimiter(RATE_LIMITS.api))
```

### **4. Input Sanitization**

- Zod validates input types
- D1 prepared statements prevent SQL injection
- React escapes output (prevents XSS)

**Never** construct SQL queries with string concatenation:

```typescript
// ✅ CORRECT
await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()

// ❌ WRONG
await db.prepare(`SELECT * FROM users WHERE email = '${email}'`).first()
```

---

## API Response Format

### **Success Response**

```typescript
return c.json({
  success: true,
  data: { /* your data */ }
}, HTTP_STATUS.OK)
```

### **Error Response**

```typescript
// Automatically handled by error middleware
throw new ValidationError('Invalid input', details)

// Results in:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { /* error details */ }
  }
}
```

### **Pagination**

```typescript
return c.json({
  success: true,
  data: {
    items: [...],
    total: 100,
    limit: 20,
    offset: 0
  }
})
```

---

## Database Guidelines

### **1. Migrations**

Create migrations in `apps/api/migrations/`:

```sql
-- apps/api/migrations/0002_add_feature.sql
CREATE TABLE IF NOT EXISTS new_table (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_new_table_created ON new_table(created_at);
```

Run migrations:
```bash
pnpm db:migrate        # Local
pnpm db:migrate:prod   # Production
```

### **2. Repository Pattern**

Add methods to repositories in `apps/api/src/services/repositories.ts`:

```typescript
export class UserRepository {
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
}
```

**Always:**
- Use prepared statements with `.bind()`
- Wrap in try/catch
- Log errors with context
- Throw `DatabaseError` on failure

---

## Frontend Guidelines

### **1. API Calls**

**Always** use the API client from `apps/web/src/lib/api/`:

```typescript
// ✅ CORRECT
import { authApi } from '@/lib/api'

const data = await authApi.login({ email, password })
setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken)

// ❌ WRONG
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```

### **2. Error Handling**

Catch `ApiError` for proper error messages:

```typescript
import { ApiError } from '@/lib/api'

try {
  const data = await authApi.login({ email, password })
} catch (err) {
  if (err instanceof ApiError) {
    setError(err.message)  // User-friendly message
  } else {
    setError('An unexpected error occurred')
  }
}
```

### **3. State Management**

Use Zustand stores from `apps/web/src/lib/store/`:

```typescript
import { useAuthStore } from '@/lib/store/authStore'

function MyComponent() {
  const { user, logout } = useAuthStore()

  // Use selectors for performance
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
}
```

### **4. Styling**

Use Tailwind utility classes with zen-inspired design:

```tsx
// ✅ CORRECT
<button className="btn-primary">
  Sign In
</button>

<div className="card">
  {/* Content */}
</div>

// Custom styles in tailwind.config.js
colors: {
  zen: { 50: '#fafaf9', ... }
}
```

---

## Testing (To Be Implemented)

### **Backend Tests**

```typescript
// Example structure
describe('AuthService', () => {
  it('should hash password correctly', async () => {
    const hash = await hashPassword('password123')
    expect(hash).toMatch(/^\d+:[a-f0-9]{32}:[a-f0-9]{64}$/)
  })
})
```

### **Frontend Tests**

```typescript
// Example structure
describe('LoginPage', () => {
  it('should show error on invalid credentials', async () => {
    render(<LoginPage />)
    // ... test implementation
  })
})
```

---

## Common Tasks

### **Add a New API Endpoint**

1. **Define types** in `packages/shared/src/types/api.ts`
2. **Add route** in `apps/api/src/routes/`
3. **Add validation** with Zod schema
4. **Create/update service** in `apps/api/src/services/`
5. **Add API client method** in `apps/web/src/lib/api/`
6. **Use in component**

### **Add a New Breathing Technique**

1. **Add to constants** in `packages/shared/src/constants/techniques.ts`
2. **Update types** if needed
3. **Frontend will auto-include** in lists

### **Add a Database Table**

1. **Create migration** in `apps/api/migrations/`
2. **Add TypeScript type** for rows
3. **Create/update repository** methods
4. **Run migration**: `pnpm db:migrate`

### **Add a New Page**

1. **Create component** in `apps/web/src/features/[feature]/`
2. **Add route** in `apps/web/src/App.tsx`
3. **Add navigation** in `Header.tsx`
4. **Use API client** for data fetching

---

## Troubleshooting

### **"Token expired" errors**

- Check if access token is being refreshed properly
- Verify `refreshAccessToken()` in `authStore.ts`
- Check Cloudflare KV has refresh token stored

### **"Database error" in logs**

- Check migration was run: `pnpm db:migrate`
- Verify `wrangler.toml` has correct database_id
- Check prepared statements use `.bind()` for parameters

### **"Rate limit exceeded"**

- Check Cloudflare KV is properly configured
- Verify IP extraction in rate limiter
- Adjust `RATE_LIMITS` constants if needed

### **TypeScript errors in shared package**

- Run `pnpm type-check` at root
- Check imports use `@pbc/shared` alias
- Verify path mappings in tsconfig.json

---

## Environment Variables

### **Backend** (`apps/api/.dev.vars`)
```bash
JWT_SECRET=your-secret-here
REFRESH_SECRET=your-refresh-secret
```

### **Frontend** (`apps/web/.env`)
```bash
VITE_API_URL=/api/v1  # Dev (proxied)
# VITE_API_URL=https://api.domain.com/v1  # Prod
```

---

## Important Notes

1. **Never commit secrets** - Use `.dev.vars` (gitignored) and Cloudflare secrets
2. **Always use prepared statements** - Prevent SQL injection
3. **Validate all input** - Use Zod schemas on all routes
4. **Log errors with context** - Use structured logger
5. **Follow layered architecture** - Routes → Services → Repositories
6. **Use custom error classes** - Proper HTTP status codes
7. **Type everything** - Avoid `any`, use `unknown` if needed
8. **Test before committing** - `pnpm type-check && pnpm lint`

---

## Deployment

### **Manual Deployment**

```bash
# Frontend
cd apps/web
pnpm build && wrangler pages deploy dist

# Backend
cd apps/api
pnpm deploy
```

### **Automatic Deployment**

Push to `main` branch - GitHub Actions will deploy automatically.

---

## Resources

- **Architecture**: See `ARCHITECTURE.md`
- **Tech Stack**: See `TECH_STACK.md`
- **Getting Started**: See `README.md`
- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Hono Docs**: https://hono.dev/

---

## Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: No semicolons (Prettier config)
- **Line Length**: 100 characters max
- **Trailing Commas**: ES5 style

Run `pnpm format` to auto-format code.

---

## Key Files to Reference

When making changes, always check these files first:

- `packages/shared/src/types/` - Shared TypeScript types
- `packages/shared/src/constants/techniques.ts` - Breathing techniques
- `apps/api/src/lib/errors.ts` - Error classes
- `apps/api/src/services/repositories.ts` - Database operations
- `apps/web/src/lib/api/client.ts` - API client logic
- `ARCHITECTURE.md` - Detailed architecture documentation

---

**Last Updated**: 2025-11-11
**Version**: 0.1.0
**Production Ready**: ✅ Yes
