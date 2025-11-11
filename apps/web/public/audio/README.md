# Audio Assets

This directory contains audio files for the Personal Breath Coach application.

## Directory Structure

```
audio/
├── music/          # Background music files
│   ├── zen-garden.mp3
│   ├── nature-sounds.mp3
│   ├── rain.mp3
│   ├── ocean-waves.mp3
│   └── forest.mp3
└── README.md       # This file
```

## Audio Files Needed

### Background Music (apps/web/public/audio/music/)

1. **zen-garden.mp3**
   - Type: Zen/meditation music with bells
   - Duration: 10+ minutes
   - Loop-friendly: Yes
   - Volume: Normalized

2. **nature-sounds.mp3**
   - Type: Birds chirping, gentle wind
   - Duration: 10+ minutes
   - Loop-friendly: Yes
   - Volume: Normalized

3. **rain.mp3**
   - Type: Soft rainfall with distant thunder
   - Duration: 10+ minutes
   - Loop-friendly: Yes
   - Volume: Normalized

4. **ocean-waves.mp3**
   - Type: Calming ocean waves on shore
   - Duration: 10+ minutes
   - Loop-friendly: Yes
   - Volume: Normalized

5. **forest.mp3**
   - Type: Forest ambience with wildlife
   - Duration: 10+ minutes
   - Loop-friendly: Yes
   - Volume: Normalized

## Audio Requirements

- **Format**: MP3 (widely supported, good compression)
- **Bitrate**: 128-192 kbps (balance between quality and file size)
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo
- **Normalization**: -3 dB peak to prevent clipping
- **Seamless Loop**: Files should fade in/out or be edited for seamless looping

## Free Royalty-Free Audio Sources

### Recommended Sources

1. **Freesound.org**
   - URL: https://freesound.org/
   - License: Various (CC0, CC-BY, etc.)
   - Quality: High
   - Note: Check individual license requirements

2. **Pixabay Audio**
   - URL: https://pixabay.com/music/
   - License: Pixabay License (Free for commercial use)
   - Quality: High
   - Note: No attribution required

3. **YouTube Audio Library**
   - URL: https://www.youtube.com/audiolibrary
   - License: Varies (check per track)
   - Quality: High
   - Note: Free for commercial use, some require attribution

4. **Free Music Archive**
   - URL: https://freemusicarchive.org/
   - License: Various Creative Commons
   - Quality: High
   - Note: Check license per track

5. **BBC Sound Effects**
   - URL: https://sound-effects.bbcrewind.co.uk/
   - License: RemArc License (Free for personal/educational)
   - Quality: Very High
   - Note: Professional quality recordings

### Search Terms

For best results, search for:
- Zen: "meditation bells", "zen garden", "tibetan bowls", "mindfulness"
- Nature: "birds chirping", "forest ambience", "nature sounds"
- Rain: "rain ambience", "gentle rain", "rainfall"
- Ocean: "ocean waves", "beach waves", "sea sounds"
- Forest: "forest ambience", "woodland sounds", "nature forest"

## Audio Processing

If you need to process audio files:

### Using Audacity (Free, Open Source)

1. **Normalize Audio**
   - Effect → Normalize → Set to -3 dB

2. **Create Seamless Loop**
   - Select beginning and end
   - Effect → Fade In / Fade Out
   - Or use Effect → Crossfade Tracks

3. **Export as MP3**
   - File → Export → Export as MP3
   - Quality: 192 kbps (High Quality)

### Using FFmpeg (Command Line)

```bash
# Normalize audio
ffmpeg -i input.wav -af "loudnorm" output.mp3

# Convert and compress
ffmpeg -i input.wav -b:a 192k output.mp3

# Fade in/out for looping
ffmpeg -i input.mp3 -af "afade=t=in:st=0:d=3,afade=t=out:st=597:d=3" output.mp3
```

## Tick Sound

The tick sound is **generated programmatically** using the Web Audio API OscillatorNode.
No audio file is needed for the tick sound - it's created on-the-fly as an 800Hz sine wave.

## Testing Audio

After adding audio files:

1. Start the dev server: `pnpm dev:web`
2. Navigate to an exercise page
3. Enable background music in settings
4. Select a music type
5. Start an exercise
6. Verify:
   - Music plays and loops seamlessly
   - Volume controls work
   - Music stops when exercise ends
   - Tick sound plays every second (when enabled)

## File Size Considerations

- **Target size per file**: 5-15 MB
- **Total audio assets**: ~50-75 MB (acceptable for modern web)
- **Optimization**: Use 128 kbps for longer files to reduce size
- **Lazy loading**: Audio files are loaded on-demand, not on page load

## License Attribution

If using audio that requires attribution:

1. Create `AUDIO_LICENSES.md` in this directory
2. List each file with its source, author, and license
3. Display attribution in app's About/Credits section if required

Example format:
```
## zen-garden.mp3
- Author: John Doe
- Source: Freesound.org
- License: CC-BY 4.0
- URL: https://freesound.org/...

## nature-sounds.mp3
- Author: Jane Smith
- Source: Pixabay
- License: Pixabay License
- URL: https://pixabay.com/...
```

## Placeholder Audio

For development without actual audio files, the app will:
- Still initialize the audio system
- Play the tick sound (generated, no file needed)
- Show a console warning if background music files are missing
- Continue to function normally

## Production Checklist

Before deploying to production:

- [ ] All 5 background music files present
- [ ] Files are properly normalized (-3 dB)
- [ ] Files loop seamlessly
- [ ] File sizes are optimized
- [ ] Licenses are documented
- [ ] Attribution is displayed (if required)
- [ ] Audio tested on multiple browsers
- [ ] Audio tested on mobile devices
- [ ] Loading states handled gracefully
- [ ] Error states handled (missing files, playback failures)
