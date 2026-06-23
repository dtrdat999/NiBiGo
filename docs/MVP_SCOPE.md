# MVP Scope — NiBiGo AI Travel Platform

Nguyên tắc xuyên suốt: **Small scope, premium execution.**
Một điểm đến (Ninh Bình) · 4 role · Full commerce + AI + Maps + CMS · Làm thật chỉn chu.

> Bản tóm tắt kỹ thuật. Phiên bản nghiệp vụ đầy đủ: [docs/ba/03-mvp-scope.md](ba/03-mvp-scope.md).

---

## 1. Trong phạm vi MVP (IN scope)

### 1.1 Điểm đến & luồng chính
- ✅ **1 điểm đến:** Ninh Bình (kèm sub-locations: Tràng An, Tam Cốc, Hang Múa, Bái Đính, Cúc Phương, Vân Long, Hoa Lư).
- ✅ **Luồng chính:** khám phá dịch vụ → (tùy chọn) dùng NiBi AI lập lịch trình → xem chi tiết + Maps → chỉnh lịch trình → thêm cart → gửi booking request / tạo order → Sales xử lý → theo dõi trạng thái.

### 1.2 Roles (4)
- ✅ **Buyer** (khách hàng cuối — gộp nhãn "Guest/Buyer").
- ✅ **Sales**.
- ✅ **Editor/MOD**.
- ✅ **Admin**.

### 1.3 Buyer features
- ✅ Đăng ký / đăng nhập / đăng xuất (Supabase Auth).
- ✅ Khám phá dịch vụ: danh mục tour/homestay/hotel/restaurant/transport/combo + bài viết, filter theo giá/tag/destination/availability.
- ✅ Trang chi tiết sản phẩm: ảnh, giá, mô tả, **vị trí Google Maps**, chính sách, availability.
- ✅ NiBi AI planning: trip request form (`destination`, `num_days`, `start_date`, `num_people`, `budget`, `travel_style`, `interests[]`, `special_requests`, `group_composition`) → gợi ý cá nhân hóa.
- ✅ Mỗi gợi ý: tên/tóm tắt, tổng giá, fit score, lý do đề xuất, itinerary từng ngày, cost breakdown, danh sách sản phẩm, điều kiện cần xác nhận.
- ✅ Itinerary timeline từng ngày (sáng/chiều/tối).
- ✅ Cost breakdown theo hạng mục (lưu trú/hoạt động/ăn uống/phương tiện/khác + platform fee nếu có).
- ✅ Chỉnh lịch trình bằng ngôn ngữ tự nhiên (giảm ngân sách, lịch nhẹ hơn, thêm hoạt động trẻ em, bỏ hoạt động mệt…) → cập nhật lịch + giá.
- ✅ **Cart / selected services** — thêm dịch vụ riêng lẻ hoặc theo gợi ý AI.
- ✅ Gửi **booking request** (request-to-book) + nhận **mã booking** (vd `NBG-2026-0001`).
- ✅ Tạo **order** từ cart (checkout MVP) với `payment_status` demo/manual.
- ✅ Xem trạng thái booking/order ("My Bookings" / "My Orders").
- ✅ Dashboard Buyer: lịch sử trip request / booking / order.

### 1.4 Sales features
- ✅ Đăng nhập dashboard (role `sales`).
- ✅ Danh sách booking request + order, lọc theo trạng thái.
- ✅ Chi tiết: nhu cầu khách + dịch vụ/lịch trình đã chọn + tổng chi phí + **AI sales note**.
- ✅ Đổi trạng thái booking: `NEW → CONTACTED → CHECKING_AVAILABILITY → WAITING_PAYMENT → CONFIRMED` hoặc `CANCELLED`.
- ✅ Đổi trạng thái order theo pipeline `PENDING_CONFIRMATION → AWAITING_PAYMENT → PAID → PROCESSING → CONFIRMED → COMPLETED` (hoặc `CANCELLED`/`REFUND_REQUESTED → REFUNDED`).
- ✅ Ghi chú tư vấn nội bộ.

### 1.5 Editor/MOD features
- ✅ Quản lý sản phẩm theo loại (tour/homestay/hotel/restaurant/transport/combo): tạo/sửa, ảnh, giá, tags, suitable_for, availability_status.
- ✅ Nhập **vị trí Google Maps** (lat/lng/address) cho sản phẩm.
- ✅ Gửi sản phẩm chờ duyệt (`DRAFT → PENDING_REVIEW → PUBLISHED`).
- ✅ Quản lý bài viết/guide (CMS): title, slug, content, ảnh cover, category, tags, sản phẩm liên quan.

### 1.6 Admin features
- ✅ Quản lý user + gán/gỡ 4 role.
- ✅ Duyệt sản phẩm/bài viết `PENDING_REVIEW` (approve / request changes / reject).
- ✅ Giám sát toàn bộ booking/order + payment status, can thiệp khi cần.
- ✅ Audit log toàn hệ thống.
- ✅ Dashboard analytics tổng quan.

### 1.7 Mock/demo commerce flow (không giao dịch thanh toán thật)
- ✅ Dữ liệu mẫu đủ rộng: tour, homestay, hotel, restaurant, transport, combo + bài viết + tọa độ Maps.
- ✅ `availability_status` mock: `available` / `limited` / `sold_out` / `need_confirmation`.
- ✅ Cost breakdown tính từ DB.
- ✅ `payment_status`: `unpaid` / `pending` / `paid_demo`.
- ❗ **Bắt buộc:** không có chuyện AI nói "đã đặt xong"/"đã thanh toán" mà không ghi DB.

### 1.8 AI/Engine (NiBi AI)
- ✅ Backend: lọc sản phẩm, tính giá, kiểm tra ngân sách, kiểm availability, dựng gợi ý, tính fit score, tạo + lưu booking/order, phân quyền 4 role.
- ✅ NiBi AI: hiểu nhu cầu, hỏi thêm khi thiếu, viết itinerary, giải thích gợi ý, chỉnh lịch trình theo phản hồi, sales note.
- ✅ **Backend tính giá cuối — không để AI tự tính tổng.**

### 1.9 Hạ tầng
- ✅ Next.js full-stack + Supabase + Vercel + Google Maps Platform.
- ✅ Deploy online tại domain **`ai.nibigo.io.vn`**.
- ✅ Seed data riêng cho Ninh Bình (đủ loại sản phẩm + tọa độ + bài viết).

## 2. Ngoài phạm vi MVP (OUT of scope)

Không tích hợp trong MVP, dời sang **version 2**:
- ❌ **Đặt vé máy bay thật (flight booking API).**
- ❌ **Weather API.**

Không tích hợp trong MVP, dời sang các phase tương lai khác (xem [ROADMAP.md](ROADMAP.md)):
- ❌ Payment gateway production thật (MVP chỉ demo/manual/sandbox).
- ❌ WooCommerce order thật / đồng bộ user WordPress.
- ❌ Tour ngoài Ninh Bình (toàn Việt Nam).
- ❌ Mobile app native.
- ❌ Partner portal tự quản lý sản phẩm.
- ❌ Zalo OA / ZNS / Zalo Mini App production (chuẩn bị sẵn notification event, chưa gửi thật).
- ❌ Multi-language UI đầy đủ (mặc định tiếng Việt; EN để sau).

> Kiến trúc **vẫn chừa chỗ** cho tất cả mục trên (interface + adapter rỗng). Xem [ROADMAP.md](ROADMAP.md).

## 3. Phân loại "Must / Should / Could"

| Mức | Hạng mục |
|---|---|
| **Must (MVP đạt)** | Auth + 4 role · product discovery + filter + Maps · NiBi AI planning (gợi ý + chỉnh lịch trình) · cost breakdown · cart · booking request + order + mã + trạng thái · Sales xử lý + đổi trạng thái · Editor/MOD CRUD sản phẩm/bài viết + duyệt · Admin user/role/approval/giám sát · seed data · deploy online · không lộ key · UI responsive |
| **Should (MVP tốt)** | AI sales note · RAG từ dữ liệu sản phẩm/bài viết/chính sách · availability ảnh hưởng gợi ý · analytics cơ bản (Sales + Admin) · domain `ai.nibigo.io.vn` · CTA từ `nibigo.io.vn` · audit log Editor/MOD |
| **Could (nếu dư thời gian)** | Lưu/so sánh nhiều gợi ý · export PDF lịch trình · gợi ý "câu hỏi tiếp theo" · dark mode · notification in-app · cấu hình hệ thống cơ bản cho Admin |
| **Won't (MVP)** | Toàn bộ mục ở §2 |

## 4. Definition of Done (DoD)

### 4.1 MVP được coi là ĐẠT khi:
- [ ] Có **URL online** truy cập được tại `ai.nibigo.io.vn`.
- [ ] Có **tài khoản demo cho cả 4 role** (Buyer/Sales/Editor-MOD/Admin).
- [ ] Buyer **khám phá được dịch vụ** theo danh mục + filter, xem được **vị trí Maps**.
- [ ] Buyer **tạo được trip request** và NiBi AI **tạo được gợi ý cá nhân hóa**.
- [ ] Có **itinerary từng ngày** và **cost breakdown**.
- [ ] Buyer **chỉnh được lịch trình ở mức cơ bản**.
- [ ] Buyer **thêm được vào cart** và **gửi được booking request hoặc tạo order** (có lưu DB + mã + `payment_status`).
- [ ] Sales **thấy booking/order**, đọc được **AI sales note**, **đổi được trạng thái** (đủ các trạng thái mở rộng `CHECKING_AVAILABILITY`/`WAITING_PAYMENT`).
- [ ] Editor/MOD **tạo/sửa được sản phẩm** (đủ loại) và **bài viết**, gửi duyệt.
- [ ] Admin **duyệt được** sản phẩm/bài viết và **giám sát được** booking/order toàn nền tảng.
- [ ] Có **dữ liệu mẫu đủ rộng** cho mọi loại sản phẩm + tọa độ Maps + bài viết.
- [ ] Có **README hướng dẫn chạy**.
- [ ] **Không lộ API key** (Supabase service-role, AI key, Maps server key nếu có).
- [ ] **UI đủ đẹp và responsive** cho cả 4 role.

### 4.2 MVP được coi là TỐT nếu thêm:
- [ ] **AI sales note** chất lượng, dùng được ngay cho tư vấn.
- [ ] **RAG** từ dữ liệu sản phẩm/bài viết/chính sách.
- [ ] **Availability** ảnh hưởng tới gợi ý + booking (chặn `sold_out`, cảnh báo `limited`).
- [ ] **Dashboard analytics** cơ bản cho Sales và Admin.
- [ ] Domain **`ai.nibigo.io.vn`**.
- [ ] **CTA** từ `nibigo.io.vn` sang app AI.
- [ ] **Audit log** đầy đủ cho thay đổi quan trọng (giá, availability, role, approval).

## 5. Tiêu chí "đủ đẹp" cho UI (để không sa đà)

- Sitemap 4 role ở [USER_FLOW.md](USER_FLOW.md) đều có layout sạch, spacing nhất quán, không vỡ mobile.
- Bảng màu travel-premium: xanh thiên nhiên + vàng ấm + trắng/be (tokens ở SYSTEM_ARCHITECTURE.md).
- Có ít nhất: card sản phẩm/gợi ý, timeline lịch trình, bảng cost breakdown, badge trạng thái, bản đồ vị trí, empty state, loading state.
- **Không** cần animation phức tạp, không cần design system đầy đủ — chỉ cần nhất quán và gọn.

## 6. Ranh giới chống "scope creep"

Trước khi thêm bất kỳ tính năng nào, hỏi 4 câu:
1. Nó có nằm trong **luồng chính** (discovery → AI planning → chỉnh → cart → booking/order → Sales xử lý) không?
2. Nó có giúp đạt một mục trong **DoD** không?
3. Nó có làm hỏng nguyên tắc **"backend tính tiền, NiBi AI viết lời"** không?
4. Nó có thuộc nhóm **đã loại trừ rõ ràng** (vé máy bay, Weather API, payment production thật, role thứ 5, đa điểm đến...) không?

Nếu (1) hoặc (2) là "không" → đẩy sang [ROADMAP.md](ROADMAP.md). Nếu (3) là "có" hoặc (4) là "có" → từ chối.
