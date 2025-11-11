import { useEffect, useRef, useState } from 'react'
import { getAudioManager, type AudioManager } from './AudioManager'
import type { BackgroundMusicType } from '@pbc/shared'

/**
 * React hook for managing audio in components
 */
export function useAudio() {
  const audioManagerRef = useRef<AudioManager | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    audioManagerRef.current = getAudioManager()

    // Check if already initialized
    if (audioManagerRef.current.isReady()) {
      setIsInitialized(true)
      setIsReady(true)
    }

    return () => {
      // Don't cleanup on unmount as it's a singleton
      // Cleanup will be handled by the app lifecycle
    }
  }, [])

  /**
   * Initialize audio context (requires user interaction)
   */
  const initializeAudio = async (): Promise<boolean> => {
    if (!audioManagerRef.current) return false

    try {
      await audioManagerRef.current.initialize()
      setIsInitialized(true)
      setIsReady(audioManagerRef.current.isReady())
      return true
    } catch (error) {
      console.error('Failed to initialize audio:', error)
      return false
    }
  }

  /**
   * Start tick sound
   */
  const startTick = (intervalMs: number = 1000): void => {
    audioManagerRef.current?.startTick(intervalMs)
  }

  /**
   * Stop tick sound
   */
  const stopTick = (): void => {
    audioManagerRef.current?.stopTick()
  }

  /**
   * Start background music
   */
  const startBackgroundMusic = async (type: BackgroundMusicType): Promise<void> => {
    if (type === 'none') return
    await audioManagerRef.current?.startBackgroundMusic(type)
  }

  /**
   * Stop background music
   */
  const stopBackgroundMusic = async (): Promise<void> => {
    await audioManagerRef.current?.stopBackgroundMusic()
  }

  /**
   * Update audio settings
   */
  const updateSettings = (settings: {
    tickEnabled?: boolean
    musicEnabled?: boolean
    audioVolume?: number
    musicVolume?: number
  }): void => {
    audioManagerRef.current?.updateSettings(settings)
  }

  /**
   * Set tick enabled
   */
  const setTickEnabled = (enabled: boolean): void => {
    audioManagerRef.current?.setTickEnabled(enabled)
  }

  /**
   * Set music enabled
   */
  const setMusicEnabled = async (enabled: boolean): Promise<void> => {
    await audioManagerRef.current?.setMusicEnabled(enabled)
  }

  /**
   * Set audio volume (0-100)
   */
  const setAudioVolume = (volume: number): void => {
    audioManagerRef.current?.setAudioVolume(volume)
  }

  /**
   * Set music volume (0-100)
   */
  const setMusicVolume = (volume: number): void => {
    audioManagerRef.current?.setMusicVolume(volume)
  }

  /**
   * Get current settings
   */
  const getSettings = () => {
    return audioManagerRef.current?.getSettings() || {
      tickEnabled: true,
      musicEnabled: false,
      audioVolume: 70,
      musicVolume: 40,
    }
  }

  return {
    isInitialized,
    isReady,
    initializeAudio,
    startTick,
    stopTick,
    startBackgroundMusic,
    stopBackgroundMusic,
    updateSettings,
    setTickEnabled,
    setMusicEnabled,
    setAudioVolume,
    setMusicVolume,
    getSettings,
  }
}
