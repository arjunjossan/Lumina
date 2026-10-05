import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  X, 
  Sparkles, 
  Lock, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { 
    isAdminLoginModalOpen, 
    setIsAdminLoginModalOpen, 
    loginAdmin, 
    navigateTo 
  } = useStore();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  if (!isAdminLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Please enter the admin security passcode.');
      return;
    }

    const success = loginAdmin(password);
    if (success) {
      setPassword('');
      setErrorMsg('');
      setFailedAttempts(0);
      navigateTo('admin');
    } else {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      setErrorMsg(`Invalid passcode. Attempt ${attempts} of 5. Try default demo key: admin123`);
    }
  };

  const handleQuickFillDemo = () => {
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-white space-y-6">
        
        {/* Close Modal Button */}
        <button
          onClick={() => setIsAdminLoginModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black font-serif tracking-tight text-white">Lumina Admin Authentication</h3>
            <p className="text-xs text-slate-400 mt-1">Enter your secure passcode to access store control center.</p>
          </div>
        </div>

        {/* Quick Demo Helper Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block text-white text-[11px]">Demo Mode Credentials</span>
              <span className="text-[10px] text-amber-300/80">Default Passcode: <code className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-amber-400">admin123</code></span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickFillDemo}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Auto-fill
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-3 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Admin Passcode</span>
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter admin passcode..."
                autoFocus
                className="w-full pl-4 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Unlock Admin Center</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-800/80">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>256-Bit Encrypted Admin Portal Session</span>
          </p>
        </div>

      </div>
    </div>
  );
};
