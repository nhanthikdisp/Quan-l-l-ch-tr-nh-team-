# 📦 Quản Lí Lịch Trình - Schedule & Expense Management App

> **Quản Lí Lịch Trình** là ứng dụng web quản lý lịch trình chuyến đi, phân quyền thành viên (**Leader** & **Member**), theo dõi chi tiêu thời gian thực ("Ai nợ ai bao nhiêu"), phân bổ khoản chi đa người ứng trả và kéo-thả sự kiện trên trục thời gian 24H.

---

## 🛠️ Hướng Dẫn Kích Hoạt Chế Độ Debug & Bảo Trì (Developer Guide)

### 1. Khởi Tạo Môi Trường Từ File `.env.example`
Khi kéo dự án về máy mới, chạy câu lệnh sau để tạo file cấu hình cá nhân:
```bash
# Trên Windows (PowerShell / CMD)
copy .env.example .env

# Trên macOS / Linux
cp .env.example .env
```

### 2. Chế Độ Sản Phẩm (Production Mode - Mặc định)
- Đặt `VITE_ENABLE_DEBUG_MODE=false` trong file `.env`.
- Khi người dùng truy cập web, ứng dụng sẽ **khởi đầu trực tiếp từ Màn hình Đăng nhập/Đăng ký (`AuthPage`)**.
- Bắt buộc xác thực tài khoản qua Firebase Auth & Cloud Firestore.
- Tích hợp nút **Đăng Xuất (Logout)** ở góc trên Header.

### 3. Kích Hoạt Chế Độ Debug / Thử Nghiệm Nhanh (Debug Mode)
Dành cho nhà phát triển muốn thử nghiệm chuyển đổi nhanh giữa quyền **Leader** và **Member** trên cùng 1 trang web:
1. Mở file `.env` và sửa:
   ```env
   VITE_ENABLE_DEBUG_MODE=true
   ```
2. Lưu file và tải lại ứng dụng:
   - Tại trang Đăng ký/Đăng nhập: Xuất hiện nút **Vào làm Lead** / **Vào làm Member** để đăng nhập thử nghiệm 1 click.
   - Tại Header góc phải: Xuất hiện dropdown **Tài khoản (Debug)** cho phép đổi vai trò người dùng tức thì.

---

## 🔒 Bảo Mật & File `.gitignore`

File `.gitignore` được cấu hình để chặn các file nhạy cảm và thư mục tạm không bao giờ được push lên Git/GitHub:
- **`node_modules/`**: Thư mục phụ thuộc mã nguồn (kích thước lớn).
- **`dist/`**: Thư mục sản phẩm sau khi build.
- **`.env`**: File chứa API Key và mật khẩu kết nối Firebase thực tế *(Không push file này)*.
- **`.env.example`**: Được lưu trên Git làm mẫu để lập trình viên khác biết các biến cần thiết.

---

## 💻 Các Lệnh Thao Tác & Bảo Trì Mã Nguồn

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển (Development Server)
npm run dev

# 3. Kiểm tra cú pháp mã nguồn (Linting Check)
npm run lint

# 4. Biên dịch dự án sản xuất (Production Build)
npm run build

# 5. Xem trước bản build sản xuất
npm run preview
```

---

## 📁 Cấu Trúc Dự Án (Project Structure)

```
📦 quan-li-lich-trinh
├── 📁 docs               # Tài liệu kiến trúc & sơ đồ dự án
├── 📁 src
│   ├── 📁 assets         # Hình ảnh, icon, font chữ
│   ├── 📁 components     # UI Components dùng chung (Header, Navigation...)
│   ├── 📁 features       # Các module tính năng chính
│   │   ├── 📁 Auth       # Đăng nhập, Đăng ký & Phân quyền (Firebase Auth)
│   │   ├── 📁 Dashboard  # Widget sự kiện realtime, Tóm tắt nhanh
│   │   ├── 📁 Schedule   # Timeline 24H, Kéo-thả (Drag & Drop)
│   │   ├── 📁 Members    # Danh sách thành viên, phân quyền Leader/Member
│   │   ├── 📁 Expenses   # Phân bổ khoản chi, Bảng tính "Ai nợ ai bao nhiêu"
│   │   └── 📁 Statistics # Biểu đồ hoạt động, trạng thái, chi phí
│   ├── 📁 router         # Điều hướng ứng dụng (AppRouter.jsx)
│   ├── 📁 services       # Kết nối Firebase SDK (firebase.js)
│   ├── 📁 store          # Quản lý State toàn cục (AuthContext, TripContext)
│   └── 📁 utils          # Hàm tiện ích & Thuật toán tính toán chi phí (expenseCalculations.js)
├── 📄 .env               # Cấu hình môi trường thực tế (API Key, Debug Flag)
├── 📄 .env.example       # Mẫu biến môi trường phục vụ sao chép
├── 📄 .gitignore         # Danh sách file chặn không push lên Git
└── 📄 README.md          # Tài liệu hướng dẫn sử dụng & bảo trì
```

---

## ✨ Các Tính Năng Nghiệp Vụ Chính

1. **Quản Lý Event (CRUD)**:
   - Tạo/sửa/xóa event với đầy đủ thông tin: Title, mô tả, khung giờ, địa điểm, loại hoạt động, số tiền.
   - Luồng duyệt: Event do Member tạo ở trạng thái `Chờ duyệt`, Leader có quyền duyệt sang `Sắp tới`.
2. **Quản Lý Thời Gian & Realtime Engine**:
   - Trục thời gian 24H với tính năng **Kéo – Thả (Drag & Drop)** đổi khung giờ & hàng hiển thị.
   - Tự động kiểm tra thời gian thực: `Sắp tới ➔ Đang diễn ra ➔ Đã xong`.
3. **Phân Quyền Nhóm (1 Leader - Multiple Members)**:
   - `Leader`: Quyền quản trị toàn bộ (duyệt event, xóa thành viên, phân bổ khoản chi).
   - `Member`: Đề xuất sự kiện và quản lý sự kiện do mình tạo.
4. **Quản Lý Chi Tiêu & Phân Bổ Nhiều Khoản Chi**:
   - Hỗ trợ 1 sự kiện có **nhiều khoản chi tiêu ứng trả bởi nhiều người khác nhau**.
   - Tự động tính mức chia đều và kết quả **"Ai nợ ai bao nhiêu"** kèm gợi ý chuyển khoản tối ưu.
5. **Thống Kê Tổng Quan**:
   - Thống kê tỷ lệ loại hoạt động, trạng thái sự kiện và tổng kết tài chính chuyến đi.
