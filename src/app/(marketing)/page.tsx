import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ENGINE_NAME, ROUTES } from "@/lib/constants";

const FEATURES = [
  {
    title: "Cá nhân hóa theo ngân sách",
    body: "Nhập ngân sách, sở thích, thành phần đoàn — nhận 3 gói tour Tiết kiệm / Cân bằng / Trải nghiệm phù hợp.",
    icon: "🎯",
  },
  {
    title: "Chi phí minh bạch",
    body: "Mọi con số đến từ kho dịch vụ thật. Breakdown rõ từng hạng mục: khách sạn, ăn uống, di chuyển, tham quan.",
    icon: "🧾",
  },
  {
    title: "Chỉnh tour bằng AI",
    body: "Gõ tự nhiên: “bỏ hoạt động quá mệt”, “thêm hoạt động cho trẻ em” — lịch trình và giá cập nhật ngay.",
    icon: "✨",
  },
];

const STEPS = [
  { n: "01", title: "Nhập nhu cầu", body: "Số ngày, số người, ngân sách, phong cách và sở thích." },
  { n: "02", title: "Nhận 3 gói tour", body: "Kèm lịch trình từng ngày, chi phí và lý do đề xuất." },
  { n: "03", title: "Chỉnh theo ý bạn", body: "Phản hồi tự nhiên, AI điều chỉnh và tính lại giá." },
  { n: "04", title: "Gửi yêu cầu đặt", body: "Nhận mã booking; đội ngũ NiBiGo liên hệ xác nhận." },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-green-soft/60 to-brand-cream" />
          <Container className="py-20 sm:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-white px-4 py-1.5 text-xs font-semibold text-brand-green">
                <span className="h-2 w-2 rounded-full bg-brand-gold" />
                Được hỗ trợ bởi {ENGINE_NAME}
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-brand-ink sm:text-5xl">
                Lập kế hoạch tour{" "}
                <span className="text-brand-green">Ninh Bình</span> trọn gói,
                cá nhân hóa cho riêng bạn
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-muted">
                AI ghép tour từ kho dịch vụ có sẵn theo ngân sách và sở thích của
                bạn — lịch trình rõ ràng, chi phí minh bạch, chỉnh sửa trong vài giây.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ButtonLink href={ROUTES.plan} size="lg">
                  Lập kế hoạch ngay
                </ButtonLink>
                <ButtonLink href={ROUTES.register} variant="outline" size="lg">
                  Tạo tài khoản
                </ButtonLink>
              </div>

              <dl className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-6 text-center">
                {[
                  ["3 gói", "mỗi nhu cầu"],
                  ["~5 phút", "có lịch trình"],
                  ["100%", "giá từ dữ liệu thật"],
                ].map(([stat, label]) => (
                  <div key={label}>
                    <dt className="text-2xl font-bold text-brand-green">{stat}</dt>
                    <dd className="mt-1 text-sm text-brand-muted">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Container>
        </section>

        {/* Features */}
        <section id="features" className="py-16 sm:py-20">
          <Container>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-brand-ink">
                Không phải chatbot du lịch chung chung
              </h2>
              <p className="mt-3 text-brand-muted">
                Một planner thật: sản phẩm thật, giá thật, tình trạng chỗ thật. AI
                lo tư vấn, hệ thống lo con số.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title}>
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-4 text-lg font-bold text-brand-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{f.body}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section id="how" className="bg-white py-16 sm:py-20">
          <Container>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-brand-ink">
                Bốn bước để có chuyến đi
              </h2>
              <p className="mt-3 text-brand-muted">
                Từ ý tưởng đến yêu cầu đặt tour, gọn gàng và minh bạch.
              </p>
            </div>

            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <li
                  key={s.n}
                  className="rounded-2xl border border-black/5 bg-brand-cream p-6"
                >
                  <span className="text-sm font-bold text-brand-gold">{s.n}</span>
                  <h3 className="mt-2 text-base font-bold text-brand-ink">{s.title}</h3>
                  <p className="mt-2 text-sm text-brand-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* CTA band */}
        <section className="py-16 sm:py-20">
          <Container>
            <div className="rounded-3xl bg-brand-green px-8 py-12 text-center text-white sm:px-12">
              <h2 className="text-3xl font-bold tracking-tight">
                Sẵn sàng cho chuyến Ninh Bình của bạn?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-brand-green-soft">
                Tạo kế hoạch cá nhân hóa miễn phí — chỉ trả tiền khi bạn quyết định đặt.
              </p>
              <div className="mt-8">
                <ButtonLink href={ROUTES.plan} variant="secondary" size="lg">
                  Bắt đầu miễn phí
                </ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}
