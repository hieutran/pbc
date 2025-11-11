import { useParams } from 'react-router-dom'
import { TECHNIQUES } from '@pbc/shared'

export function ExercisePage() {
  const { technique: techniqueId } = useParams<{ technique: string }>()
  const technique = techniqueId ? TECHNIQUES[techniqueId] : null

  if (!technique) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-display font-bold text-zen-900 mb-4">
          Technique not found
        </h1>
        <p className="text-zen-600">The breathing technique you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-zen-900 mb-4">{technique.name}</h1>
        <p className="text-xl text-zen-600 mb-8">{technique.description}</p>

        {/* Breathing visualization - TODO: Implement animated circle */}
        <div className="card mb-8 flex items-center justify-center h-96 bg-gradient-to-br from-zen-50 to-primary-50">
          <div className="text-center">
            <div className="w-64 h-64 rounded-full bg-primary-200/50 animate-breathe mx-auto mb-4"></div>
            <p className="text-2xl font-display text-zen-700">Breathe In</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-display font-bold text-zen-900 mb-4">Instructions</h2>
            <ol className="space-y-3">
              {technique.instructions.map((instruction, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-zen-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="card">
            <h2 className="text-xl font-display font-bold text-zen-900 mb-4">Benefits</h2>
            <ul className="space-y-3">
              {technique.benefits.map((benefit, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-primary-500 mt-1">✓</span>
                  <span className="text-zen-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
