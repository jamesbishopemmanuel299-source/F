import React, { useState } from 'react';
import { useCreative } from '../context/CreativeContext';
import { supabaseAuth, isSupabaseConfigured, reconfigureSupabase } from '../lib/supabase';
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup' | 'forgot' | 'connect';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { user, setUser, showToast, setCurrentView } = useCreative();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'connect'>(defaultMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Supabase live configuration state
  const [customUrl, setCustomUrl] = useState(localStorage.getItem('editflow_supabase_url') || '');
  const [customKey, setCustomKey] = useState(localStorage.getItem('editflow_supabase_anon_key') || '');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const { data, error } = await supabaseAuth.signUp(email, password, fullName);
        if (error) throw error;

        setUser((prev) => ({
          ...prev,
          id: data.user?.id || prev.id,
          name: fullName,
          email: email,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
        }));

        setSuccessMsg('Account created successfully! Welcome to EDITFLOW AI.');
        showToast(`Welcome, ${fullName}! Your cloud profile is active.`);
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 1200);
      } else if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Please enter both email and password');
        }

        const { data, error } = await supabaseAuth.signIn(email, password);
        if (error) throw error;

        const profile = data.user?.id ? await supabaseAuth.getProfile(data.user.id) : null;

        setUser((prev) => ({
          ...prev,
          id: data.user?.id || prev.id,
          name: profile?.name || data.user?.user_metadata?.full_name || email.split('@')[0],
          email: email,
          avatarUrl: profile?.avatarUrl || prev.avatarUrl,
          credits: profile?.credits ?? prev.credits,
        }));

        setSuccessMsg('Signed in successfully!');
        showToast('Logged in to EDITFLOW AI');
        setTimeout(() => {
          onClose();
          setCurrentView('dashboard');
        }, 1000);
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Please enter your account email address');
        }

        const { error } = await supabaseAuth.resetPassword(email);
        if (error) throw error;

        setSuccessMsg('Password reset link sent! Check your inbox.');
        showToast('Password reset link sent');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.startsWith('https://')) {
      setErrorMsg('Project URL must start with https://');
      return;
    }
    if (!customKey.trim()) {
      setErrorMsg('Anon API Key cannot be empty');
      return;
    }

    reconfigureSupabase(customUrl.trim(), customKey.trim());
    setSuccessMsg('Supabase credentials saved and connected!');
    showToast('Supabase backend connected!');
    setTimeout(() => {
      setMode('login');
      setErrorMsg(null);
      setSuccessMsg(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0A0E18] border border-[#1E293F] rounded-2xl shadow-2xl shadow-purple-950/40 overflow-hidden">
        {/* Top Gradient Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141B2B] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Container */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/40 text-[10px] font-semibold text-purple-300">
              <Database className="w-3 h-3 text-cyan-400" />
              <span>Supabase Cloud Infrastructure</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {mode === 'signup'
                ? 'Create Your Account'
                : mode === 'forgot'
                ? 'Reset Your Password'
                : mode === 'connect'
                ? 'Connect Supabase Project'
                : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'signup'
                ? 'Join EDITFLOW AI for cloud projects, storage & KIE models'
                : mode === 'forgot'
                ? 'Enter your email to receive a secure recovery link'
                : mode === 'connect'
                ? 'Enter your Supabase URL & Anon Key for real cloud sync'
                : 'Sign in to access your projects and cloud storage'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'connect' && (
            <div className="flex p-1 rounded-xl bg-[#0F1422] border border-[#1C263A] text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Alert / Feedback message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Connect Tab Form */}
          {mode === 'connect' ? (
            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  required
                  className="w-full bg-[#0E1320] border border-[#1F2B41] text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  required
                  className="w-full bg-[#0E1320] border border-[#1F2B41] text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Connect Supabase</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                Back to Login
              </button>
            </form>
          ) : (
            /* Auth Form (Login, Signup, Forgot) */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full bg-[#0E1320] border border-[#1F2B41] text-xs text-white rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#0E1320] border border-[#1F2B41] text-xs text-white rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-[#0E1320] border border-[#1F2B41] text-xs text-white rounded-lg pl-9 pr-10 py-2.5 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-[#0E1320] border border-[#1F2B41] text-xs text-white rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-bold text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>
                  {loading
                    ? 'Processing...'
                    : mode === 'signup'
                    ? 'Create Account'
                    : mode === 'forgot'
                    ? 'Send Password Reset'
                    : 'Sign In to Studio'}
                </span>
              </button>

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-center text-xs text-slate-400 hover:text-white pt-2"
                >
                  Back to Sign In
                </button>
              )}
            </form>
          )}

          {/* Footer connection indicator & toggle */}
          <div className="pt-3 border-t border-[#151D2A] flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-cyan-400'
                }`}
              />
              <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Supabase Active'}</span>
            </div>

            <button
              onClick={() => setMode(mode === 'connect' ? 'login' : 'connect')}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>{mode === 'connect' ? 'Standard Auth' : 'Project Config'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
