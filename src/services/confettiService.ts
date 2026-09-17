import confetti from 'canvas-confetti';

export const triggerConfetti = (): void => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6']
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  } catch {
    // Fallback if canvas confetti fails
  }
};

/**
 * Hiệu ứng mưa bão ngôi sao vàng rực rỡ toàn màn hình
 */
export const triggerGoldStarsCelebration = (): void => {
  try {
    const starColors = ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#ffffff', '#ffd700', '#f97316'];

    // Đợt 1: Bắn từ giữa màn hình bung tỏa ngôi sao vàng
    confetti({
      particleCount: 75,
      spread: 100,
      origin: { y: 0.55 },
      colors: starColors,
      shapes: ['star'],
      scalar: 1.3,
      ticks: 200,
      gravity: 0.85,
    });

    // Đợt 2: Pháo hoa góc trái và phải
    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 70,
        origin: { x: 0.05, y: 0.7 },
        colors: starColors,
        shapes: ['star'],
        scalar: 1.4,
        ticks: 220,
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 70,
        origin: { x: 0.95, y: 0.7 },
        colors: starColors,
        shapes: ['star'],
        scalar: 1.4,
        ticks: 220,
      });
    }, 200);

    // Đợt 3: Mưa sao rơi từ đỉnh
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 90,
        spread: 120,
        origin: { y: 0.1 },
        colors: starColors,
        shapes: ['star'],
        scalar: 1.25,
        gravity: 0.9,
      });
    }, 450);
  } catch {
    // Fallback if canvas confetti fails
  }
};

