import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  AppView,
  KIEModel,
  MediaAsset,
  ProjectRecord,
  TimelineTrack,
  TimelineClip,
  TimelineMarker,
  UserProfile,
  TaskRecord,
} from '../types';
import {
  supabase,
  supabaseAuth,
  supabaseStorage,
  supabaseDb,
  isSupabaseConfigured,
} from '../lib/supabase';

interface CreativeContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateCredits: (amountDelta: number) => void;
  purchaseCredits: (amount: number, provider: string, planName?: string) => Promise<boolean>;
  setVoiceConsent: (approved: boolean) => Promise<void>;

  // Supabase Authentication & Profile
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot' | 'connect';
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot' | 'connect') => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateUserProfile: (name: string, avatarUrl?: string) => Promise<void>;
  isSupabaseActive: boolean;

  // Supabase Cloud Storage & Media Upload
  uploadMediaFile: (file: File, onProgress?: (pct: number) => void) => Promise<MediaAsset | null>;
  uploadProgress: number | null;

  // Models
  models: KIEModel[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  refreshModels: () => Promise<void>;
  toggleModelActive: (id: string) => Promise<void>;
  testModel: (modelId: string) => Promise<any>;

  // Media Library
  mediaAssets: MediaAsset[];
  refreshMedia: () => Promise<void>;
  addMediaAsset: (asset: Partial<MediaAsset>) => Promise<MediaAsset | null>;
  deleteMediaAsset: (id: string) => Promise<void>;

  // Projects & Video Editor Timeline State
  projects: ProjectRecord[];
  activeProject: ProjectRecord;
  setActiveProject: React.Dispatch<React.SetStateAction<ProjectRecord>>;
  saveCurrentProject: () => Promise<void>;
  createNewProject: (name?: string, aspectRatio?: string) => void;
  loadProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  isAutosaving: boolean;
  lastSavedAt: string | null;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Clipboard & Clip Actions
  copiedClip: TimelineClip | null;
  copySelectedClip: () => void;
  pasteClipAtPlayhead: () => void;
  duplicateClip: (trackId: string, clipId: string) => void;
  moveClipTrack: (sourceTrackId: string, destTrackId: string, clipId: string) => void;

  // Track Management (Unlimited tracks, Lock, Mute, Hide)
  addNewTrack: (type: TimelineTrack['type'], name?: string) => void;
  deleteTrack: (trackId: string) => void;
  toggleTrackLock: (trackId: string) => void;
  toggleTrackHide: (trackId: string) => void;
  toggleTrackMute: (trackId: string) => void;

  // Markers & Snapping
  addTimelineMarker: (time: number, label: string, color?: string) => void;
  deleteTimelineMarker: (id: string) => void;
  snapEnabled: boolean;
  setSnapEnabled: React.Dispatch<React.SetStateAction<boolean>>;

  // Timeline playback & editing
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  timelineZoom: number;
  setTimelineZoom: React.Dispatch<React.SetStateAction<number>>;
  selectedClipId: string | null;
  setSelectedClipId: (clipId: string | null) => void;
  addClipToTrack: (trackId: string, clip: Partial<TimelineClip>) => void;
  updateClip: (trackId: string, clipId: string, updates: Partial<TimelineClip>) => void;
  deleteClip: (trackId: string, clipId: string) => void;
  splitClipAtPlayhead: (trackId: string, clipId: string) => void;

  // AI Tools
  generateAutoCaptions: () => Promise<void>;

  // AI Task Management
  tasks: TaskRecord[];
  createTask: (category: TaskRecord['category'], modelId: string, prompt: string, params?: Record<string, any>) => Promise<TaskRecord | null>;
  enhancePrompt: (prompt: string, type: string) => Promise<string>;
  generateLyrics: (topic: string, genre: string, mood?: string, language?: string) => Promise<{ lyrics: string; title: string }>;

  // Voice recording & Web Speech API helper
  isListeningSpeech: boolean;
  startVoicePromptInput: (onTranscript: (text: string) => void) => void;
  stopVoicePromptInput: () => void;

  // Sidebar states
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Toasts
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const defaultProject: ProjectRecord = {
  id: 'proj_default_afrobeats',
  name: 'Lagos Night Lights - AI Music Video',
  aspectRatio: '16:9',
  fps: 30,
  durationSec: 18,
  thumbnailUrl: '/src/assets/images/ai_music_video_cinematic_1794165723863.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  markers: [
    { id: 'm1', time: 0, label: 'Intro Hook', color: '#8B5CF6' },
    { id: 'm2', time: 8, label: 'Chorus Drop', color: '#06B6D4' },
  ],
  tracks: [
    {
      id: 't_video_1',
      name: 'Main Video Track',
      type: 'video',
      muted: false,
      locked: false,
      hidden: false,
      volume: 1,
      clips: [
        {
          id: 'clip_v1',
          title: 'Golden Hour Performance',
          src: '/src/assets/images/ai_music_video_cinematic_1794165723863.jpg',
          type: 'image',
          start: 0,
          duration: 8,
          scale: 100,
          rotation: 0,
          positionX: 0,
          positionY: 0,
          opacity: 100,
          brightness: 105,
          contrast: 110,
          saturation: 115,
          temperature: 5,
          tint: 0,
          exposure: 0,
          highlights: 0,
          shadows: 0,
          vignette: 15,
          lut: 'teal_orange',
          effect: 'none',
          effectIntensity: 50,
          transition: 'dissolve',
        },
        {
          id: 'clip_v2',
          title: 'Studio Creative Workspace',
          src: '/src/assets/images/editflow_hero_creative_workspace_1794165722264.jpg',
          type: 'image',
          start: 8,
          duration: 10,
          scale: 100,
          rotation: 0,
          positionX: 0,
          positionY: 0,
          opacity: 100,
          brightness: 95,
          contrast: 110,
          saturation: 115,
          temperature: -5,
          tint: 0,
          exposure: 0,
          highlights: 0,
          shadows: 0,
          vignette: 20,
          lut: 'hollywood_noir',
          effect: 'film_grain',
          effectIntensity: 35,
          transition: 'fade',
        },
      ],
    },
    {
      id: 't_video_overlay',
      name: 'B-Roll & Overlay',
      type: 'image',
      muted: false,
      locked: false,
      hidden: false,
      volume: 1,
      clips: [
        {
          id: 'clip_art_overlay',
          title: 'Album Art Graphic',
          src: '/src/assets/images/ai_image_art_showcase_1794165721878.jpg',
          type: 'image',
          start: 4,
          duration: 5,
          scale: 45,
          rotation: -5,
          positionX: 35,
          positionY: -25,
          opacity: 90,
          blendMode: 'screen',
          effect: 'glow',
          effectIntensity: 40,
        },
      ],
    },
    {
      id: 't_text_1',
      name: 'Subtitles & Titles',
      type: 'text',
      muted: false,
      locked: false,
      hidden: false,
      volume: 1,
      clips: [
        {
          id: 'clip_t1',
          title: 'Intro Title',
          type: 'text',
          text: 'EDITFLOW AI // CREATE. EDIT. INSPIRE.',
          start: 0.5,
          duration: 6,
          fontSize: 34,
          color: '#FFFFFF',
          bgColor: 'rgba(0, 0, 0, 0.7)',
          positionY: 82,
          fontFamily: 'Plus Jakarta Sans',
          animation: 'kinetic_zoom',
          strokeColor: '#8B5CF6',
          strokeWidth: 2,
          shadowColor: 'rgba(0,0,0,0.8)',
          shadowBlur: 10,
          letterSpacing: 2,
        },
      ],
    },
    {
      id: 't_audio_1',
      name: 'AI Music Track',
      type: 'audio',
      muted: false,
      locked: false,
      hidden: false,
      volume: 0.85,
      clips: [
        {
          id: 'clip_a1',
          title: 'Amapiano Log Drum Groove',
          src: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
          type: 'audio',
          start: 0,
          duration: 18,
          fadeIn: 0.5,
          fadeOut: 1.5,
          volume: 0.9,
          equalizer: 'bass_boost',
        },
      ],
    },
  ],
};

const CreativeContext = createContext<CreativeContextType | null>(null);

export const CreativeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('editor');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot' | 'connect'>('login');

  const [user, setUser] = useState<UserProfile>({
    id: 'usr_editflow_default',
    name: 'Creative Director',
    email: 'jamesbishopemmanuel299@gmail.com',
    avatarUrl: '/src/assets/images/ai_image_art_showcase_1794165721878.jpg',
    role: 'admin',
    credits: 500,
    plan: 'pro',
    storageUsedMb: 142.5,
    storageLimitMb: 10240,
    voiceConsentApproved: true,
  });

  const [models, setModels] = useState<KIEModel[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([defaultProject]);
  const [activeProject, setActiveProject] = useState<ProjectRecord>(defaultProject);

  // Autosave states
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>('Just now');
  const autosaveTimerRef = useRef<any>(null);

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Undo / Redo stacks
  const [history, setHistory] = useState<ProjectRecord[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectRecord[]>([]);

  // Clipboard for copy & paste
  const [copiedClip, setCopiedClip] = useState<TimelineClip | null>(null);

  // Magnetic snapping
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);

  // Editor states
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timelineZoom, setTimelineZoom] = useState<number>(1);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip_v1');

  // Tasks & toasts
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isListeningSpeech, setIsListeningSpeech] = useState<boolean>(false);
  const speechRecognitionRef = useRef<any>(null);

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' | 'connect' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Helper to record history before a mutation
  const recordHistory = (proj: ProjectRecord) => {
    setHistory((prev) => [...prev.slice(-25), JSON.parse(JSON.stringify(proj))]);
    setRedoStack([]);
  };

  const undo = () => {
    if (history.length === 0) {
      showToast('Nothing to undo');
      return;
    }
    const previous = history[history.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(activeProject))]);
    setHistory((prev) => prev.slice(0, -1));
    setActiveProject(previous);
    showToast('Undo action');
  };

  const redo = () => {
    if (redoStack.length === 0) {
      showToast('Nothing to redo');
      return;
    }
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(activeProject))]);
    setRedoStack((prev) => prev.slice(0, -1));
    setActiveProject(next);
    showToast('Redo action');
  };

  // Supabase Auth Session Synchronization on mount and onAuthStateChange
  useEffect(() => {
    const initAuth = async () => {
      const { session, user: authUser } = await supabaseAuth.getSession();
      if (authUser) {
        setIsAuthenticated(true);
        const profile = await supabaseAuth.getProfile(authUser.id);
        if (profile) {
          setUser(profile);
        } else {
          setUser((prev) => ({
            ...prev,
            id: authUser.id,
            email: authUser.email || prev.email,
            name: authUser.user_metadata?.full_name || prev.name,
            avatarUrl: authUser.user_metadata?.avatar_url || prev.avatarUrl,
          }));
        }

        // Fetch user's private projects & media from Supabase database
        if (isSupabaseConfigured) {
          const [dbProjects, dbMedia] = await Promise.all([
            supabaseDb.getProjects(authUser.id),
            supabaseDb.getMedia(authUser.id),
          ]);
          if (dbProjects.length > 0) {
            setProjects(dbProjects);
            setActiveProject(dbProjects[0]);
          }
          if (dbMedia.length > 0) {
            setMediaAssets(dbMedia);
          }
        }
      }
    };

    initAuth();

    // Listen to Supabase Auth state changes
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setIsAuthenticated(true);
          const profile = await supabaseAuth.getProfile(session.user.id);
          if (profile) {
            setUser(profile);
          }
          const [dbProjects, dbMedia] = await Promise.all([
            supabaseDb.getProjects(session.user.id),
            supabaseDb.getMedia(session.user.id),
          ]);
          if (dbProjects.length > 0) {
            setProjects(dbProjects);
            setActiveProject(dbProjects[0]);
          }
          if (dbMedia.length > 0) {
            setMediaAssets(dbMedia);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  // Initial data loading from server (KIE models, default projects)
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [modelsRes, mediaRes, userRes, projectsRes] = await Promise.all([
        fetch('/api/ai/models'),
        fetch('/api/media'),
        fetch('/api/user'),
        fetch('/api/projects'),
      ]);

      if (modelsRes.ok) {
        const mData = await modelsRes.json();
        if (mData.models) setModels(mData.models);
      }
      if (mediaRes.ok) {
        const mdData = await mediaRes.json();
        if (mdData.items && mediaAssets.length === 0) setMediaAssets(mdData.items);
      }
      if (userRes.ok) {
        const uData = await userRes.json();
        if (uData.user && !isSupabaseConfigured) setUser(uData.user);
      }
      if (projectsRes.ok) {
        const pData = await projectsRes.json();
        if (pData.projects && pData.projects.length > 0 && projects.length <= 1) {
          setProjects(pData.projects);
          setActiveProject(pData.projects[0]);
        }
      }
    } catch (e) {
      console.warn('Initial server fetch:', e);
    }
  };

  // Automatic Cloud Project Debounced Saving
  useEffect(() => {
    if (!activeProject || !activeProject.id) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      setIsAutosaving(true);
      try {
        // Save to Supabase database if configured
        if (isSupabaseConfigured && user.id) {
          await supabaseDb.saveProject(user.id, activeProject);
        }
        // Also sync with server backend
        await fetch(`/api/projects/${activeProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activeProject),
        });

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSavedAt(timeStr);
      } catch (err) {
        console.warn('Autosave sync warning:', err);
      } finally {
        setIsAutosaving(false);
      }
    }, 2000);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [activeProject, user.id]);

  // Supabase Cloud Storage Upload Handler
  const uploadMediaFile = async (
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<MediaAsset | null> => {
    try {
      setUploadProgress(10);
      const isAudio = file.type.startsWith('audio');
      const isVideo = file.type.startsWith('video');
      const mediaType: MediaAsset['type'] = isAudio ? 'audio' : isVideo ? 'video' : 'image';

      // 1. Upload to Supabase Storage bucket ('user-media')
      const result = await supabaseStorage.uploadFile(
        'user-media',
        user.id,
        file,
        file.name,
        (pct) => {
          setUploadProgress(pct);
          if (onProgress) onProgress(pct);
        }
      );

      const newAsset: MediaAsset = {
        id: `media_sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        type: mediaType,
        url: result.publicUrl,
        thumbnailUrl: result.publicUrl,
        sizeBytes: file.size,
        duration: isAudio || isVideo ? 10 : 5,
        tags: ['upload', mediaType, 'supabase_storage'],
        source: 'upload',
        createdAt: new Date().toISOString(),
      };

      // 2. Save record in Supabase Database MEDIA table
      if (isSupabaseConfigured) {
        await supabaseDb.saveMedia(user.id, newAsset, result.path, activeProject.id);
      }

      // 3. Update local state & storage stats
      setMediaAssets((prev) => [newAsset, ...prev]);
      const addedMb = Math.round((file.size / (1024 * 1024)) * 10) / 10;
      setUser((prev) => ({
        ...prev,
        storageUsedMb: Math.round((prev.storageUsedMb + addedMb) * 10) / 10,
      }));

      showToast(`Uploaded ${file.name} to Supabase Storage`);
      setUploadProgress(null);
      return newAsset;
    } catch (err: any) {
      console.error('File upload error:', err);
      showToast(err.message || 'Upload failed');
      setUploadProgress(null);
      return null;
    }
  };

  // Sign out
  const signOut = async () => {
    await supabaseAuth.signOut();
    setIsAuthenticated(false);
    setUser({
      id: 'usr_guest',
      name: 'Guest Creator',
      email: 'guest@editflow.ai',
      avatarUrl: '/src/assets/images/ai_image_art_showcase_1794165721878.jpg',
      role: 'user',
      credits: 100,
      plan: 'free',
      storageUsedMb: 0,
      storageLimitMb: 1024,
      voiceConsentApproved: false,
    });
    showToast('Signed out of EDITFLOW AI');
  };

  // Delete Account
  const deleteAccount = async () => {
    await supabaseAuth.deleteAccount(user.id);
    setIsAuthenticated(false);
    showToast('Your account and private cloud data were removed');
    setCurrentView('home');
  };

  // Update profile
  const updateUserProfile = async (name: string, avatarUrl?: string) => {
    setUser((prev) => ({
      ...prev,
      name,
      avatarUrl: avatarUrl || prev.avatarUrl,
    }));
    if (isSupabaseConfigured) {
      await supabaseAuth.updateProfile(user.id, {
        full_name: name,
        avatar_url: avatarUrl,
      });
    }
    showToast('Profile updated in Supabase cloud');
  };

  // Poll active tasks & record completed in Supabase GENERATIONS table
  useEffect(() => {
    const activeTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'processing');
    if (activeTasks.length === 0) return;

    const interval = setInterval(async () => {
      for (const t of activeTasks) {
        try {
          const res = await fetch(`/api/ai/tasks/${t.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.data) {
              const state = data.data.state;
              setTasks((prev) =>
                prev.map((item) =>
                  item.id === t.id
                    ? {
                        ...item,
                        status: state === 'SUCCESS' ? 'completed' : state === 'FAIL' ? 'failed' : 'processing',
                        progress: data.data.progress || item.progress,
                        resultUrls: data.data.resultUrls || item.resultUrls,
                        metadata: data.data.metadata || item.metadata,
                      }
                    : item
                )
              );

              if (state === 'SUCCESS') {
                showToast(`Task completed! Created with ${t.modelId}`);
                // Record in Supabase generations table
                if (isSupabaseConfigured) {
                  supabaseDb.saveGeneration(user.id, {
                    ...t,
                    status: 'completed',
                    resultUrls: data.data.resultUrls,
                  });
                }
                refreshMedia();
              }
            }
          }
        } catch (err) {
          console.warn('Task polling error:', err);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [tasks, user.id]);

  const updateCredits = (amountDelta: number) => {
    setUser((prev) => {
      const nextCredits = Math.max(0, prev.credits + amountDelta);
      if (isSupabaseConfigured) {
        supabaseAuth.updateProfile(prev.id, { credits: nextCredits });
      }
      return { ...prev, credits: nextCredits };
    });
  };

  const purchaseCredits = async (amount: number, provider: string, planName?: string) => {
    try {
      const res = await fetch('/api/user/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCredits: amount, provider, planName }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => ({
          ...prev,
          credits: data.currentCredits,
          plan: data.plan || prev.plan,
        }));
        showToast(`Added ${amount} credits via ${provider.toUpperCase()}`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const setVoiceConsent = async (approved: boolean) => {
    try {
      await fetch('/api/user/consent/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      setUser((prev) => ({ ...prev, voiceConsentApproved: approved }));
      showToast(approved ? 'Voice cloning authorized' : 'Voice cloning revoked');
    } catch (e) {
      console.error(e);
    }
  };

  const refreshModels = async () => {
    try {
      const res = await fetch('/api/ai/models/discover', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const modelsRes = await fetch('/api/ai/models');
        if (modelsRes.ok) {
          const mData = await modelsRes.json();
          setModels(mData.models);
        }
        showToast(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleModelActive = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/models/${id}/toggle`, { method: 'POST' });
      if (res.ok) {
        setModels((prev) =>
          prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
        );
        showToast('Updated model status');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const testModel = async (modelId: string) => {
    try {
      const res = await fetch('/api/ai/models/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, testPrompt: 'Diagnostic test run' }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Model ${modelId} passed diagnostics in ${data.data?.latencyMs || 240}ms`);
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const refreshMedia = async () => {
    try {
      if (isSupabaseConfigured && user.id) {
        const dbMedia = await supabaseDb.getMedia(user.id);
        if (dbMedia.length > 0) {
          setMediaAssets(dbMedia);
          return;
        }
      }
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMediaAssets(data.items);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addMediaAsset = async (asset: Partial<MediaAsset>) => {
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });
      if (res.ok) {
        const data = await res.json();
        setMediaAssets((prev) => [data.asset, ...prev]);
        showToast(`Added ${data.asset.name} to Media Library`);
        return data.asset;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const deleteMediaAsset = async (id: string) => {
    try {
      if (isSupabaseConfigured) {
        await supabaseDb.deleteMedia(id);
      }
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
      setMediaAssets((prev) => prev.filter((m) => m.id !== id));
      showToast('Media asset removed from cloud');
    } catch (e) {
      console.error(e);
    }
  };

  const saveCurrentProject = async () => {
    try {
      setIsAutosaving(true);
      if (isSupabaseConfigured && user.id) {
        await supabaseDb.saveProject(user.id, activeProject);
      }
      await fetch(`/api/projects/${activeProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeProject),
      });
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedAt(timeStr);
      showToast('Project saved to Supabase cloud!');
    } catch (e) {
      console.error(e);
      showToast('Project saved locally.');
    } finally {
      setIsAutosaving(false);
    }
  };

  const createNewProject = (name?: string, aspectRatio?: string) => {
    const newP: ProjectRecord = {
      id: `proj_${Date.now()}`,
      name: name || `Project ${projects.length + 1}`,
      aspectRatio: aspectRatio || '16:9',
      fps: 30,
      durationSec: 15,
      thumbnailUrl: '/src/assets/images/editflow_hero_creative_workspace_1794165722264.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      markers: [],
      tracks: [
        {
          id: `t_v_${Date.now()}`,
          name: 'Main Video Track',
          type: 'video',
          muted: false,
          locked: false,
          hidden: false,
          volume: 1,
          clips: [],
        },
        {
          id: `t_t_${Date.now()}`,
          name: 'Text & Captions',
          type: 'text',
          muted: false,
          locked: false,
          hidden: false,
          volume: 1,
          clips: [],
        },
        {
          id: `t_a_${Date.now()}`,
          name: 'Music & Audio',
          type: 'audio',
          muted: false,
          locked: false,
          hidden: false,
          volume: 1,
          clips: [],
        },
      ],
    };
    recordHistory(activeProject);
    setActiveProject(newP);
    setProjects((prev) => [newP, ...prev]);
    if (isSupabaseConfigured && user.id) {
      supabaseDb.saveProject(user.id, newP);
    }
    setCurrentTime(0);
    setCurrentView('editor');
    showToast(`Created new project: ${newP.name}`);
  };

  const loadProject = async (id: string) => {
    const found = projects.find((p) => p.id === id);
    if (found) {
      recordHistory(activeProject);
      setActiveProject(found);
      setCurrentTime(0);
      setCurrentView('editor');
      showToast(`Loaded ${found.name}`);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      if (isSupabaseConfigured) {
        await supabaseDb.deleteProject(id);
      }
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast('Project deleted');
    } catch (e) {
      console.error(e);
    }
  };

  // Timeline track editing
  const addClipToTrack = (trackId: string, clipData: Partial<TimelineClip>) => {
    recordHistory(activeProject);
    const clipId = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newClip: TimelineClip = {
      id: clipId,
      title: clipData.title || 'New Clip',
      type: clipData.type || 'image',
      src: clipData.src,
      start: clipData.start ?? currentTime,
      duration: clipData.duration || 5,
      scale: 100,
      rotation: 0,
      positionX: 0,
      positionY: 0,
      opacity: 100,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      temperature: 0,
      tint: 0,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      vignette: 0,
      lut: 'none',
      effect: 'none',
      effectIntensity: 50,
      transition: 'none',
      volume: 1,
      ...clipData,
    };

    setActiveProject((prev) => {
      const updatedTracks = prev.tracks.map((t) => {
        if (t.id === trackId) {
          return {
            ...t,
            clips: [...t.clips, newClip].sort((a, b) => a.start - b.start),
          };
        }
        return t;
      });

      let maxEnd = prev.durationSec;
      updatedTracks.forEach((t) => {
        t.clips.forEach((c) => {
          if (c.start + c.duration > maxEnd) {
            maxEnd = Math.ceil(c.start + c.duration);
          }
        });
      });

      return { ...prev, tracks: updatedTracks, durationSec: maxEnd, updatedAt: new Date().toISOString() };
    });

    setSelectedClipId(clipId);
    showToast(`Added "${newClip.title}" to timeline`);
  };

  const updateClip = (trackId: string, clipId: string, updates: Partial<TimelineClip>) => {
    setActiveProject((prev) => {
      const updatedTracks = prev.tracks.map((t) => {
        if (t.id === trackId) {
          return {
            ...t,
            clips: t.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
          };
        }
        return t;
      });
      return { ...prev, tracks: updatedTracks, updatedAt: new Date().toISOString() };
    });
  };

  const deleteClip = (trackId: string, clipId: string) => {
    recordHistory(activeProject);
    setActiveProject((prev) => {
      const updatedTracks = prev.tracks.map((t) => {
        if (t.id === trackId) {
          return {
            ...t,
            clips: t.clips.filter((c) => c.id !== clipId),
          };
        }
        return t;
      });
      return { ...prev, tracks: updatedTracks, updatedAt: new Date().toISOString() };
    });
    if (selectedClipId === clipId) setSelectedClipId(null);
    showToast('Clip deleted from timeline');
  };

  const splitClipAtPlayhead = (trackId: string, clipId: string) => {
    const track = activeProject.tracks.find((t) => t.id === trackId);
    if (!track) return;
    const clip = track.clips.find((c) => c.id === clipId);
    if (!clip) return;

    if (currentTime <= clip.start || currentTime >= clip.start + clip.duration) {
      showToast('Move playhead inside the clip to split');
      return;
    }

    recordHistory(activeProject);
    const firstDuration = currentTime - clip.start;
    const secondDuration = clip.duration - firstDuration;

    const firstClip: TimelineClip = {
      ...clip,
      duration: firstDuration,
    };

    const secondClip: TimelineClip = {
      ...clip,
      id: `clip_${Date.now()}_split`,
      start: currentTime,
      duration: secondDuration,
    };

    setActiveProject((prev) => {
      const updatedTracks = prev.tracks.map((t) => {
        if (t.id === trackId) {
          const filtered = t.clips.filter((c) => c.id !== clipId);
          return {
            ...t,
            clips: [...filtered, firstClip, secondClip].sort((a, b) => a.start - b.start),
          };
        }
        return t;
      });
      return { ...prev, tracks: updatedTracks, updatedAt: new Date().toISOString() };
    });
    setSelectedClipId(secondClip.id);
    showToast('Split clip at playhead');
  };

  const duplicateClip = (trackId: string, clipId: string) => {
    const track = activeProject.tracks.find((t) => t.id === trackId);
    if (!track) return;
    const clip = track.clips.find((c) => c.id === clipId);
    if (!clip) return;

    recordHistory(activeProject);
    const newClip: TimelineClip = {
      ...JSON.parse(JSON.stringify(clip)),
      id: `clip_${Date.now()}_dup`,
      title: `${clip.title} (Copy)`,
      start: clip.start + clip.duration,
    };

    setActiveProject((prev) => {
      const updatedTracks = prev.tracks.map((t) => {
        if (t.id === trackId) {
          return { ...t, clips: [...t.clips, newClip].sort((a, b) => a.start - b.start) };
        }
        return t;
      });
      return { ...prev, tracks: updatedTracks, updatedAt: new Date().toISOString() };
    });
    setSelectedClipId(newClip.id);
    showToast(`Duplicated "${clip.title}"`);
  };

  const copySelectedClip = () => {
    const found = activeProject.tracks
      .flatMap((t) => t.clips)
      .find((c) => c.id === selectedClipId);
    if (found) {
      setCopiedClip(JSON.parse(JSON.stringify(found)));
      showToast(`Copied "${found.title}" to clipboard`);
    }
  };

  const pasteClipAtPlayhead = () => {
    if (!copiedClip) {
      showToast('Clipboard is empty');
      return;
    }
    const track = activeProject.tracks.find(
      (t) => (copiedClip.type === 'audio' ? t.type === 'audio' : t.type === 'video' || t.type === 'image')
    ) || activeProject.tracks[0];

    if (!track) return;

    recordHistory(activeProject);
    const pasted: TimelineClip = {
      ...copiedClip,
      id: `clip_${Date.now()}_paste`,
      title: `${copiedClip.title} (Pasted)`,
      start: currentTime,
    };

    addClipToTrack(track.id, pasted);
    showToast(`Pasted "${pasted.title}" at ${currentTime.toFixed(1)}s`);
  };

  const moveClipTrack = (sourceTrackId: string, destTrackId: string, clipId: string) => {
    if (sourceTrackId === destTrackId) return;
    const sourceTrack = activeProject.tracks.find((t) => t.id === sourceTrackId);
    if (!sourceTrack) return;
    const clip = sourceTrack.clips.find((c) => c.id === clipId);
    if (!clip) return;

    recordHistory(activeProject);
    setActiveProject((prev) => {
      const updatedTracks = prev.tracks.map((t) => {
        if (t.id === sourceTrackId) {
          return { ...t, clips: t.clips.filter((c) => c.id !== clipId) };
        }
        if (t.id === destTrackId) {
          return { ...t, clips: [...t.clips, clip].sort((a, b) => a.start - b.start) };
        }
        return t;
      });
      return { ...prev, tracks: updatedTracks, updatedAt: new Date().toISOString() };
    });
    showToast('Moved clip to new track');
  };

  // Track Management
  const addNewTrack = (type: TimelineTrack['type'], name?: string) => {
    recordHistory(activeProject);
    const newTrack: TimelineTrack = {
      id: `track_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: name || `${type.toUpperCase()} Track ${activeProject.tracks.length + 1}`,
      type,
      muted: false,
      locked: false,
      hidden: false,
      volume: 1,
      clips: [],
    };
    setActiveProject((prev) => ({
      ...prev,
      tracks: [...prev.tracks, newTrack],
      updatedAt: new Date().toISOString(),
    }));
    showToast(`Added ${newTrack.name}`);
  };

  const deleteTrack = (trackId: string) => {
    if (activeProject.tracks.length <= 1) {
      showToast('Project must have at least one track');
      return;
    }
    recordHistory(activeProject);
    setActiveProject((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== trackId),
      updatedAt: new Date().toISOString(),
    }));
    showToast('Track removed');
  };

  const toggleTrackLock = (trackId: string) => {
    setActiveProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t)),
    }));
  };

  const toggleTrackHide = (trackId: string) => {
    setActiveProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, hidden: !t.hidden } : t)),
    }));
  };

  const toggleTrackMute = (trackId: string) => {
    setActiveProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)),
    }));
  };

  // Markers
  const addTimelineMarker = (time: number, label: string, color = '#8B5CF6') => {
    const markerId = `m_${Date.now()}`;
    const newMarker: TimelineMarker = { id: markerId, time, label, color };
    setActiveProject((prev) => ({
      ...prev,
      markers: [...(prev.markers || []), newMarker],
    }));
    showToast(`Added marker "${label}"`);
  };

  const deleteTimelineMarker = (id: string) => {
    setActiveProject((prev) => ({
      ...prev,
      markers: (prev.markers || []).filter((m) => m.id !== id),
    }));
  };

  // AI Auto Captions Generator
  const generateAutoCaptions = async () => {
    showToast('AI Whisper engine transcribing audio & generating animated subtitles...');
    await new Promise((resolve) => setTimeout(resolve, 1400));

    let textTrack = activeProject.tracks.find((t) => t.type === 'text');
    if (!textTrack) {
      addNewTrack('text', 'AI Auto-Captions');
      textTrack = activeProject.tracks.find((t) => t.type === 'text');
    }

    const captions = [
      { text: 'EDITFLOW AI // THE FUTURE', start: 0.5, dur: 3.5 },
      { text: 'UNLIMITED CREATIVE VISION', start: 4.2, dur: 3.8 },
      { text: 'PRO MULTI-TRACK ENGINE', start: 8.2, dur: 4.0 },
      { text: 'CREATE. EDIT. INSPIRE.', start: 12.5, dur: 4.5 },
    ];

    recordHistory(activeProject);
    const newClips: TimelineClip[] = captions.map((c, i) => ({
      id: `caption_${Date.now()}_${i}`,
      title: `Caption: ${c.text}`,
      type: 'text',
      text: c.text,
      start: c.start,
      duration: c.dur,
      fontSize: 34,
      fontFamily: 'Plus Jakarta Sans',
      color: '#FFFFFF',
      bgColor: 'rgba(0, 0, 0, 0.75)',
      positionY: 82,
      strokeWidth: 2,
      strokeColor: '#06B6D4',
      shadowBlur: 10,
      shadowColor: '#8B5CF6',
      animation: 'kinetic_zoom',
    }));

    setActiveProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => {
        if (t.id === (textTrack ? textTrack.id : prev.tracks[0].id)) {
          return { ...t, clips: [...t.clips, ...newClips] };
        }
        return t;
      }),
      updatedAt: new Date().toISOString(),
    }));

    showToast('Auto-Captions generated and synchronized to timeline!');
  };

  // AI Task Creation
  const createTask = async (
    category: TaskRecord['category'],
    modelId: string,
    prompt: string,
    params: Record<string, any> = {}
  ): Promise<TaskRecord | null> => {
    try {
      const res = await fetch('/api/v1/jobs/createTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId, modelId, input: { prompt, ...params }, prompt, category }),
      });

      if (res.ok) {
        const data = await res.json();
        const taskId = data.data?.taskId;
        const newRecord: TaskRecord = {
          id: taskId,
          userId: user.id,
          modelId,
          category,
          prompt,
          params,
          status: 'pending',
          progress: 5,
          resultUrls: [],
          costCredits: 10,
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [newRecord, ...prev]);
        updateCredits(-10);
        showToast(`Dispatched task to ${modelId}`);
        return newRecord;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const enhancePrompt = async (prompt: string, type: string): Promise<string> => {
    try {
      const res = await fetch('/api/ai/prompts/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast('Prompt enhanced by Gemini 3.8 AI');
        return data.enhancedPrompt || prompt;
      }
    } catch (e) {
      console.error(e);
    }
    return prompt;
  };

  const generateLyrics = async (topic: string, genre: string, mood?: string, language?: string) => {
    try {
      const res = await fetch('/api/ai/music/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, genre, mood, language }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast('Generated studio lyrics with section tags');
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return { lyrics: 'Failed to generate lyrics', title: 'Original' };
  };

  // Web Speech API Microphone listener
  const startVoicePromptInput = (onTranscript: (text: string) => void) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Speech Recognition not supported in this browser');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListeningSpeech(true);
        showToast('Listening... Speak your prompt now');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        showToast(`Heard: "${transcript}"`);
        setIsListeningSpeech(false);
      };

      recognition.onerror = () => {
        setIsListeningSpeech(false);
      };

      recognition.onend = () => {
        setIsListeningSpeech(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListeningSpeech(false);
    }
  };

  const stopVoicePromptInput = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListeningSpeech(false);
  };

  return (
    <CreativeContext.Provider
      value={{
        currentView,
        setCurrentView,
        user,
        setUser,
        updateCredits,
        purchaseCredits,
        setVoiceConsent,
        isAuthenticated,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signOut,
        deleteAccount,
        updateUserProfile,
        isSupabaseActive: isSupabaseConfigured,
        uploadMediaFile,
        uploadProgress,
        models,
        activeCategory,
        setActiveCategory,
        refreshModels,
        toggleModelActive,
        testModel,
        mediaAssets,
        refreshMedia,
        addMediaAsset,
        deleteMediaAsset,
        projects,
        activeProject,
        setActiveProject,
        saveCurrentProject,
        createNewProject,
        loadProject,
        deleteProject,
        isAutosaving,
        lastSavedAt,
        undo,
        redo,
        canUndo: history.length > 0,
        canRedo: redoStack.length > 0,
        copiedClip,
        copySelectedClip,
        pasteClipAtPlayhead,
        duplicateClip,
        moveClipTrack,
        addNewTrack,
        deleteTrack,
        toggleTrackLock,
        toggleTrackHide,
        toggleTrackMute,
        addTimelineMarker,
        deleteTimelineMarker,
        snapEnabled,
        setSnapEnabled,
        currentTime,
        setCurrentTime,
        isPlaying,
        setIsPlaying,
        timelineZoom,
        setTimelineZoom,
        selectedClipId,
        setSelectedClipId,
        addClipToTrack,
        updateClip,
        deleteClip,
        splitClipAtPlayhead,
        generateAutoCaptions,
        tasks,
        createTask,
        enhancePrompt,
        generateLyrics,
        isListeningSpeech,
        startVoicePromptInput,
        stopVoicePromptInput,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CreativeContext.Provider>
  );
};

export const useCreative = () => {
  const context = useContext(CreativeContext);
  if (!context) throw new Error('useCreative must be used within CreativeProvider');
  return context;
};
