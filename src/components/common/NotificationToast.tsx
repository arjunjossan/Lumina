import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, Info } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notification } = useStore();

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[80] animate-bounce-short bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-800 text-sm font-medium">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <span>{notification}</span>
    </div>
  );
};
