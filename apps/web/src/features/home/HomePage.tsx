import { Link } from 'react-router-dom'
import { TECHNIQUES } from '@pbc/shared'

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-display font-bold text-zen-900 mb-6 text-balance">
          Find Your Breath,
          <br />
          Find Your Peace
        </h1>
        <p className="text-xl text-zen-600 mb-8 max-w-2xl mx-auto text-balance">
          Practice ancient breathing techniques designed to reduce stress, improve focus, and
          enhance your well-being.
        </p>
        <Link to="/register" className="btn-primary text-lg inline-block">
          Start Your Journey
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Object.values(TECHNIQUES).map((technique, index) => (
          <div
            key={technique.id}
            className="card hover:shadow-md transition-shadow duration-200 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h3 className="text-2xl font-display font-bold text-zen-900 mb-2">
              {technique.name}
            </h3>
            <p className="text-zen-600 mb-4">{technique.description}</p>
            <div className="flex items-center gap-2 text-sm text-zen-500 mb-4">
              <span className="px-2 py-1 bg-zen-100 rounded">
                {technique.difficulty}
              </span>
              <span>•</span>
              <span>{Math.floor(technique.duration.default / 60)} min</span>
            </div>
            <ul className="space-y-2">
              {technique.benefits.slice(0, 3).map((benefit, i) => (
                <li key={i} className="text-sm text-zen-700 flex items-start gap-2">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
