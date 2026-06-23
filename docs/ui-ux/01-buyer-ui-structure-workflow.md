# 01. Buyer UI Structure & Workflow — NiBiGo AI Travel Platform

**Role:** BUYER  
**Primary user:** Khách du lịch muốn tìm, lập kế hoạch và gửi yêu cầu đặt dịch vụ du lịch Ninh Bình  
**Goal:** Giúp khách đi từ nhu cầu ban đầu đến booking request/order có dữ liệu, chi phí và trạng thái rõ ràng  

---

## 1. Buyer UX Objective

Buyer cần một trải nghiệm đơn giản, tin cậy và minh bạch.

Người dùng không nên cảm thấy mình đang “chat với AI chung chung”, mà phải thấy rõ:

- Tôi có thể khám phá dịch vụ thật.
- Tôi có thể nhập nhu cầu chuyến đi.
- NiBi AI đề xuất dựa trên sản phẩm có trong hệ thống.
- Tôi nhìn được lịch trình, chi phí, lý do đề xuất.
- Tôi có thể chỉnh tour.
- Tôi có thể gửi booking request và theo dõi trạng thái.
- Có Sales/Admin thật xử lý sau khi tôi gửi yêu cầu.

---

## 2. Buyer Navigation Structure

```txt
Buyer App
├── Dashboard
├── Explore
│   ├── Tours
│   ├── Homestays / Hotels
│   ├── Transport
│   ├── Experiences
│   ├── Restaurants
│   └── Combos
├── NiBi AI Planner
│   ├── Trip Need Form
│   ├── AI Recommendation Results
│   ├── Itinerary Detail
│   └── Itinerary Refinement
├── Selected Services / Cart
├── Booking Request
├── My Bookings / Orders
├── Saved Items
└── Profile
```

---

## 3. Buyer Main Screens

| Screen | Route | Mục tiêu |
|---|---|---|
| Buyer Dashboard | `/buyer/dashboard` | Tổng quan gợi ý, booking gần đây, CTA dùng NiBi AI |
| Explore | `/buyer/explore` | Khám phá danh mục dịch vụ |
| Product Listing | `/buyer/products` | Xem/filter dịch vụ |
| Product Detail | `/buyer/products/:id` | Xem thông tin, giá, ảnh, vị trí, availability |
| AI Planner Form | `/buyer/ai-planner` | Nhập nhu cầu chuyến đi |
| AI Results | `/buyer/ai-planner/results/:planId` | Xem 3 gói gợi ý |
| Itinerary Detail | `/buyer/ai-planner/results/:planId/detail` | Xem lịch trình từng ngày |
| Selected Services / Cart | `/buyer/cart` | Xem dịch vụ đã chọn và tổng chi phí |
| Booking Request | `/buyer/booking-request/new` | Gửi yêu cầu đặt dịch vụ |
| Booking Detail | `/buyer/bookings/:id` | Theo dõi trạng thái booking/order |
| Saved Items | `/buyer/saved` | Xem dịch vụ đã lưu |
| Profile | `/buyer/profile` | Quản lý thông tin cá nhân |

---

## 4. Buyer Dashboard Structure

### 4.1 Mục tiêu

Cho Buyer thấy nhanh: nên bắt đầu từ đâu, booking hiện tại ra sao, và NiBi AI có thể giúp gì.

### 4.2 UI Components

- Welcome section.
- Primary CTA: “Lập kế hoạch với NiBi AI”.
- Quick trip form mini.
- Recommended categories.
- Recent bookings/orders.
- Saved services.
- Travel inspiration cards.
- Support/contact block.

### 4.3 Primary Actions

- Start AI Planner.
- Continue unfinished plan.
- View booking status.
- Explore services.

### 4.4 Data Read

- User profile.
- Recent bookings.
- Saved items.
- Featured products.
- Recommended products.

### 4.5 Empty State

Nếu user mới chưa có booking:

```txt
Bạn chưa có kế hoạch du lịch nào.
Hãy bắt đầu bằng cách nhập nhu cầu chuyến đi, NiBi AI sẽ gợi ý lịch trình phù hợp cho bạn.
[Start with NiBi AI]
```

---

## 5. Product Discovery Workflow

### 5.1 Objective

Buyer có thể tự khám phá dịch vụ nếu chưa muốn dùng AI.

### 5.2 Flow

```txt
Buyer vào Explore
→ Chọn danh mục dịch vụ
→ Xem danh sách sản phẩm
→ Dùng filter/sort
→ Mở product detail
→ Lưu sản phẩm hoặc thêm vào selected services
→ Tiếp tục khám phá hoặc chuyển sang booking/cart
```

### 5.3 Product Listing UI

Các thành phần chính:

- Category tabs.
- Search bar.
- Filter panel:
  - Loại dịch vụ
  - Giá
  - Khu vực
  - Phù hợp với gia đình/cặp đôi/nhóm bạn
  - Tags: nature, culture, food, premium, budget, kids, elderly-friendly
  - Availability: Available, Limited, Sold out
- Product cards.
- Map preview nếu có location.
- Sort: recommended, price low-high, rating/popularity, newest.

### 5.4 Product Card Fields

- Image.
- Name.
- Type.
- Location.
- Price from.
- Duration.
- Availability badge.
- Tags.
- Short description.
- CTA: View detail / Save / Add.

### 5.5 Product Detail UI

- Gallery.
- Product title.
- Category and tags.
- Price.
- Duration.
- Suitable for.
- Availability status.
- Description.
- Map/location section.
- Included / excluded.
- Cancellation/confirmation note.
- Related products.
- CTA:
  - Add to selected services.
  - Ask NiBi AI about this.
  - Send booking request.

---

## 6. NiBi AI Planning Workflow

### 6.1 Objective

Buyer nhập nhu cầu và nhận gợi ý cá nhân hóa từ kho dịch vụ có sẵn.

### 6.2 Required Inputs

| Field | Required | Ghi chú |
|---|---|---|
| Destination | Yes | MVP mặc định Ninh Bình |
| Travel dates | Yes | Ngày đi/ngày về hoặc số ngày |
| Number of people | Yes | Người lớn/trẻ em nếu có |
| Budget | Yes | Tổng ngân sách hoặc ngân sách/người |
| Travel style | Yes | Tiết kiệm, cân bằng, nghỉ dưỡng, trải nghiệm |
| Interests | Yes | Thiên nhiên, văn hóa, ẩm thực, chụp ảnh, gia đình |
| Special requirements | Optional | Trẻ em, người lớn tuổi, ăn chay, lịch nhẹ |

### 6.3 Flow

```txt
Buyer mở NiBi AI Planner
→ Nhập nhu cầu chuyến đi
→ Hệ thống validate input
→ Backend lọc sản phẩm phù hợp
→ NiBi AI tạo nội dung tư vấn, lịch trình và lý do đề xuất
→ Backend tính giá cuối cùng
→ Backend kiểm tra availability mock/real
→ Buyer nhận 3 gói gợi ý
```

### 6.4 AI Responsibilities

NiBi AI được phép:

- Hiểu nhu cầu tự nhiên của Buyer.
- Hỏi lại nếu thiếu dữ liệu quan trọng.
- Viết lịch trình hấp dẫn.
- Giải thích vì sao gói phù hợp.
- Gợi ý điều chỉnh.
- Tóm tắt lý do chọn dịch vụ.

NiBi AI không được:

- Tự bịa sản phẩm không có trong database.
- Tự bịa giá.
- Tự xác nhận đã đặt thành công.
- Tự bỏ qua availability.
- Tự tính tổng giá cuối cùng.

### 6.5 Backend Responsibilities

Backend phải:

- Lọc sản phẩm.
- Tính giá.
- Kiểm tra trạng thái còn chỗ.
- Lưu plan.
- Lưu selected services.
- Tạo booking request.
- Lưu lịch sử chỉnh sửa.
- Phân quyền dữ liệu theo user.

---

## 7. AI Recommendation Result Screen

### 7.1 Mục tiêu

Giúp Buyer so sánh nhanh 3 phương án.

### 7.2 Package Types

- Budget Package — tiết kiệm.
- Balanced Package — cân bằng.
- Premium Package — trải nghiệm/nâng cấp.

### 7.3 UI Components

Mỗi package card cần có:

- Package name.
- Total estimated price.
- Fit score.
- Short reason.
- Main highlights.
- Included services.
- Availability warning nếu có.
- CTA:
  - View itinerary.
  - Customize.
  - Select package.

### 7.4 Cost Breakdown

```txt
Tổng tạm tính
├── Lưu trú
├── Di chuyển
├── Tour / hoạt động
├── Ăn uống
├── Combo/package margin nếu có
└── Phí nền tảng/dịch vụ nếu có
```

### 7.5 Trust Notes

Mỗi kết quả cần hiển thị:

```txt
Giá và trạng thái còn chỗ là tạm tính. Sales sẽ xác nhận lại trước khi hoàn tất đặt dịch vụ.
```

---

## 8. Itinerary Detail Screen

### 8.1 UI Components

- Header: package name, date range, people, total price.
- Daily timeline.
- Service cards by day.
- Map/location section.
- Cost breakdown side panel.
- AI explanation panel.
- Warning/confirmation conditions.
- CTA:
  - Refine itinerary.
  - Replace service.
  - Save plan.
  - Send booking request.

### 8.2 Timeline Format

```txt
Day 1
├── Morning: Activity / Transport
├── Lunch: Restaurant
├── Afternoon: Attraction / Experience
└── Evening: Hotel / Dinner

Day 2
├── Morning
├── Lunch
├── Afternoon
└── Evening
```

### 8.3 Itinerary Refinement Examples

Buyer có thể nhập:

- “Giảm ngân sách xuống khoảng 3 triệu.”
- “Lịch nhẹ hơn vì có người lớn tuổi.”
- “Thêm hoạt động cho trẻ em.”
- “Bỏ hoạt động leo núi.”
- “Ưu tiên khách sạn đẹp hơn.”
- “Thêm trải nghiệm ẩm thực địa phương.”

### 8.4 Refinement Flow

```txt
Buyer gửi yêu cầu chỉnh
→ AI hiểu yêu cầu
→ Backend xác định sản phẩm cần thay
→ Backend lọc sản phẩm thay thế
→ Backend tính lại giá
→ AI viết lại lịch trình và lý do
→ Buyer xem phiên bản cập nhật
```

---

## 9. Booking Request Workflow

### 9.1 Objective

Buyer gửi yêu cầu đặt dịch vụ dựa trên plan hoặc selected services.

### 9.2 Flow

```txt
Buyer chọn package/services
→ Mở booking request form
→ Xác nhận thông tin liên hệ
→ Xem lại lịch trình và chi phí
→ Xác nhận điều kiện cần Sales kiểm tra
→ Submit booking request
→ Hệ thống tạo mã booking
→ Buyer thấy confirmation screen
→ Sales nhận request trong dashboard
```

### 9.3 Booking Form Fields

- Full name.
- Phone.
- Email.
- Travel date.
- Number of people.
- Selected package/services.
- Special request.
- Preferred contact channel.
- Note.

### 9.4 Booking Status

| Status | Ý nghĩa |
|---|---|
| New | Buyer vừa gửi yêu cầu |
| Contacted | Sales đã liên hệ |
| Confirmed | Đã xác nhận booking |
| Cancelled | Đã hủy |

### 9.5 Confirmation Screen

Cần hiển thị:

- Booking code.
- Summary.
- Total estimated price.
- Contact note.
- Next step.
- CTA: View booking status.

---

## 10. Buyer Booking Tracking

### 10.1 UI Components

- Booking list.
- Status badge.
- Booking detail.
- Timeline xử lý.
- Contact Sales CTA.
- Cancel request nếu còn cho phép.
- Payment status nếu có demo commerce.

### 10.2 Booking Detail Timeline

```txt
New
→ Contacted
→ Confirmed
→ Completed
```

Hoặc:

```txt
New
→ Contacted
→ Cancelled
```

---

## 11. Buyer UI Acceptance Criteria

Buyer flow đạt MVP khi:

- Buyer đăng ký/đăng nhập được.
- Buyer xem được dịch vụ theo danh mục.
- Buyer xem được product detail.
- Buyer nhập nhu cầu chuyến đi được.
- Buyer nhận được 3 gói gợi ý.
- Mỗi gói có lịch trình, giá, lý do đề xuất.
- Buyer chỉnh được lịch trình bằng phản hồi tự nhiên.
- Backend tính lại giá sau khi chỉnh.
- Buyer gửi được booking request.
- Hệ thống tạo mã booking.
- Buyer theo dõi được trạng thái booking.
- Không có chỗ nào khiến Buyer tưởng rằng hệ thống đã đặt thật khi chưa có Sales xác nhận.
