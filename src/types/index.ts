export type AppView =
  | 'home'
  | 'dashboard'
  | 'editor'
  | 'music_studio'
  | 'music_video_studio'
  | 'video_generator'
  | 'image_studio'
  | 'voice_studio'
  | 'templates'
  | 'media_library'
  | 'my_projects'
  | 'models'
  | 'pricing'
  | 'settings'
  | 'admin';

export interface KIEModel {
  id: string;
  name: string;
  category: 'music' | 'video' | 'image' | 'voice' | 'music_video';
  provider: string;
  description: string;
  active: boolean;
  costCredits: number;
  speed: 'fast' | 'balanced' | 'high_quality';
  capabilities: string[];
  supportedAspectRatios?: string[];
  maxDurationSec?: number;
  supportedFormats?: string[];
  requiredParams: string[];
  optionalParams: string[];
}

export interface TaskRecord {
  id: string;
  userId: string;
  modelId: string;
  category: 'music' | 'video' | 'image' | 'voice' | 'music_video';
  prompt: string;
  params: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrls: string[];
  metadata?: Record<string, any>;
  costCredits: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'recording';
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  resolution?: string;
  sizeBytes: number;
  createdAt: string;
  tags: string[];
  source: 'upload' | 'ai_generated' | 'stock';
}

export interface TimelineClip {
  id: string;
  title: string;
  src?: string;
  type: 'video' | 'image' | 'audio' | 'text';
  start: number; // seconds on timeline
  duration: number; // clip duration in seconds

  // Video / image transform properties
  scale?: number; // 10 to 300, default 100
  rotation?: number; // -180 to 180, default 0
  positionX?: number; // -100 to 100, default 0
  positionY?: number; // -100 to 100, default 0
  opacity?: number; // 0 to 100, default 100
  blendMode?: 'normal' | 'screen' | 'multiply' | 'overlay';
  flipH?: boolean;
  flipV?: boolean;

  // Basic Color adjustments
  brightness?: number; // 0 - 200 default 100
  contrast?: number; // 0 - 200 default 100
  saturation?: number; // 0 - 200 default 100
  blur?: number; // 0 - 20 default 0
  hueRotate?: number; // 0 - 360 default 0

  // Advanced Color Grading
  temperature?: number; // -100 to 100, default 0
  tint?: number; // -100 to 100, default 0
  exposure?: number; // -100 to 100, default 0
  highlights?: number; // -100 to 100, default 0
  shadows?: number; // -100 to 100, default 0
  vignette?: number; // 0 to 100, default 0
  lut?: 'none' | 'teal_orange' | 'hollywood_noir' | 'vintage_70s' | 'cyberpunk' | 'bleach_bypass';

  // Video Effects
  effect?: 'none' | 'vhs' | 'glitch' | 'film_grain' | 'glow' | 'rgb_split' | 'light_leaks' | 'camera_shake' | 'neon';
  effectIntensity?: number; // 0 - 100, default 50
  transition?: 'none' | 'fade' | 'dissolve' | 'zoom' | 'slide' | 'wipe' | 'glitch';
  transitionDuration?: number;

  // Speed & Retime
  speed?: number; // 0.25 to 4

  // Smart AI Tools
  chromaKey?: boolean;
  chromaColor?: string;
  chromaTolerance?: number;
  autoReframe?: boolean;

  // Audio properties
  volume?: number; // 0 - 2 default 1
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
  audioSpeed?: number;
  equalizer?: 'none' | 'bass_boost' | 'vocal_enhance' | 'lofi';

  // Text / Caption properties
  text?: string;
  fontSize?: number;
  color?: string;
  bgColor?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textEffect?: 'none' | 'neon' | 'gradient' | '3d';
  animation?: 'none' | 'fade' | 'typewriter' | 'slide_up' | 'pop' | 'kinetic_zoom' | 'bounce';
  activeWordIndex?: number;

  // Keyframes
  keyframes?: { time: number; scale?: number; opacity?: number; x?: number; y?: number }[];
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'image' | 'text' | 'audio' | 'voice';
  muted: boolean;
  locked?: boolean;
  hidden?: boolean;
  volume: number;
  clips: TimelineClip[];
}

export interface TimelineMarker {
  id: string;
  time: number;
  label: string;
  color?: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  aspectRatio: string;
  fps: number;
  durationSec: number;
  tracks: TimelineTrack[];
  markers?: TimelineMarker[];
  thumbnailUrl: string;
  updatedAt: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'admin' | 'creator' | 'user';
  credits: number;
  plan: 'free' | 'pro' | 'business';
  storageUsedMb: number;
  storageLimitMb: number;
  voiceConsentApproved: boolean;
}

export interface TemplateItem {
  id: string;
  name: string;
  category: 'tiktok_reels' | 'youtube_intro' | 'music_video' | 'business_ad' | 'cinematic' | 'gospel';
  description: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  durationSec: number;
  previewUrl: string;
  thumbnailUrl: string;
  tracks: TimelineTrack[];
}
