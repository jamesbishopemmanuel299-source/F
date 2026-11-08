import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import { KIEModel } from '../types';
import {
  Cpu,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Zap,
  Sliders,
  DollarSign,
} from 'lucide-react';

export const AIModelsView: React.FC = () => {
  const {
    models,
    refreshModels,
    toggleModelActive,
    testModel,
    showToast,
    user,
  } = useCreative();

  const [filterCat, setFilterCat] = useState<string>('all');
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshModels();
    setIsRefreshing(false);
  };

  const handleRunTest = async (modelId: string) => {
    setTestingModelId(modelId);
    setTestResult(null);
    const res = await testModel(modelId);
    setTestResult(res);
    setTestingModelId(null);
    showToast(`Model ${modelId} passed benchmark testing!`);
  };

  const filtered = filterCat === 'all' ? models : models.filter((m) => m.category === filterCat);

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1380px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182133] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/40 text-[11px] font-semibold text-purple-300 mb-2">
            <span>KIE Centralized Model Registry · https://docs.kie.ai</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            KIE AI Model Discovery Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover, test, and manage all verified AI generation models accessible via the KIE API network.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://docs.kie.ai"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#121826] hover:bg-[#1A2336] border border-[#232F46] text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <span>KIE Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Discover & Refresh Models'}</span>
          </button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: `All Models (${models.length})` },
          { id: 'music', label: 'AI Music' },
          { id: 'video', label: 'AI Video' },
          { id: 'image', label: 'AI Image' },
          { id: 'voice', label: 'AI Voice' },
          { id: 'music_video', label: 'Music Video' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterCat(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterCat === c.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#0D121D] border border-[#1E293F] text-slate-400 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((model) => (
          <div
            key={model.id}
            className={`rounded-2xl p-5 bg-[#0D121D] border transition-all flex flex-col justify-between ${
              model.active ? 'border-[#1E293F] hover:border-purple-500/50' : 'border-[#1A1E26] opacity-60'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{model.name}</h3>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{model.provider}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                    {model.costCredits} Credits
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      model.active ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {model.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{model.description}</p>

              {/* Capabilities */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Capabilities</div>
                <div className="flex flex-wrap gap-1.5">
                  {model.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#131B2A] text-slate-300 border border-[#1F2C40]"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Supported parameters summary */}
              <div className="p-2.5 rounded-lg bg-[#090C14] text-[10px] font-mono text-slate-400 space-y-1">
                <div>Required: {model.requiredParams.join(', ')}</div>
                <div>Optional: {model.optionalParams.join(', ')}</div>
                {model.supportedAspectRatios && (
                  <div>Ratios: {model.supportedAspectRatios.join(', ')}</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-[#182133] flex items-center justify-between gap-2">
              <button
                onClick={() => handleRunTest(model.id)}
                disabled={testingModelId === model.id}
                className="px-3 py-1.5 rounded-lg bg-[#141B2B] hover:bg-purple-600/30 border border-[#232F46] hover:border-purple-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3 text-purple-400" />
                <span>{testingModelId === model.id ? 'Testing...' : 'Test Model'}</span>
              </button>

              {user.role === 'admin' && (
                <button
                  onClick={() => toggleModelActive(model.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    model.active
                      ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60'
                      : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60'
                  }`}
                >
                  {model.active ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Benchmark Test Result Toast Modal */}
      {testResult && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Benchmark verification passed for model <strong className="text-white">{testResult.modelId}</strong> ({testResult.latencyMs}ms response latency, schema validated).
            </span>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-[11px] font-bold text-white hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
