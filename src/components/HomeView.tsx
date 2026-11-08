import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import {
  Video,
  Music,
  Film,
  Sparkles,
  Image,
  Mic,
  ArrowRight,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  ChevronDown,
  Layers,
  Wand2,
  Cpu,
  Download,
  Share2,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { setCurrentView } = useCreative();
  const [playingAudio, setPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleAudio = () => {
    setPlayingAudio(!playingAudio);
  };

  const featureCards = [
    {
      title: 'CapCut-Style Multi-Track Video Editor',
      description: 'Layer videos, B-roll overlays, animated typography, sound FX, and transitions with frame-accurate timeline snapping.',
      view: 'editor' as const,
      icon: Video,
      badge: 'Interactive',
    },
    {
      title: 'AI Music Studio (Suno v4 & Udio)',
      description: 'Record your own voice, generate singing vocals, upload your audio stems, or synthesize pure instrumental Afrobeats & beats.',
      view: 'music_studio' as const,
      icon: Music,
      badge: '4 Creation Modes',
    },
    {
      title: 'AI Music Video Studio',
      description: 'Transform any song into a multi-scene cinematic music video with lyrical visualizer, performance cuts, and beat sync.',
      view: 'music_video_studio' as const,
      icon: Film,
      badge: '10 Modes',
    },
    {
      title: 'AI Video Generator (Veo 2 & Kling)',
      description: 'Text-to-video, image-to-video, reference camera motions, and 4K widescreen cinematic simulations.',
      view: 'video_generator' as const,
      icon: Sparkles,
      badge: 'Veo 2 + Kling',
    },
    {
      title: 'AI Image Studio (FLUX.1 & Midjourney)',
      description: 'Ultra-realistic photography, high-fashion editorial portraits, album covers, and instant export to video timeline.',
      view: 'image_studio' as const,
      icon: Image,
      badge: 'FLUX.1 Pro',
    },
    {
      title: 'AI Voice Studio & Speech Engine',
      description: 'Voiceover narration, live mic recordings, Whisper Large v3 subtitle generation, and authorized voice profiling.',
      view: 'voice_studio' as const,
      icon: Mic,
      badge: 'Whisper + ElevenLabs',
    },
  ];

  const faqs = [
    {
      q: 'How does EDITFLOW AI integrate with KIE models?',
      a: 'EDITFLOW AI features an official KIE Model Discovery Engine. It verifies supported models across Suno v4, Veo 2, Kling 1.5 Pro, Wan 2.1, FLUX.1 Pro, and ElevenLabs. If you configure KIE_API_KEY, requests dispatch directly to official task endpoints (POST /api/v1/jobs/createTask), while also providing a built-in interactive synthesis engine.',
    },
    {
      q: 'Can I record my own voice and sing on tracks?',
      a: 'Yes! The AI Music Studio includes a dedicated "MY VOICE" tab with real browser microphone recording, live audio spectrum analyzer, trimming, and export. You can also generate AI vocals or upload audio stems in MP3, WAV, and FLAC.',
    },
    {
      q: 'How does the CapCut-style video editor work?',
      a: 'Our video editor runs directly in your browser using HTML5 Canvas and the Web Audio API. You can arrange multiple video tracks, text overlays, sound effects, and transitions, trim or split clips at the playhead, and export real downloadable videos.',
    },
    {
      q: 'What genres are supported in the Music Studio?',
      a: 'Over 50 genres including Afrobeats, Amapiano, Afro-fusion, Highlife, Hip-hop, Trap, Drill, Pop, EDM, Deep House, Gospel, Worship, Cinematic, Jazz, Latin, and Lo-fi.',
    },
    {
      q: 'Can I export finished creations without watermarks?',
      a: 'Yes, Pro and Business plans include full commercial licenses, 1080p and 4K exports, priority GPU task queues, and unlimited timeline tracks.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden border-b border-[#161F30]">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-purple-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-[350px] h-[350px] bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-[1380px] mx-auto text-center relative z-10">
          {/* Tagline kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121826] border border-[#232F42] text-xs font-semibold text-slate-300 mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Create. Edit. Inspire.</span>
            <span className="text-slate-500">·</span>
            <span className="text-purple-400">All-in-One Creative Production Suite</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12] mb-6">
            Your Imagination.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              One AI Creative Studio.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Create professional music, stunning videos, beautiful images, and cinematic experiences with the unified power of artificial intelligence and a professional multi-track timeline editor.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={() => setCurrentView('editor')}
              className="px-8 py-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-xl shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
            >
              <span>Start Creating Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView('music_studio')}
              className="px-7 py-4 rounded-xl text-sm font-semibold text-slate-200 bg-[#121826] hover:bg-[#1A2234] border border-[#232F44] transition-all hover:border-slate-500 flex items-center gap-2.5"
            >
              <Music className="w-4 h-4 text-purple-400" />
              <span>Explore AI Music Studio</span>
            </button>
            <button
              onClick={() => setCurrentView('models')}
              className="px-6 py-4 rounded-xl text-sm font-semibold text-slate-300 bg-[#0E1420] hover:bg-[#161E30] border border-[#1E283C] transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Explore KIE Models</span>
            </button>
          </div>

          {/* Workspace Hero Preview Card */}
          <div className="relative mx-auto max-w-6xl rounded-2xl p-2.5 bg-gradient-to-b from-[#2A364E] via-[#161E2E] to-[#0D121C] border border-[#2E3C56] shadow-2xl shadow-purple-950/40">
            <div className="relative rounded-xl overflow-hidden bg-[#0A0D15] border border-[#1E273A] aspect-[16/9] group">
              <img
                src="/src/assets/images/editflow_hero_creative_workspace_1794165722264.jpg"
                alt="EDITFLOW AI Studio Workspace Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-transparent to-black/20" />

              {/* Overlay preview badges */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#090C14]/85 backdrop-blur-md border border-[#222E42]">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Pro Multi-Track Timeline Engine</span>
                      <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800/50 px-2 py-0.5 rounded">
                        4K 60FPS
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      CapCut-style splitting, keyframe audio ducking, text animations, and real-time canvas preview
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView('editor')}
                  className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Live Video Editor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured AI Music & Audio Stems Showcase */}
      <section className="py-20 px-6 max-w-[1380px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-semibold text-purple-400 tracking-wider uppercase mb-2">
              Acoustic & AI Vocals
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              AI Music Studio with Real Voice Recording
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Choose from 4 creation options: record your own voice, generate songs with AI vocals, upload your audio, or synthesize instrumental Afrobeats, Amapiano, and cinematic scores.
          </p>
        </div>

        {/* Music Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 rounded-2xl bg-[#0D121D] border border-[#1E293D]">
          <div className="lg:col-span-5 relative rounded-xl overflow-hidden aspect-[4/3] border border-[#232F46]">
            <img
              src="/src/assets/images/music_studio_showcase_1794165722896.jpg"
              alt="Music Studio Recording Booth"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-200">
              Microphone & Vocal Booth
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-md">
                Suno v4 Studio Engine
              </span>
              <span className="text-xs text-slate-400">Afrobeats / Amapiano Fusion · 112 BPM</span>
            </div>

            <h3 className="text-2xl font-bold text-white">
              "Lagos Sunset Highlife" – AI Vocals + Log Drums
            </h3>

            {/* Interactive Music Player Card */}
            <div className="p-4 rounded-xl bg-[#080B12] border border-[#192233] space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-200">Main Mix & Vocal Stem</span>
                <span className="font-mono">01:14 / 03:20</span>
              </div>

              {/* Simulated Waveform scrub */}
              <div className="h-10 flex items-center gap-1 cursor-pointer" onClick={() => setAudioProgress((p) => (p + 15) % 100)}>
                {Array.from({ length: 48 }).map((_, i) => {
                  const height = Math.sin(i * 0.4) * 20 + 24;
                  const isPlayed = (i / 48) * 100 <= audioProgress;
                  return (
                    <div
                      key={i}
                      style={{ height: `${height}px` }}
                      className={`flex-1 rounded-full transition-colors ${
                        isPlayed ? 'bg-gradient-to-t from-purple-500 to-cyan-400' : 'bg-[#1E293B]'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAudio}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center text-white hover:scale-105 transition-transform"
                  >
                    {playingAudio ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>
                  <span className="text-xs text-slate-300">
                    {playingAudio ? 'Playing preview stream...' : 'Click to preview track'}
                  </span>
                </div>
                <button
                  onClick={() => setCurrentView('music_studio')}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  <span>Open in Music Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4 creation modes bullet highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-[#111724] border border-[#1E273A]">
                <div className="text-xs font-bold text-slate-200 mb-1">1. MY VOICE</div>
                <div className="text-[11px] text-slate-400">Live microphone recording & custom vocal conditioning.</div>
              </div>
              <div className="p-3 rounded-lg bg-[#111724] border border-[#1E273A]">
                <div className="text-xs font-bold text-slate-200 mb-1">2. AI VOICE</div>
                <div className="text-[11px] text-slate-400">Singing, rap, emotional choir in any language.</div>
              </div>
              <div className="p-3 rounded-lg bg-[#111724] border border-[#1E273A]">
                <div className="text-xs font-bold text-slate-200 mb-1">3. UPLOAD MUSIC</div>
                <div className="text-[11px] text-slate-400">Bring your own MP3/WAV, trim & add to timeline.</div>
              </div>
              <div className="p-3 rounded-lg bg-[#111724] border border-[#1E273A]">
                <div className="text-xs font-bold text-slate-200 mb-1">4. INSTRUMENTAL</div>
                <div className="text-[11px] text-slate-400">Afrobeats, Amapiano, Lo-fi, EDM, and film scores.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic Music Video & Visual Art Showcase */}
      <section className="py-20 px-6 bg-[#090D15] border-y border-[#161F30]">
        <div className="max-w-[1380px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-2">
              Visual Production
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              AI Music Videos & Photorealistic Art
            </h2>
            <p className="text-slate-400 text-sm">
              Generate 10 music video modes: cinematic storytelling, singer performances, animated cartoons, or sound-reactive visualizers with full character consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Music video frame showcase */}
            <div className="rounded-2xl overflow-hidden bg-[#0D121D] border border-[#1F2B40] group">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src="/src/assets/images/ai_music_video_cinematic_1794165723863.jpg"
                  alt="Cinematic AI Music Video Scene"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/70 backdrop-blur-md text-xs font-medium text-slate-200 border border-white/10">
                  Veo 2 & Kling 1.5 Pro
                </div>
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Cinematic Music Video Director</div>
                    <div className="text-[11px] text-slate-400">Golden hour anamorphic lighting, dance choreography</div>
                  </div>
                  <button
                    onClick={() => setCurrentView('music_video_studio')}
                    className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                  >
                    Create Video
                  </button>
                </div>
              </div>
            </div>

            {/* High-fashion image studio showcase */}
            <div className="rounded-2xl overflow-hidden bg-[#0D121D] border border-[#1F2B40] group">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src="/src/assets/images/ai_image_art_showcase_1794165721878.jpg"
                  alt="FLUX.1 Pro Art Showcase"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/70 backdrop-blur-md text-xs font-medium text-slate-200 border border-white/10">
                  FLUX.1 Pro & Midjourney
                </div>
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">AI Image Studio & Album Covers</div>
                    <div className="text-[11px] text-slate-400">Iridescent metallic textures, editorial studio lighting</div>
                  </div>
                  <button
                    onClick={() => setCurrentView('image_studio')}
                    className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                  >
                    Generate Art
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 max-w-[1380px] mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold text-purple-400 tracking-wider uppercase mb-2">
            Complete Toolkit
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Everything You Need in One Unified Platform
          </h2>
          <p className="text-sm text-slate-400">
            Say goodbye to jumping between 5 different subscriptions. Generate audio, video, voices, and graphics, and edit them in one timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-2xl bg-[#0D121E] border border-[#1E293F] hover:border-purple-500/40 transition-all hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-800/40 px-2 py-0.5 rounded">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>

                <button
                  onClick={() => setCurrentView(feat.view)}
                  className="w-full py-2.5 rounded-lg bg-[#141B2B] hover:bg-purple-600 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-6 bg-[#080B12] border-t border-[#161F30]">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="text-xs font-semibold text-purple-400 tracking-wider uppercase mb-2">
            Transparent Creative Plans
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Simple Pricing for Creators and Studios
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-14">
            Pay with Paystack or Stripe. Start free with 100 bonus credits, upgrade whenever you need high-resolution renders and priority GPUs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Free */}
            <div className="p-6 rounded-2xl bg-[#0D121D] border border-[#1E293D] flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-slate-300 mb-1">Free Starter</div>
                <div className="text-2xl font-black text-white mb-4">
                  $0 <span className="text-xs font-normal text-slate-400">/ forever</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">Explore AI generation and basic multi-track video editing.</p>
                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>100 Free AI Credits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Multi-track Video Editor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Voice Recording & AI Lyrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>720p Video Exports</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setCurrentView('editor')}
                className="w-full py-2.5 rounded-lg bg-[#161E2E] hover:bg-[#202B3E] text-xs font-semibold text-white transition-colors"
              >
                Start Free
              </button>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1E1A38] to-[#0E1322] border-2 border-purple-500/50 relative flex flex-col justify-between shadow-xl shadow-purple-950/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 text-[10px] font-extrabold text-white tracking-wider uppercase">
                Most Popular
              </div>
              <div>
                <div className="text-sm font-bold text-purple-300 mb-1">Creator Pro</div>
                <div className="text-3xl font-black text-white mb-4">
                  $29 <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-300 mb-6">For content creators, indie musicians, and video editors.</p>
                <ul className="space-y-2.5 text-xs text-slate-200 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="font-semibold text-white">1,000 AI Credits / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>1080p & 4K 60FPS Video Export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Suno v4, Veo 2 & Kling 1.5 Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Authorized AI Voice Cloning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Commercial Usage Rights</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setCurrentView('pricing')}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Business */}
            <div className="p-6 rounded-2xl bg-[#0D121D] border border-[#1E293D] flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-slate-300 mb-1">Studio Business</div>
                <div className="text-2xl font-black text-white mb-4">
                  $79 <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">For agencies, media labels, and professional production teams.</p>
                <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-white">5,000 AI Credits / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Team Collaboration & Shared Assets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Unlimited Cloud Storage (100 GB)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Direct KIE API Webhook Pipelines</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setCurrentView('pricing')}
                className="w-full py-2.5 rounded-lg bg-[#161E2E] hover:bg-[#202B3E] text-xs font-semibold text-white transition-colors"
              >
                Contact Business
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 px-6 max-w-[960px] mx-auto w-full">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold text-purple-400 tracking-wider uppercase mb-2">
            Got Questions?
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#0D121D] border border-[#1E293D] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-purple-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-purple-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-[#182132] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#161F30] bg-[#06080D] py-12 px-6 mt-auto">
        <div className="max-w-[1380px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#090C14] rounded-[3px] flex items-center justify-center font-bold text-xs text-purple-400">
                EF
              </div>
            </div>
            <span className="text-sm font-bold text-white">
              EDITFLOW <span className="text-purple-400">AI</span>
            </span>
            <span className="text-xs text-slate-500">· Create. Edit. Inspire.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button onClick={() => setCurrentView('editor')} className="hover:text-white transition-colors">
              Video Editor
            </button>
            <button onClick={() => setCurrentView('music_studio')} className="hover:text-white transition-colors">
              Music Studio
            </button>
            <button onClick={() => setCurrentView('models')} className="hover:text-white transition-colors">
              KIE Models
            </button>
            <button onClick={() => setCurrentView('pricing')} className="hover:text-white transition-colors">
              Pricing
            </button>
            <button onClick={() => setCurrentView('settings')} className="hover:text-white transition-colors">
              Documentation
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            © 2026 EDITFLOW AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
