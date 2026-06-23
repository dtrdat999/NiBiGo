# NiBiGo AI Travel Platform

> **Nền tảng commerce du lịch Ninh Bình có AI cá nhân hóa.**
> AI assistant: **NiBi AI**

NiBiGo AI Travel Platform là web app giúp khách (**Buyer**) khám phá, lên kế hoạch và đặt dịch
vụ du lịch Ninh Bình (tour, homestay, khách sạn, thuê xe, trải nghiệm, combo) — có **NiBi AI**
hỗ trợ cá nhân hóa lịch trình, **Google Maps** hỗ trợ quyết định theo vị trí, **cart/booking/order**
để đặt dịch vụ thật, và bộ dashboard vận hành cho **Sales**, **Editor/MOD**, **Admin**.

Đây là module web app độc lập, mở rộng từ website du lịch [nibigo.io.vn](https://nibigo.io.vn)
(WordPress / cPanel). App được build riêng tại domain **`ai.nibigo.io.vn`** để không phụ thuộc
kỹ thuật vào WordPress.

---

## 1. Vấn đề & định vị

Khách đi du lịch trọn gói thường gặp: không biết tự ghép tour hợp ngân sách, khó so sánh
khách sạn/homestay/điểm tham quan/ăn uống/phương tiện theo vị trí, lịch trình thiếu minh bạch
chi phí, và quá trình tư vấn/đặt dịch vụ thủ công mất thời gian.

**NiBiGo KHÔNG phải chatbot du lịch chung chung.** Đây là một nền tảng commerce có sản phẩm
thật, giá thật, vị trí thật, trạng thái còn chỗ thật — **NiBi AI** chỉ làm phần hiểu nhu cầu,
cá nhân hóa và tư vấn ngôn ngữ; **không bịa** sản phẩm/giá/tình trạng đặt chỗ.

## 2. Nguyên tắc thiết kế

- **Small scope, premium execution** — một điểm đến (Ninh Bình), phạm vi commerce rõ ràng, làm thật chỉn chu.
- **Backend tính tiền, NiBi AI viết lời.** Giá cuối cùng luôn do backend tính từ database.
- **AI suggests, system verifies.** NiBi AI chỉ chọn trong danh sách sản phẩm do backend cung cấp; không tự quyết định availability hay payment status.
- **Human-in-the-loop.** Booking/order luôn cần Sales/Admin xác nhận ở MVP — không có chuyện hệ thống tự nhận "đã đặt xong".
- **Transparent state management.** Mọi booking/order có trạng thái rõ, có lịch sử thay đổi.
- **Kiến trúc mở rộng được** — sẵn sàng cho payment gateway thật, Zalo OA/Mini App, đa điểm đến, partner portal ở các phase sau.

## 3. Tech stack (MVP)

| Lớp | Công nghệ |
|---|---|
| Frontend + Backend | **Next.js 14+ (App Router, TypeScript)** full-stack |
| Database + Auth | **Supabase** (Postgres + Auth + RLS, pgvector cho RAG) |
| AI API | **OpenAI hoặc Gemini** qua một lớp abstraction `lib/ai/provider` |
| Bản đồ | **Google Maps Platform** (Maps JS API + Geocoding) |
| Styling | **Tailwind CSS** + bộ UI primitives (shadcn-style) |
| Deploy | **Vercel** (app AI) — `ai.nibigo.io.vn` |
| WordPress | Giữ nguyên trên cPanel (`nibigo.io.vn`), **không** đụng tới trong MVP |

> ⚠️ App AI **không** deploy vào cPanel ở MVP. cPanel chỉ giữ WordPress.

## 4. Vai trò (4 roles)

| Role | Mục tiêu chính |
|---|---|
| **Buyer** (khách hàng) | Khám phá dịch vụ, dùng NiBi AI lập lịch trình, xem vị trí trên Maps, thêm vào cart, gửi booking request/order, theo dõi trạng thái |
| **Sales** | Xử lý booking request/order, xác nhận availability, đọc AI sales note, cập nhật trạng thái, chăm sóc khách |
| **Editor/MOD** | Quản lý dữ liệu sản phẩm (tour/homestay/hotel/restaurant/transport/combo), vị trí Google Maps, bài viết/guide |
| **Admin** | Quản trị user/role, duyệt sản phẩm & nội dung, giám sát booking/order/payment, cấu hình hệ thống, audit log |

Chi tiết workflow từng role: [docs/ba/04-business-process-workflow.md](docs/ba/04-business-process-workflow.md)
và [docs/ui-ux/](docs/ui-ux/).

## 5. Ngoài phạm vi MVP

Loại trừ rõ ràng, để dành **version 2**:
- ❌ Đặt vé máy bay thật (flight booking API).
- ❌ Weather API.

Toàn bộ phần còn lại — discovery/listing, NiBi AI planning, Google Maps, cart/booking/order,
CMS bài viết, payment status (demo/manual) — đều **trong phạm vi MVP**. Chi tiết:
[docs/MVP_SCOPE.md](docs/MVP_SCOPE.md).

## 6. Tài liệu dự án

Đọc theo thứ tự sau:

| Tài liệu | Nội dung |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product Requirements — vấn đề, mục tiêu, người dùng, yêu cầu, success metrics |
| [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) | Phạm vi MVP: làm gì / không làm / Definition of Done |
| [docs/USER_FLOW.md](docs/USER_FLOW.md) | Sitemap 4 role, các luồng, state machine booking/order |
| [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md) | Kiến trúc hệ thống, thư mục, API routes, bảo mật |
| [docs/DATA_SCHEMA.md](docs/DATA_SCHEMA.md) | Schema database, bảng, enum, RLS, seed data |
| [docs/AI_DESIGN.md](docs/AI_DESIGN.md) | Phân vai backend vs NiBi AI, prompt, RAG, fit score, guardrails |
| [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) | Kịch bản demo end-to-end 4 role |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Lộ trình build theo phase: MVP-Core (đã build) → mở rộng → tương lai |
| [docs/ba/](docs/ba/) | Business Analysis sâu: project overview, BRD, persona/JTBD, business process, user stories |
| [docs/ui-ux/](docs/ui-ux/) | UI/UX chi tiết theo từng role: Buyer, Sales, Editor/MOD, Admin |

> `docs/ba/*` và `docs/ui-ux/*` là tài liệu BA/UIUX chi tiết, đã đồng bộ tên sản phẩm/AI/domain
> với các file gốc ở trên. Các file gốc (PRD, MVP_SCOPE, USER_FLOW, SYSTEM_ARCHITECTURE,
> DATA_SCHEMA, AI_DESIGN, ROADMAP) là **bản tóm tắt kỹ thuật chính thức**; `ba/` và `ui-ux/`
> là **phần đào sâu nghiệp vụ/giao diện**.

## 7. Bắt đầu nhanh

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file môi trường từ mẫu
cp .env.example .env.local

# 3. Điền biến môi trường (xem mục 8) vào .env.local

# 4. Đẩy schema + seed lên Supabase
#    (qua Supabase SQL editor hoặc supabase CLI)
#    supabase db push && supabase db seed

# 5. Chạy dev
npm run dev
# → http://localhost:3000
```

## 8. Biến môi trường

Tạo `.env.local` (KHÔNG commit). Mẫu đầy đủ ở `.env.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # chỉ dùng server-side, KHÔNG để lộ client

# AI provider
AI_PROVIDER=openai                # openai | gemini
OPENAI_API_KEY=
GEMINI_API_KEY=
AI_MODEL=gpt-4o-mini              # hoặc gemini-1.5-flash

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=  # client-side, giới hạn bằng HTTP referrer + API restriction

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> 🔒 **Không bao giờ commit `.env.local` hay key.** `SUPABASE_SERVICE_ROLE_KEY` và
> `*_API_KEY` (trừ Maps client key, đã giới hạn quyền) chỉ dùng trong server code. Xem
> [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md) mục Bảo mật.

## 9. Tài khoản demo

| Role | Email | Ghi chú |
|---|---|---|
| Buyer | `buyer@nibigo.demo` | Khám phá dịch vụ, dùng NiBi AI, gửi booking/order |
| Sales | `sales@nibigo.demo` | Xử lý booking/order, đọc AI sales note |
| Editor/MOD | `editor@nibigo.demo` | Quản lý sản phẩm + bài viết |
| Admin | `admin@nibigo.demo` | Quản trị toàn nền tảng |

## 10. Trạng thái dự án

Codebase hiện tại đã build xong **MVP-Core** theo mô hình 2-role ban đầu (Guest/Admin, chỉ
luồng AI planning + booking request). Quyết định mở rộng sang **4 role + full commerce scope**
(mục 4–5) được chốt sau khi rà soát BA/UIUX — phần dưới đây phản ánh những gì **đã chạy**, còn
việc nâng cấp lên schema/role mới nằm ở [docs/ROADMAP.md](docs/ROADMAP.md) Phase MVP-Core→Phase mở rộng.

🟢 **Phase 1 — Project setup: hoàn tất.** Khung Next.js 14 + Tailwind + Supabase clients + landing.
🟢 **Phase 2 — Auth + DB schema: code hoàn tất** (chờ bạn chạy migrations + tạo demo users).
- SQL: `supabase/migrations/0001_init.sql`, `0002_rls.sql`, `0003_rag.sql`, `supabase/seed/seed.sql`
- Auth: `/login`, `/register`, `/auth/callback`, `/auth/signout`, `middleware.ts` guard route
- Trang có guard: `/dashboard` (guest), `/admin` (chỉ role admin)
🟢 **Phase 3 — Travel product catalog: code hoàn tất.**
- Seed kho dịch vụ Ninh Bình (26 sản phẩm: 5 hotel · 10 activity · 5 restaurant · 4 transport · 2 combo, có `limited`/`sold_out`) + 4 knowledge docs
- Admin `/admin/products`: filter theo loại, thêm/sửa (modal form), inline toggle active + đổi availability
- API `POST /api/products`, `PATCH /api/products/[id]`, `GET /api/products` (đều chặn non-admin)
🟢 **Phase 4 — Trip request form: code hoàn tất.**
- `/plan`: form nhu cầu (số ngày, ngày đi, thành phần đoàn, ngân sách + preset, phong cách, sở thích chips, yêu cầu đặc biệt) — default sẵn theo kịch bản demo
- `POST /api/trip-requests` → lưu `trip_requests` (status `draft`) → điều hướng `/proposals/[requestId]`
- Dashboard guest liệt kê các trip request đã tạo; trang 404 branded; nav "Sắp có" cho phase sau
🟢 **Phase 5 — Tour generation logic (engine): code hoàn tất.**
- `lib/tour-engine`: `filter` (loại sold_out) · `scoring` (fit 30/25/20/15/10) · `pricing` (line_total từ price_unit) · `package-builder` (chọn theo tier → 3 gói)
- `POST /api/tours/generate`: dựng 3 gói, **tính giá từ DB**, lưu `tour_packages` + `tour_package_items` qua service role
🟢 **Phase 6 — AI itinerary/explanation (OpenAI): code hoàn tất.**
- `lib/ai`: `provider` (OpenAI gpt-4o-mini, JSON mode, server-only) · `prompts` · `itinerary` (NiBi AI → validate `product_id` → merge, **giữ nguyên giá**, fallback template)
- `/api/tours/generate`: engine chốt giá → RAG → NiBi AI viết tên/lý do/itinerary; `/tour/[packageId]` + `ItineraryTimeline`
🟢 **Phase 7 — Booking flow + chỉnh tour: code hoàn tất.**
- **Chỉnh tour bằng NL**: `lib/ai/revise` (parse → ops) + `lib/tour-engine/apply-revision` (áp dụng + **tính lại giá**) → re-enrich AI; `POST /api/tours/revise`; `ReviseBox` trên trang chi tiết
- **Booking**: `POST /api/bookings` (mã `NBG-YYYY-NNNN` qua `next_booking_code()`, **AI sales note** `lib/ai/sales-note`, lưu `booking_requests` + history + set trip `submitted`); `BookingForm`/`BookingButton`; `/bookings/[code]` confirmation
- `assemblePackage` tách ra dùng chung; `npm run build` sạch (19 routes)

Bước tiếp theo: **Phase 8 — Role & schema expansion** (4 role, cart/order, Maps, CMS) trước khi
sang Admin/Sales/Editor dashboard đầy đủ. Xem [docs/ROADMAP.md](docs/ROADMAP.md).

> ⚙️ **Việc bạn cần làm để chạy Phase 2 (xem [supabase/README.md](supabase/README.md)):**
> 1. Copy `.env.example` → `.env.local`, điền keys Supabase + `OPENAI_API_KEY`.
> 2. Chạy 3 migrations + seed trong Supabase SQL Editor.
> 3. Tắt *Confirm email* (Auth settings) cho demo nhanh; đăng ký `guest@nibigo.demo` + `admin@nibigo.demo`; chạy seed để nâng quyền admin.

## 11. License & ghi chú

Dự án học tập trong chương trình **GenAI Engineer** (đề tài **AI20K-207 — AI Trợ Lý Lập Kế
Hoạch Tour Trọn Gói Cá Nhân Hóa**), mở rộng thành **NiBiGo AI Travel Platform** theo yêu cầu
nghiệp vụ thực tế. Dữ liệu tour là seed mẫu, lấy cảm hứng/chuẩn hóa từ NiBiGo; chưa phải dữ
liệu thương mại thật.
