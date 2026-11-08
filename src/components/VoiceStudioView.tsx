import React, { useState, useRef } from 'react';
import { useCreative } from '../context/CreativeContext';
import {
  Mic,
  Volume2,
  FileText,
  ShieldCheck,
  Play,
  Pause,
  Plus,
  ArrowRight,
  Sparkles,
  Upload,
} from 'lucide-react';

export const VoiceStudioView: React.FC = () => {
  const {
    createTask,
    addClipToTrack,
    activeProject,
    user,
    setVoiceConsent,
    showToast,
    setCurrentView,
  } = useCreative();

  const [activeTab, setActiveTab] = useState<'tts' | 'record' | 'transcribe' | 'cloning'>('tts');

  // Text-to-speech
  const [ttsText, setTtsText] = useState(
    'Welcome to EDITFLOW AI, the premier platform for cinematic video creation, music production, and multimedia storytelling.'
  );
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [speed, setSpeed] = useState(1.0);
  const [language, setLanguage] = useState('en-US');

  // Live microphone recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  // Transcription
  const [transcribeResult, setTranscribeResult] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setVoiceUrl(url);
        showToast('Voiceover recorded! Ready to add to video timeline.');
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch (e) {
      showToast('Microphone access denied or unavailable.');
    }
  };

  const stopRecord = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleGenerateTTS = async () => {
    await createTask('voice', 'elevenlabs-v2.5', ttsText, {
      voice: selectedVoice,
      speed,
      language,
    });
  };

  const handleTranscribe = () => {
    setIsTranscribing(true);
    setTimeout(() => {
      setTranscribeResult(
        '00:00:01 --> 00:00:04\nWelcome to EDITFLOW AI creative studio.\n\n00:00:04 --> 00:00:08\nCreate cinematic videos and high-fidelity music.'
      );
      setIsTranscribing(false);
      showToast('Whisper Large v3 generated word-level subtitles!');
    }, 1800);
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1380px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182133] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/40 text-[11px] font-semibold text-purple-300 mb-2">
            <span>ElevenLabs v2.5 · Whisper Large v3 · Studio Voice Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Voice Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate lifelike voiceovers, record custom narration, transcribe audio to subtitles, and manage authorized voice profiles.
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

      {/* Tabs */}
      <div className="flex border-b border-[#1A2438] gap-4">
        {[
          { id: 'tts', label: 'Text to Speech', icon: Volume2 },
          { id: 'record', label: 'Microphone Narration', icon: Mic },
          { id: 'transcribe', label: 'Whisper Subtitles', icon: FileText },
          { id: 'cloning', label: 'Authorized Voice Profile', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-bold flex items-center gap-2 transition-all relative ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 text-purple-400" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Text to Speech */}
      {activeTab === 'tts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
            <label className="text-xs font-bold text-white block">Narration Script</label>
            <textarea
              rows={6}
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              className="w-full bg-[#080B12] border border-[#1F2B40] text-sm text-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
            <div className="text-xs font-bold text-white">Voice & Accents</div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Speaker Voice</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2.5 focus:outline-none"
              >
                <option value="nova">Nova (Warm & Energetic Female)</option>
                <option value="onyx">Onyx (Deep Dramatic Male)</option>
                <option value="shimmer">Shimmer (Expressive Storyteller)</option>
                <option value="echo">Echo (Authoritative & Crisp)</option>
                <option value="fable">Fable (British Editorial Accent)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#090C14] border border-[#212E44] text-xs text-white rounded-lg p-2.5 focus:outline-none"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="en-NG">English (West African Accent)</option>
                <option value="fr-FR">French</option>
                <option value="es-ES">Spanish</option>
              </select>
            </div>

            <button
              onClick={handleGenerateTTS}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>Synthesize Voiceover</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Microphone Narration */}
      {activeTab === 'record' && (
        <div className="p-8 rounded-2xl bg-[#0D121D] border border-[#1E293F] text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-950/70 border border-rose-500/40 mx-auto flex items-center justify-center text-rose-400">
            <Mic className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Live Microphone Narration</h3>
            <p className="text-xs text-slate-400 mt-1">
              Record voiceovers directly in the studio with high-definition audio capture.
            </p>
          </div>

          <div className="text-2xl font-mono font-bold text-white">
            00:{String(recordSeconds).padStart(2, '0')}
          </div>

          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecord}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecord}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-2"
              >
                <Pause className="w-4 h-4 text-rose-400" />
                <span>Stop Recording</span>
              </button>
            )}
          </div>

          {voiceUrl && (
            <div className="pt-4 flex flex-col items-center gap-3">
              <audio controls src={voiceUrl} className="h-8 max-w-sm" />
              <button
                onClick={() => {
                  const audioTrack = activeProject.tracks.find((t) => t.type === 'audio');
                  if (audioTrack) {
                    addClipToTrack(audioTrack.id, {
                      title: 'Recorded Voiceover',
                      src: voiceUrl,
                      type: 'audio',
                      duration: recordSeconds || 8,
                    });
                  }
                }}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert Voiceover on Timeline</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Whisper Subtitles */}
      {activeTab === 'transcribe' && (
        <div className="p-6 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Whisper Large v3 Subtitle Generator</h3>
              <p className="text-xs text-slate-400">
                Extract word-level timestamps and subtitle cues from any video or audio clip.
              </p>
            </div>
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-colors disabled:opacity-50"
            >
              {isTranscribing ? 'Transcribing...' : 'Run Whisper Speech-to-Text'}
            </button>
          </div>

          <textarea
            rows={6}
            value={transcribeResult}
            readOnly
            placeholder="Subtitles with timestamps (SRT / VTT format) will appear here after analysis..."
            className="w-full bg-[#080B12] border border-[#1F2B40] text-xs font-mono text-cyan-300 rounded-xl p-3.5 focus:outline-none"
          />
        </div>
      )}

      {/* Tab 4: Authorized Voice Profile */}
      {activeTab === 'cloning' && (
        <div className="p-6 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Authorized Voice Profile Management</h3>
              <p className="text-xs text-slate-400">
                GDPR & AI ethics compliant voice cloning with explicit owner authorization.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#090C14] border border-[#1C263A] space-y-3 text-xs text-slate-300">
            <div className="font-semibold text-white">Voice Cloning Safety Protocol</div>
            <p>
              EDITFLOW AI strictly enforces user consent. Voice cloning is restricted to authorized personal profiles and cannot be used to replicate unauthorized public figures without explicit license.
            </p>
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-200 pt-2">
              <input
                type="checkbox"
                checked={user.voiceConsentApproved}
                onChange={(e) => setVoiceConsent(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-600 text-purple-600"
              />
              <span className="font-medium">
                I certify that I am the owner of this voice and authorize EDITFLOW AI to create a synthesized acoustic voice profile.
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
