import { Student } from '../../../types';

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
