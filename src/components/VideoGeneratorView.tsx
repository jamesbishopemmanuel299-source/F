import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import {
  Sparkles,
  Video,
  Camera,
  Layers,
  Wand2,
  Sliders,
  Move,
  Clock,
  ArrowRight,
  Plus,
  Mic,
} from 'lucide-react';

export const VideoGeneratorView: React.FC = () => {
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

  const [mode, setMode] = useState<'text_to_video' | 'image_to_video'>('text_to_video');
  const [modelId, setModelId] = useState('veo-2');
  const [prompt, setPrompt] = useState(
    'Cinematic tracking shot of an African luxury sports car speeding along the coastal highway at sunset, anamorphic lens flares, realistic tire smoke and motion blur, 4K film quality'
  );
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState(6);
  const [cameraMotion, setCameraMotion] = useState('Dolly Forward');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    setIsEnhancing(true);
    const enhanced = await enhancePrompt(prompt, 'video');
    setPrompt(enhanced);
    setIsEnhancing(false);
  };

  const handleGenerate = async () => {
    await createTask('video', modelId, prompt, {
      aspectRatio,
      duration,
      cameraMotion,
      mode,
    });
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1380px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182133] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/40 text-[11px] font-semibold text-purple-300 mb-2">
            <span>Google Veo 2 · Kling 1.5 Pro · Wan 2.1 · Runway Gen-3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Video Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate high-fidelity cinematic video footage, camera dollies, and motion scenes from text descriptions.
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

      {/* Mode Switcher */}
      <div className="flex gap-3">
        <button
          onClick={() => setMode('text_to_video')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mode === 'text_to_video'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-[#121826] text-slate-400 hover:text-slate-200 border border-[#212C42]'
          }`}
        >
          Text to Video
        </button>
        <button
          onClick={() => setMode('image_to_video')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mode === 'image_to_video'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-[#121826] text-slate-400 hover:text-slate-200 border border-[#212C42]'
          }`}
        >
          Image to Video
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prompt Box & Visual Preview */}
        <div className="lg:col-span-8 space-y-5">
          <div className="p-5 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-purple-400" />
                <span>Video Scene Prompt</span>
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
              placeholder="Describe camera movement, lighting, subject action, environment..."
              className="w-full bg-[#080B12] border border-[#1F2B40] text-sm text-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
            />

            {/* Generated scene showcase */}
            <div className="relative rounded-xl overflow-hidden aspect-[16/9] border border-[#232F46] group">
              <img
                src="/src/assets/images/ai_music_video_cinematic_1794165723863.jpg"
                alt="Veo 2 Scene"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-800/40">
                Veo 2 Cinematic Simulation · 4K 60FPS
              </div>
              <div className="absolute bottom-3 right-3">
                <button
                  onClick={() => {
                    const videoTrack = activeProject.tracks.find((t) => t.type === 'video');
                    if (videoTrack) {
                      addClipToTrack(videoTrack.id, {
                        title: 'Generated Cinematic Scene',
                        src: '/src/assets/images/ai_music_video_cinematic_1794165723863.jpg',
                        type: 'image',
                        duration: 8,
                      });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Send to Editor Timeline</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Parameters & Controls */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
            <div className="text-xs font-bold text-white">Generation Parameters</div>

            {/* Model Selector */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Video Engine</label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2.5 focus:outline-none"
              >
                <option value="veo-2">Google Veo 2 (25 Credits) - Ultra Quality</option>
                <option value="kling-v1.5-pro">Kling 1.5 Pro (20 Credits) - Physics & Motion</option>
                <option value="wan-2.1-t2v">Wan 2.1 Video Engine (14 Credits) - Fast</option>
                <option value="hailuo-minimax">Hailuo MiniMax (18 Credits) - Human Realism</option>
                <option value="runway-gen3-alpha">Runway Gen-3 Alpha (22 Credits) - VFX</option>
              </select>
            </div>

            {/* Camera Motion */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Camera Dynamics</label>
              <select
                value={cameraMotion}
                onChange={(e) => setCameraMotion(e.target.value)}
                className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2.5 focus:outline-none"
              >
                <option value="Dolly Forward">Dolly Forward</option>
                <option value="Pan Left to Right">Pan Left to Right</option>
                <option value="Crane Tilt Up">Crane Tilt Up</option>
                <option value="Orbit 360">Orbit 360</option>
                <option value="FPV Drone Fly-Through">FPV Drone Fly-Through</option>
                <option value="Static Tripod">Static Tripod</option>
              </select>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {['16:9', '9:16', '1:1'].map((r) => (
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

            {/* Duration Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Duration</span>
                <span className="font-mono text-cyan-400 font-bold">{duration}s</span>
              </div>
              <input
                type="range"
                min="4"
                max="10"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleGenerate}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Video Clip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
