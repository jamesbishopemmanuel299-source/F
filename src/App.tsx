import React from 'react';
import { CreativeProvider, useCreative } from './context/CreativeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { DashboardView } from './components/DashboardView';
import { VideoEditorView } from './components/VideoEditorView';
import { MusicStudioView } from './components/MusicStudioView';
import { MusicVideoStudioView } from './components/MusicVideoStudioView';
import { VideoGeneratorView } from './components/VideoGeneratorView';
import { ImageStudioView } from './components/ImageStudioView';
import { VoiceStudioView } from './components/VoiceStudioView';
import { TemplatesView } from './components/TemplatesView';
import { MediaLibraryView } from './components/MediaLibraryView';
import { ProjectsView } from './components/ProjectsView';
import { AIModelsView } from './components/AIModelsView';
import { PricingView } from './components/PricingView';
import { AdminView } from './components/AdminView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentView, toastMessage, isAuthModalOpen, closeAuthModal, authModalMode } = useCreative();

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar />

      {/* Permanent Two-Column Layout: Sidebar on LEFT, Main Workspace on RIGHT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Permanent Left Sidebar */}
        <Sidebar />

        {/* Main Content Workspace on the RIGHT */}
        <main className="flex-1 overflow-y-auto bg-[#07090E] flex flex-col min-w-0">
          {currentView === 'home' && <HomeView />}
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'editor' && <VideoEditorView />}
          {currentView === 'music_studio' && <MusicStudioView />}
          {currentView === 'music_video_studio' && <MusicVideoStudioView />}
          {currentView === 'video_generator' && <VideoGeneratorView />}
          {currentView === 'image_studio' && <ImageStudioView />}
          {currentView === 'voice_studio' && <VoiceStudioView />}
          {currentView === 'templates' && <TemplatesView />}
          {currentView === 'media_library' && <MediaLibraryView />}
          {currentView === 'my_projects' && <ProjectsView />}
          {currentView === 'models' && <AIModelsView />}
          {currentView === 'pricing' && <PricingView />}
          {currentView === 'admin' && <AdminView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultMode={authModalMode}
      />

      {/* Global Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="px-4 py-3 rounded-xl bg-[#101726]/95 backdrop-blur-md border border-purple-500/40 text-xs font-semibold text-white shadow-2xl flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CreativeProvider>
      <MainAppContent />
    </CreativeProvider>
  );
}
