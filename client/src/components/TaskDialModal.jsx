import React, { useState } from 'react';
import {
  X,
  Phone,
  Radio,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Bot,
  Flame,
  Volume2
} from 'lucide-react';
import { callsApi } from '../api/index.js';

export const TaskDialModal = ({
  isOpen,
  onClose,
  initialPhone = '+91 9705772881',
  initialName = 'Suresh Kumar Nambiar',
  initialTask = 'Qualify interest in 3BHK luxury property in Financial District, confirm ₹1.8 - 2.0 Cr budget range, and schedule Saturday 11:30 AM private site visit.',
  onCallInitiated
}) => {
  if (!isOpen) return null;

  const [phone, setPhone] = useState(initialPhone);
  const [name, setName] = useState(initialName);
  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [attemptId, setAttemptId] = useState(null);

  const handleDial = async (e) => {
    e?.preventDefault();
    if (!phone) {
      setError('Please enter a valid phone number');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      setAttemptId(null);

      const res = await callsApi.dial({
        phoneNumber: phone,
        targetName: name,
        task: task
      });

      if (res.success) {
        setAttemptId(res.data?.providerCallId);
        setSuccessMsg(`Call dispatched on live cellular line! Attempt ID: ${res.data?.providerCallId}`);
        if (onCallInitiated) onCallInitiated(res.data);
      } else {
        setError(res.message || 'Carrier failed to dispatch call');
      }
    } catch (err) {
      console.error('Dial error:', err);
      setError(err.message || 'Carrier telephony error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-soft-float border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shadow-sm">
              <Phone className="w-5 h-5 text-brand-red" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-black tracking-tight">Direct Voice Dispatch</h2>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-brand-textSecondary font-medium">Secured Line: +91 79714 14044</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-brand-black flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleDial} className="p-6 space-y-5">
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5 shadow-sm">
              <div className="flex items-center space-x-2 font-bold text-rose-900">
                <AlertCircle className="w-4 h-4 shrink-0 text-brand-red" />
                <span>Telephony Carrier Notification</span>
              </div>
              <p className="leading-relaxed pl-6">{error}</p>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1 shadow-sm">
              <div className="flex items-center space-x-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Call Successfully Dispatched</span>
              </div>
              <p className="leading-relaxed pl-6">{successMsg}</p>
              {attemptId && (
                <div className="pl-6 pt-1 font-mono text-[11px] text-emerald-700">
                  Carrier Attempt: <strong>{attemptId}</strong>
                </div>
              )}
            </div>
          )}

          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-black mb-1.5">
                Recipient Handset Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9705772881"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F4F5F7] border border-transparent focus:border-brand-red focus:bg-white text-xs font-mono font-medium text-brand-black focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-black mb-1.5">
                Contact Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suresh Kumar"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F4F5F7] border border-transparent focus:border-brand-red focus:bg-white text-xs font-medium text-brand-black focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Assigned Task / Script Instructions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-brand-black">
                Mission Task & Script Instructions
              </label>
              <span className="text-[11px] text-brand-red font-medium">Spoken in Natural Tenglish</span>
            </div>
            <textarea
              rows={3}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Specify the exact goal, questions to ask, budget qualification, or appointment to confirm..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F4F5F7] border border-transparent focus:border-brand-red focus:bg-white text-xs font-medium text-brand-black focus:outline-none transition-all resize-none leading-relaxed"
              required
            />
            <p className="mt-1.5 text-[11px] text-brand-textMuted">
              The Voice Agent will dynamically formulate its speech and follow this exact objective during the live call.
            </p>
          </div>

          {/* Preset Quick Goals */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold text-brand-textSecondary">Quick Task Presets</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTask('Qualify 3BHK luxury flat inquiry, verify budget ₹1.8–2.0 Cr, confirm Saturday 11:30 AM private site visit.')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-brand-red/10 text-[11px] font-medium text-brand-textSecondary hover:text-brand-red transition-all"
              >
                VIP Site Visit
              </button>
              <button
                type="button"
                onClick={() => setTask('Check if client is available for property consultation today, confirm preferred Hyderabad location and budget.')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-brand-red/10 text-[11px] font-medium text-brand-textSecondary hover:text-brand-red transition-all"
              >
                Immediate Consultation
              </button>
              <button
                type="button"
                onClick={() => setTask('Follow up on brochure sent yesterday, answer queries regarding floor plans and amenities, schedule callback.')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-brand-red/10 text-[11px] font-medium text-brand-textSecondary hover:text-brand-red transition-all"
              >
                Brochure Follow-up
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-brand-textSecondary hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-brand-red hover:bg-brand-redDark text-white text-xs font-bold shadow-sm shadow-brand-red/30 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Contacting Carrier...</span>
                </>
              ) : (
                <>
                  <Phone className="w-3.5 h-3.5" />
                  <span>Initiate Live Call</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
