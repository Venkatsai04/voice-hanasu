import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Bot,
  Users,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Activity,
  Play,
  Phone,
  Radio,
  Sliders,
  FileText,
  Volume2,
  Calendar,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import { analyticsApi, callsApi } from '../api/index.js';
import { useSocket } from '../context/SocketContext.jsx';
import { Topbar } from '../components/Topbar.jsx';
import { CallDetailModal } from '../components/CallDetailModal.jsx';
import { TaskDialModal } from '../components/TaskDialModal.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { formatDuration, formatPhone } from '../lib/utils.js';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [data, setData] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [dialModalOpen, setDialModalOpen] = useState(false);
  const [quickTaskPrompt, setQuickTaskPrompt] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [analyticsRes, callsRes] = await Promise.all([
        analyticsApi.getDashboard('30d'),
        callsApi.list({ limit: 6 })
      ]);

      if (analyticsRes.success) setData(analyticsRes.data);
      if (callsRes.success) setRecentCalls(callsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const handleCallCompleted = (event) => {
      if (event.call) {
        setRecentCalls((prev) => [event.call, ...prev.slice(0, 5)]);
      }
      loadData();
    };

    socket.on('call:completed', handleCallCompleted);
    return () => {
      socket.off('call:completed', handleCallCompleted);
    };
  }, [socket]);

  const kpis = data?.kpis || {};

  const handleLaunchPrompt = (e) => {
    e?.preventDefault();
    setDialModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] overflow-y-auto">
      <Topbar
        title="Voice Operations Overview"
        description="Autonomous telephony telemetry and live task execution"
      />

      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Header Controls (Matching Zentra Overview Link + Date Pills) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-brand-black tracking-tight">Overview</h1>
            <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-ping" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-brand-black shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-brand-textSecondary" />
              <span>Today</span>
              <ChevronDown className="w-3 h-3 text-brand-textMuted" />
            </div>
            <button
              onClick={() => navigate('/agent')}
              className="px-4 py-1.5 rounded-full bg-[#09090B] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
            >
              Agent Studio
            </button>
            <button
              onClick={() => setDialModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-brand-red hover:bg-brand-redDark text-white text-xs font-bold shadow-sm shadow-brand-red/25 transition-all flex items-center space-x-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Dispatch Call</span>
            </button>
          </div>
        </div>

        {/* Primary Row (Inspired by Zentra Payments 3D Step Grid + Gross Volume Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large Left Card: Operations Funnel & Task Dispatcher */}
          <div className="lg:col-span-2 p-6 lg:p-8 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-brand-black">Telephony Pipeline</h2>
                  <p className="text-xs text-brand-textSecondary mt-0.5">Real-time throughput on active trunk line</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-brand-black flex items-center justify-center transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics Header Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100">
                <div>
                  <span className="block text-xs font-semibold text-brand-textSecondary">Initiated</span>
                  <span className="mt-1 block text-2xl font-bold font-mono text-brand-black">
                    {kpis.totalCalls ? `${kpis.totalCalls}` : '34'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-brand-textSecondary">Connected Trunk</span>
                  <span className="mt-1 block text-2xl font-bold font-mono text-brand-black">
                    {kpis.connectedCalls ? `${kpis.connectedCalls}` : '32'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-brand-red font-bold">Qualified Leads</span>
                  <span className="mt-1 block text-2xl font-bold font-mono text-brand-red">
                    {kpis.qualifiedLeads ? `${kpis.qualifiedLeads}` : '26'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-brand-textSecondary">Completed</span>
                  <span className="mt-1 block text-2xl font-bold font-mono text-brand-black">
                    {kpis.completedCalls ? `${kpis.completedCalls}` : '32'}
                  </span>
                </div>
              </div>

              {/* High-Contrast Graphic Visualization Bars */}
              <div className="mt-6 pt-2 grid grid-cols-4 gap-3 items-end h-32">
                <div className="h-[75%] rounded-2xl bg-slate-100 p-2 flex flex-col justify-end">
                  <span className="text-[10px] font-mono font-bold text-brand-textSecondary text-center">100%</span>
                </div>
                <div className="h-[88%] rounded-2xl bg-slate-200 p-2 flex flex-col justify-end">
                  <span className="text-[10px] font-mono font-bold text-brand-textSecondary text-center">94%</span>
                </div>
                <div className="h-[96%] rounded-2xl bg-gradient-to-t from-brand-red to-rose-400 p-2 flex flex-col justify-end shadow-md shadow-brand-red/20">
                  <span className="text-[10px] font-mono font-bold text-white text-center">78%</span>
                </div>
                <div className="h-[88%] rounded-2xl bg-[#09090B] p-2 flex flex-col justify-end">
                  <span className="text-[10px] font-mono font-bold text-white text-center">94%</span>
                </div>
              </div>
            </div>

            {/* Task Prompt Input Bar (Matching Zentra Bottom Pill Prompt) */}
            <form
              onSubmit={handleLaunchPrompt}
              className="p-2 pl-4 rounded-2xl bg-[#F4F5F7] border border-slate-200/80 flex items-center justify-between gap-3 shadow-inner"
            >
              <div className="flex items-center space-x-2.5 flex-1">
                <Sparkles className="w-4 h-4 text-brand-red shrink-0" />
                <input
                  type="text"
                  value={quickTaskPrompt}
                  onChange={(e) => setQuickTaskPrompt(e.target.value)}
                  placeholder="Assign task: e.g. Qualify 3BHK villa inquiry and confirm Saturday site visit..."
                  className="w-full bg-transparent text-xs font-medium text-brand-black placeholder:text-brand-textMuted focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-redDark text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <span>Dispatch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Right Card: Connected Airtime & Telephony Trunk (Matching Zentra Gross Volume) */}
          <div className="p-6 lg:p-8 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-brand-black">Trunk Airtime</h2>
                <button className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-brand-black flex items-center justify-center transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 flex items-baseline space-x-3">
                <span className="text-4xl font-extrabold font-mono text-brand-black tracking-tight">
                  {kpis.totalTalkMinutes ? `${kpis.totalTalkMinutes}m` : '184m'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50">
                  +18.4%
                </span>
              </div>

              {/* Progress Breakdown Bars */}
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-brand-textSecondary">Site Visit Qualification</span>
                    <span className="font-mono text-brand-black">112 mins</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-red w-[72%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-brand-textSecondary">Pricing Inquiries</span>
                    <span className="font-mono text-brand-black">48 mins</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-[#09090B] w-[45%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-brand-textSecondary">Callback Follow-ups</span>
                    <span className="font-mono text-brand-black">24 mins</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-slate-300 w-[24%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Trunk Line Footer Indicator */}
            <div className="p-3.5 rounded-2xl bg-[#F4F5F7] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-brand-black">+91 79714 14044</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-brand-red uppercase">Tenglish Voice</span>
            </div>
          </div>
        </div>

        {/* Secondary Row (Matching Zentra Retention, Transactions & Insights Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Conversion / Qualification Curve */}
          <div className="p-6 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-black">Qualification Rate</h3>
              <button className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-brand-red">94.2%</span>
              <span className="text-xs text-brand-textSecondary font-semibold">high intent</span>
            </div>
            <div className="h-20 flex items-end justify-between gap-1 pt-2">
              {[42, 50, 58, 64, 75, 82, 94].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    style={{ height: `${val}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      idx === 6 ? 'bg-brand-red' : 'bg-rose-100'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-brand-textMuted">M{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Peak Calling Days & Prospects */}
          <div className="p-6 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-black">Active Calls & Leads</h3>
              <button className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <span className="text-3xl font-extrabold font-mono text-brand-black">1,284</span>
              <span className="text-xs text-brand-textSecondary block mt-0.5">Engaged prospect profiles</span>
            </div>
            <div className="flex items-center space-x-1.5 pt-4">
              {[2, 4, 6, 8, 12, 16, 14, 10, 6, 4].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h * 4}px` }}
                  className={`w-3 rounded-full ${i === 5 ? 'bg-brand-black' : 'bg-slate-200'}`}
                />
              ))}
              <span className="ml-2 text-[11px] font-mono text-brand-textSecondary font-semibold">Peak: Wed</span>
            </div>
          </div>

          {/* Card 3: Autonomous Intelligence Summary */}
          <div className="p-6 rounded-3xl bg-[#09090B] text-white shadow-soft-card flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-brand-red flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trunk Intelligence</span>
                </span>
              </div>
              <p className="text-2xl font-bold mt-4 tracking-tight leading-snug">
                78% Direct site visit conversion achieved.
              </p>
              <p className="text-xs text-white/70 mt-2 leading-relaxed">
                Tenglish voice agent is proactively handling objections, extracting budget thresholds, and syncing confirmations to sales directors.
              </p>
            </div>
            <button
              onClick={() => setDialModalOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-white text-[#09090B] hover:bg-slate-100 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-red" />
              <span>Launch New Call Mission</span>
            </button>
          </div>
        </div>

        {/* Recent Calls Log with 1-Click Audio Preview & Structured Transcript */}
        <div className="p-6 lg:p-8 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-brand-black">Live Call Telemetry & Transcripts</h2>
              <p className="text-xs text-brand-textSecondary mt-0.5">
                Every call records audio playback, duration, sentiment, and turn-by-turn dialogue
              </p>
            </div>
            <button
              onClick={() => navigate('/calls')}
              className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-brand-black text-xs font-bold transition-colors"
            >
              View All History
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary">
                  <th className="py-3 px-3">Prospect</th>
                  <th className="py-3 px-3">Assigned Task</th>
                  <th className="py-3 px-3">Outcome</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Audio & Transcript</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentCalls && recentCalls.length > 0 ? (
                  recentCalls.map((call) => (
                    <tr
                      key={call._id}
                      onClick={() => setSelectedCall(call)}
                      className="hover:bg-[#F4F5F7]/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-brand-black">{call.targetName || 'Prospect'}</div>
                        <div className="text-[11px] font-mono text-brand-textSecondary">{formatPhone(call.targetPhone)}</div>
                      </td>
                      <td className="py-3.5 px-3 max-w-xs truncate text-brand-textSecondary">
                        {call.task || 'Property qualification inquiry'}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge outcome={call.outcome} />
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-brand-black">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-2">
                          {call.recordingUrl ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 text-brand-red text-[11px] font-bold border border-rose-200">
                              <Volume2 className="w-3 h-3" />
                              <span>Audio Available</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-brand-textMuted">Processing</span>
                          )}
                          <span className="text-[11px] font-semibold text-brand-textSecondary">
                            {call.transcript?.length || 0} turns
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCall(call);
                          }}
                          className="px-3 py-1.5 rounded-full bg-[#09090B] group-hover:bg-brand-red text-white text-[11px] font-bold transition-colors"
                        >
                          Review Call
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-xs text-brand-textMuted">
                      No calls executed yet. Click "Dispatch Call" to test the live trunk!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Task Dial Modal */}
      <TaskDialModal
        isOpen={dialModalOpen}
        onClose={() => setDialModalOpen(false)}
        initialTask={quickTaskPrompt || 'Qualify 3BHK luxury flat inquiry, verify budget ₹1.8–2.0 Cr, confirm Saturday 11:30 AM private site visit.'}
        onCallInitiated={() => loadData()}
      />

      {/* Call Detail Modal */}
      <CallDetailModal
        call={selectedCall}
        isOpen={Boolean(selectedCall)}
        onClose={() => setSelectedCall(null)}
        onRedialSuccess={() => loadData()}
      />
    </div>
  );
};
