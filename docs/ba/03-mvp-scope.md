# 03. MVP Scope — NiBiGo AI Travel Platform

**Project name:** NiBiGo AI Travel Platform
**AI assistant name:** NiBi AI
**Document type:** MVP Scope Definition
**Version:** v1.0
**Status:** Draft
**Owner:** Đặng Trần Đạt
**Last updated:** 2026-06-22

---

## 1. Document Purpose

Tài liệu này xác định phạm vi MVP cho NiBiGo AI Travel Platform.

Mục tiêu của tài liệu là làm rõ:

* MVP cần chứng minh điều gì.
* Những chức năng nào nằm trong phạm vi MVP.
* Những chức năng nào chưa làm ở MVP.
* Mức độ hoàn thiện kỳ vọng cho từng module.
* Ranh giới giữa MVP, Phase 2, Phase 3 và các giai đoạn mở rộng.
* Cách kiểm soát scope để dự án vẫn khả thi với nguồn lực nhỏ.

MVP của NiBiGo không chỉ là một chatbot AI tạo lịch trình. MVP là một nền tảng du lịch Ninh Bình có AI hỗ trợ, có danh mục dịch vụ, có commerce flow cơ bản, có Google Maps, có dashboard vận hành và có 4 role chính.

Tuy nhiên, MVP không cố gắng làm đầy đủ như một OTA lớn. Nguyên tắc là:

**Small scope, premium execution.**

---

## 2. MVP Product Definition

MVP của NiBiGo AI Travel Platform là một web app cho phép khách hàng khám phá, nhận tư vấn từ NiBi AI và gửi yêu cầu đặt các dịch vụ du lịch Ninh Bình như tour, homestay, khách sạn, thuê xe, trải nghiệm và combo.

MVP cần có đầy đủ 4 role:

* ADMIN.
* EDITOR/MOD.
* SALES.
* BUYER.

MVP cần có các năng lực lõi:

1. Buyer có thể khám phá dịch vụ du lịch.
2. Buyer có thể dùng NiBi AI để nhận gợi ý cá nhân hóa.
3. Buyer có thể chọn dịch vụ, xem chi phí và gửi booking request hoặc tạo order ở mức MVP.
4. Editor/MOD có thể thêm và chỉnh sửa sản phẩm, dịch vụ, bài viết.
5. Sales có thể xem và xử lý booking request/order.
6. Admin có thể quản lý user, role, sản phẩm, nội dung và booking.
7. Google Maps được tích hợp ở mức hiển thị và lưu vị trí.
8. Commerce flow có cart/selected services, order/booking record và payment status ở mức demo/manual/sandbox.
9. Hệ thống lưu dữ liệu thật trong database, không chỉ mô phỏng bằng lời của AI.

---

## 3. MVP Goal

Mục tiêu của MVP là chứng minh rằng:

**NiBiGo có thể trở thành một nền tảng du lịch Ninh Bình tích hợp AI, nơi khách hàng không chỉ hỏi thông tin, mà có thể khám phá, cá nhân hóa và gửi yêu cầu đặt các dịch vụ du lịch trong một luồng có dữ liệu, trạng thái và vận hành thật.**

MVP cần trả lời 5 câu hỏi quan trọng:

1. Buyer có hiểu và muốn dùng NiBi AI để tìm/ghép dịch vụ du lịch không?
2. NiBi AI có thể gợi ý dịch vụ phù hợp dựa trên dữ liệu thật không?
3. Buyer có sẵn sàng gửi booking request/order sau khi xem gợi ý, giá và lịch trình không?
4. Sales có thể xử lý booking hiệu quả hơn nhờ lead summary và AI sales note không?
5. Admin/Editor có thể quản lý dữ liệu dịch vụ đủ tốt để nền tảng vận hành không?

---

## 4. MVP Success Criteria

MVP được xem là thành công nếu đạt các tiêu chí sau:

### 4.1 Buyer Flow Success

* Buyer đăng ký/đăng nhập được.
* Buyer xem được danh sách dịch vụ.
* Buyer xem được chi tiết dịch vụ.
* Buyer dùng được NiBi AI để nhập nhu cầu.
* Buyer nhận được gợi ý phù hợp.
* Buyer xem được lịch trình hoặc combo đề xuất.
* Buyer xem được cost breakdown.
* Buyer gửi được booking request hoặc tạo order.
* Buyer nhận được mã booking/order.
* Buyer xem được trạng thái booking/order.

### 4.2 AI Success

* NiBi AI hiểu được nhu cầu cơ bản của Buyer.
* NiBi AI hỏi lại khi thiếu thông tin quan trọng.
* NiBi AI chỉ đề xuất sản phẩm có trong database.
* NiBi AI không tự bịa giá.
* NiBi AI không tự bịa availability.
* NiBi AI tạo được lịch trình hoặc gợi ý combo dễ hiểu.
* NiBi AI giải thích được lý do đề xuất.
* NiBi AI tạo được sales note cho Sales.

### 4.3 Commerce Success

* Hệ thống có product detail.
* Hệ thống có selected services/cart ở mức MVP.
* Hệ thống có booking request/order record.
* Hệ thống có cost breakdown.
* Hệ thống có booking/order status.
* Hệ thống có payment status ở mức manual/sandbox/demo.
* Hệ thống không nói “đã đặt thành công” nếu chưa lưu booking/order trong database.

### 4.4 Operation Success

* Sales xem được booking request/order mới.
* Sales xem được nhu cầu khách.
* Sales xem được dịch vụ khách chọn.
* Sales xem được AI sales note.
* Sales cập nhật được trạng thái booking.
* Editor/MOD thêm/sửa được sản phẩm.
* Admin quản lý được user/role và dữ liệu chính.

### 4.5 Platform Success

* Web app deploy online.
* Có database thật.
* Có phân quyền role.
* Có UI/UX hoàn chỉnh ở mức MVP.
* Có dữ liệu mẫu đủ để demo.
* Có ít nhất một demo flow end-to-end từ Buyer đến Sales/Admin.

---

## 5. MVP Scope Overview

MVP được chia thành 8 module chính:

1. Authentication & Role-based Access.
2. Buyer Product Discovery.
3. NiBi AI Assistant.
4. Commerce & Booking Flow.
5. Google Maps & Location.
6. Admin Dashboard.
7. Editor/MOD CMS & Product Management.
8. Sales Dashboard.

---

# PART A — IN SCOPE

---

## 6. Authentication & Role-based Access

### 6.1 In Scope

Hệ thống cần hỗ trợ đăng ký, đăng nhập và phân quyền theo 4 role:

* ADMIN.
* EDITOR/MOD.
* SALES.
* BUYER.

### 6.2 Functional Scope

Người dùng có thể:

* Đăng ký tài khoản.
* Đăng nhập.
* Đăng xuất.
* Xem giao diện phù hợp với role.
* Bị chặn khi truy cập trang không có quyền.

Admin có thể:

* Xem danh sách user.
* Gán role cho user.
* Khóa hoặc mở user ở mức cơ bản nếu khả thi trong MVP.

### 6.3 MVP Acceptance

* Buyer không được truy cập dashboard nội bộ.
* Sales không được truy cập cấu hình hệ thống.
* Editor/MOD không được chỉnh payment/order status nếu không có quyền.
* Admin có quyền cao nhất.

---

## 7. Buyer Product Discovery

### 7.1 In Scope

Buyer có thể khám phá các loại dịch vụ du lịch Ninh Bình.

Các loại dịch vụ trong MVP:

* Tour.
* Homestay.
* Khách sạn.
* Thuê xe.
* Trải nghiệm/hoạt động.
* Combo/package.
* Bài viết/guide.

### 7.2 Functional Scope

Buyer có thể:

* Xem landing page hoặc home page của app.
* Xem danh sách tour.
* Xem danh sách homestay/khách sạn.
* Xem danh sách thuê xe.
* Xem danh sách combo.
* Xem bài viết du lịch.
* Xem chi tiết sản phẩm.
* Xem ảnh sản phẩm.
* Xem giá sản phẩm.
* Xem tags.
* Xem trạng thái availability.
* Xem vị trí trên bản đồ nếu sản phẩm có location.
* Lọc sản phẩm theo loại, khoảng giá, tag hoặc nhóm phù hợp.

### 7.3 MVP Acceptance

MVP cần có dữ liệu mẫu đủ để demo:

* Ít nhất 5 tour/activities.
* Ít nhất 4 homestay/khách sạn.
* Ít nhất 4 dịch vụ thuê xe.
* Ít nhất 3 combo/package.
* Ít nhất 5 bài viết/guide hoặc destination content.
* Mỗi sản phẩm nên có ảnh, mô tả, giá, tags, availability và location nếu phù hợp.

---

## 8. NiBi AI Assistant

### 8.1 In Scope

NiBi AI là trợ lý AI cá nhân hóa trong nền tảng.

NiBi AI trong MVP hỗ trợ:

* Hiểu nhu cầu chuyến đi.
* Hỏi thêm nếu thiếu thông tin.
* Gợi ý tour, homestay, khách sạn, xe, trải nghiệm hoặc combo.
* Tạo lịch trình theo ngày.
* Giải thích lý do đề xuất.
* Cảnh báo khi vượt ngân sách.
* Cảnh báo khi dịch vụ cần xác nhận availability.
* Hỗ trợ chỉnh lịch trình bằng ngôn ngữ tự nhiên.
* Tạo AI sales note cho Sales.

### 8.2 Required Inputs

NiBi AI cần nhận các thông tin chính:

* Điểm đến.
* Ngày đi.
* Số ngày.
* Số người.
* Ngân sách.
* Phong cách du lịch.
* Sở thích.
* Yêu cầu đặc biệt.
* Điểm đón nếu có thuê xe.
* Dữ liệu sản phẩm ứng viên do backend cung cấp.
* Business rules.
* Availability status.
* Giá do database/backend cung cấp.

### 8.3 Required Outputs

NiBi AI cần tạo:

* Tóm tắt nhu cầu khách.
* Gợi ý dịch vụ hoặc package.
* Lịch trình theo ngày.
* Lý do đề xuất.
* Cảnh báo nếu có.
* Đề xuất chỉnh sửa nếu ngân sách không phù hợp.
* AI sales note.

### 8.4 AI Boundaries

NiBi AI không được:

* Tạo sản phẩm không có trong database.
* Tự bịa giá.
* Tự bịa trạng thái còn chỗ.
* Tự xác nhận booking.
* Nói khách đã thanh toán nếu chưa có payment record.
* Tự thay đổi order/payment status.
* Ưu tiên sản phẩm tài trợ nếu không phù hợp với nhu cầu khách.

### 8.5 MVP Acceptance

* Với một nhu cầu du lịch hợp lệ, NiBi AI tạo được ít nhất một itinerary hoặc recommendation rõ ràng.
* Các sản phẩm được gợi ý phải tồn tại trong database.
* Tổng giá hiển thị phải lấy từ backend hoặc được backend xác thực.
* AI sales note được lưu hoặc hiển thị trong booking detail cho Sales.
* Nếu thiếu thông tin quan trọng, NiBi AI phải hỏi lại thay vì đoán mò.

---

## 9. Commerce & Booking Flow

### 9.1 In Scope

MVP cần có commerce flow cơ bản để Buyer có thể chọn dịch vụ và tạo booking/order record.

Commerce trong MVP bao gồm:

* Product detail.
* Selected services/cart.
* Booking request.
* Order record.
* Cost breakdown.
* Booking/order status.
* Payment status ở mức manual/sandbox/demo.

### 9.2 Booking Types

MVP hỗ trợ hai loại booking logic ở mức cơ bản:

#### 9.2.1 Request-to-book

Áp dụng cho dịch vụ cần Sales xác nhận lại.

Ví dụ:

* Homestay.
* Khách sạn.
* Xe riêng.
* Tour riêng.
* Combo có nhiều dịch vụ.

Flow:

1. Buyer chọn dịch vụ hoặc combo.
2. Buyer gửi booking request.
3. Hệ thống tạo mã booking.
4. Sales kiểm tra và xác nhận.
5. Sales cập nhật trạng thái.

#### 9.2.2 Demo/Sandbox Order

Áp dụng để chứng minh commerce flow.

Flow:

1. Buyer chọn dịch vụ.
2. Buyer tạo order.
3. Hệ thống lưu order.
4. Payment status mặc định là `UNPAID`, `PENDING` hoặc `PAID_DEMO`.
5. Sales/Admin cập nhật trạng thái.

### 9.3 Booking/Order Data

Mỗi booking/order cần có:

* Booking/order ID.
* Buyer ID.
* Danh sách dịch vụ.
* Số lượng.
* Ngày đi/ngày sử dụng dịch vụ.
* Giá từng hạng mục.
* Tổng giá.
* Payment status.
* Booking/order status.
* Ghi chú khách.
* Sales note.
* Thời gian tạo.
* Thời gian cập nhật.

### 9.4 Cost Breakdown

Cost breakdown cần hiển thị:

* Tour/activity cost.
* Accommodation cost.
* Transport cost.
* Meal/restaurant cost nếu có.
* Combo/package cost.
* Platform fee nếu có.
* Discount nếu có.
* Tổng cộng.

### 9.5 MVP Acceptance

* Buyer có thể tạo booking request/order.
* Hệ thống tạo mã booking/order.
* Booking/order được lưu database.
* Sales/Admin xem được booking/order.
* Trạng thái booking/order có thể cập nhật.
* Cost breakdown được hiển thị rõ.
* Payment status tồn tại ở mức MVP, dù chưa tích hợp payment gateway production.

---

## 10. Google Maps & Location Scope

### 10.1 In Scope

Google Maps trong MVP dùng để hỗ trợ vị trí sản phẩm và trải nghiệm khám phá.

### 10.2 Functional Scope

MVP cần hỗ trợ:

* Lưu địa chỉ sản phẩm.
* Lưu latitude/longitude.
* Hiển thị bản đồ ở trang chi tiết sản phẩm.
* Hiển thị sản phẩm trên map nếu có tọa độ.
* Cho Editor/MOD nhập hoặc chọn vị trí.
* Hiển thị vị trí trong admin/editor dashboard.

### 10.3 Optional if Time Allows

Nếu có đủ thời gian, MVP có thể hỗ trợ thêm:

* Google Places Autocomplete.
* Hiển thị nearby landmarks.
* Tính khoảng cách cơ bản giữa sản phẩm và một số điểm đến nổi bật.
* Hiển thị map trong itinerary.

### 10.4 Not Required in MVP

MVP chưa bắt buộc:

* Directions API đầy đủ.
* Distance Matrix API đầy đủ.
* Route optimization.
* Real-time traffic.
* Map clustering nâng cao.
* Offline map.
* Tự động tối ưu lịch trình theo khoảng cách.

### 10.5 MVP Acceptance

* Sản phẩm có thể có vị trí.
* Buyer xem được vị trí sản phẩm trên bản đồ.
* Editor/MOD nhập được location.
* NiBi AI có thể sử dụng thông tin location ở mức mô tả nếu backend cung cấp.

---

## 11. Admin Dashboard

### 11.1 In Scope

Admin Dashboard là nơi quản trị toàn bộ nền tảng.

### 11.2 Functional Scope

Admin có thể:

* Xem dashboard tổng quan.
* Quản lý user.
* Quản lý role.
* Xem toàn bộ sản phẩm.
* Duyệt sản phẩm/nội dung nếu có workflow duyệt.
* Quản lý booking/order.
* Quản lý payment status ở mức MVP.
* Quản lý trạng thái sản phẩm.
* Xem logs cơ bản.
* Xem analytics cơ bản.

### 11.3 MVP Dashboard Metrics

Dashboard nên hiển thị:

* Tổng số booking/order.
* Số booking mới.
* Số booking đang xử lý.
* Số booking đã xác nhận.
* Số booking đã hủy.
* Tổng sản phẩm active.
* Tổng sản phẩm pending.
* Tổng buyer.
* Tổng doanh thu demo/GMV nếu có.

### 11.4 MVP Acceptance

* Admin có trang riêng.
* Admin xem được dữ liệu tổng quan.
* Admin quản lý được user/role ở mức cơ bản.
* Admin quản lý được sản phẩm.
* Admin quản lý được booking/order.
* Admin có quyền cao nhất.

---

## 12. Editor/MOD CMS & Product Management

### 12.1 In Scope

Editor/MOD có thể quản lý nội dung và dữ liệu dịch vụ.

### 12.2 Product Types

Editor/MOD có thể tạo/sửa:

* Tour.
* Homestay.
* Khách sạn.
* Thuê xe.
* Trải nghiệm.
* Combo/package.
* Bài viết/guide.

### 12.3 Product Fields

Sản phẩm cần có các field cơ bản:

* Name.
* Slug.
* Product type.
* Category.
* Description.
* Short description.
* Price.
* Unit.
* Duration.
* Destination.
* Address.
* Latitude.
* Longitude.
* Tags.
* Suitable for.
* Availability status.
* Images.
* Status.
* Is active.

### 12.4 Content Fields

Bài viết cần có:

* Title.
* Slug.
* Excerpt.
* Content.
* Cover image.
* Category.
* Tags.
* Status.
* Author.
* Created at.
* Updated at.

### 12.5 MVP Acceptance

* Editor/MOD tạo được sản phẩm.
* Editor/MOD sửa được sản phẩm.
* Editor/MOD upload hoặc gắn ảnh sản phẩm.
* Editor/MOD nhập được vị trí.
* Editor/MOD tạo được bài viết.
* Sản phẩm active mới hiển thị cho Buyer.
* Admin có thể kiểm soát nội dung nếu cần.

---

## 13. Sales Dashboard

### 13.1 In Scope

Sales Dashboard hỗ trợ Sales xử lý booking/order và chăm sóc khách.

### 13.2 Functional Scope

Sales có thể:

* Xem danh sách booking request/order.
* Lọc theo trạng thái.
* Xem chi tiết booking/order.
* Xem thông tin Buyer.
* Xem nhu cầu chuyến đi.
* Xem sản phẩm/dịch vụ khách chọn.
* Xem cost breakdown.
* Xem AI sales note.
* Ghi chú tư vấn.
* Cập nhật trạng thái booking/order.
* Cập nhật availability confirmation.
* Gửi hướng dẫn thanh toán ở mức manual/demo nếu có.

### 13.3 Lead/Booking Status

MVP có thể dùng trạng thái rút gọn:

* NEW.
* CONTACTED.
* CHECKING_AVAILABILITY.
* WAITING_PAYMENT.
* CONFIRMED.
* CANCELLED.

### 13.4 MVP Acceptance

* Sales xem được booking mới.
* Sales mở được booking detail.
* Sales cập nhật được trạng thái.
* Sales ghi chú được.
* Sales xem được AI sales note.
* Buyer có thể thấy trạng thái booking được cập nhật.

---

# PART B — OUT OF SCOPE

---

## 14. Out of Scope for MVP

Các chức năng sau không nằm trong MVP đầu tiên:

### 14.1 Flight Booking

MVP không hỗ trợ đặt vé máy bay.

Lý do:

* Phức tạp về API.
* Phức tạp về giá động.
* Không phải nhu cầu cốt lõi của Ninh Bình trong bản đầu.

### 14.2 Multi-destination

MVP không mở rộng ra toàn Việt Nam.

Lý do:

* Cần dữ liệu lớn.
* Cần nhiều đối tác.
* Khó kiểm soát chất lượng.
* Làm loãng định vị local-first.

### 14.3 Partner Portal

MVP chưa có portal riêng cho chủ homestay, nhà xe, tour operator tự đăng nhập quản lý dịch vụ.

Lý do:

* Tăng thêm role và workflow phức tạp.
* Cần cơ chế duyệt, hợp đồng, thanh toán đối tác.
* Giai đoạn đầu có thể để Admin/Editor quản lý dữ liệu thay đối tác.

### 14.4 Channel Manager / Real-time Hotel Inventory

MVP không tích hợp channel manager hoặc hệ thống tồn phòng real-time.

Lý do:

* Phức tạp về tích hợp.
* Nhiều homestay địa phương có thể chưa có hệ thống quản lý chuẩn.
* Request-to-book phù hợp hơn cho giai đoạn đầu.

### 14.5 Full Production Payment Gateway

MVP có thể có payment status hoặc sandbox/manual payment, nhưng chưa bắt buộc triển khai payment production đầy đủ.

Lý do:

* Payment thật cần xử lý bảo mật, đối soát, refund, dispute, chính sách hủy.
* MVP cần chứng minh commerce flow trước.

### 14.6 Zalo OA / Zalo Mini App Production Integration

Zalo OA và Zalo Mini App nằm trong roadmap sau MVP.

MVP có thể chuẩn bị field dữ liệu như số điện thoại, notification preference, nhưng chưa bắt buộc gửi tin thật.

### 14.7 Native Mobile App

MVP là web app responsive, không làm app native iOS/Android.

### 14.8 Advanced AI Agent / Multi-agent

MVP chưa cần multi-agent phức tạp.

NiBi AI nên bắt đầu bằng workflow rõ:

* Parse need.
* Retrieve/filter products.
* Generate explanation.
* Validate output.
* Save booking/order if buyer confirms.

### 14.9 Dynamic Pricing nâng cao

MVP chưa cần dynamic pricing theo mùa, ngày lễ, demand hoặc tồn kho real-time.

Giá có thể là giá cố định, giá theo người, giá theo ngày hoặc giá theo loại dịch vụ ở mức đơn giản.

### 14.10 Full CRM Automation

MVP chưa cần automation phức tạp như segmentation, lead scoring nâng cao, drip campaign hoặc loyalty.

---

# PART C — PHASED ROADMAP

---

## 15. Phase 1 — MVP Platform

### 15.1 Phase Goal

Xây nền tảng web app có AI, dịch vụ du lịch, booking/order flow, Google Maps cơ bản và dashboard cho 4 role.

### 15.2 Phase 1 Scope

Bao gồm:

* Auth.
* Role-based access.
* Buyer product discovery.
* Product detail.
* NiBi AI assistant.
* Recommendation/itinerary.
* Cart/selected services.
* Booking request/order.
* Payment status demo/manual.
* Google Maps basic.
* Admin dashboard.
* Editor/MOD CMS.
* Sales dashboard.
* Seed data.
* Deployment.

### 15.3 Phase 1 Output

Kết quả Phase 1:

* Web app public URL.
* Database thật.
* Demo end-to-end.
* 4 role hoạt động.
* Dữ liệu Ninh Bình mẫu.
* NiBi AI chạy được.
* Booking/order được lưu.

---

## 16. Phase 2 — Real Commerce & Operation

### 16.1 Phase Goal

Nâng commerce và vận hành từ demo lên gần production hơn.

### 16.2 Phase 2 Scope

Bao gồm:

* Payment gateway thật hoặc sandbox nâng cao.
* Payment link.
* Refund/cancellation request.
* Email notification.
* Sales assignment.
* Better availability management.
* Audit logs.
* Improved analytics.
* Better AI evaluation.
* Order invoice/receipt cơ bản.
* Booking confirmation automation.

### 16.3 Phase 2 Output

Kết quả Phase 2:

* Buyer có thể thanh toán/cọc thật hoặc qua sandbox production-like.
* Sales xử lý booking chuyên nghiệp hơn.
* Admin có audit log và analytics tốt hơn.
* Hệ thống sẵn sàng vận hành với khách thật ở quy mô nhỏ.

---

## 17. Phase 3 — Zalo OA / ZNS Integration

### 17.1 Phase Goal

Tích hợp Zalo làm kênh thông báo, chăm sóc và giữ liên lạc với khách.

### 17.2 Phase 3 Scope

Bao gồm:

* Zalo OA setup.
* ZNS templates.
* Booking confirmation notification.
* Payment reminder.
* Trip reminder.
* Booking status update.
* Notification logs.
* Consent management.
* Fallback notification via email/in-app.

### 17.3 Phase 3 Output

Kết quả Phase 3:

* Buyer nhận được thông báo booking qua Zalo.
* Sales giảm việc nhắn thủ công.
* Hệ thống có log gửi thông báo.
* NiBiGo tăng khả năng giữ liên lạc với khách.

---

## 18. Phase 4 — Zalo Mini App

### 18.1 Phase Goal

Cho Buyer tra cứu booking, xem lịch trình và nhận hỗ trợ ngay trong Zalo.

### 18.2 Phase 4 Scope

Bao gồm:

* Zalo Mini App.
* Zalo login.
* Booking lookup.
* Itinerary view.
* Payment/cọc nếu khả thi.
* Follow OA.
* Lightweight NiBi AI assistant.
* Voucher hoặc rebooking flow.

### 18.3 Phase 4 Output

Kết quả Phase 4:

* Buyer có thể quản lý chuyến đi trong Zalo.
* NiBiGo có thêm kênh engagement.
* Trải nghiệm sau booking tiện hơn.

---

## 19. Phase 5 — Partner Portal & Multi-destination

### 19.1 Phase Goal

Mở rộng nền tảng sang nhiều đối tác và nhiều điểm đến.

### 19.2 Phase 5 Scope

Bao gồm:

* Partner portal.
* Partner product management.
* Partner booking management.
* Commission settlement.
* Multi-destination.
* Advanced search.
* AI upsell/cross-sell.
* CRM automation.
* Campaign management.

### 19.3 Phase 5 Output

Kết quả Phase 5:

* NiBiGo trở thành marketplace du lịch địa phương có thể mở rộng.
* Đối tác tự quản lý dịch vụ.
* Nền tảng không còn phụ thuộc hoàn toàn vào Admin/Editor để nhập dữ liệu.

---

# PART D — PRIORITIZATION

---

## 20. MVP Priority Levels

Các chức năng MVP được chia thành 3 mức ưu tiên:

### 20.1 Must-have

Không có các chức năng này thì MVP không hoàn chỉnh.

* Authentication.
* Role-based access.
* Product listing.
* Product detail.
* Product management.
* Buyer booking request/order creation.
* Sales booking dashboard.
* Admin dashboard.
* NiBi AI recommendation.
* Cost breakdown.
* Database persistence.
* Booking/order status.
* Seed data.
* Deployment.

### 20.2 Should-have

Nên có để MVP thuyết phục hơn.

* Google Maps display.
* Location input for Editor/MOD.
* Basic cart/selected services.
* AI sales note.
* Booking status logs.
* Product tags and filters.
* Article/guide management.
* Basic analytics.
* Payment status demo/manual.

### 20.3 Could-have

Có thời gian thì làm.

* Google Places Autocomplete.
* Product comparison.
* Map-based listing.
* AI itinerary refinement.
* Email notification.
* Coupon/discount.
* Review system.
* Data completeness indicator.
* Export itinerary PDF.

---

## 21. MVP Feature Prioritization Table

| Module   | Feature                    | Priority    | MVP Status     |
| -------- | -------------------------- | ----------- | -------------- |
| Auth     | Login/Register             | Must-have   | In scope       |
| Auth     | Role-based access          | Must-have   | In scope       |
| Buyer    | Product listing            | Must-have   | In scope       |
| Buyer    | Product detail             | Must-have   | In scope       |
| Buyer    | Product filtering          | Should-have | In scope       |
| Buyer    | Map display                | Should-have | In scope       |
| AI       | NiBi AI recommendation     | Must-have   | In scope       |
| AI       | Itinerary generation       | Must-have   | In scope       |
| AI       | Itinerary refinement       | Could-have  | Optional       |
| Commerce | Booking request            | Must-have   | In scope       |
| Commerce | Order record               | Must-have   | In scope       |
| Commerce | Cart/selected services     | Should-have | In scope       |
| Commerce | Payment gateway production | Future      | Out of MVP     |
| Commerce | Payment status demo/manual | Should-have | In scope       |
| Sales    | Booking dashboard          | Must-have   | In scope       |
| Sales    | AI sales note              | Should-have | In scope       |
| Editor   | Product CMS                | Must-have   | In scope       |
| Editor   | Article CMS                | Should-have | In scope       |
| Admin    | User/role management       | Must-have   | In scope       |
| Admin    | Analytics                  | Should-have | In scope basic |
| Zalo     | OA/ZNS notification        | Future      | Out of MVP     |
| Zalo     | Mini App                   | Future      | Out of MVP     |

---

# PART E — MVP DATA SCOPE

---

## 22. Seed Data Requirements

MVP cần có dữ liệu mẫu đủ để demo nền tảng thật.

### 22.1 Destinations

* Ninh Bình.
* Tràng An.
* Tam Cốc.
* Hang Múa.
* Bái Đính.
* Cúc Phương.
* Vân Long.
* Hoa Lư.

### 22.2 Tours / Activities

Ít nhất 5 sản phẩm:

* Tràng An boat tour.
* Tam Cốc experience.
* Hang Múa viewpoint.
* Bái Đính cultural tour.
* Cúc Phương nature day trip.
* Đạp xe làng quê.
* Phố cổ Hoa Lư evening walk.

### 22.3 Accommodation

Ít nhất 4 sản phẩm:

* Homestay tiết kiệm.
* Boutique hotel cho cặp đôi.
* Resort nghỉ dưỡng.
* Khách sạn gia đình.

### 22.4 Transport

Ít nhất 4 sản phẩm:

* Xe ghép Hà Nội - Ninh Bình.
* Limousine.
* Xe riêng 4 chỗ.
* Xe riêng 7 chỗ.
* Xe 16 chỗ nếu có thời gian.

### 22.5 Combo/Package

Ít nhất 3 sản phẩm:

* Budget Ninh Bình 1D.
* Family Ninh Bình 2N1Đ.
* Couple Premium 2N1Đ.
* Flexible custom combo nếu có thời gian.

### 22.6 Articles/Guides

Ít nhất 5 bài:

* Kinh nghiệm du lịch Ninh Bình 2N1Đ.
* Top điểm tham quan Ninh Bình.
* Nên ở đâu khi đi Ninh Bình.
* Đi Ninh Bình bằng xe gì.
* Lịch trình Ninh Bình cho gia đình.

---

## 23. MVP Product Data Fields

Mỗi sản phẩm tối thiểu cần có:

* ID.
* Name.
* Slug.
* Product type.
* Description.
* Short description.
* Price.
* Price unit.
* Destination.
* Duration.
* Images.
* Tags.
* Suitable for.
* Availability status.
* Address.
* Latitude.
* Longitude.
* Status.
* Is active.

Các field nên có nếu thời gian cho phép:

* Cancellation policy.
* Included.
* Excluded.
* Capacity.
* Min/max guests.
* Partner name.
* Commission rate.
* Featured flag.
* Rating.
* Review count.
* SEO title/meta description.

---

# PART F — MVP NON-GOALS

---

## 24. MVP Non-goals

MVP không nhằm mục tiêu:

* Trở thành OTA đầy đủ.
* Cạnh tranh trực tiếp với Booking/Agoda/Traveloka.
* Xử lý mọi điểm đến ở Việt Nam.
* Tự động hóa 100% booking.
* Loại bỏ hoàn toàn Sales.
* Xây AI agent phức tạp nhiều lớp.
* Làm mobile app native.
* Làm partner portal ngay.
* Tích hợp tất cả kênh thanh toán.
* Tối ưu thuật toán du lịch nâng cao.

MVP chỉ cần chứng minh:

* Buyer có nhu cầu.
* AI recommendation có giá trị.
* Commerce flow có thể chạy.
* Booking/order được lưu thật.
* Admin/Sales/Editor có thể vận hành nền tảng.
* Kiến trúc có thể mở rộng.

---

# PART G — DEMO SCOPE

---

## 25. Recommended Demo Scenario

### 25.1 Demo Buyer Scenario

Buyer là một gia đình 4 người từ Hà Nội đi Ninh Bình 2 ngày 1 đêm, có một trẻ nhỏ, ngân sách khoảng 6.000.000đ, muốn lịch trình nhẹ, có xe riêng, ưu tiên thiên nhiên và chỗ ở sạch sẽ.

### 25.2 Demo Flow

1. Buyer đăng nhập.
2. Buyer mở NiBi AI.
3. Buyer nhập nhu cầu chuyến đi.
4. NiBi AI hỏi thêm điểm đón nếu thiếu.
5. Hệ thống gợi ý combo gồm:

   * Homestay gia đình.
   * Xe riêng 7 chỗ.
   * Tràng An.
   * Phố cổ Hoa Lư.
   * Bữa ăn đặc sản.
6. Buyer xem cost breakdown.
7. Buyer xem vị trí homestay trên Google Maps.
8. Buyer chỉnh: “lịch nhẹ hơn và giảm ngân sách một chút”.
9. NiBi AI điều chỉnh đề xuất.
10. Buyer gửi booking request.
11. Hệ thống tạo mã booking.
12. Sales đăng nhập dashboard.
13. Sales xem booking mới.
14. Sales đọc AI sales note.
15. Sales cập nhật trạng thái thành `CONTACTED` hoặc `CHECKING_AVAILABILITY`.
16. Buyer xem trạng thái booking được cập nhật.

### 25.3 Demo Success

Demo thành công nếu người xem thấy rõ:

* Buyer có trải nghiệm end-to-end.
* AI hỗ trợ cá nhân hóa.
* Giá minh bạch.
* Google Maps có vai trò trong quyết định.
* Booking được lưu database.
* Sales/Admin có dashboard thật.
* Đây là nền tảng commerce du lịch, không chỉ là chatbot.

---

## 26. MVP Constraints

### 26.1 Time Constraint

Do dự án được thực hiện bởi cá nhân hoặc team nhỏ, cần ưu tiên feature tạo giá trị demo cao nhất.

### 26.2 Technical Constraint

Nên dùng stack nhanh triển khai:

* Next.js.
* Supabase.
* Vercel.
* Tailwind CSS.
* Google Maps Platform.
* OpenAI/Gemini.

### 26.3 Data Constraint

Dữ liệu ban đầu có thể là seed data, nhưng cần có cấu trúc thật và đủ trường quan trọng.

### 26.4 AI Constraint

NiBi AI cần được giới hạn bằng business rules, database và validation.

### 26.5 Payment Constraint

Payment gateway production có thể để phase sau, nhưng order/payment status phải được thiết kế ngay từ MVP.

---

## 27. Scope Control Rules

Để tránh scope creep, dự án cần tuân thủ các rule sau:

1. Mọi feature mới phải trả lời câu hỏi: có giúp demo flow chính tốt hơn không?
2. Nếu feature không phục vụ Buyer booking hoặc Admin/Sales operation, đưa vào backlog.
3. Không thêm role mới trong MVP ngoài 4 role đã xác định.
4. Không thêm destination mới trước khi Ninh Bình flow ổn.
5. Không làm partner portal trước khi product CMS nội bộ ổn.
6. Không làm payment thật nếu booking/order flow chưa vững.
7. Không làm Zalo Mini App trước khi web app commerce hoạt động.
8. Không để NiBi AI thay thế backend pricing hoặc booking logic.
9. Không để Google Maps trở thành feature trang trí; chỉ dùng nếu hỗ trợ quyết định.
10. Không làm multi-agent nếu workflow đơn giản đã đủ.

---

## 28. Final MVP Scope Statement

MVP của NiBiGo AI Travel Platform là một web app du lịch Ninh Bình tích hợp NiBi AI, cho phép Buyer khám phá tour, homestay, khách sạn, thuê xe, trải nghiệm và combo; nhận gợi ý cá nhân hóa; xem chi phí và vị trí; gửi booking request hoặc tạo order ở mức MVP; trong khi Admin, Editor/MOD và Sales có dashboard riêng để quản lý sản phẩm, nội dung, booking và vận hành.

MVP nằm ở giao điểm của bốn năng lực:

1. **Discovery** — khách tìm thấy dịch vụ phù hợp.
2. **AI Personalization** — NiBi AI giúp khách ra quyết định.
3. **Commerce** — khách có thể chọn và gửi booking/order.
4. **Operation** — nội bộ có thể quản lý dữ liệu và xử lý booking.

MVP không cần trở thành OTA hoàn chỉnh ngay, nhưng phải chứng minh được nền tảng có thể vận hành như một travel commerce platform thực sự ở quy mô nhỏ.
