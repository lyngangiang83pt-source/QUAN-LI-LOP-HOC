import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Student } from '../../../types';
import { 
  TT22Comment, 
  generateAllTT22Comments, 
  generateTT22Comment, 
  getPrefixForLevel 
} from '../../../utils/tt22AssessmentGenerator';
import { ASSESSMENT_RUBRIC, parsePenaltyFromNote } from '../../../constants/classroomData';
import { audioService } from '../../../services/audioService';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Search, 
  RefreshCw, 
  Send, 
  BookOpen, 
  Award,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface TT22AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  initialSelectedStudentId?: string | null;
  onShowToast?: (msg: string, type?: 'success' | 'danger' | 'wheel' | 'rank' | 'info') => void;
  onUpdateStudentStats?: (studentId: string, updates: { absentCount?: number; penaltyPoints?: number }) => void;
}

export const TT22AssessmentModal: React.FC<TT22AssessmentModalProps> = ({
  isOpen,
  onClose,
  students,
  className,
  initialSelectedStudentId,
  onShowToast,
  onUpdateStudentStats,
}) => {
  const [viewMode, setViewMode] = useState<'so_theo_doi' | 'so_lien_lac'>('so_theo_doi');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'excellent' | 'active' | 'passed' | 'not_passed'>('all');
  const [commentsMap, setCommentsMap] = useState<{ [id: string]: TT22Comment }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [uppercasePrefix, setUppercasePrefix] = useState(false);
  const [seedOffset, setSeedOffset] = useState(0);
  const [studentOffsetMap, setStudentOffsetMap] = useState<{ [id: string]: number }>({});
  const [studentStatsMap, setStudentStatsMap] = useState<{ [id: string]: { absentCount: number; penaltyPoints: number } }>({});

  // Khởi tạo lời nhận xét tự động theo TT22 khi mở modal hoặc thay đổi danh sách
  useEffect(() => {
    if (isOpen) {
      const statsMap: { [id: string]: { absentCount: number; penaltyPoints: number } } = {};
      students.forEach((s) => {
        statsMap[s.id] = {
          absentCount: s.absentCount || 0,
          penaltyPoints: s.penaltyPoints ?? parsePenaltyFromNote(s.lastNote),
        };
      });
      setStudentStatsMap(statsMap);

      const all = generateAllTT22Comments(students, uppercasePrefix, 0);
      const map: { [id: string]: TT22Comment } = {};
      all.forEach((c) => {
        map[c.studentId] = c;
      });
      setCommentsMap(map);
      setSearchQuery('');
      setLevelFilter('all');
      setIsCopiedAll(false);
      setCopiedId(null);
      setSeedOffset(0);
      setStudentOffsetMap({});
    }
  }, [isOpen, students]);

  // Cập nhật số lượt nghỉ hoặc điểm bị trừ của học sinh trực tiếp trong modal
  const handleUpdateStudentStats = (studentId: string, deltaAbsent: number, deltaPenalty: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const currentStats = studentStatsMap[studentId] || {
      absentCount: student.absentCount || 0,
      penaltyPoints: student.penaltyPoints ?? parsePenaltyFromNote(student.lastNote),
    };

    const nextAbsent = Math.max(0, currentStats.absentCount + deltaAbsent);
    const nextPenalty = Math.max(0, currentStats.penaltyPoints + deltaPenalty);

    const updatedStats = { absentCount: nextAbsent, penaltyPoints: nextPenalty };
    setStudentStatsMap((prev) => ({ ...prev, [studentId]: updatedStats }));

    // Tái tạo nhận xét với số liệu chuyên cần / kỷ luật mới
    const studentWithStats: Student = {
      ...student,
      absentCount: nextAbsent,
      penaltyPoints: nextPenalty,
    };

    const currentOffset = studentOffsetMap[studentId] || 0;
    const newComment = generateTT22Comment(studentWithStats, currentOffset, uppercasePrefix);
    setCommentsMap((prev) => ({ ...prev, [studentId]: newComment }));

    if (onUpdateStudentStats) {
      onUpdateStudentStats(studentId, updatedStats);
    }

    audioService.play('plus');
    if (onShowToast) {
      if ((student.points || 0) >= 20) {
        if (nextAbsent > 3 || nextPenalty >= 5) {
          const reason = nextAbsent > 3 ? `nghỉ ${nextAbsent} lượt (> 3)` : `bị trừ ${nextPenalty}đ (≥ 5đ)`;
          onShowToast(`⚠️ ${student.name}: ${reason} ➔ Chuyển nhận xét sang "Tích cực"!`, 'info');
        } else if (currentStats.absentCount > 3 || currentStats.penaltyPoints >= 5) {
          onShowToast(`👑 ${student.name}: Đạt chuẩn nhận xét "Xuất sắc"!`, 'success');
        }
      }
    }
  };

  // Đổi kiểu viết hoa cụm từ đầu câu ("XUẤT SẮC:" hoặc "Xuất sắc:")
  const handleToggleUppercase = () => {
    const nextUpper = !uppercasePrefix;
    setUppercasePrefix(nextUpper);
    setCommentsMap((prev) => {
      const nextMap = { ...prev };
      students.forEach((s) => {
        const existing = nextMap[s.id];
        if (existing) {
          const nextPrefix = getPrefixForLevel(existing.level, nextUpper);
          const oldPrefix = existing.prefix;
          let newFullComment = existing.fullComment;
          if (newFullComment.startsWith(oldPrefix)) {
            newFullComment = newFullComment.replace(oldPrefix, nextPrefix);
          } else {
            newFullComment = `${nextPrefix} ${existing.content}`;
          }
          nextMap[s.id] = {
            ...existing,
            prefix: nextPrefix,
            fullComment: newFullComment,
            parentMessage: `Kính gửi phụ huynh em ${s.name} (Mã: ${s.id})! Điểm tích lũy: ${s.points || 0}đ. Nhận xét TT22: ${newFullComment}`,
            wordCount: newFullComment.trim().split(/\s+/).filter(Boolean).length,
          };
        }
      });
      return nextMap;
    });
    if (onShowToast) {
      onShowToast(
        nextUpper 
          ? '🔤 Đã chuyển cụm từ đầu sang VIẾT HOA (XUẤT SẮC, TÍCH CỰC...)!' 
          : '🔡 Đã chuyển cụm từ đầu sang chuẩn chữ hoa đầu (Xuất sắc, Tích cực...)!', 
        'info'
      );
    }
  };

  // Làm mới ngẫu nhiên các biến thể nhận xét cả lớp (tránh lặp khuôn giữa các em)
  const handleRegenerateVariations = () => {
    const nextOffset = seedOffset + 1;
    setSeedOffset(nextOffset);
    const all = generateAllTT22Comments(students, uppercasePrefix, nextOffset);
    const map: { [id: string]: TT22Comment } = {};
    all.forEach((c) => {
      map[c.studentId] = c;
    });
    setCommentsMap(map);
    audioService.play('plus');
    if (onShowToast) {
      onShowToast('✨ Đã làm mới các biến thể câu nhận xét chuẩn TT22 (15 - 20 từ)!', 'success');
    }
  };

  // Làm mới riêng mẫu nhận xét của 1 học sinh
  const handleRegenerateOne = (student: Student) => {
    const nextIdx = (studentOffsetMap[student.id] || 0) + 1;
    setStudentOffsetMap((prev) => ({ ...prev, [student.id]: nextIdx }));
    const newComment = generateTT22Comment(student, nextIdx, uppercasePrefix);
    setCommentsMap((prev) => ({ ...prev, [student.id]: newComment }));
    audioService.play('plus');
    if (onShowToast) {
      onShowToast(`🔄 Đã đổi mẫu nhận xét mới cho em ${student.name}!`, 'info');
    }
  };

  // Cập nhật lời nhận xét khi Thầy/Cô chỉnh sửa trực tiếp (Inline edit)
  const handleCommentChange = (studentId: string, newText: string) => {
    setCommentsMap((prev) => {
      const existing = prev[studentId];
      if (!existing) return prev;
      return {
        ...prev,
        [studentId]: {
          ...existing,
          [viewMode === 'so_theo_doi' ? 'fullComment' : 'parentMessage']: newText,
          wordCount: newText.trim().split(/\s+/).filter(Boolean).length,
        },
      };
    });
  };

  // Sao chép nhận xét của 1 học sinh
  const handleCopyOne = (studentId: string) => {
    const item = commentsMap[studentId];
    if (!item) return;

    const textToCopy = viewMode === 'so_theo_doi' ? item.fullComment : item.parentMessage;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }

    setCopiedId(studentId);
    audioService.play('plus');
    setTimeout(() => setCopiedId(null), 2000);

    if (onShowToast) {
      onShowToast(`📋 Đã sao chép nhận xét của ${item.studentName}!`, 'success');
    }
  };

  // Sao chép toàn bộ nhận xét của cả lớp
  const handleCopyAll = () => {
    const lines: string[] = [];
    lines.push(`DANH SÁCH NHẬN XÉT HỌC SINH THEO THÔNG TƯ 22/2021/TT-BGDĐT`);
    lines.push(`Lớp: ${className} | Tổng số: ${students.length} học sinh`);
    lines.push(`Hình thức: ${viewMode === 'so_theo_doi' ? 'Sổ theo dõi & đánh giá học sinh (15 - 20 từ)' : 'Sổ liên lạc phụ huynh'}\n`);

    students.forEach((s, idx) => {
      const item = commentsMap[s.id];
      if (item) {
        const text = viewMode === 'so_theo_doi' ? item.fullComment : item.parentMessage;
        lines.push(`${idx + 1}. [${s.id}] ${s.name} (${s.points}đ - ${item.levelLabel} | ${item.wordCount} từ):\n${text}\n`);
      }
    });

    const fullContent = lines.join('\n');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullContent).catch(() => {});
    }

    setIsCopiedAll(true);
    audioService.play('win');
    setTimeout(() => setIsCopiedAll(false), 2500);

    if (onShowToast) {
      onShowToast('🎉 Đã sao chép toàn bộ nhận xét cả lớp vào bộ nhớ tạm!', 'success');
    }
  };

  // Xuất file Excel (.xlsx) chuẩn TT22
  const handleExportExcel = () => {
    const data = students.map((s, idx) => {
      const item = commentsMap[s.id];
      const stats = studentStatsMap[s.id] || {
        absentCount: s.absentCount || 0,
        penaltyPoints: s.penaltyPoints ?? parsePenaltyFromNote(s.lastNote),
      };
      return {
        'STT': idx + 1,
        'MÃ HỌC SINH': s.id || '',
        'HỌ VÀ TÊN': s.name || '',
        'ĐIỂM TÍCH LŨY': s.points || 0,
        'SỐ LƯỢT NGHỈ': stats.absentCount,
        'ĐIỂM BỊ TRỪ': stats.penaltyPoints,
        'MỨC ĐÁNH GIÁ (TT22)': item ? item.levelLabel : '',
        'LƯU Ý CHUYÊN CẦN / NỀ NẾP': item?.downgradedFromExcellent ? item.downgradeReason : '',
        'SỐ TỪ': item ? item.wordCount : 0,
        'NHẬN XÉT SỔ THEO DÕI & HỌC BẠ (15-20 TỪ)': item ? item.fullComment : '',
        'TIN NHẮN SỔ LIÊN LẠC PHỤ HUYNH': item ? item.parentMessage : '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 25 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 32 },
      { wch: 10 },
      { wch: 55 },
      { wch: 65 },
    ];

    const workbook = XLSX.utils.book_new();
    const sheetName = `NhanXet_TT22_${className}`.replace(/[:\\/?*\[\]]/g, '_').slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const fileName = `Nhan_Xet_TT22_Lop_${className.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    audioService.play('win');
    if (onShowToast) {
      onShowToast('📥 Đã tải file Excel nhận xét TT22 thành công!', 'success');
    }
  };

  // Lọc danh sách học sinh theo tìm kiếm và mức điểm
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      const item = commentsMap[s.id];
      const matchLevel = levelFilter === 'all' || (item && item.level === levelFilter);
      return matchSearch && matchLevel;
    });
  }, [students, searchQuery, levelFilter, commentsMap]);

  // Thống kê số lượng từng mức
  const stats = useMemo(() => {
    const counts = { excellent: 0, active: 0, passed: 0, not_passed: 0 };
    students.forEach((s) => {
      const item = commentsMap[s.id];
      if (item && counts[item.level] !== undefined) {
        counts[item.level]++;
      }
    });
    return counts;
  }, [students, commentsMap]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
            <FileText size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black uppercase text-emerald-950">
                NHẬN XÉT HỌC SINH THEO THÔNG TƯ 22/2021/TT-BGDĐT
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                TT 22
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Quy định đánh giá học sinh THCS & THPT • Lớp: <strong className="text-emerald-700">{className}</strong> ({students.length} học sinh)
            </p>
          </div>
        </div>
      }
      headerTheme="primary"
      maxWidth="max-w-4xl"
    >
      {/* 1. Thanh chọn chế độ văn bản */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-3.5">
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('so_theo_doi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              viewMode === 'so_theo_doi'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={14} />
            <span>Sổ theo dõi & Học bạ (15-20 từ)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('so_lien_lac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              viewMode === 'so_lien_lac'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send size={14} />
            <span>Sổ liên lạc & Tin nhắn phụ huynh</span>
          </button>
        </div>

        {/* Nút hành động nhanh: Đổi kiểu chữ hoa, Sao chép cả lớp & Xuất Excel */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleUppercase}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1 shadow-2xs active:scale-95 ${
              uppercasePrefix
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Bấm để chuyển đổi giữa viết hoa cụm từ đầu (XUẤT SẮC:, TÍCH CỰC:) và viết thường hoa đầu từ (Xuất sắc:, Tích cực:)"
          >
            <span className="font-mono text-[11px] font-black">{uppercasePrefix ? 'XUẤT SẮC:' : 'Xuất sắc:'}</span>
          </button>

          <button
            type="button"
            onClick={handleRegenerateVariations}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
            title="Tạo lại ngẫu nhiên các mẫu câu nhận xét khác (15-20 từ) để tránh trùng lặp giữa các em"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Làm mới câu</span>
          </button>

          <button
            type="button"
            onClick={handleCopyAll}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 ${
              isCopiedAll
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {isCopiedAll ? <Check size={14} /> : <Copy size={14} />}
            <span>{isCopiedAll ? 'Đã sao chép cả lớp!' : 'Sao chép cả lớp'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-black shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
            title="Xuất file Excel đầy đủ nhận xét của cả lớp để nạp vào vnEdu/SMAS"
          >
            <Download size={14} />
            <span>Xuất Excel TT22</span>
          </button>
        </div>
      </div>

      {/* 2. Thống kê & Bộ lọc theo mức điểm */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-slate-600 flex items-center gap-1 mr-1">
            <Filter size={13} />
            <span>Lọc:</span>
          </span>
          <button
            type="button"
            onClick={() => setLevelFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-extrabold text-xs transition-all ${
              levelFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setLevelFilter('excellent')}
            className={`px-2.5 py-1 rounded-lg font-extrabold text-xs transition-all ${
              levelFilter === 'excellent'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            👑 Xuất sắc ({stats.excellent})
          </button>
          <button
            type="button"
            onClick={() => setLevelFilter('active')}
            className={`px-2.5 py-1 rounded-lg font-extrabold text-xs transition-all ${
              levelFilter === 'active'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            🌟 Tích cực ({stats.active})
          </button>
          <button
            type="button"
            onClick={() => setLevelFilter('passed')}
            className={`px-2.5 py-1 rounded-lg font-extrabold text-xs transition-all ${
              levelFilter === 'passed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            ✅ Đạt ({stats.passed})
          </button>
          <button
            type="button"
            onClick={() => setLevelFilter('not_passed')}
            className={`px-2.5 py-1 rounded-lg font-extrabold text-xs transition-all ${
              levelFilter === 'not_passed'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            ⚠️ Chưa đạt ({stats.not_passed})
          </button>
        </div>

        {/* Ô tìm kiếm theo tên hoặc mã */}
        <div className="relative w-48 sm:w-56">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc mã HS..."
            className="w-full pl-8 pr-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* 3. Danh sách học sinh và lời nhận xét TT22 */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
        <div className="max-h-[55vh] overflow-y-auto divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-semibold">
              Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredStudents.map((s, idx) => {
              const item = commentsMap[s.id];
              if (!item) return null;

              const isCopied = copiedId === s.id;
              const currentComment = viewMode === 'so_theo_doi' ? item.fullComment : item.parentMessage;

              return (
                <div
                  key={s.id}
                  className={`p-3.5 sm:p-4 transition-colors ${
                    initialSelectedStudentId === s.id ? 'bg-amber-50/60 ring-1 ring-amber-300' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-2">
                    {/* Header học sinh: Tên, Mã, Điểm, Mức đánh giá */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 font-black text-xs text-slate-600 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-black text-slate-900 text-sm">{s.name}</span>
                      <span className="text-xs font-extrabold text-rose-600">(Mã: {s.id})</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-extrabold text-sky-700 text-xs">
                        {s.points} ⭐
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 border shadow-2xs ${
                        item.level === 'excellent' ? 'bg-amber-100 text-amber-950 border-amber-300' :
                        item.level === 'active' ? 'bg-sky-100 text-sky-950 border-sky-300' :
                        item.level === 'passed' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                        'bg-rose-100 text-rose-950 border-rose-300'
                      }`}>
                        <span>{item.icon}</span>
                        <span>{item.levelLabel}</span>
                      </span>

                      {/* Huy hiệu cảnh báo hạ mức từ Xuất sắc sang Tích cực */}
                      {item.downgradedFromExcellent && (
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs" 
                          title={item.downgradeReason}
                        >
                          <span>⚠️</span>
                          <span>Đổi sang "Tích cực" ({item.downgradeReason})</span>
                        </span>
                      )}

                      {/* Bộ điều chỉnh chuyên cần (Nghỉ học) & kỷ luật (Bị trừ điểm) */}
                      <div className="flex items-center gap-1.5 ml-auto sm:ml-0 text-xs">
                        <div 
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/60 transition-colors px-2 py-0.5 rounded-lg border border-slate-200"
                          title="Số lượt nghỉ học. Nếu nghỉ trên 3 lượt sẽ không nhận xét Xuất sắc mà chuyển thành Tích cực"
                        >
                          <span className="text-[10px] font-black uppercase text-slate-500">Nghỉ:</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateStudentStats(s.id, -1, 0)}
                            className="w-4 h-4 rounded hover:bg-white text-slate-700 font-black flex items-center justify-center text-xs active:scale-90"
                            title="Giảm 1 lượt nghỉ"
                          >
                            -
                          </button>
                          <span className={`font-black text-xs min-w-3 text-center ${(studentStatsMap[s.id]?.absentCount || 0) > 3 ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
                            {studentStatsMap[s.id]?.absentCount || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateStudentStats(s.id, 1, 0)}
                            className="w-4 h-4 rounded hover:bg-white text-slate-700 font-black flex items-center justify-center text-xs active:scale-90"
                            title="Tăng 1 lượt nghỉ"
                          >
                            +
                          </button>
                          <span className="text-[10px] text-slate-400">lượt</span>
                        </div>

                        <div 
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/60 transition-colors px-2 py-0.5 rounded-lg border border-slate-200"
                          title="Số điểm bị trừ. Nếu bị trừ từ 5đ trở lên sẽ không nhận xét Xuất sắc mà chuyển thành Tích cực"
                        >
                          <span className="text-[10px] font-black uppercase text-slate-500">Bị trừ:</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateStudentStats(s.id, 0, -1)}
                            className="w-4 h-4 rounded hover:bg-white text-slate-700 font-black flex items-center justify-center text-xs active:scale-90"
                            title="Giảm 1 điểm phạt"
                          >
                            -
                          </button>
                          <span className={`font-black text-xs min-w-3 text-center ${(studentStatsMap[s.id]?.penaltyPoints || 0) >= 5 ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
                            {studentStatsMap[s.id]?.penaltyPoints || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateStudentStats(s.id, 0, 1)}
                            className="w-4 h-4 rounded hover:bg-white text-slate-700 font-black flex items-center justify-center text-xs active:scale-90"
                            title="Tăng 1 điểm phạt"
                          >
                            +
                          </button>
                          <span className="text-[10px] text-slate-400">đ</span>
                        </div>
                      </div>
                    </div>

                    {/* Nút Đổi câu riêng, Sao chép & Độ dài chữ */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span 
                        className={`text-[11px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                          item.wordCount >= 15 && item.wordCount <= 20
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                        title={
                          item.wordCount >= 15 && item.wordCount <= 20
                            ? 'Chuẩn quy định 15 - 20 từ theo Thông tư 22'
                            : 'Lưu ý: Độ dài khuyến nghị theo TT22 là 15 - 20 từ'
                        }
                      >
                        {item.wordCount >= 15 && item.wordCount <= 20 ? (
                          <Check size={11} className="text-emerald-600" />
                        ) : (
                          <AlertCircle size={11} className="text-amber-600" />
                        )}
                        <span>{item.wordCount} từ</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRegenerateOne(s)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs active:scale-95"
                        title="Đổi mẫu câu nhận xét khác cho riêng học sinh này"
                      >
                        <RefreshCw size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyOne(s.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-2xs active:scale-95 ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                        title="Sao chép lời nhận xét của em này"
                      >
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        <span>{isCopied ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Khung nội dung lời nhận xét (Cho phép Thầy/Cô gõ chỉnh sửa trực tiếp) */}
                  <div className="relative">
                    <textarea
                      rows={viewMode === 'so_theo_doi' ? 2 : 3}
                      value={currentComment}
                      onChange={(e) => handleCommentChange(s.id, e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 text-xs font-medium text-slate-800 bg-slate-50/50 hover:bg-white transition-colors outline-none resize-none leading-relaxed"
                      placeholder="Lời nhận xét..."
                    />
                  </div>

                  {/* Phân tích cấu trúc 3 phần TT22 (Ưu điểm -> Hạn chế -> Hướng khắc phục) */}
                  {viewMode === 'so_theo_doi' && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1.5 px-1">
                      <span className="truncate">
                        <strong className="text-emerald-700">✓ Ưu điểm:</strong> {item.strength}
                      </span>
                      <span className="truncate">
                        <strong className="text-amber-700">! Cần lưu ý:</strong> {item.limitation}
                      </span>
                      <span className="truncate">
                        <strong className="text-sky-700">➔ Hướng phấn đấu:</strong> {item.actionPlan}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Footer: Lưu ý sư phạm chuẩn TT22 & Nút đóng */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 italic font-medium">
          <AlertCircle size={14} className="text-amber-500 shrink-0" />
          <span>Thầy/Cô đọc lại trước khi lưu vào hồ sơ chính thức. Lời nhận xét cuối cùng luôn thuộc về giáo viên.</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-colors"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
};
