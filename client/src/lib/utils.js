import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds = 0) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function formatPhone(phone = '') {
  return phone.replace(/(\+\d{2})(\d{5})(\d{5})/, '$1 $2-$3');
}

export function formatOutcome(outcome = '') {
  const map = {
    qualified: { label: 'Qualified', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    interested: { label: 'Interested', bg: 'bg-rose-50', text: 'text-brand-red', border: 'border-rose-200' },
    callback: { label: 'Callback', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    not_interested: { label: 'Not Interested', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    no_answer: { label: 'No Answer', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    busy: { label: 'Busy Line', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    failed: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    pending: { label: 'Pending', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    in_progress: { label: 'In Conversation', bg: 'bg-rose-50', text: 'text-brand-red', border: 'border-rose-200' },
    completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    initiated: { label: 'Dialing Trunk', bg: 'bg-slate-100', text: 'text-brand-black', border: 'border-slate-300' },
    ringing: { label: 'Ringing Handset', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
  };
  return map[outcome] || { label: outcome || 'Unknown', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
}
