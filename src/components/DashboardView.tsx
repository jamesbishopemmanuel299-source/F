import React from 'react';
import { useCreative } from '../context/CreativeContext';
import {
  Video,
  Music,
  Film,
  Sparkles,
  Image,
  Mic,
  FolderPlus,
  Play,
  ArrowRight,
  Coins,
  Cpu,
  Clock,
  CheckCircle,
  HardDrive,
  Trash2,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    user,
    projects,
    tasks,
    mediaAssets,
    setCurrentView,
    createNewProject,
    loadProject,
    deleteProject,
    models,
  } = useCreative();

  const quickLaunch = [
    {
      title: 'New Video Project',
      desc: 'CapCut-style multi-track timeline',
      icon: Video,
      color: 'from-purple-600 to-indigo-600',
      action: () => createNewProject('My New Edit', '16:9'),
    },
    {
      title: 'AI Music Studio',
      desc: 'Record voice, AI vocals, or beats',
      icon: Music,
      color: 'from-indigo-600 to-blue-600',
      action: () => setCurrentView('music_studio'),
    },
    {
      title: 'AI Music Video',
      desc: '10 cinematic & visualizer modes',
      icon: Film,
      color: 'from-pink-600 to-purple-600',
      action: () => setCurrentView('music_video_studio'),
    },
    {
      title: 'AI Video Gen',
      desc: 'Veo 2 & Kling 1.5 Pro',
      icon: Sparkles,
      color: 'from-cyan-600 to-blue-600',
      action: () => setCurrentView('video_generator'),
    },
    {
      title: 'AI Image Studio',
      desc: 'FLUX.1 Pro & Midjourney',
      icon: Image,
      color: 'from-emerald-600 to-teal-600',
      action: () => setCurrentView('image_studio'),
    },
    {
      title: 'AI Voice Studio',
      desc: 'Mic recording & ElevenLabs',
      icon: Mic,
      color: 'from-amber-600 to-orange-600',
      action: () => setCurrentView('voice_studio'),
    },
  ];

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
      {/* User Profile Header Card */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-[#17132F] via-[#10172B] to-[#0A1220] border border-[#232F46] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-purple-950/20">
        <div className="flex items-center gap-5">
          <img
            src={user.avatarUrl}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/50 shadow-lg shadow-purple-600/30"
          />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-purple-950/80 border border-purple-800/40 text-[10px] font-semibold text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Supabase Authenticated</span>
              <span className="text-slate-500">·</span>
              <span className="uppercase text-cyan-400 font-mono">{user.plan} Plan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {user.name}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => createNewProject('Untitled Project', '16:9')}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Video Project</span>
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className="px-4 py-3 rounded-xl bg-[#141B2B] hover:bg-[#1E283E] border border-[#253248] text-xs font-semibold text-slate-200 transition-colors flex items-center gap-2"
          >
            <HardDrive className="w-4 h-4 text-purple-400" />
            <span>Account & Storage</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0D121E] border border-[#1E293F] space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Total Projects</div>
          <div className="text-2xl font-black text-white font-mono">{projects.length}</div>
          <div className="text-[10px] text-cyan-400">Autosaved to Supabase</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0D121E] border border-[#1E293F] space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Uploaded Media</div>
          <div className="text-2xl font-black text-white font-mono">{mediaAssets.length}</div>
          <div className="text-[10px] text-purple-400">user-media bucket</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0D121E] border border-[#1E293F] space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">AI Generated Content</div>
          <div className="text-2xl font-black text-white font-mono">
            {mediaAssets.filter((m) => m.source === 'ai_generated').length + tasks.length}
          </div>
          <div className="text-[10px] text-indigo-400">KIE AI Pipeline</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0D121E] border border-[#1E293F] space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Cloud Storage Used</div>
          <div className="text-2xl font-black text-white font-mono">{user.storageUsedMb} MB</div>
          <div className="text-[10px] text-emerald-400">
            {Math.round(user.storageLimitMb / 1024)} GB Limit
          </div>
        </div>
      </div>

      {/* Quick Launchpad Grid */}
      <div>
        <div className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 px-1">
          Quick Launch Creation Studios
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {quickLaunch.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.title}
                onClick={tool.action}
                className="p-4 rounded-xl bg-[#0D121D] border border-[#1C263A] hover:border-purple-500/50 transition-all hover:-translate-y-0.5 text-left group flex flex-col justify-between"
              >
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                    {tool.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {tool.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Projects & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Projects Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Recent Video Projects</span>
              <span className="text-xs font-mono text-slate-500">({projects.length})</span>
            </div>
            <button
              onClick={() => setCurrentView('my_projects')}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="rounded-xl overflow-hidden bg-[#0D121E] border border-[#1E293F] hover:border-purple-500/40 transition-all group flex flex-col justify-between"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-black/60">
                  <img
                    src={proj.thumbnailUrl || '/src/assets/images/editflow_hero_creative_workspace_1794165722264.jpg'}
                    alt={proj.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300">
                    {proj.durationSec}s · {proj.aspectRatio}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                      {proj.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Updated {new Date(proj.updatedAt).toLocaleDateString()} · {proj.tracks.length} tracks
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#192235]">
                    <button
                      onClick={() => loadProject(proj.id)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Open in Editor</span>
                    </button>
                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Generation Activity & System Pulse */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Generation Tasks */}
          <div className="p-5 rounded-2xl bg-[#0D121E] border border-[#1E293F] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Live Generation Tasks</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                KIE Task Queue
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active tasks. Start a music, video, or image generation!
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {tasks.slice(0, 5).map((t) => (
                  <div key={t.id} className="p-3 rounded-lg bg-[#090C14] border border-[#182133] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 capitalize truncate max-w-[150px]">
                        {t.category} · {t.modelId}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          t.status === 'completed'
                            ? 'text-emerald-400'
                            : t.status === 'failed'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="w-full bg-[#182132] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Engine Status & Storage */}
          <div className="p-5 rounded-2xl bg-[#0D121E] border border-[#1E293F] space-y-4">
            <div className="text-xs font-bold text-white">Creative Engine Status</div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#090C14]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Verified KIE Models</span>
                </span>
                <span className="font-mono text-white font-semibold">{models.length} Online</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#090C14]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Storage Used</span>
                </span>
                <span className="font-mono text-white font-semibold">142 MB / 10 GB</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#090C14]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plan Status</span>
                </span>
                <span className="font-mono text-emerald-400 font-semibold uppercase">{user.plan}</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('models')}
              className="w-full py-2 rounded-lg bg-[#141B2B] hover:bg-[#1E283E] text-xs font-semibold text-slate-300 transition-colors"
            >
              Manage & Test AI Models
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
