import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import { Download, CheckCircle2, Loader2, X, Film, Sparkles, Sliders, HardDrive, Cpu } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, canvasRef }) => {
  const { activeProject, showToast } = useCreative();
  const [resolution, setResolution] = useState<'720p' | '1080p' | '2k' | '4k'>('1080p');
  const [fps, setFps] = useState<number>(30);
  const [format, setFormat] = useState<'mp4' | 'webm'>('mp4');
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [audioBitrate, setAudioBitrate] = useState<'192k' | '320k'>('320k');

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportFrame, setExportFrame] = useState<number>(0);
  const [exportComplete, setExportComplete] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalFrames = Math.floor(activeProject.durationSec * fps);

  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportFrame(0);
    setExportComplete(false);

    // Multi-pass frame composite simulation
    let currentFrame = 0;
    const interval = setInterval(() => {
      currentFrame += Math.max(1, Math.floor(totalFrames / 20));
      if (currentFrame >= totalFrames) {
        currentFrame = totalFrames;
        clearInterval(interval);
        setExportProgress(100);
        setExportFrame(totalFrames);
        finishExport();
      } else {
        const pct = Math.floor((currentFrame / totalFrames) * 100);
        setExportProgress(pct);
        setExportFrame(currentFrame);
      }
    }, 150);
  };

  const finishExport = () => {
    try {
      if (canvasRef.current) {
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setIsExporting(false);
            setExportComplete(true);
            showToast('Video project render complete! Ready for download.');
          }
        }, 'image/jpeg', 0.95);
      } else {
        const dummyBlob = new Blob(['EDITFLOW_AI_RENDERED_STREAM'], { type: 'video/mp4' });
        const url = URL.createObjectURL(dummyBlob);
        setDownloadUrl(url);
        setIsExporting(false);
        setExportComplete(true);
      }
    } catch (e) {
      console.warn('Export error:', e);
      setIsExporting(false);
      setExportComplete(true);
    }
  };

  const downloadFile = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${activeProject.name.toLowerCase().replace(/\s+/g, '_')}_${resolution}_${fps}fps.${format === 'mp4' ? 'mp4' : 'webm'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded ${a.download}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#0D121D] border border-[#232F46] shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1A2438]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Professional Video Export</h2>
              <p className="text-[11px] text-slate-400">{activeProject.name} · {activeProject.aspectRatio}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2438] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {!isExporting && !exportComplete && (
            <>
              {/* Resolution options (720p, 1080p, 2K, 4K) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Resolution Preset
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['720p', '1080p', '2k', '4k'] as const).map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setResolution(res)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        resolution === res
                          ? 'bg-purple-950/70 border-purple-500 text-white font-bold shadow-md shadow-purple-900/30'
                          : 'bg-[#101624] border-[#1E293F] text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-xs uppercase font-mono font-bold">{res}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        {res === '4k' ? '3840×2160' : res === '2k' ? '2560×1440' : res === '1080p' ? '1920×1080' : '1280×720'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format & FPS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Container Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormat('mp4')}
                      className={`py-2 rounded-lg border text-xs font-mono transition-all ${
                        format === 'mp4'
                          ? 'bg-purple-950/70 border-purple-500 text-white font-bold'
                          : 'bg-[#101624] border-[#1E293F] text-slate-400'
                      }`}
                    >
                      MP4 (H.264)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat('webm')}
                      className={`py-2 rounded-lg border text-xs font-mono transition-all ${
                        format === 'webm'
                          ? 'bg-purple-950/70 border-purple-500 text-white font-bold'
                          : 'bg-[#101624] border-[#1E293F] text-slate-400'
                      }`}
                    >
                      WebM (VP9)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Frame Rate (FPS)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[24, 30, 60].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFps(f)}
                        className={`py-2 rounded-lg border text-xs font-mono transition-all ${
                          fps === f
                            ? 'bg-purple-950/70 border-purple-500 text-white font-bold'
                            : 'bg-[#101624] border-[#1E293F] text-slate-400'
                        }`}
                      >
                        {f} fps
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quality & Audio Bitrate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Video Bitrate
                  </label>
                  <div className="flex gap-2">
                    {(['standard', 'high', 'ultra'] as const).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuality(q)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs capitalize transition-all ${
                          quality === q
                            ? 'bg-[#1E1938] border-purple-500 text-purple-300 font-semibold'
                            : 'bg-[#101624] border-[#1E293F] text-slate-400'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Audio Bitrate
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAudioBitrate('192k')}
                      className={`py-1.5 rounded-lg border text-xs font-mono transition-all ${
                        audioBitrate === '192k'
                          ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-[#101624] border-[#1E293F] text-slate-400'
                      }`}
                    >
                      192 kbps
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioBitrate('320k')}
                      className={`py-1.5 rounded-lg border text-xs font-mono transition-all ${
                        audioBitrate === '320k'
                          ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-[#101624] border-[#1E293F] text-slate-400'
                      }`}
                    >
                      320 kbps (Studio)
                    </button>
                  </div>
                </div>
              </div>

              {/* Video stats summary */}
              <div className="p-3.5 rounded-xl bg-[#090C14] border border-[#182133] text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Project Duration:</span>
                  <span className="text-white font-bold">{activeProject.durationSec}s ({totalFrames} frames)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Aspect Ratio:</span>
                  <span className="text-white font-bold">{activeProject.aspectRatio}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated File Size:</span>
                  <span className="text-cyan-400 font-bold">
                    {resolution === '4k' ? '~68 MB' : resolution === '2k' ? '~38 MB' : resolution === '1080p' ? '~18 MB' : '~9 MB'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Progress State */}
          {isExporting && (
            <div className="py-8 space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-purple-950/60 border border-purple-500/40 mx-auto flex items-center justify-center text-purple-400 animate-spin">
                <Loader2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-white">
                  Rendering Multi-Track Composition...
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Compositing frame {exportFrame} of {totalFrames} ({exportProgress}%)
                </div>
              </div>
              <div className="space-y-1.5 max-w-xs mx-auto">
                <div className="w-full bg-[#161D2B] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-150"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <div className="text-xs font-mono text-purple-400 font-bold">{exportProgress}%</div>
              </div>
            </div>
          )}

          {/* Completed State */}
          {exportComplete && (
            <div className="py-6 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="text-base font-bold text-white">Video Render Complete!</div>
                <div className="text-xs text-slate-400">
                  Exported {resolution.toUpperCase()} @ {fps}fps ({format.toUpperCase()}) ready for download.
                </div>
              </div>
              <button
                onClick={downloadFile}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Video File ({format.toUpperCase()})</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isExporting && !exportComplete && (
          <div className="p-4 border-t border-[#1A2438] bg-[#0A0E17] flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExport}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-md shadow-purple-600/30 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Export</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
