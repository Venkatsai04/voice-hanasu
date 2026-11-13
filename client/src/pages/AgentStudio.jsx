import React, { useState, useEffect } from 'react';
import {
  Bot,
  Phone,
  Radio,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Volume2,
  Globe2,
  Clock,
  Activity,
  Layers,
  Edit3
} from 'lucide-react';
import { agentsApi } from '../api/index.js';
import { TaskDialModal } from '../components/TaskDialModal.jsx';

export const AgentStudio = () => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [dialModalOpen, setDialModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [objective, setObjective] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('Telugu');
  const [style, setStyle] = useState('consultative');

  useEffect(() => {
    fetchAgent();
  }, []);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const res = await agentsApi.list();
      if (res.success && res.data && res.data.length > 0) {
        const ag = res.data[0];
        setAgent(ag);
        setName(ag.name || 'Priya Reddy');
        setRole(ag.role || 'Senior Voice Advisor');
        setObjective(ag.objective || '');
        setSystemPrompt(ag.systemPrompt || '');
        setPrimaryLanguage(ag.primaryLanguage || 'Telugu');
        setStyle(ag.conversationStyle || 'consultative');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch agent profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!agent) return;
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await agentsApi.update(agent._id, {
        name,
        role,
        objective,
        systemPrompt,
        primaryLanguage,
        conversationStyle: style
      });

      if (res.success) {
        setAgent(res.data);
        setSuccessMsg('Voice Agent profile & instructions updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to update agent');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error updating agent');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs text-brand-textSecondary">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-ping" />
          <span className="font-semibold">Loading Voice Agent Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F5F7] p-6 lg:p-8 space-y-6">
      {/* Top Banner (No Eyebrows) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black tracking-tight">Voice Agent Studio</h1>
          <p className="text-xs text-brand-textSecondary mt-1">
            Configure your autonomous intelligence, voice persona, and task guidelines.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setDialModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-brand-red hover:bg-brand-redDark text-white text-xs font-bold flex items-center space-x-2 shadow-sm shadow-brand-red/25 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Test Live Call</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Status & Trunk Card */}
        <div className="space-y-6">
          {/* Active Agent Identity Card */}
          <div className="p-6 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#09090B] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-black/20">
                {name ? name[0] : 'P'}
              </div>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Trunk Ready</span>
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-black">{name}</h2>
              <p className="text-xs text-brand-textSecondary mt-0.5 font-medium">{role}</p>
            </div>

            {/* Line Information */}
            <div className="p-4 rounded-2xl bg-[#F4F5F7] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-textSecondary font-semibold">Connected Line</span>
                <span className="font-mono font-bold text-brand-black">+91 79714 14044</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-textSecondary font-semibold">Language</span>
                <span className="font-semibold text-brand-red">Tenglish (Telugu + English)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-textSecondary font-semibold">Voice Speed</span>
                <span className="font-mono font-bold text-brand-black">1.0x (Natural)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-textSecondary font-semibold">Interruption Handling</span>
                <span className="text-emerald-700 font-bold">Enabled</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDialModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-[#09090B] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Dispatch Call with Task</span>
            </button>
          </div>

          {/* Performance Overview */}
          <div className="p-6 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-4">
            <h3 className="text-sm font-bold text-brand-black">Agent Performance</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F4F5F7]">
                <span className="block text-xs font-semibold text-brand-textSecondary">Total Calls</span>
                <span className="mt-1 block text-lg font-mono font-bold text-brand-black">
                  {agent?.stats?.totalCalls || 34}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F4F5F7]">
                <span className="block text-xs font-semibold text-brand-textSecondary">Qualified</span>
                <span className="mt-1 block text-lg font-mono font-bold text-brand-red">
                  {agent?.stats?.qualifiedLeads || 26}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Configuration Editor */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="p-6 lg:p-8 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-brand-black">Agent Parameters</h3>
                <p className="text-xs text-brand-textSecondary mt-0.5">
                  Rename and tailor the operational guidelines followed by the agent.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-full bg-brand-red hover:bg-brand-redDark text-white text-xs font-bold flex items-center space-x-2 shadow-sm shadow-brand-red/20 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            {/* Rename & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-brand-black mb-1.5">
                  Agent Name (User Customizable)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Reddy"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F7] border border-transparent focus:border-brand-red focus:bg-white text-xs font-bold text-brand-black focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-black mb-1.5">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Voice Advisor"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F7] border border-transparent focus:border-brand-red focus:bg-white text-xs font-medium text-brand-black focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Language & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-brand-black mb-1.5">
                  Language Engine
                </label>
                <select
                  value={primaryLanguage}
                  onChange={(e) => setPrimaryLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F7] border border-transparent focus:border-brand-red focus:bg-white text-xs font-semibold text-brand-black focus:outline-none transition-all"
                >
                  <option value="Telugu">Tenglish (Telugu + Indian English)</option>
                  <option value="English">Indian English</option>
                  <option value="Hindi">Hinglish (Hindi + English)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-black mb-1.5">
                  Conversation Tone
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F5F7] border border-transparent focus:border-brand-red focus:bg-white text-xs font-semibold text-brand-black focus:outline-none transition-all"
                >
                  <option value="consultative">Consultative & Polite</option>
                  <option value="friendly">Warm & Engaging</option>
                  <option value="professional">Direct & Executive</option>
                  <option value="sales-focused">High-Impact Sales</option>
                </select>
              </div>
            </div>

            {/* Core Objective */}
            <div>
              <label className="block text-xs font-semibold text-brand-black mb-1.5">
                Core Mission & Objective
              </label>
              <textarea
                rows={3}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Core purpose and deliverables for outbound phone calls..."
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F7] border border-transparent focus:border-brand-red focus:bg-white text-xs font-medium text-brand-black focus:outline-none transition-all resize-none leading-relaxed"
                required
              />
            </div>

            {/* System Prompt Instructions */}
            <div>
              <label className="block text-xs font-semibold text-brand-black mb-1.5">
                Detailed Conversational Prompt Instructions
              </label>
              <textarea
                rows={6}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Detailed behavioral rules, tone markers, objections handling..."
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F7] border border-transparent focus:border-brand-red focus:bg-white text-xs font-mono font-normal text-brand-black focus:outline-none transition-all resize-none leading-relaxed"
                required
              />
            </div>
          </form>
        </div>
      </div>

      {/* Quick Task Dial Modal */}
      <TaskDialModal
        isOpen={dialModalOpen}
        onClose={() => setDialModalOpen(false)}
        initialPhone="+91 9705772881"
        initialName="Suresh Kumar Nambiar"
        initialTask={objective || 'Qualify 3BHK luxury flat inquiry, verify budget ₹1.8–2.0 Cr, confirm Saturday 11:30 AM private site visit.'}
      />
    </div>
  );
};
