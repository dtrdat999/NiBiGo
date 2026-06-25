import { BrandLogo } from "@/components/brand/BrandLogo";
import { Container } from "@/components/ui/Container";
import { ROUTES } from "@/lib/constants";

const footerLinks = [
  { href: "#how", label: "Cách hoạt động" },
  { href: "#packages", label: "Gói mẫu" },
  { href: ROUTES.products, label: "Dịch vụ" },
  { href: "#faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="border-t border-brand-green/10 bg-white">
      <Container className="grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-xl text-sm leading-7 text-brand-muted">
            NiBiGo AI Planner giúp bạn tạo phương án tour Ninh Bình rõ lịch trình, rõ chi phí và có người thật xác nhận trước khi đặt.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-brand-muted">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-brand-green">
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-sm text-brand-muted">
            © {new Date().getFullYear()} NiBiGo · Du lịch Ninh Bình
          </p>
        </div>
      </Container>
    </footer>
  );
}
