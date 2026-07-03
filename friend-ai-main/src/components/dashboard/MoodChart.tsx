import React, { useState, useEffect } from 'react';

interface MoodEntry {
  id: string;
  mood: string;
  intensity: number;
  timestamp: string;
  note?: string;
  tags?: string[];
}

export function MoodChart() {
  const [moodData, setMoodData] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoods = () => {
      const request = indexedDB.open("friend_ai_db", 1);
      request.onsuccess = (e) => {
        const db = (e.target as any).result;
        try {
          if (!db.objectStoreNames.contains("mood_logs")) {
            setMoodData([]);
            setLoading(false);
            return;
          }
          const tx = db.transaction("mood_logs", "readonly");
          const store = tx.objectStore("mood_logs");
          const getAll = store.getAll();
          getAll.onsuccess = () => {
            const list = getAll.result as MoodEntry[];
            if (list && list.length > 0) {
              const sorted = [...list].sort((a, b) => a.id.localeCompare(b.id));
              const last7 = sorted.slice(-7);
              
              const formatted = last7.map(item => ({
                label: item.mood,
                value: (item.intensity || 5) * 10
              }));
              setMoodData(formatted);
            } else {
              setMoodData([]);
            }
            setLoading(false);
          };
          getAll.onerror = () => {
            setMoodData([]);
            setLoading(false);
          };
        } catch (err) {
          console.error("Error reading IndexedDB in MoodChart:", err);
          setMoodData([]);
          setLoading(false);
        }
      };
      request.onerror = () => {
        setMoodData([]);
        setLoading(false);
      };
    };

    fetchMoods();
  }, []);

  return (
    <div className="bg-white border border-[#EDEBE7] rounded-2xl p-6 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7A9E85]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6 relative">
        <div>
          <h3 className="text-lg font-bold text-[#2B2B2B] font-display">Mood Tracking</h3>
          <p className="text-sm text-[#6B6B6B] mt-1">Your real emotional wellness trends based on logged moods</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs text-[#6B6B6B]">
          Loading logs...
        </div>
      ) : moodData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#EDEBE7] rounded-xl bg-[#FAF8F5]">
          <p className="text-xs font-semibold text-[#2B2B2B]">No emotional logs recorded</p>
          <p className="text-[10px] text-[#6B6B6B] mt-1">Tap 'Open Mood Log' in the top right to record your first mood state.</p>
        </div>
      ) : (
        <div className="h-64 flex items-end justify-between gap-2 relative mt-4">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-full border-t border-dashed border-[#EDEBE7] h-0"></div>
            ))}
          </div>

          {moodData.map((item, idx) => (
            <div key={idx} className="relative flex flex-col items-center flex-1 group/bar z-10">
              <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-10 bg-[#2B2B2B] text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap shadow-xl">
                Intensity: {item.value / 10}/10
              </div>
              
              <div className="w-full max-w-[36px] bg-[#FAF8F5] rounded-t-xl h-full flex flex-col justify-end overflow-hidden">
                <div 
                  className="w-full bg-gradient-to-t from-[#7A9E85] to-[#A8C5B0] rounded-t-xl transition-all duration-1000 ease-out"
                  style={{ height: `${item.value}%` }}
                >
                  <div className="w-full h-full bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity animate-pulse"></div>
                </div>
              </div>
              
              <span className="mt-4 text-[9px] font-semibold tracking-tight text-[#6B6B6B] text-center truncate max-w-[50px]">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}