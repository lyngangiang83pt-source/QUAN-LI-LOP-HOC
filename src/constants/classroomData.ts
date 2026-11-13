import { ClassItem, Criteria, PrizeItem, Student } from '../types';

export const BONUS_CRITERIA: Criteria[] = [
  { icon: '🌱', label: 'Cơ hội sửa sai (Gỡ lỗi)', pts: 2 },
  { icon: '🙋‍♂️', label: 'Phát biểu đúng', pts: 1 },
  { icon: '🌟', label: 'Ý tưởng sáng tạo', pts: 2 },
  { icon: '🏆', label: 'Làm bài xuất sắc', pts: 3 },
  { icon: '🎯', label: 'Lên bảng giải bài', pts: 2 },
  { icon: '🤝', label: 'Giúp đỡ bạn bè', pts: 1 },
  { icon: '🧹', label: 'Trực nhật tốt', pts: 1 },
  { icon: '📦', label: 'Thực hiện Sản phẩm Đạt', pts: 10 },
];

export const hasPenaltyNote = (note?: string): boolean => {
  if (!note) return false;
  return note.includes('(-') || note.includes('vi phạm') || note.includes('phạt') || note.includes('Trừ') || note.includes('bị trừ');
};

export const parsePenaltyFromNote = (note?: string): number => {
  if (!note) return 0;
  const match = note.match(/(?:bị trừ|trừ|phạt|-)\s*(\d+)\s*đ/i);
  return match && match[1] ? parseInt(match[1], 10) : 0;
};

export interface AssessmentGrade {
  level: 'excellent' | 'active' | 'passed' | 'not_passed';
  label: string; // 'Xuất sắc' | 'Tích cực' | 'Đạt' | 'Chưa đạt'
  icon: string;
  badgeClass: string;
  pillClass: string;
  desc: string;
  rangeLabel: string;
  downgradedFromExcellent?: boolean;
  downgradeReason?: string;
}

export const getStudentAssessment = (
  target: number | Student = 0,
  options?: { absentCount?: number; penaltyPoints?: number }
): AssessmentGrade => {
  let points = 0;
  let absentCount = options?.absentCount ?? 0;
  let penaltyPoints = options?.penaltyPoints ?? 0;

  if (typeof target === 'object' && target !== null) {
    points = target.points || 0;
    absentCount = options?.absentCount ?? target.absentCount ?? 0;
    penaltyPoints = options?.penaltyPoints ?? target.penaltyPoints ?? 0;

    // Tự động nhận diện điểm trừ từ ghi chú gần nhất nếu penaltyPoints chưa được đặt
    if (penaltyPoints === 0 && target.lastNote) {
      penaltyPoints = parsePenaltyFromNote(target.lastNote);
    }
  } else {
    points = Number(target) || 0;
  }

  if (points >= 20) {
    const isAbsentDisqualified = absentCount > 3;
    const isPenaltyDisqualified = penaltyPoints >= 5;

    // Quy định: Nghỉ trên 3 lượt hoặc bị trừ từ 5đ trở lên thì KHÔNG nhận xét Xuất sắc mà chuyển thành Tích cực
    if (isAbsentDisqualified || isPenaltyDisqualified) {
      const reasons: string[] = [];
      if (isAbsentDisqualified) reasons.push(`nghỉ ${absentCount} lượt (> 3)`);
      if (isPenaltyDisqualified) reasons.push(`bị trừ ${penaltyPoints}đ (≥ 5đ)`);
      const reasonText = reasons.join(', ');

      return {
        level: 'active',
        label: 'Tích cực',
        icon: '🌟',
        badgeClass: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold border-sky-300 ring-1 ring-sky-300/80 shadow-xs hover:from-sky-400 hover:to-blue-500',
        pillClass: 'bg-sky-100 text-sky-900 border-sky-300',
        desc: `Đạt ${points}đ nhưng ${reasonText} ➔ Chuyển thành Tích cực!`,
        rangeLabel: '≥ 20đ (Tích cực)',
        downgradedFromExcellent: true,
        downgradeReason: `Đạt ${points}đ nhưng ${reasonText}`,
      };
    }

    return {
      level: 'excellent',
      label: 'Xuất sắc',
      icon: '👑',
      badgeClass: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black border-amber-300 ring-1 ring-amber-300/80 shadow-xs hover:from-amber-300 hover:to-yellow-400',
      pillClass: 'bg-amber-100 text-amber-900 border-amber-300',
      desc: 'Từ 20 điểm trở lên - Thành tích Xuất sắc!',
      rangeLabel: '≥ 20đ',
    };
  }
  if (points >= 15) {
    return {
      level: 'active',
      label: 'Tích cực',
      icon: '🌟',
      badgeClass: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold border-sky-300 ring-1 ring-sky-300/80 shadow-xs hover:from-sky-400 hover:to-blue-500',
      pillClass: 'bg-sky-100 text-sky-900 border-sky-300',
      desc: '15 - 19 điểm - Học tập Tích cực!',
      rangeLabel: '15 - 19đ',
    };
  }
  if (points >= 10) {
    return {
      level: 'passed',
      label: 'Đạt',
      icon: '✅',
      badgeClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold border-emerald-300 ring-1 ring-emerald-300/80 shadow-xs hover:from-emerald-400 hover:to-teal-500',
      pillClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      desc: '10 - 14 điểm - Đạt yêu cầu tiết học!',
      rangeLabel: '10 - 14đ',
    };
  }
  return {
    level: 'not_passed',
    label: 'Chưa đạt',
    icon: '⚠️',
    badgeClass: 'bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold border-rose-300 ring-1 ring-rose-300/80 shadow-xs hover:from-rose-400 hover:to-red-500',
    pillClass: 'bg-rose-100 text-rose-900 border-rose-300',
    desc: 'Dưới 10 điểm - Chưa đạt yêu cầu!',
    rangeLabel: '< 10đ',
  };
};

export const ASSESSMENT_RUBRIC = [
  { range: '≥ 20đ', label: 'Xuất sắc', icon: '👑', color: 'text-amber-950 bg-amber-100 border-amber-300' },
  { range: '15 - 19đ', label: 'Tích cực', icon: '🌟', color: 'text-sky-950 bg-sky-100 border-sky-300' },
  { range: '10 - 14đ', label: 'Đạt', icon: '✅', color: 'text-emerald-950 bg-emerald-100 border-emerald-300' },
  { range: '< 10đ', label: 'Chưa đạt', icon: '⚠️', color: 'text-rose-950 bg-rose-100 border-rose-300' },
];

export const PENALTY_CRITERIA: Criteria[] = [
  { icon: '⏰', label: 'Đi muộn', pts: -2 },
  { icon: '📢', label: 'Mất trật tự', pts: -2 },
  { icon: '📝', label: 'Quên bài tập', pts: -2 },
  { icon: '📱', label: 'Làm việc riêng', pts: -2 },
  { icon: '🔇', label: 'Không tập trung', pts: -2 },
  { icon: '🧹', label: 'Chưa trực nhật', pts: -2 },
];

export const DEFAULT_PRIZE_SLICES: PrizeItem[] = [
  { id: 'p1', label: '+1 Điểm', shortLabel: '+1Đ', points: 1, type: 'points', color: '#10b981', icon: '🌟', description: 'Cộng 1 điểm thưởng' },
  { id: 'p2', label: '+2 Điểm', shortLabel: '+2Đ', points: 2, type: 'points', color: '#8b5cf6', icon: '👑', description: 'Cộng 2 điểm xuất sắc' },
  { id: 'p3', label: 'NHẬN QUÀ', shortLabel: 'NHẬN QUÀ', points: 1, type: 'gift', color: '#ec4899', icon: '🎁', description: 'Chúc mừng em nhận được 1 phần quà từ Thầy/Cô!' },
  { id: 'p4', label: 'ĐẠT', shortLabel: 'ĐẠT', points: 1, type: 'pass', color: '#06b6d4', icon: '🎉', description: 'Đạt yêu cầu bài tập (+1đ)' },
  { id: 'p5', label: '0 Điểm', shortLabel: '0Đ', points: 0, type: 'points', color: '#64748b', icon: '🎯', description: 'Giữ nguyên số điểm' },
  { id: 'p6', label: 'MAY MẮN LẦN SAU', shortLabel: 'MAY MẮN', points: 0, type: 'lucky_next', color: '#f43f5e', icon: '☘️', description: 'Chúc bạn may mắn lần sau' },
  { id: 'p7', label: 'NHẬN QUÀ', shortLabel: 'NHẬN QUÀ', points: 1, type: 'gift', color: '#f59e0b', icon: '🎁', description: 'Chúc mừng em nhận được 1 phần quà từ Thầy/Cô!' },
  { id: 'p8', label: '+1 Điểm', shortLabel: '+1Đ', points: 1, type: 'points', color: '#3b82f6', icon: '🌟', description: 'Cộng 1 điểm thưởng' },
];


export const WHEEL_COLORS: string[] = [
  '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ec4899', '#3b82f6', '#14b8a6', '#84cc16', '#e11d48'
];


export const MASCOT_MESSAGES: string[] = [
  'Chào Thầy/Cô và các bạn học sinh! Điểm danh có mặt hôm nay mỗi bạn được nhận ngay 2 điểm chuyên cần! 🌟',
  'Hôm nay bạn nào đạt đủ 20 điểm trở lên sẽ hoàn thành mục tiêu điểm số và nhận thưởng nhé! 🎯',
  'Cố gắng phát biểu sôi nổi để vào Top đầu và đạt trên 20 sao nào! 🙋‍♂️',
  'Học tập chăm chỉ - Đoàn kết giúp đỡ bạn bè cùng tiến bộ nhé! 🤝',
  'Docbuoc.vn đồng hành cùng Thầy/Cô và các bạn trên Hành Trang Số! 🚀'
];

export const DEFAULT_CLASSES: ClassItem[] = [
  {
    id: 'class_6b3',
    name: '6B3',
    subject: 'HĐTN',
    defaultPoints: 2,
    students: [
      { id: 'HS01', name: 'Nguyễn Ngọc Ánh', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS02', name: 'Nguyễn Gia Bảo', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS03', name: 'Phan Thị Ngọc Bích', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS04', name: 'Trương Thị Tường Duy', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS05', name: 'Sơn Thị Thùy Duyên', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS06', name: 'Trần Hướng Dương', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS07', name: 'Võ Trần Khánh Đăng', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS08', name: 'Phạm Thị Ngọc Hà', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS09', name: 'Nguyễn Ngọc Gia Hân', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS10', name: 'Phạm Khả Hân', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS11', name: 'Ngô Hoàng Kim', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS12', name: 'Huỳnh Quang Khải', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS13', name: 'Nguyễn Quốc Khánh', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS14', name: 'Nguyễn Đăng Khoa', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS15', name: 'Hồ Đăng Khôi', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS16', name: 'Trần Nguyễn Đăng Khôi', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS17', name: 'Nguyễn Văn Nam', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS18', name: 'Mai Thị Bảo Ngân', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS19', name: 'Trần Nguyễn Trung Nghĩa', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS20', name: 'Hồ Thị Tuyết Nhi', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS21', name: 'Lê Thị Yến Nhi', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS22', name: 'Trần Thị Huỳnh Như', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS23', name: 'Huỳnh Thịnh Phát', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS24', name: 'Trần Lâm Việt Phát', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS25', name: 'Trương Thị Thanh Phụng', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS26', name: 'Nguyễn Duy Phương', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS27', name: 'Trần Hoàng Quân', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS28', name: 'Huỳnh Trần Nhật Tân', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS29', name: 'Trần Ngô Vĩnh Toàn', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS30', name: 'Võ Hoàng Thái', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS31', name: 'Nguyễn Minh Thắng', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS32', name: 'Nguyễn Thị Lâm Thi', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS33', name: 'Đỗ Thị Bảo Trâm', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS34', name: 'Mai Thị Mỹ Trâm', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS35', name: 'Ngô Thị Ngọc Trâm', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS36', name: 'Mai Thị Lan Vy', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS37', name: 'Trần Tường Vy', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS38', name: 'Trần Thị Mỹ Vy', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' }
    ]
  },
  {
    id: 'class_10a1',
    name: '10A1',
    subject: 'Tin học',
    defaultPoints: 2,
    students: [
      { id: 'HS01', name: 'Nguyễn Văn An', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS02', name: 'Trần Thị Mai', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS03', name: 'Lê Hoàng Nam', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS04', name: 'Phạm Thu Hà', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS05', name: 'Đỗ Minh Quân', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' }
    ]
  },
  {
    id: 'class_10a2',
    name: '10A2',
    subject: 'Tin học',
    defaultPoints: 2,
    students: [
      { id: 'HS01', name: 'Bùi Gia Bảo', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS02', name: 'Vũ Minh Khang', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS03', name: 'Phan Thảo Vy', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS04', name: 'Lý Kiến Quốc', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' },
      { id: 'HS05', name: 'Dương Yến Nhi', attendance: 'present', points: 2, lastNote: 'Có mặt ban đầu (+2đ)' }
    ]
  }
];

export const STUDENT_RESULTS_DRIVE_URL = 'https://drive.google.com/drive/folders/12P6BqxX0BeqLGhFwCeaHMWEu-mcex-ba?usp=drive_link';
