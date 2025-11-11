import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { TECHNIQUES, BACKGROUND_MUSIC_INFO, DEFAULT_AUDIO_SETTINGS } from '@pbc/shared'
import type { BackgroundMusicType } from '@pbc/shared'
import { useAudio } from '../../lib/audio'

export function ExercisePage() {
  const { technique: techniqueId } = useParams<{ technique: string }>()
  const technique = techniqueId ? TECHNIQUES[techniqueId] : null

  const audio = useAudio()
  const [isExercising, setIsExercising] = useState(false)
  const [showAudioSettings, setShowAudioSettings] = useState(false)
  const [audioSettings, setAudioSettings] = useState(DEFAULT_AUDIO_SETTINGS)

  // Initialize audio on mount
  useEffect(() => {
    if (!audio.isInitialized) {
      // Audio will be initialized on first user interaction (Start button)
    }
  }, [audio.isInitialized])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isExercising) {
        handleStopExercise()
      }
    }
  }, [isExercising])

  const handleStartExercise = async () => {
    // Initialize audio if not already
    if (!audio.isInitialized) {
      const initialized = await audio.initializeAudio()
      if (!initialized) {
        alert('Failed to initialize audio. Please check your browser settings.')
        return
      }
    }

    // Apply audio settings
    audio.updateSettings({
      tickEnabled: audioSettings.tickSoundEnabled,
      musicEnabled: audioSettings.backgroundMusicEnabled,
      audioVolume: audioSettings.audioVolume,
      musicVolume: audioSettings.musicVolume,
    })

    // Start tick sound if enabled
    if (audioSettings.tickSoundEnabled) {
      audio.startTick(1000) // Every second
    }

    // Start background music if enabled
    if (audioSettings.backgroundMusicEnabled && audioSettings.backgroundMusicType !== 'none') {
      await audio.startBackgroundMusic(audioSettings.backgroundMusicType)
    }

    setIsExercising(true)
  }

  const handleStopExercise = async () => {
    audio.stopTick()
    await audio.stopBackgroundMusic()
    setIsExercising(false)
  }

  const handleToggleTickSound = () => {
    const newValue = !audioSettings.tickSoundEnabled
    setAudioSettings(prev => ({ ...prev, tickSoundEnabled: newValue }))
    if (isExercising) {
      audio.setTickEnabled(newValue)
      if (newValue) {
        audio.startTick(1000)
      } else {
        audio.stopTick()
      }
    }
  }

  const handleToggleBackgroundMusic = async () => {
    const newValue = !audioSettings.backgroundMusicEnabled
    setAudioSettings(prev => ({ ...prev, backgroundMusicEnabled: newValue }))
    if (isExercising) {
      await audio.setMusicEnabled(newValue)
      if (newValue && audioSettings.backgroundMusicType !== 'none') {
        await audio.startBackgroundMusic(audioSettings.backgroundMusicType)
      } else {
        await audio.stopBackgroundMusic()
      }
    }
  }

  const handleMusicTypeChange = async (type: BackgroundMusicType) => {
    setAudioSettings(prev => ({ ...prev, backgroundMusicType: type }))
    if (isExercising && audioSettings.backgroundMusicEnabled && type !== 'none') {
      await audio.stopBackgroundMusic()
      await audio.startBackgroundMusic(type)
    }
  }

  const handleAudioVolumeChange = (volume: number) => {
    setAudioSettings(prev => ({ ...prev, audioVolume: volume }))
    audio.setAudioVolume(volume)
  }

  const handleMusicVolumeChange = (volume: number) => {
    setAudioSettings(prev => ({ ...prev, musicVolume: volume }))
    audio.setMusicVolume(volume)
  }

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

        {/* Exercise Controls */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {!isExercising ? (
                <button
                  onClick={handleStartExercise}
                  className="btn-primary px-8 py-3 text-lg"
                >
                  Start Exercise
                </button>
              ) : (
                <button
                  onClick={handleStopExercise}
                  className="btn-secondary px-8 py-3 text-lg"
                >
                  Stop Exercise
                </button>
              )}
            </div>
            <button
              onClick={() => setShowAudioSettings(!showAudioSettings)}
              className="btn-secondary px-4 py-2"
            >
              {showAudioSettings ? 'Hide' : 'Show'} Audio Settings
            </button>
          </div>

          {/* Audio Settings Panel */}
          {showAudioSettings && (
            <div className="border-t border-zen-200 pt-6 space-y-6">
              <h3 className="text-lg font-display font-bold text-zen-900 mb-4">
                Audio Settings
              </h3>

              {/* Tick Sound Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-zen-900">Tick Sound</label>
                  <p className="text-sm text-zen-600">Play a tick sound every second</p>
                </div>
                <button
                  onClick={handleToggleTickSound}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    audioSettings.tickSoundEnabled ? 'bg-primary-600' : 'bg-zen-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      audioSettings.tickSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Audio Volume */}
              <div>
                <label className="font-medium text-zen-900 block mb-2">
                  Tick Volume: {audioSettings.audioVolume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={audioSettings.audioVolume}
                  onChange={e => handleAudioVolumeChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Background Music Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-zen-900">Background Music</label>
                  <p className="text-sm text-zen-600">Play relaxing background music</p>
                </div>
                <button
                  onClick={handleToggleBackgroundMusic}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    audioSettings.backgroundMusicEnabled ? 'bg-primary-600' : 'bg-zen-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      audioSettings.backgroundMusicEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Music Type Selection */}
              {audioSettings.backgroundMusicEnabled && (
                <>
                  <div>
                    <label className="font-medium text-zen-900 block mb-2">Music Type</label>
                    <select
                      value={audioSettings.backgroundMusicType}
                      onChange={e => handleMusicTypeChange(e.target.value as BackgroundMusicType)}
                      className="w-full rounded-md border border-zen-300 px-3 py-2 text-zen-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {Object.entries(BACKGROUND_MUSIC_INFO)
                        .filter(([type]) => type !== 'none')
                        .map(([type, info]) => (
                          <option key={type} value={type}>
                            {info.name} - {info.description}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Music Volume */}
                  <div>
                    <label className="font-medium text-zen-900 block mb-2">
                      Music Volume: {audioSettings.musicVolume}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={audioSettings.musicVolume}
                      onChange={e => handleMusicVolumeChange(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Breathing visualization */}
        <div className="card mb-8 flex items-center justify-center h-96 bg-gradient-to-br from-zen-50 to-primary-50">
          <div className="text-center">
            <div
              className={`w-64 h-64 rounded-full bg-primary-200/50 mx-auto mb-4 ${
                isExercising ? 'animate-breathe' : ''
              }`}
            ></div>
            <p className="text-2xl font-display text-zen-700">
              {isExercising ? 'Breathe In' : 'Press Start to Begin'}
            </p>
            {isExercising && audioSettings.tickSoundEnabled && (
              <p className="text-sm text-zen-600 mt-2">🔊 Tick sound enabled</p>
            )}
            {isExercising && audioSettings.backgroundMusicEnabled && (
              <p className="text-sm text-zen-600 mt-1">
                🎵 Playing: {BACKGROUND_MUSIC_INFO[audioSettings.backgroundMusicType].name}
              </p>
            )}
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
