import React from 'react';
import { formatOutcome } from '../lib/utils.js';

export const StatusBadge = ({ status, outcome }) => {
  const target = outcome || status || 'unknown';
  const styling = formatOutcome(target);

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${styling.bg} ${styling.text} ${styling.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{styling.label}</span>
    </span>
  );
};
