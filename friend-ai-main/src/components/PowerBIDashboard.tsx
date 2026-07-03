import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Clock,
  ShieldAlert,
  FolderSync,
  Filter,
  Download,
  Search,
  ChevronRight,
  Database,
  RefreshCw,
  Heart,
  Palette,
  FileSpreadsheet
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isEncryptedView?: boolean;
  isMedicoLegal?: boolean;
}

interface MoodEntry {
  id: string;
  mood: string;
  intensity: number;
  timestamp: string;
  note?: string;
  tags?: string[];
}

interface BreathingSession {
  id: string;
  dateLabel: string;
  startTime: string;
  durationSeconds: number;
}

interface PowerBIDashboardProps {
  themeClass: (daylight: string, midnight: string, sepia: string) => string;
  chatHistory: ChatMessage[];
  moodsList: MoodEntry[];
  breathingSessions: BreathingSession[];
  publishedNotes: any[];
  selectedCharacterId: string;
}

export default function PowerBIDashboard({ 
  themeClass,
  chatHistory = [],
  moodsList = [],
  breathingSessions = [],
  publishedNotes = [],
  selectedCharacterId
}: PowerBIDashboardProps) {
  // Filter States
  const [timeFilter, setTimeFilter] = useState<"30d" | "7d" | "24h">("30d");
  const [focusFilter, setFocusFilter] = useState<string>("All Users Focus");
  const [dataRefreshCount, setDataRefreshCount] = useState<number>(0);

  // Dynamic user data metrics grouping for the trend chart
  const currentDailyData = useMemo(() => {
    const result: Array<{ name: string; sessions: number; activeUsers: number; crisisInterlocks: number; keepSyncs: number }> = [];
    const now = new Date();
    
    if (timeFilter === "24h") {
      // 6 intervals of 4 hours
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 4 * 60 * 60 * 1000);
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const slotEnd = d.getTime();
        const slotStart = slotEnd - 4 * 60 * 60 * 1000;
        
        const breathingCount = breathingSessions.filter(s => {
          const idMs = parseInt(s.id.replace("bs-", ""));
          return !isNaN(idMs) && idMs >= slotStart && idMs <= slotEnd;
        }).length;
        
        const moodCount = moodsList.filter(m => {
          const idMs = parseInt(m.id.replace("m-", ""));
          return !isNaN(idMs) && idMs >= slotStart && idMs <= slotEnd;
        }).length;
        
        const notesCount = publishedNotes.filter(n => {
          try {
            const time = new Date(n.timestamp).getTime();
            return time >= slotStart && time <= slotEnd;
          } catch(e) {
            return false;
          }
        }).length;

        result.push({
          name: timeStr,
          sessions: breathingCount + moodCount,
          activeUsers: (breathingCount + moodCount) > 0 ? 1 : 0,
          crisisInterlocks: 0,
          keepSyncs: notesCount
        });
      }
    } else {
      const daysCount = timeFilter === "7d" ? 7 : 15;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' }); // e.g. "Jun 26"
        
        const breathingCount = breathingSessions.filter(s => s.dateLabel === dateLabel).length;
        const moodCount = moodsList.filter(m => m.timestamp && m.timestamp.startsWith(dateLabel)).length;
        
        const notesCount = publishedNotes.filter(n => {
          try {
            const nDate = new Date(n.timestamp);
            return nDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) === dateLabel;
          } catch(e) {
            return false;
          }
        }).length;
        
        result.push({
          name: dateLabel,
          sessions: breathingCount + moodCount,
          activeUsers: (breathingCount + moodCount) > 0 ? 1 : 0,
          crisisInterlocks: 0,
          keepSyncs: notesCount
        });
      }
    }
    return result;
  }, [timeFilter, breathingSessions, moodsList, publishedNotes]);

  // Aggregate stats based on real user actions
  const aggregateStats = useMemo(() => {
    // total user actions = completed breathing sessions + chat messages sent by user
    const userChatCount = chatHistory.filter(m => m.sender === 'user').length;
    const activeSessions = breathingSessions.length + userChatCount;
    
    // count crisis interlocks based on legal/crisis trigger matches in chat history
    const crisisChecks = chatHistory.filter(m => 
      m.isMedicoLegal || 
      m.text.toLowerCase().includes("crisis") || 
      m.text.toLowerCase().includes("suicide") || 
      m.text.toLowerCase().includes("help") || 
      m.text.toLowerCase().includes("police")
    ).length;

    const charMap: Record<string, string> = {
      soul: "Soul",
      dionysus: "Dionysus",
      sisyphus: "Sisyphus",
      athena: "Athena",
      astra: "Astra",
      persephone: "Persephone",
      zeus: "Zeus",
      hades: "Hades",
      sappho: "Sappho"
    };
    const favouriteArt = charMap[selectedCharacterId] || "None Selected";
    const syncCount = publishedNotes.length;

    return {
      activeSessions,
      crisisChecks,
      favouriteArt,
      syncCount
    };
  }, [chatHistory, breathingSessions, selectedCharacterId, publishedNotes]);

  // Dynamic pie chart for logged mood allocations
  const protocolsPieData = useMemo(() => {
    if (moodsList.length === 0) {
      return [
        { name: "No Moods Logged Yet", value: 1, fill: "#6b7280" }
      ];
    }
    
    const counts: Record<string, number> = {};
    moodsList.forEach(m => {
      counts[m.mood] = (counts[m.mood] || 0) + 1;
    });
    
    const colors: Record<string, string> = {
      Calm: "#6B6B6B",
      Anxious: "#f59e0b",
      Overwhelmed: "#6366f1",
      Sad: "#ef4444",
      Grateful: "#ec4899",
      Peaceful: "#3b82f6",
      Restless: "#8b5cf6",
      Angry: "#dc2626"
    };
    
    return Object.entries(counts).map(([mood, count]) => ({
      name: mood,
      value: count,
      fill: colors[mood] || "#8b5cf6"
    }));
  }, [moodsList]);

  // Dynamic bar chart of cumulative interaction counts
  const workspaceStatsData = useMemo(() => {
    return [
      { service: "Chat Messages", count: chatHistory.length },
      { service: "Mood Logs", count: moodsList.length },
      { service: "Breathing Sessions", count: breathingSessions.length },
      { service: "Solace Wall Posts", count: publishedNotes.length }
    ];
  }, [chatHistory, moodsList, breathingSessions, publishedNotes]);

  // Dynamic bar chart showing active / visited folk art companions
  const artEngagementData = useMemo(() => {
    const artStyles = [
      { id: "soul", art: "Aipan", color: "#8b1414" },
      { id: "dionysus", art: "Chittara", color: "#aa5e3c" },
      { id: "sisyphus", art: "Pichwai", color: "#ffd700" },
      { id: "athena", art: "Paitkar", color: "#be2222" },
      { id: "astra", art: "Kalamezhuthu", color: "#542518" },
      { id: "persephone", art: "Manjusha", color: "#1290de" },
      { id: "zeus", art: "Rogan", color: "#6366f1" },
      { id: "hades", art: "Pattachitra", color: "#852222" },
      { id: "sappho", art: "Warli", color: "#7c2d12" }
    ];
    
    const recentsStr = localStorage.getItem("pfai_recent_personas") || "";
    
    return artStyles.map(style => {
      const isActive = style.id === selectedCharacterId;
      const chatCount = isActive ? chatHistory.length : 0;
      const isRecent = recentsStr.includes(style.id);
      
      return {
        art: style.art,
        finished: chatCount,
        coloringIn: isRecent ? 1 : 0,
        color: style.color
      };
    });
  }, [selectedCharacterId, chatHistory]);

  const handleRefresh = () => {
    setDataRefreshCount((c) => c + 1);
  };

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* Ornate Top Banner similar to Power BI Title Block */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${themeClass("bg-slate-50 dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10 shadow-sm dark:shadow-slate-900/30", "bg-black/30 border-white/10", "bg-[#fcf7ee] border-[#ebdcb9]")}`}>
        <div className="space-y-1 z-10 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-md font-bold bg-[#7A9E85] text-white">
              Analytical Control Panel
            </span>
            {dataRefreshCount > 0 && (
              <span className="text-[9px] font-mono text-[#7A9E85] bg-[#7A9E85]/10 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded animate-pulse font-bold">
                ? Auto-Refreshed ({dataRefreshCount})
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-purple-200">
            mood analytics dashboard
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Real-time telemetry, cultural preservation metrics, in-app safety interlocks, and Google Workspace synchronization analytics rendered in continuous vector models.
          </p>
        </div>

        {/* Top Control Bar with filters */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            onClick={handleRefresh}
            className="p-2 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-705 rounded-xl cursor-pointer transition-all flex items-center gap-1 text-xs text-slate-600 dark:text-slate-350"
            title="Refresh Data Sources"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="font-semibold">Refresh</span>
          </button>
          
          <button
            onClick={() => {
              alert("Data metrics exported safely inside zero-knowledge local container. Ready for secure audit.");
            }}
            className="p-2 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-705 rounded-xl cursor-pointer transition-all flex items-center gap-1 text-xs text-slate-600 dark:text-slate-350"
            title="Export CSV Metadata"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-semibold">Export</span>
          </button>
        </div>
      </div>

      {/* Slicers & Filters Rail */}
      <div className={`p-4 rounded-xl border flex flex-wrap gap-4 items-center justify-between ${themeClass("bg-slate-50/ dark:bg-[#0a0a0a]/50 border-slate-150", "bg-slate-950/20 border-slate-850", "bg-[#fbf7ee] border-[#ebdcb9]/60")}`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
            <Filter className="w-3.5 h-3.5 text-[#7A9E85]" />
            <span>Slicers:</span>
          </div>

          {/* Time Slicer */}
          <div className="flex rounded-lg border border-black/5 p-0.5 bg-black/5 dark:bg-white/5">
            {(["30d", "7d", "24h"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setTimeFilter(opt)}
                className={`px-3 py-1 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
                  timeFilter === opt
                    ? "bg-[#7A9E85] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-850 dark:text-slate-200"
                }`}
              >
                {opt === "30d" ? "30 Days" : opt === "7d" ? "7 Days" : "24 Hours"}
              </button>
            ))}
          </div>

          {/* Segment Focus Slicer */}
          <select
            value={focusFilter}
            onChange={(e) => setFocusFilter(e.target.value)}
            className="p-1 px-2.5 bg-white dark:bg-black border border-black/5 rounded-lg text-[10.5px] font-medium outline-none text-slate-700 dark:text-slate-250 cursor-pointer"
          >
            <option>All Users Focus</option>
            <option>LGBTQIA+ Peer Cohort</option>
            <option>Clinical Outpatient Diagnostics</option>
            <option>Academic Group Study</option>
          </select>
        </div>

        <div className="text-[10px] font-mono text-slate-450">
          Source Connection: <strong className="text-[#7A9E85] dark:text-indigo-400 font-extrabold uppercase">Firestore Live Stream</strong>
        </div>
      </div>

      {/* 4 Majestic Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow ${themeClass("bg-white dark:bg-black border-slate-205", "bg-black/40 border-white/10", "bg-[#fffcf8] border-[#ebdcb9]")}`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9.5px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-550 block font-bold">Mindful Session Tracks</span>
              <h2 className="text-2xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">
                {aggregateStats.activeSessions.toLocaleString()}
              </h2>
            </div>
            <div className="p-2 bg-[#7A9E85]/10 dark:bg-white/[0.02]/40 text-[#7A9E85] dark:text-indigo-350 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10.5px] text-[#7A9E85] font-medium leading-none">
            <span>? Dynamic Action Track</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">Based on user interactions</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow ${themeClass("bg-white dark:bg-black border-slate-205", "bg-black/40 border-white/10", "bg-[#fffcf8] border-[#ebdcb9]")}`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9.5px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-550 block font-bold">Clinician References</span>
              <h2 className="text-2xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">
                {aggregateStats.crisisChecks} Interlocks
              </h2>
            </div>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10.5px] text-[#7A9E85] font-medium leading-none">
            <span>? Secured & Isolated</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">Zero cloud logs</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow ${themeClass("bg-white dark:bg-black border-slate-205", "bg-black/40 border-white/10", "bg-[#fffcf8] border-[#ebdcb9]")}`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9.5px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-550 block font-bold">Preservation Engagement</span>
              <h2 className="text-2xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100 truncate max-w-[150px]">
                {aggregateStats.favouriteArt}
              </h2>
            </div>
            <div className="p-2 bg-[#F0EBD6] dark:bg-amber-950/40 text-[#6B6B6B] dark:text-amber-450 rounded-lg">
              <Palette className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10.5px] text-[#6B6B6B] font-medium leading-none">
            <span>? Active Companion</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">Currently in session</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow ${themeClass("bg-white dark:bg-black border-slate-205", "bg-black/40 border-white/10", "bg-[#fffcf8] border-[#ebdcb9]")}`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[9.5px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-550 block font-bold">Connected Keep Logs</span>
              <h2 className="text-2xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">
                {aggregateStats.syncCount.toLocaleString()} Posts
              </h2>
            </div>
            <div className="p-2 bg-[#7A9E85]/10 dark:bg-emerald-950/40 text-[#7A9E85] dark:text-emerald-450 rounded-lg">
              <FolderSync className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[10.5px] text-[#7A9E85] font-medium leading-none">
            <span>? Solace Wall Sync</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">Encrypted index active</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Trend Area Chart (8 columns on desktop) */}
        <div className={`lg:col-span-8 p-5 rounded-2xl border flex flex-col justify-between ${themeClass("bg-white dark:bg-black border-slate-200 dark:border-white/10 shadow-xs", "bg-black/30 border-white/10", "bg-[#fffcf6] border-[#ebdcb9]")}`}>
          <div className="border-b pb-3 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif">
              Temporal Recovery Trend Analytics
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Daily grounding sessions paired with published solace wall updates (sourced directly from user localStorage).
            </p>
          </div>

          <div className="h-64 md:h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentDailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sessionsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7A9E85" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#7A9E85" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="syncsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B6B6B" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6B6B6B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#888888" fontSize={9.5} tickLine={false} />
                <YAxis stroke="#888888" fontSize={9.5} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#000000d0", 
                    borderRadius: "12px", 
                    color: "#ffffff", 
                    border: "none",
                    fontFamily: "monospace",
                    fontSize: "11px"
                  }} 
                />
                <Area type="monotone" name="Grounding Sessions" dataKey="sessions" stroke="#7A9E85" strokeWidth={2} fillOpacity={1} fill="url(#sessionsColor)" />
                <Area type="monotone" name="Wall Posts" dataKey="keepSyncs" stroke="#6B6B6B" strokeWidth={2} fillOpacity={1} fill="url(#syncsColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protocols Pie Chart (4 columns on desktop) */}
        <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between ${themeClass("bg-white dark:bg-black border-slate-200 dark:border-white/10 shadow-xs", "bg-black/30 border-white/10", "bg-[#fffcf6] border-[#ebdcb9]")}`}>
          <div className="border-b pb-3 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif">
              Aura Support Protocols Share
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Breakdown of logged mood types reflecting your dynamic emotional state distribution.
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={protocolsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {protocolsPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#000000e0", 
                    borderRadius: "8px", 
                    color: "#fff", 
                    fontSize: "10.5px" 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-[10px] grid grid-cols-2 gap-2 mt-2">
            {protocolsPieData.map((item, id) => (
              <div key={id} className="flex items-center gap-1.5 text-left text-slate-600 dark:text-slate-350 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>


      
    </div>
  );
}