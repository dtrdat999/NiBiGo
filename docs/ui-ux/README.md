# UI/UX Documentation Overview — NiBiGo AI Travel Platform

**Project:** NiBiGo AI Travel Platform  
**AI assistant:** NiBi AI  
**Scope:** Ninh Bình travel commerce platform with AI planning, booking request, product/content management, and role-based operation  
**Version:** v1.0  
**Owner:** Đặng Trần Đạt  

---

## 1. Mục đích tài liệu

Thư mục này mô tả cấu trúc giao diện và workflow UI/UX cho toàn bộ hệ thống NiBiGo AI Travel Platform.

Mục tiêu không chỉ là liệt kê màn hình, mà là làm rõ:

- Mỗi role vào hệ thống để hoàn thành công việc gì.
- Mỗi role có những trang nào.
- Mỗi trang phục vụ quyết định hoặc thao tác nào.
- Người dùng đi qua workflow nào từ điểm bắt đầu đến kết quả cuối.
- Dữ liệu nào được đọc, tạo, cập nhật sau từng bước.
- NiBi AI hỗ trợ ở đâu và giới hạn ở đâu.
- Trạng thái hệ thống cần hiển thị ra sao: loading, empty, error, success, permission denied.

---

## 2. Cấu trúc file UI/UX đã tối ưu

```txt
docs/ui-ux/
├── README.md
├── 01-buyer-ui-structure-workflow.md
├── 02-sales-ui-structure-workflow.md
├── 03-editor-mod-ui-structure-workflow.md
└── 04-admin-ui-structure-workflow.md
```

Cách chia này phù hợp cho dự án solo vì mỗi role có một file riêng, dễ đọc, dễ phát triển UI, dễ chuyển thành task frontend/backend.

---

## 3. Vai trò chính trong hệ thống

| Role | Mục tiêu chính | Trọng tâm UI/UX |
|---|---|---|
| BUYER | Khám phá, lập kế hoạch, so sánh và gửi yêu cầu đặt dịch vụ du lịch | Dễ hiểu, minh bạch giá, AI hỗ trợ quyết định, ít bước |
| SALES | Xử lý booking/order, liên hệ khách, cập nhật trạng thái | Queue rõ ràng, thông tin khách đầy đủ, thao tác nhanh |
| EDITOR/MOD | Quản lý tour, khách sạn, homestay, xe, trải nghiệm, combo, bài viết | Form nhập liệu chuẩn, preview tốt, giảm sai dữ liệu |
| ADMIN | Quản trị toàn hệ thống, user, role, approval, booking/order, cấu hình | Kiểm soát, an toàn, audit rõ ràng, tránh thao tác nhầm |

---

## 4. High-level platform structure

```txt
Public Website / Landing
    ↓
Authentication
    ↓
Role-based Redirect
    ├── BUYER Dashboard
    ├── SALES Dashboard
    ├── EDITOR/MOD Dashboard
    └── ADMIN Dashboard
```

---

## 5. Sitemap tổng quan

```txt
/
├── /login
├── /register
├── /buyer
│   ├── /buyer/dashboard
│   ├── /buyer/explore
│   ├── /buyer/products
│   ├── /buyer/products/:id
│   ├── /buyer/ai-planner
│   ├── /buyer/ai-planner/results/:planId
│   ├── /buyer/booking-request/:id
│   └── /buyer/bookings
│
├── /sales
│   ├── /sales/dashboard
│   ├── /sales/bookings
│   ├── /sales/bookings/:id
│   ├── /sales/orders
│   └── /sales/notes
│
├── /editor
│   ├── /editor/dashboard
│   ├── /editor/products
│   ├── /editor/products/new
│   ├── /editor/products/:id/edit
│   ├── /editor/articles
│   ├── /editor/articles/new
│   └── /editor/articles/:id/edit
│
└── /admin
    ├── /admin/dashboard
    ├── /admin/users
    ├── /admin/roles
    ├── /admin/approvals
    ├── /admin/products
    ├── /admin/bookings
    ├── /admin/orders
    ├── /admin/settings
    └── /admin/audit-logs
```

---

## 6. High-level workflow toàn hệ thống

```txt
Buyer nhập nhu cầu
→ NiBi AI tạo gợi ý cá nhân hóa
→ Backend kiểm tra dữ liệu sản phẩm, giá, trạng thái còn chỗ
→ Buyer xem lịch trình, chi phí, bản đồ, lý do đề xuất
→ Buyer chỉnh tour hoặc chọn dịch vụ
→ Buyer gửi booking request/order
→ Sales nhận booking và xử lý
→ Editor/MOD cập nhật dữ liệu sản phẩm/nội dung khi cần
→ Admin giám sát, duyệt, phân quyền và xử lý vấn đề hệ thống
```

---

## 7. Nguyên tắc thiết kế chung

### 7.1 Small scope, premium execution

MVP không cần có mọi tính năng như một OTA lớn. Nhưng các luồng đã có phải mượt, rõ và đủ tin cậy.

### 7.2 AI suggests, system verifies

NiBi AI được dùng để hiểu nhu cầu, đề xuất lịch trình, giải thích lý do và tạo sales note.  
Backend chịu trách nhiệm tính giá cuối, kiểm tra availability, lưu booking, phân quyền và xác thực dữ liệu.

### 7.3 Transparent pricing

Mỗi gợi ý phải có cost breakdown rõ:

- Giá lưu trú
- Giá tour/hoạt động
- Giá phương tiện
- Giá ăn uống
- Phí nền tảng hoặc phí dịch vụ nếu có
- Tổng tạm tính
- Điều kiện cần xác nhận lại

### 7.4 Human-in-the-loop

Booking du lịch thực tế có nhiều biến số. MVP cần thể hiện rõ rằng request đã được lưu và Sales/Admin sẽ xác nhận, thay vì giả vờ rằng hệ thống đã đặt thật.

### 7.5 Local-first travel UX

Giao diện nên tạo cảm giác Ninh Bình: thiên nhiên, sông nước, núi đá vôi, văn hóa địa phương, trải nghiệm bản địa.

---

## 8. Trạng thái chung cần có trên mọi role

| State | Ý nghĩa | UI cần hiển thị |
|---|---|---|
| Loading | Đang tải dữ liệu | Skeleton/card shimmer/spinner nhẹ |
| Empty | Chưa có dữ liệu | Empty state + CTA tiếp theo |
| Error | Có lỗi hệ thống hoặc lỗi dữ liệu | Thông báo rõ + hành động thử lại |
| Success | Thao tác thành công | Toast/confirmation rõ |
| Permission denied | Role không có quyền | Trang 403 hoặc redirect phù hợp |
| Pending confirmation | Cần người xác nhận | Badge trạng thái + giải thích |
| Draft | Chưa publish/chưa gửi | Badge nháp + CTA tiếp tục |
| Archived/Cancelled | Không còn hoạt động | Badge rõ, hạn chế CTA sai |

---

## 9. Definition of Done cho mỗi màn hình UI

Một màn hình được coi là đủ cho MVP khi có:

- Tên màn hình.
- Role được phép truy cập.
- Mục tiêu màn hình.
- Entry point.
- Exit point.
- Thành phần giao diện chính.
- Primary action.
- Secondary action.
- Dữ liệu đọc.
- Dữ liệu tạo/cập nhật.
- Loading/empty/error/success state.
- Permission rule.
- Responsive rule cơ bản.
- Acceptance criteria.

---

## 10. Thứ tự nên triển khai UI

Khuyến nghị triển khai theo thứ tự:

```txt
1. Auth + role-based redirect
2. Buyer Dashboard
3. Buyer AI Planner
4. AI Recommendation Result
5. Booking Request
6. Sales Dashboard + Booking Detail
7. Editor Product Management
8. Admin Dashboard + Approval
```

Lý do: demo sản phẩm cần chứng minh được luồng giá trị chính trước, sau đó mới mở rộng sang vận hành nội bộ.

---

## 11. MVP demo flow đề xuất

```txt
1. Buyer đăng ký/đăng nhập.
2. Buyer nhập nhu cầu đi Ninh Bình.
3. NiBi AI tạo 3 gợi ý: tiết kiệm, cân bằng, trải nghiệm.
4. Buyer xem cost breakdown và itinerary.
5. Buyer yêu cầu chỉnh lịch trình.
6. Hệ thống cập nhật lịch trình và tính lại giá.
7. Buyer gửi booking request.
8. Sales mở dashboard và xử lý booking.
9. Editor/MOD cập nhật sản phẩm.
10. Admin duyệt sản phẩm và xem dashboard.
```

Demo thành công khi người xem hiểu rõ: NiBiGo không chỉ là chatbot, mà là một nền tảng commerce du lịch có AI hỗ trợ ra quyết định và có workflow vận hành thật.
