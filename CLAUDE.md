# CLAUDE.md - Personal Breath Coach Monorepo

> Quick reference guide for Claude AI working with this monorepo

## 🎯 Project at a Glance

**Personal Breath Coach** - Production-grade breathing technique training app
- **Monorepo**: pnpm workspaces
- **Frontend**: React + TypeScript + Vite + Tailwind (Cloudflare Pages)
- **Backend**: Cloudflare Workers + Hono + D1 + KV
- **Shared**: TypeScript types and constants

---

## 📁 Repository Structure

```
pbc/
├── apps/
│   ├── web/          → React frontend (see apps/web/CLAUDE.md)
│   └── api/          → Cloudflare Workers backend (see apps/api/CLAUDE.md)
├── packages/
│   └── shared/       → Shared TypeScript types
├── .github/workflows/ → CI/CD pipelines
└── [config files]    → ESLint, Prettier, TypeScript
```

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start both services
pnpm dev

# Start individually
pnpm dev:web  # Frontend on :3000
pnpm dev:api  # Backend on :8787

# Type check all
pnpm type-check

# Lint all
pnpm lint

# Format code
pnpm format
```

---

## 📦 Workspace Commands

### Development
```bash
pnpm dev              # Run both services in parallel
pnpm dev:web          # Frontend only
pnpm dev:api          # Backend only
```

### Building
```bash
pnpm build            # Build all packages
pnpm build:web        # Build frontend
pnpm build:api        # Build backend
```

### Quality
```bash
pnpm type-check       # TypeScript check all
pnpm lint             # ESLint all
pnpm format           # Auto-format with Prettier
pnpm format:check     # Check formatting
```

### Deployment
```bash
pnpm deploy:web       # Deploy frontend to Cloudflare Pages
pnpm deploy:api       # Deploy backend to Cloudflare Workers
```

### Cleanup
```bash
pnpm clean            # Remove all node_modules and dist folders
```

---

## 🏗️ Architecture Overview

### Layered Architecture (Backend)
```
HTTP Request
    ↓
Routes (validation, response formatting)
    ↓
Services (business logic)
    ↓
Repositories (database access)
    ↓
D1 Database
```

### Frontend Architecture
```
Component
    ↓
API Client (type-safe)
    ↓
Zustand Store (state management)
    ↓
Backend API
```

---

## 📝 Shared Package (`packages/shared`)

Central location for shared code between frontend and backend.

### Types (`packages/shared/src/types/`)
- **user.ts**: User, UserSettings, AuthTokens
- **exercise.ts**: ExerciseSession, TechniqueConfig, ExerciseStats
- **api.ts**: API request/response types

### Constants (`packages/shared/src/constants/`)
- **techniques.ts**: 7 breathing techniques with full config
- **index.ts**: Error codes, HTTP status codes

### Usage
```typescript
// In frontend or backend
import { User, TECHNIQUES, HTTP_STATUS, ERROR_CODES } from '@pbc/shared'
```

---

## 🔐 Security Standards

### Password Security
- **Algorithm**: PBKDF2 with SHA-256
- **Iterations**: 100,000 (OWASP recommended)
- **Salt**: 16 bytes random per password
- **Location**: `apps/api/src/lib/crypto.ts`

### JWT Tokens
- **Algorithm**: HMAC-SHA256
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- **Storage**: KV with TTL
- **Location**: `apps/api/src/lib/jwt.ts`

### Rate Limiting
- **Auth routes**: 5 requests per 15 minutes
- **API routes**: 100 requests per minute
- **Algorithm**: Sliding window with KV
- **Location**: `apps/api/src/lib/rateLimiter.ts`

---

## 🎨 Code Style

**Enforced by ESLint + Prettier:**
- Indentation: 2 spaces
- Quotes: Single quotes
- Semicolons: None
- Line length: 100 characters
- Trailing commas: ES5

**Auto-format before commit:**
```bash
pnpm format
```

---

## 🗄️ Database (Cloudflare D1)

### Schema
- **users**: User accounts with password hashes
- **user_settings**: User preferences and settings
- **exercise_sessions**: Completed breathing sessions

### Migrations
```bash
# Create migration
# Edit: apps/api/migrations/NNNN_name.sql

# Run locally
pnpm db:migrate

# Run in production
pnpm db:migrate:prod
```

### Access Pattern
```typescript
// ✅ ALWAYS use repositories
const userRepo = new UserRepository(db)
const user = await userRepo.findByEmail(email)

// ❌ NEVER query directly in routes
const user = await db.prepare('SELECT...').first()
```

---

## 🧪 Testing (To Be Implemented)

### Backend Tests
- Unit tests: Services, utilities
- Integration tests: API endpoints
- Tool: Vitest + Miniflare

### Frontend Tests
- Component tests: React Testing Library
- E2E tests: Playwright
- Tool: Vitest

---

## 🚢 Deployment

### Automatic (via GitHub Actions)
Push to `main` branch triggers:
- **Frontend**: `.github/workflows/deploy-web.yml` → Cloudflare Pages
- **Backend**: `.github/workflows/deploy-api.yml` → Cloudflare Workers

### Manual
```bash
# Frontend
cd apps/web
pnpm build && wrangler pages deploy dist

# Backend
cd apps/api
wrangler deploy
```

### Environment Setup

**Backend secrets** (use Wrangler CLI):
```bash
cd apps/api
wrangler secret put JWT_SECRET
wrangler secret put REFRESH_SECRET
```

**Frontend env vars** (set in Cloudflare Pages dashboard):
```
VITE_API_URL=https://api.your-domain.com/v1
```

---

## 🐛 Common Issues

### "Module not found: @pbc/shared"
```bash
# Reinstall dependencies
pnpm install
```

### "Type error in shared package"
```bash
# Type check from root
pnpm type-check
```

### "Database error"
```bash
# Run migrations
cd apps/api
pnpm db:migrate
```

### "Rate limit exceeded"
- Check Cloudflare KV is configured
- Verify `wrangler.toml` KV binding

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **README.md** | Getting started guide |
| **ARCHITECTURE.md** | Detailed architecture (631 lines) |
| **TECH_STACK.md** | Technology analysis |
| **claude.md** | Detailed Claude context (621 lines) |
| **apps/web/CLAUDE.md** | Frontend-specific context |
| **apps/api/CLAUDE.md** | Backend-specific context |

---

## 🔑 Key Files to Know

### Configuration
- `pnpm-workspace.yaml` - Workspace definition
- `package.json` - Root scripts and dev dependencies
- `.eslintrc.json` - Root ESLint config
- `.prettierrc` - Prettier config

### Type Definitions
- `packages/shared/src/types/` - All shared types
- `packages/shared/src/constants/` - Constants and configs

### Services
- `apps/web/` - Frontend application
- `apps/api/` - Backend application

---

## 🎯 Development Workflow

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes** (follow conventions in service CLAUDE.md)

3. **Type check and lint**
   ```bash
   pnpm type-check
   pnpm lint
   pnpm format
   ```

4. **Test locally**
   ```bash
   pnpm dev
   # Test in browser
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin feature/my-feature
   ```

6. **CI will run** (type-check, lint, build)

### Adding Dependencies

```bash
# Root (dev dependencies only)
pnpm add -D -w <package>

# Specific workspace
pnpm add <package> --filter web
pnpm add <package> --filter api
pnpm add <package> --filter @pbc/shared
```

### Updating Shared Types

1. Edit files in `packages/shared/src/types/`
2. Run `pnpm type-check` from root
3. Both frontend and backend will use updated types

---

## ⚡ Performance Tips

- **Frontend**: Vite HMR for instant updates
- **Backend**: Wrangler local dev with hot reload
- **Type checking**: Run in parallel with `pnpm type-check`
- **Building**: Use `--filter` for specific workspaces

---

## 🔒 Security Checklist

Before deploying:
- [ ] All secrets in Cloudflare (not in code)
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Input validation with Zod
- [ ] Prepared statements for SQL
- [ ] JWT secrets are strong (32+ chars)
- [ ] HTTPS only in production

---

## 📞 Need Help?

1. Check service-specific CLAUDE.md files
2. Read ARCHITECTURE.md for detailed patterns
3. Review TECH_STACK.md for technology decisions
4. Check GitHub Issues for known problems

---

## 🎓 Learning Resources

- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Cloudflare D1**: https://developers.cloudflare.com/d1/
- **Hono**: https://hono.dev/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/

---

**Version**: 0.1.0
**Last Updated**: 2025-11-11
**Status**: Production Ready ✅
