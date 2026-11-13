import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Topbar } from '../components/Topbar.jsx';
import { Building2, Users, Clock, ShieldCheck, CheckCircle2, PhoneCall, Sparkles } from 'lucide-react';

export const Settings = () => {
  const { user, organization } = useAuth();
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/70 overflow-y-auto">
      <Topbar
        title="Organization Settings"
        description="Manage workspace parameters, calling compliance windows, and team roles"
      />

      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Workspace Identity */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Workspace Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tenant identity and organization credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Organization Name</label>
              <input
                type="text"
                readOnly
                value={organization?.name || 'Raw Sahara Tech'}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Organization Slug</label>
              <input
                type="text"
                readOnly
                value={organization?.slug || 'raw-sahara'}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Telephony Line Configuration */}
        <div className="p-6 lg:p-8 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-brand-black uppercase tracking-wider">Telephony Trunk & Speech Engine</h3>
              <p className="text-xs text-brand-textSecondary mt-0.5">Primary telecommunications trunk and speech synthesis pipeline</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-black mb-1.5">Active Caller ID</label>
              <div className="flex items-center space-x-2 px-3.5 py-2.5 bg-[#F4F5F7] border border-slate-200/60 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-ping"></span>
                <span className="text-xs font-mono font-bold text-brand-black">+91 79714 14044</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-black mb-1.5">Carrier Trunk</label>
              <input
                type="text"
                readOnly
                value="Autonomous Voice Trunk"
                className="w-full px-3.5 py-2.5 bg-[#F4F5F7] border border-slate-200/60 rounded-2xl text-xs text-brand-black font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-black mb-1.5">Speech Engine</label>
              <div className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-[#F4F5F7] border border-slate-200/60 rounded-2xl">
                <Sparkles className="w-3.5 h-3.5 text-brand-red" />
                <span className="text-xs font-semibold text-brand-black">Tenglish Neural Speech</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telephony Compliance Window */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Calling Hours & Compliance</h3>
              <p className="text-xs text-slate-500 mt-0.5">Guardrails ensuring calls are only placed within legal business hours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Timezone</label>
              <input
                type="text"
                readOnly
                value={organization?.timezone || 'Asia/Kolkata (IST)'}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Earliest Calling Time</label>
              <input
                type="text"
                readOnly
                value={organization?.callingHours?.start || '09:30 AM'}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Latest Calling Time</label>
              <input
                type="text"
                readOnly
                value={organization?.callingHours?.end || '07:30 PM'}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="p-6 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Team Access & Roles</h3>
              <p className="text-xs text-slate-500 mt-0.5">Users authorized to configure and run AI voice employees</p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.name?.[0] || 'V'}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800">{user?.name}</span>
                <span className="text-[11px] text-slate-500 block font-mono">{user?.email}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 uppercase font-semibold">
              {user?.role || 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
