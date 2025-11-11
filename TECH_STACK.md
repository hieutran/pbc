# Personal Breath Coach - Tech Stack Analysis

## Requirements Analysis

### Functional Requirements
1. **Breathing Techniques Support**
   - Nadi Shodhana (Alternate Nostril Breathing)
   - Ujjayi (Ocean Breath)
   - Kapalbhati (Skull Shining Breath)
   - Bhramari (Bee Breath)
   - Wim Hof Method
   - Extensible for future techniques

2. **User Features**
   - User authentication & authorization
   - Exercise history tracking
   - Customizable exercise settings (duration, cycles, pace)
   - Progress analytics

3. **UI/UX**
   - Minimalist, zen-inspired design
   - Responsive (mobile-first)
   - Smooth animations for breathing guidance
   - Audio/visual cues

### Non-Functional Requirements
- Fast global performance
- Scalable architecture
- Low cost (serverless)
- Secure authentication
- Offline-capable (PWA)

---

## Recommended Tech Stack

### Frontend

#### **Framework: React + TypeScript**
- **Why React?**
  - Large ecosystem for animations (Framer Motion, React Spring)
  - Excellent PWA support
  - Great TypeScript integration
  - Perfect for timer-based interactive UIs

#### **Styling: Tailwind CSS**
- **Why Tailwind?**
  - Rapid prototyping
  - Easy to create minimalist designs
  - Small bundle size with purging
  - Excellent for zen/yoga aesthetics with custom color palettes

#### **Build Tool: Vite**
- **Why Vite?**
  - Lightning-fast HMR
  - Optimized production builds
  - First-class TypeScript support
  - Perfect for Cloudflare Pages deployment

#### **State Management: Zustand**
- **Why Zustand?**
  - Minimal boilerplate (zen philosophy!)
  - TypeScript-first
  - Small bundle size (~1KB)
  - Easy to persist state

#### **Animation: Framer Motion**
- **Why Framer Motion?**
  - Smooth breathing animations
  - Declarative API
  - Great for circular/radial breathing visualizations
  - Performance optimized

#### **PWA: Vite PWA Plugin**
- Offline exercise sessions
- Install as native app
- Background sync for history

---

### Backend (Cloudflare Stack)

#### **Runtime: Cloudflare Workers**
- **Benefits:**
  - Edge computing (low latency globally)
  - Auto-scaling
  - No cold starts
  - Cost-effective

#### **Database: Cloudflare D1**
- **Why D1?**
  - SQLite at the edge
  - Perfect for relational data (users, exercises, history)
  - SQL queries for analytics
  - Free tier: 5GB storage, 25M reads/day

**Schema Design:**
```sql
-- Users table
users (id, email, password_hash, created_at, settings)

-- Exercise sessions table
sessions (id, user_id, technique, duration, settings, completed_at)

-- User preferences
preferences (user_id, default_technique, reminder_settings)
```

#### **Authentication: Cloudflare Workers + JWT**
- **Approach:**
  - JWT tokens stored in httpOnly cookies
  - Argon2id for password hashing
  - Refresh token rotation
  - Rate limiting with Cloudflare Workers KV

#### **API Framework: Hono**
- **Why Hono?**
  - Built for Cloudflare Workers
  - Express-like API
  - TypeScript-first
  - Tiny (~12KB)
  - Excellent middleware support

#### **Session Storage: Cloudflare KV**
- Store refresh tokens
- Rate limiting counters
- Temporary session data

---

### Deployment & DevOps

#### **Frontend Deployment: Cloudflare Pages**
- **Features:**
  - Automatic GitHub integration
  - Preview deployments
  - Global CDN
  - Free unlimited bandwidth
  - Built-in analytics

#### **Backend Deployment: Cloudflare Workers**
- **Features:**
  - CLI deployment (Wrangler)
  - Environment variables
  - Staged rollouts
  - Real-time logs

#### **CI/CD: GitHub Actions**
- Automated testing
- Type checking
- Linting
- Automatic deployments

---

### Additional Tools

#### **TypeScript (Shared Types)**
- Monorepo structure with shared types
- Type-safe API contracts
- Better DX

#### **Testing**
- **Frontend:** Vitest + React Testing Library
- **Backend:** Vitest + Miniflare (Cloudflare Workers simulator)
- **E2E:** Playwright

#### **Code Quality**
- ESLint + Prettier
- Husky for git hooks
- Conventional commits

#### **Monitoring**
- Cloudflare Workers Analytics
- Cloudflare Web Analytics (privacy-first)
- Sentry for error tracking

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Cloudflare CDN                      │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼────────┐              ┌────────▼─────────┐
│ Cloudflare     │              │ Cloudflare       │
│ Pages          │              │ Workers          │
│ (Frontend)     │◄────────────►│ (API)            │
└────────────────┘              └──────────────────┘
                                         │
                        ┌────────────────┼────────────────┐
                        │                │                │
                ┌───────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
                │ Cloudflare   │  │ Cloudflare│  │ Cloudflare  │
                │ D1           │  │ KV        │  │ Durable Obj │
                │ (Database)   │  │ (Cache)   │  │ (Optional)  │
                └──────────────┘  └───────────┘  └─────────────┘
```

---

## Project Structure

```
pbc/
├── apps/
│   ├── web/                 # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── exercises/
│   │   │   │   └── history/
│   │   │   ├── lib/
│   │   │   ├── hooks/
│   │   │   └── App.tsx
│   │   ├── public/
│   │   └── package.json
│   │
│   └── api/                 # Backend (Cloudflare Workers)
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── services/
│       │   └── index.ts
│       ├── migrations/      # D1 migrations
│       └── wrangler.toml
│
├── packages/
│   └── shared/              # Shared types & utils
│       ├── types/
│       └── constants/
│
├── package.json             # Root package.json (workspaces)
└── README.md
```

---

## Cost Estimate (Cloudflare)

### Free Tier Limits
- **Workers:** 100,000 requests/day
- **Pages:** Unlimited requests
- **D1:** 5GB storage, 25M reads/day
- **KV:** 100,000 reads/day, 1,000 writes/day

### Paid Tier (if needed)
- **Workers Paid:** $5/month (10M requests)
- **D1 Paid:** ~$5/month (25B reads)
- **Total:** ~$10-20/month for moderate usage (1000s of users)

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Setup monorepo structure
- [ ] Configure Vite + React + TypeScript
- [ ] Setup Cloudflare Workers + Hono
- [ ] Setup D1 database & migrations
- [ ] Basic authentication system
- [ ] Deploy pipeline (GitHub Actions)

### Phase 2: Core Features (Week 3-4)
- [ ] Breathing technique engine
- [ ] Visual breathing guide (circle animation)
- [ ] Audio cues (optional)
- [ ] Exercise timer & controls
- [ ] Session history tracking

### Phase 3: UI/UX Polish (Week 5)
- [ ] Zen-inspired design system
- [ ] Smooth animations
- [ ] Mobile responsiveness
- [ ] PWA implementation
- [ ] Accessibility (WCAG 2.1 AA)

### Phase 4: Advanced Features (Week 6+)
- [ ] Progress analytics & charts
- [ ] Reminders/notifications
- [ ] Custom technique builder
- [ ] Social sharing (optional)
- [ ] Multi-language support

---

## Alternative Considerations

### Database Alternatives
1. **Cloudflare Durable Objects**
   - Pros: Strong consistency, real-time features
   - Cons: More complex, higher cost
   - Use case: If you need real-time multiplayer breathing sessions

2. **Turso (LibSQL)**
   - Pros: Better SQL features, local dev experience
   - Cons: Another service to manage
   - Use case: If D1 limitations are restrictive

### Frontend Alternatives
1. **Svelte + SvelteKit**
   - Pros: Smaller bundle, simpler syntax
   - Cons: Smaller ecosystem

2. **Vue + Nuxt**
   - Pros: Great DX, easy to learn
   - Cons: Less typing strictness than React+TS

### Backend Alternatives
1. **Next.js on Cloudflare Pages**
   - Pros: Full-stack framework, API routes
   - Cons: Some Next.js features not supported on CF

2. **Remix on Cloudflare Workers**
   - Pros: Great nested routing, progressive enhancement
   - Cons: Overkill for this project size

---

## Security Considerations

1. **Authentication**
   - Argon2id for password hashing
   - JWT with short expiration (15min)
   - Refresh token rotation
   - CSRF protection

2. **API Security**
   - Rate limiting per IP
   - Input validation (Zod)
   - SQL injection prevention (parameterized queries)
   - CORS configuration

3. **Data Privacy**
   - GDPR compliance
   - Data export functionality
   - Account deletion
   - No tracking without consent

---

## Recommended Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18 + TypeScript | UI components |
| **Build Tool** | Vite | Fast dev & builds |
| **Styling** | Tailwind CSS | Minimalist design |
| **State Management** | Zustand | Client state |
| **Animation** | Framer Motion | Breathing visuals |
| **PWA** | Vite PWA | Offline support |
| **Backend Runtime** | Cloudflare Workers | API endpoints |
| **API Framework** | Hono | Routing & middleware |
| **Database** | Cloudflare D1 | User data & history |
| **Cache/Sessions** | Cloudflare KV | Tokens & rate limiting |
| **Authentication** | JWT + httpOnly cookies | User auth |
| **Password Hashing** | Argon2id | Secure passwords |
| **Validation** | Zod | Type-safe validation |
| **Testing** | Vitest + Playwright | Unit & E2E tests |
| **CI/CD** | GitHub Actions | Automation |
| **Hosting** | Cloudflare Pages + Workers | Global deployment |
| **Monitoring** | Cloudflare Analytics + Sentry | Observability |

---

## Next Steps

1. **Confirm tech stack** - Review and approve the recommendations
2. **Setup monorepo** - Initialize project structure with pnpm workspaces
3. **Configure Cloudflare** - Create Workers & Pages projects
4. **Design database schema** - Finalize tables & relationships
5. **Create design system** - Define colors, typography, spacing
6. **Start development** - Begin with Phase 1 tasks

Would you like me to proceed with setting up the project structure?
