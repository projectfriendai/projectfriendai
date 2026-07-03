import React, { useState } from "react";
import { 
  MessageSquare, 
  BarChart2, 
  Book, 
  Wind, 
  Settings, 
  ShieldCheck, 
  Palette, 
  Briefcase, 
  Mail, 
  Users,
  Moon,
  Sun,
  Brain,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Trash2
} from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenClinicalDirectory: () => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
  themeMode: string;
  onThemeChange: (theme: string) => void;
  alias: string;
  onLogout?: () => void;
  onNewChat?: () => void;
  onSearchClick?: () => void;
  sessions?: any[];
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
}

export function Sidebar({
  isSidebarOpen,
  onToggleSidebar,
  activeTab,
  onTabChange,
  onOpenClinicalDirectory,
  zenMode,
  onToggleZenMode,
  themeMode,
  onThemeChange,
  alias,
  onLogout,
  onNewChat,
  onSearchClick,
  sessions = [],
  onSelectSession,
  onDeleteSession
}: SidebarProps) {
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'letters', label: 'Letters', icon: Mail },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'journal', label: 'Journal', icon: Book },
    { id: 'wellness', label: 'Wellness', icon: Wind },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toolsItems = [
    { id: 'doodle', label: 'Do Doodle', icon: Palette, externalUrl: 'https://do-doodle.netlify.app/' },
    { id: 'mood', label: 'Mood Analytics', icon: Briefcase },
    { id: 'community', label: 'Community Center', icon: Users },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div 
          onClick={onToggleSidebar}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] md:hidden cursor-pointer"
        />
      )}
      
      <div className={`
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'} 
        transition-all duration-300 h-screen 
        fixed md:sticky inset-y-0 left-0 z-[9999] md:z-auto
        bg-white border-r border-[#EDEBE7]
        flex flex-col shrink-0 overflow-y-auto overflow-x-hidden 
        ${!isSidebarOpen && 'hidden md:flex'}
      `}>
        <div className="p-4 border-b border-[#EDEBE7] flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
            <img 
              src="/friend_ai_logo.png" 
              alt="friend ai logo" 
              className="w-10 h-10 rounded-xl object-cover border border-[#EDEBE7] shrink-0 shadow-sm"
            />
            <div>
              <h1 className="font-bold text-xl tracking-tight whitespace-nowrap text-[#2B2B2B]">friend <span className="text-[#7A9E85]">ai</span></h1>
              <p className="text-xs text-[#6B6B6B] font-mono truncate w-24">{alias}</p>
            </div>
          </div>
          <button 
            onClick={onToggleSidebar}
            className={`p-2 text-[#6B6B6B] hover:text-[#2B2B2B] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer ${!isSidebarOpen && 'mx-auto'}`}
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <img 
                src="/friend_ai_logo.png" 
                alt="Mascot Logo" 
                className="w-8 h-8 rounded-xl border border-[#EDEBE7] object-cover hover:scale-105 active:scale-95 transition-all shadow-sm"
              />
            )}
          </button>
        </div>

      {isSidebarOpen ? (
        <>
          <div className="p-4 space-y-1">
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3 px-3">Main</p>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium cursor-pointer ${
                    isActive 
                      ? "bg-[#E8F0EA] text-[#7A9E85]" 
                      : "text-[#6B6B6B] hover:bg-[#FAF8F5] hover:text-[#2B2B2B]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 space-y-1 border-t border-[#EDEBE7]">
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3 px-3">Integrations</p>
            {toolsItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.externalUrl) {
                      window.location.href = item.externalUrl;
                    } else {
                      onTabChange(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-medium cursor-pointer ${
                    isActive 
                      ? "bg-[#E8F0EA] text-[#7A9E85]" 
                      : "text-[#6B6B6B] hover:bg-[#FAF8F5] hover:text-[#2B2B2B]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
            
            <button
              onClick={onOpenClinicalDirectory}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-sm font-medium text-[#7A9E85] hover:bg-[#E8F0EA] cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Clinical Directory</span>
            </button>
          </div>


          <div className="mt-auto p-4 border-t border-[#EDEBE7]">
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center gap-6 py-6 w-full">
          <button
            onClick={() => {
              if (onNewChat) onNewChat();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E8F0EA] text-[#7A9E85] hover:bg-[#D6E8DA] transition-all cursor-pointer shadow-sm active:scale-95"
            title="New Chat"
          >
            <Plus className="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            onClick={() => {
              if (onSearchClick) onSearchClick();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#FAF8F5] text-[#6B6B6B] hover:text-[#2B2B2B] transition-all cursor-pointer active:scale-95"
            title="Search guides/specializations"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              activeTab === 'settings'
                ? "bg-[#E8F0EA] text-[#7A9E85]"
                : "hover:bg-[#FAF8F5] text-[#6B6B6B] hover:text-[#2B2B2B]"
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
    </>
  );
}