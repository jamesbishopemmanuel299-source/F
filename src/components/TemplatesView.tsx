import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import { TemplateItem, TimelineTrack } from '../types';
import { LayoutTemplate, Play, ArrowRight, Video, Sparkles } from 'lucide-react';

export const TemplatesView: React.FC = () => {
  const { setActiveProject, setCurrentView, showToast } = useCreative();
  const [filter, setFilter] = useState<string>('all');

  const templates: TemplateItem[] = [
    {
      id: 'tmpl_tiktok_afrobeats',
      name: 'Viral TikTok Afrobeats Dance Beat',
      category: 'tiktok_reels',
      description: 'Dynamic 9:16 vertical cuts with bouncy beat transitions, lyric captions, and pulsing glow filters.',
      aspectRatio: '9:16',
      durationSec: 15,
      previewUrl: '/src/assets/images/ai_music_video_cinematic_1794165723863.jpg',
      thumbnailUrl: '/src/assets/images/ai_music_video_cinematic_1794165723863.jpg',
      tracks: [
        {
          id: 't_v1',
          name: 'Vertical Dance Video',
          type: 'video',
          muted: false,
          volume: 1,
          clips: [
            {
              id: 'c1',
              title: 'Viral Dance Performance',
              src: '/src/assets/images/ai_music_video_cinematic_1794165723863.jpg',
              type: 'image',
              start: 0,
              duration: 15,
              brightness: 105,
              contrast: 110,
              saturation: 120,
            },
          ],
        },
        {
          id: 't_t1',
          name: 'Kinetic Lyrics',
          type: 'text',
          muted: false,
          volume: 1,
          clips: [
            {
              id: 'c_t1',
              title: 'Hook Lyric',
              type: 'text',
              text: 'FEEL THE GROOVE // VIRAL DANCE',
              start: 1,
              duration: 8,
              fontSize: 32,
              color: '#FDE047',
              bgColor: 'rgba(0,0,0,0.7)',
              positionY: 75,
            },
          ],
        },
        {
          id: 't_a1',
          name: 'Amapiano Log Drum',
          type: 'audio',
          muted: false,
          volume: 0.9,
          clips: [
            {
              id: 'c_a1',
              title: 'Amapiano Viral Cut',
              src: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
              type: 'audio',
              start: 0,
              duration: 15,
            },
          ],
        },
      ],
    },
    {
      id: 'tmpl_yt_intro',
      name: 'High-Tech Studio YouTube Intro',
      category: 'youtube_intro',
      description: 'Sleek dark workstation opener with glowing neon text reveals and deep bass drops.',
      aspectRatio: '16:9',
      durationSec: 10,
      previewUrl: '/src/assets/images/editflow_hero_creative_workspace_1794165722264.jpg',
      thumbnailUrl: '/src/assets/images/editflow_hero_creative_workspace_1794165722264.jpg',
      tracks: [
        {
          id: 't_v1',
          name: 'Studio Backdrop',
          type: 'video',
          muted: false,
          volume: 1,
          clips: [
            {
              id: 'c1',
              title: 'Studio Workspace Intro',
              src: '/src/assets/images/editflow_hero_creative_workspace_1794165722264.jpg',
              type: 'image',
              start: 0,
              duration: 10,
              brightness: 100,
              contrast: 115,
              saturation: 110,
            },
          ],
        },
        {
          id: 't_t1',
          name: 'Logo Reveal',
          type: 'text',
          muted: false,
          volume: 1,
          clips: [
            {
              id: 'c_t1',
              title: 'Studio Channel Title',
              type: 'text',
              text: 'STUDIO MASTERCLASS // EPISODE 01',
              start: 1.5,
              duration: 7,
              fontSize: 36,
              color: '#38BDF8',
              bgColor: 'rgba(0,0,0,0.8)',
              positionY: 80,
            },
          ],
        },
      ],
    },
    {
      id: 'tmpl_music_cinematic',
      name: 'Official Music Video Teaser',
      category: 'music_video',
      description: 'Anamorphic widescreen 21:9 letterboxed presentation with high-contrast color grading.',
      aspectRatio: '16:9',
      durationSec: 20,
      previewUrl: '/src/assets/images/ai_music_video_cinematic_1794165723863.jpg',
      thumbnailUrl: '/src/assets/images/ai_music_video_cinematic_1794165723863.jpg',
      tracks: [
        {
          id: 't_v1',
          name: 'Cinematic Visuals',
          type: 'video',
          muted: false,
          volume: 1,
          clips: [
            {
              id: 'c1',
              title: 'Scene 1: Golden Hour',
              src: '/src/assets/images/ai_music_video_cinematic_1794165723863.jpg',
              type: 'image',
              start: 0,
              duration: 10,
            },
            {
              id: 'c2',
              title: 'Scene 2: Studio Lights',
              src: '/src/assets/images/editflow_hero_creative_workspace_1794165722264.jpg',
              type: 'image',
              start: 10,
              duration: 10,
            },
          ],
        },
      ],
    },
    {
      id: 'tmpl_business_ad',
      name: 'Luxury Product & Brand Showcase',
      category: 'business_ad',
      description: 'Minimalist high-fashion commercial promo with clean subtitle banners and crisp audio.',
      aspectRatio: '16:9',
      durationSec: 15,
      previewUrl: '/src/assets/images/ai_image_art_showcase_1794165721878.jpg',
      thumbnailUrl: '/src/assets/images/ai_image_art_showcase_1794165721878.jpg',
      tracks: [
        {
          id: 't_v1',
          name: 'Hero Visuals',
          type: 'video',
          muted: false,
          volume: 1,
          clips: [
            {
              id: 'c1',
              title: 'Editorial Art Frame',
              src: '/src/assets/images/ai_image_art_showcase_1794165721878.jpg',
              type: 'image',
              start: 0,
              duration: 15,
            },
          ],
        },
      ],
    },
  ];

  const handleUseTemplate = (tmpl: TemplateItem) => {
    setActiveProject({
      id: `proj_from_${tmpl.id}_${Date.now()}`,
      name: `${tmpl.name} (Edit)`,
      aspectRatio: tmpl.aspectRatio,
      fps: 30,
      durationSec: tmpl.durationSec,
      tracks: tmpl.tracks,
      thumbnailUrl: tmpl.thumbnailUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setCurrentView('editor');
    showToast(`Loaded "${tmpl.name}" into Video Editor!`);
  };

  const filtered = filter === 'all' ? templates : templates.filter((t) => t.category === filter);

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1380px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182133] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/40 text-[11px] font-semibold text-purple-300 mb-2">
            <span>Ready-to-Edit Templates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Video Template Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Jumpstart your creation with pre-built multi-track timelines for TikTok, Reels, YouTube Intros, and Music Videos.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Templates' },
          { id: 'tiktok_reels', label: 'TikTok & Reels (9:16)' },
          { id: 'youtube_intro', label: 'YouTube Intros (16:9)' },
          { id: 'music_video', label: 'Music Videos' },
          { id: 'business_ad', label: 'Commercial Ads' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === f.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#0D121D] border border-[#1E293F] text-slate-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((tmpl) => (
          <div
            key={tmpl.id}
            className="rounded-2xl overflow-hidden bg-[#0D121D] border border-[#1E293F] hover:border-purple-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-black/60">
              <img
                src={tmpl.thumbnailUrl}
                alt={tmpl.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-cyan-300">
                {tmpl.aspectRatio} · {tmpl.durationSec}s
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  {tmpl.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tmpl.description}</p>
              </div>

              <button
                onClick={() => handleUseTemplate(tmpl)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Use in Video Editor</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
