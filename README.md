# 📦 ChronosPlan - Schedule & Expense Management App

> **ChronosPlan** là ứng dụng web quản lý lịch trình chuyến đi, phân quyền thành viên, theo dõi chi tiêu thời gian thực ("Ai nợ ai bao nhiêu") và kéo-thả sự kiện chuyên nghiệp với giao diện **Moo-dern Aesthetic**.

---

## 📁 Cấu Trúc Dự Án (Project Structure)

```
📦 schedule-management-app
├── 📁 .github/workflows  # Cấu hình CI/CD tự động build & test
├── 📁 docs               # Tài liệu sơ đồ kiến trúc và quy trình
├── 📁 src
│   ├── 📁 assets         # Biểu tượng, hình ảnh, font chữ
│   ├── 📁 components     # UI Components dùng chung
│   │   └── 📁 Layout     # Main Layout, Navbar, Sidebar
│   ├── 📁 features       # Các module tính năng chính
│   │   ├── 📁 Auth       # Đăng nhập, Đăng ký & Phân quyền
│   │   ├── 📁 Dashboard  # Widget sự kiện realtime, Tóm tắt nhanh
│   │   ├── 📁 Schedule   # Timeline, Kéo-thả (Drag & Drop), 24H Slider, Con bò Realtime
│   │   ├── 📁 Members    # Danh sách thành viên, vai trò nhiệm vụ
│   │   ├── 📁 Expenses   # Lịch sử giao dịch, Bảng tính "Ai nợ ai bao nhiêu"
│   │   └── 📁 Statistics # Biểu đồ hoạt động, trạng thái, dòng tiền
│   ├── 📁 hooks          # Custom React hooks
│   ├── 📁 router         # Điều hướng trang (Main Router)
│   ├── 📁 services       # Kết nối Firebase & APIs
│   ├── 📁 store          # Quản lý State toàn cục (AuthContext, TripContext)
│   ├── 📁 utils          # Hàm tiện ích (Format tiền tệ, thời gian, thuật toán chia tiền)
│   └── 📄 App.jsx        # Entry point ứng dụng
├── 📄 .env.example       # Mẫu biến môi trường
├── 📄 .gitignore         # Chặn push node_modules, .env, dist
├── 📄 README.md          # Tài liệu dự án
└── 📄 package.json
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu hệ thống
- Node.js version 18.x trở lên
- npm hoặc yarn

### 2. Khởi chạy môi trường phát triển (Development)
```bash
# Cài đặt các thư viện phụ thuộc
npm install

# Khởi chạy dev server
npm run dev
```

### 3. Build ứng dụng sản xuất (Production Build)
```bash
npm run build
```

---

## ✨ Tính Năng Nổi Bật

1. **Lịch trình Kéo – Thả (Drag & Drop) & Realtime Engine**:
   - Trục thời gian 24 giờ với thanh trượt mượt mà.
   - Con bò 🐮 tự động chạy rọi theo giờ thực tế của hệ thống.
   - Tự động chuyển sự kiện sang `Đang diễn ra` hoặc `Đã xong`.
2. **Phân Quyền Lead vs Member**:
   - `Lead`: Toàn quyền duyệt/từ chối sự kiện, xóa/sửa bất kỳ sự kiện nào.
   - `Member`: Đề xuất sự kiện (`Chờ duyệt`), chỉnh sửa/xóa sự kiện đề xuất của chính mình.
3. **Bảng Tính "Ai Nợ Ai Bao Nhiêu"**:
   - Tự động chia đều chi phí theo số lượng thành viên tham gia.
   - Thuật toán quyết toán thông minh đưa ra gợi ý chuyển khoản tối ưu nhất.
4. **Đồng Bộ Dữ Liệu Thời Gian Thực**:
   - Tích hợp Firebase Auth & Firestore đồng bộ tức thời.
