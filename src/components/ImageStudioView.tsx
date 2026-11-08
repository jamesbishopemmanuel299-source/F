import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import {
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Download,
  Plus,
  ArrowRight,
  Layers,
  Wand2,
  Mic,
} from 'lucide-react';

export const ImageStudioView: React.FC = () => {
  const {
    createTask,
    enhancePrompt,
    startVoicePromptInput,
    stopVoicePromptInput,
    isListeningSpeech,
    setCurrentView,
    addClipToTrack,
    activeProject,
    showToast,
  } = useCreative();

  const [modelId, setModelId] = useState('flux-1-pro');
  const [prompt, setPrompt] = useState(
    'High-fashion avant-garde digital art portrait of an African queen, iridescent metallic and liquid chrome textures, dramatic studio rim lighting, deep charcoal background with violet highlights'
  );
  const [negativePrompt, setNegativePrompt] = useState('blurry, distorted, low resolution, bad anatomy, deformed');
  const [style, setStyle] = useState('Editorial High Fashion');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const stylePresets = [
    'Editorial High Fashion',
    'Hollywood Cinematic 35mm',
    'Afrobeats Visual Luxury',
    'Cyberpunk Neo-Tokyo',
    'Concept Digital Painting',
    'Album Cover Art',
    '3D Hyperrealistic Render',
    'Vintage 1970s Film',
  ];

  const handleEnhance = async () => {
    setIsEnhancing(true);
    const enhanced = await enhancePrompt(prompt, 'image');
    setPrompt(enhanced);
    setIsEnhancing(false);
  };

  const handleGenerate = async () => {
    await createTask('image', modelId, prompt, {
      aspectRatio,
      style,
      negativePrompt,
    });
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1380px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182133] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/40 text-[11px] font-semibold text-purple-300 mb-2">
            <span>FLUX.1 Pro · Midjourney v6.1 · Ideogram 2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Image Studio & Artwork
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate photorealistic photography, album covers, thumbnails, and concept art ready for video editing.
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prompt & Visual Preview */}
        <div className="lg:col-span-8 space-y-5">
          <div className="p-5 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>Image Description Prompt</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isListeningSpeech) stopVoicePromptInput();
                    else startVoicePromptInput((t) => setPrompt((p) => (p ? `${p} ${t}` : t)));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                    isListeningSpeech
                      ? 'bg-rose-950/70 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-[#121826] border-[#222E42] text-slate-300 hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isListeningSpeech ? 'Listening...' : 'Voice Input'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing}
                  className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEnhancing ? 'Enhancing...' : 'AI Enhance'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe subjects, textures, camera lenses, lighting, colors..."
              className="w-full bg-[#080B12] border border-[#1F2B40] text-sm text-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
            />

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Negative Prompt (Exclude)</label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full bg-[#080B12] border border-[#1F2B40] text-xs text-slate-300 rounded-lg p-2 focus:outline-none"
              />
            </div>

            {/* Generated Art Showcase */}
            <div className="relative rounded-xl overflow-hidden aspect-square max-w-md mx-auto border border-[#232F46] group">
              <img
                src="/src/assets/images/ai_image_art_showcase_1794165721878.jpg"
                alt="FLUX.1 Pro Art"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-4">
                <div className="text-xs text-slate-200">
                  <div className="font-bold text-white">FLUX.1 Pro Master Render</div>
                  <div className="text-[10px] text-slate-400">{style} · 1:1 Square</div>
                </div>

                <button
                  onClick={() => {
                    const videoTrack = activeProject.tracks.find((t) => t.type === 'video');
                    if (videoTrack) {
                      addClipToTrack(videoTrack.id, {
                        title: 'FLUX.1 Artwork Clip',
                        src: '/src/assets/images/ai_image_art_showcase_1794165721878.jpg',
                        type: 'image',
                        duration: 6,
                      });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Send to Video Editor</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Parameters & Controls */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
            <div className="text-xs font-bold text-white">Style & Parameters</div>

            {/* Model Selector */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Image Model</label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2.5 focus:outline-none"
              >
                <option value="flux-1-pro">FLUX.1 Pro (5 Credits) - Ultra Fidelity</option>
                <option value="midjourney-v6.1-kie">Midjourney v6.1 (6 Credits) - Aesthetic Art</option>
                <option value="flux-1-schnell">FLUX.1 Schnell (2 Credits) - Instant Draft</option>
                <option value="ideogram-v2">Ideogram 2.0 (4 Credits) - Posters & Fonts</option>
              </select>
            </div>

            {/* Style Preset Selector */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Visual Style Preset</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2.5 focus:outline-none"
              >
                {stylePresets.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {['1:1', '16:9', '9:16', '4:3'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAspectRatio(r)}
                    className={`py-2 rounded-lg border text-xs font-mono transition-all ${
                      aspectRatio === r
                        ? 'bg-purple-950 border-purple-500 text-white font-bold'
                        : 'bg-[#090C14] border-[#212E44] text-slate-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleGenerate}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
