import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  FileText,
  Clock,
  Sparkles,
  Phone,
  ArrowRight,
  Volume2
} from 'lucide-react';
import { callsApi } from '../api/index.js';
import { Topbar } from '../components/Topbar.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { CallDetailModal } from '../components/CallDetailModal.jsx';
import { TaskDialModal } from '../components/TaskDialModal.jsx';
import { formatDuration, formatPhone } from '../lib/utils.js';

export const CallHistory = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [selectedCall, setSelectedCall] = useState(null);
  const [dialModalOpen, setDialModalOpen] = useState(false);
  const [totalCalls, setTotalCalls] = useState(0);

  const loadCalls = async () => {
    try {
      setLoading(true);
      const res = await callsApi.list({
        search,
        outcome: outcomeFilter !== 'all' ? outcomeFilter : undefined,
        limit: 50
      });
      if (res.success) {
        setCalls(res.data);
        setTotalCalls(res.pagination?.total || res.data.length);
      }
    } catch (err) {
      console.error('Error loading calls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, [outcomeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCalls();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] overflow-y-auto">
      <Topbar
        title="Call Logs & Audio Transcripts"
        description="Audit record of completed conversations, audio recordings, and qualification outcomes"
        actions={
          <button
            onClick={() => setDialModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-brand-red hover:bg-brand-redDark text-white font-bold text-xs shadow-sm shadow-brand-red/20 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>New Dispatch</span>
          </button>
        }
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Search and Filters Bar (Zentra-style Pill Navigation) */}
        <div className="p-5 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-textMuted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by prospect name, phone, or task..."
              className="w-full pl-10 pr-4 py-2 bg-[#F4F5F7] border border-transparent rounded-full text-xs text-brand-black placeholder-brand-textMuted focus:outline-none focus:border-brand-red focus:bg-white transition-all font-medium"
            />
          </form>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {['all', 'qualified', 'interested', 'callback', 'not_interested', 'no_answer', 'busy'].map((item) => (
              <button
                key={item}
                onClick={() => setOutcomeFilter(item)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  outcomeFilter === item
                    ? 'bg-[#09090B] text-white shadow-sm'
                    : 'bg-[#F4F5F7] text-brand-textSecondary hover:text-brand-black hover:bg-slate-200'
                }`}
              >
                {item.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Calls Log Table */}
        <div className="p-6 lg:p-8 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-black">
              Call Records ({calls.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary">
                  <th className="py-3 px-3">Prospect</th>
                  <th className="py-3 px-3">Mission Task</th>
                  <th className="py-3 px-3">Outcome</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Recording & Turns</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {calls && calls.length > 0 ? (
                  calls.map((call) => (
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
                          View Transcript
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-xs text-brand-textMuted">
                      No call records found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Call Detail Modal with Audio Player */}
      <CallDetailModal
        call={selectedCall}
        isOpen={Boolean(selectedCall)}
        onClose={() => setSelectedCall(null)}
        onRedialSuccess={() => loadCalls()}
      />

      {/* Task Dial Modal */}
      <TaskDialModal
        isOpen={dialModalOpen}
        onClose={() => setDialModalOpen(false)}
        onCallInitiated={() => loadCalls()}
      />
    </div>
  );
};
