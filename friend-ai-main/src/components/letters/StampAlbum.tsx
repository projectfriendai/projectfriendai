import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export interface Stamp {
  id: string;
  name: string;
  image: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Limited';
  region: string;
  unlocked: boolean;
  unlockCondition: string;
  dateUnlocked?: string;
  description: string;
}

export const STAMP_LIST: Stamp[] = [
  { id: 'st_globe', name: 'First Flight', image: '✈️', rarity: 'Common', region: 'Global', unlocked: true, unlockCondition: 'Automatically unlocked on signup.', dateUnlocked: '2026-06-30', description: 'Celebrating your very first correspondence sent across the cloud.' },
  { id: 'st_denmark', name: 'Copenhagen Little Mermaid', image: '🧜‍♀️', rarity: 'Rare', region: 'Denmark', unlocked: true, unlockCondition: 'Receive a letter sent from Copenhagen, Denmark.', dateUnlocked: '2026-06-30', description: 'Inspired by Hans Christian Andersen\'s fairytale sculpture overlooking the harbor.' },
  { id: 'st_us', name: 'Statue of Liberty', image: '🗽', rarity: 'Epic', region: 'United States', unlocked: true, unlockCondition: 'Exchanged 5 letters with a friend from the USA.', dateUnlocked: '2026-06-30', description: 'A colossal neoclassical sculpture representing freedom and international friendship.' },
  { id: 'st_aurora', name: 'Northern Lights', image: '🌌', rarity: 'Legendary', region: 'Iceland', unlocked: false, unlockCondition: 'Send a letter during an active solar flare event or to Iceland.', description: 'The natural light display shimmering over Nordic night skies.' },
  { id: 'st_ghibli', name: 'Forest Spirit', image: '🌳', rarity: 'Limited', region: 'Japan', unlocked: false, unlockCondition: 'Write a letter using the AI Writing Ghibli theme.', description: 'A woodland protector inspired by the magical forests of Japan.' },
  { id: 'st_egypt', name: 'Giza Pyramids', image: '🔺', rarity: 'Epic', region: 'Egypt', unlocked: false, unlockCondition: 'Exchange a letter travelling more than 5,000 km.', description: 'An ancient wonder standing tall through thousands of years.' },
  { id: 'st_sakura', name: 'Tokyo Sakura', image: '🌸', rarity: 'Rare', region: 'Japan', unlocked: true, unlockCondition: 'Send a letter during the spring season (March-May).', dateUnlocked: '2026-06-30', description: 'The iconic cherry blossoms in full bloom under Mount Fuji.' },
  { id: 'st_pyramids', name: 'Great Sphinx', image: '🦁', rarity: 'Epic', region: 'Egypt', unlocked: false, unlockCondition: 'Send a letter with a customized Classic Red wax seal.', description: 'The mystical limestone monument guarding the Giza plateau.' },
  { id: 'st_koala', name: 'Eucalyptus Koala', image: '🐨', rarity: 'Common', region: 'Australia', unlocked: true, unlockCondition: 'Send a letter to a friend in Australia.', dateUnlocked: '2026-06-30', description: 'A quiet tree-dwelling marsupial native to Eastern Australia.' },
  { id: 'st_arcade', name: 'Retro Console', image: '🕹️', rarity: 'Limited', region: 'Retro Land', unlocked: false, unlockCondition: 'Complete the "Retro Night" writing challenge.', description: 'An old-school joystick reminiscent of 80s arcade cabinets.' },
  { id: 'st_voyager', name: 'Golden Record', image: '📀', rarity: 'Legendary', region: 'Deep Space', unlocked: false, unlockCondition: 'Write a letter with over 2,000 words.', description: 'A record sent aboard the Voyager spacecraft as a greeting to space.' },
  { id: 'st_croissant', name: 'Parisian Café', image: '🥐', rarity: 'Common', region: 'France', unlocked: true, unlockCondition: 'Send a letter to a friend in France.', dateUnlocked: '2026-06-30', description: 'A flaky, golden-brown crescent roll that pairs perfectly with coffee.' },
  { id: 'st_taj', name: 'Taj Mahal', image: '🕌', rarity: 'Epic', region: 'India', unlocked: true, unlockCondition: 'Send a letter to a friend in India.', dateUnlocked: '2026-06-30', description: 'An immense mausoleum of white marble, representing eternal love.' },
  { id: 'st_eiffel', name: 'Eiffel Tower', image: '🗼', rarity: 'Epic', region: 'France', unlocked: false, unlockCondition: 'Send 5 letters to France.', description: 'The wrought-iron lattice tower on the Champ de Mars in Paris.' },
  { id: 'st_greatwall', name: 'Great Wall', image: '🧱', rarity: 'Epic', region: 'China', unlocked: false, unlockCondition: 'Send a letter with a character count exceeding 10,000.', description: 'Ancient fortifications stretching across the northern borders of China.' },
  { id: 'st_colosseum', name: 'Roman Colosseum', image: '🏟️', rarity: 'Epic', region: 'Italy', unlocked: true, unlockCondition: 'Send a letter to a friend in Italy.', dateUnlocked: '2026-06-30', description: 'The giant stone amphitheatre built under the Flavian emperors of Rome.' },
  { id: 'st_sydney', name: 'Sydney Opera House', image: '⛵', rarity: 'Epic', region: 'Australia', unlocked: false, unlockCondition: 'Complete the "Southern Seas" correspondence thread.', description: 'A multi-venue performing arts centre in Sydney, resembling billowing sails.' },
  { id: 'st_bigben', name: 'Big Ben Tower', image: '🕰️', rarity: 'Epic', region: 'United Kingdom', unlocked: true, unlockCondition: 'Receive a letter from a friend in the United Kingdom.', dateUnlocked: '2026-06-30', description: 'The Great Bell of the clock tower at the north end of the Palace of Westminster.' },
  { id: 'st_coffee', name: 'Drip Coffee', image: '☕', rarity: 'Common', region: 'Global', unlocked: true, unlockCondition: 'Automatically unlocked. Enjoy a hot brew!', dateUnlocked: '2026-06-30', description: 'A comforting cup of filter coffee to fuel long writing sessions.' },
  { id: 'st_pizza', name: 'Neapolitan Pizza', image: '🍕', rarity: 'Common', region: 'Italy', unlocked: true, unlockCondition: 'Receive a stamp trade request.', dateUnlocked: '2026-06-30', description: 'A slice of sourdough pizza with fresh basil and melted mozzarella.' },
  { id: 'st_cassette', name: 'Mixtape Cassette', image: '📼', rarity: 'Rare', region: 'Retro Land', unlocked: false, unlockCondition: 'Write a music-themed letter to any pen pal.', description: 'A cassette containing home-recorded analog vaporwave mixes.' },
  { id: 'st_crane', name: 'Origami Crane', image: '🕊️', rarity: 'Rare', region: 'Japan', unlocked: true, unlockCondition: 'Unlock by sending a letter on World Peace Day.', dateUnlocked: '2026-06-30', description: 'A folded paper bird symbolizing recovery, hope, and peace.' },
  { id: 'st_camera', name: 'Vintage Camera', image: '📷', rarity: 'Common', region: 'Global', unlocked: true, unlockCondition: 'Attach a photo file to your letter.', dateUnlocked: '2026-06-30', description: 'A twin-lens reflex film camera that captures nostalgic travel moments.' },
  { id: 'st_compass', name: 'Wanderer Compass', image: '🧭', rarity: 'Rare', region: 'Global', unlocked: false, unlockCondition: 'Add three pen pals in different time zones.', description: 'A brass navigational tool that always points to the next adventure.' },
  { id: 'st_fuji', name: 'Mount Fuji', image: '🗻', rarity: 'Rare', region: 'Japan', unlocked: true, unlockCondition: 'Receive a letter from a friend in Japan.', dateUnlocked: '2026-06-30', description: 'The active volcano and highest peak in Japan, standing as a sacred symbol.' },
  { id: 'st_chichen', name: 'Chichen Itza Pyramid', image: '🛕', rarity: 'Epic', region: 'Mexico', unlocked: false, unlockCondition: 'Send a letter to a friend in Mexico.', description: 'The ancient Mayan step-pyramid temple of El Castillo.' },
  { id: 'st_brandenburg', name: 'Brandenburg Gate', image: '🏛️', rarity: 'Epic', region: 'Germany', unlocked: true, unlockCondition: 'Send a letter to a friend in Germany.', dateUnlocked: '2026-06-30', description: 'The neoclassical monumental arch symbolizing German history and unity.' },
  { id: 'st_pisa', name: 'Leaning Tower of Pisa', image: '🗼', rarity: 'Rare', region: 'Italy', unlocked: false, unlockCondition: 'Send 10 letters using the Distance-Based delivery mode.', description: 'The freestanding bell tower of Pisa cathedral, known for its accidental tilt.' },
  { id: 'st_stonehenge', name: 'Stonehenge', image: '🪨', rarity: 'Epic', region: 'United Kingdom', unlocked: false, unlockCondition: 'Send a letter during the Solstice calendar events.', description: 'The prehistoric ring of standing stones in Wiltshire, England.' },
  { id: 'st_parthenon', name: 'The Parthenon', image: '🏛️', rarity: 'Epic', region: 'Greece', unlocked: true, unlockCondition: 'Exchange 10 letters with any pen pal in Europe.', dateUnlocked: '2026-06-30', description: 'The former temple on the Athenian Acropolis dedicated to the goddess Athena.' },
  { id: 'st_goldengate', name: 'Golden Gate Bridge', image: '🌉', rarity: 'Rare', region: 'United States', unlocked: true, unlockCondition: 'Send a letter to a friend in San Francisco, California.', dateUnlocked: '2026-06-30', description: 'The famous suspension bridge spanning the Golden Gate strait.' },
  { id: 'st_barrierreef', name: 'Great Barrier Reef', image: '🐠', rarity: 'Legendary', region: 'Australia', unlocked: false, unlockCondition: 'Exchange letters discussing marine life or conservation.', description: 'The world\'s largest coral reef system, located in the Coral Sea.' },
  { id: 'st_moai', name: 'Moai Statues', image: '🗿', rarity: 'Epic', region: 'Chile', unlocked: false, unlockCondition: 'Send a letter to a remote island territory.', description: 'Monolithic human figures carved by the Rapa Nui people on Easter Island.' },
  { id: 'st_christ', name: 'Christ the Redeemer', image: '⛪', rarity: 'Epic', region: 'Brazil', unlocked: true, unlockCondition: 'Send a letter to a friend in South America.', dateUnlocked: '2026-06-30', description: 'The colossal Art Deco statue of Jesus Christ overlooking Rio de Janeiro.' },
  { id: 'st_everest', name: 'Mount Everest', image: '🏔️', rarity: 'Legendary', region: 'Nepal', unlocked: false, unlockCondition: 'Exchange letters with a friend located in Nepal or high altitudes.', description: 'Earth\'s highest mountain above sea level, located in the Himalayas.' },
  { id: 'st_maneki', name: 'Lucky Neko Cat', image: '🐱', rarity: 'Rare', region: 'Japan', unlocked: true, unlockCondition: 'Automatically unlocked on New Year\'s Day.', dateUnlocked: '2026-06-30', description: 'A common Japanese figurine believed to bring good luck to the owner.' },
  { id: 'st_phonebooth', name: 'Red Phone Booth', image: '☎️', rarity: 'Common', region: 'United Kingdom', unlocked: true, unlockCondition: 'Send a quick draft letter containing less than 100 words.', dateUnlocked: '2026-06-30', description: 'The iconic red telephone kiosk designed by Sir Giles Gilbert Scott.' },
  { id: 'st_crown', name: 'Golden Royal Crown', image: '👑', rarity: 'Limited', region: 'Royal Land', unlocked: false, unlockCondition: 'Reach a milestone of 100 total correspondence letters.', description: 'A symbol of traditional royalty, awarded to prolific pen pals.' },
  { id: 'st_soccer', name: 'Classic Football', image: '⚽', rarity: 'Common', region: 'Global', unlocked: true, unlockCondition: 'Exchanged a letter with a friend from Brazil or England.', dateUnlocked: '2026-06-30', description: 'The iconic pentagon-patterned ball representing the world\'s most popular sport.' },
  { id: 'st_basketball', name: 'Championship Basketball', image: '🏀', rarity: 'Common', region: 'United States', unlocked: true, unlockCondition: 'Exchanged 3 letters about hobbies or sports.', dateUnlocked: '2026-06-30', description: 'A textured orange leather basketball, celebrating teamwork and hustle.' },
  { id: 'st_tennis', name: 'Grass Court Tennis', image: '🎾', rarity: 'Rare', region: 'United Kingdom', unlocked: false, unlockCondition: 'Send a letter during the summer Grand Slam tournaments.', description: 'A fuzzy yellow-green tennis ball, synonymous with matches on grass courts.' },
  { id: 'st_cricket', name: 'Willow Cricket Bat', image: '🏏', rarity: 'Rare', region: 'India', unlocked: true, unlockCondition: 'Send a letter to a friend in India or Australia.', dateUnlocked: '2026-06-30', description: 'A bat crafted from English willow, representing cricket traditions.' },
  { id: 'st_trophy', name: 'Victors Cup', image: '🏆', rarity: 'Epic', region: 'Global', unlocked: false, unlockCondition: 'Reach a milestone of 50 total correspondence letters.', description: 'A polished gold trophy awarded to writers who show dedicated consistency.' },
  { id: 'st_torch', name: 'Olympic Flame', image: '🔥', rarity: 'Legendary', region: 'Greece', unlocked: false, unlockCondition: 'Send a letter during the active Olympic Games calendar season.', description: 'The sacred flame carried across nations to ignite the games of unity.' },
  { id: 'st_skate', name: 'Skateboard Deck', image: '🛹', rarity: 'Common', region: 'United States', unlocked: true, unlockCondition: 'Send a letter via Instant Delivery speed mode.', dateUnlocked: '2026-06-30', description: 'A skateboard deck featuring graphics, embodying streetwear and concrete culture.' },
  { id: 'st_sparkles', name: 'Sparkly Stars', image: '✨', rarity: 'Common', region: 'Global', unlocked: true, unlockCondition: 'Automatically unlocked for a bright start.', dateUnlocked: '2026-06-30', description: 'A cluster of golden stars representing clean and magical vibes.' },
  { id: 'st_popper', name: 'Party Popper', image: '🎉', rarity: 'Common', region: 'Global', unlocked: true, unlockCondition: 'Send a letter celebrating a birthday or anniversary.', dateUnlocked: '2026-06-30', description: 'A colorful confetti explosion celebrating milestones and achievements.' },
  { id: 'st_alien', name: 'Space Invader', image: '👾', rarity: 'Rare', region: 'Retro Land', unlocked: false, unlockCondition: 'Send a letter containing the word "gaming" or "pixel".', description: 'A retro 8-bit purple alien sprite reminiscent of old arcade systems.' },
  { id: 'st_bubbletea', name: 'Sweet Bubble Tea', image: '🧋', rarity: 'Common', region: 'Global', unlocked: true, unlockCondition: 'Send a sweet greeting containing a friendly emoji.', dateUnlocked: '2026-06-30', description: 'A cold cup of boba milk tea with tapioca pearls and a fat straw.' },
  { id: 'st_rainbow', name: 'Dreamy Rainbow', image: '🌈', rarity: 'Rare', region: 'Global', unlocked: false, unlockCondition: 'Write a letter on a rainy calendar day.', description: 'A vibrant multicolored arc spanning the sky, bringing hope.' },
  { id: 'st_rocket', name: 'Retro Rocket', image: '🚀', rarity: 'Epic', region: 'Deep Space', unlocked: false, unlockCondition: 'Send a reply within 5 minutes of receiving a letter.', description: 'A vintage steel rocket blasting off into the cosmic stars.' },
  { id: 'st_crystal', name: 'Crystal Ball', image: '🔮', rarity: 'Epic', region: 'Mystic Land', unlocked: false, unlockCondition: 'Ask your pen pal a question about their future plans.', description: 'A glowing crystal ball on a brass stand, showing mysterious visions.' },
  { id: 'st_chili', name: 'Spicy Chili', image: '🌶️', rarity: 'Common', region: 'Global', unlocked: true, unlockCondition: 'Write a letter with a passionate or heated discussion.', dateUnlocked: '2026-06-30', description: 'A bright red hot chili pepper, representing zest and passion.' }
];

const STREAK_UNLOCK_TIERS: [number, string[]][] = [
  [1, ['st_cassette', 'st_compass', 'st_pisa', 'st_tennis', 'st_alien', 'st_rainbow']],
  [3, ['st_egypt', 'st_eiffel', 'st_chichen']],
  [7, ['st_pyramids', 'st_greatwall', 'st_moai']],
  [14, ['st_sydney', 'st_stonehenge', 'st_trophy', 'st_rocket', 'st_crystal']],
  [21, ['st_aurora', 'st_voyager', 'st_barrierreef', 'st_everest', 'st_torch']],
  [30, ['st_ghibli', 'st_arcade', 'st_crown']],
];

function computeUnlocked(stamp: Stamp, streak: number): boolean {
  if (stamp.unlocked) return true;
  for (const [required, ids] of STREAK_UNLOCK_TIERS) {
    if (streak >= required && ids.includes(stamp.id)) return true;
  }
  return false;
}

export function getUnlockedStamps(streak: number): Stamp[] {
  return STAMP_LIST.filter(s => computeUnlocked(s, streak));
}

export const StampAlbum: React.FC = () => {
  const { profile } = useAuth();
  const loginStreak = (profile as any)?.loginStreak || 0;
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('All');
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);

  const stampsWithUnlock = useMemo(() =>
    STAMP_LIST.map(s => ({ ...s, unlocked: computeUnlocked(s, loginStreak) })),
    [loginStreak]
  );

  const totalStamps = STAMP_LIST.length;
  const unlockedCount = stampsWithUnlock.filter(s => s.unlocked).length;
  const completionPercentage = Math.round((unlockedCount / totalStamps) * 100);

  const filteredStamps = stampsWithUnlock.filter(stamp => {
    const matchesSearch = stamp.name.toLowerCase().includes(search.toLowerCase()) ||
                          stamp.region.toLowerCase().includes(search.toLowerCase());
    const matchesRarity = rarityFilter === 'All' || stamp.rarity === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  return (
    <div className="bg-[#FAF8F5] dark:bg-gray-950 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Album Header & Metrics */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#EDEBE7] dark:border-gray-800 p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-[family-name:var(--font-letters-serif)] text-[#2B2B2B] dark:text-gray-100 font-bold">Stamp Album</h1>
              <p className="text-[#2B2B2B]/60 dark:text-gray-400 text-sm mt-1">Every letter tells a story, and every stamp marks a journey.</p>
            </div>
            <div className="w-full md:w-64 text-right space-y-2">
              <div className="flex justify-between text-sm font-semibold text-[#2B2B2B] dark:text-gray-100">
                <span>Album Progress</span>
                <span>{unlockedCount} / {totalStamps} ({completionPercentage}%)</span>
              </div>
              <div className="w-full h-3 bg-[#EDEBE7] dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7A9E85] dark:bg-amber-500 transition-all duration-500 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search stamp or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-full border border-[#EDEBE7] dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7A9E85] dark:focus:ring-amber-400 text-sm"
          />
          <div className="flex gap-2">
            {['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Limited'].map((rarity) => (
              <button
                key={rarity}
                onClick={() => setRarityFilter(rarity)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                    rarityFilter === rarity
                      ? 'bg-[#2B2B2B] dark:bg-gray-800 text-white border-[#2B2B2B]'
                      : 'bg-white dark:bg-gray-900 border-[#EDEBE7] dark:border-gray-800 text-[#2B2B2B] dark:text-gray-100 hover:bg-[#EDEBE7] dark:hover:bg-gray-700'
                }`}
              >
                {rarity}
              </button>
            ))}
          </div>
        </div>

        {/* Stamps Album Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredStamps.map((stamp) => (
            <div
              key={stamp.id}
              onClick={() => setSelectedStamp(stamp)}
              className={`cursor-pointer group aspect-square bg-white dark:bg-gray-900 border-2 rounded-xl flex flex-col items-center justify-center p-3 transition relative ${
                stamp.unlocked
                  ? 'border-[#EDEBE7] dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1'
                  : 'border-dashed border-[#EDEBE7] opacity-50 bg-[#FAF8F5] dark:bg-gray-800 dark:border-gray-600'
              }`}
            >
              <div className={`text-4xl mb-2 select-none filter transition ${stamp.unlocked ? '' : 'grayscale contrast-75'}`}>
                {stamp.image}
              </div>
              <span className="text-xs font-semibold text-[#2B2B2B] dark:text-gray-100 text-center leading-tight truncate w-full">
                {stamp.name}
              </span>

              <div className="absolute top-2 right-2">
                <span className={`w-2 h-2 rounded-full block ${
                  stamp.rarity === 'Legendary' ? 'bg-yellow-500' :
                  stamp.rarity === 'Limited' ? 'bg-red-500' :
                  stamp.rarity === 'Epic' ? 'bg-purple-500' :
                  stamp.rarity === 'Rare' ? 'bg-blue-500' : 'bg-[#6B6B6B]'
                }`} />
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal Overlay */}
        {selectedStamp && (
          <div className="fixed inset-0 bg-[#2B2B2B]/40 dark:bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-[#EDEBE7] dark:border-gray-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedStamp(null)}
                className="absolute top-4 right-4 text-[#2B2B2B]/60 dark:text-gray-400 hover:text-[#2B2B2B] dark:hover:text-gray-100 text-xl font-bold"
              >
                ✕
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="text-6xl mb-4 bg-[#FAF8F5] dark:bg-gray-950 w-20 h-20 rounded-full flex items-center justify-center border border-[#EDEBE7] dark:border-gray-800">
                  {selectedStamp.image}
                </div>
                <h3 className="text-2xl font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100">{selectedStamp.name}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-[#EDEBE7] dark:bg-gray-800 text-[#2B2B2B] dark:text-gray-100 text-[10px] uppercase font-bold rounded">
                    {selectedStamp.region}
                  </span>
                  <span className={`px-2 py-0.5 text-white text-[10px] uppercase font-bold rounded ${
                    selectedStamp.rarity === 'Legendary' ? 'bg-yellow-500' :
                    selectedStamp.rarity === 'Limited' ? 'bg-red-500' :
                    selectedStamp.rarity === 'Epic' ? 'bg-purple-500' :
                    selectedStamp.rarity === 'Rare' ? 'bg-blue-500' : 'bg-[#6B6B6B]'
                  }`}>
                    {selectedStamp.rarity}
                  </span>
                </div>

                <p className="text-[#2B2B2B]/80 dark:text-gray-300 text-sm mt-4 italic font-[family-name:var(--font-letters-serif)] px-2">
                  "{selectedStamp.description}"
                </p>

                <div className="w-full mt-6 bg-[#FAF8F5] dark:bg-gray-950 rounded-xl p-4 border border-[#EDEBE7] dark:border-gray-800 text-left">
                  <span className="text-xs uppercase text-[#2B2B2B]/50 dark:text-gray-400 tracking-wider font-bold block mb-1">
                    How to unlock
                  </span>
                  <p className="text-sm text-[#2B2B2B] dark:text-gray-100 font-medium">
                    {selectedStamp.unlockCondition}
                  </p>

                  {selectedStamp.unlocked && (
                    <div className="mt-3 border-t border-[#EDEBE7] dark:border-gray-700 pt-2 flex justify-between text-xs text-[#2B2B2B]/70 dark:text-gray-300">
                      <span>Unlocked on:</span>
                      <span className="font-semibold">{selectedStamp.dateUnlocked}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
