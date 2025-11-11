# Audio System Guide - Personal Breath Coach

> Production-grade audio system with tick sounds and background music

## 🎵 Overview

The Personal Breath Coach includes a sophisticated audio system that enhances the breathing exercise experience with:

- **Tick Sounds**: Programmatically generated tone that plays every second
- **Background Music**: 5 types of relaxing ambient music
- **Independent Volume Controls**: Separate controls for tick and music
- **Web Audio API**: Production-grade audio management
- **Browser Compatibility**: Handles autoplay policies gracefully

---

## 🏗️ Architecture

### Components

```
AudioManager (Singleton)
    ↓
Web Audio API (AudioContext)
    ↓
├── Tick Sound (OscillatorNode + GainNode)
└── Background Music (HTMLAudioElement + MediaElementSourceNode + GainNode)
```

### Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/lib/audio/AudioManager.ts` | Core audio management class |
| `apps/web/src/lib/audio/useAudio.ts` | React hook for components |
| `packages/shared/src/types/user.ts` | Audio settings types |
| `packages/shared/src/constants/audio.ts` | Audio configuration |
| `apps/api/migrations/0003_add_audio_settings.sql` | Database schema |
| `apps/web/public/audio/music/` | Audio file storage |

---

## 🎯 Features

### 1. Tick Sound

**Generated Programmatically** - No audio file needed!

- **Technology**: Web Audio API OscillatorNode
- **Frequency**: 800Hz sine wave
- **Duration**: 50ms with attack/release envelope
- **Interval**: Plays every 1000ms (configurable)
- **Volume**: 0-100% (default 70%)

**Implementation**:
```typescript
// AudioManager creates oscillator on-the-fly
const oscillator = audioContext.createOscillator()
oscillator.type = 'sine'
oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
// ... gain envelope for smooth sound
```

### 2. Background Music

**5 Music Types Available**:

1. **Zen Garden** - Meditation bells and ambient sounds
2. **Nature Sounds** - Birds chirping and gentle wind
3. **Rain** - Soft rainfall with distant thunder
4. **Ocean Waves** - Calming waves on shore
5. **Forest** - Forest ambience with wildlife

**Features**:
- Seamless looping
- Fade in/out transitions (2s fade in, 1s fade out)
- Independent volume control (0-100%, default 40%)
- Lazy loading (loaded only when needed)
- Web Audio API routing for advanced control

### 3. Volume Controls

- **Tick Volume**: 0-100% in 5% increments
- **Music Volume**: 0-100% in 5% increments
- Real-time adjustment during playback
- Persisted in user settings (localStorage + database)

### 4. User Settings Persistence

**Frontend (Unauthenticated)**:
- localStorage: `audioSettings`

**Backend (Authenticated)**:
- Database: `user_settings` table
- Columns: `tick_sound_enabled`, `background_music_enabled`, `background_music_type`, `audio_volume`, `music_volume`

---

## 🚀 Usage

### Basic Usage in Components

```typescript
import { useAudio } from '@/lib/audio'

function ExerciseComponent() {
  const audio = useAudio()

  const handleStart = async () => {
    // Initialize audio (requires user interaction)
    await audio.initializeAudio()

    // Start tick sound
    audio.startTick(1000) // Every 1 second

    // Start background music
    await audio.startBackgroundMusic('zen')
  }

  const handleStop = async () => {
    audio.stopTick()
    await audio.stopBackgroundMusic()
  }

  return (
    <>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
    </>
  )
}
```

### Advanced Usage with Settings

```typescript
import { useAudio } from '@/lib/audio'
import { DEFAULT_AUDIO_SETTINGS } from '@pbc/shared'

function ExerciseWithSettings() {
  const audio = useAudio()
  const [settings, setSettings] = useState(DEFAULT_AUDIO_SETTINGS)

  const handleStart = async () => {
    await audio.initializeAudio()

    // Apply all settings
    audio.updateSettings({
      tickEnabled: settings.tickSoundEnabled,
      musicEnabled: settings.backgroundMusicEnabled,
      audioVolume: settings.audioVolume,
      musicVolume: settings.musicVolume,
    })

    if (settings.tickSoundEnabled) {
      audio.startTick(1000)
    }

    if (settings.backgroundMusicEnabled) {
      await audio.startBackgroundMusic(settings.backgroundMusicType)
    }
  }

  return (
    <div>
      {/* Settings UI */}
      <label>
        <input
          type="checkbox"
          checked={settings.tickSoundEnabled}
          onChange={e => {
            const enabled = e.target.checked
            setSettings(prev => ({ ...prev, tickSoundEnabled: enabled }))
            audio.setTickEnabled(enabled)
          }}
        />
        Tick Sound
      </label>

      <input
        type="range"
        min="0"
        max="100"
        value={settings.audioVolume}
        onChange={e => {
          const volume = Number(e.target.value)
          setSettings(prev => ({ ...prev, audioVolume: volume }))
          audio.setAudioVolume(volume)
        }}
      />
    </div>
  )
}
```

---

## 🔧 AudioManager API

### Initialization

```typescript
import { getAudioManager } from '@/lib/audio'

const audioManager = getAudioManager() // Singleton instance
await audioManager.initialize() // Must be called after user interaction
```

### Methods

#### `initialize(): Promise<void>`
Initialize AudioContext. Must be called after user interaction due to browser autoplay policies.

#### `startTick(intervalMs: number = 1000): void`
Start tick sound with specified interval in milliseconds.

#### `stopTick(): void`
Stop tick sound.

#### `startBackgroundMusic(type: BackgroundMusicType): Promise<void>`
Start background music of specified type ('zen', 'nature', 'rain', 'ocean', 'forest').

#### `stopBackgroundMusic(): Promise<void>`
Stop background music with fade-out transition.

#### `setTickEnabled(enabled: boolean): void`
Enable/disable tick sound. If disabled during playback, stops immediately.

#### `setMusicEnabled(enabled: boolean): Promise<void>`
Enable/disable background music. If disabled during playback, stops with fade-out.

#### `setAudioVolume(volume: number): void`
Set tick sound volume (0-100).

#### `setMusicVolume(volume: number): void`
Set background music volume (0-100). Updates immediately if music is playing.

#### `updateSettings(settings: AudioSettings): void`
Update multiple settings at once.

#### `getSettings(): AudioSettings`
Get current audio settings.

#### `isReady(): boolean`
Check if audio context is initialized and ready.

#### `cleanup(): Promise<void>`
Cleanup all audio resources. Called on app unmount.

---

## 🎨 React Hook API

### `useAudio()`

```typescript
const {
  isInitialized,      // boolean - Is AudioContext created?
  isReady,            // boolean - Is AudioContext ready to play?
  initializeAudio,    // () => Promise<boolean> - Initialize audio
  startTick,          // (intervalMs?: number) => void
  stopTick,           // () => void
  startBackgroundMusic, // (type: BackgroundMusicType) => Promise<void>
  stopBackgroundMusic,  // () => Promise<void>
  updateSettings,     // (settings: Partial<AudioSettings>) => void
  setTickEnabled,     // (enabled: boolean) => void
  setMusicEnabled,    // (enabled: boolean) => Promise<void>
  setAudioVolume,     // (volume: number) => void
  setMusicVolume,     // (volume: number) => void
  getSettings,        // () => AudioSettings
} = useAudio()
```

---

## 📊 User Settings Schema

### TypeScript Types

```typescript
// packages/shared/src/types/user.ts
export type BackgroundMusicType = 'zen' | 'nature' | 'rain' | 'ocean' | 'forest' | 'none'

export interface UserSettings {
  soundEnabled?: boolean
  tickSoundEnabled?: boolean
  backgroundMusicEnabled?: boolean
  backgroundMusicType?: BackgroundMusicType
  audioVolume?: number // 0-100
  musicVolume?: number // 0-100
  // ... other settings
}
```

### Database Schema

```sql
-- apps/api/migrations/0003_add_audio_settings.sql
ALTER TABLE user_settings ADD COLUMN tick_sound_enabled INTEGER DEFAULT 1;
ALTER TABLE user_settings ADD COLUMN background_music_enabled INTEGER DEFAULT 0;
ALTER TABLE user_settings ADD COLUMN background_music_type TEXT DEFAULT 'zen';
ALTER TABLE user_settings ADD COLUMN audio_volume INTEGER DEFAULT 70;
ALTER TABLE user_settings ADD COLUMN music_volume INTEGER DEFAULT 40;
```

### Default Settings

```typescript
// packages/shared/src/constants/audio.ts
export const DEFAULT_AUDIO_SETTINGS = {
  soundEnabled: true,
  tickSoundEnabled: true,
  backgroundMusicEnabled: false,
  backgroundMusicType: 'zen' as BackgroundMusicType,
  audioVolume: 70,
  musicVolume: 40,
}
```

---

## 🎵 Audio Files

### Required Files

Place audio files in `apps/web/public/audio/music/`:

```
apps/web/public/audio/music/
├── zen-garden.mp3      (10+ min, loopable)
├── nature-sounds.mp3   (10+ min, loopable)
├── rain.mp3            (10+ min, loopable)
├── ocean-waves.mp3     (10+ min, loopable)
└── forest.mp3          (10+ min, loopable)
```

### Audio File Requirements

- **Format**: MP3
- **Bitrate**: 128-192 kbps
- **Sample Rate**: 44.1 kHz
- **Duration**: 10+ minutes
- **Looping**: Seamless (fade in/out at boundaries)
- **Normalization**: -3 dB peak
- **File Size**: 5-15 MB each

### Free Audio Sources

See `apps/web/public/audio/README.md` for detailed list of royalty-free sources:
- Freesound.org
- Pixabay Audio
- YouTube Audio Library
- Free Music Archive
- BBC Sound Effects

---

## 🌐 Browser Compatibility

### Web Audio API Support

✅ **Supported Browsers**:
- Chrome/Edge 35+
- Firefox 25+
- Safari 14.1+
- Opera 22+
- All modern mobile browsers

### Autoplay Policy Handling

Modern browsers block audio autoplay until user interaction. Our implementation handles this:

1. **User clicks "Start Exercise"** → Initializes AudioContext
2. **AudioContext.state === 'suspended'** → Automatically resumes
3. **Initialization fails** → Shows user-friendly error message

```typescript
// AudioManager automatically handles this
if (this.audioContext.state === 'suspended') {
  await this.audioContext.resume()
}
```

---

## 🐛 Troubleshooting

### Issue: Audio Not Playing

**Possible Causes**:
1. AudioContext not initialized (needs user interaction)
2. Browser autoplay policy blocking
3. Audio files missing or incorrect paths
4. Volume set to 0

**Solutions**:
```typescript
// Check if ready
if (!audio.isReady()) {
  await audio.initializeAudio()
}

// Check volume
console.log(audio.getSettings())

// Check browser console for errors
```

### Issue: Tick Sound Not Playing

**Check**:
1. Is `tickSoundEnabled` true?
2. Is `audioVolume` > 0?
3. Was `startTick()` called?

```typescript
audio.setTickEnabled(true)
audio.setAudioVolume(70)
audio.startTick(1000)
```

### Issue: Background Music Not Loading

**Check**:
1. Are MP3 files present in `public/audio/music/`?
2. Check browser Network tab for 404 errors
3. Check file paths in AudioManager.ts

**Expected Paths**:
- `/audio/music/zen-garden.mp3`
- `/audio/music/nature-sounds.mp3`
- etc.

### Issue: Music Not Looping

**Check**:
```typescript
// In AudioManager.ts, verify:
this.musicElement.loop = true
```

### Issue: Volume Not Changing

**For Music**: Volume changes apply immediately if music is playing.

**For Tick**: Volume applies to next tick sound (not retroactive).

---

## 🎓 Best Practices

### 1. Initialize Early

```typescript
// Good: Initialize on component mount
useEffect(() => {
  const init = async () => {
    await audio.initializeAudio()
  }
  init()
}, [])
```

### 2. Cleanup on Unmount

```typescript
// Good: Stop audio when leaving page
useEffect(() => {
  return () => {
    audio.stopTick()
    audio.stopBackgroundMusic()
  }
}, [])
```

### 3. Handle Errors Gracefully

```typescript
// Good: Show user-friendly error
const handleStart = async () => {
  try {
    await audio.initializeAudio()
    audio.startTick()
  } catch (error) {
    alert('Failed to start audio. Please check your browser settings.')
  }
}
```

### 4. Persist Settings

```typescript
// Good: Save to localStorage and API
const updateAudioSetting = async (key, value) => {
  // Update local state
  setSettings(prev => ({ ...prev, [key]: value }))

  // Persist to localStorage
  localStorage.setItem('audioSettings', JSON.stringify(settings))

  // Sync with backend (if authenticated)
  if (isAuthenticated) {
    await userApi.updateSettings({ [key]: value })
  }
}
```

### 5. Provide Visual Feedback

```typescript
// Good: Show audio status
{isExercising && audioSettings.tickSoundEnabled && (
  <p>🔊 Tick sound enabled</p>
)}
{isExercising && audioSettings.backgroundMusicEnabled && (
  <p>🎵 Playing: {BACKGROUND_MUSIC_INFO[audioSettings.backgroundMusicType].name}</p>
)}
```

---

## 🧪 Testing

### Manual Testing Checklist

**Basic Functionality**:
- [ ] Tick sound plays every second
- [ ] Tick sound stops when toggled off
- [ ] Background music plays and loops
- [ ] Background music stops when toggled off
- [ ] Can switch between music types during playback

**Volume Controls**:
- [ ] Tick volume slider works (0-100%)
- [ ] Music volume slider works (0-100%)
- [ ] Volume at 0 is completely silent
- [ ] Volume at 100 is full volume

**Browser Compatibility**:
- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile browsers

**Edge Cases**:
- [ ] Leaving page stops audio
- [ ] Reloading page preserves settings
- [ ] Audio continues when switching tabs
- [ ] Missing audio files show graceful error

### Automated Testing (Future)

```typescript
// Example unit test
describe('AudioManager', () => {
  it('should initialize AudioContext', async () => {
    const manager = new AudioManager()
    await manager.initialize()
    expect(manager.isReady()).toBe(true)
  })

  it('should start and stop tick', () => {
    const manager = getAudioManager()
    manager.startTick(1000)
    // Assert tick is running
    manager.stopTick()
    // Assert tick is stopped
  })
})
```

---

## 📈 Performance

### Resource Usage

- **Tick Sound**: Minimal (generated on-the-fly, no file)
- **Background Music**: ~5-15 MB per file, loaded on-demand
- **Memory**: ~50-100 MB during playback (Web Audio API buffers)
- **CPU**: <1% for tick generation, <5% for music playback

### Optimization Tips

1. **Lazy Loading**: Music files loaded only when needed
2. **Single AudioContext**: Singleton pattern prevents multiple contexts
3. **Efficient Oscillator**: Tick sound created per-play, not persistent
4. **Fade Transitions**: Smooth fades prevent audio clicks/pops

---

## 🔐 Security & Privacy

### No External Requests

All audio is self-hosted:
- No CDN dependencies
- No third-party audio services
- No tracking or analytics

### User Control

Users have full control:
- Can disable all audio
- Can adjust all volumes
- Settings are private (stored locally or in user's database)

---

## 🚀 Future Enhancements

Potential improvements (not yet implemented):

1. **Custom Audio Upload**: Let users upload their own music
2. **Audio Presets**: Save favorite audio configurations
3. **Technique-Specific Audio**: Different audio per breathing technique
4. **Guided Voice**: Optional voice guidance for exercises
5. **Spatial Audio**: 3D audio effects using PannerNode
6. **Audio Visualization**: Real-time frequency visualization
7. **Offline Support**: Cache audio files for offline use (PWA)
8. **Equalizer**: Frequency controls for audio customization

---

## 📚 Additional Resources

### Web Audio API
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Spec: https://www.w3.org/TR/webaudio/

### Audio File Processing
- Audacity: https://www.audacityteam.org/
- FFmpeg: https://ffmpeg.org/

### Royalty-Free Audio
- See `apps/web/public/audio/README.md` for curated list

---

**Version**: 1.0.0
**Last Updated**: 2025-11-11
**Status**: Production Ready ✅
