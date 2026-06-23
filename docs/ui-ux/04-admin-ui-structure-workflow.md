# 04. Admin UI Structure & Workflow — NiBiGo AI Travel Platform

**Role:** ADMIN  
**Primary user:** Chủ nền tảng/người quản trị hệ thống  
**Goal:** Quản trị user, role, sản phẩm, nội dung, booking/order, approval, cấu hình và giám sát toàn hệ thống  

---

## 1. Admin UX Objective

Admin cần giao diện để kiểm soát hệ thống chứ không chỉ thao tác nội dung.

Admin UI phải giúp trả lời:

- Hệ thống hôm nay đang có bao nhiêu booking/order?
- Booking nào có vấn đề?
- Sản phẩm/nội dung nào đang chờ duyệt?
- User nào có role gì?
- Dữ liệu nào có rủi ro sai?
- Cấu hình nào ảnh hưởng đến AI, payment, maps, commerce?
- Ai đã thay đổi gì trong hệ thống?

---

## 2. Admin Navigation Structure

```txt
Admin App
├── Dashboard
├── Users
├── Roles & Permissions
├── Booking / Order Oversight
├── Product Management
├── Approval Queue
├── Content Management
├── AI / System Settings
├── Commerce Settings
├── Maps / Location Settings
├── Audit Logs
└── Reports / Analytics
```

---

## 3. Admin Main Screens

| Screen | Route | Mục tiêu |
|---|---|---|
| Admin Dashboard | `/admin/dashboard` | Tổng quan toàn hệ thống |
| Users | `/admin/users` | Quản lý tài khoản |
| Roles & Permissions | `/admin/roles` | Quản lý phân quyền |
| Approvals | `/admin/approvals` | Duyệt product/content |
| Products | `/admin/products` | Giám sát danh mục sản phẩm |
| Bookings | `/admin/bookings` | Theo dõi booking toàn hệ thống |
| Orders | `/admin/orders` | Theo dõi order/payment status |
| AI Settings | `/admin/settings/ai` | Cấu hình AI provider/prompt/rule |
| Commerce Settings | `/admin/settings/commerce` | Cấu hình fee/payment/order |
| Maps Settings | `/admin/settings/maps` | Cấu hình location/map |
| Audit Logs | `/admin/audit-logs` | Xem lịch sử thay đổi |
| Analytics | `/admin/analytics` | Theo dõi KPI sản phẩm/kinh doanh |

---

## 4. Admin Dashboard Structure

### 4.1 Mục tiêu

Admin nhìn được sức khỏe tổng quan của nền tảng.

### 4.2 UI Components

- KPI cards:
  - Total users.
  - New bookings.
  - Confirmed bookings.
  - Pending approvals.
  - Published products.
  - Sold out/limited products.
  - Estimated revenue/GMV nếu có.
- Booking/order trend.
- Approval queue preview.
- Recent system activity.
- AI usage/cost summary nếu MVP có log.
- Alerts:
  - Booking pending quá lâu.
  - Product thiếu dữ liệu.
  - Availability conflict.
  - Failed AI generation.
  - Payment/order inconsistency.

---

## 5. User Management Workflow

### 5.1 User List UI

Components:

- Search user.
- Filter by role.
- Filter by status.
- User table.
- Create user nếu cần.
- Role change action.
- Disable/enable user.

### 5.2 User Table Fields

| Field | Ý nghĩa |
|---|---|
| Name | Tên user |
| Email | Email |
| Role | BUYER/SALES/EDITOR/MOD/ADMIN |
| Status | Active/Disabled |
| Created at | Ngày tạo |
| Last login | Lần đăng nhập gần nhất |
| Actions | View/Edit/Disable |

### 5.3 Main Flow

```txt
Admin vào Users
→ Tìm user
→ Mở user detail
→ Xem thông tin và role
→ Cập nhật role hoặc trạng thái
→ Confirm action
→ Hệ thống lưu thay đổi và ghi audit log
```

### 5.4 Business Rules

- Admin không nên tự xóa chính mình.
- Đổi role cần confirmation.
- Disable user không xóa dữ liệu lịch sử.
- Mọi thay đổi role/status phải ghi audit log.
- Chỉ Admin có quyền đổi role.

---

## 6. Roles & Permissions Structure

### 6.1 Role Matrix

| Feature | BUYER | SALES | EDITOR/MOD | ADMIN |
|---|---:|---:|---:|---:|
| View public products | Yes | Yes | Yes | Yes |
| Use AI Planner | Yes | Optional | No | Optional |
| Create booking request | Yes | No | No | Yes |
| View own bookings | Yes | No | No | Yes |
| View all bookings | No | Assigned/Allowed | No | Yes |
| Update booking status | No | Yes | No | Yes |
| Create product/article | No | No | Yes | Yes |
| Submit for review | No | No | Yes | Yes |
| Approve product/content | No | No | No | Yes |
| Manage users | No | No | No | Yes |
| Manage system settings | No | No | No | Yes |

---

## 7. Product/Content Approval Workflow

### 7.1 Objective

Admin kiểm soát chất lượng dữ liệu trước khi sản phẩm/nội dung được publish.

### 7.2 Approval Queue UI

- Pending products.
- Pending articles.
- Rejected items.
- Filter by type/editor/date.
- Preview.
- Approve / Reject / Request changes.

### 7.3 Approval Detail UI

Hiển thị:

- Product/article preview.
- Editor/MOD info.
- Submitted time.
- Changed fields.
- Missing field warning.
- Price/availability warning.
- Tags/suitable_for.
- SEO fields nếu article.
- CTA:
  - Approve.
  - Reject.
  - Request changes.

### 7.4 Main Flow

```txt
Editor/MOD submit product/article
→ Admin nhận trong Approval Queue
→ Admin mở detail
→ Kiểm tra thông tin
→ Preview
→ Approve hoặc Request changes
→ Hệ thống cập nhật status
→ Editor/MOD nhận trạng thái mới
```

### 7.5 Business Rules

- Product Published mới được Buyer thấy.
- Product Published mới được NiBi AI dùng trong recommendation.
- Product thiếu price/tag/availability không nên được approve.
- Reject/request changes cần có reason.
- Approval action phải ghi audit log.

---

## 8. Booking/Order Oversight Workflow

### 8.1 Objective

Admin giám sát toàn bộ booking/order, can thiệp khi cần.

### 8.2 Booking Oversight UI

- Booking table toàn hệ thống.
- Filter by status, sales, travel date, amount.
- Booking detail.
- Assign sales.
- Update status nếu cần.
- View activity log.

### 8.3 Main Flow

```txt
Admin vào Bookings
→ Lọc booking cần xem
→ Mở booking detail
→ Xem thông tin khách, plan, cost, sales note
→ Kiểm tra trạng thái xử lý
→ Assign/Reassign Sales nếu cần
→ Can thiệp trạng thái nếu cần
→ Hệ thống ghi audit log
```

### 8.4 Business Rules

- Admin có quyền xem toàn bộ booking/order.
- Admin có thể assign/reassign Sales.
- Admin có thể override trạng thái, nhưng cần ghi lý do.
- Booking/order liên quan thanh toán cần hạn chế thao tác nguy hiểm.

---

## 9. System Settings Structure

### 9.1 AI Settings

Admin có thể cấu hình:

- AI provider.
- Model name.
- System prompt version.
- RAG/search settings nếu có.
- AI safety rules.
- Max token/cost limit.
- Enable/disable AI features.

### 9.2 Commerce Settings

- Platform fee.
- Service fee.
- Payment mode.
- Mock payment setting.
- Booking code format.
- Order status rules.

### 9.3 Maps Settings

- Google Maps API key.
- Default destination.
- Map display settings.
- Location requirement rules.

### 9.4 Notification Settings

MVP có thể để future-ready:

- Email notifications.
- Zalo OA future toggle.
- Booking status notification templates.

---

## 10. Audit Logs

### 10.1 Objective

Admin biết ai đã thay đổi gì.

### 10.2 Log Events

- User role changed.
- User disabled/enabled.
- Product created/updated/deleted/archived.
- Product approved/rejected.
- Article approved/rejected.
- Booking status changed.
- Order status changed.
- Sales assigned/reassigned.
- System settings changed.
- AI settings changed.

### 10.3 Audit Log UI Fields

| Field | Ý nghĩa |
|---|---|
| Time | Thời gian |
| Actor | Người thao tác |
| Role | Role của actor |
| Action | Hành động |
| Entity | Đối tượng bị tác động |
| Old value | Giá trị cũ |
| New value | Giá trị mới |
| Reason | Lý do nếu có |

---

## 11. Admin Safety UX

Các thao tác nguy hiểm cần confirmation:

- Đổi role.
- Disable user.
- Approve/publish product.
- Archive product.
- Cancel booking/order.
- Override booking/order status.
- Đổi AI provider/model.
- Đổi payment/commerce settings.

Confirmation nên hiển thị:

```txt
Bạn sắp thực hiện thao tác có ảnh hưởng đến hệ thống.
Hành động: [action]
Đối tượng: [entity]
Tác động: [impact]
Vui lòng xác nhận để tiếp tục.
```

---

## 12. Admin UI Acceptance Criteria

Admin flow đạt MVP khi:

- Admin đăng nhập được.
- Admin xem được dashboard tổng quan.
- Admin quản lý được users.
- Admin đổi được role với confirmation.
- Admin xem được booking/order toàn hệ thống.
- Admin assign/reassign Sales được.
- Admin duyệt/reject product/content được.
- Admin xem được audit logs.
- Admin cấu hình được ít nhất các setting cơ bản nếu MVP cần.
- Mọi thao tác quan trọng có audit log.
- Admin không thể thao tác nguy hiểm mà không có confirmation.
