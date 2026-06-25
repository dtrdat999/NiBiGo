import { AIMascot } from "@/components/brand/AIMascot";
import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ROUTES } from "@/lib/constants";

const painPoints = [
  "Không biết nên đi đâu trước, đi đâu sau để lịch trình không bị mệt.",
  "Khó ước lượng tổng chi phí thực tế cho cả đoàn.",
  "Sợ tour có sẵn không hợp trẻ em, người lớn tuổi hoặc lịch riêng của nhóm.",
  "Muốn chỉnh lịch trình nhưng không muốn mất nhiều vòng tư vấn thủ công.",
  "Không rõ gói nào thật sự vừa ngân sách và đáng chọn.",
];

const steps = [
  {
    step: "01",
    title: "Nhập nhu cầu chuyến đi",
    body: "Chọn ngày đi, số người, ngân sách, phong cách và điều bạn muốn ưu tiên.",
    icon: "✍️",
  },
  {
    step: "02",
    title: "Nhận 3 phương án phù hợp",
    body: "Tiết kiệm, cân bằng và trải nghiệm — mỗi gói có lý do đề xuất riêng.",
    icon: "🧭",
  },
  {
    step: "03",
    title: "Xem lịch trình và chi phí",
    body: "Biết rõ từng ngày đi đâu, nghỉ thế nào và tiền đang được chia vào đâu.",
    icon: "🧾",
  },
  {
    step: "04",
    title: "Gửi yêu cầu để được xác nhận",
    body: "Bạn chưa cần thanh toán ngay. Sales sẽ kiểm tra lại dịch vụ và giá cuối.",
    icon: "🤝",
  },
];

const aiValues = [
  "Gợi ý tour theo ngân sách, số người và nhịp đi thực tế.",
  "Tạo 3 phương án để bạn dễ so sánh trước khi quyết định.",
  "Giải thích vì sao mỗi gói phù hợp với nhu cầu đã nhập.",
  "Cho phép chỉnh bằng câu tự nhiên: “lịch nhẹ hơn”, “giảm ngân sách”, “thêm hoạt động cho trẻ em”.",
  "Hiển thị chi phí theo từng nhóm để bạn không bị mơ hồ.",
];

const packages = [
  {
    title: "Gói tiết kiệm",
    price: "Tối ưu chi phí",
    fit: "Phù hợp với nhóm muốn đi đủ điểm chính, kiểm soát ngân sách chặt.",
    highlights: ["Lịch trình gọn", "Dịch vụ cần thiết", "Dễ điều chỉnh"],
    tone: "bg-brand-green-soft text-brand-green",
  },
  {
    title: "Gói cân bằng",
    price: "Dễ chọn nhất",
    fit: "Phù hợp đa số khách lần đầu đến Ninh Bình, muốn vừa đẹp vừa hợp lý.",
    highlights: ["Nhịp đi thoải mái", "Chi phí rõ", "Trải nghiệm nổi bật"],
    tone: "bg-brand-gold-soft text-[#9c6514]",
  },
  {
    title: "Gói trải nghiệm",
    price: "Dịch vụ tốt hơn",
    fit: "Phù hợp cặp đôi, gia đình hoặc nhóm muốn lịch trình đẹp và ít phải tự lo.",
    highlights: ["Lưu trú tốt hơn", "Điểm đẹp để chụp ảnh", "Tư vấn kỹ hơn"],
    tone: "bg-white text-brand-ink",
  },
];

const costItems = [
  { label: "Lưu trú", value: "2.400.000 đ", note: "khách sạn / homestay" },
  { label: "Di chuyển", value: "1.600.000 đ", note: "xe đưa đón hoặc xe riêng" },
  { label: "Tham quan", value: "1.200.000 đ", note: "vé và trải nghiệm chính" },
  { label: "Ăn uống", value: "1.800.000 đ", note: "bữa chính theo lịch trình" },
  { label: "Dịch vụ thêm", value: "1.000.000 đ", note: "linh hoạt theo nhu cầu" },
];

const services = [
  {
    title: "Lưu trú",
    body: "Khách sạn, homestay hoặc resort phù hợp ngân sách và vị trí di chuyển.",
    icon: "🏡",
  },
  {
    title: "Di chuyển",
    body: "Xe đưa đón, limousine hoặc xe riêng theo quy mô đoàn.",
    icon: "🚐",
  },
  {
    title: "Tham quan",
    body: "Tràng An, Tam Cốc, Hang Múa, Bái Đính, Hoa Lư và các điểm theo mùa.",
    icon: "⛰️",
  },
  {
    title: "Ăn uống",
    body: "Dê núi, cơm cháy, set gia đình, bữa tối nhẹ hoặc không gian riêng tư.",
    icon: "🍽️",
  },
  {
    title: "Trải nghiệm",
    body: "Đạp xe làng quê, Vân Long, Cúc Phương, phố cổ Hoa Lư hoặc hoạt động cho trẻ em.",
    icon: "🚲",
  },
];

const trustItems = [
  "Gợi ý dựa trên dịch vụ có trong hệ thống, không tự bịa sản phẩm.",
  "Giá hiển thị là tạm tính để bạn so sánh trước khi gửi yêu cầu.",
  "Tình trạng còn chỗ sẽ được kiểm tra lại trước khi chốt.",
  "Bạn có thể xem lại yêu cầu và theo dõi trạng thái xử lý.",
  "Sales xác nhận lại lịch trình, giá cuối và điều kiện trước khi đặt.",
];

const demoTrust = [
  "Thiết kế cho khách muốn tự kiểm soát chuyến đi.",
  "Phù hợp gia đình, cặp đôi, nhóm bạn và khách lần đầu đến Ninh Bình.",
  "Tập trung vào minh bạch lịch trình, chi phí và lựa chọn thay thế.",
];

const faqs = [
  {
    question: "NiBi AI có đặt tour thật luôn không?",
    answer:
      "Không. NiBi AI giúp bạn tạo phương án và gửi yêu cầu tư vấn. Sau đó Sales sẽ kiểm tra lại dịch vụ, giá cuối và xác nhận với bạn trước khi đặt.",
  },
  {
    question: "Giá hiển thị có phải giá cuối cùng không?",
    answer:
      "Giá trên màn hình là tạm tính để bạn dễ so sánh. Giá cuối sẽ được xác nhận lại vì còn phụ thuộc ngày đi, số chỗ còn lại và điều kiện của từng dịch vụ.",
  },
  {
    question: "Tôi có thể chỉnh lịch trình sau khi AI tạo không?",
    answer:
      "Có. Bạn có thể yêu cầu lịch nhẹ hơn, đổi điểm tham quan, giảm ngân sách hoặc thêm hoạt động phù hợp trẻ em/người lớn tuổi.",
  },
  {
    question: "Nếu đi cùng trẻ em hoặc người lớn tuổi thì sao?",
    answer:
      "Bạn nên nhập rõ thành phần đoàn ngay từ đầu. NiBi AI sẽ ưu tiên nhịp đi nhẹ hơn, thời gian nghỉ hợp lý và dịch vụ phù hợp hơn.",
  },
  {
    question: "Tôi có cần thanh toán ngay không?",
    answer:
      "Không cần thanh toán ngay khi tạo phương án. Bạn chỉ gửi yêu cầu để đội ngũ tư vấn kiểm tra và xác nhận lại.",
  },
  {
    question: "Booking request được xử lý như thế nào?",
    answer:
      "Yêu cầu của bạn được lưu lại, Sales xem thông tin chuyến đi, kiểm tra dịch vụ và liên hệ để xác nhận phương án phù hợp trước khi đặt.",
  },
  {
    question: "NiBi AI có hỗ trợ ngoài Ninh Bình không?",
    answer:
      "Ở giai đoạn hiện tại, sản phẩm tập trung vào Ninh Bình để đảm bảo dữ liệu dịch vụ và lịch trình đủ rõ. Các điểm đến khác có thể được mở rộng sau.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.04em] text-brand-ink sm:text-4xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-base leading-8 text-brand-muted sm:text-lg">{body}</p>
      ) : null}
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-brand-cream">
        <section className="relative isolate">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_16%,rgba(224,161,58,0.2),transparent_30%),radial-gradient(circle_at_78%_10%,rgba(32,104,76,0.18),transparent_34%)]" />
          <Container className="grid items-center gap-10 pb-16 pt-12 sm:pb-24 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/15 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-green shadow-sm">
                <span className="h-2 w-2 rounded-full bg-brand-gold" />
                Tour Ninh Bình rõ lịch trình, rõ chi phí
              </span>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.055em] text-brand-ink sm:text-6xl">
                Tự tạo tour Ninh Bình theo ngân sách của bạn — có người thật xác nhận trước khi đặt.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-muted">
                Chỉ cần nhập ngày đi, số người, ngân sách và sở thích. NiBi AI gợi ý 3 phương án để bạn so sánh, chỉnh lại và gửi yêu cầu tư vấn khi đã thấy phù hợp.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={ROUTES.plan} size="lg" className="shadow-[0_18px_36px_rgba(32,104,76,0.22)]">
                  Lập kế hoạch miễn phí
                </ButtonLink>
                <ButtonLink href="#packages" variant="outline" size="lg" className="bg-white/70">
                  Xem gói tour mẫu
                </ButtonLink>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-brand-muted">
                Giá và tình trạng dịch vụ là tạm tính để bạn ra quyết định dễ hơn. Sales sẽ xác nhận lại trước khi đặt, nên bạn luôn có thời gian chỉnh hoặc dừng lại.
              </p>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  ["3 phương án", "dễ so sánh"],
                  ["Không ép mua", "gửi yêu cầu khi sẵn sàng"],
                  ["Chi phí tách rõ", "biết tiền dùng vào đâu"],
                ].map(([value, label]) => (
                  <div key={value} className="rounded-2xl border border-brand-green/10 bg-white/75 p-4 shadow-sm">
                    <p className="text-lg font-bold text-brand-green">{value}</p>
                    <p className="mt-1 text-sm text-brand-muted">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -left-10 top-12 hidden h-28 w-28 rounded-full bg-brand-gold/20 blur-2xl sm:block" />
              <div className="absolute -right-6 bottom-16 hidden h-40 w-40 rounded-full bg-brand-green/15 blur-3xl sm:block" />

              <div className="relative rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_30px_80px_rgba(20,38,31,0.16)] backdrop-blur">
                <div className="rounded-[1.5rem] bg-brand-green p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Bản nháp chuyến đi</p>
                      <h2 className="mt-3 text-2xl font-bold leading-tight">
                        Ninh Bình 3N2Đ cho 4 người
                      </h2>
                    </div>
                    <AIMascot state="default" size="sm" priority className="-mt-3 !h-24 !w-24" />
                  </div>

                  <div className="mt-6 grid gap-3">
                    {[
                      ["Tiết kiệm", "6,8 triệu", "đủ điểm chính, nhịp gọn"],
                      ["Cân bằng", "8,4 triệu", "lịch thoải mái, dễ chọn"],
                      ["Trải nghiệm", "11,2 triệu", "dịch vụ tốt hơn, ít phải tự lo"],
                    ].map(([tier, price, desc], index) => (
                      <div
                        key={tier}
                        className="rounded-2xl border border-white/15 bg-white/10 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold">{tier}</p>
                          <span className={index === 1 ? "rounded-full bg-brand-gold px-3 py-1 text-xs font-bold text-brand-ink" : "text-sm font-semibold text-white/80"}>
                            {price}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/75">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 px-3 py-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-brand-cream p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">Bạn kiểm soát</p>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">
                      Có thể chỉnh lịch, đổi ngân sách hoặc gửi yêu cầu tư vấn sau.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-brand-green-soft p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-green">Minh bạch</p>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">
                      Mỗi gói có lý do đề xuất và chia nhỏ chi phí.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
              <SectionHeading
                eyebrow="Nỗi lo rất thật"
                title="Đi Ninh Bình nghe đơn giản, nhưng tự ghép tour lại có quá nhiều quyết định nhỏ."
                body="NiBi AI giúp bạn bắt đầu từ nhu cầu thật của chuyến đi, không bắt bạn chọn tour có sẵn một cách máy móc."
              />

              <div className="grid gap-3">
                {painPoints.map((item) => (
                  <div key={item} className="flex gap-4 rounded-2xl border border-brand-green/10 bg-brand-cream/70 p-4">
                    <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-green-soft text-sm font-bold text-brand-green">
                      ✓
                    </span>
                    <p className="text-base leading-7 text-brand-ink">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="how" className="py-16 sm:py-24">
          <Container>
            <SectionHeading
              eyebrow="Cách hoạt động"
              title="Từ ý tưởng mơ hồ đến phương án có thể so sánh trong vài bước."
              body="Luồng được thiết kế để bạn hiểu mình đang chọn gì, vì sao nên chọn và cần xác nhận điều gì trước khi đặt."
              align="center"
            />

            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((item) => (
                <li key={item.step} className="relative flex h-full flex-col rounded-[1.75rem] border border-brand-green/10 bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-sm font-bold text-brand-gold">{item.step}</span>
                  </div>
                  <h3 className="mt-7 text-xl font-bold leading-tight text-brand-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-brand-muted">{item.body}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section className="bg-brand-green py-16 text-white sm:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">NiBi AI giúp gì</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
                  Không chỉ đưa lịch trình đẹp, mà còn giúp bạn hiểu lựa chọn đó có hợp mình không.
                </h2>
                <p className="mt-5 text-base leading-8 text-white/75">
                  Mỗi phương án nên trả lời được ba câu hỏi: có vừa ngân sách không, lịch có quá mệt không, và chi phí có rõ để mình yên tâm gửi yêu cầu không.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href={ROUTES.plan} variant="secondary" size="lg">
                    Thử tạo phương án
                  </ButtonLink>
                  <ButtonLink href="#cost" variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                    Xem cách chia chi phí
                  </ButtonLink>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5">
                <div className="grid gap-3">
                  {aiValues.map((value) => (
                    <div key={value} className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm leading-7 text-white/85">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="packages" className="bg-white py-16 sm:py-24">
          <Container>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Gói tour mẫu"
                title="Ba hướng chọn để bạn không phải đoán từ con số đầu tiên."
                body="Mỗi gói chỉ là điểm bắt đầu. Bạn vẫn có thể đổi dịch vụ, đổi nhịp đi hoặc gửi yêu cầu để được tư vấn kỹ hơn."
              />
              <ButtonLink href={ROUTES.explore} variant="outline" size="lg" className="w-fit bg-white">
                Khám phá dịch vụ
              </ButtonLink>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {packages.map((pkg, index) => (
                <article
                  key={pkg.title}
                  className={index === 1 ? "rounded-[2rem] border-2 border-brand-gold bg-brand-cream p-6 shadow-[0_24px_60px_rgba(224,161,58,0.18)]" : "rounded-[2rem] border border-brand-green/10 bg-white p-6 shadow-card"}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${pkg.tone}`}>
                        {pkg.price}
                      </span>
                      <h3 className="mt-5 text-2xl font-bold text-brand-ink">{pkg.title}</h3>
                    </div>
                    {index === 1 ? (
                      <span className="rounded-full bg-brand-gold px-3 py-1 text-xs font-bold text-brand-ink">
                        Gợi ý dễ bắt đầu
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 min-h-[84px] text-sm leading-7 text-brand-muted">{pkg.fit}</p>
                  <div className="mt-5 space-y-2">
                    {pkg.highlights.map((item) => (
                      <p key={item} className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                        {item}
                      </p>
                    ))}
                  </div>
                  <ButtonLink href={ROUTES.plan} variant={index === 1 ? "primary" : "outline"} className="mt-7 w-full">
                    Xem lịch trình mẫu
                  </ButtonLink>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section id="cost" className="py-16 sm:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <SectionHeading
                eyebrow="Chi phí minh bạch"
                title="Bạn không chỉ thấy tổng tiền, mà còn biết tiền đang đi vào đâu."
                body="Tổng giá là tạm tính để bạn so sánh phương án. Trước khi chốt, Sales sẽ xác nhận lại giá cuối, tình trạng còn chỗ và điều kiện dịch vụ."
              />

              <div className="rounded-[2rem] border border-brand-green/10 bg-white p-6 shadow-card">
                <div className="flex items-start justify-between gap-4 border-b border-brand-green/10 pb-5">
                  <div>
                    <p className="text-sm font-semibold text-brand-muted">Ví dụ chi phí cả đoàn</p>
                    <h3 className="mt-1 text-3xl font-bold text-brand-green">8.000.000 đ</h3>
                  </div>
                  <span className="rounded-full bg-brand-gold-soft px-3 py-1 text-xs font-bold text-[#9c6514]">
                    tạm tính
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {costItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-5 rounded-2xl bg-brand-cream p-4">
                      <div>
                        <p className="font-bold text-brand-ink">{item.label}</p>
                        <p className="mt-1 text-sm text-brand-muted">{item.note}</p>
                      </div>
                      <p className="shrink-0 font-bold text-brand-green">{item.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 rounded-2xl bg-brand-green-soft p-4 text-sm leading-7 text-brand-muted">
                  Nếu có dịch vụ hết chỗ hoặc giá thay đổi theo ngày đi, bạn sẽ được báo rõ trước khi quyết định.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section id="services" className="bg-white py-16 sm:py-24">
          <Container>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Dịch vụ có thể ghép"
                title="Một chuyến đi tốt thường đến từ nhiều lựa chọn nhỏ được ghép đúng."
                body="Bạn không cần tự chọn từng dịch vụ ngay từ đầu. Hệ thống gợi ý theo nhu cầu, còn bạn có thể xem kỹ và chỉnh lại."
              />
              <ButtonLink href={ROUTES.products} variant="outline" size="lg" className="w-fit bg-white">
                Xem tất cả dịch vụ
              </ButtonLink>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {services.map((service) => (
                <article key={service.title} className="flex h-full flex-col rounded-[1.75rem] border border-brand-green/10 bg-brand-cream p-5">
                  <span className="text-3xl">{service.icon}</span>
                  <h3 className="mt-5 text-xl font-bold text-brand-ink">{service.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-brand-muted">{service.body}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section id="trust" className="py-16 sm:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="rounded-[2.25rem] bg-brand-green p-7 text-white shadow-[0_30px_80px_rgba(20,38,31,0.18)] sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">Yên tâm hơn trước khi gửi yêu cầu</p>
                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl">
                  NiBi AI không thay bạn quyết định. Công cụ này giúp bạn nhìn rõ hơn để tự quyết định.
                </h2>
                <div className="mt-8 grid gap-3">
                  {trustItems.map((item) => (
                    <div key={item} className="flex gap-3 rounded-2xl bg-white/10 p-4">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                      <p className="text-sm leading-7 text-white/85">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <SectionHeading
                  eyebrow="Không dùng review giả"
                  title="MVP nên trung thực ngay từ cách kể chuyện."
                  body="Khi chưa có nhiều đánh giá thật, homepage vẫn có thể tạo niềm tin bằng nguyên tắc rõ ràng và lời hứa đúng phạm vi."
                />
                <div className="grid gap-3">
                  {demoTrust.map((item) => (
                    <div key={item} className="rounded-2xl border border-brand-green/10 bg-white p-5 shadow-sm">
                      <p className="font-semibold leading-7 text-brand-ink">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="faq" className="bg-white py-16 sm:py-24">
          <Container>
            <SectionHeading
              eyebrow="FAQ"
              title="Những câu hỏi thường gặp trước khi gửi yêu cầu."
              body="Các câu trả lời được viết theo đúng tình huống người đi tour cần biết: giá, chỉnh sửa, xác nhận và thanh toán."
              align="center"
            />

            <div className="mx-auto mt-10 max-w-4xl divide-y divide-brand-green/10 rounded-[2rem] border border-brand-green/10 bg-brand-cream/70 p-2">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-3xl px-5 py-4 open:bg-white open:shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-bold text-brand-ink">
                    {faq.question}
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-brand-green transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-24">
          <Container>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-green px-6 py-12 text-center text-white shadow-[0_30px_80px_rgba(20,38,31,0.22)] sm:px-12 sm:py-16">
              <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-brand-gold/20 blur-3xl" />
              <div className="absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
              <div className="relative mx-auto max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">Bắt đầu nhẹ nhàng</p>
                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
                  Bắt đầu từ nhu cầu của bạn. NiBi AI sẽ giúp bạn ghép tour Ninh Bình phù hợp hơn.
                </h2>
                <p className="mt-5 text-base leading-8 text-white/75">
                  Tạo phương án miễn phí, xem rõ chi phí và chỉ gửi yêu cầu khi bạn thật sự muốn được tư vấn tiếp.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <ButtonLink href={ROUTES.plan} variant="secondary" size="lg">
                    Lập kế hoạch tour ngay
                  </ButtonLink>
                  <ButtonLink href="#packages" variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                    Xem gói mẫu
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}
