import React from 'react';

export const Dashboard: React.FC<{
  onNavigateToWrite: () => void;
  onNavigateToInbox: () => void;
}> = ({ onNavigateToWrite, onNavigateToInbox }) => {

  return (
    <div className="bg-[#FAF8F5] dark:bg-gray-950 pb-24">

      {/* Visual Header */}
      <div className="bg-[#2B2B2B] dark:bg-gray-800 text-white py-12 px-6 relative overflow-hidden rounded-b-[40px] shadow-sm">
        <div className="max-w-4xl mx-auto relative z-10 space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#7A9E85]/20 dark:bg-amber-500/20 border border-[#7A9E85]/30 dark:border-amber-500/30 flex items-center justify-center text-3xl">
              ✉️
            </div>
            <div>
              <h1 className="text-3xl font-[family-name:var(--font-letters-serif)] font-bold">Friend AI Letters</h1>
              <p className="text-white/60 text-xs tracking-wider uppercase font-semibold">Connections that take time</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7A9E85]/10 dark:bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-8">

        {/* Recently Received Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <h2 className="text-xl font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100 flex items-center gap-2">
              <span>Recently Received</span>
            </h2>
            <button
              onClick={onNavigateToInbox}
              className="text-[#7A9E85] dark:text-amber-400 text-xs font-bold hover:underline"
            >
              See All
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth">
            <div className="flex-shrink-0 w-64 bg-white/50 dark:bg-gray-900/50 border-2 border-dashed border-[#EDEBE7] dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center p-5 text-center text-[#2B2B2B]/60 dark:text-gray-400">
              <span className="text-3xl mb-2">🖋</span>
              <p className="text-xs font-bold">No letters received yet. Write one to get started!</p>
              <button
                onClick={onNavigateToWrite}
                className="mt-3 text-xs bg-[#2B2B2B] dark:bg-gray-800 text-white px-4 py-1.5 rounded-full hover:bg-[#2B2B2B]/95 dark:hover:bg-gray-700 transition font-semibold"
              >
                Draft New
              </button>
            </div>
          </div>
        </div>

        {/* Incoming Letter Status Card */}
        <div className="space-y-4">
          <h3 className="text-lg font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100">Incoming Deliveries</h3>
          <div className="bg-white dark:bg-gray-900 border border-[#EDEBE7] dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7A9E85]/15 dark:bg-amber-500/15 flex items-center justify-center text-lg">
                📭
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#2B2B2B] dark:text-gray-100">No incoming deliveries</h4>
                <p className="text-[#2B2B2B]/60 dark:text-gray-400 text-xs mt-0.5">Letters will appear here once someone sends you one.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Friend Requests and quick metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-[#EDEBE7] dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:bg-[#EDEBE7]/30 dark:hover:bg-gray-800 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <h4 className="font-bold text-sm text-[#2B2B2B] dark:text-gray-100">Friend Requests</h4>
                <p className="text-[#2B2B2B]/60 dark:text-gray-400 text-xs">No pending requests</p>
              </div>
            </div>
            <span className="text-[#2B2B2B]/40 dark:text-gray-500 text-lg">➔</span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-[#EDEBE7] dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:bg-[#EDEBE7]/30 dark:hover:bg-gray-800 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h4 className="font-bold text-sm text-[#2B2B2B] dark:text-gray-100">Collectibles unlocked</h4>
                <p className="text-[#2B2B2B]/60 dark:text-gray-400 text-xs">Check your Stamp Album</p>
              </div>
            </div>
            <span className="text-[#2B2B2B]/40 dark:text-gray-500 text-lg">➔</span>
          </div>
        </div>

      </div>
    </div>
  );
};
