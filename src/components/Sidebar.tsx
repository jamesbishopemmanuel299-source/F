import React from 'react';
import { useCreative } from '../context/CreativeContext';
import { AppView } from '../types';
import {
  LayoutDashboard,
  Video,
  Music,
  Film,
  Sparkles,
  Image as ImageIcon,
  Mic,
  LayoutTemplate,
  FolderOpen,
  FolderKanban,
  Cpu,
  CreditCard,
  Settings,
  ShieldCheck,
  HardDrive,
  PanelLeftClose,
  PanelLeft,
  Zap,
  X,
  Home,
} from 'lucide-react';

interface SidebarItem {
  id: AppView;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
  badgeColor?: 'purple' | 'cyan';
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    user,
  } = useCreative();

  // Navigation Items according to exact required sections and order
  const creationStudios: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'editor', label: 'Video Editor', icon: Video, badge: 'PRO', badgeColor: 'purple' },
    { id: 'music_studio', label: 'AI Music Studio', icon: Music },
    { id: 'music_video_studio', label: 'Music Video Studio', icon: Film },
    { id: 'video_generator', label: 'AI Video Gen', icon: Sparkles },
    { id: 'image_studio', label: 'AI Image Studio', icon: ImageIcon },
    { id: 'voice_studio', label: 'AI Voice Studio', icon: Mic },
  ];

  const workspaceItems: SidebarItem[] = [
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'media_library', label: 'Media Library', icon: FolderOpen },
    { id: 'my_projects', label: 'My Projects', icon: FolderKanban },
  ];

  const platformEngineItems: SidebarItem[] = [
    { id: 'models', label: 'AI Models (KIE)', icon: Cpu, badge: '12+', badgeColor: 'cyan' },
    { id: 'pricing', label: 'Pricing & Credits', icon: CreditCard },
    { id: 'admin', label: 'Admin Console', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    // Close mobile drawer if open
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const renderNavButton = (item: SidebarItem) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;

    return (
      <button
        key={item.id}
        onClick={() => handleNavClick(item.id)}
        title={isSidebarCollapsed ? `${item.label} ${item.badge ? `(${item.badge})` : ''}` : undefined}
        className={`w-full flex items-center rounded-xl transition-all duration-150 group relative ${
          isSidebarCollapsed
            ? 'justify-center p-2.5 my-1'
            : 'justify-between px-3 py-2.5 my-0.5'
        } ${
          isActive
            ? 'bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-[#121829] text-white border border-purple-500/40 shadow-sm shadow-purple-900/30'
            : 'text-slate-400 hover:text-slate-100 hover:bg-[#121826]'
        }`}
      >
        <div className={`flex items-center gap-3 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
              isActive
                ? 'bg-purple-600/30 text-purple-300'
                : 'text-slate-400 group-hover:text-purple-300 group-hover:bg-[#182133]'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
          </div>

          {!isSidebarCollapsed && (
            <span
              className={`text-xs font-semibold truncate tracking-tight transition-colors ${
                isActive ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'
              }`}
            >
              {item.label}
            </span>
          )}
        </div>

        {/* Badge */}
        {!isSidebarCollapsed && item.badge && (
          <span
            className={`text-[9px] font-extrabold font-mono px-1.5 py-0.5 rounded tracking-wide shrink-0 ${
              item.badgeColor === 'cyan'
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-700/50'
                : 'bg-purple-950/90 text-purple-300 border border-purple-700/50'
            }`}
          >
            {item.badge}
          </span>
        )}

        {/* Active Pill Indicator on collapsed mode */}
        {isSidebarCollapsed && isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-l-full" />
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Scrim */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Vertical Sidebar Container */}
      <aside
        className={`bg-[#0A0D15] border-r border-[#192233] flex flex-col shrink-0 h-[calc(100vh-57px)] sticky top-[57px] select-none transition-all duration-300 z-40 ${
          isSidebarCollapsed ? 'w-[72px]' : 'w-64'
        } ${
          isMobileSidebarOpen
            ? 'fixed left-0 top-[57px] bottom-0 z-50 translate-x-0 shadow-2xl w-64'
            : 'hidden lg:flex'
        }`}
      >
        {/* Top Control Bar (Collapsible / Expandable Trigger) */}
        <div className="p-3 border-b border-[#161F30] flex items-center justify-between shrink-0 bg-[#080B10]">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-2 group text-left"
                title="Go to Home Overview"
              >
                <div className="w-5 h-5 rounded bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Home className="w-3 h-3" />
                </div>
                <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">
                  EDITFLOW STUDIO
                </span>
              </button>

              <div className="flex items-center gap-1">
                {/* Mobile close button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151D2C] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Desktop collapse button */}
                <button
                  onClick={toggleSidebar}
                  className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151D2C] transition-colors"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151D2C] transition-colors"
                title="Expand Sidebar"
              >
                <PanelLeft className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          )}
        </div>

        {/* Vertically Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4">
          {/* SECTION 1: CREATIVE SUITE */}
          <div>
            {!isSidebarCollapsed ? (
              <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-1.5 flex items-center justify-between">
                <span>1. Creative Suite</span>
              </div>
            ) : (
              <div className="w-full h-[1px] bg-[#182133] my-2" />
            )}

            {/* Studio Engine (KIE V2.4) */}
            <button
              onClick={() => handleNavClick('models')}
              title="Studio Engine (KIE V2.4)"
              className={`w-full rounded-xl transition-all group ${
                isSidebarCollapsed
                  ? 'p-2 flex justify-center bg-[#111724] border border-[#1E293B] hover:border-cyan-500/50'
                  : 'p-2.5 bg-[#111724] border border-[#1E293B] hover:border-cyan-500/50 flex items-center justify-between'
              } ${currentView === 'models' ? 'ring-1 ring-cyan-500/60' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      Studio Engine
                    </div>
                    <div className="text-[10px] text-slate-500">Official KIE v1 Core</div>
                  </div>
                )}
              </div>

              {!isSidebarCollapsed && (
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-800/60">
                  KIE V2.4
                </span>
              )}
            </button>
          </div>

          {/* SECTION 2: CREATION STUDIOS */}
          <div>
            {!isSidebarCollapsed && (
              <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-1 flex items-center justify-between">
                <span>2. Creation Studios</span>
              </div>
            )}
            <div className="space-y-0.5">
              {creationStudios.map(renderNavButton)}
            </div>
          </div>

          {/* SECTION 3: WORKSPACE */}
          <div>
            {!isSidebarCollapsed && (
              <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-1 flex items-center justify-between">
                <span>3. Workspace</span>
              </div>
            )}
            <div className="space-y-0.5">
              {workspaceItems.map(renderNavButton)}
            </div>
          </div>

          {/* SECTION 4: PLATFORM & ENGINE */}
          <div>
            {!isSidebarCollapsed && (
              <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-1 flex items-center justify-between">
                <span>4. Platform & Engine</span>
              </div>
            )}
            <div className="space-y-0.5">
              {platformEngineItems.map(renderNavButton)}
            </div>
          </div>
        </div>

        {/* SECTION 5: SIDEBAR BOTTOM (Fixed Cloud Storage) */}
        <div className="p-3 border-t border-[#161F30] bg-[#080B10] shrink-0">
          {!isSidebarCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                  <span>Cloud Storage</span>
                </span>
                <span className="font-mono text-slate-400 tabular-nums">
                  {user.storageUsedMb} MB / {Math.round(user.storageLimitMb / 1024)} GB
                </span>
              </div>

              <div className="w-full h-1.5 bg-[#151D2C] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full shadow-[0_0_6px_rgba(139,92,246,0.6)]"
                  style={{
                    width: `${Math.max(2, Math.min(100, (user.storageUsedMb / user.storageLimitMb) * 100))}%`,
                  }}
                />
              </div>

              <div className="text-[10px] text-slate-500 flex justify-between">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Supabase Storage</span>
                </span>
                <span className="text-emerald-400 font-mono">
                  {((user.storageUsedMb / user.storageLimitMb) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-1"
              title={`Cloud Storage: ${user.storageUsedMb} MB / ${Math.round(user.storageLimitMb / 1024)} GB`}
            >
              <HardDrive className="w-4 h-4 text-purple-400" />
              <div className="w-8 h-1 bg-[#151D2C] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                  style={{
                    width: `${Math.max(4, Math.min(100, (user.storageUsedMb / user.storageLimitMb) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
