import React, { useState } from 'react';

interface LetterReaderProps {
  title?: string;
  content?: string;
  senderName?: string;
  avatar?: string;
  country?: string;
  stampImage?: string;
  sealColor?: string;
  date?: string;
  onClose: () => void;
  onReply?: (friendName: string) => void;
}

export const LetterReader: React.FC<LetterReaderProps> = ({
  title = "First Greeting from Denmark",
  content = "Hej! (This is hello in Danish!) I'm Jens from Copenhagen, Denmark. I'm 24 and I work as a designer.",
  senderName = "Jens",
  avatar = "🧑‍💻",
  country = "Denmark",
  stampImage = "🧜‍♀️",
  sealColor = "bg-red-800",
  date = "Mar 2, 2026",
  onClose,
  onReply
}) => {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-950 flex flex-col p-4 relative">
      {step < 3 && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            className="relative cursor-pointer"
            onClick={() => {
              if (step === 0) setStep(1);
              else if (step === 1) setStep(2);
              else if (step === 2) setStep(3);
            }}
          >
            {/* The Envelope */}
            <div className="w-[320px] h-[220px] md:w-[480px] md:h-[320px] bg-[#dfd6c5] rounded-2xl shadow-xl relative flex items-center justify-center border border-[#EDEBE7] dark:border-gray-800">

              {/* Back Flap (top) */}
              <div
                className="absolute top-0 left-0 right-0 h-[160px] bg-[#c3b69f] origin-top rounded-t-2xl z-20 border-b border-[#2B2B2B]/5"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  transform: step >= 1 ? 'rotateX(180deg)' : 'rotateX(0)',
                  transition: 'transform 0.8s ease-in-out'
                }}
              />

              {/* Back Flap Inner shadow */}
              {step >= 1 && (
                <div
                  className="absolute top-0 left-0 right-0 h-[160px] bg-[#b1a48c] origin-top rounded-t-2xl z-0"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                />
              )}

              {/* Left Flap */}
              <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#d2c7b3] z-10 rounded-l-2xl" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
              {/* Right Flap */}
              <div className="absolute top-0 bottom-0 right-0 w-1/2 bg-[#d2c7b3] z-10 rounded-r-2xl" style={{ clipPath: "polygon(100% 0, 0 50%, 100% 100%)" }} />
              {/* Bottom Flap */}
              <div className="absolute bottom-0 left-0 right-0 h-[110px] md:h-[160px] bg-[#dfd6c5] z-10 rounded-b-2xl" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />

              {/* The Wax Seal */}
              {step === 0 && (
                <div
                  className="absolute z-30 w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-800 shadow-lg flex items-center justify-center text-white border-2 border-[#7A9E85]/30"
                  style={{ boxShadow: "inset 0 0 12px rgba(0,0,0,0.5), 0 6px 8px rgba(0,0,0,0.3)" }}
                >
                  <span className="font-serif text-lg md:text-2xl drop-shadow-md">❤️</span>
                </div>
              )}

              {/* The Letter preview sliding up */}
              <div
                className="absolute z-10 w-[92%] bg-white dark:bg-gray-900 rounded-xl shadow-md border border-[#EDEBE7] dark:border-gray-800 flex flex-col items-center justify-start p-4 overflow-hidden"
                style={{
                  height: step >= 2 ? "120%" : "92%",
                  y: step >= 2 ? -160 : 0,
                  opacity: step >= 1 ? 1 : 0,
                  zIndex: step >= 2 ? 25 : 5,
                  transform: `translateY(${step >= 2 ? -160 : 0}px)`,
                  transition: 'all 1s ease-in-out'
                }}
              >
                <div className="w-full border-b border-[#EDEBE7] dark:border-gray-700 pb-2 mb-2 flex justify-between items-center">
                  <h2 className="font-[family-name:var(--font-letters-serif)] text-xs md:text-sm text-[#2B2B2B] dark:text-gray-100 truncate max-w-[150px]">{title}</h2>
                  <span className="text-xl">{stampImage}</span>
                </div>
                <p className="text-[#2B2B2B]/40 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider text-center mt-8">Click to read</p>
              </div>

            </div>

            <div className="text-center mt-6 space-y-1">
              <p className="text-[#2B2B2B] dark:text-gray-100 font-bold text-sm">Letter from {senderName}</p>
              {step === 0 && <p className="text-[#2B2B2B]/60 dark:text-gray-400 text-xs italic animate-pulse">Click the wax seal to break</p>}
              {step === 1 && <p className="text-[#2B2B2B]/60 dark:text-gray-400 text-xs italic animate-pulse">Click to slide out letter</p>}
              {step === 2 && <p className="text-[#2B2B2B]/60 dark:text-gray-400 text-xs italic animate-pulse">Click to unfold paper</p>}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Full Reading Mode */}
      {step === 3 && (
        <div
          className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-6 md:p-12 relative border border-[#EDEBE7] dark:border-gray-800 flex flex-col min-h-[500px]"
          style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)", backgroundSize: "100% 2rem", lineHeight: "2rem" }}
        >
          {/* Top Stamp on Paper */}
          <div className="absolute top-6 right-6 flex flex-col items-center">
            <div className="w-14 h-16 bg-[#FAF8F5] dark:bg-gray-950 rounded-lg border-2 border-[#EDEBE7] dark:border-gray-700 border-dashed flex items-center justify-center text-3xl select-none filter drop-shadow-sm rotate-3">
              {stampImage}
            </div>
            <span className="text-[9px] text-[#2B2B2B]/40 dark:text-gray-500 mt-1 uppercase font-bold tracking-wider">{country}</span>
          </div>

          <h1 className="text-2xl md:text-3.5xl font-[family-name:var(--font-letters-serif)] font-bold text-[#2B2B2B] dark:text-gray-100 mb-8 border-b border-[#EDEBE7] dark:border-gray-700 pb-4 max-w-[70%]">
            {title}
          </h1>

          <div className="flex-1 whitespace-pre-wrap font-[family-name:var(--font-letters-serif)] text-lg leading-relaxed text-[#2B2B2B]/95 dark:text-gray-200 min-h-[300px] mb-8">
            {content}
          </div>

          {/* Bottom Letter Metadata Profile */}
          <div className="border-t border-[#EDEBE7] dark:border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF8F5] dark:bg-gray-950 flex items-center justify-center text-2xl border border-[#EDEBE7] dark:border-gray-800">
                {avatar}
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#2B2B2B] dark:text-gray-100">{senderName}</h4>
                <p className="text-[10px] text-[#2B2B2B]/50 dark:text-gray-400 uppercase font-bold tracking-wider">{country} &bull; Sent {date}</p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2 border border-[#EDEBE7] dark:border-gray-800 text-[#2B2B2B] dark:text-gray-100 rounded-full hover:bg-[#FAF8F5] dark:hover:bg-gray-800 transition text-xs font-bold"
              >
                Close
              </button>
              {onReply && (
                <button
                  onClick={() => {
                    onReply(senderName);
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial px-6 py-2 bg-[#2B2B2B] text-white rounded-full hover:bg-[#2B2B2B]/95 transition text-xs font-bold shadow-sm"
                >
                  Reply
                </button>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 left-6 text-[#2B2B2B]/50 dark:text-gray-400 hover:text-[#2B2B2B] dark:text-gray-100 transition-colors text-sm font-bold"
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
};
