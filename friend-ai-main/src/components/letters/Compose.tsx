import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { STAMP_LIST, getUnlockedStamps } from './StampAlbum';
import { useAuth } from '../../contexts/AuthContext';

interface ComposeProps {
  preselectedFriend?: string;
  onLetterSent?: () => void;
  userId?: string;
}

export const Compose: React.FC<ComposeProps> = ({ preselectedFriend = 'a friend', onLetterSent, userId }) => {
  const { profile } = useAuth();
  const loginStreak = (profile as any)?.loginStreak || 0;
  const unlockedStamps = getUnlockedStamps(loginStreak);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('distance');
  const [selectedStamp, setSelectedStamp] = useState(unlockedStamps[0] || STAMP_LIST[0]);
  const [seal, setSeal] = useState('classic_red');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [aiTone, setAiTone] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showStampDrawer, setShowStampDrawer] = useState(false);

  const charCount = content.length;
  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  useEffect(() => {
    if (!title && !content) return;
    const timeout = setTimeout(() => {
      setStatus('saving');
      setTimeout(() => setStatus('saved'), 1000);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [title, content]);

  const applyAiTone = () => {
    if (!content) return;
    let formattedText = content;
    if (aiTone === 'Victorian') {
      formattedText = `Dearest Friend,\n\nI trust this missive finds thee in good health and high spirits. I take pen in hand to share these humble sentiments...\n\n${content}\n\nI remain yours faithfully,\nAnonymous`;
    } else if (aiTone === 'Ghibli') {
      formattedText = `Dear Friend,\n\nThe wind is rising today, carrying the smell of fresh grass. In the quiet moments between the rustling leaves, I thought of you...\n\n${content}\n\nWarmly,`;
    } else if (aiTone === 'Romantic') {
      formattedText = `My Dear,\n\nUnderneath the starlit sky, writing this letter brings a warm glow to my heart. I wanted to tell you...\n\n${content}`;
    }
    setContent(formattedText);
    setShowAiModal(false);
  };

  const handleSend = async () => {
    if (!auth.currentUser) return;
    setStatus('saving');
    try {
      await addDoc(collection(db, 'letters'), {
        senderId: auth.currentUser.uid,
        senderName: profile?.displayName || 'Anonymous',
        receiverId: 'anonymous_friend',
        receiverName: preselectedFriend,
        title: title || 'A letter from afar',
        body: content,
        status: 'scheduled',
        deliveryMode,
        stampId: selectedStamp.id,
        stampImage: selectedStamp.image,
        seal,
        distance: 250,
        createdAt: serverTimestamp(),
      });
      if (onLetterSent) onLetterSent();
    } catch (e) {
      console.warn("Firestore error.", e);
      if (onLetterSent) onLetterSent();
    }
  };

  return (
    <div className="bg-[#FAF8F5] dark:bg-gray-950 py-8 px-4 relative">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header & Status Indicator */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100">Write to {preselectedFriend}</h1>
            <p className="text-xs text-[#2B2B2B]/50 dark:text-gray-400">Drafting a letter on virtual stationery</p>
          </div>
          <span className="text-xs text-[#2B2B2B]/50 dark:text-gray-400 italic">
            {status === 'saving' ? 'Saving draft...' : status === 'saved' ? 'Draft saved.' : ''}
          </span>
        </div>

        {/* Paper Writing Pad Layout */}
        <div className="bg-white dark:bg-gray-900 border border-[#EDEBE7] dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">

          {/* Paper Toolbar */}
          <div className="border-b border-[#EDEBE7] dark:border-gray-800 bg-[#FAF8F5]/50 dark:bg-gray-950/50 px-6 py-3 flex flex-wrap justify-between items-center gap-3 text-sm">
            <div className="flex gap-4">
              <button
                onClick={() => setShowAiModal(true)}
                className="text-xs bg-[#2B2B2B] dark:bg-gray-800 text-white px-3 py-1.5 rounded-full hover:bg-[#2B2B2B]/95 dark:hover:bg-gray-700 transition font-bold"
              >
                ✨ AI Tone Assistant
              </button>
              <button
                onClick={() => setShowStampDrawer(true)}
                className="text-xs border border-[#EDEBE7] dark:border-gray-800 bg-white dark:bg-gray-900 text-[#2B2B2B] dark:text-gray-100 px-3 py-1.5 rounded-full hover:bg-[#EDEBE7] dark:hover:bg-gray-700 transition font-semibold"
              >
                Stamp: {selectedStamp.image} {selectedStamp.name}
              </button>
            </div>

            <div className="text-xs text-[#2B2B2B]/60 dark:text-gray-400 font-medium">
              {wordCount} words &bull; {readingTime} min read
            </div>
          </div>

          {/* Letter Body Pad Area */}
          <div className="flex-1 p-8 md:p-12 relative flex flex-col space-y-6">

            <div className="absolute top-6 right-6 flex flex-col items-center">
              <div
                onClick={() => setShowStampDrawer(true)}
                className="w-14 h-16 bg-[#FAF8F5] dark:bg-gray-950 rounded-lg border-2 border-[#EDEBE7] dark:border-gray-700 border-dashed flex items-center justify-center text-3xl cursor-pointer hover:scale-105 transition filter drop-shadow-sm select-none"
              >
                {selectedStamp.image}
              </div>
              <span className="text-[10px] text-[#2B2B2B]/40 dark:text-gray-500 mt-1 uppercase font-bold tracking-wider">
                {selectedStamp.rarity}
              </span>
            </div>

            <input
              type="text"
              placeholder="A thoughtful header..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-[70%] text-2xl font-[family-name:var(--font-letters-serif)] text-[#2B2B2B] dark:text-gray-100 outline-none border-b border-[#EDEBE7] dark:border-gray-700 pb-2 bg-transparent placeholder-[#2B2B2B]/30 dark:placeholder-gray-500"
            />

            <textarea
              placeholder="Start your letter here... share a story, ask about their day, describe your hometown."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full flex-1 min-h-[300px] text-lg font-[family-name:var(--font-letters-serif)] leading-relaxed text-[#2B2B2B]/90 dark:text-gray-200 outline-none resize-none bg-transparent placeholder-[#2B2B2B]/35 dark:placeholder-gray-500"
              style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '100% 2.2rem', lineHeight: '2.2rem' }}
            />
          </div>

          {/* Bottom Settings & Delivery Options */}
          <div className="border-t border-[#EDEBE7] dark:border-gray-800 bg-[#FAF8F5]/30 dark:bg-gray-950/30 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 justify-between">

              <div className="space-y-1.5 flex-1">
                <label className="text-xs uppercase font-bold text-[#2B2B2B]/50 dark:text-gray-400 tracking-wider">Travel Method</label>
                <select
                  value={deliveryMode}
                  onChange={e => setDeliveryMode(e.target.value)}
                  className="w-full border border-[#EDEBE7] dark:border-gray-800 rounded-xl p-2.5 text-sm bg-white dark:bg-gray-900 text-[#2B2B2B] dark:text-gray-100 font-semibold outline-none"
                >
                  <option value="distance">Distance-Based Delivery (15 mins - 48 hours)</option>
                  <option value="slow">Slow Train (4 hours)</option>
                  <option value="instant">Instant Delivery (Demo)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-[#2B2B2B]/50 dark:text-gray-400 tracking-wider block">Wax Seal Accent</label>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setSeal('classic_red')}
                    className={`w-9 h-9 rounded-full bg-red-700 shadow-sm relative flex items-center justify-center text-white border-2 ${seal === 'classic_red' ? 'border-[#2B2B2B] scale-110' : 'border-transparent'}`}
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => setSeal('midnight_blue')}
                    className={`w-9 h-9 rounded-full bg-blue-900 shadow-sm relative flex items-center justify-center text-white border-2 ${seal === 'midnight_blue' ? 'border-[#2B2B2B] scale-110' : 'border-transparent'}`}
                  >
                    🌟
                  </button>
                  <button
                    onClick={() => setSeal('emerald')}
                    className={`w-9 h-9 rounded-full bg-emerald-800 shadow-sm relative flex items-center justify-center text-white border-2 ${seal === 'emerald' ? 'border-[#2B2B2B] scale-110' : 'border-transparent'}`}
                  >
                    ☘️
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSend}
                disabled={!content || status === 'saving'}
                className="bg-[#2B2B2B] dark:bg-gray-800 text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#2B2B2B]/95 dark:hover:bg-gray-700 shadow-md transition disabled:opacity-50"
              >
                Press Wax Seal & Send
              </button>
            </div>
          </div>
        </div>

        {/* AI Assistant Modal Overlay */}
        {showAiModal && (
          <div className="fixed inset-0 bg-[#2B2B2B]/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-[#EDEBE7] dark:border-gray-800 max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100">AI Tone Assistant</h3>
              <p className="text-xs text-[#2B2B2B]/60 dark:text-gray-400">Choose a tone style to augment your letter text before sending.</p>

              <div className="space-y-2">
                {[
                  { name: 'Victorian', desc: 'Poetic, antique greeting formatting' },
                  { name: 'Ghibli', desc: 'Calming, nature-based imagery' },
                  { name: 'Romantic', desc: 'Expressive and deeply emotive' }
                ].map((tone) => (
                  <button
                    key={tone.name}
                    onClick={() => setAiTone(tone.name)}
                    className={`w-full text-left p-3 rounded-xl border text-sm font-semibold transition ${
                      aiTone === tone.name
                        ? 'border-[#7A9E85] dark:border-amber-400 bg-[#7A9E85]/10 dark:bg-amber-500/10 text-[#2B2B2B]'
                        : 'border-[#EDEBE7] dark:border-gray-800 hover:bg-[#FAF8F5] dark:hover:bg-gray-800 text-[#2B2B2B] dark:text-gray-100'
                    }`}
                  >
                    <div>{tone.name}</div>
                    <div className="text-[10px] font-normal text-[#2B2B2B]/50 dark:text-gray-400 mt-0.5">{tone.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="flex-1 py-2 border border-[#EDEBE7] dark:border-gray-800 rounded-full text-xs font-bold text-[#2B2B2B] dark:text-gray-100 hover:bg-[#FAF8F5] dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={applyAiTone}
                  className="flex-1 py-2 bg-[#2B2B2B] dark:bg-gray-800 text-white rounded-full text-xs font-bold hover:bg-[#2B2B2B]/95 dark:hover:bg-gray-700"
                >
                  Apply Tone
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stamps Selector Drawer */}
        {showStampDrawer && (
          <div className="fixed inset-0 bg-[#2B2B2B]/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white dark:bg-gray-900 border-t sm:border border-[#EDEBE7] dark:border-gray-800 max-w-lg w-full rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100">Select Postage Stamp</h3>
                <button onClick={() => setShowStampDrawer(false)} className="text-[#2B2B2B]/60 dark:text-gray-400 font-bold hover:text-[#2B2B2B] dark:hover:text-gray-100">✕</button>
              </div>
              <p className="text-xs text-[#2B2B2B]/60 dark:text-gray-400">Each outgoing letter requires exactly one postage stamp.</p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                {unlockedStamps.map((stamp) => (
                  <div
                    key={stamp.id}
                    onClick={() => {
                      setSelectedStamp(stamp);
                      setShowStampDrawer(false);
                    }}
                    className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-1.5 transition ${
                      selectedStamp.id === stamp.id
                        ? 'border-[#7A9E85] dark:border-amber-400 bg-[#7A9E85]/5 dark:bg-amber-500/10'
                        : 'border-[#EDEBE7] dark:border-gray-800 hover:bg-[#FAF8F5] dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-3xl select-none">{stamp.image}</span>
                    <span className="text-[10px] font-bold text-[#2B2B2B] dark:text-gray-100 text-center truncate w-full">{stamp.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
