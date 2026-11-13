import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Bot,
  Settings,
  Languages,
  Sliders,
  Volume2,
  PhoneCall,
  Plus,
  Trash2
} from 'lucide-react';
import { agentsApi } from '../api/index.js';
import { Topbar } from '../components/Topbar.jsx';
import { TestCallModal } from '../components/TestCallModal.jsx';

export const EmployeeBuilder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAgent, setSavedAgent] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);

  // Step 1: Plain language prompt
  const [jobPrompt, setJobPrompt] = useState(
    'Call people who submit an enquiry for our real estate projects. Speak naturally in English and Telugu. Understand their budget, preferred location, property type, and purchase timeline. Identify serious buyers and recommend the next action.'
  );

  // Step 2 & 3: Structured Configuration
  const [config, setConfig] = useState({
    name: 'Priya Reddy',
    role: 'Senior Sales Concierge',
    objective: 'Contact prospects who submitted an inquiry for residential/commercial projects. Converse naturally, determine budget, preferred unit type, location, and purchase timeline, and secure a confirmed site visit.',
    systemPrompt: `You are Priya, Senior Sales Concierge for Sahara Living.
Converse with natural empathy and executive clarity using Sarvam AI Speech (bulbul:v3).
Determine buyer's budget, preferred location, unit type, and purchase timeline within 60 days.
If qualified, invite them warmly for a private VIP walkthrough this weekend.`,
    languages: ['English', 'Telugu'],
    primaryLanguage: 'English',
    allowCodeSwitching: true,
    conversationStyle: 'consultative',
    personality: 'Polite, proactive, patient, attentive, and confident',
    infoToCollect: [
      { fieldName: 'budget', description: 'Customer budget range', required: true },
      { fieldName: 'location', description: 'Preferred micro-market', required: true },
      { fieldName: 'propertyType', description: '2BHK, 3BHK, Penthouse, or Villa', required: true },
      { fieldName: 'timeline', description: 'Purchase timeframe', required: true }
    ],
    qualificationCriteria: [
      { criterion: 'Budget matches project tier (> ₹1.2 Crore)', weight: 40 },
      { criterion: 'Active search timeline within 60 days', weight: 30 },
      { criterion: 'Agreed to schedule a weekend site visit', weight: 30 }
    ],
    possibleOutcomes: ['qualified', 'interested', 'callback', 'not_interested', 'no_answer', 'busy', 'failed'],
    voiceSettings: {
      voiceId: 'sarvam-priya',
      speaker: 'priya',
      gender: 'female',
      speed: 1.0,
      pitch: 1.0,
      naturalPauses: true,
      silenceHandlingSeconds: 3.0,
      interruptionHandling: true,
      voicemailHandling: 'detect_and_hangup',
      backgroundAmbience: 'none'
    }
  });

  const samplePrompts = [
    {
      title: 'Real Estate Lead Qualifier',
      text: 'Call people who submit an enquiry for our real estate projects. Speak naturally in English and Telugu. Understand their budget, preferred location, property type, and purchase timeline. Qualify serious buyers.'
    },
    {
      title: 'B2B SaaS Executive Caller',
      text: 'Reach out to corporate software trial signups in English and Hindi. Understand team size, existing software tools, and key business pain points. Qualify decision-makers and book an executive demo.'
    },
    {
      title: 'Clinic Appointment Coordinator',
      text: 'Call patients who requested a health screening consultation. Address basic queries, verify their preferred date and time, and confirm clinic appointments with empathetic care.'
    }
  ];

  const handleAutoGenerate = async () => {
    try {
      setIsGenerating(true);
      const res = await agentsApi.generateConfig(jobPrompt);
      if (res.success) {
        setConfig(res.data);
        setCurrentStep(2);
      }
    } catch (err) {
      alert(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEmployee = async () => {
    try {
      setIsSaving(true);
      const res = await agentsApi.create({
        ...config,
        plainLanguageJobPrompt: jobPrompt
      });
      if (res.success) {
        setSavedAgent(res.data);
        setCurrentStep(4);
      }
    } catch (err) {
      alert(err.message || 'Failed to hire AI employee');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLanguage = (lang) => {
    const current = config.languages || [];
    if (current.includes(lang)) {
      if (current.length > 1) {
        setConfig({ ...config, languages: current.filter(l => l !== lang) });
      }
    } else {
      setConfig({ ...config, languages: [...current, lang] });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC] overflow-y-auto">
      <Topbar
        title="Hire & Train AI Employee"
        description="Transform a plain-language role definition into an autonomous Sarvam Voice Employee"
        actions={
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Back</span>
          </button>
        }
      />

      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs">
          {[
            { step: 1, title: '1. Describe Role' },
            { step: 2, title: '2. Instructions' },
            { step: 3, title: '3. Voice & Persona' },
            { step: 4, title: '4. Ready & Call' }
          ].map((s) => (
            <div
              key={s.step}
              className={`flex items-center space-x-2 font-semibold transition-colors ${
                currentStep === s.step
                  ? 'text-sky-700'
                  : currentStep > s.step
                  ? 'text-slate-900'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                  currentStep === s.step
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                    : currentStep > s.step
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </div>
              <span className="hidden sm:inline uppercase tracking-wider text-[11px]">{s.title}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: Plain Language Job Description */}
        {currentStep === 1 && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">What is this employee's job?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Describe the role in plain language. Sarvam AI will configure conversation flows, discovery criteria, and qualification rules automatically.
              </p>
            </div>

            <textarea
              rows={5}
              value={jobPrompt}
              onChange={(e) => setJobPrompt(e.target.value)}
              placeholder="e.g. Call people who submit an enquiry for our real estate projects. Speak naturally in English and Telugu. Understand their budget, preferred location, property type, and purchase timeline..."
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner resize-none"
            />

            {/* Quick Inspiration Pills */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Select a template to auto-fill:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setJobPrompt(p.text)}
                    className="p-3.5 text-left rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all text-xs group"
                  >
                    <span className="font-bold text-slate-800 group-hover:text-sky-700 transition-colors block mb-1">
                      {p.title}
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{p.text}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleAutoGenerate}
                disabled={isGenerating || !jobPrompt.trim()}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs transition-all shadow-sm shadow-sky-600/20 active:scale-[0.98] disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Synthesizing Employee...' : 'Generate Configuration →'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Review Structured Configuration */}
        {currentStep === 2 && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Review Employee Specifications</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fine-tune the employee's name, role, instructions, and discovery fields.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Employee Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-sky-500 focus:bg-white shadow-inner"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role Title</label>
                <input
                  type="text"
                  value={config.role}
                  onChange={(e) => setConfig({ ...config, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Objective</label>
              <textarea
                rows={2}
                value={config.objective}
                onChange={(e) => setConfig({ ...config, objective: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-sky-500 focus:bg-white shadow-inner resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Conversation Instructions (System Prompt)
              </label>
              <textarea
                rows={6}
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:border-sky-500 focus:bg-white shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Information to Collect from Customers
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {config.infoToCollect?.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 font-mono">{item.fieldName}</span>
                      <p className="text-[11px] text-slate-500">{item.description}</p>
                    </div>
                    <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 font-bold">
                      Required
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs transition-all shadow-sm shadow-sky-600/20 active:scale-[0.98]"
              >
                <span>Configure Voice & Persona →</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Voice & Persona Settings */}
        {currentStep === 3 && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Voice Synthesis & Indian Telephony</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Powered by Sarvam AI bulbul:v3 text-to-speech engine and cellular line (+91 79714 14044).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Supported Spoken Languages
              </label>
              <div className="flex flex-wrap gap-2">
                {['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada'].map((lang) => {
                  const isSelected = config.languages?.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-sky-50 border-sky-500 text-sky-700 ring-2 ring-sky-100 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {lang} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sarvam Voice Speaker</label>
                <select
                  value={config.voiceSettings?.speaker || 'priya'}
                  onChange={(e) => setConfig({
                    ...config,
                    voiceSettings: { ...config.voiceSettings, speaker: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-sky-500 focus:bg-white"
                >
                  <option value="priya">Priya (Warm & Expressive Indian Female)</option>
                  <option value="aditi">Aditi (Crisp Healthcare & Support Female)</option>
                  <option value="shubh">Shubh (Authoritative Indian Male)</option>
                  <option value="arvind">Arvind (Calm & Consultative Male)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Conversation Style</label>
                <select
                  value={config.conversationStyle}
                  onChange={(e) => setConfig({ ...config, conversationStyle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-sky-500 focus:bg-white"
                >
                  <option value="consultative">Consultative (Warm & Diagnostic)</option>
                  <option value="professional">Professional (Crisp & Executive)</option>
                  <option value="friendly">Friendly (Approachable & Casual)</option>
                  <option value="sales-focused">Sales-Focused (Persistent & Closing)</option>
                  <option value="supportive">Supportive (Empathetic & Caring)</option>
                </select>
              </div>
            </div>

            {/* Natural Pauses & Speech Parameters */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">Sarvam bulbul:v3 Indian Speech Naturalness</span>
                  <p className="text-[11px] text-slate-500">
                    Natural Indian accent prosody, multi-lingual code-switching (English + Telugu/Hindi).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.allowCodeSwitching}
                  onChange={(e) => setConfig({ ...config, allowCodeSwitching: e.target.checked })}
                  className="w-4 h-4 accent-sky-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <div>
                  <span className="text-xs font-bold text-slate-900">Dynamic Turn Interruption Handling</span>
                  <p className="text-[11px] text-slate-500">
                    Yields speaking turn smoothly when customer responds mid-sentence.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.voiceSettings?.interruptionHandling ?? true}
                  onChange={(e) => setConfig({
                    ...config,
                    voiceSettings: { ...config.voiceSettings, interruptionHandling: e.target.checked }
                  })}
                  className="w-4 h-4 accent-sky-600 rounded"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSaveEmployee}
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs transition-all shadow-sm shadow-sky-600/20 active:scale-[0.98] disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Deploying Employee...' : 'Hire & Deploy AI Employee'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success & Test Launcher */}
        {currentStep === 4 && savedAgent && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                {savedAgent.name} is Ready for Duty!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Registered with Sarvam AI Voice & Vobiz Telephony line <strong className="text-sky-700 font-bold">+91 79714 14044</strong>. Ready for outbound calling.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowTestModal(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-md shadow-sky-600/20"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Launch Test Call (+91 79714 14044)</span>
              </button>
              <button
                onClick={() => navigate('/campaigns')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
              >
                Create Campaign with this Employee
              </button>
            </div>
          </div>
        )}
      </div>

      {savedAgent && (
        <TestCallModal
          agent={savedAgent}
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
        />
      )}
    </div>
  );
};
