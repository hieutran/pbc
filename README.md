# 🌬️ Personal Breath Coach

A minimalist web application for practicing various breathing techniques including Nadi Shodhana, Ujjayi, Kapalbhati, Bhramari, Wim Hof Method, and more. Built with modern web technologies and deployed on Cloudflare's edge network.

## ✨ Features

- **7+ Breathing Techniques** - Practice ancient pranayama and modern breathing methods
- **User Authentication** - Secure login and registration with JWT
- **Exercise Tracking** - Track your breathing practice history
- **Progress Analytics** - View stats and streaks
- **Zen-Inspired Design** - Clean, minimalist UI following yoga/meditation aesthetics
- **PWA Support** - Install as a native app, works offline
- **Global Performance** - Deployed on Cloudflare's edge network for low latency worldwide

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast builds
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Zustand** for state management
- **React Router** for navigation

### Backend
- **Cloudflare Workers** for serverless API
- **Hono** as the web framework
- **Cloudflare D1** (SQLite) for database
- **Cloudflare KV** for session storage
- **Zod** for validation

### Deployment
- **Cloudflare Pages** for frontend hosting
- **Cloudflare Workers** for API hosting
- **GitHub Actions** for CI/CD

## 📁 Project Structure

```
pbc/
├── apps/
│   ├── web/              # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   └── api/              # Cloudflare Workers API
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   └── index.ts
│       ├── migrations/   # D1 migrations
│       └── wrangler.toml
│
├── packages/
│   └── shared/           # Shared TypeScript types
│       └── src/
│           ├── types/
│           └── constants/
│
└── package.json          # Root package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ ([Install](https://pnpm.io/installation))
- **Cloudflare Account** (Free tier works!)
- **Wrangler CLI** (installed via pnpm)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hieutran/pbc.git
   cd pbc
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**

   For the API:
   ```bash
   cd apps/api
   cp .dev.vars.example .dev.vars
   # Edit .dev.vars and add your secrets
   ```

4. **Setup Cloudflare**

   Login to Cloudflare:
   ```bash
   pnpm wrangler login
   ```

   Create D1 database:
   ```bash
   cd apps/api
   pnpm wrangler d1 create pbc-db
   ```

   Update `wrangler.toml` with your database ID.

5. **Run database migrations**
   ```bash
   cd apps/api
   pnpm db:migrate
   ```

6. **Start development servers**

   From the root directory:
   ```bash
   pnpm dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - API: http://localhost:8787

## 📦 Available Scripts

### Root Scripts
```bash
pnpm dev          # Start all development servers
pnpm build        # Build all apps
pnpm test         # Run tests
pnpm lint         # Lint all packages
pnpm format       # Format code with Prettier
pnpm clean        # Clean all build artifacts
```

### Frontend (apps/web)
```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm deploy       # Deploy to Cloudflare Pages
```

### Backend (apps/api)
```bash
pnpm dev          # Start Wrangler dev server
pnpm build        # Build worker
pnpm deploy       # Deploy to Cloudflare Workers
pnpm db:migrate   # Run migrations locally
```

## 🗃️ Database Schema

### Users
- `id` - Unique user ID
- `email` - User email (unique)
- `password_hash` - Argon2id hashed password
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### User Settings
- `user_id` - Foreign key to users
- `default_technique` - Preferred breathing technique
- `theme` - UI theme (light/dark/auto)
- `sound_enabled` - Audio cues enabled
- `reminder_enabled` - Practice reminders

### Exercise Sessions
- `id` - Unique session ID
- `user_id` - Foreign key to users
- `technique` - Breathing technique used
- `duration` - Session duration in seconds
- `cycles` - Number of breathing cycles
- `settings` - JSON settings for the exercise
- `completed_at` - Session completion timestamp

## 🌍 Deployment

### Deploy Frontend (Cloudflare Pages)

1. Connect your GitHub repository to Cloudflare Pages
2. Set build settings:
   - Build command: `pnpm build:web`
   - Build output directory: `apps/web/dist`
3. Deploy!

Or manually:
```bash
cd apps/web
pnpm deploy
```

### Deploy Backend (Cloudflare Workers)

```bash
cd apps/api

# Set production secrets
pnpm wrangler secret put JWT_SECRET
pnpm wrangler secret put REFRESH_SECRET

# Run migrations on production DB
pnpm db:migrate:prod

# Deploy
pnpm deploy
```

## 🧘 Breathing Techniques

### 1. Nadi Shodhana (Alternate Nostril Breathing)
- **Difficulty:** Beginner
- **Duration:** 5-20 minutes
- **Benefits:** Balances hemispheres, reduces stress, improves focus

### 2. Ujjayi (Ocean Breath)
- **Difficulty:** Beginner
- **Duration:** 3-30 minutes
- **Benefits:** Increases oxygen, builds heat, calms mind

### 3. Kapalbhati (Skull Shining Breath)
- **Difficulty:** Intermediate
- **Duration:** 1-10 minutes
- **Benefits:** Energizes body, clears mind, strengthens core

### 4. Bhramari (Bee Breath)
- **Difficulty:** Beginner
- **Duration:** 2-10 minutes
- **Benefits:** Instant calm, lowers blood pressure, improves sleep

### 5. Wim Hof Method
- **Difficulty:** Advanced
- **Duration:** 5-20 minutes
- **Benefits:** Boosts energy, strengthens immunity, mental clarity

### 6. Box Breathing
- **Difficulty:** Beginner
- **Duration:** 2-15 minutes
- **Benefits:** Reduces anxiety, improves focus, performance

### 7. 4-7-8 Breathing
- **Difficulty:** Beginner
- **Duration:** 1-10 minutes
- **Benefits:** Deep relaxation, helps sleep, reduces anxiety

## 🔒 Security

- Passwords hashed with **Argon2id**
- JWT tokens with short expiration (15 minutes)
- Refresh token rotation
- Rate limiting via Cloudflare KV
- CORS protection
- SQL injection prevention (parameterized queries)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Breathing techniques based on traditional Pranayama practices
- Wim Hof Method inspiration
- Modern breathwork research

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with 🫁 and ❤️ for better breathing**
