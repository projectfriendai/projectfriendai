import React, { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { Inbox } from './Inbox';
import { FindFriends } from './FindFriends';
import { Compose } from './Compose';
import { StampAlbum } from './StampAlbum';
import { AvatarCreator, Avatar, AvatarConfig } from './AvatarCreator';
import { LetterReader } from './LetterReader';
import { useAuth } from '../../contexts/AuthContext';

interface LettersViewProps {
  userId?: string;
}

export function LettersView({ userId }: LettersViewProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'inbox' | 'find' | 'write' | 'profile'>('home');

  const [readingLetter, setReadingLetter] = useState<any | null>(null);

  const [composeTargetFriend, setComposeTargetFriend] = useState<string>('');

  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    try {
      const saved = localStorage.getItem('pfai_avatar_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { animal: 'pig' as const, bg: '#7A9E85' };
  });

  useEffect(() => {
    localStorage.setItem('pfai_avatar_config', JSON.stringify(avatarConfig));
  }, [avatarConfig]);

  const [editAvatar, setEditAvatar] = useState(false);

  const handleMatchedFriend = (friendName: string) => {
    setComposeTargetFriend(friendName);
    setActiveTab('write');
  };

  const tabs = [
    { id: 'home', label: 'Letters', icon: '🏠' },
    { id: 'inbox', label: 'Inbox', icon: '✉' },
    { id: 'find', label: 'Find Friends', icon: '➕' },
    { id: 'write', label: 'Write', icon: '🖋' },
    { id: 'profile', label: 'Profile', icon: '☰' },
  ] as const;

  return (
    <div className="font-[family-name:var(--font-letters-sans)] h-full flex flex-col">
      <div className="bg-[#FAF8F5] rounded-2xl border border-[#EDEBE7] flex flex-col flex-1 min-h-0 shadow-sm">
        <div className="bg-white border-b border-[#EDEBE7] flex items-center justify-around px-2 py-2 shrink-0 rounded-t-2xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'text-[#7A9E85] scale-105 font-bold bg-[#E8F0EA]'
                  : 'text-[#6B6B6B] hover:text-[#2B2B2B] hover:bg-[#FAF8F5]'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 overflow-y-auto min-h-0">
          {activeTab === 'home' && (
            <Dashboard
              onNavigateToWrite={() => setActiveTab('write')}
              onNavigateToInbox={() => setActiveTab('inbox')}
            />
          )}

          {activeTab === 'inbox' && (
            <Inbox
              onOpenLetter={(letter) => setReadingLetter({
                title: letter.title,
                body: letter.body,
                senderName: letter.receiverName || 'Someone',
                avatar: '🧑‍💻',
                country: '',
                stampImage: letter.stampImage,
                date: letter.createdAt ? new Date(letter.createdAt.seconds * 1000).toLocaleDateString() : ''
              })}
              onReply={(friendName) => handleMatchedFriend(friendName)}
            />
          )}

          {activeTab === 'find' && (
            <FindFriends onMatched={handleMatchedFriend} userId={userId} />
          )}

          {activeTab === 'write' && (
              <Compose
              preselectedFriend={composeTargetFriend}
              onLetterSent={() => setActiveTab('inbox')}
              userId={userId}
            />
          )}

          {activeTab === 'profile' && (
            <div className="bg-[#FAF8F5] px-4 py-8 space-y-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white border border-[#EDEBE7] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                  <Avatar config={avatarConfig} className="w-32 h-32" />
                  <div className="space-y-3 text-center md:text-left flex-1">
                    <div>
                      <p className="text-2xl font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B]">
                        {profile?.displayName || 'Anonymous'}
                      </p>
                      <p className="text-[#6B6B6B] text-xs mt-1">UID: {userId || 'anonymous'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <button
                        onClick={() => setEditAvatar(!editAvatar)}
                        className="px-4 py-2 bg-[#7A9E85] text-white text-xs font-bold rounded-full hover:bg-[#6B9080] transition shadow-sm"
                      >
                        {editAvatar ? 'Close Editor' : 'Customize Avatar'}
                      </button>
                    </div>
                  </div>
                </div>

                {editAvatar && (
                  <div className="mt-6">
                    <AvatarCreator
                      initialConfig={avatarConfig}
                      onSave={(config) => {
                        setAvatarConfig(config);
                        setEditAvatar(false);
                      }}
                    />
                  </div>
                )}

                <div className="mt-6">
                  <StampAlbum />
                </div>
              </div>
            </div>
          )}
        </div>

        {readingLetter && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FAF8F5]">
            <LetterReader
              title={readingLetter.title}
              content={readingLetter.body}
              senderName={readingLetter.senderName}
              avatar={readingLetter.avatar}
              country={readingLetter.country}
              stampImage={readingLetter.stampImage}
              date={readingLetter.date}
              onClose={() => setReadingLetter(null)}
              onReply={(friendName) => handleMatchedFriend(friendName)}
            />
          </div>
        )}
      </div>
    </div>
  );
}