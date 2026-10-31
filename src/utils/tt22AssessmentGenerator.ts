import { Student } from '../types';
import { getStudentAssessment } from '../constants/classroomData';

export interface TT22Comment {
  studentId: string;
  studentName: string;
  points: number;
  level: 'excellent' | 'active' | 'passed' | 'not_passed';
  levelLabel: string;
  icon: string;
  strength: string;
  limitation: string;
  actionPlan: string;
  fullComment: string; // Dùng cho sổ theo dõi / học bạ (25-45 từ, lược chủ ngữ)
  parentMessage: string; // Dùng cho sổ liên lạc / tin nhắn phụ huynh (50-80 từ)
  wordCount: number;
}

const STRENGTHS_EXCELLENT = [
  'Tiếp thu bài nhanh, tư duy tốt và luôn chủ động phát biểu xây dựng bài.',
  'Nắm vững kiến thức trọng tâm, kỹ năng giải quyết bài tập thành thạo và sáng tạo.',
  'Học tập rất tích cực, hoàn thành xuất sắc các nhiệm vụ và nhiệt tình hỗ trợ bạn bè.',
  'Có tinh thần tự học cao, hăng hái tương tác và thể hiện năng lực nổi bật trong giờ học.',
];

const LIMITATIONS_EXCELLENT = [
  'Cần duy trì đều đặn sự cẩn thận khi trình bày bài.',
  'Chú ý phân bổ thời gian hợp lý hơn khi làm bài.',
  'Phát huy thêm vai trò dẫn dắt nhóm học tập.',
  'Tiếp tục giữ vững phong độ học tập ổn định.',
];

const ACTIONS_EXCELLENT = [
  'Phát huy tinh thần tự chủ để đạt nhiều thành tích cao hơn nữa.',
  'Mở rộng tìm tòi các dạng bài nâng cao để phát triển toàn diện.',
  'Tự tin tham gia các phong trào học tập thử thách của trường, lớp.',
  'Phát huy tốt phẩm chất chăm chỉ và tinh thần trách nhiệm.',
];

const STRENGTHS_ACTIVE = [
  'Có ý thức học tập tốt, chăm chú nghe giảng và tích cực tham gia thảo luận bài.',
  'Chăm chỉ, hoàn thành bài tập đúng hạn và có tiến bộ rõ rệt trong các tiết học.',
  'Thái độ học tập đúng đắn, biết hợp tác với bạn bè và xung phong làm bài.',
  'Nắm được kiến thức cơ bản, có tinh thần cầu tiến và trách nhiệm với bài học.',
];

const LIMITATIONS_ACTIVE = [
  'Thỉnh thoảng còn thiếu tự tin khi giải quyết các câu hỏi vận dụng.',
  'Cần rèn luyện thêm tính cẩn thận trong các bước làm bài và ghi chép.',
  'Đôi lúc còn chưa mạnh dạn chia sẻ ý kiến cá nhân trước lớp.',
  'Cần tập trung cao độ hơn ở nửa sau của tiết học.',
];

const ACTIONS_ACTIVE = [
  'Tích cực xung phong phát biểu nhiều hơn để bứt phá đạt mức xuất sắc.',
  'Tăng cường ôn luyện các bài tập vận dụng để nâng cao kỹ năng.',
  'Chủ động trao đổi với thầy cô khi gặp phần kiến thức chưa rõ.',
  'Tự tin thể hiện bản thân trong các hoạt động học tập nhóm.',
];

const STRENGTHS_PASSED = [
  'Chấp hành tốt nội quy lớp học, có cố gắng hoàn thành các nhiệm vụ cơ bản.',
  'Có tinh thần hợp tác cùng bạn bè, đi học chuyên cần và lễ phép.',
  'Bước đầu nắm được kiến thức nền tảng và biết lắng nghe thầy cô hướng dẫn.',
  'Có nỗ lực trong giờ học, hoàn thành bài tập cơ bản thầy cô giao.',
];

const LIMITATIONS_PASSED = [
  'Còn rụt rè, ít tham gia đóng góp ý kiến xây dựng bài.',
  'Tốc độ làm bài còn chậm, cần củng cố lại phương pháp tự học.',
  'Đôi khi còn mất tập trung, chưa chú ý kỹ lời giảng của thầy cô.',
  'Thỉnh thoảng chưa chuẩn bị bài thật chu đáo trước khi đến lớp.',
];

const ACTIONS_PASSED = [
  'Dành thêm thời gian ôn bài cũ mỗi ngày để nắm chắc kiến thức hơn.',
  'Mạnh dạn đặt câu hỏi và nhờ thầy cô, bạn bè hỗ trợ khi chưa hiểu bài.',
  'Lập thời gian biểu học tập tại nhà và tập trung hơn trong giờ học.',
  'Tích cực giơ tay phát biểu để rèn luyện sự tự tin.',
];

const STRENGTHS_NOT_PASSED = [
  'Đi học đúng giờ, lễ phép với thầy cô và hòa đồng với bạn bè.',
  'Biết tiếp thu và lắng nghe khi thầy cô nhắc nhở, hướng dẫn.',
  'Có ý thức giữ gìn vệ sinh và nề nếp chung của lớp.',
  'Bước đầu làm quen với các yêu cầu và phương pháp học của môn.',
];

const LIMITATIONS_NOT_PASSED = [
  'Khả năng tiếp thu bài còn chậm, chưa nắm vững kiến thức nền tảng.',
  'Chưa tập trung trong giờ học, còn làm việc riêng hoặc thiếu bài tập.',
  'Chưa chủ động trong việc tự học và ôn tập bài ở nhà.',
  'Còn thụ động, chưa tham gia vào các hoạt động học tập chung.',
];

const ACTIONS_NOT_PASSED = [
  'Cần nỗ lực nhiều hơn, ôn tập kiến thức nền và hoàn thành bài đầy đủ.',
  'Chủ động nhờ bạn cùng bàn và thầy cô phụ đạo thêm để theo kịp bài.',
  'Tập trung chú ý nghe giảng, hạn chế làm việc riêng trong giờ.',
  'Gia đình cần sát sao phối hợp cùng giáo viên để đôn đốc việc học ở nhà.',
];

function getHashIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

export const generateTT22Comment = (student: Student, index: number = 0): TT22Comment => {
  const points = student.points || 0;
  const assessment = getStudentAssessment(points);
  const hashKey = `${student.id}_${student.name}_${index}`;
  const idx = getHashIndex(hashKey, 4);

  let strength = '';
  let limitation = '';
  let actionPlan = '';

  const note = (student.lastNote || '').toLowerCase();

  switch (assessment.level) {
    case 'excellent':
      strength = STRENGTHS_EXCELLENT[idx];
      limitation = LIMITATIONS_EXCELLENT[idx];
      actionPlan = ACTIONS_EXCELLENT[idx];
      break;

    case 'active':
      strength = STRENGTHS_ACTIVE[idx];
      if (note.includes('mất trật tự') || note.includes('làm việc riêng')) {
        limitation = 'Đôi lúc còn nói chuyện riêng trong giờ học.';
      } else if (note.includes('quên bài tập')) {
        limitation = 'Thỉnh thoảng còn quên hoàn thành bài tập về nhà.';
      } else {
        limitation = LIMITATIONS_ACTIVE[idx];
      }
      actionPlan = ACTIONS_ACTIVE[idx];
      break;

    case 'passed':
      strength = STRENGTHS_PASSED[idx];
      if (note.includes('mất trật tự') || note.includes('làm việc riêng')) {
        limitation = 'Cần giữ trật tự và tập trung hơn trong giờ học.';
      } else if (note.includes('quên bài tập')) {
        limitation = 'Cần làm bài tập về nhà đầy đủ trước khi đến lớp.';
      } else if (note.includes('đi muộn')) {
        limitation = 'Cần chú ý đi học đúng giờ và nề nếp hơn.';
      } else {
        limitation = LIMITATIONS_PASSED[idx];
      }
      actionPlan = ACTIONS_PASSED[idx];
      break;

    case 'not_passed':
    default:
      strength = STRENGTHS_NOT_PASSED[idx];
      if (note.includes('mất trật tự') || note.includes('làm việc riêng')) {
        limitation = 'Còn hay làm việc riêng, chưa chú ý nghe giảng.';
      } else if (note.includes('quên bài tập')) {
        limitation = 'Thường xuyên chưa hoàn thành bài tập về nhà.';
      } else {
        limitation = LIMITATIONS_NOT_PASSED[idx];
      }
      actionPlan = ACTIONS_NOT_PASSED[idx];
      break;
  }

  // Sổ theo dõi / Học bạ (25-45 từ, ngắn gọn, trang trọng, lược chủ ngữ)
  const fullComment = `${strength} ${limitation} ${actionPlan}`;
  const wordCount = fullComment.trim().split(/\s+/).length;

  // Tin nhắn sổ liên lạc / Zalo phụ huynh (50-80 từ)
  const parentMessage = `Kính gửi phụ huynh em ${student.name} (Mã: ${student.id})! Trong quá trình học tập, em đạt ${points} điểm (${assessment.label}). ${strength} Tuy nhiên, ${limitation.toLowerCase()} Kính mong gia đình cùng phối hợp nhắc nhở để ${actionPlan.toLowerCase()}`;

  return {
    studentId: student.id,
    studentName: student.name,
    points,
    level: assessment.level,
    levelLabel: assessment.label,
    icon: assessment.icon,
    strength,
    limitation,
    actionPlan,
    fullComment,
    parentMessage,
    wordCount,
  };
};

export const generateAllTT22Comments = (students: Student[]): TT22Comment[] => {
  return students.map((s, idx) => generateTT22Comment(s, idx));
};
