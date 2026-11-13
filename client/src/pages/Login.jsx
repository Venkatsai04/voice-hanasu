import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Bot, Radio, PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@sahara.ai');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await login({ email, password });
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    setEmail('admin@sahara.ai');
    setPassword('Password123!');
    setTimeout(() => {
      handleSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen w-screen bg-[#F4F5F7] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#09090B] shadow-md shadow-black/20 flex items-center justify-center mx-auto mb-3 text-white font-black text-sm">
            <span className="text-brand-red font-black">S</span>V
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-xl font-extrabold tracking-tight text-brand-black">SAHARA VOICE</h1>
            <span className="text-[10px] uppercase px-2 py-0.5 rounded-full font-mono font-bold bg-rose-50 text-brand-red border border-rose-200">
              PLATFORM
            </span>
          </div>
          <p className="text-xs text-brand-textSecondary">
            Autonomous Voice Intelligence Telephony
          </p>

          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm text-[11px] text-brand-textSecondary font-mono">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
            <span>Active Line: <strong className="text-brand-black">+91 79714 14044</strong></span>
          </div>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-sky-950/5 space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sahara.ai"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/80 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/80 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-all shadow-sm shadow-sky-600/20 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* 1-Click Quick Demo Sign In Button */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-sky-600" />
              <span>Sign In as Demo Admin (1-Click)</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Preconfigured with active voice trunk & live neural synthesis
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          New enterprise organization?{' '}
          <Link to="/register" className="text-sky-600 hover:underline font-medium">
            Register workspace
          </Link>
        </p>
      </div>
    </div>
  );
};
