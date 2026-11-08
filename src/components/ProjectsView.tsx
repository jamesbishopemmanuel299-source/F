import React from 'react';
import { useCreative } from '../context/CreativeContext';
import { ProjectRecord } from '../types';
import {
  FolderKanban,
  FolderPlus,
  Play,
  Trash2,
  Copy,
  Clock,
  Video,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    createNewProject,
    loadProject,
    deleteProject,
    setActiveProject,
    showToast,
  } = useCreative();

  const handleDuplicate = (p: ProjectRecord) => {
    const dup: ProjectRecord = {
      ...p,
      id: `proj_copy_${Date.now()}`,
      name: `${p.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setActiveProject(dup);
    showToast(`Duplicated ${p.name}`);
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1380px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182133] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/40 text-[11px] font-semibold text-purple-300 mb-2">
            <span>Project Management & History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            My Creative Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pick up where you left off or create new multi-track video compositions.
          </p>
        </div>

        <button
          onClick={() => createNewProject('New Project', '16:9')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-transform hover:scale-[1.02]"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="rounded-2xl overflow-hidden bg-[#0D121D] border border-[#1E293F] hover:border-purple-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-black/60">
              <img
                src={proj.thumbnailUrl || '/src/assets/images/editflow_hero_creative_workspace_1794165722264.jpg'}
                alt={proj.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-cyan-300">
                {proj.durationSec}s · {proj.aspectRatio}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                  {proj.name}
                </h3>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Modified {new Date(proj.updatedAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{proj.tracks.length} tracks</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#182133]">
                <button
                  onClick={() => loadProject(proj.id)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Open in Editor</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(proj)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2338] transition-colors"
                    title="Duplicate project"
                  >
                    <Copy className="w-3.5 h-3.5" />
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
          </div>
        ))}
      </div>
    </div>
  );
};
