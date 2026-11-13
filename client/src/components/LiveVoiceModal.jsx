import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  User,
  Radio,
  Play,
  RotateCcw,
  Headphones,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { agentsApi } from '../api/index.js';

export const LiveVoiceModal = ({ agent, isOpen, onClose }) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [handsFree, setHandsFree] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);
  const currentAudioRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimText, isAiSpeaking, isAiThinking]);

  useEffect(() => {
    if (!isOpen) {
      cleanupAudioAndMic();
    }
  }, [isOpen]);

  const cleanupAudioAndMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
      } catch (e) {}
      currentAudioRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    setIsListening(false);
    setIsAiSpeaking(false);
    setIsAiThinking(false);
    setSessionActive(false);
  };

  const startSession = async () => {
    setErrorMessage('');
    setTranscript([]);
    setSessionActive(true);

    setIsAiThinking(true);
    try {
      const res = await agentsApi.converse(agent._id, {
        userMessage: 'Hello',
        history: []
      });

      setIsAiThinking(false);
      if (res.success && res.data) {
        const turn = {
          role: 'assistant',
          speaker: agent.name,
          text: res.data.replyText,
          audioBase64: res.data.audioBase64,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setTranscript([turn]);

        if (res.data.audioBase64 && !isMuted) {
          playAudioTurn(res.data.audioBase64, () => {
            if (handsFree) {
              startListening();
            }
          });
        } else if (handsFree) {
          startListening();
        }
      }
    } catch (err) {
      setIsAiThinking(false);
      setErrorMessage(err.message || 'Failed to start conversation');
    }
  };

  const playAudioTurn = (audioBase64, onEndedCallback) => {
    if (!audioBase64) {
      if (onEndedCallback) onEndedCallback();
      return;
    }

    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }

      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      currentAudioRef.current = audio;
      setIsAiSpeaking(true);

      audio.onended = () => {
        setIsAiSpeaking(false);
        if (onEndedCallback) onEndedCallback();
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        setIsAiSpeaking(false);
        if (onEndedCallback) onEndedCallback();
      };

      audio.play().catch(e => {
        console.warn('Autoplay prevented:', e);
        setIsAiSpeaking(false);
        if (onEndedCallback) onEndedCallback();
      });
    } catch (err) {
      console.error('Audio play exception:', err);
      setIsAiSpeaking(false);
      if (onEndedCallback) onEndedCallback();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome/Edge or type below.');
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setIsAiSpeaking(false);

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = agent.language === 'Telugu' ? 'te-IN' : agent.language === 'Hindi' ? 'hi-IN' : 'en-IN';

      let silenceTimeout = null;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            currentInterim += trans;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        }

        if (silenceTimeout) clearTimeout(silenceTimeout);

        if (finalTranscript.trim()) {
          silenceTimeout = setTimeout(() => {
            stopListeningAndSend(finalTranscript);
          }, 1200);
        } else if (currentInterim.trim()) {
          silenceTimeout = setTimeout(() => {
            stopListeningAndSend(currentInterim);
          }, 2000);
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current && !isAiSpeaking && !isAiThinking) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Recognition start exception:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const stopListeningAndSend = (finalText) => {
    stopListening();
    const textToSend = (finalText || interimText).trim();
    setInterimText('');
    if (textToSend) {
      handleUserSendMessage(textToSend);
    }
  };

  const handleUserSendMessage = async (messageText) => {
    if (!messageText || !messageText.trim()) return;

    const userTurn = {
      role: 'user',
      speaker: 'You',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const newHistory = [...transcript, userTurn];
    setTranscript(newHistory);
    setTypedMessage('');
    setIsAiThinking(true);
    setErrorMessage('');

    try {
      const historyPayload = newHistory.map(t => ({
        role: t.role === 'user' ? 'user' : 'assistant',
        content: t.text
      }));

      const res = await agentsApi.converse(agent._id, {
        userMessage: messageText.trim(),
        history: historyPayload
      });

      setIsAiThinking(false);

      if (res.success && res.data) {
        const aiTurn = {
          role: 'assistant',
          speaker: agent.name,
          text: res.data.replyText,
          audioBase64: res.data.audioBase64,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        setTranscript((prev) => [...prev, aiTurn]);

        if (res.data.audioBase64 && !isMuted) {
          playAudioTurn(res.data.audioBase64, () => {
            if (handsFree) {
              startListening();
            }
          });
        } else if (handsFree) {
          startListening();
        }
      }
    } catch (err) {
      setIsAiThinking(false);
      setErrorMessage(err.message || 'Failed to generate voice response');
    }
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-mono font-bold text-sm shadow-sm">
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
              {sessionActive && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">{agent.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-mono flex items-center space-x-1 font-bold">
                  <Sparkles className="w-3 h-3 mr-0.5 text-sky-600" />
                  <span>Sarvam Speech bulbul:v3</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">{agent.role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setHandsFree(!handsFree)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium border transition-all ${
                handsFree
                  ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-sm'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Automatic microphone listening"
            >
              Hands-Free: {handsFree ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Audio Visualizer Hero Banner */}
        <div className="py-6 px-6 bg-gradient-to-b from-sky-50/60 via-slate-50/30 to-white border-b border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Status Capsule */}
          <div className="flex items-center space-x-2 mb-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isAiSpeaking
                  ? 'bg-sky-600 animate-ping'
                  : isListening
                  ? 'bg-emerald-500 animate-pulse'
                  : isAiThinking
                  ? 'bg-amber-400 animate-bounce'
                  : sessionActive
                  ? 'bg-slate-400'
                  : 'bg-slate-300'
              }`}
            />
            <span className="text-xs font-mono font-semibold tracking-wide text-slate-700 uppercase">
              {!sessionActive
                ? 'Ready to Connect'
                : isAiSpeaking
                ? 'Speaking with Sarvam bulbul:v3...'
                : isListening
                ? 'Listening to your voice... Speak naturally'
                : isAiThinking
                ? 'Synthesizing voice response...'
                : 'Connected • Tap mic to speak'}
            </span>
          </div>

          {/* Central Interactive Orb / Visualizer */}
          <div className="relative my-2 flex items-center justify-center">
            {(isListening || isAiSpeaking) && (
              <>
                <div
                  className={`absolute w-24 h-24 rounded-full opacity-25 animate-ping ${
                    isAiSpeaking ? 'bg-sky-500' : 'bg-emerald-500'
                  }`}
                />
                <div
                  className={`absolute w-32 h-32 rounded-full opacity-15 animate-pulse ${
                    isAiSpeaking ? 'bg-sky-500' : 'bg-emerald-500'
                  }`}
                />
              </>
            )}

            {!sessionActive ? (
              <button
                onClick={startSession}
                className="relative z-10 px-6 py-3 rounded-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-sky-600/25 transition-all hover:scale-105 active:scale-95"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Start Two-Way Voice Session</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (isListening) {
                    stopListeningAndSend();
                  } else {
                    startListening();
                  }
                }}
                className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center border transition-all shadow-lg ${
                  isAiSpeaking
                    ? 'bg-sky-50 border-sky-500 text-sky-600 animate-pulse ring-4 ring-sky-100'
                    : isListening
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-600 scale-105 ring-4 ring-emerald-100 shadow-emerald-500/20'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                }`}
                title={isListening ? 'Tap to finish speaking & send' : 'Tap to speak'}
              >
                {isListening ? (
                  <Mic className="w-7 h-7 animate-pulse text-emerald-600" />
                ) : isAiSpeaking ? (
                  <Volume2 className="w-7 h-7 text-sky-600 animate-bounce" />
                ) : (
                  <MicOff className="w-6 h-6 text-slate-400" />
                )}
                <span className="text-[9px] font-mono mt-1 font-semibold text-slate-600">
                  {isListening ? 'Listening' : isAiSpeaking ? 'Speaking' : 'Tap to Talk'}
                </span>
              </button>
            )}
          </div>

          {/* Equalizer Frequency Bars */}
          <div className="flex items-center justify-center space-x-1.5 mt-3 h-6">
            {[40, 75, 100, 60, 85, 30, 95, 50, 80, 65, 90, 45, 70].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isAiSpeaking
                    ? 'bg-sky-500 animate-pulse'
                    : isListening
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-slate-200 h-1.5'
                }`}
                style={{
                  height: isAiSpeaking || isListening ? `${Math.max(4, (h * (isAiSpeaking ? 1 : 0.8)) / 4)}px` : '4px',
                  animationDelay: `${i * 70}ms`
                }}
              />
            ))}
          </div>

          {interimText && (
            <div className="mt-3 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono max-w-md mx-auto truncate shadow-sm animate-in fade-in">
              <span className="opacity-70 mr-1.5 font-bold">You:</span> "{interimText}"
            </div>
          )}

          {errorMessage && (
            <div className="mt-2 text-xs text-rose-600 font-mono flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Live Conversation Transcript Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-[220px] max-h-[340px] bg-slate-50/50 font-sans">
          {transcript.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              {!sessionActive
                ? 'Click "Start Two-Way Voice Session" to converse with this AI Employee using your microphone and Sarvam Speech.'
                : 'Connecting with Sarvam Speech Engine...'}
            </div>
          ) : (
            transcript.map((turn, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${turn.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 px-1">
                  {turn.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-sky-600" />}
                  <span className="font-semibold">{turn.speaker}</span>
                  <span>•</span>
                  <span>{turn.timestamp}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm ${
                    turn.role === 'user'
                      ? 'bg-sky-600 text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                  }`}
                >
                  <p>{turn.text}</p>

                  {turn.audioBase64 && (
                    <button
                      onClick={() => playAudioTurn(turn.audioBase64)}
                      className="mt-2 flex items-center space-x-1 text-[10px] font-mono text-sky-600 hover:text-sky-700 transition-colors font-semibold"
                      title="Replay Sarvam voice"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Replay Sarvam Speech</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {isAiThinking && (
            <div className="flex items-start space-y-1">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-mono flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
                <span>{agent.name} is synthesizing response with Sarvam...</span>
              </div>
            </div>
          )}

          <div ref={transcriptEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typedMessage.trim()) {
                handleUserSendMessage(typedMessage);
              }
            }}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopListeningAndSend();
                } else {
                  startListening();
                }
              }}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title={isListening ? 'Stop recording & send' : 'Speak into microphone'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder={isListening ? 'Listening to speech... or type here...' : 'Speak into mic, or type your message here...'}
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all shadow-inner"
            />

            <button
              type="submit"
              disabled={!typedMessage.trim() || isAiThinking}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-40 text-white transition-colors shadow-sm shadow-sky-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Powered by Sarvam bulbul:v3 AI Speech Engine</span>
            <span>Caller ID: +91 79714 14044 (Sarvam Vobiz)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
