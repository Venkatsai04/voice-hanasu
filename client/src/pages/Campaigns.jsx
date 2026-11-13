import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Plus,
  Play,
  Pause,
  Square,
  Bot,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { campaignsApi, agentsApi, leadsApi } from '../api/index.js';
import { Topbar } from '../components/Topbar.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export const Campaigns = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [campaigns, setCampaigns] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    agentId: '',
    concurrency: 3,
    schedule: {
      timezone: 'Asia/Kolkata',
      callingHours: { start: '09:30', end: '19:30' }
    },
    retryConfig: { maxAttempts: 2, delayMinutes: 30 }
  });
  const [selectedLeadCount, setSelectedLeadCount] = useState(10);
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campRes, agentRes] = await Promise.all([
        campaignsApi.list(),
        agentsApi.list()
      ]);
      if (campRes.success) setCampaigns(campRes.data);
      if (agentRes.success) {
        setAgents(agentRes.data);
        if (agentRes.data.length > 0 && !newCampaign.agentId) {
          setNewCampaign(prev => ({ ...prev, agentId: agentRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time metric updates
  useEffect(() => {
    if (!socket) return;

    const handleMetrics = (data) => {
      setCampaigns(prev => prev.map(c => {
        if (c._id === data.campaignId) {
          return {
            ...c,
            metrics: data.metrics || c.metrics,
            leadCounts: data.leadCounts || c.leadCounts,
            status: data.status || c.status
          };
        }
        return c;
      }));
    };

    socket.on('campaign:metrics_updated', handleMetrics);
    return () => socket.off('campaign:metrics_updated', handleMetrics);
  }, [socket]);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaign.name || !newCampaign.agentId) return;

    try {
      setCreating(true);
      const leadsRes = await leadsApi.list({ limit: selectedLeadCount });
      const leadIds = leadsRes.data?.map(l => l._id) || [];

      const res = await campaignsApi.create({
        ...newCampaign,
        leadIds
      });

      if (res.success) {
        setShowCreateModal(false);
        navigate(`/campaigns/${res.data._id}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const handleQuickAction = async (e, id, action) => {
    e.stopPropagation();
    try {
      if (action === 'launch') await campaignsApi.launch(id);
      if (action === 'pause') await campaignsApi.pause(id);
      if (action === 'resume') await campaignsApi.resume(id);
      if (action === 'stop') await campaignsApi.stop(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] overflow-y-auto">
      <Topbar
        title="Calling Campaigns"
        description="Schedule, dispatch, and monitor autonomous outbound batches via Secured Voice Trunk (+91 79714 14044)"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-brand-red hover:bg-brand-redDark text-white font-bold text-xs transition-all shadow-sm shadow-brand-red/20 active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Campaign</span>
          </button>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {loading ? (
          <div className="py-20 text-center text-xs text-brand-textSecondary font-mono">Loading campaign records...</div>
        ) : campaigns.length === 0 ? (
          <div className="py-24 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-brand-red shadow-sm">
              <PhoneCall className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-brand-black">No Campaigns Created</h3>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              Assign a voice agent to your customer leads, configure concurrency, and initiate outbound calling.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-full bg-brand-red hover:bg-brand-redDark text-white font-bold text-xs transition-colors shadow-sm"
            >
              Create First Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((camp) => {
              const total = camp.leadCounts?.total || 1;
              const completed = camp.leadCounts?.completed || 0;
              const pct = Math.round((completed / total) * 100);

              return (
                <div
                  key={camp._id}
                  onClick={() => navigate(`/campaigns/${camp._id}`)}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Campaign Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                          {camp.name}
                        </h3>
                        <StatusBadge status={camp.status} />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{camp.description || 'No description provided.'}</p>
                      <div className="flex items-center space-x-4 text-[11px] text-slate-500 pt-1 font-mono">
                        <span className="flex items-center space-x-1.5 font-semibold text-slate-700">
                          <Bot className="w-3.5 h-3.5 text-sky-600" />
                          <span>{camp.agentId?.name || 'Unassigned AI'}</span>
                        </span>
                        <span>•</span>
                        <span>Concurrency: <strong className="text-slate-800">{camp.concurrency}x</strong></span>
                        <span>•</span>
                        <span>Line: <strong className="text-sky-700 font-bold">+91 79714 14044</strong></span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {camp.status === 'draft' && (
                        <button
                          onClick={(e) => handleQuickAction(e, camp._id, 'launch')}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Launch Now</span>
                        </button>
                      )}
                      {camp.status === 'running' && (
                        <button
                          onClick={(e) => handleQuickAction(e, camp._id, 'pause')}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
                        >
                          <Pause className="w-3 h-3 fill-current" />
                          <span>Pause</span>
                        </button>
                      )}
                      {camp.status === 'paused' && (
                        <button
                          onClick={(e) => handleQuickAction(e, camp._id, 'resume')}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Resume</span>
                        </button>
                      )}
                      {['running', 'paused'].includes(camp.status) && (
                        <button
                          onClick={(e) => handleQuickAction(e, camp._id, 'stop')}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                        >
                          <Square className="w-3 h-3 fill-current" />
                          <span>Stop</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/campaigns/${camp._id}`);
                        }}
                        className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors"
                      >
                        <span>Control Room</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar & Realtime KPIs */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-[11px] font-mono text-slate-500 font-semibold">
                      <span>{completed} / {total} contacts dialed</span>
                      <span>{pct}% complete</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-sky-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Connected</span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5 block">{camp.metrics?.connected || 0}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Qualified</span>
                      <span className="text-xs font-bold text-emerald-700 mt-0.5 block">{camp.metrics?.qualified || 0}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Interested</span>
                      <span className="text-xs font-bold text-sky-700 mt-0.5 block">{camp.metrics?.interested || 0}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Callbacks</span>
                      <span className="text-xs font-bold text-amber-700 mt-0.5 block">{camp.metrics?.callbacks || 0}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">No Answer</span>
                      <span className="text-xs font-bold text-slate-600 mt-0.5 block">
                        {(camp.metrics?.noAnswer || 0) + (camp.metrics?.busy || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Launch Calling Campaign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g. Q3 High-Priority Lead Outreach"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign AI Employee</label>
                <select
                  value={newCampaign.agentId}
                  onChange={(e) => setNewCampaign({ ...newCampaign, agentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-sky-500 focus:bg-white"
                  required
                >
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} — {a.role} ({a.languages?.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Concurrency Limit</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newCampaign.concurrency}
                      onChange={(e) => setNewCampaign({ ...newCampaign, concurrency: parseInt(e.target.value) })}
                      className="w-full accent-sky-600"
                    />
                    <span className="text-xs font-mono font-bold text-sky-700">{newCampaign.concurrency}x</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Max parallel active calls</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Leads to Dispatch</label>
                  <select
                    value={selectedLeadCount}
                    onChange={(e) => setSelectedLeadCount(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value={5}>Next 5 Available Leads</option>
                    <option value={10}>Next 10 Available Leads</option>
                    <option value={25}>Next 25 Available Leads</option>
                    <option value={50}>Next 50 Available Leads</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono">Outbound Line Details</span>
                <div className="flex items-center justify-between text-slate-800">
                  <span className="text-slate-500">Carrier Trunk:</span>
                  <span className="font-mono text-brand-black font-bold">+91 79714 14044 (Autonomous Trunk)</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{creating ? 'Creating...' : 'Create & View Control Room'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
