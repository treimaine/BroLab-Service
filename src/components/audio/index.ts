/**
 * Audio Components
 * 
 * Components for audio playback and player UI.
 * These components handle the audio player bar and related controls
 * for tenant storefronts.
 * 
 * Architecture:
 * - EnhancedGlobalAudioPlayer: Headless audio engine (mount once in app root)
 * - PlayerBar: UI component (connects to global store via useAudioStore)
 */

export { EnhancedGlobalAudioPlayer } from './EnhancedGlobalAudioPlayer';
export { PlayerBar, type PlayerBarProps } from './PlayerBar';

