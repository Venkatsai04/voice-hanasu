import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  PhoneCall,
  PhoneOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Building2,
  ShieldCheck,
  Activity,
  RotateCcw
} from 'lucide-react';
import { agentsApi } from '../api/index.js';
import { useSocket } from '../context/SocketContext.jsx';
import { Waveform } from './Waveform.jsx';
import { StatusBadge } from './StatusBadge.jsx';
import { formatDuration } from '../lib/utils.js';

export const TestCallModal = ({ agent, isOpen, onClose }) => {
  const { socket } = useSocket();
  const [phoneNumber, setPhoneNumber] = useState('+91 9705772881');
  const [targetName, setTargetName] = useState('Sai Kumar');
  const [isCalling, setIsCalling] = useState(false);
  const [callState, setCallState] = useState('idle'); // idle | preparing | ringing | connected | in_progress | completed | failed
  const [activeCallId, setActiveCallId] = useState(null);
  const [carrierCallSid, setCarrierCallSid] = useState('');
  const activeCallIdRef = useRef(null);
  const [carrierEvents, setCarrierEvents] = useState([]);
  const [callResult, setCallResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [callTimer, setCallTimer] = useState(0);
  const timerIntervalRef = useRef(null);

  // Keep ref in sync
  useEffect(() => {
    activeCallIdRef.current = activeCallId;
  }, [activeCallId]);

  // Duration timer when connected
  useEffect(() => {
    if (callState === 'connected' || callState === 'in_progress') {
      timerIntervalRef.current = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [callState]);

  // Helper to add carrier event
  const addCarrierEvent = (msg) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCarrierEvents((prev) => [...prev, { time, msg }]);
  };

  // Listen to live socket events for this real call
  useEffect(() => {
    if (!socket) return;

    const matchesCall = (id) => {
      if (!id) return true;
      if (!activeCallIdRef.current) return true;
      return id === activeCallIdRef.current;
    };

    const handleRinging = (data) => {
      if (matchesCall(data?.callId)) {
        setCallState('ringing');
        if (data?.providerCallId) setCarrierCallSid(data.providerCallId);
        addCarrierEvent(`Telephony carrier alerting handset: ${data?.leadPhone || phoneNumber} is ringing...`);
      }
    };

    const handleConnected = (data) => {
      if (matchesCall(data?.callId)) {
        setCallState('connected');
        if (data?.providerCallId) setCarrierCallSid(data.providerCallId);
        addCarrierEvent('Call connected on Sarvam Vobiz Telephony Line (+91 79714 14044). Audio pipeline active.');
      }
    };

    const handleInProgress = (data) => {
      if (matchesCall(data?.callId)) {
        setCallState('in_progress');
        addCarrierEvent('Call in progress on Sarvam Telephony line. Sarvam Voice Engine (bulbul:v3) active.');
      }
    };

    const handleCompleted = (data) => {
      if (matchesCall(data?.callId)) {
        setCallState('completed');
        setCallResult(data.call);
        setIsCalling(false);
        addCarrierEvent(`Call settled on Sarvam Telephony network. Duration: ${data.call?.duration || 0}s.`);
      }
    };

    socket.on('call:ringing', handleRinging);
    socket.on('call:connected', handleConnected);
    socket.on('call:in_progress', handleInProgress);
    socket.on('call:completed', handleCompleted);

    return () => {
      socket.off('call:ringing', handleRinging);
      socket.off('call:connected', handleConnected);
      socket.off('call:in_progress', handleInProgress);
      socket.off('call:completed', handleCompleted);
    };
  }, [socket, phoneNumber]);

  const handleStartCall = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;

    try {
      setErrorMsg('');
      setIsCalling(true);
      setCallState('preparing');
      setCarrierEvents([]);
      setCallResult(null);
      setCallTimer(0);

      addCarrierEvent(`Dispatching outbound call to ${phoneNumber} via Sarvam Vobiz Telephony Line (+91 79714 14044)...`);

      const res = await agentsApi.testCall(agent._id, {
        phoneNumber,
        targetName,
        provider: 'sarvam'
      });

      if (res.success) {
        const id = res.data.callId;
        activeCallIdRef.current = id;
        setActiveCallId(id);
        if (res.data.providerCallId) {
          setCarrierCallSid(res.data.providerCallId);
          addCarrierEvent(`Sarvam Call SID assigned: ${res.data.providerCallId} (200 OK)`);
        }
        setCallState('ringing');
      } else {
        setErrorMsg(res.message || 'Failed to dispatch call to carrier gateway');
        setIsCalling(false);
        setCallState('idle');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error initiating cellular call');
      setIsCalling(false);
      setCallState('idle');
    }
  };

  const handleReset = () => {
    setCallState('idle');
    setCarrierEvents([]);
    setCallResult(null);
    setActiveCallId(null);
    setCarrierCallSid('');
    setCallTimer(0);
    activeCallIdRef.current = null;
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Direct Cellular Outbound Calling</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider font-bold">
                  Carrier Line Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                AI Employee: <strong className="text-slate-800 font-semibold">{agent.name}</strong> ({agent.role})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Call Configuration Form (idle) */}
          {callState === 'idle' && (
            <form onSubmit={handleStartCall} className="space-y-5">
              {/* Telephony Connection Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50/50 border border-sky-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    SV
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">Sarvam Vobiz Telephony Line</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                        Active Trunk
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                      Assigned Caller ID: <strong className="text-sky-800 font-bold">+91 79714 14044</strong> (India Mobile)
                    </p>
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-sky-600" />
              </div>

              {/* Number and Contact Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Recipient Mobile Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 9705772881"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">Dials directly to destination cellular handset</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Recipient Contact Name</label>
                  <input
                    type="text"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder="Sai Kumar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">Target contact for AI greeting and personalization</p>
                </div>
              </div>

              {/* Trunk & Voice Model Overview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Telephony Gateway:</span>
                  <span className="text-slate-800 font-semibold font-mono text-[11px]">Sarvam Vobiz Cloud Telephony Trunk</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Voice Synthesis Engine:</span>
                  <span className="text-sky-700 font-mono text-[11px] font-bold">Sarvam AI bulbul:v3 (Telugu & English)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Assigned Caller ID:</span>
                  <span className="text-slate-900 font-mono text-[11px] font-bold">+91 79714 14044 (Sarvam Vobiz)</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isCalling}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs transition-all shadow-md shadow-sky-600/20 active:scale-[0.98] disabled:opacity-50"
                >
                  <Phone className="w-4 h-4" />
                  <span>Dial Cellular Handset Now ({phoneNumber})</span>
                </button>
              </div>
            </form>
          )}

          {/* Active Call Live Telemetry Console */}
          {callState !== 'idle' && (
            <div className="space-y-5">
              {/* Status Header Bar */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50/90 to-blue-50/50 border border-sky-100 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 flex items-center justify-center shadow-sm">
                    {callState === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <PhoneCall className="w-5 h-5 animate-pulse text-sky-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900">{targetName}</span>
                      <span className="text-xs font-mono font-bold text-sky-900">{phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[11px] font-mono font-semibold text-sky-700">
                        {callState === 'preparing' && 'Connecting to Sarvam Telephony Gateway (+91 79714 14044)...'}
                        {callState === 'ringing' && `Handset Ringing on Sarvam Vobiz Line (${phoneNumber})...`}
                        {callState === 'connected' && 'Call connected on Sarvam Telephony trunk (+91 79714 14044)'}
                        {callState === 'in_progress' && 'Call in progress on Sarvam Telephony line'}
                        {callState === 'completed' && 'Call completed on Sarvam Telephony network'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Duration</span>
                    <span className="text-sm font-mono font-bold text-slate-800">
                      {formatDuration(callState === 'completed' ? (callResult?.duration || callTimer) : callTimer)}
                    </span>
                  </div>
                  <Waveform active={callState === 'in_progress' || callState === 'ringing'} />
                </div>
              </div>

              {/* Carrier SID Badge */}
              {carrierCallSid && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Sarvam Telephony SID:</span>
                  <span className="font-bold text-sky-900">{carrierCallSid}</span>
                </div>
              )}

              {/* Real-time Carrier Telemetry Event Log */}
              <div className="p-4 rounded-xl bg-slate-950 text-slate-100 space-y-2 min-h-[180px] max-h-[260px] overflow-y-auto font-mono text-[11px]">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center space-x-1.5 uppercase font-bold tracking-wider text-slate-300">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    <span>Live Sarvam Telemetry Log</span>
                  </span>
                  <span className="text-emerald-400 text-[10px] font-bold">SARVAM VOBIZ ONLINE</span>
                </div>

                {carrierEvents.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    Awaiting telecom carrier handshake...
                  </div>
                ) : (
                  carrierEvents.map((evt, idx) => (
                    <div key={idx} className="flex items-start space-x-2 py-0.5">
                      <span className="text-slate-500 select-none">[{evt.time}]</span>
                      <span className="text-sky-300">{evt.msg}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Call Completed Summary Card */}
              {callState === 'completed' && callResult && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <StatusBadge outcome={callResult.outcome} />
                      <span className="text-xs font-mono text-slate-500">
                        Duration: {formatDuration(callResult.duration)}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-emerald-600">
                      Settled with Sarvam Telephony
                    </span>
                  </div>

                  {callResult.summary && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Sarvam Telephony Summary
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {callResult.summary}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex justify-between items-center">
                    <button
                      onClick={handleReset}
                      className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Redial Handset</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
