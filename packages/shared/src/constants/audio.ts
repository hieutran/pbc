import type { BackgroundMusicType } from '../types/user'

export const BACKGROUND_MUSIC_TYPES: BackgroundMusicType[] = [
  'zen',
  'nature',
  'rain',
  'ocean',
  'forest',
  'none',
]

export const BACKGROUND_MUSIC_INFO: Record<
  BackgroundMusicType,
  { name: string; description: string; duration?: number }
> = {
  zen: {
    name: 'Zen Garden',
    description: 'Peaceful meditation bells and ambient sounds',
    duration: 600, // 10 minutes
  },
  nature: {
    name: 'Nature Sounds',
    description: 'Birds chirping and gentle wind',
    duration: 600,
  },
  rain: {
    name: 'Rain',
    description: 'Soft rainfall and distant thunder',
    duration: 600,
  },
  ocean: {
    name: 'Ocean Waves',
    description: 'Calming ocean waves on the shore',
    duration: 600,
  },
  forest: {
    name: 'Forest',
    description: 'Forest ambience with wildlife',
    duration: 600,
  },
  none: {
    name: 'No Music',
    description: 'Silence',
  },
}

export const DEFAULT_AUDIO_SETTINGS = {
  soundEnabled: true,
  tickSoundEnabled: true,
  backgroundMusicEnabled: false,
  backgroundMusicType: 'zen' as BackgroundMusicType,
  audioVolume: 70,
  musicVolume: 40,
}

export const AUDIO_VOLUME = {
  MIN: 0,
  MAX: 100,
  DEFAULT: 70,
  STEP: 5,
}

export const MUSIC_VOLUME = {
  MIN: 0,
  MAX: 100,
  DEFAULT: 40,
  STEP: 5,
}
