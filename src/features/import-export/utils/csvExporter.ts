import * as XLSX from 'xlsx';
import { Student } from '../../../types';

/**
 * Xuất file Excel (.xlsx) bảng điểm chuẩn 3 cột: MÃ HS, HỌ VÀ TÊN, TỔNG ĐIỂM
 * Mở trực tiếp trong Excel / Google Sheets / WPS mượt mà, căn chỉnh độ rộng cột chuẩn đẹp
 */
export const exportScoreFileExcel = (students: Student[], className: string): void => {
  const data = students.map((s) => ({
    'MÃ HS': s.id || '',
    'HỌ VÀ TÊN': s.name || '',
    'TỔNG ĐIỂM': s.points !== undefined && s.points !== null ? s.points : 0,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Thiết lập độ rộng cột trực quan
  worksheet['!cols'] = [
    { wch: 15 }, // MÃ HS
    { wch: 30 }, // HỌ VÀ TÊN
    { wch: 15 }, // TỔNG ĐIỂM
  ];

  const workbook = XLSX.utils.book_new();
  const safeSheetName = `BangDiem_${className}`.replace(/[:\\/?*\[\]]/g, '_').slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const fileName = `Bang_Diem_Lop_${className.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

/**
 * Tải file mẫu Excel (.xlsx) chuẩn 3 cột để Thầy/Cô điền điểm và nạp lại vào phần mềm
 */
export const downloadSampleScoreExcel = (): void => {
  const sampleData = [
    { 'MÃ HS': 'HS01', 'HỌ VÀ TÊN': 'Nguyễn Văn An', 'TỔNG ĐIỂM': 10 },
    { 'MÃ HS': 'HS02', 'HỌ VÀ TÊN': 'Trần Thị Mai', 'TỔNG ĐIỂM': 8.5 },
    { 'MÃ HS': 'HS03', 'HỌ VÀ TÊN': 'Lê Hoàng Nam', 'TỔNG ĐIỂM': 9 },
    { 'MÃ HS': 'HS04', 'HỌ VÀ TÊN': 'Phạm Thu Hà', 'TỔNG ĐIỂM': 7.5 },
    { 'MÃ HS': 'HS05', 'HỌ VÀ TÊN': 'Đỗ Minh Quân', 'TỔNG ĐIỂM': 10 },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Bang_Diem_3_Cot');

  XLSX.writeFile(workbook, 'Mau_Nap_Diem_3_Cot.xlsx');
};

/**
 * Xuất file bảng điểm chuẩn 3 cột định dạng CSV UTF-8 BOM
 */
export const exportScoreFileCSV = (students: Student[], className: string): void => {
  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM
  csvContent += "MÃ HS,HỌ VÀ TÊN,TỔNG ĐIỂM\n";

  students.forEach((s) => {
    const code = s.id || '';
    const name = s.name ? `"${s.name.replace(/"/g, '""')}"` : '""';
    const score = s.points !== undefined && s.points !== null ? s.points : 0;
    csvContent += `${code},${name},${score}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Bang_Diem_Lop_${className}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Tải file CSV mẫu 3 cột chuẩn
 */
export const downloadSampleScoreCSV = (): void => {
  let csv = "data:text/csv;charset=utf-8,\uFEFF";
  csv += "MÃ HS,HỌ VÀ TÊN,TỔNG ĐIỂM\n";
  csv += "HS01,Nguyễn Văn An,10\n";
  csv += "HS02,Trần Thị Mai,8\n";
  csv += "HS03,Lê Hoàng Nam,9\n";
  csv += "HS04,Phạm Thu Hà,7\n";
  csv += "HS05,Đỗ Minh Quân,10\n";

  const encoded = encodeURI(csv);
  const link = document.createElement("a");
  link.setAttribute("href", encoded);
  link.setAttribute("download", "Mau_Nap_Diem_3_Cot.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportStudentsToCSV = (students: Student[], className: string): void => {
  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM
  csvContent += "Hạng,Mã HS,Họ và Tên,Điểm danh hôm nay,Tổng điểm tích lũy,Ghi chú gần nhất\n";

  const sortedList = [...students].sort((a, b) => (b.points || 0) - (a.points || 0));

  sortedList.forEach((s, idx) => {
    const attText = s.attendance === 'present' ? 'Có mặt' : s.attendance === 'late' ? 'Muộn' : 'Vắng';
    csvContent += `"${idx + 1}","${s.id}","${s.name}","${attText}","${s.points}","${s.lastNote || ''}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Bang_Diem_Danh_Xep_Hang_Lop_${className}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadSampleCSV = (): void => {
  let csv = "data:text/csv;charset=utf-8,\uFEFF";
  csv += "STT,Mã Học Sinh,Họ và Tên,Trạng thái\n";
  csv += "1,HS01,Nguyễn Văn An,Có mặt\n";
  csv += "2,HS02,Trần Thị Mai,Có mặt\n";
  csv += "3,HS03,Lê Hoàng Nam,Có mặt\n";
  csv += "4,HS04,Phạm Thu Hà,Có mặt\n";
  csv += "5,HS05,Đỗ Minh Quân,Có mặt\n";

  const encoded = encodeURI(csv);
  const link = document.createElement("a");
  link.setAttribute("href", encoded);
  link.setAttribute("download", "Mau_Danh_Sach_Hoc_Sinh.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


