-- ==============================================================================
-- EDITFLOW AI: SUPABASE COMPLETE DATABASE & STORAGE MIGRATION
-- Tables: profiles, projects, media, generations
-- Storage Buckets: avatars, user-media, generated-content, project-exports, thumbnails
-- Row Level Security (RLS) enforced across all tables and buckets
-- ==============================================================================

-- 1. PROFILES TABLE (Linked directly to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  credits INTEGER DEFAULT 500,
  plan TEXT DEFAULT 'pro',
  storage_used_bytes BIGINT DEFAULT 0,
  voice_consent_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to automatically create a profile on new Supabase user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, credits, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop'),
    500,
    'pro'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  aspect_ratio TEXT DEFAULT '16:9',
  duration_sec NUMERIC DEFAULT 15,
  fps INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- 3. MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'video' | 'audio' | 'image' | 'recording'
  file_size BIGINT DEFAULT 0,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  duration NUMERIC DEFAULT 0,
  tags TEXT[] DEFAULT '{}'::text[],
  source TEXT DEFAULT 'upload', -- 'upload' | 'ai_generated' | 'stock'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(file_type);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own media"
  ON public.media FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media"
  ON public.media FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media"
  ON public.media FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
  ON public.media FOR DELETE
  USING (auth.uid() = user_id);

-- 4. GENERATIONS TABLE (KIE AI Generations)
CREATE TABLE IF NOT EXISTS public.generations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  generation_type TEXT NOT NULL, -- 'music' | 'video' | 'image' | 'voice' | 'music_video'
  model_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed', -- 'pending' | 'processing' | 'completed' | 'failed'
  output_storage_path TEXT,
  output_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  cost_credits INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_type ON public.generations(generation_type);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
  ON public.generations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

-- 5. STORAGE BUCKETS INITIALIZATION
-- Insert storage buckets if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('user-media', 'user-media', false),
  ('generated-content', 'generated-content', false),
  ('project-exports', 'project-exports', false),
  ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Avatars bucket (public read, authenticated user write own folder)
CREATE POLICY "Avatar public view"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Avatar user upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar user update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS: User Media (private, authenticated user read/write own folder)
CREATE POLICY "User media owner read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "User media owner insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "User media owner delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS: Generated Content
CREATE POLICY "Generated content owner read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-content' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Generated content owner insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'generated-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS: Project Exports
CREATE POLICY "Project exports owner read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Project exports owner insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS: Thumbnails
CREATE POLICY "Thumbnails public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Thumbnails owner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
