import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { APP_NAME, ROUTES } from "@/lib/constants";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-brand-cream/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href={ROUTES.home} className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-green text-sm font-bold text-white">
            Ni
          </span>
          <span className="text-base font-bold tracking-tight text-brand-ink">
            {APP_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-brand-muted md:flex">
          <a href="#features" className="hover:text-brand-ink">
            Tính năng
          </a>
          <a href="#how" className="hover:text-brand-ink">
            Cách hoạt động
          </a>
          <Link href={ROUTES.login} className="hover:text-brand-ink">
            Đăng nhập
          </Link>
        </nav>

        <ButtonLink href={ROUTES.plan} size="md">
          Lập kế hoạch
        </ButtonLink>
      </Container>
    </header>
  );
}
