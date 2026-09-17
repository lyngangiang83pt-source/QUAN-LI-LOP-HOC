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
        /* --- 1. Milestone Celebration: Royal Crown 👑 + Red/Pink Hearts ❤️ --- */
        <>
          {/* Floating Crown in Center */}
          <span className="absolute top-1/2 left-1/2 text-4xl filter drop-shadow-xl animate-floatCrown select-none">
            👑
          </span>

          {/* Left Red Heart */}
          <span className="absolute top-1/2 left-1/4 text-2xl filter drop-shadow-lg animate-floatHeartLeft select-none">
            ❤️
          </span>

          {/* Right Sparkling Heart */}
          <span className="absolute top-1/2 right-1/4 text-2xl filter drop-shadow-lg animate-floatHeartRight select-none">
            💖
          </span>

          {/* Extra Heart Left */}
          <span
            className="absolute top-1/2 left-1/6 text-xl filter drop-shadow-md animate-floatHeartLeft select-none"
            style={{ animationDelay: '0.15s' }}
          >
            💕
          </span>

          {/* Extra Heart Right */}
          <span
            className="absolute top-1/2 right-1/6 text-xl filter drop-shadow-md animate-floatHeartRight select-none"
            style={{ animationDelay: '0.12s' }}
          >
            💝
          </span>

          {/* Twinkling Accent Stars */}
          <span className="absolute top-1/3 left-1/3 text-lg filter drop-shadow-sm animate-floatStar1 select-none">
            ✨
          </span>
          <span className="absolute top-1/3 right-1/3 text-lg filter drop-shadow-sm animate-floatStar2 select-none">
            ⭐
          </span>

          {/* Milestone Floating Ribbon Badge */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 animate-floatMilestoneBadge select-none">
            <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs border-2 border-white shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
              <span>👑 ĐỦ ĐK QUAY THƯỞNG! ❤️</span>
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

