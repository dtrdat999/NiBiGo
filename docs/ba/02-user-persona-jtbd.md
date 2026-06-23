# 02. User Persona & Jobs-to-be-Done — NiBiGo AI Travel Platform

**Project name:** NiBiGo AI Travel Platform
**AI assistant name:** NiBi AI
**Document type:** User Persona & JTBD Analysis
**Version:** v1.0
**Status:** Draft
**Owner:** Đặng Trần Đạt
**Last updated:** 2026-06-22

---

## 1. Document Purpose

Tài liệu này mô tả các nhóm người dùng chính của NiBiGo AI Travel Platform và phân tích nhu cầu của họ theo phương pháp **Jobs-to-be-Done (JTBD)**.

Mục tiêu của tài liệu là làm rõ:

* Người dùng chính của nền tảng là ai.
* Họ đang gặp vấn đề gì trong quá trình tìm kiếm, lập kế hoạch và đặt dịch vụ du lịch.
* Họ cần hoàn thành “job” gì khi sử dụng NiBiGo.
* Họ đánh giá một trải nghiệm du lịch thành công bằng tiêu chí nào.
* NiBiGo và NiBi AI cần hỗ trợ họ ở những điểm nào.
* Các insight này sẽ ảnh hưởng thế nào đến thiết kế sản phẩm, AI, commerce flow và dashboard vận hành.

Trong tài liệu này, **JTBD** được hiểu là “công việc cốt lõi mà người dùng muốn hoàn thành”, không chỉ là hành động họ đang làm trên giao diện.

---

## 2. JTBD Perspective

NiBiGo không nên chỉ nhìn người dùng là “người muốn đặt tour” hoặc “người hỏi chatbot”. Cách nhìn đó quá hẹp.

Người dùng thực sự không mua chatbot, không mua form booking và cũng không chỉ mua một tour đơn lẻ. Họ đang cố hoàn thành một công việc lớn hơn:

**Tổ chức một chuyến đi Ninh Bình phù hợp, rõ ràng, đáng tin và ít rủi ro nhất có thể.**

Vì vậy, NiBiGo cần nhìn thị trường theo “job” mà khách muốn hoàn thành:

* Khách muốn chọn đúng dịch vụ.
* Khách muốn biết tổng chi phí.
* Khách muốn lịch trình hợp lý.
* Khách muốn giảm rủi ro đặt nhầm.
* Khách muốn tiết kiệm thời gian tìm kiếm.
* Khách muốn có người hoặc hệ thống hỗ trợ khi cần xác nhận.

NiBi AI đóng vai trò hỗ trợ phần ra quyết định, còn commerce platform hỗ trợ phần đặt dịch vụ và vận hành.

---

## 3. Core Job-to-be-Done

### 3.1 Core Functional Job

**Khi tôi muốn đi du lịch Ninh Bình nhưng không muốn tự tìm kiếm và ghép từng dịch vụ rời rạc, tôi muốn một nền tảng giúp tôi chọn, so sánh và đặt tour, nơi ở, xe di chuyển, trải nghiệm và combo phù hợp, để tôi có thể tổ chức chuyến đi nhanh hơn, rõ chi phí hơn và yên tâm hơn.**

### 3.2 Emotional Job

Người dùng muốn cảm thấy:

* Yên tâm vì lựa chọn của mình hợp lý.
* Không bị “hớ” về giá.
* Không sợ đặt nhầm dịch vụ.
* Không lo lịch trình quá mệt hoặc không phù hợp.
* Có cảm giác được tư vấn như có một người hiểu nhu cầu của mình.
* Tin rằng nếu có vấn đề thì có người hỗ trợ.

### 3.3 Social Job

Người dùng muốn:

* Đưa ra quyết định tốt trước gia đình, người yêu, bạn bè hoặc nhóm đi cùng.
* Trở thành người biết tổ chức chuyến đi.
* Có một lịch trình nhìn chuyên nghiệp, rõ ràng để chia sẻ cho người đi cùng.
* Tránh bị đánh giá là chọn dịch vụ kém, lịch trình bất tiện hoặc chi phí không hợp lý.

---

## 4. Primary User Groups

NiBiGo AI Travel Platform có 4 nhóm người dùng chính:

1. **BUYER** — khách hàng cuối tìm kiếm, lập kế hoạch và đặt dịch vụ.
2. **SALES** — người xử lý lead, xác nhận dịch vụ và chăm sóc khách.
3. **EDITOR/MOD** — người quản lý dữ liệu sản phẩm, bài viết và nội dung.
4. **ADMIN** — người quản trị toàn bộ nền tảng.

Trong đó, **BUYER** là nhóm người dùng trung tâm của sản phẩm. Các role còn lại tồn tại để giúp nền tảng vận hành, kiểm soát dữ liệu và chuyển nhu cầu của Buyer thành booking/order thực tế.

---

# PART A — BUYER PERSONAS

---

## 5. Buyer Persona 1 — Family Planner

### 5.1 Persona Summary

**Tên đại diện:** Chị Lan
**Độ tuổi:** 30–42
**Nhóm khách:** Gia đình có trẻ nhỏ hoặc người lớn tuổi
**Khu vực:** Hà Nội hoặc các tỉnh lân cận
**Nhu cầu:** Đi Ninh Bình 2 ngày 1 đêm hoặc cuối tuần
**Mức chi tiêu:** Trung bình đến khá
**Độ nhạy cảm về rủi ro:** Cao

### 5.2 Context

Chị Lan muốn tổ chức chuyến đi Ninh Bình cho gia đình. Nhóm có thể gồm vợ chồng, con nhỏ và ông bà. Chị cần lịch trình nhẹ nhàng, an toàn, không quá mệt, chỗ ở sạch sẽ, xe thoải mái và chi phí rõ ràng.

Chị không muốn mất nhiều thời gian hỏi từng nơi, nhưng cũng không muốn chọn bừa một tour đại trà không phù hợp với trẻ em hoặc người lớn tuổi.

### 5.3 Goals

* Tìm lịch trình phù hợp cho gia đình.
* Chọn homestay/khách sạn sạch, tiện, an toàn.
* Có phương tiện di chuyển thoải mái.
* Biết rõ tổng chi phí.
* Tránh hoạt động quá mệt như leo nhiều, đi quá dày.
* Có người xác nhận và hỗ trợ nếu phát sinh vấn đề.

### 5.4 Pain Points

* Không biết điểm nào phù hợp với trẻ em/người lớn tuổi.
* Sợ lịch trình quá dày.
* Sợ đặt homestay không đúng như ảnh.
* Sợ phát sinh chi phí.
* Khó tự so sánh các lựa chọn.
* Phải hỏi nhiều bên khác nhau: xe, phòng, tour, ăn uống.
* Không có thời gian tự lên lịch trình chi tiết.

### 5.5 Buying Triggers

* Có dịp cuối tuần hoặc kỳ nghỉ ngắn.
* Muốn đưa gia đình đi đổi gió.
* Thấy bài viết/video về Ninh Bình.
* Có ưu đãi combo gia đình.
* Được NiBi AI gợi ý lịch trình rõ ràng, nhẹ nhàng, phù hợp trẻ nhỏ.

### 5.6 Decision Criteria

Chị Lan sẽ chọn dịch vụ nếu:

* Giá rõ ràng.
* Lịch trình không quá mệt.
* Có xe đưa đón tiện.
* Chỗ ở phù hợp gia đình.
* Có review/ảnh đáng tin.
* Có bản đồ vị trí.
* Có người xác nhận lại booking.
* Có thể xem trạng thái booking sau khi đặt.

### 5.7 Job Story

**Khi tôi muốn đưa gia đình đi Ninh Bình cuối tuần nhưng có trẻ nhỏ hoặc người lớn tuổi, tôi muốn một nền tảng giúp tôi chọn lịch trình nhẹ nhàng, chỗ ở phù hợp và xe di chuyển tiện lợi, để cả gia đình có chuyến đi thoải mái mà tôi không phải tự lo từng chi tiết.**

### 5.8 How NiBiGo Helps

NiBiGo cần hỗ trợ persona này bằng:

* Bộ lọc “phù hợp gia đình”.
* Tags như `family`, `kids`, `elderly-friendly`, `relaxing`.
* NiBi AI gợi ý lịch trình nhẹ.
* Cảnh báo hoạt động cần leo nhiều hoặc di chuyển nhiều.
* Combo gia đình gồm xe + chỗ ở + hoạt động nhẹ.
* Cost breakdown minh bạch.
* Sales note cho nhân viên tư vấn.
* Zalo notification trong phase sau để nhắc lịch và gửi thông tin điểm đón.

---

## 6. Buyer Persona 2 — Couple Experience Seeker

### 6.1 Persona Summary

**Tên đại diện:** Minh & An
**Độ tuổi:** 22–32
**Nhóm khách:** Cặp đôi
**Khu vực:** Hà Nội, Hải Phòng, Nam Định hoặc khách du lịch nội địa
**Nhu cầu:** Đi nghỉ dưỡng, chụp ảnh, trải nghiệm đẹp
**Mức chi tiêu:** Trung bình đến cao
**Độ nhạy cảm về trải nghiệm:** Cao

### 6.2 Context

Minh và An muốn đi Ninh Bình để nghỉ ngơi, chụp ảnh và có trải nghiệm lãng mạn. Họ không nhất thiết chọn gói rẻ nhất, nhưng muốn cảm thấy đáng tiền. Họ quan tâm đến homestay đẹp, boutique hotel, view thiên nhiên, lịch trình không quá đại trà và trải nghiệm có tính riêng tư.

### 6.3 Goals

* Tìm nơi ở đẹp, có view hoặc thiết kế tốt.
* Có lịch trình phù hợp để chụp ảnh.
* Có trải nghiệm lãng mạn hoặc riêng tư.
* Biết địa điểm nào gần nhau.
* Không phải tự ghép lịch trình.
* Có thể đặt combo tiện lợi.

### 6.4 Pain Points

* Khó biết ảnh homestay có thật không.
* Không biết điểm nào đẹp theo mùa/thời điểm.
* Khó so sánh nơi ở theo vị trí và trải nghiệm.
* Tour đại trà có thể không phù hợp.
* Không muốn lịch trình quá đông hoặc quá vội.
* Sợ combo không đáng tiền.

### 6.5 Buying Triggers

* Kỷ niệm, sinh nhật, cuối tuần.
* Muốn có ảnh đẹp ở Ninh Bình.
* Thấy nội dung review homestay hoặc địa điểm đẹp.
* Nhận được gợi ý “couple package” từ NiBi AI.
* Có ưu đãi combo cặp đôi.

### 6.6 Decision Criteria

Cặp đôi sẽ chọn dịch vụ nếu:

* Hình ảnh hấp dẫn.
* Vị trí thuận tiện.
* Có trải nghiệm khác biệt.
* Giá hợp lý so với cảm nhận giá trị.
* Có itinerary đẹp, không quá mệt.
* Có lựa chọn nâng cấp.
* Có review hoặc mô tả đáng tin.

### 6.7 Job Story

**Khi tôi muốn đi Ninh Bình cùng người yêu để nghỉ ngơi và có trải nghiệm đẹp, tôi muốn một nền tảng giúp tôi chọn nơi ở, hoạt động và lịch trình phù hợp với phong cách của hai người, để chuyến đi đáng nhớ mà không cần tự tìm quá nhiều nguồn.**

### 6.8 How NiBiGo Helps

NiBiGo cần hỗ trợ persona này bằng:

* Tags như `couple`, `photo`, `premium`, `relaxing`, `nature`.
* Gợi ý boutique hotel, resort, dinner set, tour chụp ảnh.
* Bản đồ vị trí giữa nơi ở và điểm tham quan.
* Combo cặp đôi.
* Lịch trình có thời gian nghỉ.
* NiBi AI giải thích vì sao lựa chọn phù hợp với cặp đôi.
* Upsell hợp lý: phòng đẹp hơn, xe riêng, dinner set, trải nghiệm riêng.

---

## 7. Buyer Persona 3 — Budget Group Traveler

### 7.1 Persona Summary

**Tên đại diện:** Huy
**Độ tuổi:** 18–28
**Nhóm khách:** Nhóm bạn, sinh viên, người trẻ mới đi làm
**Khu vực:** Hà Nội và các tỉnh miền Bắc
**Nhu cầu:** Đi vui, tiết kiệm, nhiều trải nghiệm
**Mức chi tiêu:** Thấp đến trung bình
**Độ nhạy cảm về giá:** Cao

### 7.2 Context

Huy đi Ninh Bình cùng nhóm bạn 4–8 người. Nhóm muốn đi nhiều điểm, chụp ảnh, ăn đặc sản nhưng vẫn tối ưu chi phí. Họ có thể chấp nhận homestay đơn giản, xe ghép hoặc phương án tiết kiệm nếu tổng giá hợp lý.

### 7.3 Goals

* Tối ưu chi phí.
* Đi được nhiều điểm nổi bật.
* Có lịch trình vui, năng động.
* Biết mỗi người cần trả bao nhiêu.
* Dễ chia sẻ lịch trình với nhóm.
* Có lựa chọn xe phù hợp số người.

### 7.4 Pain Points

* Khó thống nhất với nhóm.
* Không biết chia chi phí thế nào.
* Ngại bị phát sinh.
* Không biết đi xe ghép hay thuê xe riêng.
* Không rõ điểm nào đáng đi nhất nếu thời gian ngắn.
* Dễ bỏ cuộc nếu form đặt quá phức tạp.

### 7.5 Buying Triggers

* Nhóm bạn rủ đi cuối tuần.
* Thấy lịch trình mẫu giá tốt.
* Có combo tiết kiệm.
* Có hiển thị chi phí/người.
* NiBi AI tạo lịch trình nhanh và dễ chia sẻ.

### 7.6 Decision Criteria

Nhóm này sẽ chọn dịch vụ nếu:

* Giá tổng và giá/người rõ.
* Có lựa chọn tiết kiệm.
* Lịch trình nhiều điểm nổi bật.
* Dễ đặt.
* Không cần cọc quá cao.
* Có thể chia sẻ cho nhóm xem.

### 7.7 Job Story

**Khi nhóm bạn của tôi muốn đi Ninh Bình với ngân sách giới hạn, tôi muốn một nền tảng giúp ghép lịch trình, chỗ ở và phương tiện tiết kiệm, để cả nhóm biết rõ chi phí mỗi người và dễ thống nhất đặt chuyến đi.**

### 7.8 How NiBiGo Helps

NiBiGo cần hỗ trợ persona này bằng:

* Hiển thị giá/người.
* Gói Budget Package.
* Bộ lọc giá thấp.
* Xe ghép hoặc xe chia theo nhóm.
* Homestay tiết kiệm.
* Lịch trình nhiều điểm nổi bật.
* Tính năng chia sẻ itinerary.
* NiBi AI gợi ý phương án giảm ngân sách.

---

## 8. Buyer Persona 4 — Convenience-first Traveler

### 8.1 Persona Summary

**Tên đại diện:** Anh Quân
**Độ tuổi:** 28–45
**Nhóm khách:** Người bận rộn, khách đi ngắn ngày, khách ít thời gian tự tìm hiểu
**Khu vực:** Hà Nội, TP.HCM hoặc khách công tác kết hợp du lịch
**Nhu cầu:** Đặt nhanh, ít phải suy nghĩ, có người hỗ trợ
**Mức chi tiêu:** Trung bình đến cao
**Độ nhạy cảm về thời gian:** Cao

### 8.2 Context

Anh Quân không muốn tự nghiên cứu quá nhiều. Anh cần một giải pháp nhanh: nhập vài thông tin, nhận gợi ý hợp lý, xem tổng chi phí, đặt hoặc gửi yêu cầu xác nhận. Anh sẵn sàng trả thêm nếu dịch vụ tiện, rõ ràng và tiết kiệm thời gian.

### 8.3 Goals

* Ra quyết định nhanh.
* Có combo trọn gói.
* Có xe, chỗ ở, tour trong cùng một flow.
* Không phải chat qua nhiều bên.
* Có sales xác nhận.
* Có thông báo trạng thái.

### 8.4 Pain Points

* Không có thời gian so sánh nhiều.
* Ghét quy trình đặt dịch vụ rườm rà.
* Không muốn hỏi từng bên.
* Cần sự chắc chắn.
* Không muốn phải nhớ nhiều thông tin booking.

### 8.5 Buying Triggers

* Có chuyến đi đột xuất.
* Có nhu cầu nghỉ ngắn ngày.
* Cần đặt nhanh cho gia đình/đối tác/bạn bè.
* NiBi AI đề xuất combo rõ ràng trong vài phút.

### 8.6 Decision Criteria

Anh Quân sẽ chọn dịch vụ nếu:

* Flow đặt nhanh.
* Có combo trọn gói.
* Có thông tin rõ.
* Có hỗ trợ người thật.
* Có xác nhận booking.
* Có thông báo sau khi đặt.

### 8.7 Job Story

**Khi tôi muốn đặt nhanh một chuyến đi Ninh Bình mà không có thời gian tự tìm từng dịch vụ, tôi muốn một nền tảng gợi ý combo phù hợp và xử lý booking rõ ràng, để tôi tiết kiệm thời gian mà vẫn yên tâm về chất lượng.**

### 8.8 How NiBiGo Helps

NiBiGo cần hỗ trợ persona này bằng:

* Quick trip request form.
* Combo/package nổi bật.
* NiBi AI hỏi ít nhưng đúng trọng tâm.
* “Recommended for you” rõ ràng.
* One-click booking request.
* Sales follow-up nhanh.
* Zalo notification trong phase sau.
* Payment link trong phase commerce thật.

---

# PART B — INTERNAL USER PERSONAS

---

## 9. Sales Persona — Travel Sales Consultant

### 9.1 Persona Summary

**Tên đại diện:** Mai
**Role:** SALES
**Mục tiêu:** Chuyển booking request/order thành booking được xác nhận
**Tần suất sử dụng:** Hằng ngày
**Độ phụ thuộc vào hệ thống:** Cao

### 9.2 Context

Sales nhận nhiều khách hỏi tour, chỗ ở, xe và combo qua website, Facebook, Zalo hoặc điện thoại. Nếu thông tin khách rời rạc, Sales phải hỏi lại nhiều lần. Điều này làm tăng thời gian phản hồi và giảm tỷ lệ chốt.

NiBiGo cần giúp Sales nhận lead có cấu trúc rõ hơn.

### 9.3 Goals

* Xem nhanh khách cần gì.
* Biết khách thuộc nhóm nào.
* Biết ngân sách, ngày đi, số người.
* Xem dịch vụ khách quan tâm.
* Xem AI sales note.
* Ghi chú tư vấn.
* Cập nhật trạng thái booking.
* Xác nhận availability.
* Gửi báo giá hoặc yêu cầu thanh toán.

### 9.4 Pain Points

* Lead thiếu thông tin.
* Khách hỏi nhiều nhưng chưa rõ nhu cầu.
* Phải kiểm tra nhiều nguồn.
* Khó nhớ lịch sử trao đổi.
* Khó ưu tiên lead nóng.
* Mất thời gian tạo báo giá thủ công.

### 9.5 Job Story

**Khi tôi nhận một booking request mới, tôi muốn thấy ngay nhu cầu, ngân sách, dịch vụ khách quan tâm và gợi ý tư vấn từ AI, để tôi phản hồi nhanh hơn và tăng khả năng chốt booking.**

### 9.6 How NiBiGo Helps

NiBiGo cần hỗ trợ Sales bằng:

* Booking dashboard.
* Lead summary.
* AI sales note.
* Booking status pipeline.
* Ghi chú tư vấn.
* Lịch sử trạng thái.
* Filter theo trạng thái, ngày đi, giá trị đơn.
* Cảnh báo booking cần xác nhận gấp.
* Payment request trong phase sau.

### 9.7 Success Criteria

Sales thành công khi:

* Phản hồi khách nhanh hơn.
* Ít phải hỏi lại thông tin cơ bản.
* Tăng tỷ lệ booking confirmed.
* Có dữ liệu rõ để tư vấn.
* Có lịch sử xử lý lead.
* Giảm lỗi trong quá trình xác nhận dịch vụ.

---

## 10. Editor/MOD Persona — Content & Product Operator

### 10.1 Persona Summary

**Tên đại diện:** Linh
**Role:** EDITOR/MOD
**Mục tiêu:** Quản lý dữ liệu sản phẩm và nội dung chất lượng
**Tần suất sử dụng:** Hằng ngày hoặc vài lần/tuần
**Độ phụ thuộc vào hệ thống:** Trung bình đến cao

### 10.2 Context

Editor/MOD chịu trách nhiệm đưa dữ liệu dịch vụ lên nền tảng. Nếu dữ liệu không đủ tốt, Buyer khó tin tưởng và NiBi AI khó đề xuất chính xác.

Editor/MOD cần công cụ dễ dùng để tạo tour, homestay, khách sạn, xe, combo, bài viết và thông tin vị trí.

### 10.3 Goals

* Tạo sản phẩm nhanh.
* Nhập thông tin chuẩn.
* Upload ảnh.
* Nhập giá, availability, tags.
* Gắn vị trí Google Maps.
* Tạo bài viết SEO/guide.
* Gửi nội dung chờ duyệt.
* Sửa thông tin khi có thay đổi.

### 10.4 Pain Points

* Form nhập liệu quá dài hoặc khó hiểu.
* Không biết field nào bắt buộc.
* Dữ liệu sản phẩm không thống nhất.
* Khó nhập vị trí chính xác.
* Không có trạng thái duyệt rõ ràng.
* Không biết sản phẩm thiếu dữ liệu gì.

### 10.5 Job Story

**Khi tôi cần đưa một dịch vụ du lịch lên nền tảng, tôi muốn có form nhập liệu rõ ràng, có tag, ảnh, giá, vị trí và trạng thái duyệt, để sản phẩm đủ thông tin cho Buyer xem và NiBi AI có thể đề xuất chính xác.**

### 10.6 How NiBiGo Helps

NiBiGo cần hỗ trợ Editor/MOD bằng:

* Product management dashboard.
* Content management dashboard.
* Form theo từng loại sản phẩm.
* Required field validation.
* Google Maps location picker.
* Tag system.
* Image upload.
* Draft/pending/published status.
* Data completeness indicator.
* Admin approval workflow.

### 10.7 Success Criteria

Editor/MOD thành công khi:

* Tạo sản phẩm nhanh hơn.
* Dữ liệu sản phẩm đầy đủ hơn.
* Ít lỗi nhập liệu.
* Sản phẩm có ảnh, giá, vị trí, tags.
* Nội dung được duyệt và publish dễ dàng.
* NiBi AI có dữ liệu tốt để sử dụng.

---

## 11. Admin Persona — Platform Owner

### 11.1 Persona Summary

**Tên đại diện:** Admin NiBiGo
**Role:** ADMIN
**Mục tiêu:** Quản trị toàn bộ nền tảng, dữ liệu, vận hành và tăng trưởng
**Tần suất sử dụng:** Hằng ngày hoặc định kỳ
**Độ phụ thuộc vào hệ thống:** Rất cao

### 11.2 Context

Admin cần nhìn toàn cảnh nền tảng: người dùng, sản phẩm, booking, order, payment status, nội dung, AI logs và vận hành Sales/Editor.

Admin không chỉ quản trị kỹ thuật mà còn kiểm soát chất lượng kinh doanh.

### 11.3 Goals

* Quản lý user và role.
* Quản lý sản phẩm.
* Duyệt nội dung.
* Theo dõi booking/order.
* Theo dõi doanh thu/GMV.
* Kiểm soát payment status.
* Kiểm soát AI logs.
* Cấu hình hệ thống.
* Quản lý rủi ro vận hành.
* Xem báo cáo.

### 11.4 Pain Points

* Không biết sản phẩm nào thiếu dữ liệu.
* Không biết booking nào đang bị kẹt.
* Không có dashboard tổng quan.
* Không kiểm soát được role.
* Không biết AI có đang đề xuất sai không.
* Không có log khi có lỗi vận hành.

### 11.5 Job Story

**Khi tôi vận hành NiBiGo, tôi muốn có một dashboard cho phép kiểm soát user, role, sản phẩm, booking, order, payment, nội dung và AI logs, để đảm bảo nền tảng hoạt động ổn định, minh bạch và có thể mở rộng.**

### 11.6 How NiBiGo Helps

NiBiGo cần hỗ trợ Admin bằng:

* Admin dashboard.
* User/role management.
* Product approval.
* Booking/order management.
* Payment status management.
* Analytics.
* Audit logs.
* AI logs.
* System settings.
* Data quality overview.

### 11.7 Success Criteria

Admin thành công khi:

* Kiểm soát được toàn bộ nền tảng.
* Dữ liệu sản phẩm đáng tin.
* Booking/order không bị thất lạc.
* Role phân quyền rõ ràng.
* AI được giám sát.
* Có số liệu để ra quyết định.
* Có thể mở rộng sản phẩm sau MVP.

---

# PART C — USER NEEDS & OPPORTUNITY AREAS

---

## 12. Buyer Needs

### 12.1 Functional Needs

Buyer cần:

* Tìm dịch vụ.
* Lọc dịch vụ.
* Xem chi tiết sản phẩm.
* Xem vị trí.
* So sánh lựa chọn.
* Nhận đề xuất từ AI.
* Tạo lịch trình.
* Xem cost breakdown.
* Đặt dịch vụ.
* Theo dõi trạng thái booking.

### 12.2 Emotional Needs

Buyer cần cảm thấy:

* Tin tưởng.
* Không bị rối.
* Không bị ép mua.
* Không sợ chọn sai.
* Có quyền kiểm soát quyết định.
* Có người/hệ thống hỗ trợ.

### 12.3 Social Needs

Buyer cần:

* Chia sẻ lựa chọn với người đi cùng.
* Có lịch trình rõ để gửi cho nhóm/gia đình.
* Chứng minh lựa chọn của mình hợp lý.
* Tránh bị phàn nàn vì chọn dịch vụ không phù hợp.

---

## 13. Buyer Decision Journey

### Stage 1 — Awareness

Buyer biết đến NiBiGo qua:

* Website.
* SEO.
* Blog.
* Social media.
* Referral.
* Zalo.
* Nội dung về Ninh Bình.

Nhu cầu ở stage này:

* Hiểu NiBiGo là gì.
* Thấy dịch vụ đáng tin.
* Có lý do để thử NiBi AI.

### Stage 2 — Exploration

Buyer bắt đầu xem:

* Tour.
* Homestay.
* Khách sạn.
* Thuê xe.
* Combo.
* Bài viết.

Nhu cầu ở stage này:

* Tìm kiếm dễ.
* Bộ lọc rõ.
* Giá minh bạch.
* Ảnh đẹp.
* Bản đồ vị trí.
* Tag phù hợp.

### Stage 3 — Personalization

Buyer dùng NiBi AI hoặc form để nhập nhu cầu.

Nhu cầu ở stage này:

* AI hỏi đúng thông tin.
* Không hỏi quá dài.
* Có gợi ý phù hợp.
* Có giải thích dễ hiểu.
* Có thể chỉnh đề xuất.

### Stage 4 — Decision

Buyer so sánh và chọn dịch vụ/combo.

Nhu cầu ở stage này:

* Biết vì sao nên chọn.
* Biết giá cuối.
* Biết dịch vụ nào cần xác nhận.
* Biết chính sách cơ bản.
* Có thể hỏi thêm.

### Stage 5 — Booking

Buyer gửi booking request hoặc tạo order.

Nhu cầu ở stage này:

* Quy trình đơn giản.
* Có mã booking/order.
* Có trạng thái rõ.
* Có người xác nhận.
* Có thông báo sau khi đặt.

### Stage 6 — Pre-trip Support

Buyer cần thông tin trước chuyến đi.

Nhu cầu ở stage này:

* Lịch trình cuối cùng.
* Điểm đón.
* Giờ đón.
* Thông tin liên hệ.
* Trạng thái thanh toán.
* Nhắc lịch.

### Stage 7 — Post-trip

Buyer có thể:

* Đánh giá dịch vụ.
* Nhận voucher.
* Đặt lại dịch vụ.
* Giới thiệu bạn bè.

---

## 14. Opportunity Areas

### 14.1 AI-guided Decision Making

Cơ hội: giúp Buyer ra quyết định nhanh hơn bằng AI.

Tính năng liên quan:

* NiBi AI recommendation.
* Tour/service explanation.
* Package comparison.
* Budget adjustment.
* Itinerary refinement.

### 14.2 Transparent Travel Commerce

Cơ hội: tạo niềm tin bằng chi phí rõ ràng.

Tính năng liên quan:

* Cost breakdown.
* Price per person.
* Platform fee visibility.
* Booking status.
* Payment status.

### 14.3 Location-aware Planning

Cơ hội: dùng vị trí để tạo lịch trình hợp lý hơn.

Tính năng liên quan:

* Google Maps.
* Nearby attractions.
* Route/time estimation.
* Location-based filtering.
* Map-based product discovery.

### 14.4 Human-assisted Booking

Cơ hội: kết hợp AI và Sales để xử lý thực tế du lịch.

Tính năng liên quan:

* Sales dashboard.
* AI sales note.
* Request-to-book.
* Availability confirmation.
* Booking status pipeline.

### 14.5 Local-first Content & SEO

Cơ hội: xây lợi thế nội dung địa phương.

Tính năng liên quan:

* Destination guides.
* Blog articles.
* Itinerary templates.
* Experience content.
* RAG knowledge base for NiBi AI.

### 14.6 Post-booking Engagement

Cơ hội: dùng Zalo OA/Mini App sau MVP để giữ liên lạc.

Tính năng liên quan:

* Booking notification.
* Payment reminder.
* Trip reminder.
* Itinerary lookup.
* Review request.
* Voucher/retention.

---

# PART D — JTBD MAPPING TO FEATURES

---

## 15. JTBD to Feature Mapping

| User Job                 | User Need                    | Product Feature                  |
| ------------------------ | ---------------------------- | -------------------------------- |
| Tìm dịch vụ phù hợp      | Không muốn tự mò nhiều nguồn | Product listing, filters, search |
| Chọn lịch trình hợp lý   | Không biết điểm nào nên đi   | NiBi AI itinerary planning       |
| So sánh lựa chọn         | Sợ chọn sai                  | Comparison, AI explanation       |
| Kiểm soát ngân sách      | Sợ phát sinh                 | Cost breakdown, price/person     |
| Đặt dịch vụ              | Muốn flow rõ ràng            | Cart, booking request, order     |
| Xác nhận dịch vụ         | Cần sự chắc chắn             | Sales dashboard, booking status  |
| Biết vị trí              | Sợ bất tiện di chuyển        | Google Maps, location data       |
| Theo dõi sau khi đặt     | Không muốn bị mất thông tin  | My bookings, notifications       |
| Sales xử lý lead         | Muốn phản hồi nhanh          | AI sales note, lead summary      |
| Editor nhập dữ liệu      | Muốn dữ liệu chuẩn           | Product CMS, validation          |
| Admin kiểm soát nền tảng | Muốn vận hành ổn định        | Admin dashboard, logs, analytics |

---

## 16. Persona Priority for MVP

Trong MVP, độ ưu tiên persona như sau:

### Priority 1 — Buyer: Family Planner

Lý do:

* Nhu cầu rõ.
* Dễ chứng minh giá trị của cá nhân hóa.
* Cần combo xe + lưu trú + hoạt động.
* Có nhu cầu cost breakdown.
* Có rủi ro lịch trình cần AI hỗ trợ.

### Priority 2 — Buyer: Budget Group Traveler

Lý do:

* Nhạy cảm về giá.
* Dễ demo tính năng budget package.
* Cần price/person.
* Cần lịch trình nhanh và dễ chia sẻ.

### Priority 3 — Sales

Lý do:

* Giúp chứng minh sản phẩm vận hành thật.
* Booking request không bị dừng ở phía Buyer.
* AI sales note tạo khác biệt.

### Priority 4 — Editor/MOD

Lý do:

* Cần để dữ liệu sản phẩm được quản lý.
* Giúp nền tảng giống sản phẩm thật hơn.

### Priority 5 — Admin

Lý do:

* Cần cho phân quyền, kiểm soát và demo dashboard.
* Admin là role vận hành nền tảng, nhưng trải nghiệm Buyer/Sales nên được ưu tiên hơn trong demo.

### Priority 6 — Couple Experience Seeker & Convenience-first Traveler

Lý do:

* Có giá trị thương mại tốt.
* Phù hợp mở rộng sau khi flow nền tảng ổn định.
* Có thể đưa vào seed data và demo phụ.

---

## 17. Key Design Implications

Từ persona và JTBD, sản phẩm cần được thiết kế theo các nguyên tắc sau:

### 17.1 Không bắt đầu bằng chatbot trống

Buyer không nên chỉ thấy một ô chat và không biết hỏi gì. Nền tảng cần có listing, combo, form nhu cầu và gợi ý mẫu để dẫn dắt.

### 17.2 NiBi AI phải hỏi ít nhưng đúng

Buyer dễ bỏ cuộc nếu AI hỏi quá nhiều. Form hoặc AI nên ưu tiên các thông tin quan trọng:

* Ngày đi.
* Số ngày.
* Số người.
* Ngân sách.
* Phong cách du lịch.
* Sở thích.
* Yêu cầu đặc biệt.
* Điểm đón nếu có thuê xe.

### 17.3 Minh bạch chi phí là yếu tố niềm tin

Cost breakdown nên xuất hiện trong proposal, cart, order và booking detail.

### 17.4 Google Maps phải phục vụ quyết định

Bản đồ không chỉ để trang trí. Nó cần giúp Buyer biết vị trí, khoảng cách và tính hợp lý của lịch trình.

### 17.5 Sales cần thông tin hành động được

Sales dashboard không chỉ hiển thị booking. Nó cần có:

* Lead summary.
* AI sales note.
* Nhu cầu khách.
* Dịch vụ khách chọn.
* Booking status.
* Ghi chú tư vấn.
* Việc cần làm tiếp theo.

### 17.6 Editor/MOD cần nhập dữ liệu chuẩn

Nếu dữ liệu đầu vào kém, AI recommendation và Buyer experience sẽ kém. Vì vậy CMS phải có validation và required fields rõ.

### 17.7 Buyer phải luôn có quyền kiểm soát

NiBi AI chỉ đề xuất. Buyer phải là người xác nhận:

* Chọn dịch vụ.
* Thêm vào cart.
* Gửi booking request.
* Thanh toán/cọc.
* Chỉnh lịch trình.

---

## 18. Success Outcomes by Persona

| Persona                    | Success Outcome                                                        |
| -------------------------- | ---------------------------------------------------------------------- |
| Family Planner             | Tạo được chuyến đi gia đình nhẹ nhàng, rõ chi phí, có xe/chỗ ở phù hợp |
| Couple Experience Seeker   | Tìm được trải nghiệm đẹp, nơi ở phù hợp, lịch trình đáng nhớ           |
| Budget Group Traveler      | Có lịch trình tiết kiệm, biết chi phí/người, dễ thống nhất với nhóm    |
| Convenience-first Traveler | Đặt nhanh combo phù hợp mà không phải tự tìm quá nhiều                 |
| Sales                      | Xử lý lead nhanh hơn, ít hỏi lại, tăng tỷ lệ confirmed                 |
| Editor/MOD                 | Tạo dữ liệu sản phẩm/nội dung đầy đủ và dễ quản lý                     |
| Admin                      | Kiểm soát nền tảng, role, sản phẩm, booking, order và AI logs          |

---

## 19. Anti-personas / Not Primary Users

MVP không ưu tiên các nhóm sau:

### 19.1 Khách muốn đặt vé máy bay

NiBiGo MVP không xử lý flight booking.

### 19.2 Khách muốn du lịch toàn Việt Nam

MVP chỉ tập trung vào Ninh Bình.

### 19.3 Đối tác tự quản lý sản phẩm

Partner portal chưa nằm trong MVP đầu tiên. Đối tác có thể là future role sau này.

### 19.4 Khách doanh nghiệp lớn

Corporate travel, MICE, đoàn lớn phức tạp chưa phải trọng tâm MVP.

### 19.5 Khách quốc tế cần multi-language đầy đủ

Có thể hỗ trợ sau này, nhưng MVP ưu tiên tiếng Việt và khách nội địa.

---

## 20. Conclusion

Phân tích persona và JTBD cho thấy NiBiGo không chỉ cần xây một chatbot AI, mà cần xây một nền tảng giúp người dùng hoàn thành toàn bộ công việc: khám phá, lựa chọn, cá nhân hóa, đặt dịch vụ và theo dõi booking.

Buyer cần sự rõ ràng, phù hợp và đáng tin. Sales cần lead có cấu trúc và công cụ xử lý booking. Editor/MOD cần quản lý dữ liệu sản phẩm chất lượng. Admin cần kiểm soát toàn bộ nền tảng.

NiBi AI nên được thiết kế như một trợ lý hỗ trợ ra quyết định, không thay thế hoàn toàn hệ thống commerce hoặc Sales. Giá trị cốt lõi của NiBiGo nằm ở việc kết hợp bốn yếu tố:

1. Dữ liệu du lịch Ninh Bình được chuẩn hóa.
2. AI cá nhân hóa đề xuất.
3. Commerce flow có booking/order rõ ràng.
4. Human-in-the-loop để xử lý xác nhận và ngoại lệ.

Từ góc nhìn JTBD, sản phẩm thành công khi người dùng không chỉ “nhận được câu trả lời từ AI”, mà thực sự cảm thấy họ đã tổ chức được một chuyến đi phù hợp, minh bạch và đáng tin cậy.
