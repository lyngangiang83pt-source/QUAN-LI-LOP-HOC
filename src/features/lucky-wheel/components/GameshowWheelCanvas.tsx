import React, { useRef, useEffect } from 'react';
import { Student } from '../../../types';

interface GameshowWheelCanvasProps {
  candidates: Student[];
  rotation: number;
  needleAngle?: number;
  isSpinning: boolean;
  onCenterClick?: () => void;
}

// Bảng màu rực rỡ phong cách Gameshow truyền hình hiện đại
const GAMESHOW_PALETTE = [
  '#f43f5e', // Rose 500
  '#8b5cf6', // Violet 500
  '#06b6d4', // Cyan 500
  '#10b981', // Emerald 500
  '#f59e0b', // Amber 500
  '#ec4899', // Pink 500
  '#3b82f6', // Blue 500
  '#14b8a6', // Teal 500
  '#84cc16', // Lime 500
  '#e11d48', // Rose 600
  '#6366f1', // Indigo 500
  '#d97706', // Amber 600
];

export const GameshowWheelCanvas: React.FC<GameshowWheelCanvasProps> = ({
  candidates = [],
  rotation,
  needleAngle = 0,
  isSpinning,
  onCenterClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 800; // Độ phân giải cao cho màn hình Retina & máy chiếu
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size / 2 - 20; // 380px
    const wheelRadius = outerRadius - 32; // 348px
    const centerRadius = 68; // 68px

    ctx.clearRect(0, 0, size, size);

    // ==========================================
    // 1. VÀNH KIM LOẠI NGOÀI VÀ HỆ THỐNG ĐÈN LED NEON
    // ==========================================
    ctx.save();
    
    // Bóng đổ ngoài của toàn bộ bánh xe
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 12;

    // Vành ngoài kim loại vàng đồng
    const outerBezelGradient = ctx.createLinearGradient(0, 0, size, size);
    outerBezelGradient.addColorStop(0, '#fef08a');
    outerBezelGradient.addColorStop(0.2, '#f59e0b');
    outerBezelGradient.addColorStop(0.5, '#78350f');
    outerBezelGradient.addColorStop(0.8, '#f59e0b');
    outerBezelGradient.addColorStop(1, '#fef08a');

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = outerBezelGradient;
    ctx.fill();
    ctx.restore();

    // Vòng đệm kim loại bên trong
    const innerRimGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      wheelRadius - 5,
      centerX,
      centerY,
      outerRadius - 4
    );
    innerRimGradient.addColorStop(0, '#1e1b4b');
    innerRimGradient.addColorStop(1, '#0f172a');

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius - 6, 0, 2 * Math.PI);
    ctx.fillStyle = innerRimGradient;
    ctx.fill();

    // 24 ĐÈN LED CHẠY VIỀN XOAY QUANH
    const ledCount = 24;
    const ledRadius = outerRadius - 18;
    const timeFactor = isSpinning ? Date.now() / 120 : Date.now() / 600;

    for (let i = 0; i < ledCount; i++) {
      const ledAngle = (i * 2 * Math.PI) / ledCount;
      const lx = centerX + Math.cos(ledAngle) * ledRadius;
      const ly = centerY + Math.sin(ledAngle) * ledRadius;

      const isLightOn = Math.floor(timeFactor + i) % 2 === 0;

      ctx.save();
      ctx.beginPath();
      ctx.arc(lx, ly, 7.5, 0, 2 * Math.PI);

      if (isLightOn) {
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
      }
      ctx.fill();

      // Điểm sáng ở tâm bóng LED
      ctx.beginPath();
      ctx.arc(lx - 1.5, ly - 1.5, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    }

    // ==========================================
    // 2. VẼ CÁC NAN Ô TÊN HỌC SINH (WHEEL SLICES)
    // ==========================================
    if (candidates.length === 0) {
      // Trường hợp chưa có học sinh
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Đang chuẩn bị danh sách học sinh...', centerX, centerY);
      ctx.restore();
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
      const baseColor = GAMESHOW_PALETTE[i % GAMESHOW_PALETTE.length];

      // Nan quạt học sinh
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, wheelRadius, startAngle, endAngle);
      ctx.closePath();

      // Hiệu ứng Gradient chiều sâu cho từng nan quạt
      const sliceGrad = ctx.createRadialGradient(0, 0, centerRadius, 0, 0, wheelRadius);
      sliceGrad.addColorStop(0, '#ffffff');
      sliceGrad.addColorStop(0.18, baseColor);
      sliceGrad.addColorStop(1, baseColor);

      ctx.fillStyle = sliceGrad;
      ctx.fill();

      // Đường viền trắng ngăn cách giữa các ô
      ctx.lineWidth = numSlices > 30 ? 1.5 : 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Chốt kim loại nhỏ ở rìa mép nan quạt
      const pinAngle = startAngle;
      const px = Math.cos(pinAngle) * (wheelRadius - 6);
      const py = Math.sin(pinAngle) * (wheelRadius - 6);

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 3;
      ctx.fill();
      ctx.restore();

      // ==========================================
      // VẼ TÊN HỌC SINH TRÊN TỪNG Ô
      // ==========================================
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';

      // Tự động tính cỡ chữ theo số lượng học sinh trong lớp
      let fontSize = 21;
      if (numSlices > 35) fontSize = 12;
      else if (numSlices > 25) fontSize = 14;
      else if (numSlices > 16) fontSize = 16;
      else if (numSlices > 10) fontSize = 18;

      ctx.font = `900 ${fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const student = candidates[i];
      const name = student.name;
      const maxLength = numSlices > 25 ? 12 : 16;
      const displayName = name.length > maxLength ? name.substring(0, maxLength - 1) + '…' : name;

      // Vẽ tên học sinh cách rìa ngoài 28px
      ctx.fillText(displayName, wheelRadius - 28, 0);

      // Điểm số nhỏ hoặc ngôi sao
      if (numSlices <= 20) {
        ctx.font = `bold ${Math.max(10, fontSize - 4)}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`⭐`, wheelRadius - 12, 0);
      }

      ctx.restore();
    }

    // Viền kim loại tròn bao trong các nan quạt
    ctx.beginPath();
    ctx.arc(0, 0, wheelRadius, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();

    // ==========================================
    // 3. NÚT "QUAY" 3D NỔI BẬT Ở CHÍNH GIỮA (CENTER SPIN HUB)
    // ==========================================
    ctx.save();
    
    // Bóng đổ cho nút giữa
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    // Vành ngoài nút bấm vàng kim
    const centerBezelGrad = ctx.createLinearGradient(
      centerX - centerRadius,
      centerY - centerRadius,
      centerX + centerRadius,
      centerY + centerRadius
    );
    centerBezelGrad.addColorStop(0, '#fef08a');
    centerBezelGrad.addColorStop(0.3, '#f59e0b');
    centerBezelGrad.addColorStop(0.7, '#b45309');
    centerBezelGrad.addColorStop(1, '#fef08a');

    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius + 6, 0, 2 * Math.PI);
    ctx.fillStyle = centerBezelGrad;
    ctx.fill();

    // Mặt nút bấm lõi màu đỏ ruby neon phát sáng
    const centerButtonGrad = ctx.createRadialGradient(
      centerX - 10,
      centerY - 10,
      4,
      centerX,
      centerY,
      centerRadius
    );
    centerButtonGrad.addColorStop(0, '#ff477e');
    centerButtonGrad.addColorStop(0.6, '#e11d48');
    centerButtonGrad.addColorStop(1, '#9f1239');

    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = centerButtonGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Chữ "QUAY" lớn chính giữa
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '900 24px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('QUAY', centerX, centerY - 2);

    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('✦ SPIN ✦', centerX, centerY + 18);

    ctx.restore();

    // ==========================================
    // 4. KIM CHỈ MÀU ĐỎ Ở PHÍA TRÊN (TOP RED NEEDLE)
    // ==========================================
    ctx.save();
    const pointerTopY = centerY - outerRadius - 10;
    const pointerTipY = centerY - wheelRadius + 18;

    // Hiệu ứng nảy kim theo góc needleAngle
    ctx.translate(centerX, pointerTopY);
    ctx.rotate(needleAngle);

    // Bóng đổ kim
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Thân kim hình tam giác vát 3D sắc sảo
    ctx.beginPath();
    ctx.moveTo(0, pointerTipY - pointerTopY); // Mũi kim cắm xuống
    ctx.lineTo(-20, 0); // Góc trái trên
    ctx.lineTo(20, 0); // Góc phải trên
    ctx.closePath();

    const needleGrad = ctx.createLinearGradient(-20, 0, 20, 0);
    needleGrad.addColorStop(0, '#e11d48');
    needleGrad.addColorStop(0.5, '#ff4d6d');
    needleGrad.addColorStop(1, '#9f1239');

    ctx.fillStyle = needleGrad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Khuy chốt kim loại màu vàng ở cuống kim
    ctx.beginPath();
    ctx.arc(0, 4, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
  }, [candidates, rotation, needleAngle, isSpinning]);

  return (
    <div className="relative w-[290px] h-[290px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px] mx-auto my-2 flex items-center justify-center select-none">
      {/* Vành sáng hào quang Neon xung quanh vòng quay */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 blur-xl animate-pulse pointer-events-none" />

      {/* Canvas Bánh xe Gameshow */}
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-full cursor-pointer transition-transform active:scale-[0.99]"
        onClick={onCenterClick}
        title="Nhấn vào vòng quay hoặc nút QUAY để bắt đầu!"
      />
    </div>
  );
};
