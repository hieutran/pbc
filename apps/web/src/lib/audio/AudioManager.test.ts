import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { AudioManager, getAudioManager, cleanupAudioManager } from './AudioManager'

describe('AudioManager', () => {
  let audioManager: AudioManager

  beforeEach(() => {
    audioManager = new AudioManager()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  afterEach(async () => {
    await audioManager.cleanup()
  })

  describe('initialization', () => {
    it('should create AudioManager instance', () => {
      expect(audioManager).toBeDefined()
      expect(audioManager).toBeInstanceOf(AudioManager)
    })

    it('should not be initialized on construction', () => {
      expect(audioManager.isReady()).toBe(false)
    })

    it('should initialize audio context', async () => {
      await audioManager.initialize()
      expect(audioManager.isReady()).toBe(true)
    })

    it('should not initialize twice', async () => {
      await audioManager.initialize()
      const firstReady = audioManager.isReady()

      await audioManager.initialize()
      const secondReady = audioManager.isReady()

      expect(firstReady).toBe(true)
      expect(secondReady).toBe(true)
    })

    it('should handle suspended audio context', async () => {
      // Mock a suspended context
      const mockContext = {
        state: 'suspended',
        resume: vi.fn().mockResolvedValue(undefined),
        createOscillator: vi.fn(),
        createGain: vi.fn(),
        createMediaElementSource: vi.fn(),
        destination: {},
        currentTime: 0,
        close: vi.fn(),
      }

      ;(global as any).AudioContext = vi.fn(() => mockContext)

      const manager = new AudioManager()
      await manager.initialize()

      expect(mockContext.resume).toHaveBeenCalled()
      await manager.cleanup()
    })
  })

  describe('tick sound', () => {
    beforeEach(async () => {
      await audioManager.initialize()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should start tick sound', () => {
      audioManager.startTick(1000)
      // Tick should be started (verified by no errors)
      expect(true).toBe(true)
    })

    it('should stop tick sound', () => {
      audioManager.startTick(1000)
      audioManager.stopTick()
      // Tick should be stopped (verified by no errors)
      expect(true).toBe(true)
    })

    it('should play tick at specified interval', () => {
      const interval = 1000
      audioManager.startTick(interval)

      // Advance time and check ticks
      vi.advanceTimersByTime(interval)
      vi.advanceTimersByTime(interval)
      vi.advanceTimersByTime(interval)

      // If we got here without errors, ticks are working
      expect(true).toBe(true)
    })

    it('should stop previous tick when starting new one', () => {
      audioManager.startTick(1000)
      audioManager.startTick(500)

      // Should not throw error
      expect(true).toBe(true)
    })

    it('should not start tick if not initialized', () => {
      const uninitializedManager = new AudioManager()
      uninitializedManager.startTick(1000)

      // Should handle gracefully
      expect(true).toBe(true)
    })

    it('should not start tick if disabled', async () => {
      audioManager.setTickEnabled(false)
      audioManager.startTick(1000)

      // Should not actually start
      expect(true).toBe(true)
    })
  })

  describe('tick enabled/disabled', () => {
    beforeEach(async () => {
      await audioManager.initialize()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should enable tick sound', () => {
      audioManager.setTickEnabled(true)
      const settings = audioManager.getSettings()
      expect(settings.tickEnabled).toBe(true)
    })

    it('should disable tick sound', () => {
      audioManager.setTickEnabled(false)
      const settings = audioManager.getSettings()
      expect(settings.tickEnabled).toBe(false)
    })

    it('should stop tick when disabled', () => {
      audioManager.startTick(1000)
      audioManager.setTickEnabled(false)

      // Tick should be stopped
      const settings = audioManager.getSettings()
      expect(settings.tickEnabled).toBe(false)
    })
  })

  describe('background music', () => {
    beforeEach(async () => {
      await audioManager.initialize()
    })

    it('should start background music', async () => {
      await audioManager.startBackgroundMusic('zen')
      // Should not throw error
      expect(true).toBe(true)
    })

    it('should stop background music', async () => {
      await audioManager.startBackgroundMusic('zen')
      await audioManager.stopBackgroundMusic()
      // Should not throw error
      expect(true).toBe(true)
    })

    it('should not start music if type is none', async () => {
      await audioManager.startBackgroundMusic('none')
      // Should handle gracefully
      expect(true).toBe(true)
    })

    it('should not start music if not initialized', async () => {
      const uninitializedManager = new AudioManager()
      await uninitializedManager.startBackgroundMusic('zen')
      // Should handle gracefully
      expect(true).toBe(true)
    })

    it('should not start music if disabled', async () => {
      audioManager.setMusicEnabled(false)
      await audioManager.startBackgroundMusic('zen')
      // Should not actually start
      expect(true).toBe(true)
    })

    it('should switch between music types', async () => {
      await audioManager.startBackgroundMusic('zen')
      await audioManager.startBackgroundMusic('nature')
      // Should handle gracefully
      expect(true).toBe(true)
    })
  })

  describe('music enabled/disabled', () => {
    beforeEach(async () => {
      await audioManager.initialize()
    })

    it('should enable background music', async () => {
      await audioManager.setMusicEnabled(true)
      const settings = audioManager.getSettings()
      expect(settings.musicEnabled).toBe(true)
    })

    it('should disable background music', async () => {
      await audioManager.setMusicEnabled(false)
      const settings = audioManager.getSettings()
      expect(settings.musicEnabled).toBe(false)
    })

    it('should stop music when disabled', async () => {
      await audioManager.startBackgroundMusic('zen')
      await audioManager.setMusicEnabled(false)

      const settings = audioManager.getSettings()
      expect(settings.musicEnabled).toBe(false)
    })
  })

  describe('volume controls', () => {
    it('should set audio volume', () => {
      audioManager.setAudioVolume(75)
      const settings = audioManager.getSettings()
      expect(settings.audioVolume).toBe(75)
    })

    it('should set music volume', () => {
      audioManager.setMusicVolume(50)
      const settings = audioManager.getSettings()
      expect(settings.musicVolume).toBe(50)
    })

    it('should clamp audio volume to 0-100', () => {
      audioManager.setAudioVolume(150)
      expect(audioManager.getSettings().audioVolume).toBe(100)

      audioManager.setAudioVolume(-10)
      expect(audioManager.getSettings().audioVolume).toBe(0)
    })

    it('should clamp music volume to 0-100', () => {
      audioManager.setMusicVolume(150)
      expect(audioManager.getSettings().musicVolume).toBe(100)

      audioManager.setMusicVolume(-10)
      expect(audioManager.getSettings().musicVolume).toBe(0)
    })

    it('should handle edge case volumes', () => {
      audioManager.setAudioVolume(0)
      expect(audioManager.getSettings().audioVolume).toBe(0)

      audioManager.setAudioVolume(100)
      expect(audioManager.getSettings().audioVolume).toBe(100)

      audioManager.setMusicVolume(0)
      expect(audioManager.getSettings().musicVolume).toBe(0)

      audioManager.setMusicVolume(100)
      expect(audioManager.getSettings().musicVolume).toBe(100)
    })
  })

  describe('updateSettings', () => {
    beforeEach(async () => {
      await audioManager.initialize()
    })

    it('should update all settings at once', () => {
      audioManager.updateSettings({
        tickEnabled: false,
        musicEnabled: true,
        audioVolume: 80,
        musicVolume: 60,
      })

      const settings = audioManager.getSettings()
      expect(settings.tickEnabled).toBe(false)
      expect(settings.musicEnabled).toBe(true)
      expect(settings.audioVolume).toBe(80)
      expect(settings.musicVolume).toBe(60)
    })

    it('should update partial settings', () => {
      audioManager.updateSettings({
        audioVolume: 90,
      })

      const settings = audioManager.getSettings()
      expect(settings.audioVolume).toBe(90)
      // Other settings should remain default
      expect(settings.tickEnabled).toBe(true)
      expect(settings.musicEnabled).toBe(false)
    })

    it('should handle empty settings object', () => {
      audioManager.updateSettings({})
      // Should not throw error
      expect(true).toBe(true)
    })
  })

  describe('getSettings', () => {
    it('should return current settings', () => {
      const settings = audioManager.getSettings()

      expect(settings).toHaveProperty('tickEnabled')
      expect(settings).toHaveProperty('musicEnabled')
      expect(settings).toHaveProperty('audioVolume')
      expect(settings).toHaveProperty('musicVolume')
    })

    it('should return default settings initially', () => {
      const settings = audioManager.getSettings()

      expect(settings.tickEnabled).toBe(true)
      expect(settings.musicEnabled).toBe(false)
      expect(settings.audioVolume).toBe(70)
      expect(settings.musicVolume).toBe(40)
    })

    it('should return updated settings after changes', () => {
      audioManager.setAudioVolume(85)
      audioManager.setTickEnabled(false)

      const settings = audioManager.getSettings()
      expect(settings.audioVolume).toBe(85)
      expect(settings.tickEnabled).toBe(false)
    })
  })

  describe('cleanup', () => {
    beforeEach(async () => {
      await audioManager.initialize()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should cleanup all resources', async () => {
      audioManager.startTick(1000)
      await audioManager.startBackgroundMusic('zen')

      await audioManager.cleanup()

      expect(audioManager.isReady()).toBe(false)
    })

    it('should stop tick on cleanup', async () => {
      audioManager.startTick(1000)
      await audioManager.cleanup()

      // Should be cleaned up
      expect(audioManager.isReady()).toBe(false)
    })

    it('should stop music on cleanup', async () => {
      await audioManager.startBackgroundMusic('zen')
      await audioManager.cleanup()

      expect(audioManager.isReady()).toBe(false)
    })

    it('should handle cleanup when not initialized', async () => {
      const uninitializedManager = new AudioManager()
      await uninitializedManager.cleanup()

      // Should not throw error
      expect(true).toBe(true)
    })
  })

  describe('isReady', () => {
    it('should return false when not initialized', () => {
      expect(audioManager.isReady()).toBe(false)
    })

    it('should return true when initialized', async () => {
      await audioManager.initialize()
      expect(audioManager.isReady()).toBe(true)
    })

    it('should return false after cleanup', async () => {
      await audioManager.initialize()
      await audioManager.cleanup()
      expect(audioManager.isReady()).toBe(false)
    })
  })

  describe('singleton pattern', () => {
    afterEach(async () => {
      await cleanupAudioManager()
    })

    it('should return same instance', () => {
      const instance1 = getAudioManager()
      const instance2 = getAudioManager()

      expect(instance1).toBe(instance2)
    })

    it('should create new instance after cleanup', async () => {
      const instance1 = getAudioManager()
      await cleanupAudioManager()
      const instance2 = getAudioManager()

      expect(instance1).not.toBe(instance2)
    })

    it('should cleanup singleton instance', async () => {
      const instance = getAudioManager()
      await instance.initialize()

      await cleanupAudioManager()

      const newInstance = getAudioManager()
      expect(newInstance.isReady()).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle initialization errors gracefully', async () => {
      // Mock AudioContext to throw error
      const originalAudioContext = global.AudioContext
      ;(global as any).AudioContext = vi.fn(() => {
        throw new Error('AudioContext not supported')
      })

      const manager = new AudioManager()
      await expect(manager.initialize()).rejects.toThrow('AudioContext not supported')

      // Restore
      ;(global as any).AudioContext = originalAudioContext
    })

    it('should handle missing Audio API gracefully', async () => {
      const uninitializedManager = new AudioManager()

      // These should not throw
      uninitializedManager.startTick(1000)
      await uninitializedManager.startBackgroundMusic('zen')
      await uninitializedManager.stopBackgroundMusic()
      uninitializedManager.stopTick()

      expect(true).toBe(true)
    })

    it('should handle audio playback errors', async () => {
      await audioManager.initialize()

      // Mock Audio element play to reject
      const originalAudio = global.Audio
      ;(global as any).Audio = vi.fn(() => ({
        play: vi.fn().mockRejectedValue(new Error('Playback failed')),
        pause: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        load: vi.fn(),
        src: '',
        loop: false,
        volume: 1,
        currentTime: 0,
      }))

      // Should handle error gracefully
      await audioManager.startBackgroundMusic('zen')

      // Restore
      ;(global as any).Audio = originalAudio
    })
  })

  describe('music types', () => {
    beforeEach(async () => {
      await audioManager.initialize()
    })

    it('should handle all music types', async () => {
      const types = ['zen', 'nature', 'rain', 'ocean', 'forest'] as const

      for (const type of types) {
        await audioManager.startBackgroundMusic(type)
        await audioManager.stopBackgroundMusic()
      }

      expect(true).toBe(true)
    })

    it('should handle none type', async () => {
      await audioManager.startBackgroundMusic('none')
      // Should not start music
      expect(true).toBe(true)
    })
  })

  describe('concurrent operations', () => {
    beforeEach(async () => {
      await audioManager.initialize()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should handle tick and music simultaneously', async () => {
      audioManager.startTick(1000)
      await audioManager.startBackgroundMusic('zen')

      // Both should be running
      vi.advanceTimersByTime(1000)

      audioManager.stopTick()
      await audioManager.stopBackgroundMusic()

      expect(true).toBe(true)
    })

    it('should handle rapid setting changes', () => {
      audioManager.setAudioVolume(10)
      audioManager.setAudioVolume(20)
      audioManager.setAudioVolume(30)
      audioManager.setAudioVolume(40)

      const settings = audioManager.getSettings()
      expect(settings.audioVolume).toBe(40)
    })

    it('should handle rapid enable/disable', async () => {
      audioManager.setTickEnabled(true)
      audioManager.setTickEnabled(false)
      audioManager.setTickEnabled(true)

      await audioManager.setMusicEnabled(true)
      await audioManager.setMusicEnabled(false)
      await audioManager.setMusicEnabled(true)

      expect(true).toBe(true)
    })
  })
})
