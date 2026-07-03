import React, { useState } from 'react';
import { AutoMatch } from './AutoMatch';

interface FindFriendsProps {
  onMatched: (friendName: string) => void;
  userId?: string;
}

export const FindFriends: React.FC<FindFriendsProps> = ({ onMatched, userId }) => {
  const [mode, setMode] = useState<'selection' | 'auto'>('selection');
  const [friendIdInput, setFriendIdInput] = useState('');

  return (
    <div className="bg-[#FAF8F5] dark:bg-gray-950 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {mode !== 'selection' && (
          <button
            onClick={() => setMode('selection')}
            className="text-[#2B2B2B]/60 dark:text-gray-400 hover:text-[#2B2B2B] dark:hover:text-gray-100 text-sm font-bold flex items-center gap-1 mb-2"
          >
            &larr; Back to options
          </button>
        )}

        {mode === 'selection' && (
          <div className="space-y-6 bg-white dark:bg-gray-900 border border-[#EDEBE7] dark:border-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="text-center space-y-4 max-w-md mx-auto">
              <div className="w-48 h-48 mx-auto bg-[#7A9E85]/15 dark:bg-amber-500/15 rounded-full flex items-center justify-center text-5xl">
                🌍
              </div>
              <h2 className="text-3xl font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100">Ready to meet a new pal?</h2>
              <p className="text-[#2B2B2B]/60 dark:text-gray-400 text-sm">
                Start connecting with the world at a slower, more deliberate pace.
              </p>
            </div>

            <div className="space-y-3 pt-6 max-w-sm mx-auto">
              <button
                onClick={() => setMode('auto')}
                className="w-full bg-[#7A9E85] dark:bg-amber-500 hover:bg-[#6B9080] text-[#2B2B2B] dark:text-gray-100 font-bold py-3.5 px-6 rounded-full shadow-md transition"
              >
                Auto-match
              </button>
            </div>

            <div className="border-t border-[#EDEBE7] dark:border-gray-700 pt-6 flex flex-col items-center gap-2 max-w-sm mx-auto">
              <label className="text-xs uppercase text-[#2B2B2B]/50 dark:text-gray-400 tracking-wider font-bold">Add Friend By ID</label>
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="Enter friend ID"
                  value={friendIdInput}
                  onChange={(e) => setFriendIdInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-[#EDEBE7] dark:border-gray-800 rounded-full text-sm outline-none bg-[#FAF8F5] dark:bg-gray-950 focus:ring-1 focus:ring-[#7A9E85] dark:focus:ring-amber-400"
                />
                <button
                  onClick={() => {
                    if (friendIdInput.trim()) onMatched(friendIdInput);
                  }}
                  className="px-5 py-2 bg-[#EDEBE7] dark:bg-gray-800 text-[#2B2B2B] dark:text-gray-100 rounded-full hover:bg-[#EDEBE7]/80 dark:hover:bg-gray-700/80 transition text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'auto' && (
          <div className="bg-white dark:bg-gray-900 border border-[#EDEBE7] dark:border-gray-800 rounded-2xl p-8 shadow-sm">
            <AutoMatch onMatched={onMatched} userId={userId} />
          </div>
        )}

      </div>
    </div>
  );
};
