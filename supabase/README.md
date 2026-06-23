# Supabase setup — NiBiGo AI Travel Platform

Hướng dẫn dựng database. Bạn đã có sẵn 1 Supabase project.

## 1. Lấy keys → điền `.env.local`
Supabase Dashboard → **Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ chỉ server-side, KHÔNG để lộ)

## 2. Chạy migrations (theo thứ tự)
**Cách A — SQL Editor (nhanh nhất):** mở Dashboard → **SQL Editor**, dán & Run lần lượt:
1. `migrations/0001_init.sql`  — enums, bảng, trigger (mô hình 2-role gốc)
2. `migrations/0002_rls.sql`   — Row Level Security + policy
3. `migrations/0003_rag.sql`   — pgvector + bảng RAG
4. `migrations/0004_expand_schema.sql` — **Phase 8**: 4 role + schema commerce/CMS
5. `migrations/0005_rls_roles.sql`     — **Phase 8**: RLS theo 4 role

> ⚠️ **Quan trọng:** chạy `0004` xong (Run, đợi thành công) **rồi mới** chạy `0005`. Không gộp
> 2 file vào một lần Run — Postgres không cho dùng enum value vừa `ADD VALUE` (`sales`/`editor`)
> trong cùng transaction mà `0005` cần.
>
> Nếu DB đã chạy `0001–0003` từ trước (đang có data), chỉ cần chạy thêm `0004` rồi `0005` —
> chúng nối tiếp, an toàn với dữ liệu cũ (`guest` → `buyer` tự đổi, `travel_products` →
> `products`). Các lệnh đều `if not exists`/`if exists` nên chạy lại không lỗi.

**Cách B — Supabase CLI (nếu đã cài & link):**
```bash
supabase link --project-ref <your-ref>
supabase db push          # áp dụng migrations/ theo thứ tự
```

## 3. Bật/đăng ký demo users
Để demo nhanh, **tắt xác nhận email**: Dashboard → **Authentication → Providers → Email** →
tắt *Confirm email* (signup sẽ đăng nhập ngay).

Sau đó:
1. Đăng ký các tài khoản demo qua trang **/register**: `buyer@nibigo.demo`, `sales@nibigo.demo`,
   `editor@nibigo.demo`, `admin@nibigo.demo` (user mới mặc định role `buyer`).
2. Chạy `seed/seed.sql` (tạo destination Ninh Bình + nâng quyền admin cho `admin@nibigo.demo`).
3. Gán role cho 2 tài khoản còn lại (tạm thời bằng SQL, tới Phase 13 sẽ có UI Admin):
   ```sql
   update public.profiles set role = 'sales'  where email = 'sales@nibigo.demo';
   update public.profiles set role = 'editor' where email = 'editor@nibigo.demo';
   ```

## 4. Kiểm tra
- Bảng `profiles` có các user; `admin@nibigo.demo` role `admin`, `sales@`/`editor@` đúng role.
- Đăng nhập buyer → vào `/dashboard`; mở `/admin` → bị đẩy về `/dashboard`.
- Đăng nhập admin → vào được `/admin`.
- Bảng `products` (đổi tên từ `travel_products`) còn nguyên dữ liệu cũ, có cột `status='published'`.
- Các bảng commerce mới tồn tại & rỗng: `orders`, `cart_items`, `articles`, `product_locations`…

## 5. Sinh TypeScript types (tùy chọn)
```bash
supabase gen types typescript --project-id <your-ref> > src/types/database.ts
```
Domain types hiện đặt ở `src/types/index.ts`.
