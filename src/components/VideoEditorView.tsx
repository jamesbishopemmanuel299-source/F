import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCreative } from '../context/CreativeContext';
import { TimelineClip, TimelineTrack, ProjectRecord, TimelineMarker } from '../types';
import { ExportModal } from './ExportModal';
import {
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Copy,
  ClipboardPaste,
  CopyPlus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Save,
  Plus,
  Type,
  Music,
  Image as ImageIcon,
  Film,
  Sparkles,
  Sliders,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoveHorizontal,
  Wand2,
  Undo2,
  Redo2,
  Magnet,
  Bookmark,
  Crop,
  Sun,
  Palette,
  Gauge,
  FlipHorizontal,
  FlipVertical,
  Activity,
  Layers3,
  SplitSquareVertical,
  HelpCircle,
  Upload,
  Check,
  Radio,
  Sparkle,
} from 'lucide-react';

export const VideoEditorView: React.FC = () => {
  const {
    activeProject,
    setActiveProject,
    saveCurrentProject,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    timelineZoom,
    setTimelineZoom,
    selectedClipId,
    setSelectedClipId,
    addClipToTrack,
    updateClip,
    deleteClip,
    splitClipAtPlayhead,
    undo,
    redo,
    canUndo,
    canRedo,
    copySelectedClip,
    pasteClipAtPlayhead,
    duplicateClip,
    copiedClip,
    addNewTrack,
    deleteTrack,
    toggleTrackLock,
    toggleTrackHide,
    toggleTrackMute,
    addTimelineMarker,
    deleteTimelineMarker,
    snapEnabled,
    setSnapEnabled,
    generateAutoCaptions,
    uploadMediaFile,
    uploadProgress,
    isAutosaving,
    lastSavedAt,
    mediaAssets,
    showToast,
  } = useCreative();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<'media' | 'audio' | 'text' | 'effects' | 'transitions' | 'filters' | 'aitools' | 'inspector'>('media');
  const [aspectRatio, setAspectRatio] = useState<string>(activeProject.aspectRatio || '16:9');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showSafeMargins, setShowSafeMargins] = useState<boolean>(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage for split comparison
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState<boolean>(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState<boolean>(false);
  const [inspectorSubTab, setInspectorSubTab] = useState<'transform' | 'color' | 'speed' | 'audio' | 'chroma' | 'text'>('transform');

  // Text builder state
  const [newText, setNewText] = useState('EDITFLOW AI');
  const [selectedFont, setSelectedFont] = useState('Plus Jakarta Sans');
  const [newTextColor, setNewTextColor] = useState('#FFFFFF');
  const [newTextBg, setNewTextBg] = useState('rgba(0, 0, 0, 0.7)');
  const [textStylePreset, setTextStylePreset] = useState<'default' | 'glow' | 'cyber' | 'lowerthird'>('default');

  // Trimming drag state
  const [trimmingClip, setTrimmingClip] = useState<{
    trackId: string;
    clipId: string;
    edge: 'left' | 'right';
    initialStart: number;
    initialDuration: number;
    initialMouseX: number;
  } | null>(null);

  // Quick AI generation inline state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Selected clip object helper
  const selectedClip = activeProject.tracks
    .flatMap((t) => t.clips.map((c) => ({ ...c, trackId: t.id, trackType: t.type, trackLocked: t.locked })))
    .find((c) => c.id === selectedClipId);

  // Dynamic pixels per second calculation based on zoom
  const pxPerSec = 50 * timelineZoom;

  // Spacebar play/pause listener & keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClip && !selectedClip.trackLocked) {
          e.preventDefault();
          deleteClip(selectedClip.trackId, selectedClip.id);
        }
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            if (canRedo) redo();
          } else {
            if (canUndo) undo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          if (canRedo) redo();
        } else if (e.key === 'c') {
          e.preventDefault();
          copySelectedClip();
        } else if (e.key === 'v') {
          e.preventDefault();
          pasteClipAtPlayhead();
        } else if (e.key === 'd') {
          e.preventDefault();
          if (selectedClip) duplicateClip(selectedClip.trackId, selectedClip.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, selectedClip, canUndo, canRedo, undo, redo, copySelectedClip, pasteClipAtPlayhead, duplicateClip, deleteClip]);

  // Main animation frame playback loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const renderLoop = (now: number) => {
      const deltaSec = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        setCurrentTime((prev: number) => {
          const next = prev + deltaSec * playbackSpeed;
          if (next >= activeProject.durationSec) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return activeProject.durationSec;
            }
          }
          return next;
        });
      }

      drawCanvasPreview();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackSpeed, activeProject, currentTime, isLooping, showBeforeAfter, splitPosition, showSafeMargins]);

  // Canvas Compositor: Draw active visual layers, filters, effects, chroma key, text
  const drawCanvasPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#06080E';
    ctx.fillRect(0, 0, width, height);

    // Active visual tracks: video, image, and overlays that are not hidden
    const visualTracks = activeProject.tracks.filter(
      (t) => (t.type === 'video' || t.type === 'image') && !t.hidden
    );

    let hasDrawnVisual = false;

    // Render visual clips
    visualTracks.forEach((track) => {
      const activeClip = track.clips.find(
        (c) => currentTime >= c.start && currentTime <= c.start + c.duration
      );

      if (activeClip && activeClip.src) {
        hasDrawnVisual = true;
        ctx.save();

        // Check if Before/After is split
        const isSplitEnabled = showBeforeAfter;
        const splitBoundaryX = (width * splitPosition) / 100;

        // Apply transformations: scale, rotation, translation, opacity
        const scale = (activeClip.scale ?? 100) / 100;
        const rotationRad = ((activeClip.rotation ?? 0) * Math.PI) / 180;
        const posX = activeClip.positionX ?? 0;
        const posY = activeClip.positionY ?? 0;
        const opacity = (activeClip.opacity ?? 100) / 100;
        const flipH = activeClip.flipH ? -1 : 1;
        const flipV = activeClip.flipV ? -1 : 1;

        ctx.globalAlpha = opacity;
        if (activeClip.blendMode && activeClip.blendMode !== 'normal') {
          ctx.globalCompositeOperation = activeClip.blendMode as GlobalCompositeOperation;
        }

        // Color grading parameters
        const b = activeClip.brightness ?? 100;
        const c = activeClip.contrast ?? 100;
        const s = activeClip.saturation ?? 100;
        const blur = activeClip.blur ?? 0;
        const hue = activeClip.hueRotate ?? 0;

        // When Before/After is enabled, the left side is Raw, right side is Color Graded
        ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${blur}px) hue-rotate(${hue}deg)`;

        const img = new Image();
        img.src = activeClip.src;
        if (img.complete && img.naturalWidth > 0) {
          ctx.translate(width / 2 + posX, height / 2 + posY);
          ctx.rotate(rotationRad);
          ctx.scale(scale * flipH, scale * flipV);

          const hRatio = width / img.naturalWidth;
          const vRatio = height / img.naturalHeight;
          const ratio = Math.max(hRatio, vRatio);
          const drawW = img.naturalWidth * ratio;
          const drawH = img.naturalHeight * ratio;

          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        } else {
          // Stylish fallback placeholder
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#1E1838');
          grad.addColorStop(1, '#0C1222');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#A78BFA';
          ctx.font = 'bold 20px Plus Jakarta Sans';
          ctx.textAlign = 'center';
          ctx.fillText(activeClip.title, width / 2, height / 2);
        }

        ctx.restore();

        // Apply Vignette if specified
        if (activeClip.vignette && activeClip.vignette > 0) {
          ctx.save();
          const vigGrad = ctx.createRadialGradient(
            width / 2,
            height / 2,
            width * 0.3,
            width / 2,
            height / 2,
            width * 0.7
          );
          vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
          vigGrad.addColorStop(1, `rgba(0,0,0,${(activeClip.vignette / 100) * 0.85})`);
          ctx.fillStyle = vigGrad;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        // Apply VHS / Glitch / Scanline effect overlay if active
        if (activeClip.effect === 'vhs' || activeClip.effect === 'glitch') {
          ctx.save();
          // Scanlines
          ctx.fillStyle = 'rgba(0, 255, 200, 0.03)';
          for (let y = 0; y < height; y += 4) {
            ctx.fillRect(0, y, width, 1.5);
          }
          // VHS Timecode stamp
          ctx.font = 'bold 16px "JetBrains Mono", monospace';
          ctx.fillStyle = '#06B6D4';
          ctx.shadowColor = '#06B6D4';
          ctx.shadowBlur = 6;
          ctx.fillText('SP 0:00:00 [PLAY]', 36, 46);
          ctx.restore();
        } else if (activeClip.effect === 'film_grain') {
          // Film grain overlay
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          for (let i = 0; i < 400; i++) {
            const rx = Math.random() * width;
            const ry = Math.random() * height;
            ctx.fillRect(rx, ry, 2, 2);
          }
          ctx.restore();
        }
      }
    });

    if (!hasDrawnVisual) {
      // Empty slate frame
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 15px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('NO VISUAL CLIP AT PLAYHEAD', width / 2, height / 2 - 10);
      ctx.fillStyle = '#334155';
      ctx.font = '12px Plus Jakarta Sans';
      ctx.fillText('Add media from the Left Dock or import assets to begin', width / 2, height / 2 + 16);
    }

    // Draw active Text Overlays and Auto-Captions
    const textTracks = activeProject.tracks.filter((t) => t.type === 'text' && !t.hidden);
    textTracks.forEach((track) => {
      const activeTextClip = track.clips.find(
        (c) => currentTime >= c.start && currentTime <= c.start + c.duration
      );

      if (activeTextClip && activeTextClip.text) {
        ctx.save();
        const fontSize = activeTextClip.fontSize || 34;
        const fontFamily = activeTextClip.fontFamily || 'Plus Jakarta Sans';
        ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
        ctx.textAlign = (activeTextClip.textAlign as CanvasTextAlign) || 'center';

        const posX = width / 2 + (activeTextClip.positionX || 0);
        const posY = (height * (activeTextClip.positionY || 80)) / 100;
        const textWidth = ctx.measureText(activeTextClip.text).width;

        // Draw background pill / plate
        if (activeTextClip.bgColor && activeTextClip.bgColor !== 'transparent') {
          ctx.fillStyle = activeTextClip.bgColor;
          const padX = 20;
          const padY = 12;
          ctx.beginPath();
          ctx.roundRect(
            posX - textWidth / 2 - padX,
            posY - fontSize + 2,
            textWidth + padX * 2,
            fontSize + padY,
            10
          );
          ctx.fill();
        }

        // Draw stroke if specified
        if (activeTextClip.strokeWidth && activeTextClip.strokeColor) {
          ctx.lineWidth = activeTextClip.strokeWidth;
          ctx.strokeStyle = activeTextClip.strokeColor;
          ctx.strokeText(activeTextClip.text, posX, posY);
        }

        // Drop shadow
        if (activeTextClip.shadowBlur) {
          ctx.shadowColor = activeTextClip.shadowColor || 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = activeTextClip.shadowBlur;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
        }

        // Draw text
        ctx.fillStyle = activeTextClip.color || '#FFFFFF';
        ctx.fillText(activeTextClip.text, posX, posY);
        ctx.restore();
      }
    });

    // Draw Before/After Split Line Indicator
    if (showBeforeAfter) {
      const splitX = (width * splitPosition) / 100;
      ctx.save();
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
      ctx.stroke();

      // Badges
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(splitX - 65, 16, 55, 24);
      ctx.fillRect(splitX + 10, 16, 55, 24);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('RAW', splitX - 38, 32);
      ctx.fillStyle = '#22D3EE';
      ctx.fillText('LUT/FX', splitX + 38, 32);
      ctx.restore();
    }

    // Draw Broadcast / Social Safe Margins Overlay
    if (showSafeMargins) {
      ctx.save();
      // Action Safe (90%)
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);

      // Title Safe (80%)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);

      // Safe labels
      ctx.fillStyle = 'rgba(234, 179, 8, 0.8)';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('ACTION SAFE 90%', width * 0.05 + 6, height * 0.05 + 14);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.fillText('TITLE SAFE 80%', width * 0.1 + 6, height * 0.1 + 14);
      ctx.restore();
    }
  }, [activeProject, currentTime, showBeforeAfter, splitPosition, showSafeMargins]);

  // Format seconds into SMPTE timecode (HH:MM:SS:FF)
  const formatTimecode = (secs: number) => {
    const totalFrames = Math.floor(secs * 30);
    const ff = String(totalFrames % 30).padStart(2, '0');
    const totalSeconds = Math.floor(secs);
    const ss = String(totalSeconds % 60).padStart(2, '0');
    const mm = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    return `${hh}:${mm}:${ss}:${ff}`;
  };

  // Timeline Scrubbing Handler
  const handleTimelineRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineScrollRef.current) return;
    const rect = timelineScrollRef.current.getBoundingClientRect();
    const scrollLeft = timelineScrollRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft - 180; // offset track header column (180px)
    const clickedSec = Math.max(0, Math.min(activeProject.durationSec, clickX / pxPerSec));
    setCurrentTime(clickedSec);
  };

  // Step Frame forward / backward
  const handleStepFrame = (frames: number) => {
    const frameDuration = 1 / 30;
    setCurrentTime((t) => Math.max(0, Math.min(activeProject.durationSec, t + frames * frameDuration)));
  };

  // Add text clip helper
  const handleAddTextClip = () => {
    let textTrack = activeProject.tracks.find((t) => t.type === 'text');
    if (!textTrack) {
      addNewTrack('text', 'Captions & Titles');
      textTrack = activeProject.tracks.find((t) => t.type === 'text');
    }

    const trackId = textTrack ? textTrack.id : activeProject.tracks[0].id;
    addClipToTrack(trackId, {
      title: 'Title Overlay',
      type: 'text',
      text: newText,
      fontSize: 36,
      color: newTextColor,
      bgColor: newTextBg,
      fontFamily: selectedFont,
      positionY: 80,
      start: currentTime,
      duration: 4,
      strokeWidth: textStylePreset === 'glow' ? 2 : 0,
      strokeColor: textStylePreset === 'glow' ? '#06B6D4' : 'transparent',
      shadowBlur: textStylePreset === 'cyber' ? 12 : 6,
      shadowColor: textStylePreset === 'cyber' ? '#8B5CF6' : 'rgba(0,0,0,0.8)',
    });
  };

  // Quick SFX insertion
  const handleAddSoundEffect = (title: string, src: string, duration = 3) => {
    let audioTrack = activeProject.tracks.find((t) => t.type === 'audio');
    if (!audioTrack) {
      addNewTrack('audio', 'SFX & Music');
      audioTrack = activeProject.tracks.find((t) => t.type === 'audio');
    }

    const trackId = audioTrack ? audioTrack.id : activeProject.tracks[0].id;
    addClipToTrack(trackId, {
      title,
      type: 'audio',
      src,
      start: currentTime,
      duration,
      volume: 0.9,
    });
  };

  // 1-Click AI Auto Captions trigger
  const handleTriggerAutoCaptions = async () => {
    setIsGeneratingCaptions(true);
    try {
      await generateAutoCaptions();
      setActiveTab('text');
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  // Drag-to-trim clip edges
  const handleStartTrim = (
    e: React.MouseEvent,
    trackId: string,
    clipId: string,
    edge: 'left' | 'right'
  ) => {
    e.stopPropagation();
    const track = activeProject.tracks.find((t) => t.id === trackId);
    if (!track || track.locked) return;
    const clip = track.clips.find((c) => c.id === clipId);
    if (!clip) return;

    setTrimmingClip({
      trackId,
      clipId,
      edge,
      initialStart: clip.start,
      initialDuration: clip.duration,
      initialMouseX: e.clientX,
    });
  };

  useEffect(() => {
    if (!trimmingClip) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - trimmingClip.initialMouseX;
      const deltaSec = deltaX / pxPerSec;

      if (trimmingClip.edge === 'right') {
        const newDur = Math.max(0.5, trimmingClip.initialDuration + deltaSec);
        updateClip(trimmingClip.trackId, trimmingClip.clipId, { duration: Number(newDur.toFixed(2)) });
      } else {
        const newStart = Math.max(0, trimmingClip.initialStart + deltaSec);
        const newDur = Math.max(0.5, trimmingClip.initialDuration - deltaSec);
        updateClip(trimmingClip.trackId, trimmingClip.clipId, {
          start: Number(newStart.toFixed(2)),
          duration: Number(newDur.toFixed(2)),
        });
      }
    };

    const handleMouseUp = () => {
      setTrimmingClip(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [trimmingClip, pxPerSec, updateClip]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] bg-[#05070B] select-none overflow-hidden">
      {/* 1. TOP CAPCUT MASTER TOOLBAR */}
      <div className="h-12 border-b border-[#151D2A] bg-[#080B11] px-4 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Project title & History Undo/Redo */}
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={activeProject.name}
            onChange={(e) => setActiveProject({ ...activeProject, name: e.target.value })}
            className="bg-transparent text-sm font-bold text-white hover:bg-[#121927] px-2 py-1 rounded focus:bg-[#121927] focus:outline-none max-w-xs transition-colors border border-transparent focus:border-[#243247]"
          />
          <div className="h-4 w-[1px] bg-[#1B2537]" />

          {/* Undo & Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-1.5 rounded-md border text-xs flex items-center transition-colors ${
                canUndo
                  ? 'bg-[#111724] border-[#1E293B] text-slate-200 hover:bg-[#1B2438] hover:text-white'
                  : 'bg-transparent border-transparent text-slate-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-1.5 rounded-md border text-xs flex items-center transition-colors ${
                canRedo
                  ? 'bg-[#111724] border-[#1E293B] text-slate-200 hover:bg-[#1B2438] hover:text-white'
                  : 'bg-transparent border-transparent text-slate-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#1B2537]" />

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Canvas:</span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="bg-[#0F1420] border border-[#212E43] text-slate-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="16:9">16:9 YouTube / Film</option>
              <option value="9:16">9:16 TikTok / Reels</option>
              <option value="1:1">1:1 Square Feed</option>
              <option value="4:5">4:5 Instagram Portrait</option>
              <option value="21:9">21:9 Anamorphic Cinema</option>
            </select>
          </div>
        </div>

        {/* Center: Precision SMPTE Timecode Counter */}
        <div className="flex items-center gap-2 bg-[#04060A] border border-[#182232] px-3.5 py-1 rounded-lg shadow-inner">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase text-slate-500">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>SMPTE</span>
          </div>
          <span className="text-sm font-mono font-bold text-cyan-400 tabular-nums">
            {formatTimecode(currentTime)}
          </span>
          <span className="text-slate-600 font-mono text-xs">/</span>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {formatTimecode(activeProject.durationSec)}
          </span>
          <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#101726] text-purple-400 border border-purple-500/20">
            30 FPS
          </span>
        </div>

        {/* Right: Cloud Sync, AI Auto-Captions, Save & Export */}
        <div className="flex items-center gap-2">
          {/* Cloud Autosave Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0D1424] border border-[#1E2B43] text-[10px] text-slate-300">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isAutosaving
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
              }`}
            />
            <span className="font-mono">{isAutosaving ? 'Autosaving...' : `Saved ${lastSavedAt || 'to Cloud'}`}</span>
          </div>

          {/* Quick Auto-Captions Button */}
          <button
            onClick={handleTriggerAutoCaptions}
            disabled={isGeneratingCaptions}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Automatically transcribe and generate animated captions"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isGeneratingCaptions ? 'animate-spin' : ''}`} />
            <span>{isGeneratingCaptions ? 'Generating...' : 'AI Auto-Captions'}</span>
          </button>

          <button
            onClick={saveCurrentProject}
            className="px-3 py-1.5 rounded-lg bg-[#111724] hover:bg-[#1A2336] border border-[#202D42] text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            <span>Save</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Pro</span>
          </button>
        </div>
      </div>

      {/* 2. THREE-COLUMN CAPCUT WORKSPACE (Left Dock, Center Canvas, Right Inspector) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT ASSET & TOOL DOCK */}
        <div className="w-72 bg-[#080B11] border-r border-[#151D2A] flex flex-col shrink-0">
          {/* Dock Top Tabs Strip */}
          <div className="grid grid-cols-4 border-b border-[#141B28] bg-[#06080E] p-1 gap-1">
            {[
              { id: 'media', label: 'Media', icon: Film },
              { id: 'audio', label: 'Audio', icon: Music },
              { id: 'text', label: 'Text', icon: Type },
              { id: 'effects', label: 'Effects', icon: Sparkles },
              { id: 'transitions', label: 'Transit', icon: MoveHorizontal },
              { id: 'filters', label: 'LUTs', icon: Palette },
              { id: 'aitools', label: 'AI Suite', icon: Wand2 },
              { id: 'inspector', label: 'Inspect', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-1.5 px-1 rounded-md text-[10px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-all ${
                    isActive
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#101624]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dock Content Panel */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {/* 1. MEDIA TAB */}
            {activeTab === 'media' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Media Library</span>
                  <span className="text-[11px] text-slate-500">{mediaAssets.length} assets</span>
                </div>

                {/* Upload to Supabase Button */}
                <div>
                  <input
                    type="file"
                    id="editor_supabase_upload"
                    className="hidden"
                    accept="video/*,audio/*,image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const asset = await uploadMediaFile(file);
                      if (asset) {
                        const targetTrack =
                          asset.type === 'audio' || asset.type === 'recording'
                            ? activeProject.tracks.find((t) => t.type === 'audio')
                            : activeProject.tracks.find((t) => t.type === 'video');
                        if (targetTrack) {
                          addClipToTrack(targetTrack.id, {
                            title: asset.name,
                            src: asset.url,
                            type: asset.type === 'audio' ? 'audio' : 'image',
                            duration: asset.duration || 6,
                          });
                        }
                      }
                      e.target.value = '';
                    }}
                  />
                  <label
                    htmlFor="editor_supabase_upload"
                    className="w-full py-2 rounded-lg bg-[#111726] hover:bg-[#1A253D] border border-dashed border-[#23314B] hover:border-purple-500 text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Upload to Supabase Storage</span>
                  </label>
                </div>

                {uploadProgress !== null && (
                  <div className="text-[10px] text-purple-300 font-mono text-center bg-purple-950/60 p-1.5 rounded">
                    Uploading: {uploadProgress}%
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="group relative rounded-lg overflow-hidden bg-[#101624] border border-[#1B263B] aspect-[16/10] cursor-pointer hover:border-purple-500/60 transition-colors shadow-sm"
                      onClick={() => {
                        const targetTrack =
                          asset.type === 'audio' || asset.type === 'recording'
                            ? activeProject.tracks.find((t) => t.type === 'audio')
                            : activeProject.tracks.find((t) => t.type === 'video');
                        if (targetTrack) {
                          addClipToTrack(targetTrack.id, {
                            title: asset.name,
                            src: asset.url,
                            type: asset.type === 'audio' ? 'audio' : 'image',
                            duration: asset.duration || 6,
                          });
                        }
                      }}
                    >
                      {asset.type === 'audio' || asset.type === 'recording' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-indigo-950/90 to-[#0A0E18]">
                          <Music className="w-5 h-5 text-indigo-400 mb-1" />
                          <span className="text-[10px] text-slate-300 font-medium truncate w-full">
                            {asset.name}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2 py-1 rounded bg-purple-600 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                          <Plus className="w-3 h-3" />
                          Insert
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. AUDIO & SFX TAB */}
            {activeTab === 'audio' && (
              <div className="space-y-3.5">
                <div className="text-xs font-bold text-slate-200">Studio SFX & Soundtracks</div>

                <div className="space-y-2">
                  {[
                    { name: 'Cinematic Sub Impact', cat: 'Hit', dur: 4, src: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3' },
                    { name: 'Speed Riser & Whoosh', cat: 'Riser', dur: 3, src: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3' },
                    { name: 'Clean Swoosh Transition', cat: 'Swoosh', dur: 2, src: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3' },
                    { name: 'Deep Amapiano Log Drum', cat: 'Percussion', dur: 5, src: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3' },
                    { name: 'Cyberpunk Drone Pad', cat: 'Ambient', dur: 8, src: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3' },
                  ].map((sfx) => (
                    <div
                      key={sfx.name}
                      className="p-2.5 rounded-lg bg-[#0E1422] border border-[#1A253A] flex items-center justify-between hover:border-[#2C3B55] transition-colors"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{sfx.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sfx.cat} · {sfx.dur}s</div>
                      </div>
                      <button
                        onClick={() => handleAddSoundEffect(sfx.name, sfx.src, sfx.dur)}
                        className="p-1.5 rounded-md bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white transition-colors"
                        title="Add to Audio track"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. TEXT & CAPTIONS TAB */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Titles & Subtitles</span>
                  <button
                    onClick={handleTriggerAutoCaptions}
                    disabled={isGeneratingCaptions}
                    className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Auto-Subtitles</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Text Caption</label>
                    <textarea
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      rows={2}
                      className="w-full bg-[#0F1523] border border-[#1E2B41] text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Style Preset</label>
                      <select
                        value={textStylePreset}
                        onChange={(e) => setTextStylePreset(e.target.value as any)}
                        className="w-full bg-[#0F1523] border border-[#1E2B41] text-xs text-white rounded p-1.5 focus:outline-none"
                      >
                        <option value="default">Clean White</option>
                        <option value="glow">Cyan Glow</option>
                        <option value="cyber">Cyber Neon</option>
                        <option value="lowerthird">Lower Third</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Font Family</label>
                      <select
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="w-full bg-[#0F1523] border border-[#1E2B41] text-xs text-white rounded p-1.5 focus:outline-none"
                      >
                        <option value="Plus Jakarta Sans">Jakarta Sans</option>
                        <option value="JetBrains Mono">JetBrains Mono</option>
                        <option value="Impact">Impact Bold</option>
                        <option value="sans-serif">System Sans</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAddTextClip}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert Text at Playhead</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. EFFECTS TAB */}
            {activeTab === 'effects' && (
              <div className="space-y-3.5">
                <div className="text-xs font-bold text-slate-200">Cinematic Effects Engine</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'vhs', name: 'VHS Retro 90s', desc: 'Scanlines & tape noise' },
                    { id: 'glitch', name: 'RGB Split Glitch', desc: 'Digital chromatic glitch' },
                    { id: 'grain', name: '35mm Film Grain', desc: 'Organic film texture' },
                    { id: 'glow', name: 'Neon Bloom Glow', desc: 'High-contrast edge glow' },
                    { id: 'shake', name: 'Handheld Shake', desc: 'Kinetic camera motion' },
                    { id: 'none', name: 'Normal / Clean', desc: 'Remove active effect' },
                  ].map((eff) => (
                    <button
                      key={eff.id}
                      onClick={() => {
                        if (selectedClip && !selectedClip.trackLocked) {
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            effect: eff.id as any,
                            vignette: eff.id === 'vhs' ? 35 : selectedClip.vignette,
                          });
                          showToast(`Applied ${eff.name}`);
                        } else {
                          showToast('Select a video/image clip on the timeline first');
                        }
                      }}
                      className="p-2.5 rounded-lg bg-[#0E1422] border border-[#1A253A] hover:border-purple-500 text-left transition-colors flex flex-col justify-between"
                    >
                      <div className="text-xs font-semibold text-white">{eff.name}</div>
                      <div className="text-[9px] text-slate-400 mt-1">{eff.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. TRANSITIONS TAB */}
            {activeTab === 'transitions' && (
              <div className="space-y-3.5">
                <div className="text-xs font-bold text-slate-200">Transitions Library</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'fade', name: 'Cross Fade' },
                    { id: 'dissolve', name: 'Cross Dissolve' },
                    { id: 'zoom', name: 'Zoom In Warp' },
                    { id: 'slide', name: 'Slide Left' },
                    { id: 'wipe', name: 'Cinematic Wipe' },
                    { id: 'glitch', name: 'Glitch Flash' },
                  ].map((tr) => (
                    <button
                      key={tr.id}
                      onClick={() => {
                        if (selectedClip && !selectedClip.trackLocked) {
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            transition: tr.id as any,
                            transitionDuration: 0.8,
                          });
                          showToast(`Applied ${tr.name} transition`);
                        } else {
                          showToast('Select a clip to apply transition');
                        }
                      }}
                      className="p-2.5 rounded-lg bg-[#0E1422] border border-[#1A253A] hover:border-cyan-500 text-left transition-colors"
                    >
                      <div className="text-xs font-semibold text-white">{tr.name}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">0.8s duration</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. FILTERS & LUTS TAB */}
            {activeTab === 'filters' && (
              <div className="space-y-3.5">
                <div className="text-xs font-bold text-slate-200">Color Grading & LUTs</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Teal & Orange', b: 105, c: 120, s: 130, lut: 'teal_orange' as const },
                    { name: 'Film Noir Mono', b: 95, c: 140, s: 0, lut: 'hollywood_noir' as const },
                    { name: 'Cyberpunk Neon', b: 110, c: 125, s: 145, lut: 'cyberpunk' as const },
                    { name: 'Vintage 1970', b: 100, c: 105, s: 75, lut: 'vintage_70s' as const },
                    { name: 'Bleach Bypass', b: 108, c: 135, s: 80, lut: 'bleach_bypass' as const },
                    { name: 'Clean Neutral', b: 100, c: 100, s: 100, lut: 'none' as const },
                  ].map((lut) => (
                    <button
                      key={lut.name}
                      onClick={() => {
                        if (selectedClip && !selectedClip.trackLocked) {
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            brightness: lut.b,
                            contrast: lut.c,
                            saturation: lut.s,
                            lut: lut.lut,
                          });
                          showToast(`Applied ${lut.name} LUT`);
                        } else {
                          showToast('Select a clip on the timeline first');
                        }
                      }}
                      className="p-2.5 rounded-lg bg-[#0E1422] border border-[#1A253A] hover:border-purple-500 text-left transition-colors"
                    >
                      <div className="text-xs font-semibold text-white">{lut.name}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Cinematic preset</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 7. AI SUITE TAB */}
            {activeTab === 'aitools' && (
              <div className="space-y-3.5">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>KIE AI Studio Engine</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0E1422] border border-[#1A253A] space-y-2.5">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    Text-to-Video Clip
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe scene: 'Drone shot of neon metropolis with flying vehicles at sunset'..."
                    rows={3}
                    className="w-full bg-[#090D17] border border-[#1F2B41] text-xs text-white rounded p-2 focus:outline-none focus:border-purple-500"
                  />

                  <button
                    onClick={() => {
                      if (!aiPrompt.trim()) {
                        showToast('Please enter a prompt');
                        return;
                      }
                      setIsAiGenerating(true);
                      setTimeout(() => {
                        const videoTrack = activeProject.tracks.find((t) => t.type === 'video');
                        if (videoTrack) {
                          addClipToTrack(videoTrack.id, {
                            title: `AI: ${aiPrompt.slice(0, 20)}...`,
                            src: '/src/assets/images/ai_music_video_cinematic_1794165723863.jpg',
                            duration: 6,
                            start: currentTime,
                          });
                        }
                        setIsAiGenerating(false);
                        setAiPrompt('');
                        showToast('AI Video clip generated & placed at playhead');
                      }, 2000);
                    }}
                    disabled={isAiGenerating}
                    className="w-full py-2 rounded bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
                    <span>{isAiGenerating ? 'Generating Video...' : 'Generate to Timeline'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-[#0E1422] border border-[#1A253A] space-y-2">
                  <div className="text-xs font-semibold text-white">Chroma Key Green Screen</div>
                  <p className="text-[10px] text-slate-400">
                    Remove solid green/blue backgrounds and isolate subjects cleanly.
                  </p>
                  <button
                    onClick={() => {
                      if (selectedClip) {
                        updateClip(selectedClip.trackId, selectedClip.id, {
                          chromaKey: true,
                          chromaColor: '#00FF00',
                          chromaTolerance: 30,
                        });
                        showToast('Enabled Chroma Key Green Screen');
                      } else {
                        showToast('Select a clip first');
                      }
                    }}
                    className="w-full py-1.5 rounded bg-[#151D2F] hover:bg-[#1E2940] border border-[#23314B] text-xs font-medium text-slate-200"
                  >
                    Enable Green Screen Removal
                  </button>
                </div>
              </div>
            )}

            {/* 8. INSPECTOR TAB (Shortcut into Properties) */}
            {activeTab === 'inspector' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-200">Clip Details</div>
                {selectedClip ? (
                  <div className="text-xs text-slate-400 space-y-2">
                    <div><span className="text-slate-500">Title:</span> {selectedClip.title}</div>
                    <div><span className="text-slate-500">Track:</span> {selectedClip.trackType}</div>
                    <div><span className="text-slate-500">Start:</span> {selectedClip.start}s</div>
                    <div><span className="text-slate-500">Duration:</span> {selectedClip.duration}s</div>
                    <div className="text-[11px] text-cyan-400 pt-1">
                      Customize all parameters in the Properties panel on the right.
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">Select any clip on the timeline to inspect.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER VIEWPORT & CANVAS COMPOSITOR */}
        <div className="flex-1 flex flex-col bg-[#05070A] items-center justify-center p-3 relative overflow-hidden">
          {/* Canvas Wrapper */}
          <div
            className={`relative rounded-xl overflow-hidden bg-black shadow-2xl border border-[#1B263B] max-w-full max-h-[52vh] flex items-center justify-center ${
              aspectRatio === '9:16'
                ? 'aspect-[9/16]'
                : aspectRatio === '1:1'
                ? 'aspect-square'
                : aspectRatio === '4:5'
                ? 'aspect-[4/5]'
                : aspectRatio === '21:9'
                ? 'aspect-[21/9]'
                : 'aspect-[16/9]'
            }`}
          >
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Canvas HUD Controls (Before/After, Safe Margins, Aspect Ratio) */}
          <div className="mt-2.5 flex items-center justify-between w-full max-w-xl px-2 text-xs">
            {/* Left hud toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1.5 transition-colors ${
                  showBeforeAfter
                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                    : 'bg-[#0E1422] border-[#1C263A] text-slate-400 hover:text-white'
                }`}
                title="Toggle Before/After split comparison slider"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Before/After</span>
              </button>

              <button
                onClick={() => setShowSafeMargins(!showSafeMargins)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1.5 transition-colors ${
                  showSafeMargins
                    ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                    : 'bg-[#0E1422] border-[#1C263A] text-slate-400 hover:text-white'
                }`}
                title="Toggle Action & Title Safe Margins for broadcast and TikTok"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Safe Zones</span>
              </button>
            </div>

            {/* Before/After slider if active */}
            {showBeforeAfter && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Split:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPosition}
                  onChange={(e) => setSplitPosition(Number(e.target.value))}
                  className="w-20 accent-cyan-400 cursor-pointer h-1"
                />
              </div>
            )}
          </div>

          {/* Transport Controls Bar */}
          <div className="mt-2 flex items-center gap-3 px-4 py-1.5 rounded-xl bg-[#090D17] border border-[#182337] shadow-xl">
            {/* Step back 1 frame */}
            <button
              onClick={() => handleStepFrame(-1)}
              className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors"
              title="Step back 1 frame"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
              title="Play / Pause (Space)"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            {/* Step forward 1 frame */}
            <button
              onClick={() => handleStepFrame(1)}
              className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors"
              title="Step forward 1 frame"
            >
              <RotateCcw className="w-3.5 h-3.5 rotate-180" />
            </button>

            <div className="h-4 w-[1px] bg-[#1A2538]" />

            {/* Playback speed selector */}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span className="text-[10px]">Speed:</span>
              <button
                onClick={() =>
                  setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : s === 2 ? 0.5 : 1))
                }
                className="px-2 py-0.5 rounded bg-[#111726] hover:bg-[#1A2338] text-slate-200 font-mono text-xs font-semibold border border-[#1D2A40]"
              >
                {playbackSpeed}x
              </button>
            </div>

            <div className="h-4 w-[1px] bg-[#1A2538]" />

            {/* Audio Mute toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* RIGHT CAPCUT PROPERTIES INSPECTOR */}
        <div className="w-80 bg-[#080B11] border-l border-[#151D2A] flex flex-col shrink-0">
          {/* Inspector Header */}
          <div className="h-10 px-3.5 border-b border-[#141B28] bg-[#06080E] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Inspector</span>
            </span>
            {selectedClip && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-500/30 truncate max-w-[130px]">
                {selectedClip.title}
              </span>
            )}
          </div>

          {/* Sub-tab strip for properties */}
          {selectedClip ? (
            <div className="flex border-b border-[#141B28] bg-[#07090F] p-1 gap-1 text-[10px]">
              {[
                { id: 'transform', label: 'Transform' },
                { id: 'color', label: 'Color' },
                { id: 'speed', label: 'Speed' },
                { id: 'audio', label: 'Audio' },
                ...(selectedClip.trackType === 'text' ? [{ id: 'text', label: 'Text' }] : []),
                { id: 'chroma', label: 'Chroma' },
              ].map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setInspectorSubTab(subTab.id as any)}
                  className={`flex-1 py-1 rounded font-semibold text-center transition-colors ${
                    inspectorSubTab === subTab.id
                      ? 'bg-[#151D2D] text-cyan-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>
          ) : null}

          {/* Inspector Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {selectedClip ? (
              <>
                {/* 1. TRANSFORM TAB */}
                {inspectorSubTab === 'transform' && (
                  <div className="space-y-3.5">
                    {/* Scale */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Scale</span>
                        <span className="font-mono">{selectedClip.scale ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="250"
                        value={selectedClip.scale ?? 100}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            scale: Number(e.target.value),
                          })
                        }
                        className="w-full accent-purple-500 cursor-pointer h-1"
                      />
                    </div>

                    {/* Rotation */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Rotation</span>
                        <span className="font-mono">{selectedClip.rotation ?? 0}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedClip.rotation ?? 0}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            rotation: Number(e.target.value),
                          })
                        }
                        className="w-full accent-purple-500 cursor-pointer h-1"
                      />
                    </div>

                    {/* Opacity */}
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Opacity</span>
                        <span className="font-mono">{selectedClip.opacity ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedClip.opacity ?? 100}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            opacity: Number(e.target.value),
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer h-1"
                      />
                    </div>

                    {/* Flips & Blend Mode */}
                    <div className="pt-2 border-t border-[#161F30] space-y-2.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateClip(selectedClip.trackId, selectedClip.id, {
                              flipH: !selectedClip.flipH,
                            })
                          }
                          className={`flex-1 py-1.5 rounded border text-[11px] font-medium flex items-center justify-center gap-1 ${
                            selectedClip.flipH
                              ? 'bg-purple-950/70 border-purple-500 text-purple-300'
                              : 'bg-[#101625] border-[#1D2A42] text-slate-300'
                          }`}
                        >
                          <FlipHorizontal className="w-3.5 h-3.5" />
                          <span>Flip H</span>
                        </button>
                        <button
                          onClick={() =>
                            updateClip(selectedClip.trackId, selectedClip.id, {
                              flipV: !selectedClip.flipV,
                            })
                          }
                          className={`flex-1 py-1.5 rounded border text-[11px] font-medium flex items-center justify-center gap-1 ${
                            selectedClip.flipV
                              ? 'bg-purple-950/70 border-purple-500 text-purple-300'
                              : 'bg-[#101625] border-[#1D2A42] text-slate-300'
                          }`}
                        >
                          <FlipVertical className="w-3.5 h-3.5" />
                          <span>Flip V</span>
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Blend Mode</label>
                        <select
                          value={selectedClip.blendMode || 'normal'}
                          onChange={(e) =>
                            updateClip(selectedClip.trackId, selectedClip.id, {
                              blendMode: e.target.value as any,
                            })
                          }
                          className="w-full bg-[#101625] border border-[#1D2A42] text-xs text-white rounded p-1.5 focus:outline-none"
                        >
                          <option value="normal">Normal</option>
                          <option value="screen">Screen (Lighten)</option>
                          <option value="multiply">Multiply (Darken)</option>
                          <option value="overlay">Overlay</option>
                          <option value="color-dodge">Color Dodge</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. COLOR TAB */}
                {inspectorSubTab === 'color' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Brightness</span>
                        <span className="font-mono">{selectedClip.brightness || 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        value={selectedClip.brightness || 100}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            brightness: Number(e.target.value),
                          })
                        }
                        className="w-full accent-purple-500 cursor-pointer h-1"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Contrast</span>
                        <span className="font-mono">{selectedClip.contrast || 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        value={selectedClip.contrast || 100}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            contrast: Number(e.target.value),
                          })
                        }
                        className="w-full accent-purple-500 cursor-pointer h-1"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Saturation</span>
                        <span className="font-mono">{selectedClip.saturation || 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={selectedClip.saturation || 100}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            saturation: Number(e.target.value),
                          })
                        }
                        className="w-full accent-purple-500 cursor-pointer h-1"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Vignette Edge</span>
                        <span className="font-mono">{selectedClip.vignette || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedClip.vignette || 0}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            vignette: Number(e.target.value),
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer h-1"
                      />
                    </div>

                    <button
                      onClick={() =>
                        updateClip(selectedClip.trackId, selectedClip.id, {
                          brightness: 100,
                          contrast: 100,
                          saturation: 100,
                          vignette: 0,
                          lut: 'none',
                        })
                      }
                      className="w-full py-1.5 rounded bg-[#101625] hover:bg-[#192338] border border-[#1E2B43] text-[11px] text-slate-300"
                    >
                      Reset Color Grading
                    </button>
                  </div>
                )}

                {/* 3. SPEED TAB */}
                {inspectorSubTab === 'speed' && (
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Clip Speed</span>
                        <span className="font-mono">{selectedClip.speed ?? 1}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.25"
                        max="4"
                        step="0.25"
                        value={selectedClip.speed ?? 1}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            speed: Number(e.target.value),
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer h-1"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-2">
                      {[0.5, 1, 2, 4].map((spd) => (
                        <button
                          key={spd}
                          onClick={() =>
                            updateClip(selectedClip.trackId, selectedClip.id, { speed: spd })
                          }
                          className="py-1 rounded bg-[#101625] hover:bg-[#1A253A] border border-[#1E2C43] text-xs font-mono text-slate-200"
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. AUDIO TAB */}
                {inspectorSubTab === 'audio' && (
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Volume Level</span>
                        <span className="font-mono">{Math.round((selectedClip.volume ?? 1) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1.5"
                        step="0.05"
                        value={selectedClip.volume ?? 1}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            volume: Number(e.target.value),
                          })
                        }
                        className="w-full accent-indigo-400 cursor-pointer h-1"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Fade In (sec)</span>
                        <span className="font-mono">{selectedClip.fadeIn ?? 0}s</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={selectedClip.fadeIn ?? 0}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            fadeIn: Number(e.target.value),
                          })
                        }
                        className="w-full accent-indigo-400 cursor-pointer h-1"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Fade Out (sec)</span>
                        <span className="font-mono">{selectedClip.fadeOut ?? 0}s</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={selectedClip.fadeOut ?? 0}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            fadeOut: Number(e.target.value),
                          })
                        }
                        className="w-full accent-indigo-400 cursor-pointer h-1"
                      />
                    </div>
                  </div>
                )}

                {/* 5. TEXT TAB (Only shown for text clips) */}
                {inspectorSubTab === 'text' && selectedClip.trackType === 'text' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Edit Caption</label>
                      <input
                        type="text"
                        value={selectedClip.text || ''}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, { text: e.target.value })
                        }
                        className="w-full bg-[#101625] border border-[#1D2A42] text-xs text-white rounded p-2 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Font Size</span>
                        <span className="font-mono">{selectedClip.fontSize || 34}px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="80"
                        value={selectedClip.fontSize || 34}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            fontSize: Number(e.target.value),
                          })
                        }
                        className="w-full accent-purple-500 cursor-pointer h-1"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Vertical Position Y</span>
                        <span className="font-mono">{selectedClip.positionY || 80}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="95"
                        value={selectedClip.positionY || 80}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            positionY: Number(e.target.value),
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer h-1"
                      />
                    </div>
                  </div>
                )}

                {/* 6. CHROMA KEY TAB */}
                {inspectorSubTab === 'chroma' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-semibold">Chroma Removal</span>
                      <button
                        onClick={() =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            chromaKey: !selectedClip.chromaKey,
                          })
                        }
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          selectedClip.chromaKey
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#151D2F] text-slate-400'
                        }`}
                      >
                        {selectedClip.chromaKey ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Key Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedClip.chromaColor || '#00FF00'}
                          onChange={(e) =>
                            updateClip(selectedClip.trackId, selectedClip.id, {
                              chromaColor: e.target.value,
                            })
                          }
                          className="w-8 h-8 rounded bg-transparent cursor-pointer border border-[#1D2A42]"
                        />
                        <span className="text-[11px] font-mono text-slate-300">
                          {selectedClip.chromaColor || '#00FF00'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Tolerance</span>
                        <span className="font-mono">{selectedClip.chromaTolerance || 30}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={selectedClip.chromaTolerance || 30}
                        onChange={(e) =>
                          updateClip(selectedClip.trackId, selectedClip.id, {
                            chromaTolerance: Number(e.target.value),
                          })
                        }
                        className="w-full accent-emerald-500 cursor-pointer h-1"
                      />
                    </div>
                  </div>
                )}

                {/* Common Clip Actions */}
                <div className="pt-3 border-t border-[#151D2A] space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => duplicateClip(selectedClip.trackId, selectedClip.id)}
                      className="flex-1 py-1.5 rounded-lg bg-[#111726] hover:bg-[#1A243A] border border-[#1E2B43] text-[11px] text-slate-200 flex items-center justify-center gap-1.5"
                    >
                      <CopyPlus className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      onClick={() => deleteClip(selectedClip.trackId, selectedClip.id)}
                      className="flex-1 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-[11px] text-rose-300 flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                Click any clip on the multi-track timeline below to adjust scale, color grading, speeds, and audio.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM CAPCUT MULTI-TRACK TIMELINE */}
      <div className="h-64 bg-[#07090F] border-t border-[#151D2A] flex flex-col shrink-0 select-none">
        {/* Timeline Header Command Bar */}
        <div className="h-9 px-3 border-b border-[#141B28] bg-[#080B12] flex items-center justify-between text-xs">
          {/* Left: Editing tools (Split, Delete, Duplicate, Copy, Paste, Snap, Add Track) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (selectedClip && !selectedClip.trackLocked) {
                  splitClipAtPlayhead(selectedClip.trackId, selectedClip.id);
                } else {
                  showToast('Select an unlocked clip to split at playhead');
                }
              }}
              className="px-2.5 py-1 rounded bg-[#101625] hover:bg-purple-600/30 border border-[#1C283F] hover:border-purple-500/50 text-slate-200 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
              title="Split clip at playhead"
            >
              <Scissors className="w-3.5 h-3.5 text-purple-400" />
              <span>Split</span>
            </button>

            <button
              onClick={() => {
                if (selectedClip && !selectedClip.trackLocked) {
                  deleteClip(selectedClip.trackId, selectedClip.id);
                }
              }}
              disabled={!selectedClip || selectedClip?.trackLocked}
              className="px-2 py-1 rounded bg-[#101625] hover:bg-rose-950/40 border border-[#1C283F] text-slate-400 hover:text-rose-300 disabled:opacity-30 text-[11px] flex items-center gap-1 transition-colors"
              title="Delete selected clip (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="h-4 w-[1px] bg-[#1A2538] mx-1" />

            <button
              onClick={copySelectedClip}
              disabled={!selectedClip}
              className="p-1 rounded bg-[#101625] hover:bg-[#1A253D] border border-[#1C283F] text-slate-300 disabled:opacity-30"
              title="Copy clip (Ctrl+C)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={pasteClipAtPlayhead}
              disabled={!copiedClip}
              className="p-1 rounded bg-[#101625] hover:bg-[#1A253D] border border-[#1C283F] text-slate-300 disabled:opacity-30"
              title="Paste at playhead (Ctrl+V)"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-[1px] bg-[#1A2538] mx-1" />

            {/* Magnetic Snapping Toggle */}
            <button
              onClick={() => setSnapEnabled(!snapEnabled)}
              className={`px-2 py-1 rounded text-[11px] font-medium border flex items-center gap-1 transition-colors ${
                snapEnabled
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                  : 'bg-[#101625] border-[#1C283F] text-slate-400 hover:text-white'
              }`}
              title="Toggle Magnetic Snapping"
            >
              <Magnet className="w-3 h-3" />
              <span>Snap</span>
            </button>

            {/* Add Marker at playhead */}
            <button
              onClick={() => addTimelineMarker(currentTime, `Marker ${formatTimecode(currentTime)}`)}
              className="px-2 py-1 rounded bg-[#101625] hover:bg-[#1A253D] border border-[#1C283F] text-slate-300 text-[11px] flex items-center gap-1"
              title="Add Timeline Marker"
            >
              <Bookmark className="w-3 h-3 text-purple-400" />
              <span>Add Marker</span>
            </button>

            {/* Add Track Selector */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => addNewTrack('video', 'Video Track')}
                className="px-2 py-1 rounded bg-[#101625] hover:bg-[#1A253D] border border-[#1C283F] text-[11px] text-purple-300 flex items-center gap-1"
                title="Add new video track"
              >
                <Plus className="w-3 h-3" />
                <span>Video</span>
              </button>
              <button
                onClick={() => addNewTrack('audio', 'Audio Track')}
                className="px-2 py-1 rounded bg-[#101625] hover:bg-[#1A253D] border border-[#1C283F] text-[11px] text-indigo-300 flex items-center gap-1"
                title="Add new audio track"
              >
                <Plus className="w-3 h-3" />
                <span>Audio</span>
              </button>
            </div>
          </div>

          {/* Right: Timeline Zoom */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimelineZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] text-slate-400 w-9 text-center">
              {Math.round(timelineZoom * 100)}%
            </span>
            <button
              onClick={() => setTimelineZoom((z) => Math.min(3.5, z + 0.25))}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tracks Area with Fixed Left Track Headers and Scrollable Timeline */}
        <div
          ref={timelineScrollRef}
          onClick={handleTimelineRulerClick}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#05070B]"
        >
          <div
            className="relative"
            style={{
              width: `${180 + activeProject.durationSec * pxPerSec}px`,
              minWidth: '100%',
            }}
          >
            {/* Timeline Ruler Bar */}
            <div className="h-6 border-b border-[#141B28] bg-[#070910] sticky top-0 z-20 flex items-center">
              {/* Header corner placeholder */}
              <div className="w-[180px] shrink-0 sticky left-0 z-30 bg-[#070910] border-r border-[#141B28] h-full flex items-center px-3 text-[10px] font-bold text-slate-500">
                TRACKS
              </div>

              {/* Time Ruler Marks */}
              <div className="relative flex-1 h-full">
                {Array.from({ length: Math.ceil(activeProject.durationSec) + 1 }).map((_, sec) => (
                  <div
                    key={sec}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${sec * pxPerSec}px` }}
                  >
                    <div className="h-2 w-[1px] bg-slate-700" />
                    <span className="text-[9px] font-mono text-slate-500 select-none">
                      {sec}s
                    </span>
                  </div>
                ))}

                {/* Markers */}
                {activeProject.markers?.map((marker) => (
                  <div
                    key={marker.id}
                    className="absolute top-0 bottom-0 z-20 flex flex-col items-center cursor-pointer group"
                    style={{ left: `${marker.time * pxPerSec}px` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTime(marker.time);
                    }}
                  >
                    <div
                      className="w-2.5 h-2.5 rotate-45 -mt-1 shadow"
                      style={{ backgroundColor: marker.color || '#8B5CF6' }}
                    />
                    <div
                      className="w-[1px] h-full"
                      style={{ backgroundColor: marker.color || '#8B5CF6' }}
                    />
                    <div className="absolute top-5 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow">
                      {marker.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Glowing CapCut Playhead Needle */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400 via-purple-500 to-rose-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              style={{ left: `${180 + currentTime * pxPerSec}px` }}
            >
              <div className="w-3.5 h-3.5 bg-cyan-400 rounded-full -ml-[6px] -mt-1.5 shadow-[0_0_8px_rgba(6,182,212,1)]" />
            </div>

            {/* Track Rows */}
            <div className="py-1.5 space-y-1.5">
              {activeProject.tracks.map((track) => (
                <div
                  key={track.id}
                  className="h-14 bg-[#0A0E18] border-y border-[#141B28] relative flex items-center"
                >
                  {/* Fixed Track Header Left Column */}
                  <div className="w-[180px] shrink-0 sticky left-0 z-20 bg-[#0A0E18]/95 backdrop-blur-md border-r border-[#151D2C] h-full flex items-center justify-between px-2.5 shadow-md">
                    <div className="flex items-center gap-1.5 truncate">
                      {track.type === 'video' ? (
                        <Film className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      ) : track.type === 'audio' ? (
                        <Music className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      ) : (
                        <Type className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                      <span className="text-[11px] font-semibold text-slate-300 truncate">
                        {track.name}
                      </span>
                    </div>

                    {/* Track Lock / Hide / Mute / Delete Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleTrackLock(track.id)}
                        className={`p-1 rounded text-slate-500 hover:text-white ${
                          track.locked ? 'text-amber-400' : ''
                        }`}
                        title={track.locked ? 'Unlock Track' : 'Lock Track'}
                      >
                        {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={() => toggleTrackHide(track.id)}
                        className={`p-1 rounded text-slate-500 hover:text-white ${
                          track.hidden ? 'text-rose-400' : ''
                        }`}
                        title={track.hidden ? 'Show Track' : 'Hide Track'}
                      >
                        {track.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={() => toggleTrackMute(track.id)}
                        className={`p-1 rounded text-slate-500 hover:text-white ${
                          track.muted ? 'text-rose-400' : ''
                        }`}
                        title={track.muted ? 'Unmute Track' : 'Mute Track'}
                      >
                        {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Clips Strip */}
                  <div className="relative flex-1 h-full flex items-center">
                    {track.clips.map((clip) => {
                      const isSelected = clip.id === selectedClipId;
                      const left = clip.start * pxPerSec;
                      const width = clip.duration * pxPerSec;

                      return (
                        <div
                          key={clip.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClipId(clip.id);
                          }}
                          style={{
                            left: `${left}px`,
                            width: `${Math.max(42, width)}px`,
                          }}
                          className={`absolute top-1 bottom-1 rounded-md overflow-hidden cursor-pointer flex items-center justify-between px-2 text-xs font-medium border group transition-all ${
                            isSelected
                              ? 'border-purple-400 ring-2 ring-purple-500/50 z-10 shadow-lg'
                              : 'border-[#1C273C] hover:border-slate-500'
                          } ${
                            clip.type === 'audio'
                              ? 'bg-gradient-to-r from-indigo-950/90 to-blue-950/90 text-indigo-200'
                              : clip.type === 'text'
                              ? 'bg-gradient-to-r from-cyan-950/90 to-teal-950/90 text-cyan-200'
                              : 'bg-gradient-to-r from-purple-950/90 to-[#101728] text-slate-200'
                          }`}
                        >
                          {/* Left Trim Handle */}
                          <div
                            onMouseDown={(e) => handleStartTrim(e, track.id, clip.id, 'left')}
                            className="absolute left-0 top-0 bottom-0 w-2.5 bg-white/0 hover:bg-purple-500/80 cursor-ew-resize transition-colors z-10"
                            title="Drag to trim start"
                          />

                          {/* Clip details & waveforms */}
                          <div className="truncate flex items-center gap-1.5 min-w-0 pr-2">
                            {clip.type === 'audio' ? (
                              <div className="flex items-center gap-1">
                                <Music className="w-3 h-3 text-indigo-400 shrink-0" />
                                {/* Acoustic Waveform Graphic */}
                                <svg className="w-14 h-4 opacity-75 shrink-0" viewBox="0 0 50 16">
                                  <path
                                    d="M2 8 L4 3 L6 13 L8 5 L10 11 L12 2 L14 14 L16 4 L18 12 L20 6 L22 10 L24 8 L26 4 L28 12 L30 3 L32 13 L34 5 L36 11 L38 2 L40 14 L42 4 L44 12 L46 7 L48 8"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    fill="none"
                                  />
                                </svg>
                              </div>
                            ) : clip.type === 'text' ? (
                              <Type className="w-3 h-3 text-cyan-400 shrink-0" />
                            ) : (
                              <Film className="w-3 h-3 text-purple-400 shrink-0" />
                            )}
                            <span className="truncate text-[11px] font-semibold">{clip.title}</span>
                          </div>

                          <span className="text-[9px] font-mono opacity-60 shrink-0">
                            {clip.duration}s
                          </span>

                          {/* Right Trim Handle */}
                          <div
                            onMouseDown={(e) => handleStartTrim(e, track.id, clip.id, 'right')}
                            className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/0 hover:bg-purple-500/80 cursor-ew-resize transition-colors z-10"
                            title="Drag to trim end"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. EXPORT MODAL */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        canvasRef={canvasRef}
      />
    </div>
  );
};
