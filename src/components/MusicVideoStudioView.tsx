import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import {
  Film,
  Sparkles,
  Music,
  Video,
  Layers,
  Wand2,
  Play,
  ArrowRight,
  Disc,
  Eye,
  Camera,
} from 'lucide-react';

export const MusicVideoStudioView: React.FC = () => {
  const { createTask, mediaAssets, setCurrentView, showToast, addClipToTrack, activeProject } = useCreative();

  // 10 Modes
  const modes = [
    { id: 'cinematic', label: '1. Cinematic Narrative', desc: 'Hollywood film aesthetic with story arcs' },
    { id: 'auto', label: '2. Automatic Music Video', desc: 'AI director syncs scenes directly to audio beats' },
    { id: 'singer_performance', label: '3. AI Singer Performance', desc: 'Realistic artist performing with lip-sync motion' },
    { id: 'animated', label: '4. Animated Video', desc: '2D/3D anime, cartoon, and stylized motion' },
    { id: 'lyrics_video', label: '5. Dynamic Lyrics Video', desc: 'Kinetic typography synchronized to song words' },
    { id: 'visualizer', label: '6. Audio Visualizer', desc: 'Sound-reactive spectrum and psychedelic geometry' },
    { id: 'story_based', label: '7. Story-Based Video', desc: 'Multi-scene character journey and drama' },
    { id: 'image_based', label: '8. Image-Based Video', desc: 'Animate existing album artwork or photos' },
    { id: 'concert', label: '9. Concert Experience', desc: 'Massive stage lights, crowd energy, and stadium pyro' },
    { id: 'multi_scene', label: '10. Multi-Scene Cut', desc: 'Rapid montage cuts between 4 distinct locations' },
  ];

  const [selectedMode, setSelectedMode] = useState('cinematic');
  const [selectedAudio, setSelectedAudio] = useState(
    mediaAssets.find((m) => m.type === 'audio')?.url || 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3'
  );
  const [visualStyle, setVisualStyle] = useState('Afrobeats Golden Hour Luxury');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [scenePrompt, setScenePrompt] = useState(
    'A high-fashion musician singing under golden hour sunlight on an architectural rooftop in Lagos, anamorphic lens flares, stylish backup dancers, rich cinematic atmosphere'
  );

  const audioOptions = mediaAssets.filter((m) => m.type === 'audio' || m.type === 'recording');

  const handleGenerateMusicVideo = async () => {
    await createTask('music_video', 'kie-music-video-sync-v1', scenePrompt, {
      audioUrl: selectedAudio,
      mode: selectedMode,
      style: visualStyle,
      aspectRatio,
    });
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1380px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182133] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/40 text-[11px] font-semibold text-purple-300 mb-2">
            <span>KIE Music-to-Video Engine · 10 Production Modes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Music Video Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Transform any audio track into a professional, beat-synchronized cinematic music video.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('editor')}
          className="px-4 py-2 rounded-xl bg-[#121826] hover:bg-[#1A2336] border border-[#232F46] text-xs font-semibold text-slate-200 flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <span>Open Video Editor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 10 Modes Selector */}
      <div>
        <div className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">
          Select Video Production Mode
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {modes.map((m) => {
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-purple-950/80 to-[#0F1422] border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500'
                    : 'bg-[#0D121D] border-[#1C263A] hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold text-white mb-1 truncate">{m.label}</div>
                <div className="text-[10px] text-slate-400 line-clamp-2">{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Director Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual Scene Prompt & Preview Frame */}
        <div className="lg:col-span-8 space-y-5">
          <div className="p-5 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-purple-400" />
                <span>Scene & Character Description</span>
              </label>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/40 px-2 py-0.5 rounded">
                Veo 2 + Kling Motion Sync
              </span>
            </div>

            <textarea
              rows={4}
              value={scenePrompt}
              onChange={(e) => setScenePrompt(e.target.value)}
              placeholder="Describe the music video storyline, performers, lighting, and camera movement..."
              className="w-full bg-[#080B12] border border-[#1F2B40] text-sm text-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
            />

            {/* Showcase Still Frame */}
            <div className="relative rounded-xl overflow-hidden aspect-[16/9] border border-[#232F46] group">
              <img
                src="/src/assets/images/ai_music_video_cinematic_1794165723863.jpg"
                alt="Cinematic Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-xs text-slate-200">
                  <span className="font-bold text-white">Active Visual Style:</span> {visualStyle}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audio Track Sync & Styles */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
            <div className="text-xs font-bold text-white">Audio & Production Setup</div>

            {/* Audio Track Selector */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Source Audio Track</label>
              <select
                value={selectedAudio}
                onChange={(e) => setSelectedAudio(e.target.value)}
                className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2.5 focus:outline-none"
              >
                {audioOptions.length > 0 ? (
                  audioOptions.map((a) => (
                    <option key={a.id} value={a.url}>
                      {a.name} ({a.duration || 30}s)
                    </option>
                  ))
                ) : (
                  <option value="https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3">
                    Amapiano Groove (Demo Stem)
                  </option>
                )}
              </select>
            </div>

            {/* Visual Style Selector */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Visual Art Direction</label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2.5 focus:outline-none"
              >
                <option value="Afrobeats Golden Hour Luxury">Afrobeats Golden Hour Luxury</option>
                <option value="Hollywood 35mm Film Noir">Hollywood 35mm Film Noir</option>
                <option value="Cyberpunk Neon Tokyo">Cyberpunk Neon Tokyo</option>
                <option value="Hypnotic 3D Visualizer">Hypnotic 3D Visualizer</option>
                <option value="Anime Studio Ghibli Grade">Anime Studio Ghibli Grade</option>
                <option value="Vintage 90s MTV Camcorder">Vintage 90s MTV Camcorder</option>
              </select>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Video Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-purple-950 border-purple-500 text-white font-bold'
                      : 'bg-[#090C14] border-[#212E44] text-slate-400'
                  }`}
                >
                  16:9 (YouTube)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-purple-950 border-purple-500 text-white font-bold'
                      : 'bg-[#090C14] border-[#212E44] text-slate-400'
                  }`}
                >
                  9:16 (TikTok/Reel)
                </button>
              </div>
            </div>

            {/* Cost note */}
            <div className="p-3 rounded-lg bg-[#080B12] border border-[#192335] text-xs text-slate-400 flex items-center justify-between">
              <span>Task Cost:</span>
              <span className="font-mono text-purple-400 font-bold">30 Credits</span>
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleGenerateMusicVideo}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Synthesize Music Video</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
