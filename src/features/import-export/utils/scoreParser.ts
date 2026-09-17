export interface ParsedScoreRow {
  code: string;
  name: string;
  score: number;
  rawText?: string;
}

/**
 * Phân tích dữ liệu bảng điểm 3 cột từ văn bản copy từ Excel hoặc file CSV
 * Định dạng chuẩn: MÃ HS [Tab hoặc Phẩy] HỌ VÀ TÊN [Tab hoặc Phẩy] ĐIỂM TỔNG
 */
export const parseScoreRows = (rawText: string): ParsedScoreRow[] => {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const result: ParsedScoreRow[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Bỏ qua dòng tiêu đề
    const lower = line.toLowerCase();
    if (
      (lower.includes('mã') || lower.includes('stt') || lower.includes('code')) &&
      (lower.includes('họ') || lower.includes('tên') || lower.includes('name')) &&
      (lower.includes('điểm') || lower.includes('score') || lower.includes('tổng'))
    ) {
      continue;
    }

    let cols: string[] = [];

    // 1. Phân tách theo Tab (Copy trực tiếp từ Excel / Google Sheets)
    if (line.includes('\t')) {
      cols = line.split('\t').map((c) => c.replace(/^["']|["']$/g, '').trim());
    }
    // 2. Phân tách theo Dấu chấm phẩy ; (CSV Châu Âu)
    else if (line.includes(';')) {
      cols = line.split(';').map((c) => c.replace(/^["']|["']$/g, '').trim());
    }
    // 3. Phân tách theo Dấu phẩy , (CSV chuẩn)
    else if (line.includes(',')) {
      // Regex tách theo dấu phẩy nhưng giữ nguyên chuỗi trong ngoặc kép
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (matches && matches.length >= 2) {
        cols = matches.map((c) => c.replace(/^["']|["']$/g, '').trim());
      } else {
        cols = line.split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
      }
    }
    // 4. Phân tách theo dấu gạch ngang hoặc khoảng trắng nếu có định dạng "HS01 - Nguyễn Văn An - 10"
    else if (line.includes(' - ')) {
      cols = line.split(' - ').map((c) => c.trim());
    }

    if (cols.length >= 3) {
      // Chuẩn 3 cột: [0: Mã HS, 1: Họ tên, 2: Điểm]
      let code = cols[0].trim();
      let name = cols[1].trim();
      let rawScore = cols[2].replace(',', '.').trim();
      let scoreNum = parseFloat(rawScore);

      // Nếu cột 2 không phải số nhưng cột cuối cùng là số
      if (isNaN(scoreNum)) {
        for (let i = cols.length - 1; i >= 2; i--) {
          const tryScore = parseFloat(cols[i].replace(',', '.').trim());
          if (!isNaN(tryScore)) {
            scoreNum = tryScore;
            // Tên là các cột ở giữa
            name = cols.slice(1, i).join(' ').trim();
            break;
          }
        }
      }

      if (!isNaN(scoreNum) && (code || name)) {
        result.push({
          code: code.toUpperCase(),
          name,
          score: Math.max(0, Math.round(scoreNum * 10) / 10), // Làm tròn 1 chữ số thập phân
          rawText: line,
        });
        continue;
      }
    }

    if (cols.length === 2) {
      // Trường hợp 2 cột: có thể là [Mã HS, Điểm] hoặc [Họ tên, Điểm]
      const first = cols[0].trim();
      const secondScore = parseFloat(cols[1].replace(',', '.').trim());

      if (!isNaN(secondScore)) {
        const isCode = /^HS\d+/i.test(first) || (/^\d+$/.test(first) && first.length <= 4);
        result.push({
          code: isCode ? (first.startsWith('HS') ? first.toUpperCase() : `HS${first.padStart(2, '0')}`) : '',
          name: isCode ? '' : first,
          score: Math.max(0, Math.round(secondScore * 10) / 10),
          rawText: line,
        });
        continue;
      }
    }

    // Trường hợp dòng dạng text tự do: "HS01 Nguyễn Văn An 10"
    const words = line.split(/\s+/);
    if (words.length >= 2) {
      const lastWord = words[words.length - 1].replace(',', '.');
      const scoreNum = parseFloat(lastWord);
      if (!isNaN(scoreNum)) {
        let code = '';
        let nameParts = words.slice(0, words.length - 1);

        if (/^HS\d+/i.test(words[0])) {
          code = words[0].toUpperCase();
          nameParts = words.slice(1, words.length - 1);
        }

        const name = nameParts.join(' ').replace(/^(\d+[\.\-\)\/\:\s]+)/, '').trim();
        if (name || code) {
          result.push({
            code,
            name,
            score: Math.max(0, Math.round(scoreNum * 10) / 10),
            rawText: line,
          });
        }
      }
    }
  }

  return result;
};
