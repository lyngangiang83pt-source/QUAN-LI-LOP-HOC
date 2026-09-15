# 🌟 Sổ Tay Quản Lý Lớp Học & Vòng Quay May Mắn (React 18 + Supabase + Tailwind CSS)

Ứng dụng web thông minh chuyên nghiệp hỗ trợ Thầy/Cô quản lý lớp học, điểm danh chuyên cần, cộng trừ điểm thi đua, vinh danh Top học sinh xuất sắc và tổ chức Vòng quay may mắn sôi nổi ngay trên lớp học.

Dự án được xây dựng trên nền tảng **React 18, TypeScript, Vite, Tailwind CSS** kết nối trực tiếp cơ sở dữ liệu đám mây **Supabase PostgreSQL** và tối ưu hóa 100% để triển khai (deploy) mượt mà trên **Vercel**.

---

## 🚀 Tính năng nổi bật

- 🏫 **Quản lý đa lớp học (Multi-Class Management):** Dễ dàng thêm mới, chuyển đổi linh hoạt giữa các lớp (VD: 6B2, 10A1...), tùy chỉnh môn học và điểm tích lũy khởi đầu.
- 📋 **Điểm danh chuyên cần thông minh:** 
  - Điểm danh Có mặt (+2 điểm), Điểm danh Muộn (+1 điểm), Vắng phép, Vắng không phép.
  - Thao tác 1 chạm: *Có mặt tất cả*, *Cộng 2 điểm cả lớp*, *Làm mới ngày học*.
- 🎡 **Vòng quay may mắn (Canvas Lucky Wheel):** Quay số ngẫu nhiên dành cho học sinh tích cực đạt từ 5 điểm trở lên với hiệu ứng âm thanh Web Audio và pháo hoa rực rỡ.
- 🏆 **Bảng vinh danh & Bục Top 3 Podium:** Tự động xếp hạng học sinh theo thứ tự điểm cao đến thấp, trao danh hiệu Thủ khoa và Vinh danh xuất sắc.
- ☁️ **Đồng bộ đám mây Supabase (2-Way Cloud Sync):** Tự động đồng bộ hai chiều thời gian thực lên PostgreSQL Database trên Supabase, hỗ trợ ghi nhật ký `attendance_logs` và lưu trữ đệm ngoại tuyến (Offline-First qua LocalStorage).
- 📊 **Nhập/Xuất dữ liệu linh hoạt:** 
  - Nạp danh sách học sinh từ file Excel (.csv) hoặc dán văn bản trực tiếp từ Zalo/Word.
  - Xuất bảng điểm danh và bảng xếp hạng ra file Excel chuẩn định dạng UTF-8.
- 🎵 **Hiệu ứng âm thanh sinh động (Web Audio API):** Âm thanh vui tươi khi cộng điểm, nhắc nhở khi trừ điểm, âm thanh hồi hộp khi quay thưởng và nhạc chiến thắng khi nhận giải.

---

## 🛠️ Công nghệ & Kiến trúc phần mềm

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 6](https://vitejs.dev/) (Tốc độ khởi động siêu tốc, HMR tức thì) |
| **Giao diện / Styling** | [Tailwind CSS v3](https://tailwindcss.com/) (Modern Glassmorphism, Responsive, Dark/Light theme) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database & Cloud** | [Supabase](https://supabase.com/) (PostgreSQL Database, RESTful API, Realtime Subscription) |
| **Hiệu ứng đồ họa** | HTML5 Canvas API + `canvas-confetti` (Pháo hoa rực rỡ) |
| **Audio Engine** | Web Audio API (Lập trình âm thanh đa tần số, không phụ thuộc file âm thanh ngoài) |
| **Nền tảng triển khai** | [Vercel](https://vercel.com/) (Serverless Edge Network, SSL tự động, Clean URLs) |

---

## 💻 Hướng dẫn chạy thử nghiệm trên Localhost

### 1. Yêu cầu môi trường
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18.x trở lên).

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Khởi chạy Development Server
```bash
npm run dev
```
Trình duyệt sẽ mở ứng dụng tại: `http://localhost:5173/`

### 4. Kiểm tra đóng gói Production
```bash
npm run build
npm run preview
```

---

## 🌐 Hướng dẫn Triển khai (Deploy) lên Vercel

### Cách 1: Kết nối trực tiếp qua GitHub Repository (Khuyến nghị)
1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/).
2. Bấm nút **"Add New..."** ➜ Chọn **"Project"**.
3. Chọn Repository GitHub: **`lyngangiang83pt-source/QUAN-LI-LOP-HOC`**.
4. Cấu hình Project (Vercel tự động nhận diện `Vite`):
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. *(Tùy chọn)* Thêm Biến môi trường (Environment Variables) trong phần **Environment Variables**:
   - `VITE_SUPABASE_URL`: `https://juaanjhfsvtzwmznbjnq.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
6. Bấm **Deploy**. Vercel sẽ tự động cấp phát tên miền `https://quan-li-lop-hoc-xxx.vercel.app` với chứng chỉ SSL miễn phí trọn đời.

### Cách 2: Triển khai qua Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 📜 Cấu hình Cơ sở dữ liệu Supabase (SQL Schema & RLS)

Để kích hoạt toàn quyền CRUD an toàn trên Supabase, truy cập **SQL Editor** trên Supabase Dashboard và thực thi:

```sql
-- 1. Kích hoạt Row Level Security (Bảo mật cấp độ hàng)
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- 2. Xóa các chính sách (policy) cũ nếu đã tồn tại để tránh lỗi trùng lặp (Error 42710)
DROP POLICY IF EXISTS "Allow public all access on classes" ON public.classes;
DROP POLICY IF EXISTS "Allow public all access on students" ON public.students;
DROP POLICY IF EXISTS "Allow public all access on attendance_logs" ON public.attendance_logs;

-- 3. Tạo lại chính sách toàn quyền Đọc/Ghi/Sửa/Xóa cho ứng dụng Web
CREATE POLICY "Allow public all access on classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on attendance_logs" ON public.attendance_logs FOR ALL USING (true) WITH CHECK (true);

-- 4. Tạo chỉ mục (Index) tăng tốc độ tìm kiếm và lọc dữ liệu
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_student_id ON public.attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_check_date ON public.attendance_logs(check_date);
```

---

## 📁 Cấu trúc thư mục chuẩn mực

```text
QUAN-LI-LOP-HOC/
├── public/                 # Favicon, tài nguyên tĩnh
├── src/
│   ├── components/         # Components UI dùng chung (Header, Banner, Mascot...)
│   │   ├── banner/         # Mascot banner, chào mừng
│   │   ├── common/         # Button, Modal, Card
│   │   └── layout/         # Header, Navigation, Stats
│   ├── constants/          # Hằng số, config hệ thống
│   ├── features/           # Các phân hệ nghiệp vụ chính
│   │   ├── attendance/     # Bảng danh sách & điểm danh học sinh
│   │   ├── class-manager/  # Modal thêm, sửa, đổi lớp học
│   │   ├── data-transfer/  # Modal nạp/xuất Excel (CSV)
│   │   ├── lucky-wheel/    # Canvas Vòng quay may mắn & danh sách điều kiện
│   │   ├── ranking/        # Bảng vinh danh & Bục Podium Top 3
│   │   └── supabase-sync/  # Client & Service kết nối Supabase Cloud
│   ├── hooks/              # Custom React Hooks (useClassroom)
│   ├── services/           # Web Audio API Sound Engine
│   ├── styles/             # Global CSS & Tailwind utilities
│   ├── types/              # Định nghĩa kiểu dữ liệu TypeScript
│   ├── App.tsx             # Component gốc kết nối toàn bộ tính năng
│   └── main.tsx            # Entry point ứng dụng React 18
├── .env.example            # Bản mẫu biến môi trường
├── package.json            # Cấu hình dự án & dependencies
├── tailwind.config.js      # Cấu hình Tailwind CSS
├── tsconfig.json           # Cấu hình TypeScript
├── vercel.json             # Cấu hình tối ưu Vercel SPA routing & Headers
└── vite.config.ts          # Cấu hình Vite build tool
```
