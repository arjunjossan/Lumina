import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminSaveButton } from './AdminSaveButton';
import { 
  KeyRound, 
  Lock, 
  Check, 
  AlertCircle, 
  Mail, 
  Key, 
  Sun, 
  Moon, 
  RefreshCw, 
  CheckCircle2,
  Share2
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { 
    changeAdminPassword,
    adminTheme,
    setAdminTheme,
    setAdminTab
  } = useStore();

  // Resend API Key State & Save State
  const [resendApiKeyInput, setResendApiKeyInput] = useState('');
  const [resendFromEmailInput, setResendFromEmailInput] = useState('');
  const [resendKeyMsg, setResendKeyMsg] = useState('');
  const [resendStatus, setResendStatus] = useState<{ configured: boolean; maskedKey: string | null; fromEmail?: string } | null>(null);
  const [resendSaveState, setResendSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Password Change State & Save State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passSaveState, setPassSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    fetch('/api/auth/resend-status')
      .then(res => res.json())
      .then(data => {
        setResendStatus(data);
        if (data.fromEmail) setResendFromEmailInput(data.fromEmail);
      })
      .catch(() => null);
  }, []);

  const handleSaveResendKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendKeyMsg('');

    if (!resendApiKeyInput.trim() && !resendFromEmailInput.trim()) {
      setResendKeyMsg('Please enter a Resend API key (re_...) or sender email.');
      return;
    }

    setResendSaveState('saving');
    try {
      const res = await fetch('/api/auth/resend-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          apiKey: resendApiKeyInput.trim() || undefined,
          fromEmail: resendFromEmailInput.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setResendKeyMsg('✅ Resend configuration saved to database successfully!');
        setResendApiKeyInput('');
        setResendSaveState('saved');
        fetch('/api/auth/resend-status')
          .then(r => r.json())
          .then(d => setResendStatus(d));
        setTimeout(() => setResendSaveState('idle'), 3500);
      } else {
        setResendKeyMsg(`❌ ${data.message}`);
        setResendSaveState('idle');
      }
    } catch (err: any) {
      setResendKeyMsg('Failed to update Resend settings.');
      setResendSaveState('idle');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    setPassSaveState('saving');

    const res = changeAdminPassword(oldPass, newPass);
    if (!res.success) {
      setPassError(res.message);
      setPassSaveState('idle');
    } else {
      setPassSuccess('Admin passcode updated and saved to database successfully!');
      setOldPass('');
      setNewPass('');
      setPassSaveState('saved');
      setTimeout(() => setPassSaveState('idle'), 3500);
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <h2 className="text-xl font-bold text-white font-serif">Store Settings & Security Controls</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage admin passcode, email verification services, and interface appearance.
        </p>
      </div>

      {/* SECTION: ADMIN PORTAL APPEARANCE & THEME */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Admin Portal Theme & Appearance</span>
            </h3>
            <p className="text-xs text-slate-400">Choose between Light Mode and Dark Mode for the entire Admin Control Center.</p>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            adminTheme === 'light' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
          }`}>
            Current: {adminTheme} Mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Mode Option */}
          <button
            type="button"
            onClick={() => setAdminTheme('light')}
            className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
              adminTheme === 'light'
                ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-extrabold text-white text-xs block">☀️ Light Mode</span>
              <p className="text-[11px] text-slate-400 mt-0.5">High contrast, clean slate canvas for bright environments.</p>
            </div>
          </button>

          {/* Dark Mode Option */}
          <button
            type="button"
            onClick={() => setAdminTheme('dark')}
            className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
              adminTheme === 'dark'
                ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-extrabold text-white text-xs block">🌙 Dark Mode</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Sleek midnight dark background for reduced eye strain.</p>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 5 & 6: SECURITY PASSCODE & RESEND INTEGRATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change Passcode */}
        <form onSubmit={handlePasswordChange} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Admin Access Security & Passcode</span>
          </h3>

          {passError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-2 text-[11px] animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{passSuccess}</span>
            </div>
          )}

          <div>
            <label className="font-bold text-white block mb-1">Current Passcode</label>
            <input
              type="password"
              placeholder="Enter current passcode..."
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="font-bold text-white block mb-1">New Passcode</label>
            <input
              type="password"
              placeholder="Enter new passcode (min 4 characters)..."
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <AdminSaveButton
            type="submit"
            saveState={passSaveState}
            idleText="Save New Admin Passcode"
            savingText="Updating Passcode..."
            savedText="Passcode Updated & Saved!"
            idleIcon={<KeyRound className="w-4 h-4" />}
          />
        </form>

        {/* Resend API Key Integration */}
        <form onSubmit={handleSaveResendKey} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Resend Email API Integration & Sender Domain</span>
            </h3>
            {resendStatus?.configured ? (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Active ({resendStatus.maskedKey})</span>
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                Not Configured
              </span>
            )}
          </div>

          <p className="text-slate-400 text-xs">
            Resend powers passwordless 6-digit email OTP verification codes sent to customers during checkout. If using test mode (<span className="font-mono text-amber-400">onboarding@resend.dev</span>), Resend restricts delivery to your registered Resend email address. To send to all customers, configure a verified domain.
          </p>

          {resendKeyMsg && (
            <p className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-amber-400 font-semibold animate-in fade-in duration-200">
              {resendKeyMsg}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Resend API Key</label>
              <input
                type="password"
                placeholder="re_123456789..."
                value={resendApiKeyInput}
                onChange={(e) => setResendApiKeyInput(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Sender "From" Email (Optional Custom Domain)</label>
              <input
                type="text"
                placeholder="onboarding@resend.dev (or support@yourdomain.com)"
                value={resendFromEmailInput}
                onChange={(e) => setResendFromEmailInput(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <AdminSaveButton
              type="submit"
              saveState={resendSaveState}
              idleText="Save Resend Configuration"
              savingText="Saving Configuration..."
              savedText="Config Saved to Database!"
              idleIcon={<Key className="w-4 h-4" />}
            />
          </div>
        </form>
      </div>

      {/* Social Media Links Shortcut Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Social Media & Footer Channels</h3>
              <p className="text-xs text-slate-400">Control social links (Facebook, Instagram, X, TikTok, WhatsApp, YouTube, LinkedIn) and community badges</p>
            </div>
          </div>
          <button
            onClick={() => setAdminTab('social')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>Configure Social Links</span>
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
