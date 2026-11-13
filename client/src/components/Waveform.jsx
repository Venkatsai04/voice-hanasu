import React from 'react';

export const Waveform = ({ active = false }) => {
  return (
    <div className="flex items-center space-x-1.5 h-8 px-3 rounded-lg bg-sky-50 border border-sky-200">
      <div className={`w-1 rounded-full bg-sky-500 ${active ? 'animate-wave-1' : 'h-2'}`} />
      <div className={`w-1 rounded-full bg-sky-500 ${active ? 'animate-wave-2' : 'h-3'}`} />
      <div className={`w-1 rounded-full bg-sky-500 ${active ? 'animate-wave-3' : 'h-1.5'}`} />
      <div className={`w-1 rounded-full bg-sky-500 ${active ? 'animate-wave-4' : 'h-4'}`} />
      <div className={`w-1 rounded-full bg-sky-500 ${active ? 'animate-wave-5' : 'h-2'}`} />
    </div>
  );
};
