import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../firebase/config';
import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  limit,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

interface AutoMatchProps {
  onMatched: (friendName: string) => void;
  userId?: string;
}

export const AutoMatch: React.FC<AutoMatchProps> = ({ onMatched, userId }) => {
  const userLabel = auth.currentUser?.uid || 'Anonymous';
  const [matchingState, setMatchingState] = useState<'idle' | 'searching' | 'found'>('idle');
  const [matchedAlias, setMatchedAlias] = useState('');
  const [dots, setDots] = useState('');
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUserDisplayName = async (uid: string): Promise<string> => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      const data = snap.data();
      return data?.displayName || data?.username || uid;
    } catch {
      return uid;
    }
  };

  useEffect(() => {
    if (matchingState !== 'searching') return;
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [matchingState]);

  useEffect(() => {
    return () => {
      stopPolling();
      if (userId) {
        deleteDoc(doc(db, 'matchmaking', userId)).catch(() => {});
      }
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = () => {
    if (!userId) return;
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const snap = await getDoc(doc(db, 'matchmaking', userId));
        const data = snap.data();
        if (data?.status === 'matched' && data.matchedWith) {
          stopPolling();
          const name = await fetchUserDisplayName(data.matchedWith);
          setMatchedAlias(name);
          setMatchingState('found');
        }
      } catch {}
    }, 2000);
  };

  const startMatching = async () => {
    if (!userId || userId === 'Guest') {
      setError('Sign in to use Auto-Match');
      return;
    }

    setMatchingState('searching');
    setError('');

    try {
      await setDoc(doc(db, 'matchmaking', userId), {
        userId,
        alias: userLabel,
        status: 'searching',
        createdAt: serverTimestamp(),
      });

      const q = query(
        collection(db, 'matchmaking'),
        where('status', '==', 'searching'),
        limit(20)
      );
      const snapshot = await getDocs(q);

      let matched = false;
      for (const matchDoc of snapshot.docs) {
        if (matchDoc.id === userId) continue;
        const data = matchDoc.data();
        const partnerId = matchDoc.id;

        try {
          await setDoc(doc(db, 'matchmaking', userId), {
            userId,
            alias: userLabel,
            status: 'matched',
            matchedWith: partnerId,
            createdAt: serverTimestamp(),
          });

          await setDoc(doc(db, 'matchmaking', partnerId), {
            ...data,
            status: 'matched',
            matchedWith: userId,
            matchedWithLabel: userLabel,
            createdAt: serverTimestamp(),
          });

          const displayName = await fetchUserDisplayName(partnerId);
          setMatchedAlias(displayName);
          setMatchingState('found');
          matched = true;
          break;
        } catch {}
      }

      if (!matched) {
        startPolling();
      }
    } catch (e) {
      setError('Connection error. Try again.');
      setMatchingState('idle');
    }
  };

  const handleSendLetter = () => {
    stopPolling();
    onMatched(matchedAlias || 'New Friend');
  };

  return (
    <div className="bg-[#FAF8F5] dark:bg-gray-950 min-h-[500px] flex flex-col items-center justify-center p-6 text-center">
      {matchingState === 'idle' && (
        <div className="max-w-md w-full space-y-6">
          <div className="w-48 h-48 mx-auto bg-[#7A9E85]/10 dark:bg-amber-500/10 rounded-full flex items-center justify-center border border-[#7A9E85]/20 dark:border-amber-500/20">
            <svg viewBox="0 0 100 100" className="w-32 h-32 text-[#2B2B2B] dark:text-gray-100">
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M20 50C20 50 35 30 50 30C65 30 80 50 80 50C80 50 65 70 50 70C35 70 20 50 20 50Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M50 20V80" stroke="currentColor" strokeWidth="2.5" />
              <path d="M20 50H80" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </div>

          <h2 className="text-2xl font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100">Ready to meet a new pen-pal?</h2>
          <p className="text-[#2B2B2B]/70 dark:text-gray-300 text-sm">
            Press Auto-Match, and our delivery engine will pair you with a compatible friend somewhere around the world.
          </p>

          {error && (
            <p className="text-[#DC2626] dark:text-red-400 text-xs font-bold">{error}</p>
          )}

          <button
            onClick={startMatching}
            className="w-full bg-[#7A9E85] dark:bg-amber-500 hover:bg-[#6B9080] text-[#2B2B2B] dark:text-gray-100 font-bold py-3.5 px-6 rounded-full shadow-md transition-colors"
          >
            Start Auto-Match
          </button>
        </div>
      )}

      {matchingState === 'searching' && (
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-40 h-40 text-[#2B2B2B]/80 dark:text-gray-300"
              style={{ animation: 'spin 15s linear infinite' }}
            >
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M50 5A45 45 0 0 0 50 95" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M5 50A45 45 0 0 0 95 50" fill="none" stroke="currentColor" strokeWidth="1" />
              <ellipse cx="50" cy="50" rx="25" ry="45" fill="none" stroke="currentColor" strokeWidth="1" />
              <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>

            <div
              className="absolute text-2xl"
              style={{ animation: 'orbit1 3s ease-in-out infinite' }}
            >
              ✉️
            </div>
            <div
              className="absolute text-xl"
              style={{ animation: 'orbit2 4s ease-in-out infinite' }}
            >
              ✈️
            </div>
          </div>

          <h3 className="text-xl font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100 animate-pulse">
            Searching around the world{dots}
          </h3>
          <p className="text-[#2B2B2B]/60 dark:text-gray-400 text-xs max-w-xs">
            Scanning the globe for a fellow letter-writer...
          </p>
        </div>
      )}

      {matchingState === 'found' && (
        <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-[#EDEBE7] dark:border-gray-800 rounded-2xl p-8 shadow-lg space-y-6">
          <div className="w-24 h-24 mx-auto bg-[#7A9E85]/20 dark:bg-amber-500/20 rounded-full flex items-center justify-center text-4xl">
            ✨
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#7A9E85] dark:text-amber-400 font-bold">New Connection Found!</span>
            <h2 className="text-2xl font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100">Matched with {matchedAlias}!</h2>
            <p className="text-[#2B2B2B]/70 dark:text-gray-300 text-sm">
              Someone with similar interests is looking for a pen-pal. Write them a letter to get started!
            </p>
          </div>

          <div className="border-t border-[#EDEBE7] dark:border-gray-700 pt-6 flex gap-4">
            <button
              onClick={() => setMatchingState('idle')}
              className="flex-1 border border-[#EDEBE7] dark:border-gray-800 text-[#2B2B2B] dark:text-gray-100 font-bold py-2.5 rounded-full hover:bg-[#FAF8F5] dark:hover:bg-gray-800 transition text-sm"
            >
              Skip
            </button>
            <button
              onClick={handleSendLetter}
              className="flex-1 bg-[#2B2B2B] dark:bg-gray-800 text-white font-bold py-2.5 rounded-full hover:bg-[#2B2B2B]/95 dark:hover:bg-gray-700 transition text-sm"
            >
              Send First Letter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
