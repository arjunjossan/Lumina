import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  Lock,
  Send
} from 'lucide-react';

export const CustomerAuthModal: React.FC = () => {
  const { 
    isCustomerAuthModalOpen, 
    setIsCustomerAuthModalOpen, 
    customerAuthModalReason,
    setCustomerAuthModalReason,
    sendCustomerOtp, 
    verifyCustomerOtp,
    customerUser
  } = useStore();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<{ configured: boolean; maskedKey: string | null } | null>(null);

  useEffect(() => {
    if (isCustomerAuthModalOpen) {
      // Fetch server Resend API key status
      fetch('/api/auth/resend-status')
        .then(res => res.json())
        .then(data => setResendStatus(data))
        .catch(() => setResendStatus(null));
    }
  }, [isCustomerAuthModalOpen]);

  if (!isCustomerAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const result = await sendCustomerOtp(email);
    setLoading(false);

    if (result.success) {
      setStep('otp');
      if (result.debugOtp) {
        setDebugOtp(result.debugOtp);
        setInfoMsg(result.message || 'Verification code generated.');
      } else {
        setDebugOtp(null);
        setInfoMsg(`📨 Verification code sent to ${email}! Please check your email inbox.`);
      }
    } else {
      setErrorMsg(result.message || 'Failed to send OTP code.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!otp || otp.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    const result = await verifyCustomerOtp(email, otp.trim());
    setLoading(false);

    if (result.success) {
      setIsCustomerAuthModalOpen(false);
      setStep('email');
      setOtp('');
      setDebugOtp(null);
      setInfoMsg('');
    } else {
      setErrorMsg(result.message || 'Verification failed.');
    }
  };

  const handleResendCode = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    const result = await sendCustomerOtp(email);
    setLoading(false);
    if (result.success) {
      if (result.debugOtp) {
        setDebugOtp(result.debugOtp);
        setInfoMsg(result.message || 'New code generated.');
      } else {
        setDebugOtp(null);
        setInfoMsg(`📨 A new code was sent to ${email}! Please check your inbox.`);
      }
    } else {
      setErrorMsg(result.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 space-y-6 text-slate-800">
        
        {/* Close Modal */}
        <button
          onClick={() => {
            setIsCustomerAuthModalOpen(false);
            setCustomerAuthModalReason(null);
            setErrorMsg('');
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-2">
          {customerAuthModalReason === 'checkout' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold mb-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Step 1: Sign in to Proceed to Shipping Details</span>
            </div>
          ) : null}
          <div className="w-14 h-14 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-900">
            {step === 'email' 
              ? (customerAuthModalReason === 'checkout' ? 'Sign In Before Shipping Details' : 'Customer Authentication') 
              : 'Verify Email OTP Code'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {step === 'email' 
              ? (customerAuthModalReason === 'checkout'
                  ? 'Sign in or verify your email to enter your shipping details and complete checkout securely.'
                  : 'Enter your email address to receive a secure one-time login code via Resend.')
              : `We sent a 6-digit code to ${email}. Check your inbox to verify.`}
          </p>
        </div>

        {/* Resend status indicator */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-600" />
            <span>Resend Email Integration:</span>
          </div>
          {resendStatus?.configured ? (
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Active</span>
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
              Ready (Add Key in Settings)
            </span>
          )}
        </div>

        {/* Debug OTP Banner when running in fallback mode */}
        {debugOtp && (
          <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Verification Code</span>
              </span>
              <button
                type="button"
                onClick={() => setOtp(debugOtp)}
                className="text-[10px] font-black bg-amber-600 text-white px-2 py-0.5 rounded hover:bg-amber-700"
              >
                Auto-fill Code
              </button>
            </div>
            <p className="text-lg font-mono font-black text-slate-900 tracking-widest text-center py-1 bg-white rounded-lg border border-amber-200">
              {debugOtp}
            </p>
          </div>
        )}

        {/* Info Alert for real email or status */}
        {infoMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: EMAIL INPUT */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Your Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="name@example.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send OTP Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP VERIFICATION */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">6-Digit Verification Code</label>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-[11px] font-bold text-amber-600 hover:underline"
                >
                  Change Email
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setErrorMsg('');
                  }}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors text-center"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Code & Login</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-xs text-slate-500 hover:text-amber-600 font-bold inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Didn't receive code? Resend</span>
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 text-center border-t border-slate-100 text-[11px] text-slate-400">
          <span>🔒 Instant passwordless email authentication powered by Resend</span>
        </div>

      </div>
    </div>
  );
};
