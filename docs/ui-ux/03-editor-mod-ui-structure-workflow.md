# 03. Editor/MOD UI Structure & Workflow — NiBiGo AI Travel Platform

**Role:** EDITOR/MOD  
**Primary user:** Người quản lý dữ liệu sản phẩm và nội dung du lịch  
**Goal:** Tạo, cập nhật và chuẩn hóa dữ liệu tour, homestay, khách sạn, xe, trải nghiệm, combo và bài viết để hệ thống và NiBi AI sử dụng chính xác  

---

## 1. Editor/MOD UX Objective

Editor/MOD là role quyết định chất lượng dữ liệu đầu vào. Nếu dữ liệu sản phẩm sai, thiếu tag, sai giá hoặc sai availability, NiBi AI sẽ gợi ý kém dù prompt tốt.

UI của Editor/MOD cần giúp:

- Nhập sản phẩm nhanh nhưng đủ trường quan trọng.
- Giảm lỗi dữ liệu.
- Preview sản phẩm trước khi publish.
- Quản lý availability rõ ràng.
- Phân biệt Draft, Pending Review, Published, Archived.
- Tạo nội dung du lịch có cấu trúc tốt cho SEO và tư vấn.

---

## 2. Editor/MOD Navigation Structure

```txt
Editor/MOD App
├── Dashboard
├── Products
│   ├── All Products
│   ├── Create Product
│   ├── Edit Product
│   └── Availability Management
├── Articles / Guides
│   ├── All Articles
│   ├── Create Article
│   └── Edit Article
├── Media Library
├── Drafts
├── Pending Review
└── Profile
```

---

## 3. Editor/MOD Main Screens

| Screen | Route | Mục tiêu |
|---|---|---|
| Editor Dashboard | `/editor/dashboard` | Tổng quan sản phẩm/nội dung cần xử lý |
| Product List | `/editor/products` | Quản lý danh sách sản phẩm |
| Create Product | `/editor/products/new` | Tạo sản phẩm mới |
| Edit Product | `/editor/products/:id/edit` | Cập nhật sản phẩm |
| Availability Management | `/editor/products/availability` | Cập nhật trạng thái còn chỗ |
| Article List | `/editor/articles` | Quản lý bài viết/guide |
| Create Article | `/editor/articles/new` | Tạo bài viết mới |
| Edit Article | `/editor/articles/:id/edit` | Sửa bài viết |
| Media Library | `/editor/media` | Quản lý ảnh |
| Pending Review | `/editor/pending-review` | Nội dung/sản phẩm chờ duyệt |

---

## 4. Editor Dashboard Structure

### 4.1 Mục tiêu

Editor/MOD thấy nhanh dữ liệu nào cần hoàn thiện.

### 4.2 UI Components

- Total products.
- Draft products.
- Pending review products.
- Published products.
- Products with missing fields.
- Products with limited/sold out availability.
- Recent articles.
- Quick create buttons.

### 4.3 Primary Actions

- Create product.
- Create article.
- Update availability.
- Continue draft.
- Submit for review.

---

## 5. Product Management Structure

### 5.1 Product Types

MVP hỗ trợ các loại sản phẩm:

- Tour.
- Homestay.
- Hotel.
- Transport.
- Experience/activity.
- Restaurant/meal.
- Combo/package.

### 5.2 Product Status

| Status | Ý nghĩa |
|---|---|
| Draft | Đang soạn, chưa gửi duyệt |
| Pending Review | Chờ Admin duyệt |
| Published | Đã hiển thị cho Buyer và AI có thể dùng |
| Rejected | Admin yêu cầu chỉnh sửa |
| Archived | Không còn hiển thị |

### 5.3 Availability Status

| Status | Ý nghĩa |
|---|---|
| Available | Có thể đề xuất/đặt |
| Limited | Còn ít chỗ, cần xác nhận |
| Sold out | Không được đề xuất như lựa chọn có thể đặt |
| Hidden | Ẩn khỏi Buyer |
| Inactive | Không dùng trong hệ thống |

---

## 6. Product List Screen

### 6.1 UI Components

- Search bar.
- Filter:
  - Product type.
  - Status.
  - Availability.
  - Destination.
  - Tags.
  - Created by.
- Product table.
- Bulk actions nếu cần.
- Create product CTA.

### 6.2 Product Table Fields

| Field | Ý nghĩa |
|---|---|
| Image | Ảnh đại diện |
| Name | Tên sản phẩm |
| Type | Loại sản phẩm |
| Destination | Điểm đến |
| Price | Giá |
| Availability | Trạng thái còn chỗ |
| Status | Draft/Pending/Published |
| Last updated | Cập nhật gần nhất |
| Actions | Edit/Preview/Submit |

---

## 7. Create/Edit Product Screen

### 7.1 Layout đề xuất

```txt
Product Form
├── Basic Information
├── Pricing
├── Location
├── Availability
├── Tags & Suitability
├── Media
├── Description
├── AI/RAG Metadata
├── SEO Metadata
└── Preview & Submit
```

### 7.2 Required Product Fields

| Field | Required | Ghi chú |
|---|---|---|
| Name | Yes | Tên dịch vụ |
| Type | Yes | Tour/hotel/homestay/transport/experience |
| Destination | Yes | MVP: Ninh Bình |
| Description | Yes | Mô tả rõ cho Buyer và AI |
| Price | Yes | Giá nền để backend tính |
| Duration | Optional | Quan trọng với tour/experience |
| Tags | Yes | Dùng cho matching |
| Suitable for | Yes | Family/couple/group/kids/elderly |
| Availability status | Yes | Available/Limited/Sold out |
| Image URL / Media | Optional but recommended | UI card/detail |
| Location | Optional but recommended | Map và itinerary |
| Is active | Yes | Có dùng trong hệ thống không |

### 7.3 Tags đề xuất

```txt
nature
photo
couple
family
budget
premium
relaxing
food
culture
active
kids
elderly-friendly
```

### 7.4 Validation Rules

- Product name không được rỗng.
- Price phải là số dương.
- Published product bắt buộc có type, destination, description, price, tags, availability.
- Sold out product không nên được NiBi AI đề xuất trong booking flow.
- Draft có thể thiếu trường nhưng phải hiển thị checklist còn thiếu.
- Tags nên dùng danh sách chuẩn để tránh dữ liệu rác.

---

## 8. Product Creation Workflow

### 8.1 Main Flow

```txt
Editor/MOD đăng nhập
→ Vào Products
→ Chọn Create Product
→ Nhập thông tin cơ bản
→ Nhập giá và availability
→ Gắn tag và suitable_for
→ Thêm ảnh/location/mô tả
→ Preview
→ Save draft hoặc Submit for review
→ Admin duyệt
→ Product được publish
```

### 8.2 Alternative Flow

```txt
Editor/MOD tạo sản phẩm
→ Thiếu trường bắt buộc
→ Hệ thống hiển thị checklist lỗi
→ Editor/MOD bổ sung
→ Submit lại
```

### 8.3 Data Created/Updated

- Product record.
- Product tags.
- Product availability.
- Product media.
- Product status.
- Product audit log.

---

## 9. Product Update Workflow

### 9.1 Main Flow

```txt
Editor/MOD mở Product List
→ Chọn sản phẩm
→ Edit
→ Cập nhật thông tin
→ Preview thay đổi
→ Save draft hoặc Submit for review
→ Admin duyệt nếu thay đổi quan trọng
→ Product updated
```

### 9.2 Business Rules

- Thay đổi giá, availability, location nên ghi audit log.
- Product đang Published nếu sửa trường quan trọng có thể chuyển về Pending Review.
- Không nên xóa cứng product đã từng nằm trong booking.
- Product đã có booking liên quan nên chỉ cho Archive/Inactive thay vì Delete.

---

## 10. Availability Management Workflow

### 10.1 Objective

Cập nhật nhanh trạng thái còn chỗ để tránh AI gợi ý sai.

### 10.2 Flow

```txt
Editor/MOD mở Availability Management
→ Lọc sản phẩm theo loại/ngày/trạng thái
→ Chọn sản phẩm
→ Cập nhật Available/Limited/Sold out
→ Save
→ Hệ thống cập nhật trạng thái cho AI và Buyer UI
```

### 10.3 UI Components

- Availability table.
- Quick status dropdown.
- Last updated by.
- Last updated at.
- Warning nếu sold out nhưng đang nằm trong plan/booking chưa xử lý.

---

## 11. Article/Guide Management

### 11.1 Article Types

- Travel guide.
- Destination guide.
- Food guide.
- Experience guide.
- Booking guide.
- Local tips.
- SEO blog.

### 11.2 Article Fields

| Field | Required |
|---|---|
| Title | Yes |
| Slug | Yes |
| Summary | Yes |
| Content | Yes |
| Cover image | Recommended |
| Category | Yes |
| Tags | Recommended |
| Related products | Recommended |
| SEO title | Optional |
| SEO description | Optional |
| Status | Yes |

### 11.3 Article Publishing Workflow

```txt
Editor/MOD vào Articles
→ Create Article
→ Nhập title, summary, content, category, tags
→ Gắn related products nếu có
→ Preview
→ Save draft hoặc Submit for review
→ Admin duyệt
→ Article Published
```

---

## 12. Preview UX

Preview rất quan trọng vì Editor/MOD cần biết Buyer sẽ thấy gì.

Preview nên có:

- Product card preview.
- Product detail preview.
- AI data preview: tags, suitable_for, price, availability.
- Missing field checklist.
- SEO preview nếu là article.

---

## 13. Editor/MOD Permission Rules

Editor/MOD được phép:

- Tạo product/article.
- Sửa product/article do mình quản lý.
- Save draft.
- Submit for review.
- Cập nhật availability nếu được cấp quyền.
- Upload/select media nếu có.

Editor/MOD không được phép:

- Tự duyệt nội dung nếu policy yêu cầu Admin approval.
- Đổi role user.
- Xóa booking/order.
- Đổi cấu hình hệ thống.
- Xem dữ liệu nhạy cảm ngoài phạm vi cần thiết.

---

## 14. Editor/MOD UI Acceptance Criteria

Editor/MOD flow đạt MVP khi:

- Editor/MOD đăng nhập được.
- Xem được dashboard nội dung/sản phẩm.
- Tạo được product với trường bắt buộc.
- Cập nhật được product.
- Cập nhật được availability.
- Tạo được article/guide.
- Save draft được.
- Submit for review được.
- Preview được product/article.
- Dữ liệu Published có thể xuất hiện ở Buyer UI và được NiBi AI dùng.
- Form có validation rõ ràng.
