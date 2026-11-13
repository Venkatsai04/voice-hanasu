import React, { useState } from 'react';
import { Sparkles, Plus, Radio, Phone, Search, Bell } from 'lucide-react';
import { useSocket } from '../context/SocketContext.jsx';
import { TaskDialModal } from './TaskDialModal.jsx';

export const Topbar = ({ title, description, actions }) => {
  const { isConnected } = useSocket();
  const [dialModalOpen, setDialModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 px-6 lg:px-8 border-b border-slate-200/70 bg-white/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-base font-bold text-brand-black tracking-tight">{title}</h1>
          {description && <p className="text-xs text-brand-textSecondary mt-0.5">{description}</p>}
        </div>

        <div className="flex items-center space-x-3">
          {/* Active Trunk Line Badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#F4F5F7] border border-slate-200/70">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
            <span className="text-xs font-mono font-bold text-brand-black">
              +91 79714 14044
            </span>
          </div>

          {/* Real-time Socket Live Badge */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#F4F5F7] border border-slate-200/70">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-slate-400'}`} />
            <span className="text-[11px] font-mono font-semibold text-brand-textSecondary">
              {isConnected ? 'TRUNK LIVE' : 'CONNECTING'}
            </span>
          </div>

          {actions ? (
            actions
          ) : (
            <button
              onClick={() => setDialModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-brand-red hover:bg-brand-redDark text-white font-bold text-xs shadow-sm shadow-brand-red/20 transition-all active:scale-[0.98]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Direct Dial</span>
            </button>
          )}
        </div>
      </header>

      <TaskDialModal
        isOpen={dialModalOpen}
        onClose={() => setDialModalOpen(false)}
      />
    </>
  );
};
