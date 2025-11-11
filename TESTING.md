# Testing Guide - Personal Breath Coach

> Comprehensive testing infrastructure for production-grade code quality

## 🎯 Overview

The Personal Breath Coach monorepo uses **Vitest** as the testing framework across all workspaces, providing fast, modern testing with excellent TypeScript support.

### Test Coverage Summary

- ✅ **Backend API**: 84 unit tests (100% passing)
  - Crypto utilities (22 tests)
  - JWT authentication (31 tests)
  - Error classes (31 tests)
- ✅ **Frontend Web**: 52 unit tests
  - AudioManager (52 tests)
- 🎯 **Total**: 136 tests

### Coverage Thresholds

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

---

## 🚀 Quick Start

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui

# Run tests for specific workspace
pnpm test:api   # Backend only
pnpm test:web   # Frontend only
```

---

## 📦 Testing Infrastructure

### Backend (API)

**Framework**: Vitest + Miniflare

**Configuration**: `apps/api/vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
})
```

**Test Files**: `apps/api/src/**/*.test.ts`

### Frontend (Web)

**Framework**: Vitest + Testing Library + jsdom

**Configuration**: `apps/web/vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
})
```

**Test Files**: `apps/web/src/**/*.test.{ts,tsx}`

**Setup File**: `apps/web/src/test/setup.ts`
- Mocks Web Audio API
- Mocks i18next
- Mocks react-router-dom
- Configures @testing-library/jest-dom

---

## 📝 Test Files

### Backend Tests

#### `apps/api/src/lib/crypto.test.ts` (22 tests)

Tests for password hashing and verification:
- ✅ Hash generation and format
- ✅ Salt randomness
- ✅ Password verification
- ✅ Malformed hash handling
- ✅ Security properties (iterations, salt length, hash length)
- ✅ Edge cases (empty passwords, long passwords, special characters)

```typescript
// Example test
it('should verify correct password', async () => {
  const password = 'testPassword123'
  const hash = await hashPassword(password)
  const isValid = await verifyPassword(password, hash)
  expect(isValid).toBe(true)
})
```

#### `apps/api/src/lib/jwt.test.ts` (31 tests)

Tests for JWT token generation and verification:
- ✅ Access token generation
- ✅ Refresh token generation
- ✅ Token verification
- ✅ Expiration handling
- ✅ Signature validation
- ✅ Tampering detection
- ✅ Security properties (HS256, constant-time comparison)

```typescript
// Example test
it('should reject expired token', async () => {
  const pastTime = Date.now() - 20 * 60 * 1000 // 20 minutes ago
  vi.spyOn(Date, 'now').mockReturnValue(pastTime)
  const token = await generateAccessToken(userId, email, secret)
  vi.restoreAllMocks()

  await expect(verifyToken(token, secret)).rejects.toThrow('Token expired')
})
```

#### `apps/api/src/lib/errors.test.ts` (31 tests)

Tests for custom error classes:
- ✅ AppError base class
- ✅ ValidationError, AuthenticationError, NotFoundError
- ✅ ConflictError, RateLimitError, DatabaseError
- ✅ Error serialization to JSON
- ✅ Error inheritance chain
- ✅ Details handling (null, undefined, complex objects)

```typescript
// Example test
it('should serialize to JSON correctly', () => {
  const error = new ValidationError('Invalid input', { field: 'email' })
  const json = error.toJSON()

  expect(json).toEqual({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      details: { field: 'email' },
    },
  })
})
```

### Frontend Tests

#### `apps/web/src/lib/audio/AudioManager.test.ts` (52 tests)

Tests for audio management:
- ✅ Initialization
- ✅ Tick sound start/stop
- ✅ Background music start/stop
- ✅ Volume controls
- ✅ Settings management
- ✅ Cleanup and resource management
- ✅ Singleton pattern
- ✅ Error handling
- ✅ Concurrent operations

```typescript
// Example test
it('should initialize audio context', async () => {
  await audioManager.initialize()
  expect(audioManager.isReady()).toBe(true)
})

it('should set audio volume with clamping', () => {
  audioManager.setAudioVolume(150)
  expect(audioManager.getSettings().audioVolume).toBe(100)

  audioManager.setAudioVolume(-10)
  expect(audioManager.getSettings().audioVolume).toBe(0)
})
```

---

## 🔧 Running Tests

### Development Workflow

**1. Run tests in watch mode while coding**:
```bash
# Watch all tests
pnpm test:watch

# Watch specific workspace
cd apps/api && pnpm test:watch
cd apps/web && pnpm test:watch
```

**2. Run tests before committing**:
```bash
pnpm test
```

**3. Check coverage**:
```bash
pnpm test:coverage

# Coverage report will be in:
# - apps/api/coverage/
# - apps/web/coverage/
```

**4. Visual test UI**:
```bash
pnpm test:ui
# Opens interactive test UI in browser
```

### CI/CD

Tests are automatically run on:
- Every push to any branch
- Every pull request
- Before deployment

---

## 📊 Coverage Reports

### Generating Coverage

```bash
# Generate coverage for all workspaces
pnpm test:coverage

# Generate for specific workspace
pnpm --filter api test:coverage
pnpm --filter web test:coverage
```

### Coverage Formats

Coverage is generated in multiple formats:
- **Text**: Console output
- **HTML**: `coverage/index.html` (open in browser)
- **JSON**: `coverage/coverage-final.json` (for CI tools)
- **LCOV**: `coverage/lcov.info` (for coverage services)

### Viewing HTML Coverage

```bash
cd apps/api
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

---

## ✍️ Writing Tests

### Test File Organization

```
src/
├── lib/
│   ├── crypto.ts
│   ├── crypto.test.ts      # ✅ Co-located with source
│   ├── jwt.ts
│   └── jwt.test.ts         # ✅ Co-located with source
├── components/
│   ├── Header.tsx
│   └── Header.test.tsx     # ✅ Co-located with source
└── features/
    └── auth/
        ├── LoginPage.tsx
        └── LoginPage.test.tsx  # ✅ Co-located with source
```

### Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('ComponentName or FunctionName', () => {
  // Setup
  beforeEach(() => {
    // Reset state, create mocks
  })

  afterEach(() => {
    // Cleanup
  })

  describe('feature or method name', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = someFunction(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### Testing Best Practices

#### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
it('should call fetchData method', () => {
  const spy = vi.spyOn(component, 'fetchData')
  component.render()
  expect(spy).toHaveBeenCalled()
})

// ✅ Good: Testing behavior
it('should display user data after loading', async () => {
  render(<UserProfile userId="123" />)
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

#### 2. Use Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => { ... })
it('test1', () => { ... })

// ✅ Good
it('should hash password with PBKDF2 and random salt', () => { ... })
it('should reject token with invalid signature', () => { ... })
it('should display error message when login fails', () => { ... })
```

#### 3. Test Edge Cases

```typescript
describe('hashPassword', () => {
  it('should handle empty password', async () => { ... })
  it('should handle very long password (1000 chars)', async () => { ... })
  it('should handle special characters', async () => { ... })
  it('should handle unicode characters', async () => { ... })
})
```

#### 4. Use Arrange-Act-Assert Pattern

```typescript
it('should verify correct password', async () => {
  // Arrange
  const password = 'testPassword123'
  const hash = await hashPassword(password)

  // Act
  const isValid = await verifyPassword(password, hash)

  // Assert
  expect(isValid).toBe(true)
})
```

#### 5. Mock External Dependencies

```typescript
// Mock API calls
vi.mock('./api/client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: mockData }),
    post: vi.fn().mockResolvedValue({ data: mockData }),
  },
}))

// Mock timers
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
vi.useRealTimers()
```

---

## 🧪 Testing Patterns

### Unit Testing

**What to Test**:
- Pure functions
- Utilities
- Helpers
- Business logic

**Example**:
```typescript
// Testing pure function
describe('formatDate', () => {
  it('should format date in ISO format', () => {
    const date = new Date('2025-01-01')
    expect(formatDate(date)).toBe('2025-01-01')
  })
})
```

### Integration Testing

**What to Test**:
- API endpoints
- Database operations
- Service interactions

**Example**:
```typescript
// Testing API endpoint (future)
describe('POST /auth/login', () => {
  it('should return tokens for valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
  })
})
```

### Component Testing

**What to Test**:
- User interactions
- Rendering
- State changes
- Props handling

**Example**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## 🐛 Debugging Tests

### Run Single Test File

```bash
# Vitest
pnpm vitest src/lib/crypto.test.ts

# Or with filter
pnpm test -- crypto
```

### Run Single Test

```typescript
// Use .only to run a single test
it.only('should test this specific case', () => {
  // ...
})

// Use describe.only for a group
describe.only('critical tests', () => {
  // ...
})
```

### Skip Tests Temporarily

```typescript
// Skip single test
it.skip('should test later', () => {
  // ...
})

// Skip group
describe.skip('not ready yet', () => {
  // ...
})
```

### Debug with console.log

```typescript
it('should debug something', () => {
  const result = someFunction()
  console.log('Result:', result) // Shows in test output
  expect(result).toBe('expected')
})
```

### Use Vitest UI for Debugging

```bash
pnpm test:ui
# Opens browser with interactive test explorer
# Can see test output, errors, and logs
```

---

## 📈 Continuous Improvement

### Adding Tests for New Features

1. **Write tests first** (TDD):
   ```typescript
   describe('newFeature', () => {
     it('should work correctly', () => {
       // Write test before implementation
     })
   })
   ```

2. **Run tests** (they should fail):
   ```bash
   pnpm test:watch
   ```

3. **Implement feature** until tests pass

4. **Refactor** with confidence

### Maintaining Test Quality

- ✅ Keep tests simple and focused
- ✅ One assertion per test (when possible)
- ✅ Test edge cases
- ✅ Mock external dependencies
- ✅ Clean up after tests
- ✅ Run tests before committing
- ✅ Review test coverage regularly

### Coverage Goals

| Category | Current | Target |
|----------|---------|--------|
| Unit Tests | 84 tests | 150+ tests |
| Integration Tests | 0 tests | 30+ tests |
| Component Tests | 52 tests | 100+ tests |
| E2E Tests | 0 tests | 10+ tests |

---

## 🔗 Resources

### Vitest Documentation
- **Website**: https://vitest.dev/
- **API Reference**: https://vitest.dev/api/
- **Configuration**: https://vitest.dev/config/

### Testing Library
- **React Testing Library**: https://testing-library.com/react
- **User Event**: https://testing-library.com/docs/user-event/intro
- **Jest DOM**: https://github.com/testing-library/jest-dom

### Best Practices
- **Kent C. Dodds**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **Testing Trophy**: https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications

---

## 🚨 Troubleshooting

### Tests Fail in CI but Pass Locally

**Possible Causes**:
- Timezone differences
- Missing environment variables
- Different Node versions
- Race conditions with async code

**Solutions**:
- Use consistent timezones in tests
- Check CI environment variables
- Specify Node version in package.json engines
- Add proper `await` and `waitFor` calls

### Slow Tests

**Solutions**:
- Use `vi.useFakeTimers()` for time-dependent tests
- Mock expensive operations
- Run tests in parallel (default in Vitest)
- Reduce test timeout if not needed

### Flaky Tests

**Causes**:
- Race conditions
- Improper cleanup
- Shared state between tests

**Solutions**:
- Use `beforeEach` and `afterEach` properly
- Avoid shared state
- Use `waitFor` for async operations
- Increase timeouts if necessary

---

## 📋 Test Checklist

Before committing code, ensure:

- [ ] All existing tests pass (`pnpm test`)
- [ ] New code has tests
- [ ] Coverage meets thresholds (70%)
- [ ] Tests are descriptive
- [ ] Edge cases are covered
- [ ] Mocks are properly cleaned up
- [ ] No `.only` or `.skip` in committed tests
- [ ] Tests run fast (< 10s total)

---

**Version**: 1.0.0
**Last Updated**: 2025-11-11
**Status**: Production Ready ✅
