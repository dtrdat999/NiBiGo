# Sales UI Implementation Logic

Tài liệu này hợp nhất yêu cầu từ:

- `Sales UI Structure and Workflow.docx`
- `02-sales-ui-structure-workflow.md`
- `README.md`
- `DATA_SCHEMA.md`
- `AI_DESIGN.md`
- Schema và code đang có trong dự án.

## 1. Mục tiêu sản phẩm

Sales UI không tối ưu cho cảm giác khám phá như Buyer UI. Sales UI tối ưu cho ba việc:

1. Biết booking nào cần xử lý trước.
2. Hiểu đủ nhu cầu khách mà không phải mở nhiều màn hình.
3. Thực hiện bước tiếp theo đúng điều kiện và có lịch sử truy vết.

Mỗi màn hình phải trả lời rõ:

- Việc nào cần làm ngay?
- Booking đang vướng ở đâu?
- Thông tin nào còn thiếu?
- Sales được phép thực hiện hành động nào?
- Sau hành động này trạng thái nào sẽ thay đổi?

## 2. Phạm vi Sales MVP

### Làm trong MVP

- Sales Dashboard.
- Booking Queue.
- Booking Detail.
- Nhận booking chưa có người phụ trách.
- Thêm ghi chú nội bộ.
- Cập nhật trạng thái đúng workflow.
- Checklist xác nhận dịch vụ.
- Theo dõi follow-up.
- Activity timeline.
- AI Sales Note.
- Hiển thị payment status ở mức demo.

### Để sau MVP

- Thanh toán thật.
- Refund thật.
- Zalo API thật.
- Thay dịch vụ tự động hoàn chỉnh từ Sales UI.
- CRM customer 360 nâng cao.
- Bulk status update.
- Lead scoring bằng machine learning.

## 3. Route và layout

```text
/sales
├── /dashboard
├── /bookings
├── /bookings/:id
├── /orders
├── /notes
├── /ai-notes
└── /profile
```

### Sales Shell

- Desktop: sidebar trái cố định, top bar, workspace chính.
- Tablet: sidebar thu gọn.
- Mobile: điều hướng tối giản; chỉ ưu tiên Dashboard, Bookings, Search, Notes, Profile.
- Không dùng mascot dày đặc. Mascot chỉ nên xuất hiện ở empty/error state nếu thực sự giúp giải thích.
- Dùng cùng hệ màu thương hiệu nhưng mật độ thông tin cao hơn Buyer UI.

## 4. Role và quyền truy cập

### Cần bổ sung

- `/sales/:path*` vào middleware.
- `(sales)/sales/layout.tsx` kiểm tra role ở server.
- `requireSales()` cho API; cho phép `sales` và `admin`.
- Role-aware redirect sau đăng nhập:
  - Buyer → `/dashboard`
  - Sales → `/sales/dashboard`
  - Editor → `/editor/dashboard`
  - Admin → `/admin`
- Guest layout cần chặn Sales/Editor/Admin dùng nhầm Buyer workspace.

### Nguyên tắc quyền

- Sales xem booking được RLS cho phép.
- Sales nhận booking chưa assigned nếu policy cho phép.
- Sales chỉ cập nhật booking đã assigned cho mình.
- Admin có thể xem và điều phối tất cả.
- Sales không được xóa booking.
- Mọi mutation nghiệp vụ phải qua API server, không cập nhật DB trực tiếp từ client.

## 5. Dữ liệu hiện có và khoảng trống

### Có thể dùng ngay

- `booking_requests`
  - customer contact
  - estimated total
  - status
  - payment status
  - assigned sales
  - AI sales note
- `booking_status_logs`
- `sales_notes`
- `trip_requests`
- `tour_packages`
- `tour_package_items`
- `products`
- `profiles`
- `orders`, `order_items`, `order_status_logs`, `payments`

### Cần migration bổ sung

#### 5.1 Booking final price

Giữ `booking_requests.total_price` là giá dự kiến tại thời điểm Buyer gửi yêu cầu.

Thêm:

```text
final_price nullable
final_price_note nullable
final_price_confirmed_at nullable
```

Không ghi đè giá dự kiến vì Sales cần so sánh mức thay đổi và giải thích cho khách.

#### 5.2 Availability / confirmation checklist

Tạo `booking_checklist_items`:

```text
id
booking_request_id
key
label
status: pending | confirmed | conflict | not_applicable
note
checked_by
checked_at
created_at
updated_at
```

Các key MVP:

```text
accommodation
transport
activities
restaurants
final_price
customer_contacted
customer_agreed
internal_note
```

#### 5.3 Follow-up

Tạo `sales_follow_ups`:

```text
id
booking_request_id
assigned_sales_id
type
due_at
status: pending | completed | cancelled
content
outcome
completed_at
created_at
updated_at
```

#### 5.4 Internal note type

Mở rộng `sales_notes`:

```text
note_type
```

Các loại:

```text
contact_attempt
customer_preference
price_discussion
partner_confirmation
risk_warning
follow_up
general
```

#### 5.5 Preferred contact channel

Hiện dữ liệu mới được ghép trong `note_from_guest`. Nên thêm:

```text
preferred_contact_channel
preferred_contact_time
```

Booking cũ có thể fallback bằng cách đọc nội dung note.

### Chưa đủ dữ liệu để hiển thị thật

- Refinement history: hiện chỉ có `revision_count` và phiên bản hiện tại.
- Returning customer history: có thể suy ra từ số booking cùng `user_id`, chưa có customer profile riêng.
- Margin/platform fee: schema hiện chưa lưu.

Các mục này không được giả dữ liệu trong UI.

## 6. Booking priority logic

Priority được tính khi đọc dữ liệu, chưa cần lưu cứng trong DB ở MVP.

### Điểm gợi ý

| Điều kiện | Điểm |
|---|---:|
| Follow-up đã quá hạn | +35 |
| Ngày đi còn ≤ 3 ngày | +35 |
| Ngày đi còn 4–7 ngày | +22 |
| Booking mới chưa liên hệ | +25 |
| Chưa assigned | +15 |
| Có dịch vụ limited/conflict | +20 |
| Có yêu cầu đặc biệt | +10 |
| Tổng dự kiến thuộc nhóm giá trị cao | +10 |
| Gói premium/combo | +8 |

### Nhãn

```text
Urgent: >= 60
High: 40–59
Normal: < 40
```

Priority phải đi kèm lý do, ví dụ:

- “Ngày đi còn 2 ngày.”
- “Chưa liên hệ khách.”
- “Có dịch vụ cần xác nhận.”

Không chỉ hiển thị một badge “High” không giải thích.

## 7. Sales Dashboard logic

### Quyết định chính

Sales cần chọn booking nào xử lý trước.

### Khu vực

1. KPI hôm nay:
   - Booking mới.
   - Chưa assigned.
   - Đang kiểm tra dịch vụ.
   - Follow-up đến hạn.
   - Đã xác nhận.
2. Priority Queue:
   - Tối đa 8–10 booking.
   - Sắp theo priority score, ngày đi, created time.
3. Today Follow-ups.
4. Upcoming Travel Dates.
5. Risk / Attention:
   - service conflict
   - ngày đi gần
   - giá thay đổi
   - khách chưa phản hồi
6. Recent Activity.

Dashboard phải có queue hành động, không chỉ là các con số.

## 8. Booking Queue logic

### Search

- Booking code.
- Customer name.
- Phone.

### Filters

- Status.
- Travel date.
- Created date.
- Estimated amount.
- Assigned to me.
- Unassigned.
- Package tier.
- Availability risk.

### Desktop

Dùng table nghiệp vụ, header sticky, row cao vừa phải.

### Mobile

Dùng booking card, chỉ hiển thị:

- code
- customer
- travel date
- amount
- status
- priority reason
- assigned owner

### Quick actions

- Mở chi tiết.
- Nhận xử lý.
- Copy phone.
- Đánh dấu đã liên hệ chỉ khi có contact note.
- Thêm note nhanh.

Không triển khai bulk status update trong MVP.

## 9. Booking Detail logic

### Layout

```text
Header cố định
├── Code, status, priority, travel date
├── Assigned sales
└── Actions phù hợp trạng thái

Main workspace
├── Customer + Trip Requirements
├── AI Sales Note
├── Selected Plan + Services
└── Internal Notes / Follow-up

Right rail
├── Cost Breakdown
├── Final Price
├── Confirmation Checklist
├── Status Update
└── Activity Timeline
```

### Thứ tự đọc

1. Khách là ai và muốn gì?
2. Rủi ro hoặc điều cần hỏi lại là gì?
3. Gói hiện tại gồm dịch vụ nào?
4. Giá dự kiến và giá cuối có chênh lệch không?
5. Checklist còn thiếu gì?
6. Hành động hợp lệ tiếp theo là gì?

## 10. Status transition rules

### Allowed flow

```text
new
→ contacted
→ checking_availability
→ waiting_payment
→ confirmed
→ completed
```

Nhánh hủy:

```text
new/contacted/checking_availability → cancelled
```

### Điều kiện

#### New → Contacted

- Booking đã assigned cho Sales hiện tại.
- Có contact attempt hoặc internal note.

#### Contacted → Checking availability

- Khách còn quan tâm.
- Có note ghi nhu cầu sau trao đổi.

#### Checking availability → Waiting payment

- Các checklist dịch vụ đều `confirmed` hoặc `not_applicable`.
- Final price đã nhập.
- Khách đã đồng ý lịch trình và giá.

#### Waiting payment → Confirmed

- Payment status phù hợp với chính sách MVP.
- Có note xác nhận.

#### Confirmed → Completed

- Chuyến đi đã diễn ra hoặc được staff xác nhận hoàn tất.

#### Cancelled

- Bắt buộc cancellation reason.
- Confirmed → Cancelled chỉ Admin hoặc quyền nâng cao.

## 11. Mutation API rules

Các endpoint đề xuất:

```text
POST /api/sales/bookings/:id/claim
POST /api/sales/bookings/:id/status
POST /api/sales/bookings/:id/notes
POST /api/sales/bookings/:id/checklist
POST /api/sales/bookings/:id/follow-ups
PATCH /api/sales/bookings/:id/final-price
```

Mỗi mutation cần:

1. `requireSales()`.
2. Kiểm tra assignment.
3. Kiểm tra transition/prerequisite.
4. Update trong phạm vi hẹp.
5. Ghi `booking_status_logs` hoặc `audit_logs`.
6. Trả trạng thái mới và thông báo rõ.

Không dựa hoàn toàn vào việc ẩn nút trên UI để bảo vệ nghiệp vụ.

## 12. AI Sales Note

AI chỉ hỗ trợ Sales đọc lead nhanh.

### Cấu trúc UI

- Lead summary.
- Nhu cầu chính.
- Buying signals.
- Concerns / risks.
- Talking points.
- Suggested next action.

### Guardrails

AI không được:

- Tự xác nhận booking.
- Cam kết giá cuối.
- Khẳng định chắc chắn còn chỗ.
- Tạo ưu đãi không có trong dữ liệu.
- Tự đổi trạng thái.

AI note hiện tại là text 2–4 câu. MVP đầu tiên có thể hiển thị text hiện có; sau đó mới nâng schema AI sang cấu trúc JSON.

## 13. UI states

### Loading

- Skeleton table/card.
- Giữ filter hiện tại.

### Empty

- Nói rõ chưa có việc hay không có kết quả do filter.
- CTA xóa filter hoặc xem tất cả.

### Error

- Không xóa dữ liệu form Sales vừa nhập.
- Có Retry.

### Permission denied

- Nêu booking chưa assigned hoặc Sales không có quyền.
- Cho phép quay lại Queue.

### Conflict

- Nêu dịch vụ nào có vấn đề.
- Chặn Confirmed.
- Đề xuất bước tiếp theo.

## 14. Thứ tự triển khai

### Mục 1 — Sales Foundation + Dashboard

- Role-aware redirect.
- Sales layout/shell.
- Middleware và `requireSales`.
- KPI.
- Priority Queue.
- Recent activity cơ bản.

### Mục 2 — Booking Queue

- Search.
- Status tabs.
- Filters.
- Assigned/unassigned.
- Priority labels.
- Claim booking.

### Mục 3 — Booking Detail Read-only

- Customer.
- Trip requirements.
- AI note.
- Package.
- Services.
- Cost breakdown.
- Existing activity logs.

### Mục 4 — Booking Actions

- Internal note.
- Status update.
- Assignment.
- Transition guard.

### Mục 5 — Availability Checklist + Final Price

- Migration.
- Checklist UI.
- Conflict state.
- Final price and change reason.
- Confirm guard.

### Mục 6 — Follow-up

- Migration.
- Reminder.
- Today follow-up widget.
- Contact outcome.

### Mục 7 — Orders / Demo Commerce

- Chỉ triển khai sau khi booking workflow ổn định.

## 15. Definition of Done cho Sales MVP

- Sales đăng nhập và được đưa đúng workspace.
- Sales không dùng nhầm Buyer UI.
- Dashboard cho biết việc cần làm ngay.
- Queue tìm được booking bằng code, tên hoặc phone.
- Sales nhận được booking chưa assigned.
- Booking Detail có đủ customer, trip, AI note, services và cost.
- Sales thêm note, follow-up và cập nhật trạng thái đúng điều kiện.
- Không Confirmed khi checklist chưa hoàn thành.
- Mọi thay đổi quan trọng có log.
- Buyer nhìn thấy trạng thái mới sau khi Sales cập nhật.
- Sales không thể xóa booking hoặc thao tác ngoài quyền.
