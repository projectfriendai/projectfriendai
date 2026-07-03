import React, { useState } from 'react';

export interface AvatarConfig {
  animal: 'pig' | 'elephant' | 'owl' | 'rabbit' | 'bear' | 'frog' | 'tiger' | 'penguin' | 'fox' | 'zebra' | 'sheep' | 'giraffe';
  bg: string;
}

export const ANIMAL_PRESETS = [
  { id: 'pig', name: 'Piglet', bg: '#FF57B2', icon: '🐷' },
  { id: 'elephant', name: 'Elephant', bg: '#5B90FF', icon: '🐘' },
  { id: 'owl', name: 'Barn Owl', bg: '#DFFF3E', icon: '🦉' },
  { id: 'rabbit', name: 'Bunny', bg: '#E2E1DD', icon: '🐰' },
  { id: 'bear', name: 'Grizzly', bg: '#E77451', icon: '🐻' },
  { id: 'frog', name: 'Froggy', bg: '#13B27E', icon: '🐸' },
  { id: 'tiger', name: 'Tiger', bg: '#FF7B39', icon: '🐯' },
  { id: 'penguin', name: 'Penguin', bg: '#D2BFFD', icon: '🐧' },
  { id: 'fox', name: 'Foxy', bg: '#FF5935', icon: '🦊' },
  { id: 'zebra', name: 'Zebra', bg: '#91A861', icon: '🦓' },
  { id: 'sheep', name: 'Lamb', bg: '#A6E5FF', icon: '🐑' },
  { id: 'giraffe', name: 'Giraffe', bg: '#F2C400', icon: '🦒' }
];

export const Avatar: React.FC<{ config: AvatarConfig; className?: string }> = ({ config, className = 'w-32 h-32' }) => {
  const strokeProps = {
    stroke: '#1A1A1A',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const renderAnimal = () => {
    switch (config.animal) {
      case 'pig':
        return (
          <g fill="none">
            <path d="M 40 40 Q 30 20, 48 30 Z" fill="#FFC2E0" {...strokeProps} />
            <path d="M 80 40 Q 90 20, 72 30 Z" fill="#FFC2E0" {...strokeProps} />
            <circle cx="60" cy="60" r="32" fill="#FFC2E0" {...strokeProps} />
            <ellipse cx="60" cy="65" rx="12" ry="8" fill="#FFF" {...strokeProps} />
            <circle cx="56" cy="65" r="1.5" fill="#1A1A1A" />
            <circle cx="64" cy="65" r="1.5" fill="#1A1A1A" />
            <circle cx="48" cy="48" r="2" fill="#1A1A1A" />
            <circle cx="72" cy="48" r="2" fill="#1A1A1A" />
            <path d="M 44 42 Q 48 40, 52 42" {...strokeProps} />
            <path d="M 68 42 Q 72 40, 76 42" {...strokeProps} />
            <line x1="38" y1="56" x2="43" y2="54" {...strokeProps} />
            <line x1="82" y1="56" x2="77" y2="54" {...strokeProps} />
            <path d="M 28 100 L 32 108 M 32 108 L 36 100" {...strokeProps} />
            <path d="M 92 100 L 88 108 M 88 108 L 84 100" {...strokeProps} />
          </g>
        );
      case 'elephant':
        return (
          <g fill="none">
            <path d="M 38 48 C 15 40, 15 70, 38 72 Z" fill="#E2E7ED" {...strokeProps} />
            <path d="M 82 48 C 105 40, 105 70, 82 72 Z" fill="#E2E7ED" {...strokeProps} />
            <path d="M 32 52 C 22 52, 22 66, 32 66" {...strokeProps} />
            <path d="M 88 52 C 98 52, 98 66, 88 66" {...strokeProps} />
            <circle cx="60" cy="60" r="30" fill="#E2E7ED" {...strokeProps} />
            <path d="M 60 56 C 60 78, 48 80, 48 72 C 48 66, 56 66, 56 56" fill="#E2E7ED" {...strokeProps} />
            <line x1="53" y1="60" x2="57" y2="59" {...strokeProps} />
            <line x1="51" y1="65" x2="55" y2="64" {...strokeProps} />
            <circle cx="48" cy="46" r="2" fill="#1A1A1A" />
            <circle cx="72" cy="46" r="2" fill="#1A1A1A" />
            <path d="M 35 102 C 30 112, 45 112, 40 102" fill="#E2E7ED" {...strokeProps} />
            <path d="M 85 102 C 90 112, 75 112, 80 102" fill="#E2E7ED" {...strokeProps} />
          </g>
        );
      case 'owl':
        return (
          <g fill="none">
            <path d="M 40 34 L 32 24" {...strokeProps} />
            <path d="M 80 34 L 88 24" {...strokeProps} />
            <circle cx="60" cy="56" r="28" fill="#FFF" {...strokeProps} />
            <path d="M 60 46 C 52 34, 38 34, 38 52 Q 38 72, 60 76 Q 82 72, 82 52 C 82 34, 68 34, 60 46 Z" fill="#FFF" {...strokeProps} />
            <circle cx="48" cy="48" r="2.5" fill="#1A1A1A" />
            <circle cx="72" cy="48" r="2.5" fill="#1A1A1A" />
            <polygon points="60,52 56,62 64,62" fill="#FFA500" {...strokeProps} />
            <path d="M 52 80 Q 60 83, 68 80" {...strokeProps} />
            <path d="M 54 86 Q 60 89, 66 86" {...strokeProps} />
            <path d="M 28 92 C 26 98, 36 102, 32 92" {...strokeProps} />
            <path d="M 92 92 C 94 98, 84 102, 88 92" {...strokeProps} />
          </g>
        );
      case 'rabbit':
        return (
          <g fill="none">
            <path d="M 48 38 C 45 10, 58 10, 56 38 Z" fill="#FFF" {...strokeProps} />
            <path d="M 72 38 C 75 10, 62 10, 64 38 Z" fill="#FFF" {...strokeProps} />
            <circle cx="60" cy="62" r="28" fill="#FFF" {...strokeProps} />
            <circle cx="50" cy="52" r="2" fill="#1A1A1A" />
            <circle cx="70" cy="52" r="2" fill="#1A1A1A" />
            <line x1="38" y1="62" x2="28" y2="60" {...strokeProps} />
            <line x1="38" y1="66" x2="28" y2="67" {...strokeProps} />
            <line x1="82" y1="62" x2="92" y2="60" {...strokeProps} />
            <line x1="82" y1="66" x2="92" y2="67" {...strokeProps} />
            <path d="M 57 62 L 63 62 M 60 62 L 60 68 Q 60 70, 56 72 M 60 70 Q 60 72, 64 72" {...strokeProps} />
            <path d="M 35 102 C 32 108, 48 108, 42 102" fill="#FFF" {...strokeProps} />
            <path d="M 85 102 C 88 108, 72 108, 78 102" fill="#FFF" {...strokeProps} />
          </g>
        );
      case 'bear':
        return (
          <g fill="none">
            <circle cx="40" cy="38" r="8" fill="#F7DFD6" {...strokeProps} />
            <circle cx="80" cy="38" r="8" fill="#F7DFD6" {...strokeProps} />
            <circle cx="60" cy="62" r="30" fill="#F7DFD6" {...strokeProps} />
            <circle cx="48" cy="50" r="2" fill="#1A1A1A" />
            <circle cx="72" cy="50" r="2" fill="#1A1A1A" />
            <ellipse cx="60" cy="64" rx="8" ry="6" fill="#FFF" {...strokeProps} />
            <polygon points="60,61 57,64 63,64" fill="#1A1A1A" {...strokeProps} />
            <line x1="60" y1="64" x2="60" y2="68" {...strokeProps} />
            <line x1="56" y1="40" x2="56" y2="44" {...strokeProps} />
            <line x1="60" y1="40" x2="60" y2="44" {...strokeProps} />
            <line x1="64" y1="40" x2="64" y2="44" {...strokeProps} />
            <path d="M 32 100 Q 25 108, 38 112" fill="#F7DFD6" {...strokeProps} />
            <path d="M 88 100 Q 95 108, 82 112" fill="#F7DFD6" {...strokeProps} />
          </g>
        );
      case 'frog':
        return (
          <g fill="none">
            <circle cx="45" cy="40" r="10" fill="#E8F8F2" {...strokeProps} />
            <circle cx="75" cy="40" r="10" fill="#E8F8F2" {...strokeProps} />
            <circle cx="45" cy="40" r="3" fill="#1A1A1A" />
            <circle cx="75" cy="40" r="3" fill="#1A1A1A" />
            <ellipse cx="60" cy="65" rx="34" ry="24" fill="#E8F8F2" {...strokeProps} />
            <path d="M 40 66 Q 60 84, 80 66" {...strokeProps} />
            <path d="M 62 73 Q 66 78, 62 82 Q 58 78, 62 73" fill="#1A1A1A" />
            <path d="M 24 100 Q 28 108, 22 106 M 24 100 Q 32 108, 30 100" fill="#E8F8F2" {...strokeProps} />
            <path d="M 96 100 Q 92 108, 98 106 M 96 100 Q 88 108, 90 100" fill="#E8F8F2" {...strokeProps} />
          </g>
        );
      case 'tiger':
        return (
          <g fill="none">
            <circle cx="42" cy="40" r="8" fill="#FFE8DF" {...strokeProps} />
            <circle cx="78" cy="40" r="8" fill="#FFE8DF" {...strokeProps} />
            <circle cx="60" cy="62" r="30" fill="#FFE8DF" {...strokeProps} />
            <circle cx="48" cy="50" r="2" fill="#1A1A1A" />
            <circle cx="72" cy="50" r="2" fill="#1A1A1A" />
            <polygon points="60,56 56,60 64,60" fill="#1A1A1A" {...strokeProps} />
            <path d="M 60 60 Q 56 66, 52 64 M 60 60 Q 64 66, 68 64" {...strokeProps} />
            <path d="M 60 32 L 60 40 M 55 34 L 57 38 M 65 34 L 63 38" {...strokeProps} />
            <path d="M 30 62 L 38 62 M 30 66 L 36 66" {...strokeProps} />
            <path d="M 90 62 L 82 62 M 90 66 L 84 66" {...strokeProps} />
            <path d="M 32 100 Q 25 108, 38 112" fill="#FFE8DF" {...strokeProps} />
            <path d="M 88 100 Q 95 108, 82 112" fill="#FFE8DF" {...strokeProps} />
          </g>
        );
      case 'penguin':
        return (
          <g fill="none">
            <path d="M 34 50 C 34 25, 86 25, 86 50 C 86 75, 34 75, 34 50 Z" fill="#2C2E35" {...strokeProps} />
            <path d="M 40 54 C 40 38, 60 42, 60 48 C 60 42, 80 38, 80 54 C 80 72, 40 72, 40 54 Z" fill="#FFFFFF" {...strokeProps} />
            <circle cx="50" cy="50" r="2.5" fill="#1A1A1A" />
            <circle cx="70" cy="50" r="2.5" fill="#1A1A1A" />
            <polygon points="60,54 54,60 66,60" fill="#FFA500" {...strokeProps} />
            <path d="M 28 80 Q 22 92, 28 98" fill="#2C2E35" {...strokeProps} />
            <path d="M 92 80 Q 98 92, 92 98" fill="#2C2E35" {...strokeProps} />
          </g>
        );
      case 'fox':
        return (
          <g fill="none">
            <path d="M 60 38 Q 48 38, 30 12 C 30 12, 34 32, 26 66 C 20 80, 48 86, 60 86 C 72 86, 100 80, 94 66 C 86 32, 90 12, 90 12 Q 72 38, 60 38 Z" fill="#E75A36" {...strokeProps} />
            <path d="M 32 18 L 34 40 Q 42 36, 46 27 Z" fill="#FFFFFF" {...strokeProps} />
            <line x1="39" y1="22" x2="43" y2="30" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
            <path d="M 88 18 L 86 40 Q 78 36, 74 27 Z" fill="#FFFFFF" {...strokeProps} />
            <line x1="81" y1="22" x2="77" y2="30" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
            <path d="M 26 66 C 30 76, 44 80, 50 74 C 42 74, 32 68, 26 66 Z" fill="#FFFFFF" {...strokeProps} />
            <path d="M 94 66 C 90 76, 76 80, 70 74 C 78 74, 88 68, 94 66 Z" fill="#FFFFFF" {...strokeProps} />
            <path d="M 52 78 Q 60 88, 68 78" fill="#FFFFFF" {...strokeProps} />
            <path d="M 48 72 C 48 83, 60 83, 60 72 C 60 83, 72 83, 72 72" fill="#E75A36" {...strokeProps} />
            <path d="M 56 68 Q 60 65, 64 68 Q 60 73, 56 68 Z" fill="#1A1A1A" {...strokeProps} />
            <circle cx="45" cy="54" r="2.5" fill="#1A1A1A" />
            <circle cx="75" cy="54" r="2.5" fill="#1A1A1A" />
            <path d="M 40 48 Q 45 45, 50 48" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 70 48 Q 75 45, 80 48" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 35 102 C 32 108, 48 108, 42 102" fill="#FFFFFF" {...strokeProps} />
            <path d="M 85 102 C 88 108, 72 108, 78 102" fill="#FFFFFF" {...strokeProps} />
          </g>
        );
      case 'zebra':
        return (
          <g fill="none">
            <path d="M 44 38 Q 40 20, 48 24 Q 56 20, 52 38" fill="#FFFFFF" {...strokeProps} />
            <path d="M 76 38 Q 80 20, 72 24 Q 64 20, 68 38" fill="#FFFFFF" {...strokeProps} />
            <circle cx="60" cy="62" r="28" fill="#FFFFFF" {...strokeProps} />
            <ellipse cx="60" cy="74" rx="10" ry="7" fill="#3D3D3D" {...strokeProps} />
            <circle cx="56" cy="73" r="1.5" fill="#1A1A1A" />
            <circle cx="64" cy="73" r="1.5" fill="#1A1A1A" />
            <path d="M 56 77 Q 60 79, 64 77" {...strokeProps} />
            <circle cx="48" cy="50" r="2" fill="#1A1A1A" />
            <circle cx="72" cy="50" r="2" fill="#1A1A1A" />
            <path d="M 60 34 L 60 44 M 55 35 L 57 41 M 65 35 L 63 41" {...strokeProps} />
            <path d="M 32 54 L 42 54 M 32 60 L 44 60 M 32 66 L 42 66" {...strokeProps} />
            <path d="M 88 54 L 78 54 M 88 60 L 76 60 M 88 66 L 78 66" {...strokeProps} />
            <path d="M 32 100 Q 25 108, 38 112" fill="#1A1A1A" {...strokeProps} />
            <path d="M 88 100 Q 95 108, 82 112" fill="#1A1A1A" {...strokeProps} />
          </g>
        );
      case 'sheep':
        return (
          <g fill="none">
            <path d="M 32 50 Q 22 46, 28 58" {...strokeProps} />
            <path d="M 88 50 Q 98 46, 92 58" {...strokeProps} />
            <circle cx="60" cy="62" r="25" fill="#FFF" {...strokeProps} />
            <path d="M 44 44 C 40 38, 52 32, 60 36 C 68 32, 80 38, 76 44 C 82 50, 72 58, 60 54 C 48 58, 38 50, 44 44 Z" fill="#FFF" {...strokeProps} />
            <circle cx="50" cy="52" r="2" fill="#1A1A1A" />
            <circle cx="70" cy="52" r="2" fill="#1A1A1A" />
            <path d="M 58 62 L 62 62 M 60 62 L 60 68 L 57 71 M 60 68 L 63 71" {...strokeProps} />
            <path d="M 28 102 C 26 108, 36 108, 32 102" fill="#FFF" {...strokeProps} />
            <path d="M 92 102 C 94 108, 84 108, 88 102" fill="#FFF" {...strokeProps} />
          </g>
        );
      case 'giraffe':
        return (
          <g fill="none">
            <path d="M 54 26 L 54 18 M 54 18 L 52 16 M 54 18 L 56 16" {...strokeProps} />
            <path d="M 66 26 L 66 18 M 66 18 L 64 16 M 66 18 L 68 16" {...strokeProps} />
            <path d="M 42 28 Q 32 26, 44 34" {...strokeProps} />
            <path d="M 78 28 Q 88 26, 76 34" {...strokeProps} />
            <rect x="52" y="60" width="16" height="30" fill="#FFF3CD" {...strokeProps} />
            <path d="M 44 45 C 44 32, 76 32, 76 45 C 76 56, 44 56, 44 45 Z" fill="#FFF3CD" {...strokeProps} />
            <rect x="55" y="66" width="5" height="5" rx="1.5" fill="#B38600" {...strokeProps} />
            <rect x="58" y="76" width="6" height="6" rx="2" fill="#B38600" {...strokeProps} />
            <rect x="68" y="44" width="4" height="4" rx="1" fill="#B38600" {...strokeProps} />
            <circle cx="50" cy="40" r="2.5" fill="#1A1A1A" />
            <circle cx="70" cy="40" r="2.5" fill="#1A1A1A" />
            <path d="M 44 48 C 44 58, 76 58, 76 48 Z" fill="#EBD17D" {...strokeProps} />
            <line x1="56" y1="52" x2="64" y2="52" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
            <path d="M 32 102 H 42 M 88 102 H 78" stroke="#1A1A1A" strokeWidth="3" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg viewBox="0 0 120 120" className={`${className} rounded-full overflow-hidden select-none`} xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="58" fill={config.bg} {...strokeProps} />
      {renderAnimal()}
    </svg>
  );
};

export const AvatarCreator: React.FC<{ onSave: (config: AvatarConfig) => void; initialConfig?: AvatarConfig }> = ({ onSave, initialConfig }) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || {
    animal: 'pig',
    bg: '#FF57B2'
  });

  const randomize = () => {
    const randomPreset = ANIMAL_PRESETS[Math.floor(Math.random() * ANIMAL_PRESETS.length)];
    setConfig({
      animal: randomPreset.id as any,
      bg: randomPreset.bg
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#EDEBE7] dark:border-gray-800 p-6 shadow-sm max-w-xl mx-auto flex flex-col md:flex-row gap-8 items-center">
      <div className="flex flex-col items-center gap-4">
        <Avatar config={config} className="w-48 h-48 md:w-56 md:h-56" />

        <div className="flex gap-2">
          <button
            onClick={randomize}
            className="px-4 py-2 border border-[#EDEBE7] dark:border-gray-800 text-[#2B2B2B] dark:text-gray-100 rounded-full hover:bg-[#FAF8F5] dark:hover:bg-gray-800 transition text-xs font-bold"
          >
            🎲 Randomize
          </button>
          <button
            onClick={() => onSave(config)}
            className="px-6 py-2 bg-[#7A9E85] dark:bg-amber-500 text-[#2B2B2B] dark:text-gray-100 rounded-full hover:bg-[#6B9080] transition text-xs font-bold shadow-sm"
          >
            Save Character
          </button>
        </div>
      </div>

      <div className="flex-1 w-full space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-[#2B2B2B]/60 dark:text-gray-400 font-bold block mb-3">Select Animal Base</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {ANIMAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setConfig({ animal: preset.id as any, bg: preset.bg })}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition ${
                  config.animal === preset.id
                    ? 'border-[#7A9E85] dark:border-amber-400 bg-[#7A9E85]/5 dark:bg-amber-500/10'
                    : 'border-[#EDEBE7] dark:border-gray-800 hover:bg-[#EDEBE7] dark:hover:bg-gray-700 bg-white dark:bg-gray-900'
                }`}
              >
                <span className="text-3xl mb-1.5 select-none">{preset.icon}</span>
                <span className="text-[10px] font-bold text-[#2B2B2B] dark:text-gray-100">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-[#2B2B2B]/60 dark:text-gray-400 font-bold block mb-2">Background Color</label>
          <div className="flex gap-2 flex-wrap">
            {ANIMAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setConfig(c => ({ ...c, bg: preset.bg }))}
                style={{ backgroundColor: preset.bg }}
                className={`w-7 h-7 rounded-full border-2 ${config.bg === preset.bg ? 'border-white ring-2 ring-[#2B2B2B] dark:ring-gray-100 scale-105' : 'border-transparent'}`}
                title={preset.name + ' Color'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
