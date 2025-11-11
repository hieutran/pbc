-- Personal Breath Coach Database Schema
-- Migration: 0002_add_language_to_settings
-- Adds language column to user_settings table

ALTER TABLE user_settings ADD COLUMN language TEXT CHECK(language IN ('en', 'vi', 'es', 'fr', 'de', 'ja', 'zh')) DEFAULT 'en';
