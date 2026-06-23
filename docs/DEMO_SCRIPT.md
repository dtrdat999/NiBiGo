# Demo Script — NiBiGo AI Travel Platform

Kịch bản demo chuẩn để trình bày sản phẩm (và để test end-to-end) qua **cả 4 role**. Số liệu
dưới đây là **mục tiêu thiết kế** cho seed data — tinh chỉnh seed để 3 gói rơi đúng các mốc giá này.

---

## 1. Nhân vật & bối cảnh

> **Khách (Buyer):** một **cặp đôi** muốn đi **Ninh Bình 3 ngày 2 đêm**, ngân sách
> **~8.000.000đ**, thích **nghỉ dưỡng nhẹ, ăn ngon, chụp ảnh**, **không muốn lịch quá mệt**,
> muốn có **xe đưa đón từ Hà Nội**.

Tài khoản dùng để demo:
- Buyer: `buyer@nibigo.demo`
- Sales: `sales@nibigo.demo`
- Editor/MOD: `editor@nibigo.demo`
- Admin: `admin@nibigo.demo`

## 2. Input mẫu (Trip request form — AI Planner)

| Trường | Giá trị |
|---|---|
| `destination` | Ninh Bình |
| `num_days` / `num_nights` | 3 / 2 |
| `start_date` | (một ngày cuối tuần sắp tới) |
| `num_people` | 2 |
| `group_composition` | `{ adults: 2, children: 0, elderly: 0 }` |
| `budget` | 8.000.000đ |
| `travel_style` | `relaxing` |
| `interests` | `["relaxing", "food", "photo", "couple", "nature"]` |
| `special_requests` | "Có xe đón từ Hà Nội, lịch đừng quá mệt." |

## 3. Bước 0 — Buyer khám phá trước khi dùng AI (mới)

1. Mở `/buyer/explore`, lọc theo loại `homestay` + tag `couple` → thấy danh sách kèm giá.
2. Mở 1 sản phẩm (vd "Tam Coc Riverside Homestay") → xem ảnh, giá, mô tả, **vị trí trên Google
   Maps**, `availability_status`.
3. Bấm "Thêm vào cart" để minh họa luồng commerce độc lập với AI (không bắt buộc phải qua AI Planner).
4. Chuyển sang dùng **NiBi AI** để có gợi ý cá nhân hóa cho cả chuyến đi.

## 4. Output mong đợi — 3 gói tour (NiBi AI)

| Gói | Tier | Tổng giá mục tiêu | Đặc trưng |
|---|---|---|---|
| **Ninh Bình Tiết Kiệm** | `budget` | **~6.500.000đ** | Xe ghép, homestay, điểm tham quan cơ bản |
| **Ninh Bình Cân Bằng** | `balanced` | **~7.800.000đ** | Limousine, boutique hotel view đẹp, dinner set cặp đôi |
| **Ninh Bình Trải Nghiệm** | `premium` | **~9.500.000đ** | Xe riêng, resort nghỉ dưỡng, ẩm thực nâng cao |

### 4.1 Cost breakdown mục tiêu (để hiệu chỉnh seed)

**Gói Tiết Kiệm — 6.500.000đ**
| Hạng mục | Tiền |
|---|---|
| Transport (xe ghép HN–NB khứ hồi, 2 người) | 800.000 |
| Hotel/Homestay (homestay 500k × 2 đêm) | 1.000.000 |
| Activity (Tràng An, Tam Cốc, Cố đô Hoa Lư…) | 1.700.000 |
| Restaurant (cơm cháy, set dê, bữa địa phương) | 1.500.000 |
| Other (vé tham quan, hướng dẫn, dự phòng) | 1.500.000 |
| **Total** | **6.500.000** |

**Gói Cân Bằng — 7.800.000đ** *(gói khách sẽ chọn)*
| Hạng mục | Tiền |
|---|---|
| Transport (limousine khứ hồi, 2 người) | 1.000.000 |
| Hotel (boutique view lúa 950k × 2 đêm) | 1.900.000 |
| Activity (Tràng An, Hang Múa, Bái Đính…) | 1.500.000 |
| Restaurant (set dê + dinner set cặp đôi + cơm cháy) | 2.100.000 |
| Other (vé, hướng dẫn, dự phòng) | 1.300.000 |
| **Total** | **7.800.000** |

**Gói Trải Nghiệm — 9.500.000đ**
| Hạng mục | Tiền |
|---|---|
| Transport (xe riêng 4 chỗ khứ hồi) | 1.600.000 |
| Hotel (resort nghỉ dưỡng 1.5tr × 2 đêm) | 3.000.000 |
| Activity (Tràng An, Đầm Vân Long, đạp xe…) | 1.800.000 |
| Restaurant (ẩm thực nâng cao, dinner đặc biệt) | 2.300.000 |
| Other | 800.000 |
| **Total** | **9.500.000** |

> Mỗi gói hiển thị: tên, tổng giá, **fit score** (vd Cân Bằng ~86/100), lý do đề xuất, itinerary
> 3 ngày (kèm vị trí Maps từng điểm), cost breakdown, danh sách sản phẩm, điều kiện cần Sales xác nhận.

## 5. Bước chỉnh tour (điểm nhấn AI)

Khách chọn **Gói Cân Bằng**, rồi nhập vào ô chỉnh tour:

> 💬 **"Bỏ Hang Múa vì sợ mệt, thêm hoạt động nhẹ hơn."**

**Hệ thống xử lý:**
1. NiBi AI parse → `[{op:'remove', product_id:'hang-mua'}, {op:'add_like', tags:['relaxing','culture','nature'], avoid_tags:['active']}, {op:'set_intensity', level:'lighter'}]`.
2. Backend bỏ **Hang Múa** (−200.000), thêm **Đạp xe làng quê nhẹ / Phố cổ Hoa Lư / cafe chill** (+300.000), **tính lại giá**.
3. NiBi AI viết lại itinerary với nhịp nhẹ hơn.

**Kết quả mong đợi:**
| Hạng mục | Trước | Sau |
|---|---|---|
| Activity | 1.500.000 | 1.600.000 |
| **Total** | **7.800.000** | **~7.900.000** |

Itinerary cập nhật: thay khối "leo Hang Múa (~500 bậc)" bằng "đạp xe làng quê + ghé phố cổ Hoa
Lư, cafe view lúa" — đúng tinh thần "lịch nhẹ, chụp ảnh đẹp".

> Talking point: nhấn mạnh **giá thay đổi là do backend tính lại từ DB**, không phải NiBi AI bịa.

## 6. Gửi booking request + tạo order (commerce)

1. Khách thêm gói Cân Bằng (đã chỉnh) vào **cart** cùng sản phẩm đã thêm ở bước 0.
2. Với dịch vụ cần xác nhận (vd resort theo nhóm) → bấm **"Gửi yêu cầu đặt tour"** (booking request):
   - Điền `contact_name`, `contact_phone`, `contact_email`, ghi chú.
   - Hệ thống tạo `booking_requests`, sinh mã **`NBG-2026-0001`**, lưu DB, hiển thị trang xác nhận + trạng thái **NEW**.
   - Backend sinh **AI sales note** (lưu kèm booking).
3. Với dịch vụ có thể đặt ngay (vd vé tham quan/homestay đã thêm ở bước 0) → bấm **"Thanh toán"**
   để tạo **order**: mã **`NBO-2026-0001`**, `payment_status = pending` (demo, chưa kết nối cổng thật).

## 7. Phía Sales

1. Đăng nhập `sales@nibigo.demo` → vào `/sales/dashboard`.
2. Thấy **booking request mới** (`NBG-2026-0001`, trạng thái NEW) và **order mới** (`NBO-2026-0001`).
3. Mở chi tiết booking: nhu cầu khách + gói Cân Bằng (itinerary đã chỉnh) + tổng **~7.900.000đ**.
4. Đọc **AI sales note** (mục tiêu):
   > "Khách ưu tiên lịch nhẹ, trải nghiệm cặp đôi, ngân sách ~8 triệu. Nên xác nhận khách sạn
   > view đẹp, giữ dinner set và tư vấn lịch trình không quá dày."
5. Đổi trạng thái booking: **NEW → CONTACTED → CHECKING_AVAILABILITY** (ghi `booking_status_logs`
   ở mỗi bước) — minh họa đúng 2 trạng thái mới được thêm vào pipeline.
6. Đổi trạng thái order: **PENDING_CONFIRMATION → AWAITING_PAYMENT**.

## 8. Phía Editor/MOD (mới)

1. Đăng nhập `editor@nibigo.demo` → vào `/editor/products`.
2. Tạo nhanh 1 sản phẩm mới (vd hoạt động "Đạp xe làng quê Ninh Bình") với giá, ảnh, tags,
   **vị trí Maps** (nhập địa chỉ → geocode preview) → lưu `DRAFT` → gửi `PENDING_REVIEW`.
3. Mở `/editor/articles`, tạo 1 bài viết ngắn liên quan ("Gợi ý hoạt động nhẹ ở Ninh Bình cho
   cặp đôi") → gửi duyệt.

## 9. Phía Admin

1. Đăng nhập `admin@nibigo.demo` → vào `/admin/dashboard`.
2. Vào `/admin/approvals`, thấy sản phẩm + bài viết Editor vừa gửi → **Approve** → chuyển `PUBLISHED`.
3. Vào `/admin/bookings` và `/admin/orders` → thấy cả 2 luồng booking/order ở bước 6–7, kiểm
   trạng thái khớp lịch sử Sales đã đổi.
4. Vào `/admin/audit-logs` → thấy log approval + đổi trạng thái vừa xảy ra.

## 10. Kịch bản trình bày (script nói, ~9–10 phút)

| Phút | Hành động | Câu nói gợi ý |
|---|---|---|
| 0:00 | Mở landing `ai.nibigo.io.vn` | "Đây là NiBiGo AI Travel Platform — không chỉ là chatbot, mà cả một nền tảng commerce du lịch Ninh Bình." |
| 0:30 | Đăng nhập Buyer, khám phá `/buyer/explore` | "Khách có thể tự khám phá dịch vụ, xem vị trí trên Google Maps, trước khi cần đến AI." |
| 1:30 | Mở AI Planner, nhập nhu cầu | "Hoặc dùng NiBi AI: chỉ cần nhập nhu cầu — cặp đôi, 3N2Đ, 8 triệu, nghỉ dưỡng nhẹ." |
| 2:30 | Submit → 3 gói | "NiBi AI tạo 3 gói: Tiết kiệm 6.5tr, Cân bằng 7.8tr, Trải nghiệm 9.5tr — kèm fit score và lý do." |
| 3:30 | Mở gói Cân Bằng | "Lịch trình từng ngày, vị trí trên Maps, chi phí minh bạch theo hạng mục — mọi con số từ database." |
| 4:30 | Chỉnh tour | "Khách gõ tự nhiên: bỏ Hang Múa, thêm hoạt động nhẹ. NiBi AI cập nhật lịch + tính lại giá." |
| 5:30 | Cart + gửi booking/order | "Thêm vào cart, gửi booking cho dịch vụ cần xác nhận, hoặc tạo order để 'thanh toán' demo." |
| 6:30 | Sang Sales | "Sales thấy lead mới kèm AI sales note, xử lý đúng pipeline có thêm bước kiểm chỗ và chờ thanh toán." |
| 7:30 | Sang Editor/MOD | "Editor quản lý dữ liệu sản phẩm + bài viết, nhập cả vị trí Maps, gửi duyệt." |
| 8:30 | Sang Admin | "Admin duyệt nội dung, giám sát toàn bộ booking/order, xem audit log." |
| 9:30 | Chốt | "Backend lo tiền, dữ liệu và trạng thái; NiBi AI lo tư vấn — không bịa sản phẩm, giá, vị trí hay tình trạng đặt chỗ." |

## 11. Checklist trước khi demo
- [ ] Seed data đã có và 3 gói rơi đúng ~6.5 / 7.8 / 9.5 triệu.
- [ ] Có sản phẩm `limited`/`sold_out`/`need_confirmation` để minh họa availability.
- [ ] Hang Múa tồn tại trong gói Cân Bằng (để bước chỉnh tour có ý nghĩa).
- [ ] Mọi sản phẩm seed có `product_locations` (lat/lng) hợp lệ để Maps hiển thị đúng.
- [ ] 4 tài khoản demo (Buyer/Sales/Editor/Admin) đăng nhập được.
- [ ] AI sales note sinh ra hợp lý.
- [ ] Mã booking đúng định dạng `NBG-YYYY-NNNN`, mã order đúng `NBO-YYYY-NNNN`.
- [ ] Có sẵn ít nhất 1 sản phẩm + 1 bài viết ở trạng thái `PENDING_REVIEW` để demo Admin duyệt.
- [ ] Test trên cả desktop và mobile (responsive).
- [ ] Có sẵn phương án nếu LLM lỗi: fallback template vẫn cho ra itinerary + giá.

## 12. Phương án dự phòng khi demo
- **LLM chậm/timeout:** đã có fallback template → vẫn có itinerary + giá; nói rõ "đây là chế độ dự phòng".
- **Mạng kém / Maps không load:** chuẩn bị video screen-record toàn luồng làm backup.
- **Hỏi khó về "AI có bịa giá/vị trí không":** mở DevTools/Network hoặc DB để cho thấy
  `total_price`/`lat,lng` đến từ backend, không phải text NiBi AI.
- **Hỏi về vé máy bay/thời tiết:** trả lời rõ đây là phạm vi **version 2**, MVP tập trung trọn
  vẹn vào trải nghiệm Ninh Bình.
