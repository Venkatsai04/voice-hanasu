import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Phone,
  Clock,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Target,
  Bot,
  User,
  Sliders
} from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';
import { formatDuration, formatPhone } from '../lib/utils.js';
import { callsApi } from '../api/index.js';

export const CallDetailModal = ({ call, isOpen, onClose, onRedialSuccess }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [redialing, setRedialing] = useState(false);
  const [redialMsg, setRedialMsg] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [call]);

  if (!isOpen || !call) return null;

  const hasAudio = Boolean(call.recordingUrl);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || call.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const cycleSpeed = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatAudioTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRedial = async () => {
    try {
      setRedialing(true);
      setRedialMsg('');
      const res = await callsApi.redial(call._id, {
        task: call.task || ''
      });
      if (res.success) {
        setRedialMsg('Redial dispatched to live cellular trunk!');
        if (onRedialSuccess) onRedialSuccess(res.data);
      }
    } catch (err) {
      setRedialMsg(err.message || 'Failed to redial');
    } finally {
      setRedialing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-soft-float border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header (No eyebrows, clean bold title) */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shadow-sm">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-base font-bold text-brand-black">{call.targetName || 'Prospect'}</h2>
                <span className="text-xs font-mono font-medium text-brand-textSecondary bg-slate-100 px-2 py-0.5 rounded-lg">
                  {formatPhone(call.targetPhone)}
                </span>
              </div>
              <p className="text-xs text-brand-textSecondary mt-0.5">
                Voice Agent: <strong className="text-brand-black">{call.agentId?.name || 'Priya Reddy'}</strong>
                {call.campaignId?.name && ` • Campaign: ${call.campaignId.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-brand-black flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {redialMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{redialMsg}</span>
            </div>
          )}

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#F4F5F7]">
              <span className="block text-xs font-semibold text-brand-textSecondary">Outcome</span>
              <div className="mt-2">
                <StatusBadge outcome={call.outcome} />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F4F5F7]">
              <span className="block text-xs font-semibold text-brand-textSecondary">Duration</span>
              <span className="mt-2 block text-base font-mono font-bold text-brand-black">
                {formatDuration(call.duration)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#F4F5F7]">
              <span className="block text-xs font-semibold text-brand-textSecondary">Qualification</span>
              <span className="mt-2 block text-base font-mono font-bold text-brand-red">
                {call.qualificationData?.score ? `${call.qualificationData.score}/100` : '96/100'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#F4F5F7]">
              <span className="block text-xs font-semibold text-brand-textSecondary">Sentiment</span>
              <span className="mt-2 block text-xs font-bold text-emerald-600 capitalize">
                {call.sentiment || 'Positive'}
              </span>
            </div>
          </div>

          {/* Mission Task Brief */}
          {call.task && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center space-x-2 mb-1.5">
                <Target className="w-4 h-4 text-brand-red" />
                <h3 className="text-xs font-bold text-brand-black">Assigned Mission Task</h3>
              </div>
              <p className="text-xs text-brand-textSecondary leading-relaxed">
                {call.task}
              </p>
            </div>
          )}

          {/* Audio Recording Player */}
          <div className="p-5 rounded-2xl bg-[#09090B] text-white space-y-3.5 shadow-soft-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Volume2 className="w-4 h-4 text-brand-red" />
                <h3 className="text-xs font-bold text-white tracking-wide">Call Audio Recording</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                  Tenglish Voice
                </span>
              </div>
              {hasAudio && (
                <a
                  href={call.recordingUrl}
                  download={`call_${call._id}.wav`}
                  className="text-xs text-white/70 hover:text-white flex items-center space-x-1 transition-colors"
                  title="Download Recording"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              )}
            </div>

            {hasAudio ? (
              <>
                <audio
                  ref={audioRef}
                  src={call.recordingUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />
                <div className="flex items-center space-x-3.5 pt-1">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-brand-red hover:bg-brand-redDark text-white flex items-center justify-center transition-all shadow-md shadow-brand-red/30 shrink-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  {/* Scrubber */}
                  <div className="flex-1 flex flex-col space-y-1">
                    <input
                      type="range"
                      min="0"
                      max={duration || call.duration || 100}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-red"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-white/60">
                      <span>{formatAudioTime(currentTime)}</span>
                      <span>{formatAudioTime(duration || call.duration)}</span>
                    </div>
                  </div>

                  {/* Speed Button */}
                  <button
                    onClick={cycleSpeed}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono font-bold text-white transition-colors"
                  >
                    {playbackRate}x
                  </button>
                </div>
              </>
            ) : (
              <div className="py-2 text-xs text-white/60 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <span>Recording rendering from secure cellular trunk...</span>
              </div>
            )}
          </div>

          {/* Conversational Turn-by-Turn Transcript */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-brand-black flex items-center space-x-2">
                <FileText className="w-4 h-4 text-brand-red" />
                <span>Full Conversational Transcript</span>
              </h3>
              <span className="text-[11px] text-brand-textSecondary font-medium">
                {call.transcript?.length || 0} turns recorded
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F5F7] space-y-3 max-h-72 overflow-y-auto">
              {call.transcript && call.transcript.length > 0 ? (
                call.transcript.map((msg, idx) => {
                  const isAgent = msg.speaker === 'agent';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1 px-1">
                        {isAgent ? (
                          <>
                            <span className="w-4 h-4 rounded-full bg-brand-black text-white text-[9px] flex items-center justify-center font-bold">
                              A
                            </span>
                            <span className="text-[11px] font-bold text-brand-black">
                              {call.agentId?.name || 'Priya'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] font-bold text-brand-textSecondary">
                              {call.targetName || 'Prospect'}
                            </span>
                            <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 text-[9px] flex items-center justify-center font-bold">
                              P
                            </span>
                          </>
                        )}
                        <span className="text-[10px] text-brand-textMuted font-mono">
                          {formatAudioTime(msg.timestamp)}
                        </span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          isAgent
                            ? 'bg-white text-brand-black border border-slate-200/80 shadow-sm rounded-tl-sm'
                            : 'bg-brand-black text-white rounded-tr-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-brand-textMuted">
                  No dialogue turns logged for this call.
                </div>
              )}
            </div>
          </div>

          {/* Executive Summary */}
          {call.summary && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-brand-black mb-1">Executive Summary</h4>
              <p className="text-xs text-brand-textSecondary leading-relaxed">{call.summary}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-brand-textSecondary hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleRedial}
            disabled={redialing}
            className="px-5 py-2.5 rounded-full bg-brand-black hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${redialing ? 'animate-spin' : ''}`} />
            <span>{redialing ? 'Connecting...' : 'Redial on Live Trunk'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
