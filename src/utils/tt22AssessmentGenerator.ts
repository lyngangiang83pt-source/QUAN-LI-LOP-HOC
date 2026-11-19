import { Student } from '../types';
import { getStudentAssessment, parsePenaltyFromNote } from '../constants/classroomData';

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
  scoreRangeDesc?: string;
  downgradedFromExcellent?: boolean;
  downgraded?: boolean;
  originalLevel?: 'excellent' | 'active' | 'passed' | 'not_passed';
  originalLabel?: string;
  downgradeReason?: string;
  absentCount?: number;
  penaltyPoints?: number;
}

export interface CommentTemplate {
  text: string;
  strength: string;
  limitation: string;
  actionPlan: string;
}

// =========================================================================
// 1. MỨC XUẤT SẮC (≥ 20 điểm): Tiền tố "Xuất sắc:" (2 từ) -> Nội dung 13 - 18 từ
// =========================================================================

// 1.1 Dải điểm ≥ 25 điểm (Xuất sắc vượt trội / Thủ khoa)
const TEMPLATES_EXCELLENT_TOP: CommentTemplate[] = [
  {
    text: 'Tư duy vượt trội, hoàn thành xuất sắc bài tập khó và luôn chủ động giúp bạn.',
    strength: 'Tư duy vượt trội, bài làm rất xuất sắc.',
    limitation: 'Tiếp tục duy trì phong độ dẫn đầu lớp.',
    actionPlan: 'Chủ động thử sức thêm bài tập nâng cao.',
  },
  {
    text: 'Đạt thành tích nổi bật, giải bài sáng tạo, tích cực phát biểu và dẫn đầu phong trào.',
    strength: 'Đạt thành tích nổi bật, làm bài sáng tạo.',
    limitation: 'Hỗ trợ thêm các bạn còn lúng túng.',
    actionPlan: 'Tích cực dẫn dắt phong trào học tập của lớp.',
  },
  {
    text: 'Tiếp thu bài rất nhanh, nắm chắc kiến thức nâng cao, luôn gương mẫu trong học tập.',
    strength: 'Nắm chắc kiến thức, học lực xuất sắc.',
    limitation: 'Rèn luyện thêm kỹ năng thuyết trình trước lớp.',
    actionPlan: 'Phát huy tính tự giác và tinh thần gương mẫu.',
  },
  {
    text: 'Học tập xuất sắc, tư duy nhạy bén, bài làm đạt kết quả cao và rất chăm chỉ.',
    strength: 'Tư duy nhạy bén, điểm tích lũy rất cao.',
    limitation: 'Chú ý cẩn thận khi kiểm tra lại kết quả bài.',
    actionPlan: 'Tiếp tục duy trì thành tích học tập xuất sắc.',
  },
  {
    text: 'Có năng lực học tập vượt trội, tự giác cao, tích cực đóng góp nhiều giải pháp hay.',
    strength: 'Tự giác cao, đóng góp nhiều ý kiến hay.',
    limitation: 'Kiên nhẫn hơn khi trao đổi làm việc nhóm.',
    actionPlan: 'Phát huy tinh thần tự học và tư duy sáng tạo.',
  },
  {
    text: 'Nắm rất vững kiến thức, làm bài nhanh và chính xác, luôn nhiệt tình giúp đỡ bạn.',
    strength: 'Làm bài nhanh chóng, đạt độ chính xác cao.',
    limitation: 'Cần chú ý đối chiếu các câu hỏi mở rộng.',
    actionPlan: 'Nhiệt tình hỗ trợ bạn cùng tiến bộ trong môn học.',
  },
  {
    text: 'Hăng say học tập, sáng tạo trong cách làm bài, hoàn thành xuất sắc mọi nhiệm vụ.',
    strength: 'Học tập hăng say, bài làm sáng tạo.',
    limitation: 'Tiếp tục rèn luyện kỹ năng phân bổ thời gian.',
    actionPlan: 'Phấn đấu duy trì danh hiệu học sinh tiêu biểu.',
  },
  {
    text: 'Kết quả học tập rất ấn tượng, tiếp thu bài sâu sắc và luôn tự giác học tập.',
    strength: 'Kết quả ấn tượng, hiểu bài sâu sắc.',
    limitation: 'Mạnh dạn chia sẻ phương pháp học với tập thể.',
    actionPlan: 'Duy trì kết quả dẫn đầu môn học.',
  },
];

// 1.2 Dải điểm 20 - 24 điểm (Xuất sắc chuẩn)
const TEMPLATES_EXCELLENT_STANDARD: CommentTemplate[] = [
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

// =========================================================================
// 2. MỨC TÍCH CỰC (15 - 19 điểm): Tiền tố "Tích cực:" (2 từ) -> Nội dung 13 - 18 từ
// =========================================================================

// 2.1 Dải điểm 17 - 19 điểm (Tích cực cao / Tiệm cận xuất sắc)
const TEMPLATES_ACTIVE_HIGH: CommentTemplate[] = [
  {
    text: 'Học tập rất tích cực, đạt điểm số cao, tiến bộ vượt bậc và tiếp thu bài nhanh.',
    strength: 'Rất tích cực, điểm số cao.',
    limitation: 'Cần cẩn thận hơn khi giải bài khó.',
    actionPlan: 'Phấn đấu bứt phá lên mức xuất sắc.',
  },
  {
    text: 'Ý thức học tập rất tốt, hăng hái phát biểu, bài làm cẩn thận và hiểu bài sâu.',
    strength: 'Hăng hái phát biểu, hiểu bài sâu.',
    limitation: 'Cần tự tin hơn trước tập thể.',
    actionPlan: 'Tích cực tham gia thảo luận nhóm.',
  },
  {
    text: 'Nắm chắc kiến thức, chăm chỉ làm bài, cần tự tin phát huy ở bài tập khó.',
    strength: 'Nắm chắc kiến thức, rất chăm chỉ.',
    limitation: 'Còn ngập ngừng ở bài nâng cao.',
    actionPlan: 'Mạnh dạn thử sức câu hỏi khó.',
  },
  {
    text: 'Tinh thần tự giác cao, kết quả học tốt, luôn nhiệt tình tham gia hoạt động nhóm.',
    strength: 'Tự giác cao, kết quả học tốt.',
    limitation: 'Cần chú ý tốc độ làm bài.',
    actionPlan: 'Tiếp tục phát huy tinh thần học nhóm.',
  },
  {
    text: 'Hiểu bài nhanh, hoàn thành tốt nhiệm vụ, cần duy trì phong độ để đạt xuất sắc.',
    strength: 'Hiểu bài nhanh, hoàn thành tốt nhiệm vụ.',
    limitation: 'Đôi lúc còn thiếu cẩn thận.',
    actionPlan: 'Rèn luyện tính cẩn thận khi làm bài.',
  },
  {
    text: 'Chăm chỉ học tập, phát biểu xây dựng bài sôi nổi, có nhiều cố gắng đáng khen ngợi.',
    strength: 'Chăm chỉ, phát biểu sôi nổi.',
    limitation: 'Cần ôn tập đều đặn các môn.',
    actionPlan: 'Duy trì phong độ học tập tốt.',
  },
  {
    text: 'Tiếp thu bài tốt, ghi chép cẩn thận, hoàn thành đủ bài tập và có tiến bộ lớn.',
    strength: 'Ghi chép cẩn thận, tiến bộ lớn.',
    limitation: 'Cần mạnh dạn đóng góp ý kiến hơn.',
    actionPlan: 'Tích cực giơ tay xây dựng bài.',
  },
  {
    text: 'Thái độ học tập gương mẫu, chủ động trao đổi bài và đạt kết quả rất khả quan.',
    strength: 'Thái độ gương mẫu, chủ động trao đổi.',
    limitation: 'Cần tập trung tối đa trong giờ học.',
    actionPlan: 'Cố gắng đạt thành tích xuất sắc.',
  },
];

// 2.2 Dải điểm 15 - 16 điểm (Tích cực chuẩn)
const TEMPLATES_ACTIVE_STANDARD: CommentTemplate[] = [
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

// =========================================================================
// 3. MỨC ĐẠT (10 - 14 điểm): Tiền tố "Đạt:" (1 từ) -> Nội dung 14 - 19 từ
// =========================================================================

// 3.1 Dải điểm 12 - 14 điểm (Đạt khá)
const TEMPLATES_PASSED_HIGH: CommentTemplate[] = [
  {
    text: 'Chấp hành tốt nội quy, hoàn thành bài tập cơ bản, cần tích cực phát biểu hơn nữa.',
    strength: 'Chấp hành tốt nội quy, hoàn thành bài cơ bản.',
    limitation: 'Còn ít giơ tay phát biểu xây dựng bài.',
    actionPlan: 'Tích cực phát biểu để hiểu sâu bài học.',
  },
  {
    text: 'Nắm được kiến thức nền tảng, lễ phép, cần chủ động hơn trong các hoạt động học tập.',
    strength: 'Nắm được kiến thức cơ bản, ngoan ngoãn.',
    limitation: 'Còn rụt rè, chưa chủ động tương tác.',
    actionPlan: 'Chủ động hơn trong các hoạt động học tập.',
  },
  {
    text: 'Có nỗ lực trong giờ học, đi học chuyên cần, cần tăng cường ôn bài và rèn luyện.',
    strength: 'Có nỗ lực học tập, đi học chuyên cần.',
    limitation: 'Chưa thường xuyên ôn lại kiến thức cũ.',
    actionPlan: 'Dành thêm thời gian ôn bài tại nhà.',
  },
  {
    text: 'Hoàn thành yêu cầu cơ bản môn học, cần tập trung nghe giảng và mạnh dạn giơ tay.',
    strength: 'Hoàn thành các yêu cầu cơ bản của môn.',
    limitation: 'Còn thiếu tập trung, ngại phát biểu.',
    actionPlan: 'Tập trung nghe giảng và mạnh dạn giơ tay.',
  },
  {
    text: 'Biết lắng nghe thầy cô nhắc nhở, có ý thức học hỏi, cần rèn nâng cao tốc độ.',
    strength: 'Biết lắng nghe, có ý thức học hỏi.',
    limitation: 'Tốc độ làm bài còn khá chậm.',
    actionPlan: 'Luyện tập thường xuyên để cải thiện tốc độ.',
  },
  {
    text: 'Có ý thức học tập, hòa đồng bạn bè, cần chăm chỉ ôn lại kiến thức tại nhà.',
    strength: 'Có ý thức học tập, hòa đồng với bạn bè.',
    limitation: 'Kiến thức nền chưa thật sự vững chắc.',
    actionPlan: 'Chăm chỉ ôn tập lại các bài học đã qua.',
  },
  {
    text: 'Đi học đúng giờ, nộp bài đầy đủ, cần tập trung hơn và hạn chế phân tâm.',
    strength: 'Đi học đúng giờ, nộp bài tương đối đủ.',
    limitation: 'Hay bị phân tâm bởi việc xung quanh.',
    actionPlan: 'Giữ tập trung cao độ trong các tiết học.',
  },
  {
    text: 'Nắm được kiến thức trọng tâm bài học, cần chủ động hỏi thầy cô khi gặp bài khó.',
    strength: 'Nắm được các ý chính của bài giảng.',
    limitation: 'Ngại hỏi khi chưa hiểu rõ bài tập.',
    actionPlan: 'Chủ động trao đổi với giáo viên và bạn bè.',
  },
];

// 3.2 Dải điểm 10 - 11 điểm (Đạt chuẩn)
const TEMPLATES_PASSED_STANDARD: CommentTemplate[] = [
  {
    text: 'Nắm được kiến thức cơ bản mức vừa đủ, cần chăm chỉ làm bài tập để tiến bộ.',
    strength: 'Nắm kiến thức cơ bản mức vừa đủ.',
    limitation: 'Chưa chăm chỉ làm bài tập ở nhà.',
    actionPlan: 'Tăng cường làm bài tập tự luyện.',
  },
  {
    text: 'Có cố gắng hoàn thành bài tập, ngoan ngoãn, cần tập trung nghe giảng và ôn bài cũ.',
    strength: 'Có cố gắng, ngoan ngoãn lễ phép.',
    limitation: 'Chưa chịu khó ôn lại kiến thức cũ.',
    actionPlan: 'Chăm chỉ ôn bài cũ trước giờ học.',
  },
  {
    text: 'Tiếp thu được bài học trên lớp, cần chủ động phát biểu và rèn kỹ năng làm bài.',
    strength: 'Tiếp thu được nội dung trên lớp.',
    limitation: 'Ít khi giơ tay phát biểu ý kiến.',
    actionPlan: 'Tự tin giơ tay xây dựng bài học.',
  },
  {
    text: 'Thực hiện tương đối đủ yêu cầu bài học, cần tự giác làm thêm bài tại nhà.',
    strength: 'Thực hiện tương đối đủ yêu cầu môn.',
    limitation: 'Chưa tự giác làm bài tập nâng cao.',
    actionPlan: 'Tự giác ôn luyện thêm bài tại nhà.',
  },
  {
    text: 'Chấp hành nề nếp lớp học, cần tích cực tham gia xây dựng bài để hiểu bài hơn.',
    strength: 'Chấp hành tốt nề nếp kỷ luật.',
    limitation: 'Còn thụ động trong các tiết học.',
    actionPlan: 'Tích cực tham gia xây dựng bài.',
  },
  {
    text: 'Hiểu được các nội dung bài học cơ bản, cần mạnh dạn hỏi thầy cô khi chưa rõ.',
    strength: 'Hiểu các nội dung nền tảng chính.',
    limitation: 'Còn ngại hỏi thầy cô và bạn bè.',
    actionPlan: 'Mạnh dạn trao đổi khi gặp bài khó.',
  },
  {
    text: 'Đi học chuyên cần, có tinh thần học tập, cần nỗ lực nhiều để vươn lên tích cực.',
    strength: 'Đi học chuyên cần, có tinh thần học.',
    limitation: 'Tốc độ tiếp thu còn khá chậm.',
    actionPlan: 'Quyết tâm nỗ lực nhiều hơn nữa.',
  },
  {
    text: 'Hoàn thành bài tập mức tối thiểu, cần chú ý theo dõi bài giảng để đạt kết quả tốt.',
    strength: 'Hoàn thành bài tập mức cơ bản.',
    limitation: 'Chưa chú ý theo dõi kỹ bài giảng.',
    actionPlan: 'Tập trung lắng nghe thầy cô giảng bài.',
  },
];

// =========================================================================
// 4. MỨC CHƯA ĐẠT (< 10 điểm): Tiền tố "Chưa đạt:" (2 từ) -> Nội dung 13 - 18 từ
// =========================================================================

// 4.1 Dải điểm 6 - 9 điểm (Cần cố gắng)
const TEMPLATES_NOT_PASSED_MID: CommentTemplate[] = [
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
    text: 'Khả năng tiếp thu chưa vững, còn rụt rè, gia đình cần sát sao đôn đốc việc học.',
    strength: 'Chấp hành tương đối tốt nề nếp chung.',
    limitation: 'Tiếp thu chưa vững, còn quá rụt rè.',
    actionPlan: 'Gia đình cần sát sao đôn đốc việc tự học.',
  },
  {
    text: 'Chưa nắm chắc kiến thức cơ bản, cần tập trung học và hoàn thành đủ bài tập.',
    strength: 'Đi học chuyên cần, lễ phép với thầy cô.',
    limitation: 'Chưa nắm được kiến thức nền tảng.',
    actionPlan: 'Tập trung học tập và hoàn thành đủ bài.',
  },
  {
    text: 'Tốc độ tiếp thu còn hạn chế, cần chủ động hỏi thầy cô để kịp thời củng cố.',
    strength: 'Có thái độ tiếp thu khi thầy cô sửa bài.',
    limitation: 'Tốc độ tiếp thu kiến thức còn hạn chế.',
    actionPlan: 'Chủ động hỏi thầy cô để kịp thời củng cố.',
  },
  {
    text: 'Hay quên bài tập về nhà, cần lập thời gian biểu tự học tại nhà nghiêm túc.',
    strength: 'Hiểu bài khi được giáo viên kèm cặp.',
    limitation: 'Thường xuyên quên bài tập về nhà.',
    actionPlan: 'Lập thời gian biểu tự học ở nhà nghiêm túc.',
  },
  {
    text: 'Còn thiếu tập trung trong giờ học, cần nỗ lực nghe giảng để theo kịp các bạn.',
    strength: 'Có cố gắng khi được thầy cô nhắc nhở.',
    limitation: 'Còn mất tập trung trong các tiết học.',
    actionPlan: 'Tập trung chú ý theo dõi bài giảng.',
  },
  {
    text: 'Cần cố gắng nhiều hơn trong học tập, chăm chỉ ôn bài và tích cực phát biểu bài.',
    strength: 'Ngoan ngoãn, hòa đồng với bạn bè.',
    limitation: 'Chưa chịu khó ôn lại bài đã học.',
    actionPlan: 'Chăm chỉ học bài và làm bài tập.',
  },
];

// 4.2 Dải điểm < 6 điểm (Khởi đầu / Cần nỗ lực nhiều, ví dụ mốc 2 điểm)
const TEMPLATES_NOT_PASSED_LOW: CommentTemplate[] = [
  {
    text: 'Chưa tích cực tham gia hoạt động học tập, cần nỗ lực cố gắng nhiều hơn trong giờ.',
    strength: 'Biết lắng nghe khi thầy cô nhắc nhở.',
    limitation: 'Chưa tích cực tham gia bài học.',
    actionPlan: 'Nỗ lực cố gắng nhiều hơn trong giờ học.',
  },
  {
    text: 'Điểm tích lũy còn thấp, cần tập trung nghe giảng và tích cực tham gia bài học.',
    strength: 'Lễ phép với thầy cô và bạn bè.',
    limitation: 'Điểm số tích lũy còn ở mức thấp.',
    actionPlan: 'Tập trung nghe giảng để nâng cao điểm.',
  },
  {
    text: 'Cần chủ động hơn trong học tập, mạnh dạn phát biểu và hoàn thành nhiệm vụ được giao.',
    strength: 'Có ý thức chấp hành nội quy lớp.',
    limitation: 'Còn rụt rè, chưa chủ động học tập.',
    actionPlan: 'Mạnh dạn phát biểu và làm đủ bài tập.',
  },
  {
    text: 'Chưa đạt chuẩn kiến thức, cần nghiêm túc lắng nghe thầy cô hướng dẫn để mau tiến bộ.',
    strength: 'Có tinh thần hợp tác khi được gọi.',
    limitation: 'Chưa nắm được chuẩn kiến thức bài.',
    actionPlan: 'Lắng nghe giáo viên hướng dẫn để tiến bộ.',
  },
  {
    text: 'Cần quyết tâm cao trong học tập, đi học đúng giờ và nỗ lực làm bài nâng điểm.',
    strength: 'Biết nhận lỗi khi chưa làm bài tập.',
    limitation: 'Chưa có quyết tâm cao trong học tập.',
    actionPlan: 'Đi học đúng giờ và nỗ lực học tập.',
  },
  {
    text: 'Khả năng hiểu bài còn chậm, cần nhờ thầy cô và bạn bè kèm cặp để tiến bộ.',
    strength: 'Hòa nhã, biết lắng nghe bạn bè.',
    limitation: 'Tốc độ hiểu bài còn khá chậm.',
    actionPlan: 'Nhờ thầy cô và bạn bè hỗ trợ thêm.',
  },
  {
    text: 'Chưa tập trung trong các tiết học, cần rèn luyện tính tự giác và chăm ôn bài.',
    strength: 'Ngoan ngoãn, lễ phép trong trường lớp.',
    limitation: 'Còn mất tập trung trong giờ học.',
    actionPlan: 'Rèn luyện tính tự giác học tập ở nhà.',
  },
  {
    text: 'Cần thay đổi thái độ học, chú ý nghe giảng và chăm làm bài để tiến bộ hơn.',
    strength: 'Biết tiếp thu khi được giáo viên nhắc.',
    limitation: 'Thái độ học tập chưa thật sự tích cực.',
    actionPlan: 'Chú ý nghe giảng và hoàn thành bài tập.',
  },
];

// =========================================================================
// 5. CÁC MẪU CÂU HẠ BẬC ĐÁNH GIÁ (Vắng ≥ 4 lượt hoặc Kỷ luật ≥ 5đ)
// =========================================================================

// Mẫu câu cho học sinh đạt ≥ 20đ bị hạ xuống Tích cực do vắng ≥ 4 lượt
const TEMPLATES_DOWNGRADED_ABSENT: CommentTemplate[] = [
  {
    text: 'Tiếp thu bài tốt, đạt điểm cao nhưng nghỉ học nhiều, cần đi học chuyên cần hơn.',
    strength: 'Tiếp thu bài tốt, đạt điểm tích lũy cao.',
    limitation: 'Nghỉ học từ 4 lượt trở lên trong đợt học.',
    actionPlan: 'Cần đi học chuyên cần và đều đặn hơn.',
  },
  {
    text: 'Nắm chắc kiến thức, đạt thành tích cao nhưng nghỉ trên ba buổi, cần đi học đều.',
    strength: 'Nắm chắc kiến thức, kết quả học tập tốt.',
    limitation: 'Số buổi nghỉ học từ 4 lượt trở lên.',
    actionPlan: 'Cần sắp xếp đi học đầy đủ các buổi.',
  },
  {
    text: 'Hoàn thành tốt bài tập nhưng nghỉ học nhiều buổi, cần chuyên cần đến lớp hơn.',
    strength: 'Hoàn thành tốt các nhiệm vụ học tập.',
    limitation: 'Thường xuyên vắng mặt trong các tiết học.',
    actionPlan: 'Cố gắng đi học đầy đủ để nắm chắc bài.',
  },
];

// Mẫu câu cho học sinh đạt ≥ 20đ bị hạ xuống Tích cực do bị trừ ≥ 5đ
const TEMPLATES_DOWNGRADED_PENALTY: CommentTemplate[] = [
  {
    text: 'Học tập tốt, đạt điểm cao nhưng bị trừ điểm nề nếp, cần chú ý kỷ luật.',
    strength: 'Năng lực tiếp thu tốt, đạt điểm số cao.',
    limitation: 'Còn vi phạm nội quy, bị trừ từ 5 điểm trở lên.',
    actionPlan: 'Cần chú ý kỷ luật và giữ gìn nề nếp lớp.',
  },
  {
    text: 'Tiếp thu bài nhanh nhưng còn vi phạm kỷ luật, cần nghiêm túc chấp hành nội quy.',
    strength: 'Tiếp thu bài nhanh, làm bài đạt điểm cao.',
    limitation: 'Bị trừ từ 5 điểm trở lên do vi phạm.',
    actionPlan: 'Nghiêm túc chấp hành tốt nội quy lớp học.',
  },
  {
    text: 'Bài làm tốt, đạt kết quả cao nhưng bị trừ nhiều điểm, cần chú ý nề nếp.',
    strength: 'Bài làm tốt, đạt kết quả điểm số cao.',
    limitation: 'Bị trừ nhiều điểm kỷ luật trong giờ học.',
    actionPlan: 'Cần chú ý nề nếp và tập trung học tập.',
  },
];

// Mẫu câu cho học sinh đạt ≥ 20đ bị cả vắng ≥ 4 lượt và bị trừ ≥ 5đ
const TEMPLATES_DOWNGRADED_BOTH: CommentTemplate[] = [
  {
    text: 'Điểm số cao nhưng nghỉ nhiều và vi phạm nội quy, cần nghiêm túc chấn chỉnh.',
    strength: 'Có năng lực học tập, bài làm đạt điểm tốt.',
    limitation: 'Nghỉ từ 4 lượt và bị trừ từ 5 điểm trở lên.',
    actionPlan: 'Nghiêm túc chấn chỉnh chuyên cần và nề nếp.',
  },
];

// Mẫu câu cho học sinh 15 - 19đ (Tích cực) bị hạ xuống Đạt do vắng ≥ 4 lượt
const TEMPLATES_DOWNGRADED_ACTIVE_TO_PASSED_ABSENT: CommentTemplate[] = [
  {
    text: 'Có ý thức học tập tốt nhưng nghỉ học nhiều, cần sắp xếp đi học đều đặn hơn.',
    strength: 'Có ý thức học tập, hiểu bài tương đối tốt.',
    limitation: 'Vắng học từ 4 buổi trở lên trong đợt học.',
    actionPlan: 'Sắp xếp đi học chuyên cần để theo kịp bài.',
  },
  {
    text: 'Tiếp thu bài tương đối nhanh nhưng vắng học nhiều buổi, cần chuyên cần đến lớp.',
    strength: 'Tiếp thu bài tương đối nhanh trên lớp.',
    limitation: 'Số buổi vắng học nhiều (từ 4 lượt trở lên).',
    actionPlan: 'Cố gắng đi học đầy đủ để củng cố kiến thức.',
  },
  {
    text: 'Học tập tích cực nhưng còn nghỉ học nhiều, cần nỗ lực đi học đầy đủ để tiến bộ.',
    strength: 'Hăng hái học tập khi có mặt tại lớp.',
    limitation: 'Nghỉ học từ 4 lượt trở lên ảnh hưởng tiến độ.',
    actionPlan: 'Khắc phục việc vắng học và duy trì chuyên cần.',
  },
];

// Mẫu câu cho học sinh 10 - 14đ (Đạt) bị hạ xuống Chưa đạt do vắng ≥ 4 lượt
const TEMPLATES_DOWNGRADED_PASSED_TO_NOT_PASSED_ABSENT: CommentTemplate[] = [
  {
    text: 'Nắm được kiến thức cơ bản nhưng nghỉ học từ bốn lượt, cần đi học chuyên cần hơn.',
    strength: 'Có tiếp thu khi được giáo viên hướng dẫn.',
    limitation: 'Nghỉ học từ 4 lượt trở lên, hổng kiến thức.',
    actionPlan: 'Nghiêm túc đi học đều và ôn lại bài cũ.',
  },
  {
    text: 'Còn hổng kiến thức do vắng học nhiều buổi, cần đi học đầy đủ và tích cực ôn bài.',
    strength: 'Lễ phép và có tinh thần lắng nghe thầy cô.',
    limitation: 'Vắng học từ 4 lượt làm gián đoạn việc học.',
    actionPlan: 'Đi học chuyên cần và nhờ bạn bè giúp đỡ ôn bài.',
  },
  {
    text: 'Chưa theo kịp bài học do nghỉ nhiều buổi, gia đình cần sát sao đôn đốc việc học.',
    strength: 'Có thái độ tích cực khi được nhắc nhở.',
    limitation: 'Nghỉ học từ 4 lượt trở lên dẫn đến hổng bài.',
    actionPlan: 'Gia đình phối hợp đôn đốc em đi học đầy đủ.',
  },
];

// Mẫu câu cho học sinh dưới 10đ và vắng từ 4 lượt trở lên
const TEMPLATES_NOT_PASSED_ABSENT: CommentTemplate[] = [
  {
    text: 'Vắng học từ bốn lượt trở lên và chưa nắm bài, gia đình cần sát sao đôn đốc.',
    strength: 'Lễ phép với thầy cô và bạn bè trong lớp.',
    limitation: 'Nghỉ học từ 4 buổi và tiếp thu bài chậm.',
    actionPlan: 'Gia đình cần sát sao phối hợp cùng nhà trường.',
  },
];

// =========================================================================
// 6. CÁC MẪU CÂU ĐA DẠNG CHO GHI CHÚ NỀ NẾP (Tránh lặp khuôn)
// =========================================================================

const TEMPLATES_BEHAVIOR_ACTIVE: CommentTemplate[] = [
  {
    text: 'Hoàn thành bài tập tốt nhưng đôi khi còn nói chuyện riêng, cần tập trung hơn trong giờ.',
    strength: 'Hoàn thành bài tập tốt.',
    limitation: 'Đôi lúc còn làm việc riêng trong giờ.',
    actionPlan: 'Giữ tập trung cao độ trong các tiết học.',
  },
  {
    text: 'Tiếp thu bài nhanh nhưng đôi lúc còn làm việc riêng, cần chú ý nghe giảng hơn.',
    strength: 'Tiếp thu bài nhanh, làm bài tốt.',
    limitation: 'Đôi khi còn phân tâm làm việc riêng.',
    actionPlan: 'Tập trung theo dõi bài giảng của thầy cô.',
  },
];

const TEMPLATES_BEHAVIOR_PASSED: CommentTemplate[] = [
  {
    text: 'Nắm được kiến thức cơ bản nhưng còn làm việc riêng, cần chú ý nghe giảng để tiến bộ.',
    strength: 'Nắm được kiến thức cơ bản.',
    limitation: 'Còn làm việc riêng trong giờ học.',
    actionPlan: 'Chú ý nghe giảng để tiến bộ nhanh.',
  },
  {
    text: 'Có nỗ lực học tập nhưng thỉnh thoảng còn nói chuyện, cần nghiêm túc tập trung hơn.',
    strength: 'Có nỗ lực học tập trên lớp.',
    limitation: 'Thỉnh thoảng còn mất trật tự.',
    actionPlan: 'Giữ trật tự và chú ý nghe giảng.',
  },
];

const TEMPLATES_BEHAVIOR_NOT_PASSED: CommentTemplate[] = [
  {
    text: 'Còn mất trật tự và làm việc riêng trong giờ, cần nghiêm túc chấn chỉnh thái độ học.',
    strength: 'Có tinh thần hợp tác khi được nhắc nhở.',
    limitation: 'Hay mất trật tự và làm việc riêng.',
    actionPlan: 'Nghiêm túc chấn chỉnh thái độ học tập.',
  },
  {
    text: 'Chưa tập trung nghe giảng, hay nói chuyện riêng, cần nghiêm túc rèn luyện nề nếp.',
    strength: 'Biết lắng nghe khi thầy cô nhắc nhở.',
    limitation: 'Thường xuyên nói chuyện riêng.',
    actionPlan: 'Rèn luyện tính tự giác và giữ trật tự.',
  },
];

const TEMPLATES_HOMEWORK_ACTIVE: CommentTemplate[] = [
  {
    text: 'Tiếp thu bài nhanh nhưng thỉnh thoảng còn quên bài tập, cần chuẩn bị chu đáo trước lớp.',
    strength: 'Tiếp thu bài nhanh, hiểu bài tốt.',
    limitation: 'Thỉnh thoảng quên bài tập về nhà.',
    actionPlan: 'Chuẩn bị bài chu đáo trước khi đến lớp.',
  },
];

const TEMPLATES_HOMEWORK_PASSED: CommentTemplate[] = [
  {
    text: 'Có cố gắng trong giờ học nhưng hay quên bài tập, cần làm bài đầy đủ khi ở nhà.',
    strength: 'Có nỗ lực học tập trên lớp.',
    limitation: 'Còn quên bài tập về nhà.',
    actionPlan: 'Làm bài tập đầy đủ khi ở nhà.',
  },
];

const TEMPLATES_HOMEWORK_NOT_PASSED: CommentTemplate[] = [
  {
    text: 'Thường xuyên chưa hoàn thành bài tập về nhà, cần lập thời gian biểu tự học nghiêm túc.',
    strength: 'Lễ phép với thầy cô và bạn bè.',
    limitation: 'Thường xuyên thiếu bài tập về nhà.',
    actionPlan: 'Lập thời gian biểu tự học ở nhà.',
  },
];

const TEMPLATES_LATE: CommentTemplate[] = [
  {
    text: 'Cần chú ý đi học đúng giờ, tập trung nghe giảng và tích cực tham gia xây dựng bài.',
    strength: 'Nắm được các bài tập cơ bản.',
    limitation: 'Thỉnh thoảng còn đi học muộn.',
    actionPlan: 'Đi học đúng giờ và tích cực phát biểu.',
  },
  {
    text: 'Thường xuyên đi học muộn, chưa chú ý nghe giảng, cần nghiêm túc đi học đúng giờ hơn.',
    strength: 'Lắng nghe khi được nhắc nhở.',
    limitation: 'Còn đi học muộn và mất tập trung.',
    actionPlan: 'Nghiêm túc đi học đúng giờ.',
  },
];

// Hàm băm tạo chỉ mục phân tán
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

/**
 * Sinh nhận xét TT22 cho 1 học sinh theo đúng dải điểm cụ thể và đặc điểm học tập
 */
export const generateTT22Comment = (
  student: Student,
  index: number = 0,
  uppercasePrefix: boolean = false
): TT22Comment => {
  const points = student.points || 0;
  const assessment = getStudentAssessment(student);
  const prefix = getPrefixForLevel(assessment.level, uppercasePrefix);
  const note = (student.lastNote || '').toLowerCase();

  let template: CommentTemplate;
  const hashKey = `${student.id}_${student.name}_${index}`;
  const absentCount = student.absentCount || 0;
  const penaltyPoints = student.penaltyPoints ?? parsePenaltyFromNote(student.lastNote);
  let scoreRangeDesc = '';

  // 1. Kiểm tra hạ bậc đánh giá do chuyên cần (Vắng >= 4 lượt) hoặc kỷ luật (Bị trừ >= 5đ)
  if (assessment.downgraded) {
    if (assessment.originalLevel === 'excellent') {
      const isAbsent = absentCount >= 4;
      const isPenalty = penaltyPoints >= 5;

      if (isAbsent && isPenalty) {
        const idx = getHashIndex(hashKey, TEMPLATES_DOWNGRADED_BOTH.length);
        template = TEMPLATES_DOWNGRADED_BOTH[idx];
      } else if (isAbsent) {
        const idx = getHashIndex(hashKey, TEMPLATES_DOWNGRADED_ABSENT.length);
        template = TEMPLATES_DOWNGRADED_ABSENT[idx];
      } else {
        const idx = getHashIndex(hashKey, TEMPLATES_DOWNGRADED_PENALTY.length);
        template = TEMPLATES_DOWNGRADED_PENALTY[idx];
      }
      scoreRangeDesc = `≥ 20đ (Hạ Tích cực do ${isAbsent ? `vắng ${absentCount} buổi` : `bị trừ ${penaltyPoints}đ`})`;
    } else if (assessment.originalLevel === 'active') {
      const idx = getHashIndex(hashKey, TEMPLATES_DOWNGRADED_ACTIVE_TO_PASSED_ABSENT.length);
      template = TEMPLATES_DOWNGRADED_ACTIVE_TO_PASSED_ABSENT[idx];
      scoreRangeDesc = `15 - 19đ (Hạ Đạt do vắng ${absentCount} buổi)`;
    } else if (assessment.originalLevel === 'passed') {
      const idx = getHashIndex(hashKey, TEMPLATES_DOWNGRADED_PASSED_TO_NOT_PASSED_ABSENT.length);
      template = TEMPLATES_DOWNGRADED_PASSED_TO_NOT_PASSED_ABSENT[idx];
      scoreRangeDesc = `10 - 14đ (Hạ Chưa đạt do vắng ${absentCount} buổi)`;
    } else {
      const idx = getHashIndex(hashKey, TEMPLATES_NOT_PASSED_ABSENT.length);
      template = TEMPLATES_NOT_PASSED_ABSENT[idx];
      scoreRangeDesc = `< 10đ (Vắng ${absentCount} buổi)`;
    }
  } else if (absentCount >= 4 && assessment.level === 'not_passed') {
    const idx = getHashIndex(hashKey, TEMPLATES_NOT_PASSED_ABSENT.length);
    template = TEMPLATES_NOT_PASSED_ABSENT[idx];
    scoreRangeDesc = `< 10đ (Vắng ${absentCount} buổi)`;
  } else if (note.includes('mất trật tự') || note.includes('làm việc riêng') || note.includes('nói chuyện')) {
    if (assessment.level === 'active') {
      const idx = getHashIndex(hashKey, TEMPLATES_BEHAVIOR_ACTIVE.length);
      template = TEMPLATES_BEHAVIOR_ACTIVE[idx];
      scoreRangeDesc = '15 - 19đ (Lưu ý nề nếp)';
    } else if (assessment.level === 'passed') {
      const idx = getHashIndex(hashKey, TEMPLATES_BEHAVIOR_PASSED.length);
      template = TEMPLATES_BEHAVIOR_PASSED[idx];
      scoreRangeDesc = '10 - 14đ (Lưu ý nề nếp)';
    } else if (assessment.level === 'not_passed') {
      const idx = getHashIndex(hashKey, TEMPLATES_BEHAVIOR_NOT_PASSED.length);
      template = TEMPLATES_BEHAVIOR_NOT_PASSED[idx];
      scoreRangeDesc = '< 10đ (Nhắc nhở nề nếp)';
    } else {
      const idx = getHashIndex(hashKey, TEMPLATES_EXCELLENT_STANDARD.length);
      template = TEMPLATES_EXCELLENT_STANDARD[idx];
      scoreRangeDesc = '≥ 20đ (Xuất sắc)';
    }
  } else if (note.includes('quên bài tập')) {
    if (assessment.level === 'active') {
      const idx = getHashIndex(hashKey, TEMPLATES_HOMEWORK_ACTIVE.length);
      template = TEMPLATES_HOMEWORK_ACTIVE[idx];
      scoreRangeDesc = '15 - 19đ (Lưu ý bài tập)';
    } else if (assessment.level === 'passed') {
      const idx = getHashIndex(hashKey, TEMPLATES_HOMEWORK_PASSED.length);
      template = TEMPLATES_HOMEWORK_PASSED[idx];
      scoreRangeDesc = '10 - 14đ (Lưu ý bài tập)';
    } else if (assessment.level === 'not_passed') {
      const idx = getHashIndex(hashKey, TEMPLATES_HOMEWORK_NOT_PASSED.length);
      template = TEMPLATES_HOMEWORK_NOT_PASSED[idx];
      scoreRangeDesc = '< 10đ (Quên bài tập)';
    } else {
      const idx = getHashIndex(hashKey, TEMPLATES_EXCELLENT_STANDARD.length);
      template = TEMPLATES_EXCELLENT_STANDARD[idx];
      scoreRangeDesc = '≥ 20đ (Xuất sắc)';
    }
  } else if (note.includes('đi muộn')) {
    const idx = getHashIndex(hashKey, TEMPLATES_LATE.length);
    template = TEMPLATES_LATE[idx];
    scoreRangeDesc = 'Nhắc nhở đi học đúng giờ';
  } else {
    // 2. PHÂN HÓA LỜI NHẬN XÉT THEO ĐÚNG DẢI ĐIỂM SỐ CỤ THỂ
    if (points >= 25) {
      // Dải điểm: ≥ 25 điểm (Xuất sắc vượt trội / Thủ khoa)
      const idx = getHashIndex(hashKey, TEMPLATES_EXCELLENT_TOP.length);
      template = TEMPLATES_EXCELLENT_TOP[idx];
      scoreRangeDesc = '≥ 25đ (Xuất sắc vượt trội)';
    } else if (points >= 20) {
      // Dải điểm: 20 - 24 điểm (Xuất sắc chuẩn)
      const idx = getHashIndex(hashKey, TEMPLATES_EXCELLENT_STANDARD.length);
      template = TEMPLATES_EXCELLENT_STANDARD[idx];
      scoreRangeDesc = '20 - 24đ (Xuất sắc)';
    } else if (points >= 17) {
      // Dải điểm: 17 - 19 điểm (Tích cực cao / Tiệm cận xuất sắc)
      const idx = getHashIndex(hashKey, TEMPLATES_ACTIVE_HIGH.length);
      template = TEMPLATES_ACTIVE_HIGH[idx];
      scoreRangeDesc = '17 - 19đ (Tích cực cao)';
    } else if (points >= 15) {
      // Dải điểm: 15 - 16 điểm (Tích cực chuẩn)
      const idx = getHashIndex(hashKey, TEMPLATES_ACTIVE_STANDARD.length);
      template = TEMPLATES_ACTIVE_STANDARD[idx];
      scoreRangeDesc = '15 - 16đ (Tích cực)';
    } else if (points >= 12) {
      // Dải điểm: 12 - 14 điểm (Đạt khá)
      const idx = getHashIndex(hashKey, TEMPLATES_PASSED_HIGH.length);
      template = TEMPLATES_PASSED_HIGH[idx];
      scoreRangeDesc = '12 - 14đ (Đạt khá)';
    } else if (points >= 10) {
      // Dải điểm: 10 - 11 điểm (Đạt chuẩn)
      const idx = getHashIndex(hashKey, TEMPLATES_PASSED_STANDARD.length);
      template = TEMPLATES_PASSED_STANDARD[idx];
      scoreRangeDesc = '10 - 11đ (Đạt chuẩn)';
    } else if (points >= 6) {
      // Dải điểm: 6 - 9 điểm (Chưa đạt - Cần cố gắng)
      const idx = getHashIndex(hashKey, TEMPLATES_NOT_PASSED_MID.length);
      template = TEMPLATES_NOT_PASSED_MID[idx];
      scoreRangeDesc = '6 - 9đ (Cần cố gắng)';
    } else {
      // Dải điểm: < 6 điểm (Chưa đạt - Khởi đầu / Cần nỗ lực nhiều)
      const idx = getHashIndex(hashKey, TEMPLATES_NOT_PASSED_LOW.length);
      template = TEMPLATES_NOT_PASSED_LOW[idx];
      scoreRangeDesc = '< 6đ (Cần nỗ lực nhiều)';
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
    scoreRangeDesc,
    downgradedFromExcellent: assessment.downgradedFromExcellent,
    downgraded: assessment.downgraded,
    originalLevel: assessment.originalLevel,
    originalLabel: assessment.originalLabel,
    downgradeReason: assessment.downgradeReason,
    absentCount,
    penaltyPoints,
  };
};

/**
 * Sinh nhận xét cho toàn bộ học sinh trong lớp, đảm bảo:
 * 1. Phân hóa chặt chẽ theo dải điểm số của từng em.
 * 2. Mỗi học sinh trong lớp có câu nhận xét KHÁC NHAU, không bị trùng lặp.
 */
export const generateAllTT22Comments = (
  students: Student[],
  uppercasePrefix: boolean = false,
  seedOffset: number = 0
): TT22Comment[] => {
  const usedContents = new Set<string>();
  const results: TT22Comment[] = [];

  students.forEach((student, index) => {
    let selected: TT22Comment | null = null;

    // Tìm trong kho mẫu câu của dải điểm đó một câu CHƯA BỊ TRÙNG lặp với các bạn khác trong lớp
    for (let attempt = 0; attempt < 30; attempt++) {
      const offset = index + seedOffset + attempt;
      const candidate = generateTT22Comment(student, offset, uppercasePrefix);
      if (!usedContents.has(candidate.content)) {
        selected = candidate;
        break;
      }
    }

    // Nếu lớp quá đông học sinh cùng điểm số dẫn đến dùng hết mẫu, lấy candidate ban đầu
    if (!selected) {
      selected = generateTT22Comment(student, index + seedOffset, uppercasePrefix);
    }

    usedContents.add(selected.content);
    results.push(selected);
  });

  return results;
};
