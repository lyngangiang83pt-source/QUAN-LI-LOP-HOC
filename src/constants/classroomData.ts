import { ClassItem, Criteria, PrizeItem } from '../types';

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
  return note.includes('(-') || note.includes('vi phạm') || note.includes('phạt') || note.includes('Trừ');
};

export interface AssessmentGrade {
  level: 'excellent' | 'active' | 'passed' | 'not_passed';
  label: string; // 'Xuất sắc' | 'Tích cực' | 'Đạt' | 'Chưa đạt'
  icon: string;
  badgeClass: string;
  pillClass: string;
  desc: string;
  rangeLabel: string;
}

export const getStudentAssessment = (points: number = 0): AssessmentGrade => {
  if (points >= 20) {
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
