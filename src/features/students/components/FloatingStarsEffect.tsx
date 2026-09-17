import React from 'react';

interface FloatingStarsEffectProps {
  pointGain?: number;
  isActive: boolean;
  isMilestoneReached?: boolean;
}

export const FloatingStarsEffect: React.FC<FloatingStarsEffectProps> = ({
  pointGain,
  isActive,
  isMilestoneReached,
}) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-visible flex items-center justify-center">
      {isMilestoneReached ? (
        /* --- 1. Milestone Celebration: Giant Golden Crown 👑 + Radiant Aura Burst --- */
        <>
          {/* Inner Golden Aura Wave Ring */}
          <div className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full border-4 border-amber-400 bg-amber-400/20 backdrop-blur-xs pointer-events-none select-none animate-crownAuraBurst" />

          {/* Outer Golden Aura Wave Ring */}
          <div
            className="absolute top-1/2 left-1/2 w-44 h-44 rounded-full border-2 border-yellow-300 bg-yellow-300/10 pointer-events-none select-none animate-crownAuraBurst"
            style={{ animationDelay: '0.15s' }}
          />

          {/* Giant Golden Crown 👑 in Center */}
          <div className="absolute top-1/2 left-1/2 pointer-events-none select-none animate-giantCrownAscend z-40">
            <span className="text-6xl md:text-7xl block filter drop-shadow-[0_0_30px_rgba(251,191,36,0.95)]">
              👑
            </span>
          </div>

          {/* Left Sparkles & Gold Stars */}
          <span className="absolute top-1/2 left-1/2 text-2xl filter drop-shadow-lg animate-crownSparkleFloatLeft select-none z-30">
            ⭐
          </span>
          <span
            className="absolute top-1/2 left-1/2 text-xl filter drop-shadow-md animate-crownSparkleFloatLeft select-none z-30"
            style={{ animationDelay: '0.12s' }}
          >
            ✨
          </span>
          <span
            className="absolute top-1/2 left-1/2 text-xl filter drop-shadow-md animate-crownSparkleFloatLeft select-none z-30"
            style={{ animationDelay: '0.2s' }}
          >
            💛
          </span>

          {/* Right Sparkles & Gold Stars */}
          <span className="absolute top-1/2 left-1/2 text-2xl filter drop-shadow-lg animate-crownSparkleFloatRight select-none z-30">
            🌟
          </span>
          <span
            className="absolute top-1/2 left-1/2 text-xl filter drop-shadow-md animate-crownSparkleFloatRight select-none z-30"
            style={{ animationDelay: '0.15s' }}
          >
            ✨
          </span>
          <span
            className="absolute top-1/2 left-1/2 text-xl filter drop-shadow-md animate-crownSparkleFloatRight select-none z-30"
            style={{ animationDelay: '0.25s' }}
          >
            💖
          </span>

          {/* Golden Milestone Floating Ribbon Badge */}
          <div className="absolute top-1/2 left-1/2 animate-floatMilestoneGoldenRibbon select-none z-40">
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs border-2 border-white shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
              <span>👑 ĐẠT MỐC 5Đ - ĐỦ ĐK QUAY! 🎉</span>
            </div>
          </div>
        </>
      ) : (
        /* --- 2. Standard Flying Gold Stars Burst --- */
        <>
          {/* Floating Star 1 */}
          <span className="absolute top-1/2 left-1/3 text-2xl filter drop-shadow-md animate-floatStar1 select-none">
            ⭐
          </span>

          {/* Floating Star 2 */}
          <span className="absolute top-1/2 right-1/3 text-xl filter drop-shadow-md animate-floatStar2 select-none">
            ✨
          </span>

          {/* Floating Star 3 */}
          <span className="absolute top-1/2 left-1/2 text-2xl filter drop-shadow-md animate-floatStar3 select-none">
            🌟
          </span>

          {/* Extra Twinkle Star 4 */}
          <span
            className="absolute top-1/2 left-1/4 text-lg filter drop-shadow-md animate-floatStar2 select-none"
            style={{ animationDelay: '0.12s' }}
          >
            ⭐
          </span>

          {/* Extra Twinkle Star 5 */}
          <span
            className="absolute top-1/2 right-1/4 text-lg filter drop-shadow-md animate-floatStar1 select-none"
            style={{ animationDelay: '0.18s' }}
          >
            🌟
          </span>

          {/* Point Gain Floating Badge */}
          {pointGain !== undefined && pointGain > 0 && (
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 animate-floatScoreBadge select-none">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-sm border-2 border-white shadow-xl flex items-center gap-1 transform scale-110">
                <span>+{pointGain}</span>
                <span className="text-base">⭐</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

