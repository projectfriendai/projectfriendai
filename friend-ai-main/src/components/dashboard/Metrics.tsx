import React, { useState, useEffect } from 'react';
import { MessageSquare, Wind, Activity, TrendingUp, BarChart3 } from 'lucide-react';

export function Metrics() {
  const [sessionsCount, setSessionsCount] = useState(0);
  const [breathingCount, setBreathingCount] = useState(0);
  const [moodCount, setMoodCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);

  useEffect(() => {
    const request = indexedDB.open("friend_ai_db", 1);
    request.onsuccess = (e) => {
      const db = (e.target as any).result;
      
      if (db.objectStoreNames.contains("chat_sessions")) {
        const tx = db.transaction("chat_sessions", "readonly");
        const store = tx.objectStore("chat_sessions");
        const countReq = store.count();
        countReq.onsuccess = () => setSessionsCount(countReq.result || 0);
      }
      
      if (db.objectStoreNames.contains("mood_logs")) {
        const tx = db.transaction("mood_logs", "readonly");
        const store = tx.objectStore("mood_logs");
        const countReq = store.count();
        countReq.onsuccess = () => setMoodCount(countReq.result || 0);
      }

      if (db.objectStoreNames.contains("breathing_sessions")) {
        const tx = db.transaction("breathing_sessions", "readonly");
        const store = tx.objectStore("breathing_sessions");
        const countReq = store.count();
        countReq.onsuccess = () => setBreathingCount(countReq.result || 0);
      }

      if (db.objectStoreNames.contains("journal_entries")) {
        const tx = db.transaction("journal_entries", "readonly");
        const store = tx.objectStore("journal_entries");
        const countReq = store.count();
        countReq.onsuccess = () => setJournalCount(countReq.result || 0);
      }
    };
  }, []);

  const metrics = [
    { name: 'Active Sessions', value: sessionsCount.toString(), change: 'Local Chats', icon: MessageSquare, color: 'text-[#7A9E85]' },
    { name: 'Breathing Exercises', value: breathingCount.toString(), change: 'Total Sessions', icon: Wind, color: 'text-[#7A9E85]' },
    { name: 'Moods Logged', value: moodCount.toString(), change: 'Entries', icon: Activity, color: 'text-[#7A9E85]' },
    { name: 'Journal Entries', value: journalCount.toString(), change: 'Reflections', icon: TrendingUp, color: 'text-[#7A9E85]' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div key={idx} className="bg-white border border-[#EDEBE7] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F0EA] flex items-center justify-center">
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#2B2B2B]">{metric.value}</p>
            <p className="text-xs text-[#6B6B6B] mt-0.5">{metric.name}</p>
            <p className="text-[10px] text-[#6B6B6B] mt-0.5">
              <span className="font-semibold text-[#7A9E85]">{metric.change}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}