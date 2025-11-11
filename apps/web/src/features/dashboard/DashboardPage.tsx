import { Link } from 'react-router-dom'
import { TECHNIQUES } from '@pbc/shared'
import { useAuthStore } from '@/lib/store/authStore'

export function DashboardPage() {
  const user = useAuthStore(state => state.user)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-zen-900 mb-2">
          Welcome back, {user?.email?.split('@')[0]}
        </h1>
        <p className="text-zen-600">Choose a breathing technique to begin your practice</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(TECHNIQUES).map(technique => (
          <Link
            key={technique.id}
            to={`/exercise/${technique.id}`}
            className="card hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            <h3 className="text-2xl font-display font-bold text-zen-900 mb-2">
              {technique.name}
            </h3>
            <p className="text-zen-600 mb-4">{technique.description}</p>
            <div className="flex items-center gap-2 text-sm text-zen-500">
              <span className="px-2 py-1 bg-zen-100 rounded">{technique.difficulty}</span>
              <span>•</span>
              <span>{Math.floor(technique.duration.default / 60)} min</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
