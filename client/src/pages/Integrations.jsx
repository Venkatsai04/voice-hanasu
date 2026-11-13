import React, { useState } from 'react';
import {
  Cpu,
  Phone,
  ShieldCheck,
  Radio,
  CheckCircle2,
  Lock,
  Zap,
  Server,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { Topbar } from '../components/Topbar.jsx';

export const Integrations = () => {
  const [carrierStatus] = useState('Online');
  const [voiceTrunk] = useState('+91 79714 14044');
  const [latency] = useState('240ms');
  const [audioFmt] = useState('24kHz HD Audio (WAV/Linear PCM)');
  const [saveMsg, setSaveMsg] = useState('');

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] overflow-y-auto">
      <Topbar
        title="Voice Infrastructure & Trunk Lines"
        description="Autonomous telecommunications trunk configuration, audio streaming quality, and line encryption"
      />

      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        {saveMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{saveMsg}</span>
          </div>
        )}

        {/* Primary Secured Trunk Line Card */}
        <div className="p-6 lg:p-8 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-brand-black">Provisioned Voice Trunk Line</h2>
              <p className="text-xs text-brand-textSecondary mt-0.5">
                Direct cellular telecommunications trunk line dedicated to real-time inbound & outbound agent missions.
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Active on Trunk
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-[#F4F5F7]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-brand-textSecondary font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-4">Trunk Number</th>
                  <th className="p-4">Channel Type</th>
                  <th className="p-4">Latency</th>
                  <th className="p-4">Encryption</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr>
                  <td className="p-4 font-mono font-bold text-brand-black text-sm">
                    {voiceTrunk}
                  </td>
                  <td className="p-4 text-brand-textSecondary font-medium">Cellular Telephony Trunk</td>
                  <td className="p-4 font-mono font-bold text-brand-red">{latency}</td>
                  <td className="p-4 text-brand-textSecondary font-medium flex items-center space-x-1 mt-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>TLS 1.3 / SRTP</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Operational
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Engine Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Conversational Speech Synthesis */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-black">Voice Synthesis Pipeline</h3>
                <p className="text-[11px] text-brand-textSecondary">High-naturalness Tenglish neural audio</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-brand-textSecondary">Language Blending</span>
                <span className="font-semibold text-brand-black">Tenglish (Telugu + English)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-brand-textSecondary">Sample Rate</span>
                <span className="font-mono font-bold text-brand-black">24,000 Hz</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-brand-textSecondary">Tone Profile</span>
                <span className="font-semibold text-brand-red">Consultative & Articulate</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-textSecondary">Interruption Recovery</span>
                <span className="text-emerald-600 font-bold">Sub-150ms Automatic</span>
              </div>
            </div>
          </div>

          {/* Card 2: Call Recording & Storage Vault */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#09090B] flex items-center justify-center text-white">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-black">Audio Recording Vault</h3>
                <p className="text-[11px] text-brand-textSecondary">Encrypted call audio storage & replay</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-brand-textSecondary">Recording Quality</span>
                <span className="font-semibold text-brand-black">Lossless Linear Audio</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-brand-textSecondary">Retention Period</span>
                <span className="font-mono font-bold text-brand-black">365 Days</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-brand-textSecondary">Live Audio Player</span>
                <span className="font-semibold text-emerald-600">Built-in In-Browser Playback</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-textSecondary">Transcripts Pipeline</span>
                <span className="font-semibold text-brand-red">Turn-by-turn Synchronized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
