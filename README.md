# ChronosPlan - Quản Lý Lịch Trình & Task Thông Minh 🚀

**ChronosPlan** là ứng dụng quản lý lịch trình công việc và hoạt động cá nhân/đội ngũ theo thời gian thực (Timeline Canvas 24 giờ), được xây dựng trên nền tảng React và Vite với giao diện hiện đại, mượt mà và trực quan.

---

## 🌟 Các tính năng chính

- 📝 **Tạo Track Mới ("New Track") đầy đủ thông tin**:
  - Tiêu đề (Title), Mô tả chi tiết.
  - Khoảng thời gian (Giờ bắt đầu – Giờ kết thúc).
  - Địa điểm thực hiện (Location).
  - Phân loại hoạt động: *Ăn uống, Ngắm cảnh, Bonding, Công việc, Khác*.
  - Trạng thái linh hoạt: *Sắp tới ➔ Đang diễn ra ➔ Đã xong*, cùng trạng thái phụ *Hủy, Tạm hoãn*.
  - Tích chọn Đánh dấu đã hoàn thành.

- 💾 **Lưu Trữ Local Store (`localStorage`)**:
  - Tự động lưu và đồng bộ toàn bộ danh sách task vào `localStorage`. Dữ liệu được bảo toàn ngay cả khi tải lại trang hoặc đóng trình duyệt.
  - Hỗ trợ nút khôi phục dữ liệu mẫu (*Reset Local Store*).

- 📅 **Tích hợp Lịch Tương Tác trên Header**:
  - Chọn ngày bất kỳ từ bộ chọn lịch tương tác (`Date Picker`).
  - Nút chuyển ngày nhanh ⬅️ / ➡️ để xem task trong **Quá khứ** hoặc lên kế hoạch cho **Ngày tiếp theo (Tương lai)**.

- 📊 **Bảng Thống Kê Trạng Thái**:
  - Hiển thị bảng số liệu trực quan ngay dưới mục Task: *Đã hoàn thành, Chưa hoàn thành, Đang diễn ra, Sắp tới, Tạm hoãn, Đã hủy*.

- 🖐️ **Kéo Thả (Drag & Drop) & Nút Mũi Tên ⬆/⬇ Sắp Xếp**:
  - Kéo thả thẻ task trực tiếp trên lưới 24 giờ để thay đổi giờ bắt đầu và hàng vị trí.
  - Tích hợp 2 nút mũi tên **Lên ⬆ / Xuống ⬇** ngay trên thẻ task và trong Modal chi tiết giúp di chuyển hàng tiện lợi.

- 🔄 **Tự Động Hoán Đổi Vị Trí (Auto-Swap)**:
  - Khi kéo thả hoặc bấm nút di chuyển task A vào vị trí đang bị chiếm giữ bởi task B, hai task sẽ **tự động hoán đổi vị trí** cho nhau, tránh tình trạng đè lấn thông tin.

---

## 🛠️ Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
- **Node.js**: Phiên bản `v18.0.0` trở lên ([Tải Node.js](https://nodejs.org/))
- **npm**: Phiên bản `v9.0.0` trở lên (đi kèm sẵn với Node.js)
- **Git**: Trình quản lý mã nguồn ([Tải Git](https://git-scm.com/))

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy dự án

### Bước 1: Clone dự án về máy local

Mở Terminal / PowerShell / Git Bash và chạy lệnh:

```bash
git clone <URL_REPOSITORY_CỦA_BẠN>
```

Sau đó di chuyển vào thư mục dự án:

```bash
cd "Quan li lich trinh_Mini"
```

### Bước 2: Cài đặt các thư viện cần thiết

Chạy lệnh sau để tải và cài đặt tất cả các dependencies trong `package.json`:

```bash
npm install
```

### Bước 3: Khởi chạy dự án ở chế độ Development

Chạy lệnh để khởi tạo môi trường phát triển với Vite:

```bash
npm run dev
```

Sau khi chạy lệnh, Terminal sẽ hiển thị đường dẫn truy cập (mặc định là `http://localhost:5173`). Hãy mở trình duyệt web và truy cập đường dẫn trên để trải nghiệm ứng dụng.

---

## 📦 Các lệnh bổ sung (Scripts)

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Khởi chạy server phát triển local với tính năng Hot Reload (HMR) |
| `npm run build` | Đóng gói sản phẩm tối ưu cho môi trường Production (thư mục `/dist`) |
| `npm run preview` | Xem trước bản đóng gói Production trên máy local |
| `npm run lint` | Kiểm tra lỗi cú pháp mã nguồn với Oxlint |

---

## 📁 Cấu trúc dự án

```text
Quan li lich trinh_Mini/
├── public/                 # Các tài nguyên tĩnh (Icons, favicon...)
├── src/
│   ├── assets/             # Hình ảnh & tài nguyên ứng dụng
│   ├── components/
│   │   ├── TaskManagement.jsx   # Component chính xử lý Logic, Timeline & Modal
│   │   └── TaskManagement.css   # Style lưới Timeline & Scrollbar
│   ├── App.jsx             # Root Component
│   ├── App.css
│   ├── main.jsx            # Entry point của React App
│   └── index.css           # Global Styles
├── index.html              # HTML Template chính (chứa font Manrope & Material Icons)
├── package.json            # Thông tin dự án và thư viện phụ thuộc
├── vite.config.js          # Cấu hình Vite Build Tool
└── README.md               # Tài liệu hướng dẫn sử dụng
```

---

✨ *Chúc bạn có trải nghiệm tuyệt vời với **ChronosPlan**!*
