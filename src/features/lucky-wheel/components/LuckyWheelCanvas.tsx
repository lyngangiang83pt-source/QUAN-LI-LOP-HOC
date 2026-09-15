import React, { useRef, useEffect } from 'react';
import { Student } from '../../../types';
import { WHEEL_COLORS } from '../../../constants/classroomData';

interface LuckyWheelCanvasProps {
  candidates: Student[];
  rotation: number;
}

export const LuckyWheelCanvas: React.FC<LuckyWheelCanvasProps> = ({
  candidates,
  rotation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 16;

    ctx.clearRect(0, 0, width, height);

    if (candidates.length === 0) {
      // Empty wheel placeholder
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Chưa có học sinh đủ điều kiện', centerX, centerY);
      return;
    }

    const numSlices = candidates.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const color = WHEEL_COLORS[i % WHEEL_COLORS.length];

      // Draw Slice
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Border between slices
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Draw Student Name
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      // Dynamic font size
      const fontSize = numSlices > 25 ? 12 : numSlices > 15 ? 14 : 17;
      ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 4;

      const studentName = candidates[i].name;
      const displayName = studentName.length > 16 ? studentName.substring(0, 14) + '...' : studentName;
      ctx.fillText(displayName, radius - 24, 0);
      ctx.restore();
    }

    // Outer Rim
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();

    // Center Gold Pin
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', centerX, centerY);
  }, [candidates, rotation]);

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto my-2 flex items-center justify-center">
      {/* Pointer at Top */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-x-[14px] border-x-transparent border-t-[28px] border-t-rose-600 drop-shadow-md pointer-events-none" />

      {/* Wheel Canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={640}
        className="w-full h-full rounded-full shadow-2xl border-4 border-white/80 bg-white"
      />
    </div>
  );
};
