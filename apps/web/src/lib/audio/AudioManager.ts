import type { BackgroundMusicType } from '@pbc/shared'

/**
 * AudioManager - Production-grade audio management using Web Audio API
 *
 * Features:
 * - Precise timing for tick sounds
 * - Background music with crossfade
 * - Independent volume controls
 * - Resource management and cleanup
 * - Browser autoplay policy handling
 */
export class AudioManager {
  private audioContext: AudioContext | null = null
  private musicElement: HTMLAudioElement | null = null
  private musicGainNode: GainNode | null = null
  private musicSourceNode: MediaElementAudioSourceNode | null = null

  private tickInterval: number | null = null
  private isInitialized = false
  private currentMusicType: BackgroundMusicType = 'none'

  // Audio settings
  private settings = {
    tickEnabled: true,
    musicEnabled: false,
    audioVolume: 70, // 0-100
    musicVolume: 40, // 0-100
  }

  /**
   * Initialize the audio context and nodes
   * Must be called after user interaction due to browser autoplay policy
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Resume context if suspended (autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      this.isInitialized = true
      console.log('[AudioManager] Initialized successfully')
    } catch (error) {
      console.error('[AudioManager] Failed to initialize:', error)
      throw error
    }
  }

  /**
   * Start tick sound that plays every second
   */
  startTick(intervalMs: number = 1000): void {
    if (!this.isInitialized || !this.audioContext || !this.settings.tickEnabled) {
      return
    }

    this.stopTick()

    // Play tick immediately
    this.playTickSound()

    // Then play every interval
    this.tickInterval = window.setInterval(() => {
      this.playTickSound()
    }, intervalMs)

    console.log(`[AudioManager] Tick started (interval: ${intervalMs}ms)`)
  }

  /**
   * Stop tick sound
   */
  stopTick(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
      console.log('[AudioManager] Tick stopped')
    }
  }

  /**
   * Play a single tick sound using oscillator (no audio file needed)
   */
  private playTickSound(): void {
    if (!this.audioContext || !this.settings.tickEnabled) return

    try {
      // Create oscillator for tick sound (short beep)
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      // Configure tick sound: 800Hz tone for 50ms
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)

      // Apply volume (convert 0-100 to 0-1)
      const volume = this.settings.audioVolume / 100

      // Create attack-release envelope for smooth sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05)

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // Play
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.05)
    } catch (error) {
      console.error('[AudioManager] Failed to play tick:', error)
    }
  }

  /**
   * Start background music
   */
  async startBackgroundMusic(type: BackgroundMusicType): Promise<void> {
    if (!this.isInitialized || !this.audioContext || !this.settings.musicEnabled || type === 'none') {
      return
    }

    // Stop current music if playing different type
    if (this.currentMusicType !== type && this.musicElement) {
      await this.stopBackgroundMusic()
    }

    this.currentMusicType = type

    try {
      // Create audio element
      this.musicElement = new Audio()
      this.musicElement.src = this.getMusicPath(type)
      this.musicElement.loop = true
      this.musicElement.preload = 'auto'

      // Create gain node for volume control
      this.musicGainNode = this.audioContext.createGain()
      const volume = this.settings.musicVolume / 100
      this.musicGainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)

      // Connect audio element to Web Audio API
      this.musicSourceNode = this.audioContext.createMediaElementSource(this.musicElement)
      this.musicSourceNode.connect(this.musicGainNode)
      this.musicGainNode.connect(this.audioContext.destination)

      // Start playing with fade-in
      await this.musicElement.play()

      // Fade in over 2 seconds
      this.musicGainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      this.musicGainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 2)

      console.log(`[AudioManager] Background music started: ${type}`)
    } catch (error) {
      console.error('[AudioManager] Failed to start background music:', error)
      this.cleanupMusic()
    }
  }

  /**
   * Stop background music with fade-out
   */
  async stopBackgroundMusic(): Promise<void> {
    if (!this.musicElement || !this.musicGainNode || !this.audioContext) return

    try {
      // Fade out over 1 second
      this.musicGainNode.gain.setValueAtTime(
        this.musicGainNode.gain.value,
        this.audioContext.currentTime
      )
      this.musicGainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1)

      // Wait for fade out
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Stop and cleanup
      this.musicElement.pause()
      this.musicElement.currentTime = 0
      this.cleanupMusic()

      console.log('[AudioManager] Background music stopped')
    } catch (error) {
      console.error('[AudioManager] Failed to stop background music:', error)
      this.cleanupMusic()
    }
  }

  /**
   * Get music file path based on type
   */
  private getMusicPath(type: BackgroundMusicType): string {
    // In production, these would be actual audio files
    // For now, we'll use placeholder paths
    const musicPaths: Record<Exclude<BackgroundMusicType, 'none'>, string> = {
      zen: '/audio/music/zen-garden.mp3',
      nature: '/audio/music/nature-sounds.mp3',
      rain: '/audio/music/rain.mp3',
      ocean: '/audio/music/ocean-waves.mp3',
      forest: '/audio/music/forest.mp3',
    }

    return musicPaths[type as Exclude<BackgroundMusicType, 'none'>] || ''
  }

  /**
   * Update tick sound enabled state
   */
  setTickEnabled(enabled: boolean): void {
    this.settings.tickEnabled = enabled
    if (!enabled) {
      this.stopTick()
    }
    console.log(`[AudioManager] Tick enabled: ${enabled}`)
  }

  /**
   * Update background music enabled state
   */
  async setMusicEnabled(enabled: boolean): Promise<void> {
    this.settings.musicEnabled = enabled
    if (!enabled && this.musicElement) {
      await this.stopBackgroundMusic()
    }
    console.log(`[AudioManager] Music enabled: ${enabled}`)
  }

  /**
   * Update audio volume (0-100)
   */
  setAudioVolume(volume: number): void {
    this.settings.audioVolume = Math.max(0, Math.min(100, volume))
    console.log(`[AudioManager] Audio volume: ${this.settings.audioVolume}`)
  }

  /**
   * Update music volume (0-100)
   */
  setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(100, volume))

    // Update current playing music volume
    if (this.musicGainNode && this.audioContext) {
      const newVolume = this.settings.musicVolume / 100
      this.musicGainNode.gain.setValueAtTime(newVolume, this.audioContext.currentTime)
    }

    console.log(`[AudioManager] Music volume: ${this.settings.musicVolume}`)
  }

  /**
   * Update all settings at once
   */
  updateSettings(settings: {
    tickEnabled?: boolean
    musicEnabled?: boolean
    audioVolume?: number
    musicVolume?: number
  }): void {
    if (settings.tickEnabled !== undefined) {
      this.setTickEnabled(settings.tickEnabled)
    }
    if (settings.musicEnabled !== undefined) {
      this.setMusicEnabled(settings.musicEnabled)
    }
    if (settings.audioVolume !== undefined) {
      this.setAudioVolume(settings.audioVolume)
    }
    if (settings.musicVolume !== undefined) {
      this.setMusicVolume(settings.musicVolume)
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings }
  }

  /**
   * Cleanup music resources
   */
  private cleanupMusic(): void {
    if (this.musicSourceNode) {
      this.musicSourceNode.disconnect()
      this.musicSourceNode = null
    }
    if (this.musicGainNode) {
      this.musicGainNode.disconnect()
      this.musicGainNode = null
    }
    if (this.musicElement) {
      this.musicElement.pause()
      this.musicElement.src = ''
      this.musicElement = null
    }
    this.currentMusicType = 'none'
  }

  /**
   * Cleanup all resources
   */
  async cleanup(): Promise<void> {
    console.log('[AudioManager] Cleaning up...')

    this.stopTick()
    await this.stopBackgroundMusic()

    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close()
    }

    this.audioContext = null
    this.isInitialized = false
    console.log('[AudioManager] Cleanup complete')
  }

  /**
   * Check if audio is initialized and ready
   */
  isReady(): boolean {
    return this.isInitialized && this.audioContext !== null && this.audioContext.state === 'running'
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null

/**
 * Get the singleton AudioManager instance
 */
export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager()
  }
  return audioManagerInstance
}

/**
 * Cleanup the singleton instance (useful for testing or cleanup)
 */
export async function cleanupAudioManager(): Promise<void> {
  if (audioManagerInstance) {
    await audioManagerInstance.cleanup()
    audioManagerInstance = null
  }
}
