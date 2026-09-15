// Phân tích danh sách tên học sinh từ văn bản hoặc Excel/Word dán vào
export const parseStudentNames = (rawText: string): string[] => {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const result: string[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Loại bỏ số thứ tự ở đầu dòng (VD: "1.", "1 -", "1/", "1/ ", "HS01 - ")
    let cleaned = line
      .replace(/^(\d+[\.\-\)\/\:\s]+|\bHS\d+[\.\-\)\/\:\s]+)/i, '')
      .replace(/^[\-\*\•\+]\s*/, '')
      .trim();

    // Bỏ qua dòng tiêu đề CSV
    if (
      cleaned.toLowerCase().includes('họ và tên') ||
      cleaned.toLowerCase().includes('họ tên') ||
      cleaned.toLowerCase().includes('danh sách') ||
      cleaned.toLowerCase().includes('stt')
    ) {
      continue;
    }

    // Nếu dòng chứa dấu phẩy (CSV), lấy cột tên
    if (cleaned.includes(',')) {
      const parts = cleaned.split(',').map((p) => p.replace(/^["']|["']$/g, '').trim());
      // Tìm cột có vẻ là tên (độ dài > 1 và không phải chỉ là số hoặc mã)
      const nameCol = parts.find((p) => p.length > 1 && isNaN(Number(p)) && !p.startsWith('HS'));
      if (nameCol) {
        cleaned = nameCol;
      }
    }

    if (cleaned.length > 0) {
      result.push(cleaned);
    }
  }

  return result;
};
