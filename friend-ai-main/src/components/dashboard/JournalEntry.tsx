import React from 'react';
import { Plus, Book } from 'lucide-react';

interface JournalEntryProps {
  onNewEntry?: () => void;
}

export function JournalEntry({ onNewEntry }: JournalEntryProps) {
  return (
    <div className="bg-white border border-[#EDEBE7] rounded-2xl p-6 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between">
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#DEE8F0]/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#E8F0EA] rounded-xl flex items-center justify-center border border-[#EDEBE7] shrink-0">
              <Book className="w-5 h-5 text-[#7A9E85]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2B2B2B]">Journal</h3>
              <p className="text-xs text-[#6B6B6B]">Latest entries</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-6 border border-dashed border-[#EDEBE7] rounded-xl bg-[#FAF8F5]">
          <p className="text-xs font-semibold text-[#2B2B2B]">No journal entries yet</p>
          <p className="text-[10px] text-[#6B6B6B] mt-1 text-center">Tap 'New Entry' below to write your first reflection.</p>
        </div>
      </div>

      <button onClick={onNewEntry} className="w-full mt-6 py-3 bg-[#E8F0EA] text-[#7A9E85] font-bold rounded-xl border border-[#EDEBE7] hover:bg-[#D6E8DA] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
        <Plus className="w-4 h-4" />
        New Entry
      </button>
    </div>
  );
}