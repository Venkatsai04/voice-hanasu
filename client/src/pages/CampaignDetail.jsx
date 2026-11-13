import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Play,
  Pause,
  Square,
  Bot,
  ArrowLeft,
  Activity,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Radio
} from 'lucide-react';
import { campaignsApi } from '../api/index.js';
import { Topbar } from '../components/Topbar.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { CallDetailModal } from '../components/CallDetailModal.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { formatDuration, formatPhone } from '../lib/utils.js';

export const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [liveStream, setLiveStream] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const res = await campaignsApi.get(id);
      if (res.success) {
        setCampaign(res.data.campaign);
        setLeads(res.data.leads || []);
        setRecentCalls(res.data.recentCalls || []);
      }
    } catch (err) {
      console.error('Error loading campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join:campaign', id);

    const handleMetricsUpdate = (data) => {
      if (data.campaignId === id) {
        setCampaign(prev => prev ? ({
          ...prev,
          metrics: data.metrics || prev.metrics,
          leadCounts: data.leadCounts || prev.leadCounts,
          status: data.status || prev.status
        }) : null);
      }
    };

    const handleCallInitiated = (data) => {
      setLiveStream(prev => [
        {
          id: Date.now() + Math.random(),
          type: 'INITIATED',
          text: `Autonomous dialer contacting ${data.leadName} (${data.leadPhone})...`,
          time: new Date()
        },
        ...prev.slice(0, 30)
      ]);
    };

    const handleCallRinging = (data) => {
      setLiveStream(prev => [
        {
          id: Date.now() + Math.random(),
          type: 'RINGING',
          text: `Ringing line: ${data.leadName}...`,
          time: new Date()
        },
        ...prev.slice(0, 30)
      ]);
    };

    const handleCallConnected = (data) => {
      setLiveStream(prev => [
        {
          id: Date.now() + Math.random(),
          type: 'CONNECTED',
          text: `Call connected with ${data.leadName}. AI speaking.`,
          time: new Date()
        },
        ...prev.slice(0, 30)
      ]);
    };

    const handleCallCompleted = (data) => {
      setLiveStream(prev => [
        {
          id: Date.now() + Math.random(),
          type: data.outcome === 'qualified' ? 'QUALIFIED' : 'COMPLETED',
          text: `Call with ${data.call?.targetName || 'Prospect'} ended: ${data.outcome} (Score: ${data.score || 0}/100)`,
          time: new Date()
        },
        ...prev.slice(0, 30)
      ]);

      if (data.call) {
        setRecentCalls(prev => [data.call, ...prev.filter(c => c._id !== data.call._id)]);
      }
    };

    socket.on('campaign:metrics_updated', handleMetricsUpdate);
    socket.on('call:initiated', handleCallInitiated);
    socket.on('call:ringing', handleCallRinging);
    socket.on('call:connected', handleCallConnected);
    socket.on('call:completed', handleCallCompleted);

    return () => {
      socket.emit('leave:campaign', id);
      socket.off('campaign:metrics_updated', handleMetricsUpdate);
      socket.off('call:initiated', handleCallInitiated);
      socket.off('call:ringing', handleCallRinging);
      socket.off('call:connected', handleCallConnected);
      socket.off('call:completed', handleCallCompleted);
    };
  }, [socket, id]);

  const handleAction = async (action) => {
    try {
      setActionPending(true);
      if (action === 'launch') await campaignsApi.launch(id);
      if (action === 'pause') await campaignsApi.pause(id);
      if (action === 'resume') await campaignsApi.resume(id);
      if (action === 'stop') await campaignsApi.stop(id);
      await loadCampaign();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionPending(false);
    }
  };

  if (loading || !campaign) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F8FAFC] text-xs text-slate-500 font-mono">
        Loading Campaign Live Control Room...
      </div>
    );
  }

  const total = campaign.leadCounts?.total || 1;
  const completed = campaign.leadCounts?.completed || 0;
  const active = campaign.leadCounts?.active || 0;
  const pct = Math.round((completed / total) * 100);
  const m = campaign.metrics || {};

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] overflow-y-auto">
      <Topbar
        title={campaign.name}
        description={`Campaign Control Room • Assigned to ${campaign.agentId?.name || 'AI Employee'} • Caller ID: +91 79714 14044`}
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/campaigns')}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center space-x-1 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {campaign.status === 'draft' && (
              <button
                onClick={() => handleAction('launch')}
                disabled={actionPending}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs transition-all shadow-sm shadow-sky-600/20 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Campaign</span>
              </button>
            )}

            {campaign.status === 'running' && (
              <button
                onClick={() => handleAction('pause')}
                disabled={actionPending}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            {campaign.status === 'paused' && (
              <button
                onClick={() => handleAction('resume')}
                disabled={actionPending}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            )}

            {['running', 'paused'].includes(campaign.status) && (
              <button
                onClick={() => handleAction('stop')}
                disabled={actionPending}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            )}
          </div>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Real-time Status Banner */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-slate-900">{campaign.name}</h2>
                  <StatusBadge status={campaign.status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Assigned AI: <span className="text-slate-800 font-semibold">{campaign.agentId?.name}</span> • Concurrency: <strong className="text-sky-700 font-bold">{campaign.concurrency}x parallel</strong> • Line: <strong className="text-sky-700 font-bold">+91 79714 14044</strong>
                </p>
              </div>
            </div>

            {/* Concurrency & Active Pulse */}
            <div className="flex items-center space-x-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-right">
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Trunk Channels Active</span>
                <span className="text-base font-mono font-bold text-brand-black flex items-center justify-end space-x-1.5 mt-0.5">
                  {campaign.status === 'running' && active > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                  <span>{active} Active</span>
                </span>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500 uppercase tracking-wider text-[11px] font-semibold">Dispatch Progress</span>
              <span className="text-slate-800 font-bold">{completed} / {total} Leads ({pct}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-sky-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Outcome Counters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 text-center font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Total</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{total}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Done</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{completed}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Connected</span>
              <span className="text-sm font-bold text-sky-700 mt-0.5 block">{m.connected || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="block text-[10px] text-emerald-800 uppercase font-bold">Qualified</span>
              <span className="text-sm font-bold text-emerald-700 mt-0.5 block">{m.qualified || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Interested</span>
              <span className="text-sm font-bold text-sky-700 mt-0.5 block">{m.interested || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Callbacks</span>
              <span className="text-sm font-bold text-amber-700 mt-0.5 block">{m.callbacks || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">No Answer</span>
              <span className="text-sm font-bold text-slate-500 mt-0.5 block">{m.noAnswer || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Failed</span>
              <span className="text-sm font-bold text-rose-700 mt-0.5 block">{(m.busy || 0) + (m.failed || 0)}</span>
            </div>
          </div>
        </div>

        {/* Live Calling Feed + Recent Calls Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Activity Terminal Feed */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Event Telemetry</h3>
              </div>
              <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 font-bold uppercase">
                Live Stream
              </span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] font-mono text-xs">
              {liveStream.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  <p>Awaiting campaign events...</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Click "Launch Campaign" to dispatch leads to voice trunk dialer.
                  </p>
                </div>
              ) : (
                liveStream.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] leading-relaxed space-y-1"
                  >
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className={item.type === 'QUALIFIED' ? 'text-emerald-700 font-bold' : 'text-sky-700 font-bold'}>
                        [{item.type}]
                      </span>
                      <span>{new Date(item.time).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-700">{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Calls Processed in this Campaign */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Campaign Call Logs & Transcripts</h3>
              <span className="text-xs text-slate-500 font-mono">{recentCalls.length} calls recorded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-mono tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Lead Name</th>
                    <th className="pb-3 font-semibold">Outcome</th>
                    <th className="pb-3 font-semibold">Score</th>
                    <th className="pb-3 font-semibold">Duration</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentCalls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-mono">
                        No calls completed in this campaign yet.
                      </td>
                    </tr>
                  ) : (
                    recentCalls.map((call) => (
                      <tr
                        key={call._id}
                        onClick={() => setSelectedCall(call)}
                        className="hover:bg-sky-50/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 font-semibold text-slate-900">
                          <div>{call.targetName || 'Prospect'}</div>
                          <span className="text-[10px] font-mono text-slate-400">{formatPhone(call.targetPhone)}</span>
                        </td>
                        <td className="py-3.5">
                          <StatusBadge outcome={call.outcome} />
                        </td>
                        <td className="py-3.5 font-mono">
                          {call.qualificationData?.score ? (
                            <span className="text-sky-700 font-bold">{call.qualificationData.score}/100</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3.5 font-mono text-slate-500">
                          {formatDuration(call.duration)}
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="text-[11px] font-semibold text-sky-600 group-hover:underline">
                            Inspect Call →
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Call Detail Modal */}
      <CallDetailModal
        call={selectedCall}
        isOpen={!!selectedCall}
        onClose={() => setSelectedCall(null)}
      />
    </div>
  );
};
