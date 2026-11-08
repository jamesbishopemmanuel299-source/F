import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import { MediaAsset } from '../types';
import {
  FolderOpen,
  Search,
  Film,
  Music,
  Image as ImageIcon,
  Mic,
  Plus,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';

export const MediaLibraryView: React.FC = () => {
  const {
    mediaAssets,
    deleteMediaAsset,
    uploadMediaFile,
    uploadProgress,
    addClipToTrack,
    activeProject,
    setCurrentView,
    showToast,
  } = useCreative();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filtered = mediaAssets.filter((item) => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size check: 100MB limit
    if (file.size > 100 * 1024 * 1024) {
      showToast('File exceeds 100MB limit');
      return;
    }

    setIsUploading(true);
    try {
      await uploadMediaFile(file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1380px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182133] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/40 text-[11px] font-semibold text-purple-300 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Supabase Cloud Storage: user-media</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Media Library & Cloud Assets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access all uploaded videos, audio stems, voice recordings, and AI-generated media stored in Supabase.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          {/* Upload progress indicator */}
          {uploadProgress !== null && (
            <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/60 border border-purple-800/40 px-3 py-1.5 rounded-lg">
              <span className="animate-spin text-purple-400">⏳</span>
              <span>Uploading to Supabase: {uploadProgress}%</span>
            </div>
          )}

          <input
            type="file"
            id="media_lib_upload"
            className="hidden"
            accept="video/*,audio/*,image/*"
            disabled={isUploading}
            onChange={handleUpload}
          />
          <label
            htmlFor="media_lib_upload"
            className={`px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload to Supabase'}</span>
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Media' },
            { id: 'video', label: 'Videos' },
            { id: 'audio', label: 'Audio Stems' },
            { id: 'image', label: 'Images' },
            { id: 'recording', label: 'Voice Recordings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-[#0D121D] border border-[#1E293F] text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags or titles..."
            className="w-full bg-[#0D121D] border border-[#1E293F] text-xs text-white rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl overflow-hidden bg-[#0D121D] border border-[#1E293F] hover:border-purple-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#080B12] flex items-center justify-center">
              {item.type === 'audio' || item.type === 'recording' ? (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-2">
                    <Music className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-300 font-semibold truncate max-w-[160px]">
                    {item.name}
                  </span>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}

              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-mono uppercase text-slate-300">
                {item.type}
              </div>
            </div>

            <div className="p-3.5 space-y-2">
              <div className="text-xs font-bold text-white truncate">{item.name}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{(item.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                <span className="capitalize">{item.source.replace('_', ' ')}</span>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#182133]">
                <button
                  onClick={() => {
                    const targetTrack =
                      item.type === 'audio' || item.type === 'recording'
                        ? activeProject.tracks.find((t) => t.type === 'audio')
                        : activeProject.tracks.find((t) => t.type === 'video');
                    if (targetTrack) {
                      addClipToTrack(targetTrack.id, {
                        title: item.name,
                        src: item.url,
                        type: item.type === 'audio' ? 'audio' : 'image',
                        duration: item.duration || 6,
                      });
                      setCurrentView('editor');
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add to Timeline</span>
                </button>

                <button
                  onClick={() => deleteMediaAsset(item.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
