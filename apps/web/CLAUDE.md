# CLAUDE.md - Frontend Web App

> Context for working with the React frontend

## 🎯 Overview

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS
**Purpose**: Personal Breath Coach web interface
**Deployment**: Cloudflare Pages

---

## 📁 Directory Structure

```
apps/web/
├── src/
│   ├── components/       # Shared components
│   │   ├── Layout.tsx    # App layout wrapper
│   │   └── Header.tsx    # Navigation header
│   │
│   ├── features/         # Feature modules
│   │   ├── auth/         # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── dashboard/    # User dashboard
│   │   │   └── DashboardPage.tsx
│   │   ├── exercise/     # Breathing exercise
│   │   │   └── ExercisePage.tsx
│   │   ├── history/      # Exercise history
│   │   │   └── HistoryPage.tsx
│   │   └── home/         # Landing page
│   │       └── HomePage.tsx
│   │
│   ├── lib/              # Libraries and utilities
│   │   ├── api/          # Type-safe API client
│   │   │   ├── client.ts # Base HTTP client
│   │   │   ├── auth.ts   # Auth endpoints
│   │   │   ├── user.ts   # User endpoints
│   │   │   ├── exercise.ts # Exercise endpoints
│   │   │   └── index.ts  # Exports
│   │   └── store/        # Zustand state management
│   │       └── authStore.ts # Auth state
│   │
│   ├── styles/           # Global styles
│   │   └── index.css     # Tailwind + custom styles
│   │
│   ├── App.tsx           # Main app with routes
│   ├── main.tsx          # Entry point
│   └── vite-env.d.ts     # Vite type definitions
│
├── public/               # Static assets
│   └── logo.svg
│
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

---

## 🏗️ Architecture

### Component Organization

```
Page Component (feature/name/NamePage.tsx)
    ↓
Custom Hooks (useState, useAuthStore, etc.)
    ↓
API Client (lib/api/)
    ↓
Zustand Store (lib/store/)
    ↓
Backend API
```

### Feature-Based Structure

Each feature lives in `src/features/[feature-name]/`:
- Contains all components for that feature
- Self-contained and focused
- Easy to understand and maintain

---

## 🎨 Styling with Tailwind CSS

### Design System

**Colors:**
```typescript
// Primary (blue)
primary-50 to primary-900

// Zen (neutral)
zen-50 to zen-900

// Example usage:
<div className="bg-zen-50 text-zen-900">
```

**Components:**
```typescript
// Buttons
<button className="btn-primary">Submit</button>
<button className="btn-secondary">Cancel</button>

// Cards
<div className="card">Content</div>

// Inputs
<input className="input" />
```

**Animations:**
```typescript
// Breathing animation
<div className="animate-breathe" />

// Fade in
<div className="animate-fade-in" />

// Slide up
<div className="animate-slide-up" />
```

### Custom Styles

Define in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      zen: { /* custom colors */ }
    },
    animation: {
      breathe: 'breathe 8s ease-in-out infinite'
    }
  }
}
```

---

## 🔌 API Client

### Usage Pattern

**Always use the API client, never raw fetch:**

```typescript
import { authApi, userApi, exerciseApi, ApiError } from '@/lib/api'

// ✅ CORRECT
try {
  const data = await authApi.login({ email, password })
  setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken)
} catch (err) {
  if (err instanceof ApiError) {
    setError(err.message)
  } else {
    setError('An unexpected error occurred')
  }
}

// ❌ WRONG
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```

### Available API Methods

**Auth** (`authApi`):
```typescript
authApi.register({ email, password })
  // Returns: { user, tokens }

authApi.login({ email, password })
  // Returns: { user, tokens }

authApi.refreshToken(refreshToken)
  // Returns: { tokens }

authApi.logout()
  // Returns: void
```

**User** (`userApi`):
```typescript
userApi.getMe()
  // Returns: { user }

userApi.updateSettings(settings)
  // Returns: { user }
```

**Exercise** (`exerciseApi`):
```typescript
exerciseApi.createSession({ technique, duration, settings })
  // Returns: { session }

exerciseApi.getSessions({ limit, offset, technique? })
  // Returns: { sessions, total }

exerciseApi.getStats()
  // Returns: { stats }
```

### Error Handling

```typescript
import { ApiError } from '@/lib/api'

try {
  await api.someMethod()
} catch (error) {
  if (error instanceof ApiError) {
    // Known API error
    console.error('API Error:', error.message, error.code, error.statusCode)
  } else {
    // Network or unknown error
    console.error('Unexpected error:', error)
  }
}
```

---

## 🗄️ State Management (Zustand)

### Auth Store

```typescript
import { useAuthStore } from '@/lib/store/authStore'

function MyComponent() {
  // Get entire state (re-renders on any change)
  const { user, isAuthenticated, logout } = useAuthStore()

  // Use selectors for better performance
  const user = useAuthStore(state => state.user)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  // Actions
  const setAuth = useAuthStore(state => state.setAuth)
  const logout = useAuthStore(state => state.logout)
  const refreshAccessToken = useAuthStore(state => state.refreshAccessToken)
}
```

**Store Shape:**
```typescript
{
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setAuth: (user, accessToken, refreshToken) => void
  logout: () => Promise<void>
  clearError: () => void
  refreshAccessToken: () => Promise<boolean>
}
```

**Persistence:**
- Automatically saved to localStorage
- Restored on page reload
- Key: `auth-storage`

---

## 🧩 Component Patterns

### Page Component Template

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/store/authStore'
import { authApi, ApiError } from '@/lib/api'

export function MyPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authApi.someMethod()
      // Handle success
      navigate('/success')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Content */}
    </div>
  )
}
```

### Protected Route

```typescript
import { useAuthStore } from '@/lib/store/authStore'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Usage in App.tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Form Handling

```typescript
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input"
          required
        />
      </div>
      <button type="submit" className="btn-primary w-full">
        Submit
      </button>
    </form>
  )
}
```

---

## 🎭 Routing

### Route Structure (`src/App.tsx`)

```typescript
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="register" element={<RegisterPage />} />
    <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="exercise/:technique" element={<ProtectedRoute><ExercisePage /></ProtectedRoute>} />
    <Route path="history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
  </Route>
</Routes>
```

### Navigation

```typescript
import { Link, useNavigate } from 'react-router-dom'

// Declarative
<Link to="/dashboard">Go to Dashboard</Link>

// Programmatic
const navigate = useNavigate()
navigate('/dashboard')
navigate(-1) // Go back
```

### Route Parameters

```typescript
import { useParams } from 'react-router-dom'

function ExercisePage() {
  const { technique } = useParams<{ technique: string }>()
  // technique is the :technique param from route
}
```

---

## 🎨 Animation with Framer Motion

### Basic Usage

```typescript
import { motion } from 'framer-motion'

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>

// Breathing circle (future)
<motion.div
  animate={{
    scale: [1, 1.3, 1],
    opacity: [0.8, 1, 0.8]
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut"
  }}
  className="w-64 h-64 rounded-full bg-primary-200"
/>
```

---

## 🔧 Development

### Local Development

```bash
# Start dev server
pnpm dev

# Opens on http://localhost:3000
# Backend proxied: /api -> http://localhost:8787
```

### Environment Variables

Create `.env`:
```bash
VITE_API_URL=/api/v1  # Dev (proxied through Vite)
```

For production:
```bash
VITE_API_URL=https://api.your-domain.com/v1
```

**Accessing in code:**
```typescript
const API_URL = import.meta.env.VITE_API_URL
```

### Hot Module Replacement (HMR)

Vite provides instant updates:
- Edit component → instant update
- Edit styles → instant update
- Preserves component state

---

## 📱 Progressive Web App (PWA)

### Configuration

Configured in `vite.config.ts`:
```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Personal Breath Coach',
    short_name: 'Breath Coach',
    // ... other manifest properties
  }
})
```

### Features

- **Installable**: Add to home screen
- **Offline**: Works without internet (cached assets)
- **Background sync**: Sync data when back online

---

## 🧪 Testing (To Be Implemented)

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('should show error on invalid credentials', async () => {
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' }
    })
    fireEvent.click(screen.getByText('Sign In'))

    expect(await screen.findByText(/invalid/i)).toBeInTheDocument()
  })
})
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('http://localhost:3000/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

---

## 🚀 Building & Deployment

### Build for Production

```bash
# Build
pnpm build

# Preview build locally
pnpm preview
```

### Deployment to Cloudflare Pages

**Automatic** (via GitHub Actions):
- Push to `main` → `.github/workflows/deploy-web.yml` runs

**Manual**:
```bash
pnpm deploy
# or
wrangler pages deploy dist
```

### Build Configuration

`vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
})
```

---

## 🐛 Common Issues

### "API calls failing"

- Check backend is running: `pnpm dev:api`
- Verify proxy config in `vite.config.ts`
- Check API_URL environment variable

### "Type errors from @pbc/shared"

```bash
# From root directory
pnpm type-check
```

### "Styles not applying"

- Check Tailwind content paths in `tailwind.config.js`
- Verify `@tailwind` directives in `src/styles/index.css`
- Check class names are valid Tailwind classes

### "State not persisting"

- Check localStorage is enabled in browser
- Verify Zustand persist config in store
- Check `auth-storage` key in devtools

---

## 📋 Checklist for New Feature

- [ ] Create feature directory in `src/features/[name]/`
- [ ] Add page component(s)
- [ ] Add route in `src/App.tsx`
- [ ] Add navigation in `Header.tsx` (if needed)
- [ ] Use API client for data fetching
- [ ] Handle loading and error states
- [ ] Style with Tailwind classes
- [ ] Test locally with backend
- [ ] Add TypeScript types
- [ ] Handle edge cases

---

## 🎯 Best Practices

### DO ✅

- Use API client (never raw fetch)
- Handle loading and error states
- Use Zustand selectors for performance
- Apply Tailwind utility classes
- Use TypeScript types from `@pbc/shared`
- Keep components small and focused
- Extract reusable components
- Use proper semantic HTML
- Handle form validation
- Provide user feedback (loading, errors, success)

### DON'T ❌

- Use raw `fetch()` API
- Ignore loading states
- Leave errors unhandled
- Use inline styles (use Tailwind)
- Use `any` type
- Create giant components
- Forget accessibility
- Skip error boundaries
- Store sensitive data in localStorage (except tokens)

---

## 🎨 Design Guidelines

### Minimalist Zen Aesthetic

- **Colors**: Neutral zen tones with blue accents
- **Typography**: Clean, readable fonts
- **Spacing**: Generous whitespace
- **Animations**: Smooth, calming
- **Layout**: Simple, focused

### Responsive Design

```typescript
// Mobile-first approach
<div className="px-4 py-8 md:px-8 md:py-16">
  {/* Mobile: px-4 py-8 */}
  {/* Desktop: px-8 py-16 */}
</div>

// Breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

---

## 📚 References

- **Main docs**: See `../../ARCHITECTURE.md`
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Framer Motion**: https://www.framer.com/motion/
- **Zustand**: https://zustand-demo.pmnd.rs/

---

**Version**: 0.1.0
**Framework**: React 18 + Vite
**Deployment**: Cloudflare Pages
**Status**: Production Ready ✅
