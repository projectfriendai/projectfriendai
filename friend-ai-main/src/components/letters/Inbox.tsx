import React, { useEffect, useState, useCallback } from 'react';
import { db, auth } from '../../firebase/config';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

interface Letter {
  id: string;
  title: string;
  body: string;
  status: string;
  deliverAt?: any;
  createdAt?: any;
  senderId: string;
  senderName?: string;
  receiverId: string;
  receiverName?: string;
  stampImage?: string;
  seal?: string;
}

export const Inbox: React.FC<{
  onOpenLetter: (letter: Letter) => void;
  onReply: (friendName: string) => void;
}> = ({ onOpenLetter, onReply }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'outbox'>('inbox');
  const [letters, setLetters] = useState<Letter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileCache, setProfileCache] = useState<Record<string, string>>({});

  const isLikelyUid = (str: string) => str.length > 20 && !/\s/.test(str);

  const fetchProfileName = useCallback(async (uid: string): Promise<string> => {
    if (profileCache[uid]) return profileCache[uid];
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      const data = snap.data();
      const name = data?.displayName || data?.username || uid;
      setProfileCache(prev => ({ ...prev, [uid]: name }));
      return name;
    } catch {
      return uid;
    }
  }, [profileCache]);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'letters'),
      where(activeTab === 'inbox' ? 'receiverId' : 'senderId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Letter[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Letter));

      const filtered = data.filter(l => {
        if (activeTab === 'inbox') return l.status === 'delivered' || l.status === 'opened';
        return l.status === 'waiting' || l.status === 'travelling' || l.status === 'scheduled';
      });

      setLetters(filtered);
      setLoading(false);
    }, () => {
      setLetters([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const displayName = (letter: Letter) => {
    const raw = (activeTab === 'inbox' ? letter.senderName : letter.receiverName) || 'Anonymous';
    const uid = activeTab === 'inbox' ? letter.senderId : letter.receiverId;
    if (isLikelyUid(raw) && uid) {
      const cached = profileCache[uid];
      if (cached) return cached;
      fetchProfileName(uid);
    }
    return raw;
  };

  const filteredLetters = letters.filter(letter =>
    letter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    displayName(letter).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#FAF8F5] dark:bg-gray-950 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <header className="flex justify-between items-center border-b border-[#EDEBE7] dark:border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100">Inbox</h1>
            <p className="text-[#2B2B2B]/60 dark:text-gray-400 text-xs">Read and keep track of your incoming letters</p>
          </div>

          <input
            type="text"
            placeholder="Search letters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-[#EDEBE7] dark:border-gray-800 rounded-full text-xs outline-none bg-white dark:bg-gray-900 text-[#2B2B2B] dark:text-gray-100 focus:ring-1 focus:ring-[#7A9E85] dark:focus:ring-amber-400 max-w-[200px]"
          />
        </header>

        {/* Toggle tabs */}
        <div className="flex gap-4 border-b border-[#EDEBE7] dark:border-gray-800">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-2 text-sm font-bold transition-all relative ${
              activeTab === 'inbox' ? 'text-[#2B2B2B] dark:text-gray-100' : 'text-[#2B2B2B]/40 dark:text-gray-500'
            }`}
          >
            Delivered Letters
            {activeTab === 'inbox' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7A9E85] dark:bg-amber-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('outbox')}
            className={`pb-2 text-sm font-bold transition-all relative ${
              activeTab === 'outbox' ? 'text-[#2B2B2B] dark:text-gray-100' : 'text-[#2B2B2B]/40 dark:text-gray-500'
            }`}
          >
            Travelling Letters
            {activeTab === 'outbox' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7A9E85] dark:bg-amber-500" />
            )}
          </button>
        </div>

        {/* List of letters */}
        {loading ? (
          <div className="text-center py-12 text-[#2B2B2B]/40 dark:text-gray-500 italic">Retrieving letters...</div>
        ) : filteredLetters.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 border border-[#EDEBE7] dark:border-gray-800 rounded-2xl p-6 text-[#2B2B2B]/50 dark:text-gray-400 italic">
            No letters found here. Write letters or find new friends to fill up your inbox!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredLetters.map((letter) => (
              <div
                key={letter.id}
                className="bg-white dark:bg-gray-900 border border-[#EDEBE7] dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition relative min-h-[180px]"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {letter.status === 'delivered' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#7A9E85] dark:bg-amber-500 block animate-pulse" />
                      )}
                      <span className="text-xs uppercase tracking-wider text-[#2B2B2B]/40 dark:text-gray-500 font-bold">
                        {activeTab === 'inbox' ? `From ${displayName(letter)}` : `To ${displayName(letter)}`}
                      </span>
                    </div>

                    <div className="w-10 h-12 bg-[#FAF8F5] dark:bg-gray-950 rounded border border-[#EDEBE7] dark:border-gray-700 border-dashed flex items-center justify-center text-xl select-none">
                      {letter.stampImage || '✈️'}
                    </div>
                  </div>

                  <h3 className="text-lg font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100 leading-snug">
                    {letter.title}
                  </h3>
                  <p className="text-[#2B2B2B]/75 dark:text-gray-300 text-sm line-clamp-3 mt-2 font-[family-name:var(--font-letters-serif)] leading-relaxed">
                    {letter.body}
                  </p>
                </div>

                <div className="border-t border-[#EDEBE7] dark:border-gray-700 pt-3 mt-4 flex justify-between items-center">
                  <span className="text-[10px] text-[#2B2B2B]/50 dark:text-gray-400 font-bold uppercase tracking-wider">
                    {activeTab === 'inbox'
                      ? 'Delivered'
                      : `Arrival: ${letter.deliverAt ? new Date(letter.deliverAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'travelling'}`
                    }
                  </span>

                  <div className="flex gap-2">
                    {activeTab === 'inbox' && (
                      <button
                        onClick={() => onReply(displayName(letter))}
                        className="px-3.5 py-1.5 border border-[#EDEBE7] dark:border-gray-800 hover:bg-[#FAF8F5] dark:hover:bg-gray-800 rounded-full text-xs font-bold text-[#2B2B2B] dark:text-gray-100 transition"
                      >
                        Reply
                      </button>
                    )}
                    <button
                      onClick={() => onOpenLetter(letter)}
                      className="px-4 py-1.5 bg-[#2B2B2B] dark:bg-gray-800 text-white hover:bg-[#2B2B2B]/95 dark:hover:bg-gray-700 rounded-full text-xs font-bold transition shadow-sm"
                    >
                      {activeTab === 'inbox' ? 'Open' : 'Preview'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
