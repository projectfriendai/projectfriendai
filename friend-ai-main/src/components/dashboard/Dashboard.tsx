import React from 'react';
import { Metrics } from './Metrics';
import { MoodChart } from './MoodChart';
import { JournalEntry } from './JournalEntry';

interface DashboardProps {
  alias?: string;
  onStartChat?: () => void;
  onNewEntry?: () => void;
}

export function Dashboard({ alias = "Friend", onStartChat, onNewEntry }: DashboardProps) {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  return (
    <div className="w-full max-w-7xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-white border border-[#EDEBE7] p-8 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8F0EA]/50 via-transparent to-[#F5E6E0]/30 opacity-60"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#7A9E85]/20 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#DEE8F0]/20 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150 delay-75"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2B2B2B] tracking-tight font-display mb-2">
              {greeting}, {alias}
            </h1>
            <p className="text-[#6B6B6B] text-sm md:text-base max-w-xl leading-relaxed">
              Welcome back to your sanctuary. We've gathered some insights on your recent interactions and wellness trends.
            </p>
          </div>
          <button 
            onClick={onStartChat}
            className="px-6 py-3 bg-[#7A9E85] text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            Start New Chat
          </button>
        </div>
      </div>

      <Metrics />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        <div className="lg:col-span-8 flex flex-col h-full">
          <MoodChart />
        </div>
        
        <div className="lg:col-span-4 flex flex-col h-full">
          <JournalEntry onNewEntry={onNewEntry} />
        </div>
      </div>
    </div>
  );
}