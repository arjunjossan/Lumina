import React from 'react';
import { CheckCircle2, RefreshCw, Save, Sparkles } from 'lucide-react';

export type SaveButtonState = 'idle' | 'saving' | 'saved';

export interface AdminSaveButtonProps {
  saveState: SaveButtonState;
  idleText?: string;
  savingText?: string;
  savedText?: string;
  idleIcon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'amber' | 'purple' | 'emerald';
  fullWidth?: boolean;
}

export const AdminSaveButton: React.FC<AdminSaveButtonProps> = ({
  saveState,
  idleText = 'Save to Database',
  savingText = 'Saving to Database...',
  savedText = 'Saved to Database!',
  idleIcon = <Save className="w-4 h-4" />,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  size = 'md',
  variant = 'amber',
  fullWidth = false,
}) => {
  const isSaved = saveState === 'saved';
  const isSaving = saveState === 'saving';

  // Sizing definitions
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-xs rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-sm rounded-2xl gap-2.5',
  }[size];

  // Base state classes
  let stateClasses = '';

  if (isSaved) {
    stateClasses =
      'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/30 animate-success-pop animate-success-glow border border-emerald-400/40';
  } else if (isSaving) {
    stateClasses =
      'bg-amber-400 text-slate-950 font-bold opacity-85 cursor-wait shadow-md border border-amber-300/40';
  } else {
    // Idle variant
    if (variant === 'purple') {
      stateClasses =
        'bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/20 hover:shadow-purple-600/30 border border-purple-500/40 active:scale-95';
    } else if (variant === 'emerald') {
      stateClasses =
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 border border-emerald-400/40 active:scale-95';
    } else {
      // Default amber
      stateClasses =
        'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 border border-amber-400/40 active:scale-95';
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isSaving}
      className={`relative inline-flex items-center justify-center transition-all duration-300 select-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${stateClasses} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {isSaving ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
          <span className="tracking-wide animate-pulse">{savingText}</span>
        </>
      ) : isSaved ? (
        <>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
          </span>
          <CheckCircle2 className="w-4 h-4 animate-checkmark-pop shrink-0 stroke-[2.5]" />
          <span className="tracking-wide font-black">{savedText}</span>
          <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-pulse ml-0.5" />
        </>
      ) : (
        <>
          {idleIcon && <span className="shrink-0">{idleIcon}</span>}
          <span className="tracking-wide">{idleText}</span>
        </>
      )}
    </button>
  );
};
