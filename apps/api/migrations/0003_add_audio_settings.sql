-- Migration: Add audio settings to user_settings table
-- Created: 2025-11-11
-- Description: Adds columns for audio control including tick sounds, background music, and volume controls

-- Add tick sound toggle
ALTER TABLE user_settings ADD COLUMN tick_sound_enabled INTEGER DEFAULT 1 CHECK(tick_sound_enabled IN (0, 1));

-- Add background music toggle
ALTER TABLE user_settings ADD COLUMN background_music_enabled INTEGER DEFAULT 0 CHECK(background_music_enabled IN (0, 1));

-- Add background music type
ALTER TABLE user_settings ADD COLUMN background_music_type TEXT
  CHECK(background_music_type IN ('zen', 'nature', 'rain', 'ocean', 'forest', 'none'))
  DEFAULT 'zen';

-- Add audio volume (0-100)
ALTER TABLE user_settings ADD COLUMN audio_volume INTEGER DEFAULT 70
  CHECK(audio_volume >= 0 AND audio_volume <= 100);

-- Add music volume (0-100)
ALTER TABLE user_settings ADD COLUMN music_volume INTEGER DEFAULT 40
  CHECK(music_volume >= 0 AND music_volume <= 100);
