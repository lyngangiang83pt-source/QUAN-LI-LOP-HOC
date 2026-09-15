# 🌟 Sổ Tay Quản Lý Lớp Học & Vòng Quay May Mắn

Ứng dụng web thông minh hỗ trợ Thầy/Cô quản lý lớp học, điểm danh chuyên cần, cộng trừ điểm thi đua, vinh danh Top học sinh xuất sắc và tổ chức Vòng quay may mắn sôi nổi ngay trên lớp.

---

## 🚀 Tính năng nổi bật

- **Quản lý đa lớp học (Multi-Class):** Dễ dàng thêm mới, chuyển đổi linh hoạt giữa các lớp (10A1, 10A2...), tùy chỉnh môn học và điểm tích lũy khởi đầu.
- **Điểm danh chuyên cần thông minh:** 
  - Điểm danh Có mặt (+2 điểm), Điểm danh Muộn (+1 điểm), Vắng mặt.
  - Thao tác nhanh: Có mặt tất cả, cấp 2 điểm cả lớp, làm mới ngày học.
- **Vòng quay may mắn (Canvas Lucky Wheel):** Quay số ngẫu nhiên dành cho học sinh tích cực đạt từ 5 điểm trở lên với hiệu ứng âm thanh và pháo hoa rực rỡ.
- **Bảng vinh danh & Bục Top 3 Podium:** Tự động xếp hạng học sinh theo thứ tự điểm cao đến thấp, trao danh hiệu Thủ khoa và Vinh danh xuất sắc.
- **Đồng bộ đám mây Supabase (Cloud Sync):** Lưu trữ dữ liệu an toàn trên Supabase PostgreSQL Database, tự động đồng bộ 2 chiều và hỗ trợ hoạt động ngoại tuyến (Offline-First qua LocalStorage).
- **Nhập/Xuất dữ liệu linh hoạt:** 
  - Nạp danh sách học sinh từ file Excel (.csv) hoặc dán văn bản từ Zalo/Word.
  - Xuất bảng điểm danh và bảng xếp hạng ra file Excel chuẩn định dạng UTF-8.
- **Hiệu ứng âm thanh sinh động (Web Audio API):** Âm thanh vui tươi khi cộng điểm, nhắc nhở khi trừ điểm, âm thanh hồi hộp khi quay thưởng và nhạc chiến thắng khi nhận giải.

---

## 🛠️ Công nghệ sử dụng

- **Frontend:** HTML5, CSS3 (Modern Flexbox/Grid, Glassmorphism, Animations), Vanilla JavaScript (ES6+).
- **Database & Backend:** [Supabase](https://supabase.com) (PostgreSQL, RESTful API, Realtime).
- **Client SDK:** `@supabase/supabase-js v2`.
- **Audio Engine:** Web Audio API (Tự tạo âm thanh lập trình, không phụ thuộc file ngoài).
- **Graphics:** HTML5 Canvas API (Vẽ và điều khiển Vòng quay may mắn).

---

## 📖 Hướng dẫn sử dụng

1. **Mở trực tiếp:** Mở file `index.html` bằng trình duyệt Google Chrome hoặc Cốc Cốc.
2. **Cấu hình Supabase (Tùy chọn):** Ứng dụng đã tích hợp sẵn kết nối tới Supabase Cloud Database. Để cấp quyền đọc/ghi dữ liệu, chạy script phân quyền RLS trong SQL Editor của Supabase.
3. **Quản lý lớp học:** Bấm nút **➕ Quản lý lớp** trên thanh công cụ để thêm danh sách học sinh của lớp mới hoặc chỉnh sửa thông tin môn học.
