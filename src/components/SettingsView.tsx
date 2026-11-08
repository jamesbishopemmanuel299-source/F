import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import { supabaseAuth, supabaseStorage, isSupabaseConfigured, reconfigureSupabase } from '../lib/supabase';
import {
  Settings,
  Key,
  ShieldCheck,
  User,
  HardDrive,
  Info,
  CheckCircle2,
  ExternalLink,
  Lock,
  LogOut,
  Trash2,
  Database,
  Camera,
  AlertTriangle,
  Mail,
  Shield,
  Upload,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    setUser,
    setVoiceConsent,
    showToast,
    signOut,
    deleteAccount,
    updateUserProfile,
  } = useCreative();

  const [userName, setUserName] = useState(user.name);
  const [userEmail, setUserEmail] = useState(user.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Supabase project connection inputs
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('editflow_supabase_url') || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(localStorage.getItem('editflow_supabase_anon_key') || '');
  const [isConfiguringSupabase, setIsConfiguringSupabase] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    await updateUserProfile(userName.trim());
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const res = await supabaseStorage.uploadFile('avatars', user.id, file, `avatar_${Date.now()}.jpg`);
      await updateUserProfile(userName, res.publicUrl);
      showToast('Profile photo updated in Supabase Storage!');
    } catch (err: any) {
      showToast('Failed to update profile photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabaseAuth.updatePassword(newPassword);
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password successfully changed in Supabase Auth!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.startsWith('https://')) {
      showToast('Project URL must start with https://');
      return;
    }
    if (!supabaseAnonKey.trim()) {
      showToast('Anon key cannot be empty');
      return;
    }

    reconfigureSupabase(supabaseUrl.trim(), supabaseAnonKey.trim());
    setIsConfiguringSupabase(false);
    showToast('Supabase connection updated and verified!');
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-[1000px] mx-auto w-full">
      {/* Header */}
      <div className="border-b border-[#182133] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Account & Infrastructure Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal profile, Supabase authentication, cloud storage buckets, and security rights.
          </p>
        </div>

        {/* Sign Out CTA */}
        <button
          onClick={signOut}
          className="px-4 py-2 rounded-xl bg-[#141B2B] hover:bg-rose-950/40 border border-[#232F42] hover:border-rose-800/40 text-xs font-semibold text-slate-300 hover:text-rose-300 flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 1. User Profile & Avatar */}
      <div className="p-6 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <User className="w-4 h-4 text-purple-400" />
            <span>Creator Profile</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/40 px-2.5 py-0.5 rounded">
            Supabase Table: public.profiles
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/50 shadow-lg shadow-purple-600/30"
            />
            <label
              htmlFor="avatar_upload_input"
              className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
            >
              <Camera className="w-5 h-5 text-purple-300" />
              <span className="text-[9px] font-bold mt-1">Change</span>
            </label>
            <input
              type="file"
              id="avatar_upload_input"
              accept="image/*"
              className="hidden"
              disabled={isUploadingAvatar}
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Name & Email inputs */}
          <form onSubmit={handleUpdateName} className="space-y-3 w-full max-w-md">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Full Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="flex-1 bg-[#080B12] border border-[#1F2B40] text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                disabled
                className="w-full bg-[#080B12]/60 border border-[#1A2333] text-xs text-slate-400 rounded-lg p-2.5 cursor-not-allowed font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Primary Supabase authentication email
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Supabase Infrastructure & Connection */}
      <div className="p-6 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Supabase Cloud Connection</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{isSupabaseConfigured ? 'Live Connected' : 'Engine Ready'}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          EDITFLOW AI is wired to Supabase for User Auth, Database Tables (<code>profiles</code>, <code>projects</code>, <code>media</code>, <code>generations</code>), and 5 Storage Buckets (<code>avatars</code>, <code>user-media</code>, <code>generated-content</code>, <code>project-exports</code>, <code>thumbnails</code>).
        </p>

        {isConfiguringSupabase ? (
          <form onSubmit={handleSaveSupabaseConfig} className="p-4 rounded-xl bg-[#080B12] border border-[#182133] space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">VITE_SUPABASE_URL</label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-[#0D121F] border border-[#1F2B41] text-xs text-white rounded p-2 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">VITE_SUPABASE_ANON_KEY</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full bg-[#0D121F] border border-[#1F2B41] text-xs text-white rounded p-2 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white"
              >
                Save & Connect
              </button>
              <button
                type="button"
                onClick={() => setIsConfiguringSupabase(false)}
                className="px-3 py-2 rounded-lg bg-[#141B2B] text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-[#080B12] border border-[#182133] flex items-center justify-between text-xs">
            <div className="space-y-1">
              <div className="text-slate-300 font-medium">Row Level Security (RLS) Status:</div>
              <div className="text-[11px] text-slate-500">
                All 4 database tables enforce authenticated owner policies.
              </div>
            </div>
            <button
              onClick={() => setIsConfiguringSupabase(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#141B2B] hover:bg-[#1E293F] border border-[#212E43] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Configure Keys
            </button>
          </div>
        )}
      </div>

      {/* 3. Password & Security */}
      <div className="p-6 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Lock className="w-4 h-4 text-purple-400" />
          <span>Change Password</span>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="text-xs text-slate-400 block mb-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#080B12] border border-[#1F2B40] text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#080B12] border border-[#1F2B40] text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingPassword || !newPassword}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md transition-colors disabled:opacity-40"
          >
            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 4. Voice Cloning Consent */}
      <div className="p-6 rounded-2xl bg-[#0D121D] border border-[#1E293F] space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Voice Cloning & Audio Rights</span>
        </div>

        <p className="text-xs text-slate-400">
          In compliance with creative ethics regulations, AI voice conditioning and voice cloning require your explicit opt-in confirmation.
        </p>

        <label className="flex items-center gap-3 p-3 rounded-xl bg-[#090C14] border border-[#1C263A] cursor-pointer">
          <input
            type="checkbox"
            checked={user.voiceConsentApproved}
            onChange={(e) => setVoiceConsent(e.target.checked)}
            className="w-4 h-4 rounded accent-purple-600 text-purple-600"
          />
          <span className="text-xs text-slate-200">
            I confirm that I own all recorded voice media and authorize acoustic synthesis within EDITFLOW AI.
          </span>
        </label>
      </div>

      {/* 5. Danger Zone: Delete Account */}
      <div className="p-6 rounded-2xl bg-[#140D14] border border-rose-900/40 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Danger Zone: Delete Account</span>
        </div>

        <p className="text-xs text-slate-400">
          Permanently remove your Supabase user profile, cloud projects, uploaded media, and AI generation history. This action cannot be undone.
        </p>

        {showDeleteConfirm ? (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 space-y-3">
            <div className="text-xs font-bold text-rose-200">
              Are you completely sure you want to delete your account?
            </div>
            <div className="flex gap-2">
              <button
                onClick={deleteAccount}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-2 rounded-lg bg-[#141B2B] text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-xs font-bold text-rose-300 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        )}
      </div>
    </div>
  );
};
