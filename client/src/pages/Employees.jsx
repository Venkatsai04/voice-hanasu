import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  PhoneCall,
  Languages,
  TrendingUp,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Edit,
  Mic,
  Radio,
  Phone
} from 'lucide-react';
import { agentsApi } from '../api/index.js';
import { Topbar } from '../components/Topbar.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { TestCallModal } from '../components/TestCallModal.jsx';
import { LiveVoiceModal } from '../components/LiveVoiceModal.jsx';

export const Employees = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingAgent, setTestingAgent] = useState(null);
  const [liveVoiceAgent, setLiveVoiceAgent] = useState(null);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const res = await agentsApi.list();
      if (res.success) setAgents(res.data);
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this AI employee?')) return;
    try {
      await agentsApi.delete(id);
      setAgents(agents.filter(a => a._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] overflow-y-auto">
      <Topbar
        title="AI Employees"
        description="Autonomous conversational agents powered by Sarvam AI Speech (bulbul:v3) and cellular dialing (+91 79714 14044)"
        actions={
          <button
            onClick={() => navigate('/employees/new')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs transition-all shadow-sm shadow-sky-600/20 active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Hire AI Employee</span>
          </button>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500 font-mono">Loading AI Employee roster...</div>
        ) : agents.length === 0 ? (
          <div className="py-24 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto text-sky-600 shadow-sm">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No AI Employees Hired Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create your first AI employee by describing their job in natural plain language.
            </p>
            <button
              onClick={() => navigate('/employees/new')}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Hire First AI Employee
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent._id}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white font-mono font-bold text-sm shadow-sm shadow-sky-500/20">
                        {agent.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{agent.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{agent.role}</p>
                      </div>
                    </div>
                    <StatusBadge status={agent.status} />
                  </div>

                  {/* Objective text */}
                  <p className="mt-4 text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {agent.objective}
                  </p>

                  {/* Badges / Languages */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {agent.languages?.map((lang) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-mono font-semibold"
                      >
                        {lang}
                      </span>
                    ))}
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-medium capitalize">
                      {agent.conversationStyle}
                    </span>
                  </div>

                  {/* Performance stats */}
                  <div className="mt-5 grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Calls</span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5 block">{agent.stats?.totalCalls || 0}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Qualified</span>
                      <span className="text-xs font-bold text-emerald-700 mt-0.5 block">{agent.stats?.qualifiedLeads || 0}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Interested</span>
                      <span className="text-xs font-bold text-sky-700 mt-0.5 block">{agent.stats?.interestedLeads || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => setLiveVoiceAgent(agent)}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-semibold shadow-sm shadow-sky-600/20 transition-all active:scale-[0.98] group"
                    title="Live 2-Way Voice Conversation with Sarvam Speech"
                  >
                    <Mic className="w-3.5 h-3.5 animate-pulse" />
                    <span>Talk Live (Microphone)</span>
                  </button>

                  <button
                    onClick={() => setTestingAgent(agent)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
                    title="Call Handset via Sarvam Vobiz (+91 79714 14044)"
                  >
                    <PhoneCall className="w-4 h-4 text-sky-600" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, agent._id)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete AI Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Two-Way Voice Conversational Modal (Sarvam Speech bulbul:v3) */}
      {liveVoiceAgent && (
        <LiveVoiceModal
          agent={liveVoiceAgent}
          isOpen={true}
          onClose={() => setLiveVoiceAgent(null)}
        />
      )}

      {/* Outbound Cellular Test Call Modal (Sarvam Vobiz Line) */}
      {testingAgent && (
        <TestCallModal
          agent={testingAgent}
          isOpen={true}
          onClose={() => setTestingAgent(null)}
        />
      )}
    </div>
  );
};
