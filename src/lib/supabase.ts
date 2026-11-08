import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { ProjectRecord, MediaAsset, TaskRecord, UserProfile } from '../types';

// Read default credentials from Vite environment
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Also allow local fallback / custom credentials entered in the UI
const getStoredConfig = () => {
  try {
    const customUrl = localStorage.getItem('editflow_supabase_url');
    const customKey = localStorage.getItem('editflow_supabase_anon_key');
    return {
      url: customUrl || envUrl,
      anonKey: customKey || envAnonKey,
    };
  } catch {
    return { url: envUrl, anonKey: envAnonKey };
  }
};

const { url: initialUrl, anonKey: initialKey } = getStoredConfig();

// Validate if real URL is configured (not placeholder)
export const isSupabaseConfigured = Boolean(
  initialUrl &&
  initialKey &&
  initialUrl.startsWith('https://') &&
  !initialUrl.includes('your-project-id')
);

// Instantiate Supabase client or a safe fallback client
export let supabase: SupabaseClient = createClient(
  initialUrl || 'https://placeholder-project.supabase.co',
  initialKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const reconfigureSupabase = (newUrl: string, newAnonKey: string) => {
  localStorage.setItem('editflow_supabase_url', newUrl);
  localStorage.setItem('editflow_supabase_anon_key', newAnonKey);
  supabase = createClient(newUrl, newAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

// ==============================================================================
// AUTHENTICATION API
// ==============================================================================

export const supabaseAuth = {
  // Sign Up new user with full name
  async signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      // Offline / Local Simulation Mode
      const simulatedUser: User = {
        id: `usr_${Date.now()}`,
        app_metadata: {},
        user_metadata: { full_name: fullName },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email,
      } as any;
      const session = {
        access_token: 'mock-jwt-token',
        user: simulatedUser,
      } as any;
      localStorage.setItem('editflow_auth_session', JSON.stringify({ user: simulatedUser, session }));
      return { data: { user: simulatedUser, session }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
        },
      },
    });

    return { data, error };
  },

  // Sign In with email & password
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      // Local check
      const stored = localStorage.getItem('editflow_auth_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { data: parsed, error: null };
      }
      const simulatedUser: User = {
        id: 'usr_editflow_admin',
        app_metadata: {},
        user_metadata: { full_name: 'Creative Director' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email,
      } as any;
      const session = {
        access_token: 'mock-jwt-token',
        user: simulatedUser,
      } as any;
      localStorage.setItem('editflow_auth_session', JSON.stringify({ user: simulatedUser, session }));
      return { data: { user: simulatedUser, session }, error: null };
    }

    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // Sign Out
  async signOut() {
    localStorage.removeItem('editflow_auth_session');
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  // Reset Password Request
  async resetPassword(email: string) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
  },

  // Update Password
  async updatePassword(newPassword: string) {
    if (!isSupabaseConfigured) {
      return { data: {}, error: null };
    }
    return await supabase.auth.updateUser({
      password: newPassword,
    });
  },

  // Get current session
  async getSession(): Promise<{ session: Session | null; user: User | null }> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem('editflow_auth_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return { session: parsed.session, user: parsed.user };
        } catch {}
      }
      return { session: null, user: null };
    }

    const { data } = await supabase.auth.getSession();
    return { session: data.session, user: data.session?.user || null };
  },

  // Fetch or create user profile from profiles table
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.full_name || 'Creator',
        email: data.email,
        avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
        role: 'user',
        credits: data.credits ?? 500,
        plan: data.plan || 'pro',
        storageUsedMb: Math.round((data.storage_used_bytes || 0) / (1024 * 1024) * 10) / 10,
        storageLimitMb: 10240,
        voiceConsentApproved: data.voice_consent_approved ?? true,
      };
    } catch {
      return null;
    }
  },

  // Update Profile
  async updateProfile(userId: string, updates: { full_name?: string; avatar_url?: string; credits?: number; plan?: string }) {
    if (!isSupabaseConfigured) return { data: null, error: null };
    return await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  },

  // Delete Account
  async deleteAccount(userId: string) {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('editflow_auth_session');
      return { success: true };
    }
    // Delete profile and cascade user-owned projects, media, generations
    await supabase.from('profiles').delete().eq('id', userId);
    await supabase.auth.signOut();
    return { success: true };
  },
};

// ==============================================================================
// CLOUD STORAGE API (5 Buckets: avatars, user-media, generated-content, project-exports, thumbnails)
// ==============================================================================

export const supabaseStorage = {
  // Upload file to bucket with progress callback
  async uploadFile(
    bucket: 'avatars' | 'user-media' | 'generated-content' | 'project-exports' | 'thumbnails',
    userId: string,
    file: File | Blob,
    fileName: string,
    onProgress?: (percent: number) => void
  ): Promise<{ path: string; publicUrl: string; error?: string }> {
    const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storagePath = `${userId}/${cleanFileName}`;

    if (onProgress) onProgress(30);

    if (!isSupabaseConfigured) {
      // Local object URL fallback
      if (onProgress) onProgress(100);
      const url = URL.createObjectURL(file);
      return { path: storagePath, publicUrl: url };
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      if (onProgress) onProgress(80);

      // Get public URL or signed URL
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

      if (onProgress) onProgress(100);

      return {
        path: storagePath,
        publicUrl: publicData.publicUrl,
      };
    } catch (err: any) {
      console.error('Supabase storage upload error:', err);
      // Fallback to local URL so editing experience is never interrupted
      const fallbackUrl = URL.createObjectURL(file);
      return { path: storagePath, publicUrl: fallbackUrl, error: err.message };
    }
  },

  // Get Signed URL for private files
  async getSignedUrl(bucket: string, path: string, expiresInSec = 3600): Promise<string | null> {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSec);
    return data?.signedUrl || null;
  },

  // Delete file from storage
  async deleteFile(bucket: string, path: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
  },
};

// ==============================================================================
// DATABASE API (Projects, Media, Generations)
// ==============================================================================

export const supabaseDb = {
  // 1. Projects
  async getProjects(userId: string): Promise<ProjectRecord[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        name: row.project_name,
        aspectRatio: row.aspect_ratio || '16:9',
        fps: row.fps || 30,
        durationSec: Number(row.duration_sec) || 15,
        tracks: row.project_data?.tracks || [],
        markers: row.project_data?.markers || [],
        thumbnailUrl: row.thumbnail_url || '/src/assets/images/editflow_hero_creative_workspace_1794165722264.jpg',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch {
      return [];
    }
  },

  async saveProject(userId: string, project: ProjectRecord): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase.from('projects').upsert(
        {
          id: project.id,
          user_id: userId,
          project_name: project.name,
          project_data: {
            tracks: project.tracks,
            markers: project.markers || [],
          },
          thumbnail_url: project.thumbnailUrl,
          aspect_ratio: project.aspectRatio,
          duration_sec: project.durationSec,
          fps: project.fps,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      return !error;
    } catch {
      return false;
    }
  },

  async deleteProject(projectId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    return !error;
  },

  // 2. Media Table
  async getMedia(userId: string): Promise<MediaAsset[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        name: row.file_name,
        type: row.file_type as any,
        url: row.public_url,
        thumbnailUrl: row.public_url,
        duration: Number(row.duration) || 0,
        sizeBytes: Number(row.file_size) || 0,
        tags: row.tags || [],
        source: row.source || 'upload',
        createdAt: row.created_at,
      }));
    } catch {
      return [];
    }
  },

  async saveMedia(userId: string, asset: MediaAsset, storagePath: string, projectId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase.from('media').insert({
        id: asset.id,
        user_id: userId,
        project_id: projectId || null,
        file_name: asset.name,
        file_type: asset.type,
        file_size: asset.sizeBytes,
        storage_path: storagePath,
        public_url: asset.url,
        duration: asset.duration || 0,
        tags: asset.tags,
        source: asset.source || 'upload',
        created_at: asset.createdAt || new Date().toISOString(),
      });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteMedia(mediaId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('media').delete().eq('id', mediaId);
    return !error;
  },

  // 3. Generations Table (KIE AI)
  async saveGeneration(
    userId: string,
    task: TaskRecord,
    outputStoragePath?: string,
    outputUrl?: string,
    projectId?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase.from('generations').insert({
        id: task.id,
        user_id: userId,
        project_id: projectId || null,
        generation_type: task.category,
        model_name: task.modelId,
        prompt: task.prompt,
        status: task.status,
        output_storage_path: outputStoragePath || null,
        output_url: outputUrl || task.resultUrls?.[0] || null,
        metadata: task.params || {},
        cost_credits: task.costCredits || 10,
        created_at: task.createdAt,
      });
      return !error;
    } catch {
      return false;
    }
  },
};
