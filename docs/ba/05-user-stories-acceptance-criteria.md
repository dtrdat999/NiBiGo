# 05. User Stories & Acceptance Criteria — NiBiGo AI Travel Platform

**Project name:** NiBiGo AI Travel Platform
**AI assistant name:** NiBi AI
**Document type:** User Stories & Acceptance Criteria
**Version:** v1.0
**Status:** Draft
**Owner:** Đặng Trần Đạt
**Last updated:** 2026-06-22

---

## 1. Document Purpose

Tài liệu này mô tả các user stories và acceptance criteria cho MVP của NiBiGo AI Travel Platform.

Mục tiêu của tài liệu là chuyển các yêu cầu kinh doanh và workflow thành các đầu việc có thể triển khai, kiểm thử và nghiệm thu.

Tài liệu này giúp:

* Product owner xác định tính năng cần có.
* Developer hiểu rõ cần build gì.
* Designer hiểu hành vi người dùng trên từng flow.
* Tester biết tiêu chí kiểm thử.
* Mentor/evaluator thấy dự án có scope rõ ràng, có logic nghiệp vụ và có tiêu chuẩn hoàn thành.

Mỗi user story được viết theo cấu trúc:

**Là một [role], tôi muốn [mục tiêu], để [giá trị nhận được].**

Acceptance criteria được viết theo dạng:

**Given [điều kiện ban đầu], when [hành động xảy ra], then [kết quả mong muốn].**

---

## 2. MVP Roles

MVP có 4 role chính:

| Role       | Mô tả                                                                             |
| ---------- | --------------------------------------------------------------------------------- |
| BUYER      | Khách hàng cuối, tìm kiếm, nhận tư vấn và đặt dịch vụ du lịch                     |
| SALES      | Nhân sự xử lý booking, liên hệ khách, xác nhận dịch vụ và cập nhật trạng thái     |
| EDITOR/MOD | Người quản lý nội dung, sản phẩm, bài viết, ảnh, vị trí và thông tin dịch vụ      |
| ADMIN      | Người quản trị toàn bộ nền tảng, user, role, sản phẩm, booking, order và cấu hình |

---

## 3. MVP Epics

MVP được chia thành 8 nhóm tính năng chính:

| Epic ID | Epic Name                               | Mục tiêu                                                             |
| ------- | --------------------------------------- | -------------------------------------------------------------------- |
| EPIC-01 | Authentication & Role-based Access      | Đăng ký, đăng nhập và phân quyền                                     |
| EPIC-02 | Buyer Discovery                         | Buyer khám phá tour, homestay, khách sạn, thuê xe, combo và bài viết |
| EPIC-03 | NiBi AI Assistant                       | NiBi AI tư vấn, gợi ý dịch vụ và tạo lịch trình                      |
| EPIC-04 | Cart, Booking & Order                   | Buyer chọn dịch vụ, gửi booking request hoặc tạo order               |
| EPIC-05 | Sales Operation                         | Sales xử lý booking/order và cập nhật trạng thái                     |
| EPIC-06 | Editor/MOD Product & Content Management | Editor/MOD quản lý sản phẩm và nội dung                              |
| EPIC-07 | Admin Management                        | Admin quản trị user, role, sản phẩm, booking, order và dashboard     |
| EPIC-08 | Google Maps & Location                  | Quản lý và hiển thị vị trí dịch vụ                                   |

---

# EPIC-01 — Authentication & Role-based Access

---

## US-01. Buyer Registration

**Là một Buyer, tôi muốn đăng ký tài khoản, để có thể sử dụng NiBi AI, lưu thông tin chuyến đi và theo dõi booking của mình.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                               | When                                                    | Then                                                               |
| ------- | ----------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| AC-01.1 | Buyer chưa có tài khoản             | Buyer nhập email, mật khẩu và thông tin bắt buộc hợp lệ | Hệ thống tạo tài khoản mới với role mặc định là `BUYER`            |
| AC-01.2 | Email đã tồn tại                    | Buyer cố đăng ký bằng email đó                          | Hệ thống hiển thị thông báo tài khoản đã tồn tại                   |
| AC-01.3 | Buyer nhập thiếu thông tin bắt buộc | Buyer bấm đăng ký                                       | Hệ thống hiển thị lỗi validation                                   |
| AC-01.4 | Tài khoản được tạo thành công       | Buyer đăng ký xong                                      | Buyer được chuyển đến Buyer Dashboard hoặc trang tiếp theo phù hợp |

---

## US-02. User Login

**Là một người dùng, tôi muốn đăng nhập vào hệ thống, để truy cập các chức năng phù hợp với role của mình.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                          | When                                   | Then                                                 |
| ------- | ------------------------------ | -------------------------------------- | ---------------------------------------------------- |
| AC-02.1 | Người dùng có tài khoản hợp lệ | Người dùng nhập đúng email và mật khẩu | Hệ thống đăng nhập thành công                        |
| AC-02.2 | Người dùng là Buyer            | Buyer đăng nhập                        | Buyer được chuyển đến Buyer Dashboard                |
| AC-02.3 | Người dùng là Sales            | Sales đăng nhập                        | Sales được chuyển đến Sales Dashboard                |
| AC-02.4 | Người dùng là Editor/MOD       | Editor/MOD đăng nhập                   | Editor/MOD được chuyển đến Content/Product Dashboard |
| AC-02.5 | Người dùng là Admin            | Admin đăng nhập                        | Admin được chuyển đến Admin Dashboard                |
| AC-02.6 | Thông tin đăng nhập sai        | Người dùng bấm Login                   | Hệ thống hiển thị thông báo lỗi                      |

---

## US-03. Role-based Access Control

**Là một Admin, tôi muốn hệ thống phân quyền theo role, để mỗi người dùng chỉ truy cập được chức năng phù hợp.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                   | When                                                | Then                             |
| ------- | ----------------------- | --------------------------------------------------- | -------------------------------- |
| AC-03.1 | Buyer đã đăng nhập      | Buyer truy cập trang Admin Dashboard                | Hệ thống chặn truy cập           |
| AC-03.2 | Sales đã đăng nhập      | Sales truy cập trang quản lý role                   | Hệ thống chặn truy cập           |
| AC-03.3 | Editor/MOD đã đăng nhập | Editor/MOD truy cập payment/order status management | Hệ thống chặn nếu không có quyền |
| AC-03.4 | Admin đã đăng nhập      | Admin truy cập mọi dashboard nội bộ                 | Hệ thống cho phép truy cập       |
| AC-03.5 | User chưa đăng nhập     | User truy cập trang cần đăng nhập                   | Hệ thống chuyển đến Login        |

---

# EPIC-02 — Buyer Discovery

---

## US-04. View Service Categories

**Là một Buyer, tôi muốn xem các nhóm dịch vụ du lịch, để biết NiBiGo đang cung cấp những lựa chọn nào.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                                | When                     | Then                                                                           |
| ------- | ------------------------------------ | ------------------------ | ------------------------------------------------------------------------------ |
| AC-04.1 | Buyer truy cập nền tảng              | Buyer mở trang khám phá  | Hệ thống hiển thị các nhóm dịch vụ chính                                       |
| AC-04.2 | Có dữ liệu dịch vụ active            | Buyer xem trang danh mục | Hệ thống hiển thị Tour, Homestay/Hotel, Transport, Experience, Combo, Articles |
| AC-04.3 | Không có sản phẩm trong một danh mục | Buyer mở danh mục đó     | Hệ thống hiển thị empty state rõ ràng                                          |
| AC-04.4 | Buyer chọn một danh mục              | Buyer click vào danh mục | Hệ thống mở danh sách sản phẩm tương ứng                                       |

---

## US-05. View Product Listing

**Là một Buyer, tôi muốn xem danh sách sản phẩm du lịch, để có thể tìm dịch vụ phù hợp với nhu cầu của mình.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                          | When                         | Then                                                     |
| ------- | ------------------------------ | ---------------------------- | -------------------------------------------------------- |
| AC-05.1 | Có sản phẩm active             | Buyer mở trang listing       | Hệ thống hiển thị danh sách sản phẩm                     |
| AC-05.2 | Sản phẩm có ảnh, tên, giá, tag | Buyer xem listing            | Card sản phẩm hiển thị các thông tin cơ bản              |
| AC-05.3 | Sản phẩm inactive              | Buyer xem listing            | Sản phẩm inactive không được hiển thị                    |
| AC-05.4 | Sản phẩm sold out              | Buyer xem listing            | Hệ thống hiển thị trạng thái sold out hoặc không cho đặt |
| AC-05.5 | Buyer chọn một sản phẩm        | Buyer click vào product card | Hệ thống mở trang chi tiết sản phẩm                      |

---

## US-06. Filter Products

**Là một Buyer, tôi muốn lọc sản phẩm theo loại, giá, tag và nhóm phù hợp, để tìm lựa chọn nhanh hơn.**

### Priority

Should-have

### Acceptance Criteria

| ID      | Given                               | When                       | Then                                                          |
| ------- | ----------------------------------- | -------------------------- | ------------------------------------------------------------- |
| AC-06.1 | Buyer đang ở trang listing          | Buyer chọn filter theo giá | Hệ thống chỉ hiển thị sản phẩm trong khoảng giá đã chọn       |
| AC-06.2 | Buyer chọn tag `family`             | Hệ thống áp dụng filter    | Danh sách ưu tiên hoặc chỉ hiển thị sản phẩm phù hợp gia đình |
| AC-06.3 | Buyer chọn product type `transport` | Hệ thống áp dụng filter    | Chỉ hiển thị dịch vụ thuê xe/di chuyển                        |
| AC-06.4 | Không có sản phẩm phù hợp filter    | Buyer áp dụng filter       | Hệ thống hiển thị empty state và gợi ý xóa filter             |
| AC-06.5 | Buyer reset filter                  | Buyer bấm reset            | Hệ thống hiển thị lại danh sách ban đầu                       |

---

## US-07. View Product Detail

**Là một Buyer, tôi muốn xem chi tiết sản phẩm, để đánh giá sản phẩm có phù hợp trước khi đặt.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                         | When                     | Then                                                             |
| ------- | ----------------------------- | ------------------------ | ---------------------------------------------------------------- |
| AC-07.1 | Buyer mở một sản phẩm active  | Trang chi tiết được tải  | Hệ thống hiển thị tên, ảnh, mô tả, giá, tag, availability và CTA |
| AC-07.2 | Sản phẩm có vị trí            | Buyer xem trang chi tiết | Hệ thống hiển thị bản đồ hoặc thông tin địa chỉ                  |
| AC-07.3 | Sản phẩm có chính sách        | Buyer xem chi tiết       | Hệ thống hiển thị chính sách cơ bản nếu có                       |
| AC-07.4 | Sản phẩm sold out             | Buyer xem chi tiết       | CTA đặt dịch vụ bị vô hiệu hóa hoặc hiển thị cảnh báo            |
| AC-07.5 | Buyer muốn hỏi AI về sản phẩm | Buyer bấm “Hỏi NiBi AI”  | Hệ thống mở NiBi AI với context sản phẩm hiện tại                |

---

## US-08. View Travel Articles / Guides

**Là một Buyer, tôi muốn đọc bài viết hoặc hướng dẫn du lịch, để hiểu thêm về Ninh Bình trước khi đặt dịch vụ.**

### Priority

Should-have

### Acceptance Criteria

| ID      | Given                          | When                      | Then                                                 |
| ------- | ------------------------------ | ------------------------- | ---------------------------------------------------- |
| AC-08.1 | Có bài viết published          | Buyer mở trang blog/guide | Hệ thống hiển thị danh sách bài viết                 |
| AC-08.2 | Buyer chọn một bài viết        | Buyer click vào bài viết  | Hệ thống mở trang chi tiết bài viết                  |
| AC-08.3 | Bài viết có sản phẩm liên quan | Buyer đọc bài             | Hệ thống có thể hiển thị dịch vụ liên quan           |
| AC-08.4 | Bài viết archived/draft        | Buyer xem public page     | Bài viết không được hiển thị                         |
| AC-08.5 | Buyer muốn tư vấn thêm         | Buyer bấm CTA NiBi AI     | Hệ thống mở NiBi AI với context bài viết nếu phù hợp |

---

# EPIC-03 — NiBi AI Assistant

---

## US-09. Submit Trip Need to NiBi AI

**Là một Buyer, tôi muốn nhập nhu cầu chuyến đi cho NiBi AI, để nhận được gợi ý phù hợp với ngân sách, lịch trình và sở thích của mình.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                                     | When                                | Then                                                  |
| ------- | ----------------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| AC-09.1 | Buyer đã đăng nhập                        | Buyer nhập nhu cầu chuyến đi hợp lệ | Hệ thống lưu trip request                             |
| AC-09.2 | Buyer nhập thiếu thông tin quan trọng     | Buyer gửi yêu cầu                   | NiBi AI hỏi lại thông tin thiếu                       |
| AC-09.3 | Buyer nhập ngân sách, số người, số ngày   | Hệ thống xử lý                      | Backend chuẩn hóa dữ liệu thành cấu trúc có thể xử lý |
| AC-09.4 | Buyer nhập yêu cầu bằng ngôn ngữ tự nhiên | Buyer gửi cho NiBi AI               | Hệ thống hiểu và trích xuất thông tin chính           |
| AC-09.5 | AI provider lỗi                           | Buyer gửi yêu cầu                   | Hệ thống hiển thị fallback và ghi log lỗi             |

---

## US-10. Generate Personalized Recommendations

**Là một Buyer, tôi muốn NiBi AI gợi ý tour, homestay, khách sạn, thuê xe hoặc combo phù hợp, để tôi không phải tự tìm từng dịch vụ rời rạc.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                               | When              | Then                                                                          |
| ------- | ----------------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| AC-10.1 | Trip request có đủ thông tin        | NiBi AI xử lý     | Hệ thống tạo recommendation                                                   |
| AC-10.2 | Có sản phẩm phù hợp trong database  | AI tạo đề xuất    | Đề xuất chỉ chứa sản phẩm có thật trong database                              |
| AC-10.3 | Sản phẩm inactive                   | AI tạo đề xuất    | Sản phẩm inactive không được đưa vào đề xuất                                  |
| AC-10.4 | Sản phẩm sold out                   | AI tạo đề xuất    | Sản phẩm sold out không được đưa vào booking option                           |
| AC-10.5 | Ngân sách thấp hơn tổng giá phù hợp | AI tạo đề xuất    | Hệ thống hiển thị cảnh báo và gợi ý điều chỉnh                                |
| AC-10.6 | Đề xuất được hiển thị               | Buyer xem kết quả | Mỗi đề xuất có tên, dịch vụ chính, tổng giá, lý do đề xuất và cảnh báo nếu có |

---

## US-11. Generate Itinerary

**Là một Buyer, tôi muốn NiBi AI tạo lịch trình theo ngày, để dễ hình dung chuyến đi trước khi đặt.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                                | When                 | Then                                                                                |
| ------- | ------------------------------------ | -------------------- | ----------------------------------------------------------------------------------- |
| AC-11.1 | Buyer nhập số ngày chuyến đi         | AI tạo lịch trình    | Lịch trình được chia theo từng ngày                                                 |
| AC-11.2 | Lịch trình có hoạt động              | Buyer xem kết quả    | Mỗi ngày có các hoạt động chính, thời gian gợi ý và ghi chú                         |
| AC-11.3 | Có dịch vụ được chọn                 | AI tạo lịch trình    | Lịch trình chỉ sử dụng dịch vụ hợp lệ hoặc nội dung điểm đến được hệ thống cho phép |
| AC-11.4 | Có người lớn tuổi/trẻ em             | AI tạo lịch trình    | Lịch trình ưu tiên nhịp độ phù hợp và cảnh báo hoạt động nặng                       |
| AC-11.5 | Lịch trình cần xác nhận availability | Buyer xem lịch trình | Hệ thống hiển thị cảnh báo “cần Sales xác nhận”                                     |

---

## US-12. Explain Recommendation

**Là một Buyer, tôi muốn biết vì sao NiBi AI đề xuất một dịch vụ hoặc combo, để tôi có thể ra quyết định tự tin hơn.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                               | When               | Then                                                                   |
| ------- | ----------------------------------- | ------------------ | ---------------------------------------------------------------------- |
| AC-12.1 | AI tạo recommendation               | Buyer xem đề xuất  | Hệ thống hiển thị lý do đề xuất                                        |
| AC-12.2 | Recommendation dựa trên ngân sách   | Buyer xem lý do    | AI giải thích mức độ phù hợp với ngân sách                             |
| AC-12.3 | Recommendation dựa trên sở thích    | Buyer xem lý do    | AI giải thích sản phẩm phù hợp với sở thích nào                        |
| AC-12.4 | Recommendation có điểm cần xác nhận | Buyer xem lý do    | Hệ thống hiển thị cảnh báo rõ ràng                                     |
| AC-12.5 | AI không có đủ căn cứ               | AI tạo explanation | AI không được bịa, phải nói cần thêm thông tin hoặc cần Sales xác nhận |

---

## US-13. Refine Itinerary with Natural Language

**Là một Buyer, tôi muốn chỉnh lịch trình bằng ngôn ngữ tự nhiên, để đề xuất phù hợp hơn với nhu cầu thực tế của mình.**

### Priority

Should-have

### Acceptance Criteria

| ID      | Given                            | When                      | Then                                                       |
| ------- | -------------------------------- | ------------------------- | ---------------------------------------------------------- |
| AC-13.1 | Buyer đã có itinerary            | Buyer nhập “lịch nhẹ hơn” | Hệ thống điều chỉnh lịch trình theo hướng ít hoạt động hơn |
| AC-13.2 | Buyer nhập “giảm ngân sách”      | Hệ thống xử lý            | Backend đề xuất dịch vụ rẻ hơn nếu có và tính lại giá      |
| AC-13.3 | Buyer nhập “bỏ Hang Múa”         | Hệ thống xử lý            | Lịch trình mới không còn Hang Múa                          |
| AC-13.4 | Lịch trình thay đổi dịch vụ      | Hệ thống tính lại         | Tổng giá được backend cập nhật                             |
| AC-13.5 | Không tìm được phương án phù hợp | Buyer yêu cầu chỉnh       | Hệ thống giải thích lý do và gợi ý thay đổi điều kiện      |

---

## US-14. Generate AI Sales Note

**Là một Sales, tôi muốn xem AI sales note cho mỗi booking, để hiểu nhanh nhu cầu khách và tư vấn hiệu quả hơn.**

### Priority

Should-have

### Acceptance Criteria

| ID      | Given                                           | When                    | Then                                         |
| ------- | ----------------------------------------------- | ----------------------- | -------------------------------------------- |
| AC-14.1 | Booking được tạo từ NiBi AI                     | Sales mở booking detail | Hệ thống hiển thị AI sales note              |
| AC-14.2 | Booking có thông tin số người/ngân sách/ngày đi | AI tạo note             | Note tóm tắt các thông tin quan trọng        |
| AC-14.3 | Có dịch vụ cần xác nhận                         | Sales đọc note          | Note cảnh báo điểm cần xác nhận              |
| AC-14.4 | Khách có yêu cầu đặc biệt                       | AI tạo note             | Note nêu rõ yêu cầu đặc biệt                 |
| AC-14.5 | AI không có đủ dữ liệu                          | AI tạo note             | Note ghi rõ thông tin còn thiếu thay vì đoán |

---

# EPIC-04 — Cart, Booking & Order

---

## US-15. Add Service to Selected Services / Cart

**Là một Buyer, tôi muốn thêm dịch vụ vào danh sách đã chọn hoặc cart, để chuẩn bị đặt dịch vụ.**

### Priority

Should-have

### Acceptance Criteria

| ID      | Given                             | When                          | Then                                                   |
| ------- | --------------------------------- | ----------------------------- | ------------------------------------------------------ |
| AC-15.1 | Buyer đang xem sản phẩm available | Buyer bấm “Thêm vào lựa chọn” | Sản phẩm được thêm vào selected services/cart          |
| AC-15.2 | Sản phẩm sold out                 | Buyer bấm thêm                | Hệ thống không cho thêm và hiển thị cảnh báo           |
| AC-15.3 | Sản phẩm limited                  | Buyer bấm thêm                | Hệ thống cho thêm nhưng hiển thị cảnh báo cần xác nhận |
| AC-15.4 | Buyer đã thêm sản phẩm            | Buyer mở cart                 | Hệ thống hiển thị sản phẩm đã chọn                     |
| AC-15.5 | Buyer thay đổi số lượng           | Buyer cập nhật cart           | Backend tính lại subtotal                              |

---

## US-16. View Cost Breakdown

**Là một Buyer, tôi muốn xem breakdown chi phí, để biết tổng tiền gồm những hạng mục nào.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                 | When                     | Then                                         |
| ------- | --------------------- | ------------------------ | -------------------------------------------- |
| AC-16.1 | Buyer đã chọn dịch vụ | Buyer xem cost breakdown | Hệ thống hiển thị giá từng hạng mục          |
| AC-16.2 | Dịch vụ có số lượng   | Hệ thống tính giá        | Subtotal = đơn giá x số lượng                |
| AC-16.3 | Có platform fee       | Buyer xem tổng tiền      | Platform fee được hiển thị riêng             |
| AC-16.4 | Có discount           | Buyer xem tổng tiền      | Discount được hiển thị riêng                 |
| AC-16.5 | AI giải thích chi phí | Buyer xem đề xuất        | AI chỉ giải thích, không tự thay đổi số tiền |

---

## US-17. Create Booking Request

**Là một Buyer, tôi muốn gửi booking request, để Sales xác nhận dịch vụ và hỗ trợ tôi đặt chuyến đi.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                                             | When                            | Then                                              |
| ------- | ------------------------------------------------- | ------------------------------- | ------------------------------------------------- |
| AC-17.1 | Buyer đã chọn ít nhất một dịch vụ                 | Buyer bấm gửi booking request   | Hệ thống tạo booking request                      |
| AC-17.2 | Buyer thiếu số điện thoại hoặc thông tin bắt buộc | Buyer gửi request               | Hệ thống hiển thị lỗi validation                  |
| AC-17.3 | Booking request được tạo                          | Hệ thống lưu dữ liệu            | Booking có mã định danh duy nhất                  |
| AC-17.4 | Booking request mới                               | Hệ thống tạo record             | Status mặc định là `NEW`                          |
| AC-17.5 | Booking có dịch vụ need confirmation              | Buyer xem xác nhận              | Hệ thống thông báo cần Sales xác nhận             |
| AC-17.6 | Booking được tạo thành công                       | Buyer xem màn hình confirmation | Buyer thấy mã booking, tổng chi phí và trạng thái |

---

## US-18. Create Order

**Là một Buyer, tôi muốn tạo order từ các dịch vụ đã chọn, để hệ thống ghi nhận giao dịch ở mức commerce MVP.**

### Priority

Should-have

### Acceptance Criteria

| ID      | Given                           | When                         | Then                                                            |
| ------- | ------------------------------- | ---------------------------- | --------------------------------------------------------------- |
| AC-18.1 | Buyer có selected services/cart | Buyer bấm checkout/tạo order | Hệ thống tạo order                                              |
| AC-18.2 | Order được tạo                  | Hệ thống lưu order items     | Mỗi dịch vụ được lưu thành order item                           |
| AC-18.3 | Order mới                       | Hệ thống tạo payment record  | Payment status mặc định là `UNPAID`, `PENDING` hoặc `PAID_DEMO` |
| AC-18.4 | Order mới                       | Hệ thống tạo order status    | Order status mặc định là `PENDING_CONFIRMATION`                 |
| AC-18.5 | Buyer xem order confirmation    | Hệ thống hiển thị            | Buyer thấy mã order, tổng tiền, payment status và order status  |

---

## US-19. Track Booking / Order Status

**Là một Buyer, tôi muốn xem trạng thái booking/order của mình, để biết yêu cầu đang được xử lý đến đâu.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                               | When                                 | Then                                                   |
| ------- | ----------------------------------- | ------------------------------------ | ------------------------------------------------------ |
| AC-19.1 | Buyer đã đăng nhập                  | Buyer mở My Bookings/My Orders       | Hệ thống hiển thị booking/order của chính Buyer        |
| AC-19.2 | Buyer mở một booking                | Hệ thống hiển thị chi tiết           | Buyer thấy mã booking, dịch vụ, tổng tiền, trạng thái  |
| AC-19.3 | Sales cập nhật trạng thái           | Buyer xem lại booking                | Buyer thấy trạng thái mới                              |
| AC-19.4 | Buyer cố xem booking của người khác | Buyer truy cập URL không thuộc quyền | Hệ thống chặn truy cập                                 |
| AC-19.5 | Booking bị hủy                      | Buyer xem booking                    | Hệ thống hiển thị trạng thái cancelled và lý do nếu có |

---

# EPIC-05 — Sales Operation

---

## US-20. View Booking Requests

**Là một Sales, tôi muốn xem danh sách booking request, để xử lý các yêu cầu mới từ Buyer.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                      | When                             | Then                                      |
| ------- | -------------------------- | -------------------------------- | ----------------------------------------- |
| AC-20.1 | Sales đã đăng nhập         | Sales mở Booking Dashboard       | Hệ thống hiển thị danh sách booking       |
| AC-20.2 | Có booking mới             | Sales xem dashboard              | Booking mới có status `NEW`               |
| AC-20.3 | Sales lọc theo trạng thái  | Sales chọn filter                | Hệ thống hiển thị booking theo trạng thái |
| AC-20.4 | Sales mở booking           | Sales click vào booking          | Hệ thống mở trang booking detail          |
| AC-20.5 | Sales không có quyền Admin | Sales truy cập cấu hình hệ thống | Hệ thống chặn truy cập                    |

---

## US-21. View Booking Detail

**Là một Sales, tôi muốn xem chi tiết booking, để hiểu nhu cầu khách và dịch vụ cần xử lý.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                        | When               | Then                                |
| ------- | ---------------------------- | ------------------ | ----------------------------------- |
| AC-21.1 | Sales mở booking detail      | Trang được tải     | Hệ thống hiển thị thông tin Buyer   |
| AC-21.2 | Booking có trip request      | Sales xem chi tiết | Hệ thống hiển thị nhu cầu chuyến đi |
| AC-21.3 | Booking có selected services | Sales xem chi tiết | Hệ thống hiển thị danh sách dịch vụ |
| AC-21.4 | Booking có cost breakdown    | Sales xem chi tiết | Hệ thống hiển thị breakdown chi phí |
| AC-21.5 | Booking có AI sales note     | Sales xem chi tiết | Hệ thống hiển thị note cho Sales    |

---

## US-22. Update Booking Status

**Là một Sales, tôi muốn cập nhật trạng thái booking, để Buyer và Admin biết tiến độ xử lý.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                              | When                        | Then                                   |
| ------- | ---------------------------------- | --------------------------- | -------------------------------------- |
| AC-22.1 | Booking đang ở status `NEW`        | Sales đổi sang `CONTACTED`  | Hệ thống cập nhật trạng thái           |
| AC-22.2 | Sales đổi trạng thái               | Hệ thống lưu thay đổi       | Hệ thống tạo booking status log        |
| AC-22.3 | Buyer xem booking                  | Sau khi Sales cập nhật      | Buyer thấy trạng thái mới              |
| AC-22.4 | Sales chọn trạng thái không hợp lệ | Sales lưu                   | Hệ thống hiển thị lỗi                  |
| AC-22.5 | Booking đã cancelled               | Sales cố đổi sang confirmed | Hệ thống chặn hoặc yêu cầu quyền Admin |

---

## US-23. Add Internal Sales Note

**Là một Sales, tôi muốn ghi chú nội bộ cho booking, để theo dõi quá trình tư vấn khách.**

### Priority

Should-have

### Acceptance Criteria

| ID      | Given                   | When                     | Then                               |
| ------- | ----------------------- | ------------------------ | ---------------------------------- |
| AC-23.1 | Sales mở booking detail | Sales nhập ghi chú       | Hệ thống lưu internal note         |
| AC-23.2 | Note đã lưu             | Sales/Admin mở booking   | Hệ thống hiển thị lịch sử note     |
| AC-23.3 | Buyer xem booking       | Booking có internal note | Buyer không thấy internal note     |
| AC-23.4 | Sales nhập note rỗng    | Sales lưu                | Hệ thống không cho lưu hoặc bỏ qua |
| AC-23.5 | Admin xem booking       | Admin có quyền           | Admin xem được internal note       |

---

# EPIC-06 — Editor/MOD Product & Content Management

---

## US-24. Create Product

**Là một Editor/MOD, tôi muốn tạo sản phẩm du lịch mới, để Buyer có thêm lựa chọn và NiBi AI có dữ liệu để đề xuất.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                            | When                         | Then                                             |
| ------- | -------------------------------- | ---------------------------- | ------------------------------------------------ |
| AC-24.1 | Editor/MOD đã đăng nhập          | Editor/MOD mở Create Product | Hệ thống hiển thị form tạo sản phẩm              |
| AC-24.2 | Editor/MOD nhập thông tin hợp lệ | Editor/MOD lưu sản phẩm      | Hệ thống tạo product record                      |
| AC-24.3 | Thiếu field bắt buộc             | Editor/MOD lưu               | Hệ thống hiển thị lỗi validation                 |
| AC-24.4 | Sản phẩm mới được tạo            | Hệ thống lưu                 | Status mặc định là `DRAFT` hoặc `PENDING_REVIEW` |
| AC-24.5 | Sản phẩm chưa published          | Buyer xem listing            | Sản phẩm chưa hiển thị public                    |

---

## US-25. Update Product

**Là một Editor/MOD, tôi muốn cập nhật thông tin sản phẩm, để dữ liệu luôn chính xác và hữu ích.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                             | When                    | Then                               |
| ------- | --------------------------------- | ----------------------- | ---------------------------------- |
| AC-25.1 | Product tồn tại                   | Editor/MOD mở edit form | Hệ thống hiển thị dữ liệu hiện tại |
| AC-25.2 | Editor/MOD thay đổi mô tả/ảnh/tag | Editor/MOD lưu          | Hệ thống cập nhật product          |
| AC-25.3 | Editor/MOD thay đổi giá           | Hệ thống lưu            | Hệ thống ghi audit log             |
| AC-25.4 | Editor/MOD thay đổi availability  | Hệ thống lưu            | Hệ thống ghi audit log             |
| AC-25.5 | Product đang inactive             | Buyer xem listing       | Product không hiển thị public      |

---

## US-26. Manage Product Availability

**Là một Editor/MOD, tôi muốn cập nhật trạng thái availability của sản phẩm, để hệ thống không cho Buyer đặt dịch vụ không còn khả dụng.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                     | When                         | Then                                 |
| ------- | ------------------------- | ---------------------------- | ------------------------------------ |
| AC-26.1 | Product đang available    | Editor/MOD đổi sang sold out | Hệ thống cập nhật availability       |
| AC-26.2 | Product sold out          | Buyer cố đặt                 | Hệ thống không cho tạo booking/order |
| AC-26.3 | Product limited           | Buyer xem sản phẩm           | Hệ thống hiển thị cảnh báo limited   |
| AC-26.4 | Product need confirmation | Buyer gửi booking            | Hệ thống tạo request-to-book         |
| AC-26.5 | Availability thay đổi     | Hệ thống lưu                 | Hệ thống ghi log thay đổi            |

---

## US-27. Create Article / Guide

**Là một Editor/MOD, tôi muốn tạo bài viết du lịch, để hỗ trợ SEO, cung cấp thông tin cho Buyer và làm nguồn tri thức cho NiBi AI.**

### Priority

Should-have

### Acceptance Criteria

| ID      | Given                         | When                            | Then                                             |
| ------- | ----------------------------- | ------------------------------- | ------------------------------------------------ |
| AC-27.1 | Editor/MOD mở Create Article  | Editor/MOD nhập nội dung hợp lệ | Hệ thống tạo article                             |
| AC-27.2 | Article mới tạo               | Editor/MOD lưu                  | Status mặc định là `DRAFT` hoặc `PENDING_REVIEW` |
| AC-27.3 | Article chưa published        | Buyer xem public page           | Article không hiển thị                           |
| AC-27.4 | Article published             | Buyer mở blog/guide             | Article được hiển thị                            |
| AC-27.5 | Article có sản phẩm liên quan | Buyer xem bài viết              | Hệ thống có thể hiển thị related products        |

---

# EPIC-07 — Admin Management

---

## US-28. Manage Users

**Là một Admin, tôi muốn quản lý user, để kiểm soát người dùng trong hệ thống.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                 | When                     | Then                                                   |
| ------- | --------------------- | ------------------------ | ------------------------------------------------------ |
| AC-28.1 | Admin đã đăng nhập    | Admin mở User Management | Hệ thống hiển thị danh sách user                       |
| AC-28.2 | Admin chọn một user   | Admin xem chi tiết       | Hệ thống hiển thị thông tin user và role               |
| AC-28.3 | Admin khóa user       | Hệ thống lưu thay đổi    | User bị chặn truy cập nếu rule yêu cầu                 |
| AC-28.4 | Admin thay đổi user   | Hệ thống lưu             | Hệ thống ghi audit log                                 |
| AC-28.5 | User có booking/order | Admin muốn xóa           | Hệ thống nên chặn xóa cứng hoặc khuyến nghị deactivate |

---

## US-29. Manage Roles

**Là một Admin, tôi muốn gán role cho user, để phân quyền đúng theo trách nhiệm.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                         | When                  | Then                                          |
| ------- | ----------------------------- | --------------------- | --------------------------------------------- |
| AC-29.1 | Admin mở user detail          | Admin chọn role mới   | Hệ thống cập nhật role                        |
| AC-29.2 | User được gán role Sales      | User đăng nhập        | User thấy Sales Dashboard                     |
| AC-29.3 | User được gán role Editor/MOD | User đăng nhập        | User thấy dashboard quản lý sản phẩm/nội dung |
| AC-29.4 | Role thay đổi                 | Hệ thống lưu          | Hệ thống ghi audit log                        |
| AC-29.5 | Non-admin cố gán role         | Non-admin gửi request | Hệ thống chặn                                 |

---

## US-30. Approve Product / Content

**Là một Admin, tôi muốn duyệt sản phẩm và nội dung, để đảm bảo dữ liệu public có chất lượng và đáng tin cậy.**

### Priority

Should-have

### Acceptance Criteria

| ID      | Given                     | When                        | Then                                                    |
| ------- | ------------------------- | --------------------------- | ------------------------------------------------------- |
| AC-30.1 | Có product pending review | Admin mở Approval Dashboard | Hệ thống hiển thị danh sách pending                     |
| AC-30.2 | Admin approve product     | Hệ thống lưu                | Product chuyển sang `PUBLISHED`                         |
| AC-30.3 | Admin reject product      | Hệ thống lưu                | Product chuyển sang `REJECTED`                          |
| AC-30.4 | Product published         | Buyer xem listing           | Product được hiển thị nếu active                        |
| AC-30.5 | Admin yêu cầu sửa         | Editor/MOD xem product      | Product có trạng thái cần chỉnh sửa nếu hệ thống hỗ trợ |

---

## US-31. View Admin Dashboard

**Là một Admin, tôi muốn xem dashboard tổng quan, để theo dõi tình trạng nền tảng.**

### Priority

Must-have

### Acceptance Criteria

| ID      | Given                     | When                | Then                                               |
| ------- | ------------------------- | ------------------- | -------------------------------------------------- |
| AC-31.1 | Admin đăng nhập           | Admin mở dashboard  | Hệ thống hiển thị các chỉ số tổng quan             |
| AC-31.2 | Có booking mới            | Admin xem dashboard | Số booking mới được cập nhật                       |
| AC-31.3 | Có product active/pending | Admin xem dashboard | Hệ thống hiển thị số lượng product theo trạng thái |
| AC-31.4 | Có order/payment demo     | Admin xem dashboard | Hệ thống hiển thị GMV hoặc doanh thu demo nếu có   |
| AC-31.5 | Không có dữ liệu          | Admin xem dashboard | Hệ thống hiển thị empty state hợp lý               |

---

# EPIC-08 — Google Maps & Location

---

## US-32. Add Product Location

**Là một Editor/MOD, tôi muốn nhập vị trí sản phẩm, để Buyer có thể xem sản phẩm trên bản đồ và NiBi AI có thêm context vị trí.**

### Priority

Should-have

### Acceptance Criteria

| ID      | Given                           | When                    | Then                                              |
| ------- | ------------------------------- | ----------------------- | ------------------------------------------------- |
| AC-32.1 | Editor/MOD tạo hoặc sửa product | Editor/MOD nhập địa chỉ | Hệ thống lưu địa chỉ                              |
| AC-32.2 | Editor/MOD nhập lat/lng         | Editor/MOD lưu          | Hệ thống lưu tọa độ                               |
| AC-32.3 | Tọa độ không hợp lệ             | Editor/MOD lưu          | Hệ thống hiển thị lỗi validation                  |
| AC-32.4 | Product có location             | Buyer xem detail        | Hệ thống hiển thị bản đồ                          |
| AC-32.5 | Product không có location       | Buyer xem detail        | Hệ thống không lỗi và hiển thị thông tin thay thế |

---

## US-33. View Product on Map

**Là một Buyer, tôi muốn xem vị trí sản phẩm trên bản đồ, để đánh giá dịch vụ có thuận tiện với lịch trình không.**

### Priority

Should-have

### Acceptance Criteria

| ID      | Given                    | When                     | Then                                               |
| ------- | ------------------------ | ------------------------ | -------------------------------------------------- |
| AC-33.1 | Product có tọa độ        | Buyer mở product detail  | Bản đồ hiển thị marker sản phẩm                    |
| AC-33.2 | Buyer xem homestay/hotel | Hệ thống hiển thị vị trí | Buyer biết sản phẩm nằm ở khu vực nào              |
| AC-33.3 | Bản đồ không tải được    | Buyer xem trang          | Hệ thống hiển thị fallback địa chỉ dạng text       |
| AC-33.4 | Product có nearby info   | Buyer xem detail         | Hệ thống có thể hiển thị mô tả vị trí gần điểm nào |
| AC-33.5 | Buyer dùng NiBi AI       | AI có location context   | AI có thể giải thích vị trí nếu backend cung cấp   |

---

# CROSS-CUTTING ACCEPTANCE CRITERIA

---

## 34. AI Safety & Business Rule Criteria

Các tiêu chí này áp dụng cho mọi tính năng có NiBi AI.

| ID    | Rule                      | Acceptance Criteria                                                        |
| ----- | ------------------------- | -------------------------------------------------------------------------- |
| AI-01 | Không bịa sản phẩm        | AI output không được chứa product ID/name không có trong database          |
| AI-02 | Không bịa giá             | Giá cuối cùng phải do backend tính hoặc xác thực                           |
| AI-03 | Không bịa availability    | Availability phải lấy từ database hoặc Sales confirmation                  |
| AI-04 | Không tự xác nhận booking | AI không được nói booking đã confirmed nếu status chưa confirmed           |
| AI-05 | Không tự tạo payment      | AI không được tự đổi payment status                                        |
| AI-06 | Hỏi lại khi thiếu dữ liệu | Nếu thiếu ngày đi, số người, ngân sách hoặc nhu cầu chính, AI phải hỏi lại |
| AI-07 | Có fallback               | Nếu AI lỗi, hệ thống phải hiển thị thông báo rõ và ghi log                 |
| AI-08 | Có validation             | AI output phải được backend kiểm tra trước khi hiển thị hoặc lưu           |

---

## 35. Data Persistence Criteria

| ID      | Requirement                        | Acceptance Criteria                                              |
| ------- | ---------------------------------- | ---------------------------------------------------------------- |
| DATA-01 | Booking phải lưu DB                | Mọi booking request thành công phải có record trong database     |
| DATA-02 | Order phải lưu DB                  | Mọi order thành công phải có order và order items                |
| DATA-03 | Status phải có log                 | Mỗi lần đổi booking/order status phải tạo status log             |
| DATA-04 | Product update quan trọng phải log | Thay đổi giá/availability nên được audit log                     |
| DATA-05 | Buyer data isolation               | Buyer chỉ được xem dữ liệu của chính mình                        |
| DATA-06 | Product active control             | Chỉ product active/published mới hiển thị public                 |
| DATA-07 | AI interaction log                 | Các interaction quan trọng với NiBi AI nên được ghi log để debug |

---

## 36. UI/UX Acceptance Criteria

| ID    | Requirement    | Acceptance Criteria                                                    |
| ----- | -------------- | ---------------------------------------------------------------------- |
| UX-01 | Responsive     | Các màn hình chính hoạt động tốt trên desktop và mobile                |
| UX-02 | Loading state  | Các thao tác AI/booking/order có trạng thái loading                    |
| UX-03 | Error state    | Lỗi phải được hiển thị rõ, không làm user bị kẹt                       |
| UX-04 | Empty state    | Danh sách rỗng phải có thông báo và gợi ý hành động                    |
| UX-05 | Cost clarity   | Tổng giá và breakdown phải dễ nhìn                                     |
| UX-06 | Status clarity | Booking/order status phải dễ hiểu                                      |
| UX-07 | CTA clarity    | CTA chính phải rõ: Xem chi tiết, Hỏi NiBi AI, Gửi booking, Checkout    |
| UX-08 | Trust          | Trang chi tiết sản phẩm cần có ảnh, mô tả, giá, vị trí và availability |

---

## 37. MVP Definition of Done

Một tính năng được xem là hoàn thành khi:

1. Có UI tương ứng.
2. Có logic backend hoặc mock backend rõ ràng.
3. Có database persistence nếu tính năng tạo dữ liệu.
4. Có validation cơ bản.
5. Có role-based access nếu là tính năng nội bộ.
6. Có loading/error/empty state.
7. Có dữ liệu mẫu để demo.
8. Không vi phạm business rules.
9. Có thể chạy trong demo end-to-end.
10. Không phụ thuộc vào thao tác thủ công ngoài hệ thống, trừ phần Sales confirmation được thiết kế là human-in-the-loop.

---

## 38. Recommended MVP Demo Stories

Để demo sản phẩm, nên ưu tiên hoàn thành các user stories sau:

| Story ID | Story Name                            |
| -------- | ------------------------------------- |
| US-01    | Buyer Registration                    |
| US-02    | User Login                            |
| US-03    | Role-based Access Control             |
| US-05    | View Product Listing                  |
| US-07    | View Product Detail                   |
| US-09    | Submit Trip Need to NiBi AI           |
| US-10    | Generate Personalized Recommendations |
| US-11    | Generate Itinerary                    |
| US-12    | Explain Recommendation                |
| US-16    | View Cost Breakdown                   |
| US-17    | Create Booking Request                |
| US-19    | Track Booking / Order Status          |
| US-20    | View Booking Requests                 |
| US-21    | View Booking Detail                   |
| US-22    | Update Booking Status                 |
| US-24    | Create Product                        |
| US-25    | Update Product                        |
| US-28    | Manage Users                          |
| US-29    | Manage Roles                          |
| US-31    | View Admin Dashboard                  |
| US-32    | Add Product Location                  |
| US-33    | View Product on Map                   |

---

## 39. MVP Demo Acceptance Scenario

### Scenario

Buyer là một gia đình 4 người từ Hà Nội muốn đi Ninh Bình 2 ngày 1 đêm, có trẻ nhỏ, ngân sách khoảng 6.000.000đ, muốn lịch trình nhẹ, có xe riêng và ưu tiên thiên nhiên.

### Expected Demo Flow

1. Buyer đăng nhập.
2. Buyer xem danh sách homestay, tour, thuê xe hoặc combo.
3. Buyer mở NiBi AI.
4. Buyer nhập nhu cầu chuyến đi.
5. NiBi AI hỏi thêm điểm đón nếu thiếu.
6. Backend lọc sản phẩm phù hợp.
7. NiBi AI tạo lịch trình 2 ngày 1 đêm.
8. Buyer xem đề xuất gồm homestay, xe riêng, hoạt động và bữa ăn.
9. Buyer xem cost breakdown.
10. Buyer xem vị trí homestay trên Google Maps.
11. Buyer yêu cầu chỉnh lịch trình nhẹ hơn hoặc giảm ngân sách.
12. Hệ thống cập nhật đề xuất và tính lại giá.
13. Buyer gửi booking request.
14. Hệ thống tạo mã booking.
15. Sales đăng nhập dashboard.
16. Sales mở booking mới.
17. Sales đọc AI sales note.
18. Sales cập nhật trạng thái booking sang `CONTACTED`.
19. Buyer xem My Bookings và thấy trạng thái mới.
20. Admin xem dashboard và thấy booking được ghi nhận.

### Acceptance

Demo được xem là đạt nếu:

* Booking request được lưu vào database.
* Buyer thấy mã booking.
* Sales thấy booking trong dashboard.
* Status update được phản ánh cho Buyer.
* NiBi AI không bịa sản phẩm hoặc giá.
* Cost breakdown rõ ràng.
* Google Maps được dùng trong ít nhất một màn hình.
* 4 role có phân quyền hợp lý.

---

## 40. Conclusion

Tài liệu user stories và acceptance criteria này xác định các yêu cầu triển khai quan trọng nhất cho MVP của NiBiGo AI Travel Platform.

MVP không chỉ cần có giao diện hoặc chatbot, mà phải chứng minh được một hệ thống có luồng nghiệp vụ thật:

* Buyer tìm và đặt dịch vụ.
* NiBi AI hỗ trợ cá nhân hóa.
* Backend kiểm soát giá, sản phẩm và booking.
* Sales xử lý yêu cầu.
* Editor/MOD quản lý dữ liệu.
* Admin kiểm soát nền tảng.

Nếu các user stories trong nhóm Must-have được hoàn thành, NiBiGo có thể demo như một AI-enabled travel commerce platform ở quy mô MVP, đủ cơ sở để mở rộng sang payment thật, Zalo OA, Zalo Mini App, partner portal và nhiều điểm đến trong các phase sau.
