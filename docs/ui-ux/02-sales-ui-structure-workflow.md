# 02. Sales UI Structure & Workflow — NiBiGo AI Travel Platform

**Role:** SALES  
**Primary user:** Nhân viên tư vấn và xử lý booking/order  
**Goal:** Giúp Sales xử lý nhanh booking request, hiểu nhu cầu khách, liên hệ đúng lúc và cập nhật trạng thái rõ ràng  

---

## 1. Sales UX Objective

Sales không cần giao diện đẹp kiểu marketing. Sales cần giao diện giúp trả lời nhanh:

- Booking nào mới?
- Booking nào cần xử lý gấp?
- Khách cần gì?
- Gói AI đề xuất là gì?
- Tổng chi phí tạm tính bao nhiêu?
- Có dịch vụ nào cần xác nhận lại không?
- Đã liên hệ khách chưa?
- Bước tiếp theo là gì?

---

## 2. Sales Navigation Structure

```txt
Sales App
├── Dashboard
├── Booking Requests
│   ├── New
│   ├── Contacted
│   ├── Confirmed
│   └── Cancelled
├── Orders
├── Booking Detail
├── Customer Notes
├── AI Sales Notes
└── Profile
```

---

## 3. Sales Main Screens

| Screen | Route | Mục tiêu |
|---|---|---|
| Sales Dashboard | `/sales/dashboard` | Tổng quan booking/order cần xử lý |
| Booking Queue | `/sales/bookings` | Danh sách booking request |
| Booking Detail | `/sales/bookings/:id` | Xem chi tiết và xử lý booking |
| Orders | `/sales/orders` | Xử lý order/demo commerce |
| Customer Notes | `/sales/notes` | Ghi chú chăm sóc khách |
| Profile | `/sales/profile` | Thông tin tài khoản Sales |

---

## 4. Sales Dashboard Structure

### 4.1 Mục tiêu

Sales vào dashboard là biết ngay hôm nay cần xử lý gì.

### 4.2 UI Components

- KPI cards:
  - New requests.
  - Contacted.
  - Confirmed.
  - Cancelled.
  - Pending confirmation.
- Booking priority queue.
- Recent booking activity.
- Upcoming travel dates.
- High-value leads.
- AI suggested follow-up.
- Search/filter shortcut.

### 4.3 Priority Logic

Booking nên được ưu tiên theo:

```txt
Travel date gần
→ Booking mới chưa liên hệ
→ Budget cao
→ Gói premium/combo
→ Có yêu cầu đặc biệt
→ Availability limited
```

---

## 5. Booking Queue Screen

### 5.1 Objective

Sales lọc, tìm và chọn booking cần xử lý.

### 5.2 UI Components

- Search by booking code/customer name/phone.
- Status tabs.
- Date filter.
- Travel date filter.
- Budget filter.
- Assigned to me filter.
- Booking table/list.

### 5.3 Booking Row Fields

| Field | Ý nghĩa |
|---|---|
| Booking code | Mã yêu cầu |
| Customer | Tên khách |
| Phone | Số điện thoại |
| Travel date | Ngày đi |
| People | Số người |
| Package | Gói được chọn |
| Estimated total | Tổng tạm tính |
| Status | New/Contacted/Confirmed/Cancelled |
| Last updated | Lần cập nhật gần nhất |
| Assigned sales | Người phụ trách |

### 5.4 Primary Actions

- Open detail.
- Assign to me.
- Update status.
- Add quick note.

---

## 6. Booking Detail Screen

### 6.1 Objective

Đây là màn hình quan trọng nhất của Sales. Sales cần đủ thông tin để liên hệ khách và xử lý booking.

### 6.2 Layout đề xuất

```txt
Booking Detail
├── Header
│   ├── Booking code
│   ├── Status badge
│   ├── Assigned sales
│   └── Primary action buttons
│
├── Customer Information
├── Trip Requirements
├── AI Recommended Plan
├── Selected Services
├── Cost Breakdown
├── Availability / Confirmation Checklist
├── AI Sales Note
├── Internal Notes
└── Activity Timeline
```

---

## 7. Booking Detail Components

### 7.1 Header

Hiển thị:

- Booking code.
- Current status.
- Created time.
- Travel date.
- Assigned sales.
- CTA:
  - Mark as contacted.
  - Confirm booking.
  - Cancel booking.
  - Add note.

### 7.2 Customer Information

- Full name.
- Phone.
- Email.
- Preferred contact channel.
- Special request.

### 7.3 Trip Requirements

- Destination.
- Date range.
- Number of people.
- Budget.
- Travel style.
- Interests.
- Special requirements.

### 7.4 AI Recommended Plan

- Package name.
- Fit score.
- Itinerary summary.
- Reason for recommendation.
- Products/services included.
- Refinement history nếu có.

### 7.5 Cost Breakdown

- Accommodation.
- Transport.
- Activities.
- Food.
- Combo/package margin.
- Platform fee/service fee.
- Total estimated price.
- Payment status nếu có demo order.

### 7.6 Availability Checklist

Sales cần thấy rõ:

```txt
[ ] Hotel/homestay availability checked
[ ] Transport availability checked
[ ] Activity/tour availability checked
[ ] Restaurant/meal availability checked
[ ] Final price confirmed
[ ] Customer contacted
```

### 7.7 AI Sales Note

AI Sales Note nên gồm:

- Tóm tắt nhu cầu khách.
- Điểm quan tâm chính.
- Ngân sách.
- Lý do khách có khả năng mua.
- Rủi ro cần lưu ý.
- Gợi ý cách tư vấn.
- Upsell/cross-sell nếu hợp lý.

Ví dụ:

```txt
Khách đi nhóm gia đình 4 người, ưu tiên lịch nhẹ và hoạt động phù hợp trẻ em. Ngân sách ở mức trung bình, có khả năng phù hợp với Balanced Package. Nên nhấn mạnh sự minh bạch chi phí, lịch trình không quá mệt và lựa chọn homestay/khách sạn tiện di chuyển.
```

---

## 8. Sales Booking Handling Workflow

### 8.1 Main Flow

```txt
Sales đăng nhập
→ Vào Sales Dashboard
→ Xem booking mới
→ Mở booking detail
→ Đọc nhu cầu khách + AI sales note
→ Kiểm tra selected services và cost breakdown
→ Liên hệ khách
→ Ghi note nội bộ
→ Cập nhật trạng thái Contacted
→ Nếu khách đồng ý, kiểm tra availability
→ Cập nhật Confirmed
→ Nếu khách không tiếp tục, cập nhật Cancelled
```

### 8.2 Status Flow

```txt
New
→ Contacted
→ Confirmed
```

Hoặc:

```txt
New
→ Contacted
→ Cancelled
```

### 8.3 Business Rules

- Sales không được xóa booking.
- Sales chỉ cập nhật booking được phân quyền hoặc được assign.
- Confirmed chỉ được set khi đã xác nhận với khách và kiểm tra dịch vụ.
- Mọi thay đổi trạng thái cần ghi activity log.
- Nếu giá thay đổi, Sales phải ghi chú lý do.

---

## 9. Sales Order Handling Workflow

### 9.1 Objective

Xử lý order/demo commerce nếu Buyer đã tạo order hoặc thanh toán demo.

### 9.2 Flow

```txt
Sales vào Orders
→ Lọc order theo trạng thái
→ Mở order detail
→ Kiểm tra payment status
→ Kiểm tra dịch vụ trong order
→ Liên hệ khách nếu cần
→ Cập nhật order status
```

### 9.3 Order Status

| Status | Ý nghĩa |
|---|---|
| Pending | Order mới tạo, chưa xử lý |
| Awaiting Payment | Chờ thanh toán |
| Paid | Đã thanh toán |
| Confirmed | Đã xác nhận dịch vụ |
| Cancelled | Đã hủy |
| Refunded | Đã hoàn tiền, phase sau |

---

## 10. Internal Notes Workflow

### 10.1 Objective

Lưu lại lịch sử xử lý để tránh mất thông tin giữa các Sales/Admin.

### 10.2 Flow

```txt
Sales mở booking detail
→ Chọn Add internal note
→ Nhập ghi chú
→ Save
→ Note xuất hiện trong timeline
```

### 10.3 Note Types

- Contact attempt.
- Customer preference.
- Price discussion.
- Partner confirmation.
- Risk/warning.
- Follow-up reminder.

---

## 11. Sales Empty/Error States

### 11.1 Empty Booking Queue

```txt
Hiện chưa có booking mới.
Khi Buyer gửi booking request, yêu cầu sẽ xuất hiện tại đây.
```

### 11.2 Booking Not Assigned

```txt
Bạn chưa được phân công xử lý booking này.
Vui lòng liên hệ Admin nếu cần quyền truy cập.
```

### 11.3 Availability Conflict

```txt
Một hoặc nhiều dịch vụ trong gói hiện không còn khả dụng.
Vui lòng đề xuất dịch vụ thay thế trước khi xác nhận với khách.
```

---

## 12. Sales UI Acceptance Criteria

Sales flow đạt MVP khi:

- Sales đăng nhập được.
- Sales thấy dashboard booking/order.
- Sales xem được danh sách booking request.
- Sales mở được booking detail.
- Sales thấy nhu cầu khách, lịch trình AI, cost breakdown, selected services.
- Sales thấy AI sales note.
- Sales thêm được internal note.
- Sales cập nhật được trạng thái booking.
- Activity timeline ghi lại thay đổi.
- Sales không thể thao tác ngoài quyền.
