import React from 'react';
import { useCreative } from '../context/CreativeContext';
import { AppView } from '../types';
import {
  Coins,
  Video,
  User,
  Menu,
  PanelLeft,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    user,
    toggleSidebar,
    setIsMobileSidebarOpen,
    isSidebarCollapsed,
    isAuthenticated,
    openAuthModal,
    signOut,
    isAutosaving,
    lastSavedAt,
  } = useCreative();

  // Clean title for current active view
  const viewTitles: Record<AppView, string> = {
    home: 'Creative Studio Overview',
    dashboard: 'Dashboard',
    editor: 'CapCut-Style Video Editor',
    music_studio: 'AI Music Studio',
    music_video_studio: 'Music Video Studio',
    video_generator: 'AI Video Generator',
    image_studio: 'AI Image Studio',
    voice_studio: 'AI Voice Studio',
    templates: 'Template Library',
    media_library: 'Media Library',
    my_projects: 'My Projects',
    models: 'KIE AI Models Registry',
    pricing: 'Pricing & Creative Credits',
    admin: 'Admin Console',
    settings: 'Settings & Security',
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080B12]/95 backdrop-blur-md border-b border-[#1A2333] select-none">
      <div className="w-full flex items-center justify-between gap-4 px-4 py-2.5">
        {/* Zone 1: Sidebar Toggle & Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile drawer toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#141B2B] transition-colors"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar toggle icon */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141B2B] transition-colors"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <PanelLeft className="w-4 h-4 text-purple-400" />
          </button>

          {/* Brand Logo & Tagline */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-sm shadow-purple-500/20 shrink-0">
              <div className="w-full h-full bg-[#090C14] rounded-[6.5px] flex items-center justify-center">
                <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
                  EF
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors whitespace-nowrap">
                EDITFLOW <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean Studio Context / Breadcrumb & Cloud Autosave */}
        <div className="hidden md:flex items-center gap-2.5 text-xs text-slate-400">
          <span className="text-slate-600">/</span>
          <span className="font-medium text-slate-300">{viewTitles[currentView]}</span>
          <span className="text-slate-600">·</span>
          {/* Cloud Autosave Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0D1424] border border-[#1E2B43] text-[10px] text-slate-300">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isAutosaving
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
              }`}
            />
            <span className="font-mono">{isAutosaving ? 'Autosaving...' : `Saved ${lastSavedAt || 'to Cloud'}`}</span>
          </div>
        </div>

        {/* Zone 3: 1 Primary Action Area */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Credit balance display */}
          <button
            onClick={() => setCurrentView('pricing')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111726] border border-[#222E42] text-xs font-medium text-slate-300 hover:border-purple-500/40 transition-colors whitespace-nowrap"
            title="Click to top up creative credits"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono tabular-nums text-slate-200">{user.credits}</span>
            <span className="text-slate-500 font-normal hidden sm:inline">Credits</span>
          </button>

          {/* Quick Video Editor CTA */}
          <button
            onClick={() => setCurrentView('editor')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-lg shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Video Editor</span>
          </button>

          {/* Supabase Auth / User Profile Button */}
          {isAuthenticated ? (
            <div className="relative group">
              <button
                onClick={() => setCurrentView('settings')}
                className="flex items-center gap-2 p-1 rounded-lg bg-[#141B2B] hover:bg-[#1D273D] border border-[#232F42] transition-colors"
                title="Account & Supabase Settings"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-md object-cover border border-purple-500/40"
                />
                <span className="text-xs font-semibold text-slate-200 hidden lg:inline truncate max-w-[100px]">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {/* Hover Dropdown */}
              <div className="absolute right-0 top-full mt-1.5 w-52 py-2 rounded-xl bg-[#0D1322] border border-[#1E2B43] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 space-y-1 text-xs">
                <div className="px-3 py-1.5 border-b border-[#182338]">
                  <div className="font-bold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-[#151E33] hover:text-white flex items-center justify-between"
                >
                  <span>My Dashboard</span>
                  <span className="text-[9px] uppercase font-mono text-purple-400">{user.plan}</span>
                </button>
                <button
                  onClick={() => setCurrentView('settings')}
                  className="w-full px-3 py-1.5 text-left text-slate-300 hover:bg-[#151E33] hover:text-white"
                >
                  Account & Storage
                </button>
                <button
                  onClick={() => openAuthModal('connect')}
                  className="w-full px-3 py-1.5 text-left text-cyan-400 hover:bg-[#151E33] flex items-center justify-between"
                >
                  <span>Supabase Config</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </button>
                <div className="border-t border-[#182338] pt-1 mt-1">
                  <button
                    onClick={signOut}
                    className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-950/40"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
