import { ClassItem, Criteria } from '../types';

export const BONUS_CRITERIA: Criteria[] = [
  { icon: '🙋‍♂️', label: 'Phát biểu đúng', pts: 1 },
  { icon: '🌟', label: 'Ý tưởng sáng tạo', pts: 2 },
  { icon: '🏆', label: 'Làm bài xuất sắc', pts: 3 },
  { icon: '🤝', label: 'Giúp đỡ bạn bè', pts: 1 },
  { icon: '🎯', label: 'Lên bảng giải bài', pts: 2 },
  { icon: '🧹', label: 'Trực nhật tốt', pts: 1 },
];

export const PENALTY_CRITERIA: Criteria[] = [
  { icon: '⏰', label: 'Đi muộn', pts: -1 },
  { icon: '📢', label: 'Mất trật tự', pts: -1 },
  { icon: '📝', label: 'Quên bài tập', pts: -2 },
  { icon: '📱', label: 'Làm việc riêng', pts: -1 },
];

export const WHEEL_COLORS: string[] = [
  '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ec4899', '#3b82f6', '#14b8a6', '#84cc16', '#e11d48'
];

export const MASCOT_MESSAGES: string[] = [
  'Chào Thầy/Cô và các bạn học sinh! Điểm danh có mặt hôm nay mỗi bạn được nhận ngay 2 điểm chuyên cần! 🌟',
  'Hôm nay bạn nào đạt đủ 5 điểm trở lên sẽ được tham gia Vòng quay may mắn nhận quà nhé! 🎡',
  'Cố gắng phát biểu sôi nổi để vào Top đầu và đạt trên 5 sao nào! 🙋‍♂️',
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
