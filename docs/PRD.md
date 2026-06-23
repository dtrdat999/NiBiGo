# PRD — NiBiGo AI Travel Platform

**Product Requirements Document**
AI assistant: **NiBi AI** · Đề tài gốc: AI20K-207 · Phiên bản: MVP 2.0 (full platform) · Cập nhật: 2026-06-23

> Tài liệu này là bản tóm tắt kỹ thuật chính thức. Phân tích nghiệp vụ chi tiết (persona,
> JTBD, business process, user stories) nằm ở [docs/ba/](ba/).

---

## 1. Tóm tắt sản phẩm (Executive summary)

NiBiGo AI Travel Platform là một nền tảng **commerce du lịch Ninh Bình** có AI cá nhân hóa.
Buyer khám phá dịch vụ (tour, homestay, khách sạn, nhà hàng, thuê xe, combo) qua listing có
filter và Google Maps, hoặc dùng **NiBi AI** để nhập nhu cầu (ngân sách, số ngày, số người,
phong cách, sở thích) và nhận **lịch trình/gói dịch vụ cá nhân hóa** kèm **cost breakdown minh
bạch** và **lý do đề xuất**. Buyer có thể **chỉnh lịch trình bằng ngôn ngữ tự nhiên**, thêm dịch
vụ vào **cart**, rồi gửi **booking request** hoặc tạo **order** (có `payment_status` demo/manual)
để Sales xác nhận.

Sản phẩm tách bạch rõ: **backend lo logic + tiền + dữ liệu + trạng thái**, **NiBi AI lo ngôn
ngữ + cá nhân hóa + tư vấn**. AI ở đây *không bịa* sản phẩm, giá, vị trí hay tình trạng chỗ —
mọi con số và trạng thái đến từ database.

## 2. Vấn đề (Problem statement)

Khách muốn đi du lịch Ninh Bình nhưng:

1. **Không biết tự ghép dịch vụ** sao cho vừa ngân sách và hợp với nhóm đi.
2. **Khó so sánh** khách sạn/homestay, điểm tham quan, ăn uống, phương tiện theo vị trí thực tế.
3. **Thiếu tin tưởng** — sợ bị đẩy gói có lợi cho nền tảng/đối tác thay vì hợp với mình (xem nguyên tắc chống ưu tiên ngầm ở §7).
4. **Lịch trình thiếu minh bạch chi phí** — không biết tiền đi đâu.
5. **Tư vấn/đặt dịch vụ thủ công chậm** — phải hỏi qua nhiều bên (xe, phòng, tour, ăn uống) riêng lẻ.

Chi tiết persona & jobs-to-be-done: [docs/ba/02-user-persona-jtbd.md](ba/02-user-persona-jtbd.md).

## 3. Mục tiêu sản phẩm (Goals)

### 3.1 Mục tiêu chính
- Cho Buyer khám phá dịch vụ Ninh Bình theo danh mục + filter + Google Maps **trước khi** cần AI.
- Cho Buyer tạo lịch trình cá nhân hóa **dưới 5 phút** qua NiBi AI, từ nhu cầu → gợi ý hoàn chỉnh.
- **Minh bạch tuyệt đối** về chi phí: mọi con số đến từ database, không phải AI bịa.
- Cho Buyer **chỉnh lịch trình bằng ngôn ngữ tự nhiên** mà không cần hiểu kỹ thuật.
- Cho Buyer **đặt dịch vụ thật** qua booking request (request-to-book) hoặc order (cart/checkout) — có `payment_status` demo/manual ở MVP.
- Cho Editor/MOD công cụ quản lý sản phẩm + bài viết với dữ liệu chuẩn (bao gồm vị trí Google Maps).
- Tạo **lead/booking có cấu trúc** cho Sales: mỗi booking/order kèm AI sales note tóm tắt nhu cầu.
- Cho Admin khả năng giám sát toàn nền tảng: user/role, approval, booking/order, payment status, audit log.

### 3.2 Mục tiêu phi chức năng
- UI/UX **travel-premium**, responsive desktop + mobile, cho cả 4 role.
- **Phân quyền 4 role**: Buyer / Sales / Editor-MOD / Admin (RBAC 2 lớp: middleware + RLS/route).
- **Deployed online** tại `ai.nibigo.io.vn` (không phải localhost/notebook/CLI).
- Kiến trúc **mở rộng được** sang payment gateway thật, Zalo OA/Mini App, đa điểm đến, partner portal.

### 3.3 Non-goals (KHÔNG làm ở MVP — xem MVP_SCOPE.md)
- **Đặt vé máy bay thật (flight booking API)** và **Weather API** — dời sang **version 2**.
- Thanh toán thật qua cổng production (MVP dùng payment status demo/manual/sandbox).
- WooCommerce order thật, đồng bộ user WordPress, partner portal tự quản lý.
- Tour ngoài Ninh Bình, mobile app native, đa ngôn ngữ UI đầy đủ.

## 4. Người dùng & nhu cầu (Personas)

4 nhóm role chính (chi tiết đầy đủ ở [ba/02-user-persona-jtbd.md](ba/02-user-persona-jtbd.md)):

### Persona A — Buyer: "Gia đình có trẻ nhỏ" (ưu tiên 1 cho MVP)
- Cần lịch trình nhẹ, chỗ ở/xe phù hợp gia đình, chi phí rõ ràng, có Maps để biết vị trí.

### Persona B — Buyer: "Nhóm tiết kiệm"
- Nhạy cảm về giá, cần hiển thị giá/người, lịch trình nhiều điểm nổi bật.

### Persona C — Sales: "Tư vấn viên"
- Nhận booking/order, cần lead có cấu trúc + AI sales note để phản hồi nhanh, chốt được nhiều hơn.

### Persona D — Editor/MOD: "Vận hành dữ liệu"
- Cần form nhập liệu chuẩn (giá, ảnh, tag, vị trí Maps), trạng thái duyệt rõ ràng.

### Persona E — Admin: "Chủ nền tảng"
- Cần dashboard kiểm soát user/role, sản phẩm, nội dung, booking/order, payment, AI logs.

## 5. Yêu cầu chức năng (Functional requirements)

### 5.1 Buyer

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| B-01 | Đăng ký / đăng nhập / đăng xuất | Must |
| B-02 | Khám phá dịch vụ theo danh mục (tour/homestay/hotel/restaurant/transport/combo), filter theo giá/tag/vị trí/availability | Must |
| B-03 | Xem chi tiết sản phẩm: ảnh, giá, mô tả, vị trí trên Google Maps, chính sách, availability | Must |
| B-04 | Nhập nhu cầu chuyến đi cho NiBi AI (destination, days, start_date, people, budget, style, interests, special_requests) | Must |
| B-05 | Nhận gợi ý cá nhân hóa từ NiBi AI: lịch trình + cost breakdown + lý do đề xuất + fit score | Must |
| B-06 | Chỉnh lịch trình bằng phản hồi tự nhiên (giảm ngân sách, lịch nhẹ hơn, thêm hoạt động trẻ em, bỏ hoạt động mệt…) | Must |
| B-07 | Thêm dịch vụ vào cart / selected services | Must |
| B-08 | Gửi booking request (request-to-book) cho dịch vụ cần xác nhận | Must |
| B-09 | Tạo order từ cart (checkout MVP) với `payment_status` demo/manual | Must |
| B-10 | Nhận mã booking/order và theo dõi trạng thái ("My Bookings" / "My Orders") | Must |
| B-11 | Xem bài viết/guide liên quan đến dịch vụ | Should |
| B-12 | Xem lịch sử trip request / booking / order (dashboard) | Should |

### 5.2 Sales

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| S-01 | Đăng nhập dashboard (role `sales`) | Must |
| S-02 | Xem danh sách booking request + order, lọc theo trạng thái | Must |
| S-03 | Xem chi tiết: nhu cầu khách + dịch vụ/lịch trình đã chọn + tổng chi phí + AI sales note | Must |
| S-04 | Đổi trạng thái booking: `NEW → CONTACTED → CHECKING_AVAILABILITY → WAITING_PAYMENT → CONFIRMED` (hoặc `CANCELLED`), ghi lịch sử | Must |
| S-05 | Đổi trạng thái order (`PENDING_CONFIRMATION → AWAITING_PAYMENT → PAID → ... → COMPLETED`) | Must |
| S-06 | Ghi chú tư vấn nội bộ trên booking/order | Should |
| S-07 | Dashboard analytics cơ bản (số lead, theo trạng thái, giá trị trung bình) | Should |

### 5.3 Editor/MOD

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| E-01 | Tạo/sửa sản phẩm theo từng loại (tour/homestay/hotel/restaurant/transport/combo) | Must |
| E-02 | Nhập vị trí Google Maps (lat/lng/address) cho sản phẩm | Must |
| E-03 | Quản lý ảnh, giá, đơn vị giá, tags, suitable_for, availability_status | Must |
| E-04 | Gửi sản phẩm/bài viết chờ duyệt (`DRAFT → PENDING_REVIEW → PUBLISHED`) | Must |
| E-05 | Tạo/sửa bài viết (CMS): title, slug, content, ảnh cover, category, tags, sản phẩm liên quan | Must |
| E-06 | Xem audit log thay đổi của chính mình | Should |

### 5.4 Admin

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| AD-01 | Đăng nhập dashboard (role `admin`) | Must |
| AD-02 | Quản lý user + gán/gỡ role (4 role) | Must |
| AD-03 | Duyệt sản phẩm/bài viết `PENDING_REVIEW` (approve/request changes/reject) | Must |
| AD-04 | Giám sát toàn bộ booking/order + payment status, can thiệp khi cần | Must |
| AD-05 | Xem audit log toàn hệ thống | Must |
| AD-06 | Dashboard analytics tổng quan (booking, order, GMV mock, sản phẩm theo trạng thái) | Should |
| AD-07 | Cấu hình hệ thống cơ bản (feature flag, fee, thông số platform) | Could |

### 5.5 NiBi AI / Engine

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| AI-01 | Backend lọc sản phẩm theo destination + availability + ngân sách + loại dịch vụ | Must |
| AI-02 | Backend tính **fit score** (công thức ở [AI_DESIGN.md](AI_DESIGN.md)) | Must |
| AI-03 | Backend tính tổng giá/cost breakdown **từ DB**, theo `price_unit` | Must |
| AI-04 | NiBi AI sinh lịch trình, lý do đề xuất, giải thích cost breakdown từ danh sách sản phẩm đã chọn | Must |
| AI-05 | NiBi AI diễn giải phản hồi chỉnh lịch trình → thao tác có cấu trúc; backend áp dụng + tính lại giá | Must |
| AI-06 | NiBi AI sinh sales note cho Sales | Must |
| AI-07 | RAG: NiBi AI tư vấn bám dữ liệu nội bộ (sản phẩm + bài viết + chính sách), không bịa | Should |
| AI-08 | NiBi AI hỏi thêm khi thiếu thông tin quan trọng (không hỏi quá nhiều) | Should |

## 6. Yêu cầu phi chức năng (Non-functional)

- **Bảo mật:** không lộ API key; service-role key + Maps server key (nếu có) chỉ server-side; RLS bật trên mọi bảng có dữ liệu user; route theo role được bảo vệ 2 lớp (middleware + RLS/route handler).
- **Hiệu năng:** sinh gợi ý NiBi AI trong ~5–15s (1 lần gọi LLM gộp); chỉnh lịch trình ~3–8s.
- **Tin cậy:** nếu LLM lỗi/parse JSON fail → fallback hiển thị gợi ý từ backend (vẫn có giá + sản phẩm), kèm thông báo nhẹ.
- **Chi phí AI:** dùng model rẻ (gpt-4o-mini / gemini-1.5-flash) cho MVP; gộp prompt để giảm số lần gọi.
- **Khả năng mở rộng:** mọi tích hợp ngoài (payment gateway thật, Zalo, flight, weather) đặt sau interface (`src/integrations/`), không rải rác trong UI.
- **Responsive:** hoạt động tốt từ 360px (mobile) đến desktop, cho cả 4 role.

## 7. Ràng buộc nguyên tắc AI (rất quan trọng)

> **NiBi AI KHÔNG được tự tính tổng giá cuối cùng.** Giá cuối cùng do backend tính từ database.
> **NiBi AI KHÔNG được bịa** sản phẩm, giá, vị trí, hay tình trạng đặt chỗ. NiBi AI chỉ chọn
> trong danh sách sản phẩm hợp lệ do backend cung cấp và chỉ tham chiếu sản phẩm bằng `id`.
> **NiBi AI không được âm thầm ưu tiên sản phẩm chỉ vì nhà cung cấp trả phí cao hơn** (featured
> listing không ảnh hưởng đến fit score/ranking trong gợi ý cá nhân hóa).

Chi tiết phân vai và guardrails: [AI_DESIGN.md](AI_DESIGN.md).

## 8. Success metrics

### 8.1 Định tính (đạt MVP)
Xem Definition of Done ở [MVP_SCOPE.md](MVP_SCOPE.md). Tóm tắt: có URL online, có tài khoản
demo cho 4 role; Buyer khám phá được sản phẩm + dùng NiBi AI ra gợi ý + chỉnh lịch trình + thêm
cart + gửi booking/order; Sales xử lý được booking/order; Editor/MOD tạo/sửa được sản phẩm +
bài viết; Admin duyệt nội dung + giám sát toàn nền tảng; không lộ key; UI đẹp + responsive.

### 8.2 Định lượng (theo dõi khi có người dùng thật — Phase mở rộng)
- Tỉ lệ hoàn thành: % Buyer nhập nhu cầu → nhận đủ gợi ý.
- Tỉ lệ chỉnh lịch trình: % phiên có ít nhất 1 lần revise.
- Tỉ lệ gửi booking/order: % phiên có booking request hoặc order.
- Thời gian trung bình từ trip request → booking/order.
- Tỉ lệ booking `CONFIRMED` / tổng booking (đo hiệu quả Sales + AI sales note).
- Chi phí token AI trung bình / phiên.

## 9. Phạm vi demo

Demo end-to-end qua 4 role (gia đình 4 người, Hà Nội, 2N1Đ, ~6 triệu, có Maps + chỉnh lịch
trình + booking + Sales xử lý + Editor cập nhật sản phẩm + Admin giám sát). Toàn bộ kịch bản ở
[DEMO_SCRIPT.md](DEMO_SCRIPT.md).

## 10. Rủi ro & giả định

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| LLM trả JSON sai định dạng | Vỡ UI gợi ý | JSON schema + validate + fallback backend-only |
| LLM "bịa" sản phẩm/giá/vị trí | Mất niềm tin, sai chi phí | LLM chỉ chọn theo `id` từ candidate list; giá/vị trí do backend |
| Mở rộng 4 role làm vỡ schema/route hiện có | Phải migrate dữ liệu cũ | Migration tăng dần (xem DATA_SCHEMA.md), không sửa migration cũ |
| Seed data nghèo (nhiều loại sản phẩm + vị trí) → gợi ý nghèo | Demo kém thuyết phục | Chuẩn bị seed đủ rộng mỗi loại + đủ tọa độ (xem DATA_SCHEMA.md) |
| Solo dev quá tải scope (4 role + Maps + CMS + commerce) | Trễ deadline | Bám "small scope, premium execution" + roadmap theo phase, ưu tiên Buyer→Sales trước Editor/Admin |
| Google Maps API cost/quota | Vượt free tier khi demo nhiều | Giới hạn API key theo domain, cache geocode |

## 11. Out of scope rõ ràng (nhắc lại)

**Vé máy bay thật + Weather API → version 2.** Ngoài ra: thanh toán production thật, WooCommerce
order thật, đồng bộ user WordPress, partner portal tự quản lý, tour toàn Việt Nam, mobile app
native, đa ngôn ngữ đầy đủ. Kiến trúc vẫn chừa chỗ tích hợp các mục này — xem [ROADMAP.md](ROADMAP.md).
