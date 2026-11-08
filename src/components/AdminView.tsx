import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import {
  ShieldCheck,
  RefreshCw,
  Cpu,
  Users,
  Coins,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Play,
  Settings,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { models, refreshModels, toggleModelActive, testModel, showToast, user } = useCreative();
  const [activeTab, setActiveTab] = useState<'models' | 'users' | 'logs'>('models');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await refreshModels();
    setIsSyncing(false);
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1380px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182133] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-950/70 border border-rose-800/40 text-[11px] font-semibold text-rose-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Root Administrator Control Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Platform Administration & KIE Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Oversee model discovery, manage active generation adapters, review task logs, and allocate credits.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg flex items-center gap-2 transition-transform hover:scale-[1.02]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Force KIE Discovery Refresh'}</span>
        </button>
      </div>

      {/* Admin KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1E293F]">
          <div className="text-[11px] font-semibold text-slate-400">Total KIE Models</div>
          <div className="text-2xl font-black text-white mt-1 font-mono">{models.length}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">100% verified schema</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1E293F]">
          <div className="text-[11px] font-semibold text-slate-400">Active User Base</div>
          <div className="text-2xl font-black text-white mt-1 font-mono">1,482</div>
          <div className="text-[10px] text-purple-400 mt-0.5">Across 42 countries</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1E293F]">
          <div className="text-[11px] font-semibold text-slate-400">Cloud Storage Allocated</div>
          <div className="text-2xl font-black text-white mt-1 font-mono">142.5 MB</div>
          <div className="text-[10px] text-cyan-400 mt-0.5">10 GB Quota Tier</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1E293F]">
          <div className="text-[11px] font-semibold text-slate-400">System Gateway</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">ONLINE</div>
          <div className="text-[10px] text-slate-500 mt-0.5">KIE API v1 Node</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1A2438] gap-4">
        {[
          { id: 'models', label: 'Discovered Models & Status' },
          { id: 'users', label: 'User Directory & Credits' },
          { id: 'logs', label: 'System Task Audit Log' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === t.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t.label}</span>
            {activeTab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="rounded-2xl bg-[#0D121D] border border-[#1E293F] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090C14] border-b border-[#182133] text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Model Name & ID</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Credit Cost</th>
                  <th className="p-3.5">Performance Tier</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161F30]">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-[#121926] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{m.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{m.id}</div>
                    </td>
                    <td className="p-3.5 capitalize text-slate-300">{m.category}</td>
                    <td className="p-3.5 text-slate-400">{m.provider}</td>
                    <td className="p-3.5 font-mono text-amber-400">{m.costCredits} credits</td>
                    <td className="p-3.5 uppercase font-mono text-[10px] text-cyan-400">{m.speed}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.active ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {m.active ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => testModel(m.id)}
                        className="px-2.5 py-1 rounded bg-[#182236] hover:bg-purple-600 text-slate-300 hover:text-white text-[11px]"
                      >
                        Run Test
                      </button>
                      <button
                        onClick={() => toggleModelActive(m.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                          m.active
                            ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900'
                            : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900'
                        }`}
                      >
                        {m.active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="rounded-2xl bg-[#0D121D] border border-[#1E293F] p-5 space-y-4">
          <div className="text-xs font-bold text-white">Current User Session</div>
          <div className="p-4 rounded-xl bg-[#090C14] border border-[#182133] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <div className="text-sm font-bold text-white">{user.name}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-amber-400 font-bold">{user.credits} Credits</span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40 uppercase">
                {user.plan}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl bg-[#0D121D] border border-[#1E293F] p-5 space-y-3 font-mono text-xs">
          <div className="text-slate-400 font-semibold mb-2">Recent Task Audit Dispatches</div>
          <div className="p-3 rounded-lg bg-[#080B12] text-slate-300 border border-[#182133] space-y-1.5">
            <div className="text-cyan-400">[2026-11-08T11:24:00Z] POST /api/v1/jobs/createTask - model: suno-v4 [SUCCESS]</div>
            <div className="text-purple-400">[2026-11-08T11:22:15Z] POST /api/ai/video/generate - model: veo-2 [SUCCESS]</div>
            <div className="text-emerald-400">[2026-11-08T11:20:45Z] POST /api/ai/models/discover - 16 models verified [HEALTHY]</div>
          </div>
        </div>
      )}
    </div>
  );
};
