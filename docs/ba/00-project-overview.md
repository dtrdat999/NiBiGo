# 00. Project Overview — NiBiGo AI Travel Platform

**Project name:** NiBiGo AI Travel Platform
**AI assistant name:** NiBi AI
**Primary domain:** ai.nibigo.io.vn
**Existing website:** nibigo.io.vn
**Initial destination scope:** Ninh Bình, Việt Nam
**Document type:** Business Analysis / Product Overview
**Version:** v1.0
**Owner:** Đặng Trần Đạt
**Last updated:** 2026-06-22

---

## 1. Executive Summary

NiBiGo AI Travel Platform là nền tảng du lịch số tập trung vào Ninh Bình, cho phép khách hàng khám phá, lập kế hoạch, so sánh và đặt các dịch vụ du lịch như tour, homestay, khách sạn, thuê xe, trải nghiệm địa phương và combo trọn gói.

Điểm khác biệt cốt lõi của nền tảng là **NiBi AI** — trợ lý AI cá nhân hóa giúp khách hàng tìm và ghép các dịch vụ phù hợp theo ngân sách, sở thích, thời gian, vị trí, thành phần đoàn và nhu cầu đặc biệt. NiBi AI không chỉ trả lời câu hỏi chung chung, mà hỗ trợ khách hàng đưa ra quyết định đặt dịch vụ dựa trên dữ liệu thật trong hệ thống.

NiBiGo không định vị là một chatbot du lịch đơn thuần. Sản phẩm được định vị là một **AI-enabled travel commerce platform** — nền tảng thương mại du lịch có AI hỗ trợ tư vấn, cá nhân hóa, gợi ý lịch trình, đề xuất dịch vụ và hỗ trợ sales xử lý booking.

Trong giai đoạn đầu, nền tảng tập trung vào một thị trường hẹp là **du lịch Ninh Bình**, với mục tiêu xây dựng một hệ thống đủ hoàn chỉnh để khách hàng có thể tìm kiếm, lựa chọn và gửi yêu cầu đặt dịch vụ. Sau MVP, nền tảng có thể mở rộng sang thanh toán thật, tích hợp Google Maps sâu hơn, Zalo OA/Zalo Mini App, WordPress/WooCommerce, nhiều điểm đến và mạng lưới đối tác du lịch.

---

## 2. Background & Context

NiBiGo hiện có website du lịch tại domain `nibigo.io.vn`, được xây dựng trên WordPress. Website hiện tại đóng vai trò là kênh nội dung, thương hiệu và giới thiệu dịch vụ du lịch Ninh Bình.

Tuy nhiên, để xây dựng một nền tảng AI và commerce có khả năng mở rộng, module mới sẽ được phát triển độc lập với WordPress. Ứng dụng mới dự kiến triển khai tại `ai.nibigo.io.vn` hoặc một subdomain phù hợp, sử dụng kiến trúc web app hiện đại.

Lý do không phát triển trực tiếp trên WordPress trong giai đoạn MVP:

* WordPress phù hợp với website nội dung, blog, landing page và SEO.
* AI planning, booking workflow, role-based dashboard, commerce logic và database interaction cần kiến trúc linh hoạt hơn.
* Tách web app độc lập giúp dễ deploy, dễ kiểm soát backend, dễ mở rộng về AI, payment, Google Maps và Zalo integration.
* WordPress có thể tiếp tục giữ vai trò website thương hiệu, còn app mới đóng vai trò nền tảng giao dịch và AI planning.

---

## 3. Business Problem

Khách du lịch muốn đi Ninh Bình thường gặp nhiều vấn đề khi tự lên kế hoạch và đặt dịch vụ.

Thứ nhất, thông tin bị phân mảnh. Khách phải tìm tour ở một nơi, khách sạn hoặc homestay ở một nơi khác, thuê xe qua một bên khác, còn lịch trình thì tham khảo từ blog, TikTok, Facebook hoặc hỏi người quen.

Thứ hai, khách khó biết lựa chọn nào phù hợp với ngân sách, thời gian và thành phần đoàn. Một cặp đôi, một gia đình có trẻ nhỏ, một nhóm bạn trẻ và một đoàn có người lớn tuổi sẽ cần lịch trình, phương tiện, chỗ ở và trải nghiệm rất khác nhau.

Thứ ba, khách thiếu sự minh bạch về chi phí. Nhiều tour hoặc combo chỉ đưa ra một mức giá tổng, nhưng không giải thích rõ chi phí gồm những gì, khoản nào cố định, khoản nào cần xác nhận lại và khoản nào có thể thay đổi.

Thứ tư, quy trình tư vấn thủ công tốn thời gian. Sales phải hỏi lại nhiều thông tin cơ bản như ngày đi, số người, ngân sách, loại hình lưu trú, điểm đón, sở thích và yêu cầu đặc biệt. Điều này làm chậm quá trình chốt booking.

Thứ năm, các chatbot AI du lịch thông thường có rủi ro bịa thông tin, bịa giá hoặc gợi ý dịch vụ không tồn tại. Với du lịch thương mại, điều này có thể làm giảm niềm tin và gây lỗi vận hành.

Vì vậy, bài toán kinh doanh cốt lõi của NiBiGo là:

**Làm thế nào để biến nhu cầu du lịch Ninh Bình rời rạc của khách hàng thành một hành trình đặt dịch vụ rõ ràng, cá nhân hóa, minh bạch chi phí và có thể xử lý vận hành thật?**

---

## 4. Product Vision

Tầm nhìn của NiBiGo AI Travel Platform là trở thành nền tảng du lịch địa phương thông minh cho Ninh Bình, nơi khách hàng có thể khám phá, lập kế hoạch và đặt dịch vụ du lịch một cách dễ dàng, minh bạch và cá nhân hóa.

NiBiGo hướng đến việc kết hợp bốn lớp giá trị:

1. **Content Layer**
   Cung cấp thông tin du lịch Ninh Bình, bài viết, hướng dẫn, điểm đến, kinh nghiệm và nội dung SEO.

2. **Commerce Layer**
   Cho phép khách hàng tìm kiếm, lựa chọn và đặt tour, homestay, khách sạn, thuê xe, trải nghiệm và combo.

3. **Location Intelligence Layer**
   Sử dụng Google Maps và dữ liệu vị trí để hỗ trợ khách hiểu khoảng cách, tuyến đường, vị trí lưu trú, điểm tham quan và tính hợp lý của lịch trình.

4. **AI Personalization Layer**
   Sử dụng NiBi AI để hiểu nhu cầu khách hàng, gợi ý dịch vụ phù hợp, tạo lịch trình, so sánh lựa chọn, đề xuất combo và hỗ trợ sales xử lý lead.

Tầm nhìn dài hạn là biến NiBiGo từ một website du lịch thành một nền tảng giao dịch và tư vấn du lịch thông minh, bắt đầu từ Ninh Bình và có thể mở rộng sang các điểm đến khác trong tương lai.

---

## 5. Product Positioning

NiBiGo AI Travel Platform được định vị là:

**Nền tảng du lịch Ninh Bình tích hợp AI, giúp khách hàng tìm, ghép và đặt các dịch vụ du lịch như tour, homestay, khách sạn, thuê xe, trải nghiệm địa phương và combo trọn gói, với sự hỗ trợ cá nhân hóa từ NiBi AI.**

NiBi AI được định vị là:

**Trợ lý AI du lịch cá nhân hóa của NiBiGo, giúp khách hàng chọn dịch vụ phù hợp, tạo lịch trình, so sánh lựa chọn và gửi yêu cầu đặt dịch vụ dựa trên dữ liệu thật trong hệ thống.**

Sản phẩm không cạnh tranh trực diện với các OTA lớn như một nền tảng đặt phòng toàn quốc. Thay vào đó, NiBiGo tập trung vào lợi thế địa phương:

* Am hiểu sâu về Ninh Bình.
* Dữ liệu dịch vụ được chọn lọc.
* Khả năng ghép tour, lưu trú, xe và trải nghiệm thành combo phù hợp.
* Tư vấn bằng AI dựa trên nhu cầu cụ thể của khách.
* Có sales/human-in-the-loop để xác nhận booking và xử lý ngoại lệ.

---

## 6. Target Users

### 6.1 Buyer

Buyer là khách hàng sử dụng nền tảng để tìm kiếm, lập kế hoạch và đặt dịch vụ du lịch Ninh Bình.

Buyer có thể là:

* Khách đi du lịch gia đình.
* Cặp đôi.
* Nhóm bạn trẻ.
* Khách đi nghỉ dưỡng.
* Khách đi trong ngày từ Hà Nội.
* Khách muốn đặt combo gồm xe, lưu trú và trải nghiệm.
* Khách cần tư vấn trước khi ra quyết định.

Nhu cầu chính của Buyer:

* Tìm dịch vụ phù hợp với ngân sách.
* Biết lịch trình nào hợp lý.
* So sánh tour, homestay, khách sạn và thuê xe.
* Xem vị trí trên bản đồ.
* Biết tổng chi phí rõ ràng.
* Có thể đặt hoặc gửi yêu cầu đặt dịch vụ.
* Theo dõi trạng thái booking.

### 6.2 Sales

Sales là người xử lý lead, tư vấn khách, xác nhận dịch vụ với đối tác và cập nhật trạng thái booking.

Nhu cầu chính của Sales:

* Xem danh sách booking request/order.
* Xem chi tiết nhu cầu khách.
* Xem lịch trình và dịch vụ NiBi AI đề xuất.
* Đọc AI sales note.
* Xác nhận availability.
* Gửi báo giá hoặc yêu cầu thanh toán.
* Đổi trạng thái booking.
* Ghi chú quá trình tư vấn.

### 6.3 Editor / Moderator

Editor/MOD là người quản lý nội dung, sản phẩm và dữ liệu dịch vụ trên nền tảng.

Nhu cầu chính của Editor/MOD:

* Thêm/sửa tour.
* Thêm/sửa homestay, khách sạn, resort.
* Thêm/sửa dịch vụ thuê xe.
* Thêm/sửa trải nghiệm, nhà hàng, combo.
* Thêm/sửa bài viết du lịch.
* Upload ảnh.
* Nhập vị trí Google Maps.
* Gắn tag, danh mục, thông tin phù hợp với từng nhóm khách.
* Gửi nội dung hoặc sản phẩm chờ duyệt.

### 6.4 Admin

Admin là người quản trị toàn bộ nền tảng.

Nhu cầu chính của Admin:

* Quản lý user và phân quyền.
* Quản lý toàn bộ sản phẩm, dịch vụ và nội dung.
* Duyệt hoặc khóa sản phẩm.
* Quản lý booking, order, payment, refund.
* Cấu hình AI provider, Google Maps, payment gateway, Zalo integration.
* Xem analytics, logs và audit trail.
* Quản lý chính sách, commission, platform fee và trạng thái hệ thống.

---

## 7. Core Business Model

NiBiGo có thể tạo doanh thu từ nhiều nguồn khác nhau, không giới hạn ở tour.

### 7.1 Commission từ homestay/khách sạn

NiBiGo nhận phần trăm hoa hồng khi khách đặt lưu trú qua nền tảng.

Ví dụ:

* Homestay: 10%–15% trên giá trị booking.
* Khách sạn/resort: tùy thỏa thuận với đối tác.
* Villa/bungalow: có thể áp dụng commission hoặc giá net.

### 7.2 Markup hoặc commission từ tour và trải nghiệm

NiBiGo có thể bán tour và trải nghiệm địa phương theo hai cách:

* Nhận commission từ nhà cung cấp tour.
* Lấy giá net từ đối tác và bán giá retail cho khách.

Ví dụ sản phẩm:

* Tour Tràng An.
* Tour Tam Cốc.
* Tour Bái Đính.
* Tour Cúc Phương.
* Food tour.
* Tour chụp ảnh.
* Trải nghiệm đạp xe làng quê.

### 7.3 Doanh thu từ thuê xe

NiBiGo có thể thu commission hoặc markup từ các dịch vụ vận chuyển.

Ví dụ:

* Xe ghép Hà Nội - Ninh Bình.
* Limousine.
* Xe riêng 4 chỗ.
* Xe riêng 7 chỗ.
* Xe 16 chỗ.
* Thuê xe theo ngày.
* Xe đưa đón sân bay.

### 7.4 Package margin từ combo trọn gói

NiBiGo có thể ghép nhiều dịch vụ thành combo và thu lợi nhuận từ phần chênh lệch giữa giá bán và tổng chi phí net.

Ví dụ combo:

* Combo 2N1Đ cho gia đình.
* Combo cặp đôi nghỉ dưỡng.
* Combo tiết kiệm cho nhóm bạn.
* Combo xe riêng + homestay + tour Tràng An.
* Combo premium resort + xe riêng + trải nghiệm riêng.

### 7.5 Platform fee

NiBiGo có thể thu một khoản phí dịch vụ nhỏ để xử lý booking, hỗ trợ khách và vận hành nền tảng.

Phí này cần được hiển thị minh bạch trong cost breakdown.

### 7.6 Featured listing / promoted partner

Đối tác có thể trả phí để được hiển thị nổi bật trên nền tảng.

Nguyên tắc quan trọng:

* Nếu là nội dung tài trợ, phải gắn nhãn rõ ràng.
* NiBi AI không được âm thầm ưu tiên sản phẩm chỉ vì nhà cung cấp trả phí cao hơn.
* Recommendation của NiBi AI phải ưu tiên độ phù hợp với nhu cầu khách hàng.

### 7.7 Premium concierge service

Trong tương lai, NiBiGo có thể cung cấp gói hỗ trợ cao cấp như:

* Tư vấn lịch trình riêng.
* Hỗ trợ xác nhận nhanh.
* Hỗ trợ trong chuyến đi.
* Hỗ trợ đổi lịch, đổi xe, đổi dịch vụ.
* Gói chăm sóc khách hàng cao cấp cho gia đình hoặc nhóm khách có yêu cầu đặc biệt.

---

## 8. MVP Scope

MVP của NiBiGo AI Travel Platform tập trung vào việc chứng minh rằng một nền tảng du lịch Ninh Bình có thể kết hợp được:

* Discovery.
* AI planning.
* Commerce.
* Google Maps/location.
* Booking workflow.
* Admin operation.

### 8.1 In Scope — Buyer Side

Buyer có thể:

* Đăng ký tài khoản.
* Đăng nhập.
* Xem danh sách tour.
* Xem danh sách homestay/khách sạn.
* Xem danh sách dịch vụ thuê xe.
* Xem danh sách combo/package.
* Xem chi tiết sản phẩm.
* Xem vị trí sản phẩm trên bản đồ.
* Lọc dịch vụ theo loại, giá, tag, phù hợp gia đình/cặp đôi/nhóm bạn.
* Dùng NiBi AI để nhận gợi ý cá nhân hóa.
* Tạo lịch trình từ nhu cầu cá nhân.
* So sánh hoặc xem lý do AI đề xuất.
* Thêm dịch vụ vào cart hoặc itinerary.
* Gửi booking request.
* Nhận mã booking/order.
* Xem trạng thái booking/order.

### 8.2 In Scope — NiBi AI

NiBi AI có thể:

* Hiểu nhu cầu du lịch của khách.
* Hỏi thêm nếu thiếu thông tin quan trọng.
* Gợi ý tour, homestay, khách sạn, thuê xe và combo từ dữ liệu có sẵn.
* Tạo lịch trình theo ngày.
* Giải thích vì sao một lựa chọn phù hợp.
* Cảnh báo nếu lựa chọn vượt ngân sách hoặc cần xác nhận lại availability.
* Hỗ trợ khách chỉnh lịch trình bằng ngôn ngữ tự nhiên.
* Tạo AI sales note cho Sales.

### 8.3 In Scope — Admin Side

Admin có thể:

* Quản lý user.
* Quản lý role.
* Quản lý sản phẩm/dịch vụ.
* Quản lý booking/order.
* Quản lý payment status ở mức MVP.
* Quản lý nội dung.
* Xem analytics cơ bản.
* Cấu hình hệ thống cơ bản.

### 8.4 In Scope — Editor/MOD Side

Editor/MOD có thể:

* Thêm/sửa tour.
* Thêm/sửa homestay/khách sạn.
* Thêm/sửa thuê xe.
* Thêm/sửa trải nghiệm.
* Thêm/sửa combo.
* Thêm/sửa bài viết.
* Upload ảnh.
* Nhập địa chỉ và vị trí Google Maps.
* Gắn tag và danh mục.
* Gửi nội dung chờ duyệt.

### 8.5 In Scope — Sales Side

Sales có thể:

* Xem danh sách booking request/order.
* Xem chi tiết nhu cầu khách.
* Xem dịch vụ và lịch trình AI đề xuất.
* Xem AI sales note.
* Xác nhận availability.
* Ghi chú tư vấn.
* Cập nhật trạng thái booking.
* Gửi yêu cầu thanh toán hoặc hướng dẫn thanh toán ở mức MVP.

### 8.6 In Scope — Google Maps

Google Maps integration trong MVP gồm:

* Hiển thị bản đồ trong trang chi tiết sản phẩm.
* Lưu tọa độ sản phẩm.
* Cho Editor/MOD nhập hoặc chọn vị trí sản phẩm.
* Hiển thị sản phẩm trên bản đồ.
* Hỗ trợ thông tin vị trí trong logic đề xuất của NiBi AI.

### 8.7 In Scope — Commerce

Commerce trong MVP gồm:

* Product detail.
* Cart hoặc selected services.
* Booking request.
* Order record.
* Payment status ở mức demo/sandbox/manual.
* Booking status tracking.
* Cost breakdown.
* Admin/Sales confirmation flow.

---

## 9. Out of Scope for Initial MVP

MVP chưa tập trung vào:

* Đặt vé máy bay.
* Mở rộng toàn Việt Nam.
* Native mobile app.
* Partner portal đầy đủ cho chủ homestay/nhà xe/tour operator.
* Channel manager khách sạn phức tạp.
* Dynamic pricing nâng cao.
* Loyalty/referral system nâng cao.
* Accounting/ERP đầy đủ.
* Multi-language đầy đủ.
* Full CRM automation.
* Zalo OA/Zalo Mini App production integration.

Các tính năng này có thể nằm trong roadmap sau MVP.

---

## 10. Future Roadmap

### Phase 1 — MVP Platform

Mục tiêu: xây nền tảng lõi có AI, sản phẩm, booking, admin dashboard và commerce flow cơ bản.

Bao gồm:

* Buyer flow.
* NiBi AI planning and recommendation.
* Product management.
* Booking request.
* Order/payment status cơ bản.
* Google Maps cơ bản.
* Role-based dashboard.

### Phase 2 — Real Commerce & Operational Readiness

Mục tiêu: nâng hệ thống từ demo commerce lên vận hành thực tế hơn.

Bao gồm:

* Payment gateway thật hoặc sandbox nâng cao.
* Payment link.
* Booking confirmation automation.
* Refund/cancellation flow.
* Email notification.
* Sales assignment.
* Audit logs.
* Better analytics.
* Product availability management.

### Phase 3 — Zalo OA Integration

Mục tiêu: gửi thông báo và chăm sóc khách qua Zalo.

Bao gồm:

* Zalo OA setup.
* ZNS template.
* Booking notification.
* Payment reminder.
* Trip reminder.
* Booking status update.
* Notification logs.
* Consent management.

### Phase 4 — Zalo Mini App

Mục tiêu: cho khách tra cứu booking và nhận hỗ trợ trong hệ sinh thái Zalo.

Bao gồm:

* Zalo Mini App.
* Zalo login.
* Booking lookup.
* Itinerary view.
* Payment/cọc nếu khả thi.
* Follow OA.
* NiBi AI lightweight assistant.

### Phase 5 — Partner & Multi-destination Expansion

Mục tiêu: mở rộng quy mô nền tảng.

Bao gồm:

* Partner portal.
* Multi-destination.
* Advanced availability.
* Partner analytics.
* Campaign management.
* AI-powered upsell/cross-sell.
* Omnichannel CRM.

---

## 11. Key Product Principles

### 11.1 Small Scope, Premium Execution

Dù sản phẩm có tầm nhìn lớn, MVP cần tập trung vào một điểm đến là Ninh Bình và một tập dịch vụ được kiểm soát.

Không mở rộng quá nhanh sang nhiều tỉnh, nhiều loại dịch vụ phức tạp hoặc nhiều đối tác tự quản lý ngay từ đầu.

### 11.2 AI Suggests, System Verifies

NiBi AI có thể đề xuất, giải thích và cá nhân hóa, nhưng hệ thống backend phải kiểm soát dữ liệu quan trọng.

Nguyên tắc:

* AI không tự bịa sản phẩm.
* AI không tự bịa giá.
* AI không tự bịa availability.
* AI không nói đã đặt thành công nếu chưa có booking/order trong database.
* Tổng giá phải được tính bởi backend.
* Booking phải được lưu vào database.

### 11.3 Transparent Pricing

Khách hàng cần thấy rõ:

* Giá từng dịch vụ.
* Tổng giá.
* Phí dịch vụ nếu có.
* Khoản cần xác nhận lại.
* Điều kiện hủy/đổi nếu có.
* Trạng thái booking.

### 11.4 Human-in-the-loop for Travel Operations

Du lịch có nhiều ngoại lệ: hết phòng, đổi ngày, thời tiết, giờ xe, thay đổi lịch trình, đối tác không phản hồi.

Do đó, Sales/Admin cần có vai trò xác nhận và xử lý các trường hợp không thể tự động hóa hoàn toàn.

### 11.5 Local-first Strategy

NiBiGo không cạnh tranh bằng cách trở thành OTA toàn quốc ngay từ đầu. Nền tảng cạnh tranh bằng sự am hiểu địa phương, dữ liệu Ninh Bình, dịch vụ được chọn lọc, lịch trình hợp lý và AI tư vấn cá nhân hóa.

---

## 12. High-level User Journey

### 12.1 Buyer Journey

1. Buyer truy cập nền tảng.
2. Buyer khám phá tour, homestay, khách sạn, thuê xe hoặc combo.
3. Buyer dùng NiBi AI để nhập nhu cầu chuyến đi.
4. NiBi AI gợi ý dịch vụ và/hoặc lịch trình phù hợp.
5. Buyer xem chi tiết, bản đồ, chi phí và lý do đề xuất.
6. Buyer thêm dịch vụ vào cart hoặc chọn combo.
7. Buyer gửi booking request hoặc tạo order.
8. Hệ thống tạo mã booking/order.
9. Sales/Admin xác nhận dịch vụ.
10. Buyer theo dõi trạng thái booking.
11. Sau chuyến đi, Buyer có thể đánh giá hoặc nhận gợi ý dịch vụ tiếp theo.

### 12.2 Sales Journey

1. Sales đăng nhập dashboard.
2. Sales xem booking request/order mới.
3. Sales đọc thông tin khách và nhu cầu.
4. Sales xem AI sales note.
5. Sales xác nhận availability với đối tác.
6. Sales cập nhật trạng thái.
7. Sales gửi báo giá hoặc yêu cầu thanh toán.
8. Sales xác nhận booking.
9. Sales chăm sóc khách trước chuyến đi.

### 12.3 Editor/MOD Journey

1. Editor/MOD đăng nhập dashboard.
2. Editor/MOD tạo hoặc chỉnh sửa sản phẩm.
3. Editor/MOD nhập giá, mô tả, ảnh, tag, vị trí, availability.
4. Editor/MOD tạo hoặc chỉnh sửa bài viết.
5. Editor/MOD gửi nội dung chờ duyệt.
6. Admin duyệt hoặc yêu cầu chỉnh sửa.

### 12.4 Admin Journey

1. Admin đăng nhập dashboard.
2. Admin theo dõi tổng quan nền tảng.
3. Admin quản lý user, role, sản phẩm, booking, order và payment.
4. Admin duyệt nội dung.
5. Admin cấu hình hệ thống.
6. Admin kiểm tra log, analytics và audit trail.

---

## 13. High-level System Architecture

NiBiGo AI Travel Platform bao gồm các thành phần chính:

### 13.1 Frontend

Frontend cung cấp giao diện cho Buyer, Admin, Editor/MOD và Sales.

Công nghệ đề xuất:

* Next.js.
* TypeScript.
* Tailwind CSS.
* shadcn/ui hoặc component system tương đương.

### 13.2 Backend

Backend xử lý logic nghiệp vụ, API, phân quyền, booking, order, payment status, AI orchestration và tích hợp bên ngoài.

Công nghệ đề xuất:

* Next.js full-stack.
* Server Actions hoặc API Routes.
* Có thể tách backend service riêng trong giai đoạn sau.

### 13.3 Database & Auth

Database và authentication dùng để lưu user, role, sản phẩm, booking, order, nội dung, AI logs và payment status.

Công nghệ đề xuất:

* Supabase Auth.
* Supabase Postgres.
* Supabase Storage.

### 13.4 AI Layer

AI Layer xử lý NiBi AI.

Nhiệm vụ:

* Intent understanding.
* Recommendation explanation.
* Itinerary generation.
* Tour/service refinement.
* Sales note generation.
* RAG over product/content knowledge base.

### 13.5 Commerce Layer

Commerce Layer xử lý:

* Product.
* Cart.
* Order.
* Booking.
* Payment status.
* Cost breakdown.
* Booking status.

### 13.6 Maps Layer

Maps Layer xử lý:

* Google Maps display.
* Place data.
* Coordinates.
* Location selection.
* Distance/travel-time support in future phases.

### 13.7 Notification Layer

Notification Layer trong MVP có thể bắt đầu bằng in-app/email. Sau MVP mở rộng sang Zalo OA, ZNS và Zalo Mini App.

---

## 14. Key Success Metrics

### 14.1 Business Metrics

* Số lượng buyer đăng ký.
* Số lượng booking request.
* Số lượng order được tạo.
* Tỷ lệ booking request được Sales liên hệ.
* Tỷ lệ booking được xác nhận.
* Giá trị booking trung bình.
* Doanh thu từ commission/markup/platform fee.
* Tỷ lệ khách quay lại.

### 14.2 Product Metrics

* Tỷ lệ hoàn thành trip request form.
* Tỷ lệ buyer dùng NiBi AI.
* Tỷ lệ buyer chọn sản phẩm từ gợi ý của NiBi AI.
* Tỷ lệ buyer thêm dịch vụ vào cart.
* Tỷ lệ buyer gửi booking request sau khi xem proposal.
* Thời gian trung bình để tạo lịch trình/gợi ý.
* Tỷ lệ lỗi khi tạo AI recommendation.

### 14.3 Operation Metrics

* Thời gian Sales phản hồi booking request.
* Tỷ lệ booking cần xác nhận lại.
* Tỷ lệ booking bị hủy.
* Số booking theo trạng thái.
* Số sản phẩm active/inactive.
* Số sản phẩm thiếu dữ liệu vị trí/ảnh/giá.

### 14.4 AI Quality Metrics

* Tỷ lệ AI đề xuất sản phẩm có thật trong database.
* Tỷ lệ giá hiển thị đúng với backend.
* Tỷ lệ recommendation phù hợp với ngân sách.
* Tỷ lệ recommendation phù hợp với sở thích.
* Tỷ lệ AI cần hỏi lại vì thiếu thông tin.
* Tỷ lệ hallucination hoặc vi phạm business rules.
* Đánh giá hữu ích từ Sales về AI sales note.

---

## 15. Risks & Constraints

### 15.1 Scope Creep

Rủi ro lớn nhất là mở rộng quá nhiều tính năng cùng lúc: tour, khách sạn, homestay, thuê xe, payment, Google Maps, AI, Zalo, admin dashboard và CMS.

Giải pháp:

* Chia phase rõ ràng.
* MVP tập trung vào một điểm đến.
* Dữ liệu dịch vụ được curate.
* Không mở partner portal ngay.
* Không làm dynamic pricing phức tạp trong bản đầu.

### 15.2 Data Accuracy

Nếu dữ liệu sản phẩm sai, NiBi AI có thể đưa ra đề xuất sai.

Giải pháp:

* Product data phải có trạng thái `is_active`.
* Availability phải có trạng thái rõ.
* Giá cuối cùng do backend tính.
* Editor/MOD nhập dữ liệu, Admin duyệt.
* Có audit log khi thay đổi giá hoặc trạng thái sản phẩm.

### 15.3 AI Hallucination

AI có thể bịa sản phẩm, giá, trạng thái hoặc cam kết booking.

Giải pháp:

* AI chỉ được đề xuất từ product candidates do backend cung cấp.
* Structured output.
* Business rules rõ.
* Post-processing validation.
* Log AI output.
* Fallback khi AI không đủ dữ liệu.

### 15.4 Booking Reliability

Booking thật cần xác nhận với đối tác, nhất là homestay, khách sạn và tour riêng.

Giải pháp:

* Phân biệt instant booking và request-to-book.
* Dùng Sales làm human-in-the-loop.
* Hiển thị rõ trạng thái “cần xác nhận”.
* Không cam kết dịch vụ khi chưa xác nhận.

### 15.5 Payment & Refund Complexity

Thanh toán thật kéo theo hoàn tiền, đối soát, khiếu nại và chính sách hủy.

Giải pháp:

* MVP bắt đầu với payment status demo/manual/sandbox.
* Thiết kế database sẵn cho payment thật.
* Sau MVP mới tích hợp payment gateway production.

### 15.6 Operational Load

Nếu booking tăng, Sales/Admin có thể bị quá tải.

Giải pháp:

* AI sales note.
* Lead summary.
* Status workflow rõ.
* Filter/sort booking.
* Notification automation trong roadmap.

---

## 16. Assumptions

* NiBiGo sẽ bắt đầu với điểm đến Ninh Bình.
* Sản phẩm/dịch vụ ban đầu là dữ liệu mẫu hoặc dữ liệu được NiBiGo tự quản lý.
* Booking trong MVP có thể là request-to-book hoặc commerce flow có payment status demo/manual.
* Google Maps API được đưa vào scope ở mức hiển thị vị trí và hỗ trợ nhập tọa độ.
* Zalo OA/Zalo Mini App là roadmap sau MVP, chưa bắt buộc trong MVP đầu tiên.
* WordPress hiện tại tiếp tục hoạt động như website thương hiệu/nội dung.
* App mới được deploy độc lập, không phụ thuộc kỹ thuật vào WordPress.

---

## 17. Dependencies

Các phụ thuộc chính:

* Supabase cho auth, database, storage.
* Vercel cho deploy.
* OpenAI hoặc Gemini cho AI.
* Google Maps Platform cho maps/location.
* Payment gateway hoặc mock/sandbox payment cho commerce.
* Zalo OA/ZNS/Zalo Mini App trong future roadmap.
* Dữ liệu sản phẩm du lịch Ninh Bình.
* Quy trình vận hành Sales/Admin.

---

## 18. Initial Deliverables

Bộ deliverable ban đầu gồm:

1. Business Analysis documents.
2. Product Requirements Document.
3. Database schema.
4. Seed data for products and content.
5. Buyer-facing web app.
6. NiBi AI assistant.
7. Admin/Editor/Sales dashboard.
8. Booking/order workflow.
9. Google Maps integration.
10. Commerce flow at MVP level.
11. Deployment on public URL.
12. Demo script and test cases.

---

## 19. One-line Pitch

**NiBiGo AI Travel Platform là nền tảng du lịch Ninh Bình tích hợp NiBi AI, giúp khách hàng khám phá, cá nhân hóa và đặt tour, homestay, khách sạn, thuê xe, trải nghiệm địa phương và combo trọn gói một cách minh bạch, thuận tiện và đáng tin cậy.**

---

## 20. Short Description

NiBiGo AI Travel Platform is an AI-enabled travel commerce platform for Ninh Binh. It allows buyers to discover, compare and book travel services such as tours, homestays, hotels, transportation, local experiences and travel packages. NiBi AI acts as a personalized travel assistant that understands user preferences, budget, travel dates, group type and location needs to recommend suitable services and itineraries. The platform includes role-based dashboards for Admin, Editor/Mod, Sales and Buyer, with future expansion toward real payment, Zalo OA, Zalo Mini App, partner portal and multi-destination support.
