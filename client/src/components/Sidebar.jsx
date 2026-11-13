import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  PhoneCall,
  Users,
  History,
  BarChart3,
  Cpu,
  Settings,
  LogOut,
  Building2,
  Radio,
  Phone,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { TaskDialModal } from './TaskDialModal.jsx';

export const Sidebar = () => {
  const { user, organization, logout } = useAuth();
  const { isConnected } = useSocket();
  const [dialModalOpen, setDialModalOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Voice Agent', path: '/agent', icon: Bot },
    { label: 'Campaigns', path: '/campaigns', icon: PhoneCall },
    { label: 'Leads', path: '/leads', icon: Users },
    { label: 'Call History', path: '/calls', icon: History },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Integrations', path: '/integrations', icon: Cpu },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none z-20 shadow-soft-card">
        <div>
          {/* Brand Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-[#09090B] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-black/20">
                <span className="text-brand-red font-black">S</span>V
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-brand-black">SAHARA</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold bg-rose-50 text-brand-red border border-rose-200">
                    VOICE
                  </span>
                </div>
                <p className="text-[10px] text-brand-textMuted font-medium">Voice Intelligence Platform</p>
              </div>
            </div>
          </div>

          {/* Quick Dial CTA Button */}
          <div className="p-4 pb-2">
            <button
              onClick={() => setDialModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-full bg-brand-red hover:bg-brand-redDark text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm shadow-brand-red/25 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Quick Dispatch</span>
            </button>
          </div>

          {/* Navigation Items (Pill Style inspired by Zentra) */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#09090B] text-white shadow-sm'
                        : 'text-brand-textSecondary hover:text-brand-black hover:bg-slate-100/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Secured Outbound Trunk Line */}
          <div className="p-3.5 rounded-2xl bg-[#F4F5F7] border border-slate-200/60 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
                <span className="text-[11px] font-bold text-brand-black">Secured Trunk Line</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-brand-black tracking-tight">
                +91 79714 14044
              </span>
              <span className="text-[10px] text-brand-textSecondary font-medium">Cellular Trunk</span>
            </div>
          </div>

          {/* User Card */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-brand-black">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-brand-black truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-brand-textMuted truncate font-mono">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-brand-red hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Task Dial Modal */}
      <TaskDialModal
        isOpen={dialModalOpen}
        onClose={() => setDialModalOpen(false)}
      />
    </>
  );
};
