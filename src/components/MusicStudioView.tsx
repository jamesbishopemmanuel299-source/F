import React, { useState, useRef, useEffect } from 'react';
import { useCreative } from '../context/CreativeContext';
import {
  Mic,
  Music,
  Upload,
  Radio,
  Play,
  Pause,
  Sparkles,
  Sliders,
  Wand2,
  Volume2,
  Check,
  Disc,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';

export const MusicStudioView: React.FC = () => {
  const {
    createTask,
    enhancePrompt,
    generateLyrics,
    startVoicePromptInput,
    stopVoicePromptInput,
    isListeningSpeech,
    addClipToTrack,
    activeProject,
    setCurrentView,
    showToast,
    user,
    setVoiceConsent,
  } = useCreative();

  // 4 Primary Modes
  const [activeMode, setActiveMode] = useState<'my_voice' | 'ai_voice' | 'upload_music' | 'instrumental'>('ai_voice');

  // Generation options
  const [prompt, setPrompt] = useState('An uplifting Afrobeats groove with energetic log drums, electric guitar hooks, and smooth melodic singing');
  const [genre, setGenre] = useState('Afrobeats');
  const [subgenre, setSubgenre] = useState('Amapiano Fusion');
  const [mood, setMood] = useState('Energetic');
  const [tempo, setTempo] = useState(115);
  const [vocalGender, setVocalGender] = useState<'female' | 'male' | 'duet' | 'choir'>('female');
  const [vocalStyle, setVocalStyle] = useState('Melodic Singing');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [lyricsTopic, setLyricsTopic] = useState('Success and celebrating love in the city');
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('suno-v4');

  // Microphone recording state for "MY VOICE"
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Uploaded music state for "UPLOAD MUSIC"
  const [uploadedAudioName, setUploadedAudioName] = useState<string | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);

  // Voice recording logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedBlob(audioBlob);
        setRecordedAudioUrl(url);
        showToast('Voice recording completed! Ready to preview or condition AI track.');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecordingMic(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      showToast('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingMic) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecordingMic(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedAudioName(file.name);
      setUploadedAudioUrl(url);
      showToast(`Uploaded ${file.name} successfully!`);
    }
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    const enhanced = await enhancePrompt(prompt, 'music');
    setPrompt(enhanced);
    setIsEnhancing(false);
  };

  const handleGenerateLyrics = async () => {
    setIsGeneratingLyrics(true);
    const result = await generateLyrics(lyricsTopic, genre, mood);
    if (result.lyrics) {
      setLyrics(result.lyrics);
    }
    setIsGeneratingLyrics(false);
  };

  const handleGenerateMusic = async () => {
    const task = await createTask('music', selectedModel, prompt, {
      lyrics,
      genre: `${genre} (${subgenre})`,
      mood,
      tempo,
      instrumental: isInstrumental || activeMode === 'instrumental',
      vocalGender,
      vocalStyle,
      sourceMode: activeMode,
      recordedAudioUrl: recordedAudioUrl,
    });
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1380px] mx-auto w-full">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182133] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/40 text-[11px] font-semibold text-purple-300 mb-2">
            <span>Suno v4 · Udio 1.5 · MusicGen</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Music Production Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Produce full radio-ready songs, record your own singing vocals, or create custom instrumental Afrobeats & Amapiano.
          </p>
        </div>

        {/* Send to Video Editor quick shortcut */}
        <button
          onClick={() => setCurrentView('editor')}
          className="px-4 py-2 rounded-xl bg-[#121826] hover:bg-[#1A2336] border border-[#232F46] text-xs font-semibold text-slate-200 flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <span>Open Video Editor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 PROMINENT CREATION TABS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            id: 'my_voice',
            label: '1. MY VOICE',
            desc: 'Mic recording & vocal conditioning',
            icon: Mic,
            color: 'from-purple-600 to-indigo-600',
          },
          {
            id: 'ai_voice',
            label: '2. AI VOICE',
            desc: 'Singing, rap & choral vocals',
            icon: Radio,
            color: 'from-indigo-600 to-cyan-600',
          },
          {
            id: 'upload_music',
            label: '3. UPLOAD MUSIC',
            desc: 'MP3/WAV stems & remixing',
            icon: Upload,
            color: 'from-cyan-600 to-teal-600',
          },
          {
            id: 'instrumental',
            label: '4. INSTRUMENTAL',
            desc: 'Beats, Afrobeats & film scores',
            icon: Music,
            color: 'from-amber-600 to-orange-600',
          },
        ].map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id as any);
                if (mode.id === 'instrumental') setIsInstrumental(true);
                else setIsInstrumental(false);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-gradient-to-b from-[#1E1736] to-[#0E1322] border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50'
                  : 'bg-[#0D121D] border-[#1C263A] hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${mode.color} flex items-center justify-center text-white`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white tracking-tight">{mode.label}</span>
              </div>
              <p className="text-[11px] text-slate-400 pl-9">{mode.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Mode-Specific Sub-Panel */}
      {activeMode === 'my_voice' && (
        <div className="p-6 rounded-2xl bg-[#0D121D] border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-400" />
                <span>Microphone Vocal Recording</span>
              </h3>
              <p className="text-xs text-slate-400">
                Record your singing or spoken lyrics to use as a master vocal track or condition compatible AI music models.
              </p>
            </div>
            {isRecordingMic && (
              <span className="flex items-center gap-2 text-xs font-mono text-rose-400 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                RECORDING {recordingSeconds}s
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {!isRecordingMic ? (
              <button
                onClick={startRecording}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-900/30 flex items-center gap-2 transition-transform active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>Start Microphone Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-2"
              >
                <Pause className="w-4 h-4 text-rose-400" />
                <span>Stop Recording ({recordingSeconds}s)</span>
              </button>
            )}

            {recordedAudioUrl && (
              <div className="flex items-center gap-3 p-2 bg-[#090C14] rounded-xl border border-[#202C42]">
                <audio controls src={recordedAudioUrl} className="h-8 max-w-xs" />
                <button
                  onClick={() => {
                    const audioTrack = activeProject.tracks.find((t) => t.type === 'audio');
                    if (audioTrack) {
                      addClipToTrack(audioTrack.id, {
                        title: 'Vocal Recording (My Voice)',
                        src: recordedAudioUrl,
                        type: 'audio',
                        duration: recordingSeconds || 8,
                      });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-[11px] font-semibold text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Video Timeline</span>
                </button>
              </div>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="p-3.5 rounded-xl bg-[#090C14] border border-[#192233] flex items-center justify-between text-xs">
            <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={user.voiceConsentApproved}
                onChange={(e) => setVoiceConsent(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 accent-purple-600"
              />
              <span>
                I consent to authorized voice feature extraction for AI music conditioning.
              </span>
            </label>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      )}

      {activeMode === 'upload_music' && (
        <div className="p-6 rounded-2xl bg-[#0D121D] border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Audio Stems & Songs</span>
              </h3>
              <p className="text-xs text-slate-400">
                Supports MP3, WAV, M4A, FLAC. Trim, split, remix, or add directly to the timeline.
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-[#232F46] rounded-xl p-8 text-center space-y-3 bg-[#090C14]">
            <Upload className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-xs font-semibold text-white">
              {uploadedAudioName ? uploadedAudioName : 'Click to select audio or drag and drop here'}
            </div>
            <p className="text-[11px] text-slate-500">MP3, WAV, FLAC up to 50MB</p>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="audio_file_picker"
            />
            <label
              htmlFor="audio_file_picker"
              className="inline-block px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white cursor-pointer"
            >
              Select File
            </label>

            {uploadedAudioUrl && (
              <div className="pt-4 flex items-center justify-center gap-3">
                <audio controls src={uploadedAudioUrl} className="h-8 max-w-sm" />
                <button
                  onClick={() => {
                    const audioTrack = activeProject.tracks.find((t) => t.type === 'audio');
                    if (audioTrack) {
                      addClipToTrack(audioTrack.id, {
                        title: uploadedAudioName || 'Uploaded Audio',
                        src: uploadedAudioUrl,
                        type: 'audio',
                        duration: 30,
                      });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-[11px] font-semibold text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Video Timeline</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prompts, Lyrics, Enhancer */}
        <div className="lg:col-span-8 space-y-5">
          {/* Prompt Box */}
          <div className="p-5 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Disc className="w-4 h-4 text-purple-400" />
                <span>Music Style & Composition Prompt</span>
              </label>

              <div className="flex items-center gap-2">
                {/* Voice-to-Prompt Button */}
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
                  title="Speak your prompt using voice recognition"
                >
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isListeningSpeech ? 'Listening...' : 'Voice Input'}</span>
                </button>

                {/* AI Prompt Enhancer */}
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing}
                  className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Enhance prompt with studio acoustics, BPM & mixing"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEnhancing ? 'Enhancing...' : 'AI Enhance'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your musical vision (e.g. Afrobeats groove with heavy log drums, saxophone solo, and smooth female vocals)..."
              className="w-full bg-[#080B12] border border-[#1F2B40] text-sm text-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* AI Songwriter & Lyrics Assistant */}
          {activeMode !== 'instrumental' && (
            <div className="p-5 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-cyan-400" />
                    <span>AI Songwriting & Lyrics Studio</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Generate structured lyrics with Verse, Chorus, Bridge, and Outro tags.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={lyricsTopic}
                    onChange={(e) => setLyricsTopic(e.target.value)}
                    placeholder="Theme or topic..."
                    className="bg-[#080B12] border border-[#1F2B40] text-xs text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none max-w-xs"
                  />
                  <button
                    onClick={handleGenerateLyrics}
                    disabled={isGeneratingLyrics}
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isGeneratingLyrics ? 'Writing...' : 'Write Lyrics'}
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="[Verse 1]&#10;Midnight city lights, dreaming wide awake...&#10;&#10;[Chorus]&#10;We keep on rising, never looking back..."
                className="w-full bg-[#080B12] border border-[#1F2B40] text-xs font-mono text-slate-300 rounded-xl p-3 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}
        </div>

        {/* Right Column: Musical Parameters, Genres & Generator Trigger */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
            <div className="text-xs font-bold text-white">Music Customization</div>

            {/* Model Selector */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">AI Engine Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2.5 focus:outline-none"
              >
                <option value="suno-v4">Suno v4 Studio (12 Credits)</option>
                <option value="suno-v3.5">Suno v3.5 Fast (8 Credits)</option>
                <option value="udio-1.5">Udio 1.5 Pro (15 Credits)</option>
                <option value="musicgen-large">MusicGen AudioCraft (6 Credits)</option>
              </select>
            </div>

            {/* Genre & Subgenre */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Main Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2 focus:outline-none"
                >
                  <option value="Afrobeats">Afrobeats</option>
                  <option value="Amapiano">Amapiano</option>
                  <option value="Hip-Hop">Hip-Hop / Rap</option>
                  <option value="Pop">Pop</option>
                  <option value="Gospel">Gospel / Worship</option>
                  <option value="R&B">R&B / Soul</option>
                  <option value="EDM">EDM / House</option>
                  <option value="Cinematic">Cinematic</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Mood</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2 focus:outline-none"
                >
                  <option value="Energetic">Energetic</option>
                  <option value="Inspirational">Inspirational</option>
                  <option value="Emotional">Emotional</option>
                  <option value="Romantic">Romantic</option>
                  <option value="Dark">Dark & Moody</option>
                  <option value="Epic">Epic</option>
                </select>
              </div>
            </div>

            {/* Vocal Style & Gender */}
            {activeMode !== 'instrumental' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Vocal Gender</label>
                  <select
                    value={vocalGender}
                    onChange={(e) => setVocalGender(e.target.value as any)}
                    className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2 focus:outline-none"
                  >
                    <option value="female">Female Lead</option>
                    <option value="male">Male Lead</option>
                    <option value="duet">Male & Female Duet</option>
                    <option value="choir">Choir / Ensemble</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Vocal Style</label>
                  <select
                    value={vocalStyle}
                    onChange={(e) => setVocalStyle(e.target.value)}
                    className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2 focus:outline-none"
                  >
                    <option value="Melodic Singing">Melodic Singing</option>
                    <option value="Rap & Flow">Rap & Flow</option>
                    <option value="Soulful & Raw">Soulful & Raw</option>
                    <option value="Harmonized">Harmonized</option>
                  </select>
                </div>
              </div>
            )}

            {/* Tempo Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Tempo (BPM)</span>
                <span className="font-mono text-cyan-400 font-bold">{tempo} BPM</span>
              </div>
              <input
                type="range"
                min="70"
                max="160"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Submit Generation Button */}
            <button
              onClick={handleGenerateMusic}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Music className="w-4 h-4" />
              <span>Generate Song with {selectedModel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
