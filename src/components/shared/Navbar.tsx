import { BrandLogo } from "@/components/brand/BrandLogo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ROUTES } from "@/lib/constants";

const navItems = [
  { href: "#how", label: "Cách hoạt động" },
  { href: "#packages", label: "Gói tour mẫu" },
  { href: "#services", label: "Dịch vụ" },
  { href: "#trust", label: "Vì sao chọn" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-green/10 bg-brand-cream/90 backdrop-blur-xl">
      <Container className="flex h-[72px] items-center justify-between gap-4 py-3">
        <BrandLogo />

        <nav className="hidden items-center gap-6 text-sm font-semibold text-brand-muted lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="transition hover:text-brand-green">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href={ROUTES.login} variant="ghost" className="hidden sm:inline-flex">
            Đăng nhập
          </ButtonLink>
          <ButtonLink href={ROUTES.plan} size="md" className="shadow-sm">
            Lập kế hoạch
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
