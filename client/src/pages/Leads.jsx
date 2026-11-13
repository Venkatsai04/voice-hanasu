import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Upload,
  Phone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  RotateCcw
} from 'lucide-react';
import { leadsApi, callsApi } from '../api/index.js';
import { Topbar } from '../components/Topbar.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { CallDetailModal } from '../components/CallDetailModal.jsx';
import { TaskDialModal } from '../components/TaskDialModal.jsx';
import { formatPhone, formatDuration } from '../lib/utils.js';

export const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadCalls, setLeadCalls] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [dialModalLead, setDialModalLead] = useState(null);

  // CSV Import State
  const [csvText, setCsvText] = useState(
    `Name,Phone,City,Budget,PropertyType,Timeline
Suresh Kumar Nambiar,+919849012345,Hyderabad,₹1.8 Crores,3BHK Flat,60 Days
Lakshmi Narayana Rao,+919701123456,Hyderabad,₹2.2 Crores,4BHK Penthouse,Immediate
Dr. Venkat Raman,+919440034567,Hyderabad,₹1.5 Crores,3BHK Flat,3 Months
Sneha Reddy,+919989045678,Hyderabad,₹1.4 Crores,3BHK Flat,45 Days
Rajesh Kothari,+919823056789,Secunderabad,₹1.1 Crores,2BHK Luxury,6 Months`
  );
  const [csvPreview, setCsvPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await leadsApi.list({
        search,
        outcome: outcomeFilter !== 'all' ? outcomeFilter : undefined,
        limit: 50
      });
      if (res.success) {
        setLeads(res.data);
        setTotalLeads(res.pagination?.total || res.data.length);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [outcomeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLeads();
  };

  const handleOpenLead = async (lead) => {
    setSelectedLead(lead);
    try {
      const res = await leadsApi.get(lead._id);
      if (res.success) {
        setLeadCalls(res.data.calls || []);
      }
    } catch (err) {
      console.error('Failed to load lead details:', err);
    }
  };

  // Preview CSV parse
  const handlePreviewCsv = async () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        alert('Please provide a CSV with a header row and data rows.');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
          const rowObj = {};
          headers.forEach((h, idx) => {
            rowObj[h] = values[idx];
          });
          rows.push({
            name: rowObj.name || rowObj.fullname || 'Prospect',
            phone: rowObj.phone || rowObj.mobile || '',
            customData: rowObj
          });
        }
      }

      setCsvPreview({
        totalRows: rows.length,
        validCount: rows.filter(r => r.phone.length >= 10).length,
        duplicateCount: 0,
        invalidCount: rows.filter(r => r.phone.length < 10).length,
        sampleValid: rows.slice(0, 3),
        parsedRows: rows
      });
    } catch (err) {
      alert('Failed to parse CSV: ' + err.message);
    }
  };

  const handleCommitImport = async () => {
    if (!csvPreview?.parsedRows) return;
    try {
      setImporting(true);
      const res = await leadsApi.importCsv({
        leads: csvPreview.parsedRows
      });
      if (res.success) {
        setShowImportModal(false);
        setCsvPreview(null);
        await loadLeads();
      }
    } catch (err) {
      alert(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] overflow-y-auto">
      <Topbar
        title="Prospect & Lead Management"
        description="Customer records with autonomous qualification scoring, custom attributes, and call logs"
        actions={
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs transition-all shadow-sm shadow-sky-600/20 active:scale-[0.98]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Leads (CSV)</span>
          </button>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or custom data..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
            />
          </form>

          {/* Outcome Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Contacts' },
              { id: 'qualified', label: 'Qualified' },
              { id: 'interested', label: 'Interested' },
              { id: 'callback', label: 'Callback' },
              { id: 'not_interested', label: 'Not Interested' },
              { id: 'pending', label: 'Uncalled' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setOutcomeFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  outcomeFilter === f.id
                    ? 'bg-sky-50 text-sky-700 border border-sky-300 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Data Table */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 font-semibold">
              Showing <strong className="text-slate-900">{leads.length}</strong> of <strong className="text-slate-900">{totalLeads}</strong> leads
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-mono tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Prospect</th>
                  <th className="pb-3 font-semibold">Outcome</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Campaign</th>
                  <th className="pb-3 font-semibold">Custom Fields</th>
                  <th className="pb-3 font-semibold">Next Action</th>
                  <th className="pb-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                      No leads match your filter.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const customObj = lead.customData || {};

                    return (
                      <tr
                        key={lead._id}
                        onClick={() => handleOpenLead(lead)}
                        className="hover:bg-sky-50/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 font-semibold text-slate-900">
                          <div>{lead.name}</div>
                          <span className="text-[10px] font-mono text-slate-400">{formatPhone(lead.phone)}</span>
                        </td>
                        <td className="py-3.5">
                          <StatusBadge outcome={lead.outcome} />
                        </td>
                        <td className="py-3.5 font-mono">
                          {lead.qualificationScore > 0 ? (
                            <span className="text-emerald-700 font-bold">{lead.qualificationScore}/100</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                          {lead.campaignId?.name || <span className="text-slate-400">Unassigned</span>}
                        </td>
                        <td className="py-3.5 text-slate-600 max-w-[200px] truncate">
                          {Object.entries(customObj).slice(0, 2).map(([k, v]) => (
                            <span key={k} className="inline-block mr-1.5 text-[10px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 font-mono">
                              {k}: {String(v)}
                            </span>
                          ))}
                        </td>
                        <td className="py-3.5 text-xs text-slate-600 max-w-[220px] truncate">
                          {lead.nextAction || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="text-[11px] font-semibold text-sky-600 group-hover:underline">
                            Inspect →
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Single Lead Slide-Over Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl h-full bg-white border-l border-slate-200 p-6 overflow-y-auto space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold font-mono shadow-sm">
                    {selectedLead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedLead.name}</h3>
                    <span className="text-xs font-mono text-slate-500 font-semibold">{formatPhone(selectedLead.phone)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Score Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Current Outcome</span>
                  <div className="mt-1.5">
                    <StatusBadge outcome={selectedLead.outcome} />
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Score</span>
                  <span className="mt-1.5 block text-sm font-mono font-bold text-sky-600">
                    {selectedLead.qualificationScore || 0}/100
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Attempts</span>
                  <span className="mt-1.5 block text-sm font-mono font-bold text-slate-900">
                    {selectedLead.callAttempts || 0}
                  </span>
                </div>
              </div>

              {/* AI Conversation Summary */}
              {selectedLead.summary && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    <span>AI Executive Summary</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {selectedLead.summary}
                  </p>
                </div>
              )}

              {/* Recommended Next Action */}
              {selectedLead.nextAction && (
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 space-y-1">
                  <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                    Recommended Next Action
                  </span>
                  <p className="text-xs text-slate-700">{selectedLead.nextAction}</p>
                </div>
              )}

              {/* Custom Discovery Variables */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Discovery Variables
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.entries(selectedLead.customData || {}).map(([k, v]) => (
                    <div key={k} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="block text-[10px] text-slate-500 uppercase font-mono font-semibold">{`{{${k}}}`}</span>
                      <span className="block text-xs font-bold text-slate-800 truncate mt-0.5">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call History for this Lead */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Call Logs ({leadCalls.length})
                </h4>
                <div className="space-y-2">
                  {leadCalls.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                      No calls placed to this lead yet.
                    </p>
                  ) : (
                    leadCalls.map((call) => (
                      <div
                        key={call._id}
                        onClick={() => setSelectedCall(call)}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <StatusBadge outcome={call.outcome} />
                            <span className="text-xs font-mono text-slate-500 font-semibold">
                              {formatDuration(call.duration)}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                            {new Date(call.createdAt).toLocaleString()} • Handled by {call.agentId?.name || 'AI'}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-sky-600">View Transcript →</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-brand-black text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setDialModalLead(selectedLead)}
                className="px-5 py-2.5 rounded-full bg-brand-red hover:bg-brand-redDark text-white text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Dispatch Call to {selectedLead.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Import Customer Leads from CSV</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Paste CSV Data
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-sky-500 focus:bg-white shadow-inner"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Required column: <strong className="text-slate-800">Phone</strong>. Extra columns automatically map to prompt variables: <code className="text-sky-700 font-bold">{'{{city}}'}</code>, <code className="text-sky-700 font-bold">{'{{budget}}'}</code>.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePreviewCsv}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
                >
                  Preview & Validate Columns
                </button>
              </div>

              {/* Validation Preview Card */}
              {csvPreview && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Total</span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">{csvPreview.totalRows}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                      <span className="block text-[10px] uppercase font-bold">Valid</span>
                      <span className="text-sm font-bold mt-0.5 block">{csvPreview.validCount}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Duplicates</span>
                      <span className="text-sm font-bold text-slate-500 mt-0.5 block">{csvPreview.duplicateCount}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Invalid</span>
                      <span className="text-sm font-bold text-rose-600 mt-0.5 block">{csvPreview.invalidCount}</span>
                    </div>
                  </div>

                  {/* Sample Rows */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Validated Sample
                    </span>
                    <div className="space-y-1 text-xs">
                      {csvPreview.sampleValid?.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-slate-800">
                          <span className="font-medium">{item.name} ({item.phone})</span>
                          <span className="text-[10px] text-emerald-700 font-bold font-mono">Ready to import</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitImport}
                disabled={!csvPreview || importing}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm shadow-sky-600/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{importing ? 'Importing Leads...' : 'Import Valid Leads into CRM'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Detail Modal */}
      <CallDetailModal
        call={selectedCall}
        isOpen={!!selectedCall}
        onClose={() => setSelectedCall(null)}
      />

      {/* Task Dial Modal */}
      <TaskDialModal
        isOpen={Boolean(dialModalLead)}
        onClose={() => setDialModalLead(null)}
        initialPhone={dialModalLead?.phone || ''}
        initialName={dialModalLead?.name || ''}
        initialTask={dialModalLead ? `Connect with ${dialModalLead.name} regarding property inquiry in Hyderabad, qualify budget and confirm weekend site visit appointment.` : ''}
        onCallInitiated={() => loadLeads()}
      />
    </div>
  );
};
