# 01. Business Requirements Document — NiBiGo AI Travel Platform

**Project name:** NiBiGo AI Travel Platform
**AI assistant name:** NiBi AI
**Document type:** Business Requirements Document
**Version:** v1.0
**Owner:** Đặng Trần Đạt
**Last updated:** 2026-06-22

---

## 1. Document Purpose

Tài liệu này mô tả các yêu cầu nghiệp vụ cấp cao cho NiBiGo AI Travel Platform. Mục tiêu của tài liệu là làm rõ:

* Bài toán kinh doanh mà sản phẩm cần giải quyết.
* Lý do sản phẩm có giá trị với khách hàng và doanh nghiệp.
* Các nhóm người dùng và nhu cầu nghiệp vụ chính.
* Mô hình doanh thu của nền tảng.
* Phạm vi nghiệp vụ của MVP.
* Các yêu cầu kinh doanh quan trọng cần được hệ thống hỗ trợ.
* Các chỉ số đánh giá thành công.
* Các ràng buộc, giả định và rủi ro ở cấp độ kinh doanh.

Tài liệu này đóng vai trò nền tảng cho các tài liệu tiếp theo như MVP Scope, User Stories, Use Case Specification, Functional Requirements, Data Requirements, AI Requirements và UI/UX Requirements.

---

## 2. Business Context

NiBiGo hiện định hướng trở thành một nền tảng du lịch số tập trung vào Ninh Bình. Website hiện tại tại `nibigo.io.vn` đóng vai trò là kênh nội dung, giới thiệu dịch vụ và xây dựng thương hiệu.

Tuy nhiên, thị trường du lịch Ninh Bình vẫn có nhiều điểm phân mảnh:

* Khách muốn đi du lịch nhưng phải tự tìm tour, homestay, khách sạn, thuê xe và lịch trình từ nhiều nguồn khác nhau.
* Giá dịch vụ thường không được trình bày minh bạch theo từng hạng mục.
* Khách khó biết lựa chọn nào phù hợp với ngân sách, thành phần đoàn và sở thích.
* Nhiều dịch vụ địa phương tốt nhưng chưa được chuẩn hóa dữ liệu và chưa có kênh đặt dịch vụ hiệu quả.
* Sales phải tư vấn thủ công nhiều lần trước khi có thể chốt booking.
* AI du lịch thông thường có thể tư vấn hấp dẫn nhưng thiếu ràng buộc dữ liệu, dẫn đến rủi ro bịa giá, bịa dịch vụ hoặc bịa trạng thái còn chỗ.

NiBiGo AI Travel Platform được xây dựng để giải quyết bài toán này bằng cách kết hợp:

* Nền tảng listing và booking dịch vụ du lịch.
* Commerce flow cho tour, homestay, khách sạn, thuê xe, trải nghiệm và combo.
* NiBi AI để cá nhân hóa đề xuất.
* Google Maps để hỗ trợ vị trí và lịch trình.
* Dashboard vận hành cho Admin, Editor/MOD và Sales.
* Booking/order workflow có thể mở rộng thành giao dịch thật.

---

## 3. Business Problem Statement

Khách du lịch Ninh Bình hiện thiếu một nền tảng đủ đáng tin cậy để vừa khám phá, vừa lập kế hoạch, vừa so sánh, vừa đặt các dịch vụ du lịch trong một luồng liền mạch.

Cụ thể, khách thường gặp các vấn đề sau:

1. **Thông tin bị phân mảnh**
   Tour, homestay, khách sạn, thuê xe, nhà hàng và địa điểm tham quan thường nằm ở nhiều nền tảng hoặc kênh khác nhau.

2. **Khó cá nhân hóa lựa chọn**
   Khách không biết dịch vụ nào phù hợp với ngân sách, số người, ngày đi, phong cách du lịch, sở thích và yêu cầu đặc biệt.

3. **Thiếu minh bạch chi phí**
   Nhiều gói tour hoặc combo không cho thấy rõ breakdown chi phí theo từng dịch vụ.

4. **Thiếu hỗ trợ ra quyết định**
   Khách có quá nhiều lựa chọn nhưng thiếu công cụ so sánh, giải thích và đề xuất phù hợp.

5. **Quy trình booking chưa liền mạch**
   Khách thường phải chuyển sang Zalo, Facebook, điện thoại hoặc form rời rạc để đặt dịch vụ.

6. **Sales mất thời gian xử lý lead**
   Sales phải hỏi lại nhiều thông tin cơ bản trước khi có thể tư vấn hoặc xác nhận dịch vụ.

7. **Rủi ro AI hallucination**
   Nếu chỉ dùng chatbot AI thông thường, hệ thống có thể bịa giá, bịa dịch vụ, bịa trạng thái còn chỗ hoặc cam kết booking khi chưa có dữ liệu thật.

Từ đó, bài toán kinh doanh cốt lõi là:

**Làm thế nào để NiBiGo biến nhu cầu du lịch Ninh Bình của khách hàng thành một hành trình tìm kiếm, cá nhân hóa, đặt dịch vụ và xử lý booking minh bạch, có kiểm soát và có khả năng tạo doanh thu thực tế?**

---

## 4. Business Goals

NiBiGo AI Travel Platform có các mục tiêu kinh doanh chính sau:

### 4.1 Tăng số lượng lead và booking

Nền tảng cần giúp khách dễ dàng gửi booking request hoặc tạo order cho các dịch vụ như tour, homestay, khách sạn, thuê xe, trải nghiệm và combo.

Mục tiêu là biến traffic từ website, SEO, social media và referral thành lead hoặc booking có dữ liệu rõ ràng.

### 4.2 Tăng tỷ lệ chuyển đổi từ tư vấn sang đặt dịch vụ

NiBi AI giúp khách ra quyết định nhanh hơn bằng cách gợi ý dịch vụ phù hợp, giải thích lý do đề xuất, hiển thị chi phí rõ ràng và giảm sự mơ hồ trong quá trình lựa chọn.

### 4.3 Giảm thời gian tư vấn thủ công của Sales

Thay vì để Sales hỏi lại toàn bộ thông tin từ đầu, hệ thống cần thu thập nhu cầu khách, tạo lead summary, hiển thị lịch trình đề xuất và cung cấp AI sales note.

### 4.4 Mở rộng doanh thu ngoài tour

NiBiGo không chỉ thu tiền từ tour, mà còn từ nhiều nhóm dịch vụ:

* Homestay.
* Khách sạn.
* Resort.
* Thuê xe.
* Limousine.
* Xe riêng.
* Trải nghiệm địa phương.
* Nhà hàng/bữa ăn.
* Combo/package.
* Platform fee.
* Featured listing.
* Premium concierge service.

### 4.5 Xây dựng nền tảng dữ liệu du lịch Ninh Bình

Nền tảng cần tạo được một database có cấu trúc cho sản phẩm du lịch Ninh Bình, bao gồm thông tin dịch vụ, giá, vị trí, tags, đối tượng phù hợp, availability, hình ảnh, chính sách và nội dung liên quan.

### 4.6 Tăng độ tin cậy và minh bạch

Khách cần nhìn thấy:

* Dịch vụ nào đang được đề xuất.
* Vì sao dịch vụ đó phù hợp.
* Giá từng hạng mục.
* Tổng chi phí.
* Trạng thái còn chỗ hoặc cần xác nhận.
* Trạng thái booking/order.

### 4.7 Tạo nền tảng mở rộng sau MVP

Sau MVP, hệ thống cần có khả năng mở rộng sang:

* Payment gateway thật.
* Google Maps nâng cao.
* Zalo OA/ZNS.
* Zalo Mini App.
* WordPress/WooCommerce integration.
* Partner portal.
* Multi-destination.
* CRM/marketing automation.

---

## 5. Business Objectives

Các mục tiêu nghiệp vụ cụ thể trong giai đoạn MVP:

| Objective ID | Business Objective                                | Description                                                                 |
| ------------ | ------------------------------------------------- | --------------------------------------------------------------------------- |
| BO-01        | Cho phép Buyer tìm và xem dịch vụ du lịch         | Buyer có thể khám phá tour, homestay, khách sạn, thuê xe, combo và bài viết |
| BO-02        | Cho phép Buyer nhận tư vấn từ NiBi AI             | NiBi AI gợi ý dịch vụ và lịch trình dựa trên nhu cầu cá nhân                |
| BO-03        | Cho phép Buyer gửi booking request hoặc tạo order | Buyer có thể chọn dịch vụ và tạo yêu cầu đặt                                |
| BO-04        | Cho phép Sales xử lý booking                      | Sales có thể xem, ghi chú, xác nhận và cập nhật trạng thái booking          |
| BO-05        | Cho phép Editor/MOD quản lý nội dung và sản phẩm  | Editor/MOD có thể thêm/sửa dịch vụ và bài viết                              |
| BO-06        | Cho phép Admin quản trị toàn nền tảng             | Admin quản lý user, role, sản phẩm, booking, order và cấu hình              |
| BO-07        | Hiển thị chi phí minh bạch                        | Mỗi booking/order cần có cost breakdown rõ ràng                             |
| BO-08        | Tích hợp vị trí bằng Google Maps                  | Sản phẩm có thể được hiển thị và quản lý theo vị trí                        |
| BO-09        | Kiểm soát AI hallucination                        | AI chỉ đề xuất dựa trên dữ liệu có sẵn và không tự bịa giá/dịch vụ          |
| BO-10        | Chuẩn bị nền tảng cho commerce thật               | Hệ thống có order, payment status và booking workflow có thể mở rộng        |

---

## 6. Business Model

NiBiGo AI Travel Platform sử dụng mô hình **hybrid travel commerce platform**, kết hợp giữa curated marketplace, travel agency workflow và AI-powered recommendation.

### 6.1 Commission Model

NiBiGo nhận hoa hồng từ đối tác khi khách đặt dịch vụ qua nền tảng.

Áp dụng cho:

* Homestay.
* Khách sạn.
* Resort.
* Tour.
* Trải nghiệm.
* Nhà hàng.
* Thuê xe.

Ví dụ:

* Homestay trả 10% hoa hồng trên giá trị booking.
* Tour operator trả 15% hoa hồng trên mỗi khách.
* Nhà xe trả hoa hồng cố định theo chuyến.

### 6.2 Markup Model

NiBiGo nhập giá net từ đối tác và bán lại với giá retail.

Áp dụng cho:

* Tour.
* Thuê xe.
* Combo/package.
* Trải nghiệm địa phương.

Ví dụ:

* Giá net thuê xe: 2.000.000đ.
* Giá bán cho khách: 2.300.000đ.
* Gross margin: 300.000đ.

### 6.3 Package Margin

NiBiGo kết hợp nhiều dịch vụ thành combo và thu lợi nhuận từ chênh lệch giữa giá bán combo và tổng chi phí net.

Ví dụ combo 2N1Đ:

| Hạng mục      |   Cost net |
| ------------- | ---------: |
| Homestay      | 1.200.000đ |
| Xe riêng      | 2.200.000đ |
| Trải nghiệm   | 1.600.000đ |
| Ăn uống       |   800.000đ |
| Tổng cost net | 5.800.000đ |

Nếu NiBiGo bán combo với giá 6.500.000đ, gross margin là 700.000đ trước khi trừ chi phí vận hành, marketing, thanh toán và chăm sóc khách.

### 6.4 Platform Fee

NiBiGo có thể thu một khoản phí dịch vụ nhỏ trên mỗi booking/order.

Ví dụ:

* Phí cố định: 30.000đ–100.000đ.
* Hoặc phí phần trăm: 2%–5% giá trị đơn.

Phí này cần được hiển thị minh bạch, không nên ẩn trong giá cuối.

### 6.5 Featured Listing / Promoted Partner

Đối tác có thể trả phí để được hiển thị nổi bật.

Nguyên tắc:

* Nội dung tài trợ phải được gắn nhãn rõ ràng.
* NiBi AI không được ưu tiên đề xuất chỉ vì đối tác trả tiền.
* Recommendation của NiBi AI phải dựa trên độ phù hợp với nhu cầu khách.

### 6.6 Premium Concierge Service

NiBiGo có thể bán thêm dịch vụ hỗ trợ cao cấp.

Ví dụ:

* Tư vấn lịch trình riêng.
* Hỗ trợ xác nhận nhanh.
* Hỗ trợ đổi lịch.
* Hỗ trợ trong chuyến đi.
* Tư vấn dành cho gia đình có trẻ em/người lớn tuổi.
* Tư vấn trải nghiệm cao cấp cho cặp đôi hoặc nhóm khách đặc biệt.

---

## 7. Target Market

### 7.1 Initial Market

Thị trường ban đầu là khách du lịch có nhu cầu đi Ninh Bình.

Tệp khách bao gồm:

* Khách từ Hà Nội đi Ninh Bình trong ngày hoặc 2N1Đ.
* Khách gia đình.
* Cặp đôi.
* Nhóm bạn.
* Khách thích thiên nhiên, chụp ảnh, văn hóa, ẩm thực.
* Khách cần đặt homestay/khách sạn, xe và tour trong cùng một hành trình.
* Khách muốn được tư vấn trước khi đặt.

### 7.2 Market Entry Strategy

NiBiGo không nên cạnh tranh trực diện với các OTA lớn ở toàn bộ thị trường du lịch Việt Nam.

Chiến lược nên là:

* Tập trung vào Ninh Bình.
* Xây dữ liệu địa phương sâu.
* Cung cấp combo và lịch trình thực tế.
* Kết hợp AI và human sales.
* Tận dụng website hiện tại để SEO và xây dựng niềm tin.
* Tập trung vào trải nghiệm đặt dịch vụ liền mạch.

### 7.3 Differentiation

NiBiGo khác biệt nhờ:

* Local-first focus.
* Dữ liệu dịch vụ được chọn lọc.
* NiBi AI tư vấn cá nhân hóa.
* Google Maps hỗ trợ vị trí/lịch trình.
* Commerce flow cho nhiều loại dịch vụ.
* Sales dashboard hỗ trợ xử lý booking.
* Minh bạch chi phí.
* Có thể mở rộng sang Zalo OA/Mini App cho chăm sóc khách.

---

## 8. Stakeholder Overview

### 8.1 Buyer

Buyer là khách hàng cuối sử dụng nền tảng để tìm, lên kế hoạch và đặt dịch vụ.

Giá trị Buyer nhận được:

* Tiết kiệm thời gian tìm kiếm.
* Có gợi ý cá nhân hóa.
* Hiểu rõ chi phí.
* Xem được vị trí dịch vụ.
* Đặt được tour, chỗ ở, xe hoặc combo.
* Theo dõi trạng thái booking.

### 8.2 Sales

Sales là người xử lý booking và chăm sóc khách.

Giá trị Sales nhận được:

* Lead có dữ liệu rõ ràng.
* Có AI sales note.
* Có trạng thái booking.
* Có lịch sử tư vấn.
* Dễ xác nhận và follow-up khách.

### 8.3 Editor/MOD

Editor/MOD là người quản lý dữ liệu sản phẩm và nội dung.

Giá trị Editor/MOD nhận được:

* Có dashboard để thêm/sửa dịch vụ.
* Có CMS cho bài viết.
* Có công cụ nhập vị trí.
* Có quy trình gửi duyệt nội dung.

### 8.4 Admin

Admin là người quản trị toàn nền tảng.

Giá trị Admin nhận được:

* Kiểm soát user/role.
* Kiểm soát sản phẩm.
* Kiểm soát booking/order.
* Xem dashboard tổng quan.
* Quản lý cấu hình hệ thống.
* Kiểm soát chất lượng vận hành.

### 8.5 Business Owner

Business Owner quan tâm đến doanh thu, tăng trưởng, vận hành và khả năng mở rộng.

Giá trị Business Owner nhận được:

* Tăng lead.
* Tăng booking.
* Mở rộng doanh thu ngoài tour.
* Chuẩn hóa quy trình tư vấn.
* Xây dựng dữ liệu khách hàng.
* Xây nền tảng cho mở rộng dài hạn.

### 8.6 Partners

Partners là các bên cung cấp dịch vụ như homestay, khách sạn, nhà xe, tour operator, nhà hàng và đơn vị trải nghiệm.

Giá trị Partners nhận được:

* Có thêm kênh bán.
* Có lead chất lượng hơn.
* Có cơ hội xuất hiện trong combo/lịch trình.
* Có thể được quảng bá thông qua nội dung và AI recommendation.

---

## 9. Business Requirements

### BR-01: Nền tảng phải hỗ trợ nhiều loại dịch vụ du lịch

Hệ thống phải hỗ trợ các loại dịch vụ sau:

* Tour.
* Homestay.
* Khách sạn.
* Resort.
* Thuê xe.
* Limousine.
* Trải nghiệm địa phương.
* Nhà hàng/bữa ăn.
* Combo/package.
* Bài viết/guide.

### BR-02: Nền tảng phải có 4 role chính

Hệ thống phải hỗ trợ các role:

* ADMIN.
* EDITOR/MOD.
* SALES.
* BUYER.

Mỗi role phải có quyền truy cập và chức năng phù hợp với trách nhiệm nghiệp vụ.

### BR-03: Buyer phải có thể tìm kiếm và khám phá dịch vụ

Buyer phải có thể xem danh sách dịch vụ, lọc dịch vụ, xem chi tiết, xem ảnh, xem giá, xem vị trí và xem trạng thái availability.

### BR-04: Buyer phải có thể sử dụng NiBi AI để nhận tư vấn cá nhân hóa

NiBi AI phải hỗ trợ Buyer trong việc:

* Hiểu nhu cầu chuyến đi.
* Đề xuất dịch vụ phù hợp.
* Tạo lịch trình.
* Gợi ý combo.
* Giải thích lý do đề xuất.
* Cảnh báo khi vượt ngân sách hoặc cần xác nhận availability.

### BR-05: NiBi AI phải dựa trên dữ liệu hệ thống

NiBi AI không được tự bịa dịch vụ, giá hoặc trạng thái còn chỗ.

Các đề xuất của NiBi AI phải dựa trên dữ liệu sản phẩm, giá, tags, location và availability có trong hệ thống.

### BR-06: Hệ thống phải hỗ trợ booking request và order

Buyer phải có thể tạo booking request hoặc order sau khi chọn dịch vụ.

Mỗi booking/order phải có:

* Mã định danh.
* Buyer.
* Danh sách dịch vụ.
* Tổng chi phí.
* Trạng thái.
* Thời gian tạo.
* Lịch sử cập nhật.

### BR-07: Hệ thống phải hỗ trợ cost breakdown minh bạch

Mỗi booking/order hoặc AI proposal phải hiển thị breakdown chi phí theo từng hạng mục.

Ví dụ:

* Homestay/khách sạn.
* Tour/trải nghiệm.
* Xe.
* Ăn uống.
* Phí dịch vụ.
* Giảm giá nếu có.
* Tổng cộng.

### BR-08: Hệ thống phải hỗ trợ Google Maps

Hệ thống phải lưu và hiển thị thông tin vị trí cho sản phẩm.

Thông tin vị trí có thể gồm:

* Địa chỉ.
* Tọa độ.
* Google Place ID.
* Bản đồ.
* Khoảng cách hoặc mô tả vị trí tương đối.

### BR-09: Editor/MOD phải có thể quản lý sản phẩm và nội dung

Editor/MOD phải có thể tạo và chỉnh sửa:

* Tour.
* Homestay.
* Khách sạn.
* Thuê xe.
* Trải nghiệm.
* Combo.
* Bài viết.

Nội dung có thể cần Admin duyệt trước khi public.

### BR-10: Sales phải có thể xử lý booking

Sales phải có thể:

* Xem booking request/order.
* Xem thông tin Buyer.
* Xem nhu cầu khách.
* Xem AI sales note.
* Ghi chú tư vấn.
* Cập nhật trạng thái.
* Xác nhận availability.
* Gửi yêu cầu thanh toán hoặc hướng dẫn thanh toán.

### BR-11: Admin phải có quyền quản trị toàn hệ thống

Admin phải có thể:

* Quản lý user.
* Quản lý role.
* Quản lý sản phẩm.
* Quản lý nội dung.
* Quản lý booking/order.
* Quản lý payment status.
* Cấu hình hệ thống.
* Xem log và analytics.

### BR-12: Hệ thống phải phân biệt instant booking và request-to-book

Một số dịch vụ có thể đặt ngay, một số dịch vụ cần Sales xác nhận.

Ví dụ:

* Tour cố định có slot rõ có thể instant booking.
* Homestay/khách sạn chưa đồng bộ availability nên request-to-book.
* Tour riêng hoặc xe riêng cần xác nhận lại có thể request-to-book.

### BR-13: Hệ thống phải có trạng thái booking/order rõ ràng

Các trạng thái cơ bản gồm:

* Pending Confirmation.
* Awaiting Payment.
* Paid.
* Processing.
* Confirmed.
* Completed.
* Cancelled.
* Refund Requested.
* Refunded.

MVP có thể dùng tập trạng thái rút gọn, nhưng cần thiết kế để mở rộng.

### BR-14: Hệ thống phải hỗ trợ payment status

MVP có thể dùng manual/sandbox/demo payment, nhưng database và workflow cần sẵn sàng để tích hợp payment gateway thật.

Payment status gồm:

* Unpaid.
* Pending.
* Paid.
* Failed.
* Refunded.
* Partially Refunded.

### BR-15: Hệ thống phải lưu log quan trọng

Hệ thống cần lưu:

* Booking status log.
* Order status log.
* Payment status log.
* AI interaction log.
* User action/audit log cho thay đổi quan trọng.
* Notification log trong future phase.

---

## 10. Role-based Business Requirements

### 10.1 ADMIN

Admin cần có các quyền nghiệp vụ:

* Xem dashboard toàn hệ thống.
* Quản lý tất cả user.
* Gán role.
* Khóa/mở user.
* Quản lý tất cả sản phẩm.
* Duyệt sản phẩm.
* Quản lý giá, commission và platform fee.
* Quản lý booking/order.
* Cập nhật payment status khi cần.
* Quản lý bài viết.
* Duyệt nội dung.
* Cấu hình Google Maps.
* Cấu hình AI provider.
* Cấu hình payment.
* Cấu hình Zalo integration trong phase sau.
* Xem analytics.
* Xem audit logs.

### 10.2 EDITOR/MOD

Editor/MOD cần có các quyền nghiệp vụ:

* Tạo sản phẩm mới.
* Chỉnh sửa sản phẩm được phân quyền.
* Upload ảnh.
* Nhập mô tả, giá, tags, chính sách.
* Nhập địa chỉ và tọa độ.
* Tạo bài viết mới.
* Chỉnh sửa bài viết.
* Gửi sản phẩm/bài viết chờ duyệt.
* Moderate review/comment nếu có.

Editor/MOD không nên có quyền:

* Xem dữ liệu payment nhạy cảm.
* Hoàn tiền.
* Xóa user.
* Đổi role.
* Cấu hình hệ thống.
* Thay đổi commission toàn hệ thống nếu không được Admin cấp quyền.

### 10.3 SALES

Sales cần có các quyền nghiệp vụ:

* Xem booking request/order.
* Xem thông tin liên hệ Buyer.
* Xem nhu cầu chuyến đi.
* Xem AI recommendation và sales note.
* Ghi chú tư vấn.
* Cập nhật trạng thái lead/booking.
* Xác nhận availability.
* Gửi báo giá hoặc payment request.
* Hỗ trợ khách trước chuyến đi.
* Xem lịch sử tương tác với khách.

Sales không nên có quyền:

* Sửa nội dung public nếu không được cấp thêm quyền.
* Xóa sản phẩm.
* Xóa order.
* Xóa payment.
* Thay đổi cấu hình hệ thống.
* Gán role.

### 10.4 BUYER

Buyer cần có các quyền nghiệp vụ:

* Đăng ký/đăng nhập.
* Xem sản phẩm.
* Tìm kiếm/lọc sản phẩm.
* Xem vị trí sản phẩm.
* Dùng NiBi AI.
* Tạo itinerary.
* Thêm dịch vụ vào cart.
* Gửi booking request.
* Tạo order.
* Theo dõi trạng thái booking/order.
* Xem lịch sử đặt dịch vụ của chính mình.
* Đánh giá dịch vụ sau chuyến đi nếu có.

Buyer không được:

* Xem booking/order của người khác.
* Truy cập dashboard nội bộ.
* Sửa sản phẩm hoặc nội dung.
* Đổi trạng thái booking.
* Can thiệp payment status.

---

## 11. MVP Business Scope

### 11.1 Included in MVP

MVP bao gồm:

* Authentication.
* Role-based access.
* Buyer product discovery.
* Product detail pages.
* Basic product filtering.
* Google Maps display/input for product location.
* NiBi AI recommendation.
* AI-generated itinerary.
* Cart hoặc selected services.
* Booking request/order creation.
* Cost breakdown.
* Sales dashboard.
* Admin dashboard.
* Editor/MOD product and content management.
* Booking/order status update.
* Payment status ở mức manual/sandbox/demo.
* AI logs cơ bản.

### 11.2 Not Required in MVP

MVP chưa bắt buộc:

* Payment gateway production hoàn chỉnh.
* Refund automation đầy đủ.
* Zalo OA production integration.
* Zalo Mini App.
* Partner portal.
* Multi-destination.
* Flight booking.
* Channel manager khách sạn.
* Full CRM automation.
* Mobile native app.
* Advanced recommendation engine.
* Dynamic pricing nâng cao.

---

## 12. Business Process Overview

### 12.1 Buyer Booking Process

1. Buyer truy cập nền tảng.
2. Buyer tìm kiếm hoặc dùng NiBi AI để nhận gợi ý.
3. Buyer xem danh sách dịch vụ phù hợp.
4. Buyer xem chi tiết sản phẩm, giá, vị trí và availability.
5. Buyer chọn dịch vụ hoặc combo.
6. Buyer thêm vào cart hoặc tạo itinerary.
7. Buyer gửi booking request hoặc tạo order.
8. Hệ thống tạo mã booking/order.
9. Sales/Admin xác nhận dịch vụ.
10. Buyer theo dõi trạng thái.
11. Buyer thanh toán/cọc nếu flow hỗ trợ.
12. Booking được xác nhận.
13. Sau chuyến đi, Buyer có thể đánh giá.

### 12.2 Sales Handling Process

1. Sales nhận booking request/order mới.
2. Sales đọc thông tin Buyer và AI sales note.
3. Sales kiểm tra dịch vụ được chọn.
4. Sales xác nhận availability với đối tác.
5. Sales cập nhật trạng thái.
6. Sales gửi báo giá hoặc yêu cầu thanh toán.
7. Sales xác nhận booking.
8. Sales hỗ trợ Buyer trước chuyến đi.

### 12.3 Product Management Process

1. Editor/MOD tạo sản phẩm mới.
2. Editor/MOD nhập thông tin sản phẩm.
3. Editor/MOD thêm ảnh, giá, tags, vị trí, availability.
4. Editor/MOD gửi chờ duyệt.
5. Admin duyệt hoặc yêu cầu chỉnh sửa.
6. Sản phẩm được publish.
7. NiBi AI có thể sử dụng sản phẩm trong recommendation nếu sản phẩm active.

---

## 13. Business KPIs

### 13.1 Acquisition Metrics

* Số lượt truy cập nền tảng.
* Số tài khoản Buyer đăng ký.
* Số người dùng bắt đầu dùng NiBi AI.
* Số người xem trang sản phẩm.
* Số người xem bài viết.

### 13.2 Activation Metrics

* Tỷ lệ Buyer hoàn thành onboarding.
* Tỷ lệ Buyer gửi nhu cầu cho NiBi AI.
* Tỷ lệ Buyer xem ít nhất một đề xuất AI.
* Tỷ lệ Buyer xem chi tiết sản phẩm sau khi nhận gợi ý.

### 13.3 Conversion Metrics

* Số booking request được tạo.
* Số order được tạo.
* Tỷ lệ Buyer thêm dịch vụ vào cart.
* Tỷ lệ cart chuyển thành booking request/order.
* Tỷ lệ booking được Sales liên hệ.
* Tỷ lệ booking được xác nhận.
* Tỷ lệ booking bị hủy.

### 13.4 Revenue Metrics

* Tổng GMV.
* Doanh thu commission.
* Doanh thu markup.
* Package margin.
* Platform fee.
* Average order value.
* Revenue per booking.
* Revenue by product type.

### 13.5 Operation Metrics

* Thời gian Sales phản hồi trung bình.
* Số booking theo trạng thái.
* Tỷ lệ booking cần xác nhận lại.
* Số sản phẩm active.
* Số sản phẩm thiếu ảnh/vị trí/giá.
* Tỷ lệ sản phẩm có availability rõ ràng.

### 13.6 AI Metrics

* Tỷ lệ AI recommendation sử dụng sản phẩm có thật.
* Tỷ lệ AI recommendation đúng ngân sách.
* Tỷ lệ AI recommendation phù hợp sở thích.
* Tỷ lệ AI hallucination.
* Tỷ lệ AI cần hỏi lại.
* Tỷ lệ Buyer chấp nhận gợi ý AI.
* Mức độ hữu ích của AI sales note do Sales đánh giá.

---

## 14. Business Rules Summary

Các business rules chi tiết sẽ được mô tả trong tài liệu `08-business-rules.md`. Ở cấp BRD, các rule quan trọng gồm:

1. NiBi AI không được tự tạo sản phẩm không có trong database.
2. NiBi AI không được tự bịa giá.
3. NiBi AI không được tự bịa availability.
4. Tổng giá cuối cùng phải do backend tính.
5. Sản phẩm inactive không được hiển thị cho Buyer.
6. Sản phẩm sold out không được đặt.
7. Sản phẩm limited cần hiển thị cảnh báo hoặc cần Sales xác nhận.
8. Booking/order phải được lưu vào database.
9. Buyer chỉ được xem booking/order của chính mình.
10. Admin có quyền quản trị toàn hệ thống.
11. Editor/MOD không được thao tác payment/refund nếu không có quyền.
12. Sales không được thay đổi giá gốc toàn hệ thống nếu không có quyền.
13. Payment status phải được log khi thay đổi.
14. Booking status phải được log khi thay đổi.
15. Nội dung tài trợ hoặc featured listing phải được phân biệt với recommendation tự nhiên.

---

## 15. Business Constraints

### 15.1 Resource Constraint

Dự án được xây dựng bởi một cá nhân hoặc team nhỏ, do đó cần ưu tiên các chức năng tạo giá trị lõi trước.

### 15.2 Data Constraint

Dữ liệu dịch vụ ban đầu có thể là seed data hoặc dữ liệu được chuẩn hóa thủ công. Chưa có đồng bộ real-time với tất cả đối tác.

### 15.3 Operational Constraint

Nhiều dịch vụ du lịch cần xác nhận thủ công. Không nên giả định mọi booking đều có thể instant booking.

### 15.4 Payment Constraint

Payment thật cần xử lý bảo mật, đối soát, hoàn tiền, chính sách hủy và lỗi giao dịch. MVP có thể bắt đầu với payment status manual/sandbox/demo nhưng cần thiết kế để mở rộng.

### 15.5 Platform Constraint

Website WordPress hiện tại không nên gánh toàn bộ logic AI và commerce phức tạp. Web app mới cần được triển khai độc lập.

### 15.6 AI Constraint

AI output là probabilistic. Hệ thống cần validation, logging, fallback và human-in-the-loop để giảm rủi ro.

---

## 16. Assumptions

Các giả định nghiệp vụ:

* Ninh Bình là điểm đến đầu tiên và duy nhất trong MVP.
* NiBiGo có thể tự tạo hoặc chuẩn hóa dữ liệu sản phẩm ban đầu.
* Buyer sẵn sàng gửi booking request nếu thấy lịch trình và chi phí rõ ràng.
* Sales/Admin có thể xác nhận thủ công các dịch vụ cần kiểm tra availability.
* Google Maps API có thể được sử dụng cho hiển thị vị trí và hỗ trợ nhập tọa độ.
* Payment gateway thật có thể được tích hợp sau khi commerce flow ổn định.
* Zalo OA/Zalo Mini App là kênh mở rộng sau MVP.
* NiBi AI đóng vai trò tư vấn và hỗ trợ, không thay thế hoàn toàn Sales trong giai đoạn đầu.

---

## 17. Risks

### 17.1 Scope Creep

Rủi ro: sản phẩm mở rộng quá nhiều tính năng cùng lúc.

Ảnh hưởng:

* Chậm tiến độ.
* Dễ lỗi.
* Khó demo.
* Khó kiểm soát chất lượng.

Giảm thiểu:

* Chia phase rõ ràng.
* MVP tập trung vào Ninh Bình.
* Ưu tiên booking flow và dữ liệu sản phẩm.
* Không làm partner portal ngay.
* Payment thật có thể để sau nếu chưa đủ thời gian.

### 17.2 Poor Product Data Quality

Rủi ro: dữ liệu sản phẩm thiếu giá, thiếu ảnh, thiếu location, thiếu availability hoặc mô tả không rõ.

Ảnh hưởng:

* Buyer thiếu niềm tin.
* AI đề xuất kém.
* Sales khó xử lý.
* Booking dễ sai.

Giảm thiểu:

* Data dictionary rõ ràng.
* Required fields.
* Admin approval.
* Data completeness dashboard.
* Seed data chất lượng.

### 17.3 AI Hallucination

Rủi ro: NiBi AI bịa dịch vụ, bịa giá hoặc bịa trạng thái.

Ảnh hưởng:

* Mất niềm tin.
* Lỗi booking.
* Sales phải xử lý lại.
* Rủi ro kinh doanh.

Giảm thiểu:

* Backend cung cấp product candidates.
* Structured output.
* Validation trước khi hiển thị.
* AI không được tính giá cuối.
* Log và evaluation.

### 17.4 Booking Confirmation Failure

Rủi ro: Buyer đặt dịch vụ nhưng đối tác hết chỗ hoặc không xác nhận.

Ảnh hưởng:

* Trải nghiệm khách kém.
* Sales phải xử lý thủ công.
* Có thể phát sinh hủy/hoàn tiền.

Giảm thiểu:

* Phân biệt instant booking và request-to-book.
* Hiển thị rõ trạng thái cần xác nhận.
* Sales confirmation flow.
* Không cam kết booking khi chưa xác nhận.

### 17.5 Payment & Refund Risk

Rủi ro: thanh toán thật phát sinh lỗi, hoàn tiền, tranh chấp hoặc đối soát sai.

Ảnh hưởng:

* Rủi ro tài chính.
* Rủi ro vận hành.
* Mất uy tín.

Giảm thiểu:

* MVP dùng sandbox/manual nếu cần.
* Thiết kế payment log rõ.
* Chỉ production payment khi có chính sách và quy trình đầy đủ.
* Có refund workflow.

### 17.6 Low Buyer Trust

Rủi ro: Buyer không tin nền tảng mới hoặc không hiểu AI đề xuất dựa trên gì.

Ảnh hưởng:

* Tỷ lệ chuyển đổi thấp.
* Buyer không gửi booking.
* Sales ít lead.

Giảm thiểu:

* Hiển thị thông tin minh bạch.
* Có ảnh, bản đồ, giá, chính sách.
* Có lý do AI đề xuất.
* Có human confirmation.
* Có thương hiệu NiBiGo/Ninh Bình rõ ràng.

---

## 18. Success Criteria for MVP

MVP được xem là thành công nếu đạt các tiêu chí sau:

### 18.1 Product Completeness

* Có web app public URL.
* Có 4 role: ADMIN, EDITOR/MOD, SALES, BUYER.
* Buyer có thể xem dịch vụ và dùng NiBi AI.
* Buyer có thể gửi booking request hoặc tạo order.
* Sales có thể xử lý booking.
* Editor/MOD có thể thêm/sửa nội dung và sản phẩm.
* Admin có thể quản trị nền tảng.

### 18.2 Business Demonstration

* Có ít nhất một luồng demo hoàn chỉnh từ khám phá dịch vụ đến booking.
* Có dữ liệu mẫu đủ cho tour, homestay/khách sạn, thuê xe, combo và bài viết.
* Có cost breakdown.
* Có booking/order status.
* Có dashboard vận hành.

### 18.3 AI Demonstration

* NiBi AI hiểu nhu cầu khách.
* NiBi AI đề xuất dịch vụ có thật trong database.
* NiBi AI tạo được lịch trình.
* NiBi AI giải thích được lý do đề xuất.
* NiBi AI không tự bịa giá cuối.
* NiBi AI tạo được sales note.

### 18.4 Commerce Readiness

* Có cấu trúc order/booking.
* Có payment status.
* Có khả năng mở rộng sang payment gateway thật.
* Có quy trình request-to-book.
* Có trạng thái xác nhận booking.

### 18.5 Operational Readiness

* Sales có thể xử lý lead.
* Admin có thể kiểm soát sản phẩm.
* Editor/MOD có thể quản lý nội dung.
* Hệ thống có log cơ bản.
* Dữ liệu có cấu trúc để mở rộng.

---

## 19. Future Business Expansion

Sau MVP, NiBiGo có thể mở rộng theo các hướng:

### 19.1 Real Payment

Tích hợp payment gateway thật để khách thanh toán cọc hoặc thanh toán toàn bộ.

### 19.2 Zalo OA / Zalo Mini App

Sử dụng Zalo để gửi thông báo booking, nhắc thanh toán, nhắc lịch trình và cho khách tra cứu booking.

### 19.3 Partner Portal

Cho phép đối tác đăng nhập để quản lý dịch vụ, giá, availability và booking.

### 19.4 Multi-destination

Mở rộng từ Ninh Bình sang các điểm đến khác.

### 19.5 AI Upsell & Cross-sell

NiBi AI có thể gợi ý thêm dịch vụ phù hợp như xe riêng, bữa ăn, trải nghiệm, nâng cấp phòng hoặc combo tốt hơn.

### 19.6 CRM & Marketing Automation

Phân nhóm khách hàng, gửi voucher, chăm sóc sau chuyến đi, remarketing và loyalty program.

---

## 20. Conclusion

NiBiGo AI Travel Platform không chỉ là một chatbot du lịch, mà là một nền tảng thương mại du lịch có AI hỗ trợ cá nhân hóa và vận hành booking.

Bài toán kinh doanh cốt lõi là giúp khách du lịch Ninh Bình tìm, ghép và đặt các dịch vụ phù hợp trong một luồng minh bạch, dễ hiểu và đáng tin cậy. Đồng thời, nền tảng giúp NiBiGo mở rộng doanh thu từ nhiều nguồn như commission, markup, package margin, platform fee, featured listing và premium concierge service.

MVP cần chứng minh được ba năng lực chính:

1. Buyer có thể khám phá và đặt dịch vụ.
2. NiBi AI có thể cá nhân hóa đề xuất dựa trên dữ liệu thật.
3. Admin/Editor/Sales có thể vận hành sản phẩm và booking trong một dashboard có phân quyền.

Nếu MVP thành công, NiBiGo có thể mở rộng thành một local-first travel commerce platform cho Ninh Bình, sau đó phát triển sang payment thật, Zalo integration, partner portal và nhiều điểm đến khác.
