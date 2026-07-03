export interface Character {
  id: string;
  name: string;
  description: string;
  approach: string;
  avatarColor: string;
  accentColor: string;
  mantra: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isCrisisOverride?: boolean;
  isMedicoLegal?: boolean;
}

export interface MoodEntry {
  id: string;
  mood: 'Joyful' | 'Peaceful' | 'Tired' | 'Anxious' | 'Depressed' | 'Overwhelmed';
  intensity: number; // 1-10
  timestamp: string;
  tags: string[];
  note: string;
  isEncrypted: boolean;
  hash: string;
}

export interface SolaceMessage {
  id: string;
  text: string;
  timestamp: string;
  location: string; // e.g. "Anonymous from Mumbai", "Anonymous from Delhi", "Anonymous"
  hugCount: number;
}
