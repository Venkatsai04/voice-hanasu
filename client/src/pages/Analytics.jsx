import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PhoneCall,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Users
} from 'lucide-react';
import { analyticsApi } from '../api/index.js';
import { Topbar } from '../components/Topbar.jsx';
import { MetricCard } from '../components/MetricCard.jsx';
import { formatDuration } from '../lib/utils.js';

export const Analytics = () => {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getDashboard(range);
      if (res.success) setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const kpis = data?.kpis || {};
  const breakdown = data?.outcomeBreakdown || {};
  const trends = data?.dailyTrend || [];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F5F7] overflow-y-auto">
      <Topbar
        title="Business Intelligence & Analytics"
        description="Conversion telemetry, carrier connection rates, and lead qualification insights"
        actions={
          <div className="flex items-center space-x-1 p-1 rounded-full bg-white border border-slate-200/80 shadow-sm">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' }
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-4 py-1.5 text-xs rounded-full font-bold transition-all ${
                  range === r.id
                    ? 'bg-[#09090B] text-white shadow-sm'
                    : 'text-brand-textSecondary hover:text-brand-black hover:bg-slate-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Core KPI Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="TOTAL CALL VOLUME"
            value={kpis.totalCalls || 0}
            subtext="Processed via Outbound Trunk"
            icon={PhoneCall}
          />
          <MetricCard
            title="TELEPHONY CONNECTION RATE"
            value={`${kpis.connectionRate || 0}%`}
            subtext={`${kpis.connectedCalls || 0} answered calls`}
            icon={TrendingUp}
          />
          <MetricCard
            title="LEAD QUALIFICATION RATE"
            value={`${kpis.qualificationRate || 0}%`}
            subtext={`${kpis.qualifiedLeads || 0} qualified opportunities`}
            icon={CheckCircle2}
            trend="High Intent"
          />
          <MetricCard
            title="AVERAGE CONVERSATION DURATION"
            value={formatDuration(kpis.avgDurationSeconds || 0)}
            subtext="Per connected call"
            icon={Clock}
          />
        </div>

        {/* Daily Conversion Trends & Outcome Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Trends Visualization */}
          <div className="lg:col-span-2 p-6 lg:p-8 rounded-3xl bg-white shadow-soft-card border border-slate-100/80 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-black">Call Volume & Connection Velocity</h3>
                <p className="text-xs text-brand-textSecondary mt-0.5">Dispatched calls vs connected calls via voice trunk</p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono font-semibold">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                  <span className="text-slate-600">Total Calls</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Connected</span>
                </span>
              </div>
            </div>

            {/* Visual Bar Graph */}
            <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 border-b border-slate-100">
              {trends.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                  No call data in this date range.
                </div>
              ) : (
                trends.map((day) => {
                  const maxVal = Math.max(...trends.map(t => t.total), 10);
                  const totalH = Math.max(8, Math.round((day.total / maxVal) * 190));
                  const connH = Math.max(4, Math.round((day.connected / maxVal) * 190));

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full flex items-end justify-center gap-1.5 h-48">
                        {/* Total bar */}
                        <div
                          className="w-1/2 bg-sky-600 hover:bg-sky-500 rounded-t-lg transition-colors shadow-sm"
                          style={{ height: `${totalH}px` }}
                          title={`Total: ${day.total}`}
                        />
                        {/* Connected bar */}
                        <div
                          className="w-1/2 bg-emerald-500 hover:bg-emerald-400 rounded-t-lg transition-colors shadow-sm"
                          style={{ height: `${connH}px` }}
                          title={`Connected: ${day.connected}`}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-2 truncate font-semibold">
                        {day.date.slice(5)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Outcome Attribution Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Outcome Attribution</h3>
            <div className="space-y-3.5">
              {[
                { label: 'Qualified Opportunities', count: breakdown.qualified || 0, color: 'bg-emerald-500', desc: 'High buyer intent verified' },
                { label: 'Interested Prospects', count: breakdown.interested || 0, color: 'bg-sky-500', desc: 'Requested brochures/pricing' },
                { label: 'Scheduled Callbacks', count: breakdown.callback || 0, color: 'bg-amber-500', desc: 'Requested evening/weekend call' },
                { label: 'Not Interested', count: breakdown.notInterested || 0, color: 'bg-slate-400', desc: 'Opted out' },
                { label: 'No Answer / Ringout', count: breakdown.noAnswer || 0, color: 'bg-orange-400', desc: 'Voicemail or no answer' },
                { label: 'Busy / Rejected', count: breakdown.busy || 0, color: 'bg-rose-400', desc: 'Line busy signal' }
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="font-mono text-slate-900 font-bold">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-300`}
                      style={{
                        width: `${kpis.totalCalls > 0 ? (item.count / kpis.totalCalls) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
