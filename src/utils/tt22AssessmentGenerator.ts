import { Student } from '../types';
import { getStudentAssessment } from '../constants/classroomData';

export interface TT22Comment {
  studentId: string;
  studentName: string;
  points: number;
  level: 'excellent' | 'active' | 'passed' | 'not_passed';
  levelLabel: string;
  prefix: string; // 'Xuất sắc:' | 'Tích cực:' | 'Đạt:' | 'Chưa đạt:'
  content: string; // Nội dung theo TT22
  icon: string;
  strength: string;
  limitation: string;
  actionPlan: string;
  fullComment: string; // Đầy đủ 15-20 từ bắt đầu bằng cụm từ đánh giá
  parentMessage: string; // Tin nhắn gửi phụ huynh (Zalo / Sổ liên lạc)
  wordCount: number;
}

export interface CommentTemplate {
  text: string;
  strength: string;
  limitation: string;
  actionPlan: string;
}

// 1. Mức Xuất sắc (≥ 20 điểm): Tiền tố "Xuất sắc:" (2 từ) -> Nội dung từ 13 - 18 từ
const TEMPLATES_EXCELLENT: CommentTemplate[] = [
  {
    text: 'Nắm vững kiến thức, tiếp thu bài nhanh, tích cực phát biểu xây dựng bài và gương mẫu.',
    strength: 'Nắm vững kiến thức, tiếp thu bài nhanh.',
    limitation: 'Tiếp tục giữ vững phong độ học tập.',
    actionPlan: 'Phát huy tính gương mẫu và sáng tạo.',
  },
  {
    text: 'Tư duy nhanh nhẹn, hoàn thành tốt bài tập và luôn chủ động hỗ trợ bạn bè.',
    strength: 'Tư duy nhanh nhẹn, hoàn thành tốt bài tập.',
    limitation: 'Cần cẩn thận hơn khi giải bài tập khó.',
    actionPlan: 'Chủ động giúp đỡ các bạn trong lớp.',
  },
  {
    text: 'Tiếp thu bài rất tốt, hăng hái xây dựng bài, vận dụng kiến thức linh hoạt, sáng tạo.',
    strength: 'Tiếp thu bài rất tốt, hăng hái phát biểu.',
    limitation: 'Chú ý quản lý thời gian làm bài.',
    actionPlan: 'Vận dụng kiến thức linh hoạt và sáng tạo.',
  },
  {
    text: 'Chăm chỉ, gương mẫu, hoàn thành xuất sắc nhiệm vụ và có tinh thần tự học cao.',
    strength: 'Chăm chỉ, hoàn thành xuất sắc nhiệm vụ.',
    limitation: 'Tự tin chia sẻ nhiều hơn trước tập thể.',
    actionPlan: 'Phát huy tinh thần tự học nâng cao.',
  },
  {
    text: 'Nắm chắc trọng tâm bài học, tự tin trình bày và đạt kết quả học tập nổi bật.',
    strength: 'Nắm chắc trọng tâm, tự tin trình bày.',
    limitation: 'Rèn luyện thêm kỹ năng làm việc nhóm.',
    actionPlan: 'Duy trì kết quả học tập xuất sắc.',
  },
  {
    text: 'Học tập hăng say, bài làm sáng tạo, cẩn thận và luôn duy trì thành tích tốt.',
    strength: 'Học tập hăng say, bài làm sáng tạo.',
    limitation: 'Cần chú ý đối chiếu kỹ kết quả bài làm.',
    actionPlan: 'Tiếp tục duy trì thành tích học tập tốt.',
  },
  {
    text: 'Tiếp thu bài nhanh, tự giác cao, tích cực đóng góp nhiều ý kiến hay cho bài học.',
    strength: 'Tiếp thu nhanh, đóng góp nhiều ý kiến hay.',
    limitation: 'Cần kiên nhẫn khi hướng dẫn các bạn.',
    actionPlan: 'Tích cực dẫn dắt phong trào học tập.',
  },
  {
    text: 'Hoàn thành bài tập nhanh chóng, chính xác và nhiệt tình giúp đỡ bạn cùng tiến bộ.',
    strength: 'Làm bài nhanh chóng và chính xác.',
    limitation: 'Cần cẩn thận ở các câu hỏi mở rộng.',
    actionPlan: 'Nhiệt tình giúp bạn cùng tiến bộ.',
  },
];

// 2. Mức Tích cực (15 - 19 điểm): Tiền tố "Tích cực:" (2 từ) -> Nội dung từ 13 - 18 từ
const TEMPLATES_ACTIVE: CommentTemplate[] = [
  {
    text: 'Chăm chú nghe giảng, có tiến bộ rõ rệt trong giờ học và cần tiếp tục phát huy.',
    strength: 'Chăm chú nghe giảng, có tiến bộ rõ rệt.',
    limitation: 'Đôi lúc còn thiếu tự tin khi phát biểu.',
    actionPlan: 'Cần tiếp tục phát huy tinh thần học tập.',
  },
  {
    text: 'Có ý thức học tập tốt, tích cực tham gia hoạt động nhóm và hoàn thành bài tập.',
    strength: 'Ý thức tốt, nhiệt tình tham gia hoạt động nhóm.',
    limitation: 'Cần rèn luyện thêm tính cẩn thận.',
    actionPlan: 'Hoàn thành bài tập nâng cao thường xuyên.',
  },
  {
    text: 'Nắm được kiến thức cơ bản, chăm chỉ làm bài, cần rèn luyện thêm tính cẩn thận.',
    strength: 'Nắm được kiến thức, chăm chỉ làm bài.',
    limitation: 'Cần cẩn thận hơn trong khâu tính toán.',
    actionPlan: 'Rèn thêm kỹ năng làm bài cẩn thận.',
  },
  {
    text: 'Tinh thần học tập chăm chỉ, hăng hái phát biểu, cần tự tin làm các bài nâng cao.',
    strength: 'Chăm chỉ và hăng hái phát biểu xây dựng bài.',
    limitation: 'Còn ngập ngừng ở các bài tập nâng cao.',
    actionPlan: 'Tự tin thử sức với bài toán khó hơn.',
  },
  {
    text: 'Hoàn thành tốt nhiệm vụ được giao, biết hợp tác với bạn bè và có nhiều tiến bộ.',
    strength: 'Hoàn thành nhiệm vụ, hợp tác tốt với bạn.',
    limitation: 'Cần mạnh dạn đóng góp ý kiến riêng.',
    actionPlan: 'Tiếp tục nỗ lực để đạt mức xuất sắc.',
  },
  {
    text: 'Hiểu bài nhanh, có tinh thần cầu tiến, cần tập trung hơn trong suốt giờ học.',
    strength: 'Hiểu bài nhanh, có tinh thần cầu tiến.',
    limitation: 'Đôi khi mất tập trung ở cuối buổi học.',
    actionPlan: 'Tập trung chú ý trong suốt giờ học.',
  },
  {
    text: 'Có thái độ học tập đúng đắn, hăng hái tương tác nhưng cần rèn thêm cách trình bày.',
    strength: 'Thái độ đúng đắn, tương tác tích cực.',
    limitation: 'Cách trình bày bài còn chưa thật gọn gàng.',
    actionPlan: 'Rèn luyện kỹ năng trình bày khoa học hơn.',
  },
  {
    text: 'Chăm chỉ ghi chép, hoàn thành bài tập đúng hạn, cần mạnh dạn chia sẻ ý kiến hơn.',
    strength: 'Ghi chép cẩn thận, nộp bài đúng hạn.',
    limitation: 'Còn rụt rè trước tập thể lớp.',
    actionPlan: 'Mạnh dạn giơ tay phát biểu ý kiến.',
  },
];

// 3. Mức Đạt (10 - 14 điểm): Tiền tố "Đạt:" (1 từ) -> Nội dung từ 14 - 19 từ
const TEMPLATES_PASSED: CommentTemplate[] = [
  {
    text: 'Chấp hành tốt nội quy lớp học, hoàn thành bài tập cơ bản, cần tích cực phát biểu hơn.',
    strength: 'Chấp hành tốt nội quy, hoàn thành bài cơ bản.',
    limitation: 'Còn ít giơ tay phát biểu xây dựng bài.',
    actionPlan: 'Tích cực phát biểu để hiểu sâu bài học.',
  },
  {
    text: 'Bước đầu nắm được kiến thức nền tảng, lễ phép, cần chủ động hơn trong các giờ học.',
    strength: 'Nắm được kiến thức cơ bản, ngoan ngoãn.',
    limitation: 'Còn rụt rè, chưa chủ động tương tác.',
    actionPlan: 'Chủ động hơn trong các hoạt động học tập.',
  },
  {
    text: 'Có nỗ lực trong giờ học, đi học chuyên cần, cần tăng cường ôn bài và làm bài tập.',
    strength: 'Có nỗ lực học tập, đi học chuyên cần.',
    limitation: 'Chưa thường xuyên ôn lại kiến thức cũ.',
    actionPlan: 'Dành thêm thời gian ôn bài tại nhà.',
  },
  {
    text: 'Hoàn thành yêu cầu cơ bản của môn học, cần tập trung nghe giảng và mạnh dạn giơ tay.',
    strength: 'Hoàn thành các yêu cầu cơ bản của môn.',
    limitation: 'Còn thiếu tập trung, ngại phát biểu.',
    actionPlan: 'Tập trung nghe giảng và mạnh dạn giơ tay.',
  },
  {
    text: 'Biết lắng nghe thầy cô nhắc nhở, có tinh thần học tập, cần rèn luyện tốc độ làm bài.',
    strength: 'Biết lắng nghe, có ý thức học hỏi.',
    limitation: 'Tốc độ làm bài còn khá chậm.',
    actionPlan: 'Luyện tập thường xuyên để cải thiện tốc độ.',
  },
  {
    text: 'Có ý thức học tập, hòa đồng với bạn bè, cần chăm chỉ ôn lại kiến thức đã học.',
    strength: 'Có ý thức học tập, hòa đồng với bạn bè.',
    limitation: 'Kiến thức nền chưa thật sự vững chắc.',
    actionPlan: 'Chăm chỉ ôn tập lại các bài học đã qua.',
  },
  {
    text: 'Đi học đúng giờ, nộp bài đầy đủ, cần tập trung hơn và hạn chế mất tập trung.',
    strength: 'Đi học đúng giờ, nộp bài tương đối đủ.',
    limitation: 'Hay bị phân tâm bởi việc xung quanh.',
    actionPlan: 'Giữ tập trung cao độ trong các tiết học.',
  },
  {
    text: 'Nắm được kiến thức trọng tâm, cần chủ động hỏi thầy cô khi gặp bài khó.',
    strength: 'Nắm được các ý chính của bài giảng.',
    limitation: 'Ngại hỏi khi chưa hiểu rõ bài tập.',
    actionPlan: 'Chủ động trao đổi với giáo viên và bạn bè.',
  },
];

// 4. Mức Chưa đạt (< 10 điểm): Tiền tố "Chưa đạt:" (2 từ) -> Nội dung từ 13 - 18 từ
const TEMPLATES_NOT_PASSED: CommentTemplate[] = [
  {
    text: 'Tiếp thu bài còn chậm, chưa tập trung nghe giảng, cần nỗ lực ôn bài và làm bài.',
    strength: 'Lễ phép, biết lắng nghe khi được nhắc nhở.',
    limitation: 'Tiếp thu chậm, chưa tập trung nghe giảng.',
    actionPlan: 'Cần nỗ lực ôn bài và làm bài tập đều đặn.',
  },
  {
    text: 'Còn thụ động trong giờ học, chưa làm đủ bài, cần chăm chỉ và nỗ lực cố gắng.',
    strength: 'Hòa đồng cùng bạn bè trong lớp.',
    limitation: 'Còn thụ động, chưa làm đủ bài tập.',
    actionPlan: 'Chăm chỉ và quyết tâm nỗ lực nhiều hơn.',
  },
  {
    text: 'Còn làm việc riêng trong giờ, cần chú ý nghe giảng và nhờ bạn bè hỗ trợ.',
    strength: 'Có khả năng hiểu bài nếu tập trung.',
    limitation: 'Còn làm việc riêng trong các tiết học.',
    actionPlan: 'Chú ý nghe giảng và nhờ bạn bè giúp đỡ.',
  },
  {
    text: 'Khả năng tiếp thu chưa vững, còn rụt rè, gia đình cần sát sao đôn đốc việc học.',
    strength: 'Chấp hành tương đối tốt nề nếp chung.',
    limitation: 'Tiếp thu chưa vững, còn quá rụt rè.',
    actionPlan: 'Gia đình cần sát sao đôn đốc việc tự học.',
  },
  {
    text: 'Chưa nắm chắc kiến thức cơ bản, cần tập trung học tập và làm bài tập đầy đủ.',
    strength: 'Đi học chuyên cần, lễ phép với thầy cô.',
    limitation: 'Chưa nắm được kiến thức nền tảng.',
    actionPlan: 'Tập trung học tập và hoàn thành đủ bài.',
  },
  {
    text: 'Còn mất trật tự trong giờ, chưa chú ý nghe giảng, cần nghiêm túc chấn chỉnh thái độ.',
    strength: 'Có tinh thần tham gia khi được chỉ định.',
    limitation: 'Còn nói chuyện riêng, mất trật tự.',
    actionPlan: 'Nghiêm túc chấn chỉnh thái độ học tập.',
  },
  {
    text: 'Hay quên bài tập về nhà, cần lập thời gian biểu tự học tại nhà hợp lý hơn.',
    strength: 'Hiểu bài khi được giáo viên kèm cặp.',
    limitation: 'Thường xuyên quên bài tập về nhà.',
    actionPlan: 'Lập thời gian biểu tự học ở nhà nghiêm túc.',
  },
  {
    text: 'Tốc độ tiếp thu còn hạn chế, cần chủ động hỏi thầy cô để kịp thời củng cố.',
    strength: 'Có thái độ tiếp thu khi thầy cô sửa bài.',
    limitation: 'Tốc độ tiếp thu kiến thức còn hạn chế.',
    actionPlan: 'Chủ động hỏi thầy cô để kịp thời củng cố.',
  },
];

function getHashIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

export const getPrefixForLevel = (level: string, uppercase: boolean = false): string => {
  switch (level) {
    case 'excellent':
      return uppercase ? 'XUẤT SẮC:' : 'Xuất sắc:';
    case 'active':
      return uppercase ? 'TÍCH CỰC:' : 'Tích cực:';
    case 'passed':
      return uppercase ? 'ĐẠT:' : 'Đạt:';
    case 'not_passed':
    default:
      return uppercase ? 'CHƯA ĐẠT:' : 'Chưa đạt:';
  }
};

export const generateTT22Comment = (
  student: Student,
  index: number = 0,
  uppercasePrefix: boolean = false
): TT22Comment => {
  const points = student.points || 0;
  const assessment = getStudentAssessment(points);
  const prefix = getPrefixForLevel(assessment.level, uppercasePrefix);
  const note = (student.lastNote || '').toLowerCase();

  let template: CommentTemplate;
  const hashKey = `${student.id}_${student.name}_${index}`;

  // Kiểm tra nếu có ghi chú vi phạm cụ thể để tạo nhận xét trúng đích thực tế
  if (note.includes('mất trật tự') || note.includes('làm việc riêng') || note.includes('nói chuyện')) {
    if (assessment.level === 'active') {
      template = {
        text: 'Hoàn thành bài tập tốt nhưng đôi khi còn nói chuyện riêng, cần tập trung hơn trong giờ.',
        strength: 'Hoàn thành bài tập tốt.',
        limitation: 'Đôi lúc còn làm việc riêng trong giờ.',
        actionPlan: 'Giữ tập trung cao độ trong các tiết học.',
      };
    } else if (assessment.level === 'passed') {
      template = {
        text: 'Nắm được kiến thức cơ bản nhưng còn làm việc riêng, cần chú ý nghe giảng để tiến bộ.',
        strength: 'Nắm được kiến thức cơ bản.',
        limitation: 'Còn làm việc riêng trong giờ học.',
        actionPlan: 'Chú ý nghe giảng để tiến bộ nhanh.',
      };
    } else if (assessment.level === 'not_passed') {
      template = {
        text: 'Còn mất trật tự và làm việc riêng trong giờ, cần nghiêm túc chấn chỉnh thái độ học.',
        strength: 'Có tinh thần hợp tác khi được nhắc nhở.',
        limitation: 'Hay mất trật tự và làm việc riêng.',
        actionPlan: 'Nghiêm túc chấn chỉnh thái độ học tập.',
      };
    } else {
      const idx = getHashIndex(hashKey, TEMPLATES_EXCELLENT.length);
      template = TEMPLATES_EXCELLENT[idx];
    }
  } else if (note.includes('quên bài tập')) {
    if (assessment.level === 'active') {
      template = {
        text: 'Tiếp thu bài nhanh nhưng thỉnh thoảng còn quên bài tập, cần chuẩn bị chu đáo trước lớp.',
        strength: 'Tiếp thu bài nhanh, hiểu bài tốt.',
        limitation: 'Thỉnh thoảng quên bài tập về nhà.',
        actionPlan: 'Chuẩn bị bài chu đáo trước khi đến lớp.',
      };
    } else if (assessment.level === 'passed') {
      template = {
        text: 'Có cố gắng trong giờ học nhưng hay quên bài tập, cần làm bài đầy đủ khi ở nhà.',
        strength: 'Có nỗ lực học tập trên lớp.',
        limitation: 'Còn quên bài tập về nhà.',
        actionPlan: 'Làm bài tập đầy đủ khi ở nhà.',
      };
    } else if (assessment.level === 'not_passed') {
      template = {
        text: 'Thường xuyên chưa hoàn thành bài tập về nhà, cần lập thời gian biểu tự học nghiêm túc.',
        strength: 'Lễ phép với thầy cô và bạn bè.',
        limitation: 'Thường xuyên thiếu bài tập về nhà.',
        actionPlan: 'Lập thời gian biểu tự học ở nhà.',
      };
    } else {
      const idx = getHashIndex(hashKey, TEMPLATES_EXCELLENT.length);
      template = TEMPLATES_EXCELLENT[idx];
    }
  } else if (note.includes('đi muộn')) {
    if (assessment.level === 'not_passed') {
      template = {
        text: 'Thường xuyên đi học muộn, chưa chú ý nghe giảng, cần nghiêm túc đi học đúng giờ hơn.',
        strength: 'Lắng nghe khi được nhắc nhở.',
        limitation: 'Còn đi học muộn và mất tập trung.',
        actionPlan: 'Nghiêm túc đi học đúng giờ.',
      };
    } else {
      template = {
        text: 'Cần chú ý đi học đúng giờ, tập trung nghe giảng và tích cực tham gia xây dựng bài.',
        strength: 'Nắm được các bài tập cơ bản.',
        limitation: 'Thỉnh thoảng còn đi học muộn.',
        actionPlan: 'Đi học đúng giờ và tích cực phát biểu.',
      };
    }
  } else {
    // Chọn ngẫu nhiên từ kho mẫu theo băm (hash)
    switch (assessment.level) {
      case 'excellent': {
        const idx = getHashIndex(hashKey, TEMPLATES_EXCELLENT.length);
        template = TEMPLATES_EXCELLENT[idx];
        break;
      }
      case 'active': {
        const idx = getHashIndex(hashKey, TEMPLATES_ACTIVE.length);
        template = TEMPLATES_ACTIVE[idx];
        break;
      }
      case 'passed': {
        const idx = getHashIndex(hashKey, TEMPLATES_PASSED.length);
        template = TEMPLATES_PASSED[idx];
        break;
      }
      case 'not_passed':
      default: {
        const idx = getHashIndex(hashKey, TEMPLATES_NOT_PASSED.length);
        template = TEMPLATES_NOT_PASSED[idx];
        break;
      }
    }
  }

  // Câu hoàn chỉnh: Bắt đầu bằng cụm từ đánh giá + nội dung (chuẩn 15 - 20 từ)
  const fullComment = `${prefix} ${template.text}`;
  const wordCount = fullComment.trim().split(/\s+/).filter(Boolean).length;

  // Tin nhắn gửi phụ huynh (ngắn gọn, lịch sự, dễ đọc trên Zalo / SMS)
  const parentMessage = `Kính gửi phụ huynh em ${student.name} (Mã: ${student.id})! Điểm tích lũy: ${points}đ. Nhận xét TT22: ${fullComment}`;

  return {
    studentId: student.id,
    studentName: student.name,
    points,
    level: assessment.level,
    levelLabel: assessment.label,
    prefix,
    content: template.text,
    icon: assessment.icon,
    strength: template.strength,
    limitation: template.limitation,
    actionPlan: template.actionPlan,
    fullComment,
    parentMessage,
    wordCount,
  };
};

export const generateAllTT22Comments = (
  students: Student[],
  uppercasePrefix: boolean = false,
  seedOffset: number = 0
): TT22Comment[] => {
  return students.map((s, idx) => generateTT22Comment(s, idx + seedOffset, uppercasePrefix));
};
