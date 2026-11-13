import React from 'react';

export const MetricCard = ({ title, value, subtext, icon: Icon, trend }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span className="text-[11px] font-mono font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1.5 text-[11px] text-slate-500 font-medium">{subtext}</p>}
    </div>
  );
};
