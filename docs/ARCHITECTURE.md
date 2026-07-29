# Tài liệu Kiến trúc Dự án ChronosPlan (Schedule Management App)

## 1. Tổng quan Sơ đồ Kiến trúc & Luồng Dữ liệu

Ứng dụng **ChronosPlan** được cấu trúc theo mô hình **Feature-Based Clean Architecture** dành cho ứng dụng React Web chuyên nghiệp.

```
[ UI Components / Layout ] ──> [ Features Layer (Auth, Schedule, Members, Expenses, Statistics) ]
                                          │
                                          ▼
                               [ State Store (Context) ]
                                          │
                                          ▼
                               [ Services / Firebase SDK ]
```

## 2. Các Module Chính (Features)

1. **`Auth`**: Quản lý Xác thực thành viên, Đăng nhập, Đăng ký và Phân quyền (`Lead` vs `Member`).
2. **`Dashboard`**: Trang chủ hiển thị Widget sự kiện thời gian thực (Realtime Engine) và các chỉ số tóm tắt nhanh.
3. **`Schedule`**: Quản lý Lịch trình chính với Lưới Track Timeline, Kéo-thả (Drag & Drop), Thanh trượt 24H, Con bò chạy thời gian thực và Khu vực xét duyệt của Lead.
4. **`Members`**: Quản lý danh sách thành viên, phân công vai trò nhiệm vụ (`Dẫn đoàn`, `Xem map`, `Nấu ăn`, `Chụp hình`...) và đổi phân quyền Lead/Member.
5. **`Expenses`**: Quản lý thu chi từng sự kiện, bảng tính *"Ai nợ ai bao nhiêu"* và đề xuất giao dịch quyết toán tối ưu.
6. **`Statistics`**: Thống kê báo cáo dưới dạng biểu đồ sinh động về Loại hoạt động, Trạng thái sự kiện và Dòng tiền.

## 3. Phân quyền Người dùng (Role-Based Access Control)

- **`Lead` (Trưởng đoàn)**:
  - Toàn quyền tạo, sửa, xóa bất kỳ sự kiện nào.
  - Xét duyệt (`Approve`) hoặc Từ chối (`Reject`) các đề xuất sự kiện từ Member.
  - Quản lý danh sách thành viên, thay đổi vai trò hệ thống hoặc xóa thành viên.
- **`Member` (Thành viên thường)**:
  - Tạo đề xuất sự kiện mới (vào trạng thái `Chờ duyệt`).
  - Được sửa hoặc xóa các đề xuất sự kiện do chính mình tạo khi còn ở trạng thái `Chờ duyệt`.
  - Không được xóa hoặc sửa các sự kiện đã được duyệt.
