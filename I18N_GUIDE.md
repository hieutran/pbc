# Internationalization (i18n) Guide

> Production-grade multi-language implementation for Personal Breath Coach

## Overview

This application uses **react-i18next** for internationalization, providing:
- ✅ Type-safe translation keys
- ✅ Automatic language detection
- ✅ User language preference storage
- ✅ Lazy loading of translations
- ✅ RTL support (ready)
- ✅ Pluralization and formatting
- ✅ 7 supported languages

---

## Supported Languages

| Code | Language | Native Name | Status |
|------|----------|-------------|--------|
| `en` | English | English | ✅ Complete |
| `vi` | Vietnamese | Tiếng Việt | ✅ Complete |
| `es` | Spanish | Español | 🔨 In Progress |
| `fr` | French | Français | 🔨 In Progress |
| `de` | German | Deutsch | 🔨 In Progress |
| `ja` | Japanese | 日本語 | 🔨 In Progress |
| `zh` | Chinese | 中文 | 🔨 In Progress |

Default language: **English (en)**

---

## File Structure

```
apps/web/
├── public/locales/        # Translation files
│   ├── en/                # English translations
│   │   ├── common.json    # Common translations
│   │   ├── auth.json      # Authentication
│   │   ├── techniques.json # Breathing techniques
│   │   ├── dashboard.json # Dashboard
│   │   ├── exercise.json  # Exercise page
│   │   ├── history.json   # History page
│   │   └── settings.json  # Settings
│   │
│   └── vi/                # Vietnamese translations
│       └── ... (same structure)
│
└── src/
    └── lib/i18n/          # i18n configuration
        ├── config.ts      # i18next setup
        ├── types.ts       # TypeScript types
        └── index.ts       # Exports
```

---

## Usage

### Basic Translation

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('app.tagline')}</p>
    </div>
  )
}
```

### With Namespace

```typescript
import { useTranslation } from 'react-i18next'

function LoginPage() {
  const { t } = useTranslation('auth') // Use 'auth' namespace

  return (
    <div>
      <h1>{t('login.title')}</h1>
      <p>{t('login.subtitle')}</p>
    </div>
  )
}
```

### With Interpolation

```typescript
const { t } = useTranslation()

// Translation: "Welcome back, {{name}}"
<h1>{t('dashboard.welcome', { name: 'John' })}</h1>
// Output: "Welcome back, John"
```

### With Pluralization

```typescript
const { t } = useTranslation()

// Translations:
// "time.minutes": "{{count}} minute"
// "time.minutes_plural": "{{count}} minutes"

<span>{t('time.minutes', { count: 1 })}</span>  // "1 minute"
<span>{t('time.minutes', { count: 5 })}</span>  // "5 minutes"
```

### Multiple Namespaces

```typescript
const { t } = useTranslation(['common', 'auth'])

<h1>{t('common:app.name')}</h1>
<p>{t('auth:login.title')}</p>
```

---

## Language Switcher

### Component Usage

```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  )
}
```

### Compact Version

```typescript
import { LanguageSwitcherCompact } from '@/components/LanguageSwitcher'

// Cycles through languages on click
<LanguageSwitcherCompact />
```

### Programmatic Language Change

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <button onClick={() => changeLanguage('vi')}>
      Switch to Vietnamese
    </button>
  )
}
```

---

## Adding New Translations

### 1. Add Translation Keys

Edit the appropriate namespace file:

```json
// apps/web/public/locales/en/common.json
{
  "myNewSection": {
    "title": "My Title",
    "description": "My Description"
  }
}
```

### 2. Add to Other Languages

Repeat for each supported language:

```json
// apps/web/public/locales/vi/common.json
{
  "myNewSection": {
    "title": "Tiêu Đề Của Tôi",
    "description": "Mô Tả Của Tôi"
  }
}
```

### 3. Update TypeScript Types (Optional)

For better type safety, update `apps/web/src/lib/i18n/types.ts`:

```typescript
export type CommonTranslationKey =
  | 'app.name'
  | 'app.tagline'
  | 'myNewSection.title'  // Add your new key
  | 'myNewSection.description'
  // ... other keys
```

### 4. Use in Component

```typescript
const { t } = useTranslation()

<h1>{t('myNewSection.title')}</h1>
<p>{t('myNewSection.description')}</p>
```

---

## Adding New Language

### 1. Update Supported Locales

Edit `packages/shared/src/constants/locales.ts`:

```typescript
export const SUPPORTED_LOCALES = ['en', 'vi', 'es', 'fr', 'de', 'ja', 'zh', 'ko'] as const
//                                                                              ^^^^ Add new

export const LOCALE_NAMES: Record<SupportedLocale, { native: string; english: string }> = {
  // ... existing
  ko: { native: '한국어', english: 'Korean' },  // Add new
}
```

### 2. Create Translation Files

```bash
mkdir apps/web/public/locales/ko
cp -r apps/web/public/locales/en/* apps/web/public/locales/ko/
```

### 3. Translate Content

Edit each JSON file in `apps/web/public/locales/ko/` and translate.

### 4. Update Database Migration

Edit `apps/api/migrations/0002_add_language_to_settings.sql`:

```sql
ALTER TABLE user_settings ADD COLUMN language TEXT
  CHECK(language IN ('en', 'vi', 'es', 'fr', 'de', 'ja', 'zh', 'ko'))
  DEFAULT 'en';
```

### 5. Update Backend Validation

Edit `apps/api/src/routes/user.ts`:

```typescript
const updateSettingsSchema = z.object({
  // ... other fields
  language: z.enum(['en', 'vi', 'es', 'fr', 'de', 'ja', 'zh', 'ko']).optional(),
})
```

---

## Best Practices

### ✅ DO

- **Use namespaces** to organize translations by feature
- **Keep keys descriptive** (`auth.login.title` not `alt`)
- **Use interpolation** for dynamic content
- **Provide context** in comments for translators
- **Test with long text** to ensure UI handles it
- **Use pluralization** for counts
- **Store user preference** in database
- **Lazy load** translations for performance

### ❌ DON'T

- **Hardcode text** in components (always use `t()`)
- **Concatenate translations** (use interpolation)
- **Mix languages** in single file
- **Use HTML in translations** (security risk)
- **Forget fallback language**
- **Skip plural forms**
- **Translate technical terms** that should stay in English

---

## Advanced Features

### Date and Time Formatting

```typescript
import { useTranslation } from 'react-i18next'

const { i18n } = useTranslation()

const formattedDate = new Date().toLocaleDateString(i18n.language)
const formattedTime = new Date().toLocaleTimeString(i18n.language)
```

### Number Formatting

```typescript
const formattedNumber = (12345.67).toLocaleString(i18n.language)
// en: "12,345.67"
// vi: "12.345,67"
// fr: "12 345,67"
```

### RTL Support

```typescript
import { isRTL } from '@pbc/shared'

function MyComponent() {
  const { i18n } = useTranslation()
  const isRightToLeft = isRTL(i18n.language as SupportedLocale)

  return (
    <div dir={isRightToLeft ? 'rtl' : 'ltr'}>
      {/* Content */}
    </div>
  )
}
```

### Loading State

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t, ready } = useTranslation()

  if (!ready) {
    return <div>Loading translations...</div>
  }

  return <h1>{t('app.name')}</h1>
}
```

---

## Translation Workflow

### For Developers

1. Add English translations first
2. Use translation keys in components
3. Test with long text (German is ~30% longer than English)
4. Commit with `feat(i18n): add [feature] translations`

### For Translators

1. Copy English JSON files
2. Translate values (not keys!)
3. Test in browser
4. Submit pull request

### Quality Checklist

- [ ] All namespaces translated
- [ ] Plural forms included
- [ ] Interpolation variables preserved
- [ ] Context appropriate
- [ ] No missing keys
- [ ] Grammar correct
- [ ] UI tested with translation

---

## Debugging

### Check Current Language

```typescript
const { i18n } = useTranslation()
console.log('Current language:', i18n.language)
```

### List Missing Keys

Enable debug mode in `apps/web/src/lib/i18n/config.ts`:

```typescript
debug: true,  // Shows missing translation warnings
```

### Force Language

```typescript
// Ignore browser/system settings
i18n.changeLanguage('en')
```

### Clear Language Cache

```typescript
// Clear localStorage
localStorage.removeItem('i18nextLng')

// Reload page
window.location.reload()
```

---

## Performance

### Bundle Size

- Each language file: ~10-20 KB
- Lazy loaded on demand
- Only active language loaded initially

### Loading Strategy

```typescript
// apps/web/src/lib/i18n/config.ts
backend: {
  loadPath: '/locales/{{lng}}/{{ns}}.json',
  // Translations loaded on demand
}
```

### Caching

Translations are cached:
- **Browser**: localStorage
- **Session**: In-memory cache
- **Cloudflare Pages**: CDN edge cache

---

## Testing

### Unit Tests

```typescript
import { render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from './lib/i18n'

test('renders translated text', () => {
  const { getByText } = render(
    <I18nextProvider i18n={i18n}>
      <MyComponent />
    </I18nextProvider>
  )

  expect(getByText('Personal Breath Coach')).toBeInTheDocument()
})
```

### E2E Tests

```typescript
test('language switching works', async ({ page }) => {
  await page.goto('/')

  // Check default language
  await expect(page.locator('h1')).toHaveText('Personal Breath Coach')

  // Switch to Vietnamese
  await page.selectOption('[aria-label="Select language"]', 'vi')

  // Check Vietnamese text
  await expect(page.locator('h1')).toHaveText('Huấn Luyện Viên Hơi Thở')
})
```

---

## Resources

- **react-i18next**: https://react.i18next.com/
- **i18next**: https://www.i18next.com/
- **Locale codes**: https://www.iso.org/iso-639-language-codes.html
- **Translation best practices**: https://github.com/i18next/react-i18next/blob/master/GUIDELINES.md

---

## Migration from Hardcoded Text

Replace hardcoded text with translations:

```typescript
// ❌ Before
<h1>Welcome Back</h1>

// ✅ After
<h1>{t('auth:login.title')}</h1>
```

Search for hardcoded text:
```bash
# Find hardcoded strings
grep -r "\".*\"" apps/web/src/features --include="*.tsx"
```

---

**Version**: 1.0.0
**Last Updated**: 2025-11-11
**Status**: Production Ready ✅
