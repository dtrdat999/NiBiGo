import { Container } from "@/components/ui/Container";
import { APP_NAME, ENGINE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <Container className="flex flex-col items-center justify-between gap-3 py-8 text-sm text-brand-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {APP_NAME} · Trợ lý {ENGINE_NAME}
        </p>
        <p className="text-center sm:text-right">
          Module AI của{" "}
          <a
            href="https://nibigo.io.vn"
            className="font-medium text-brand-green hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            nibigo.io.vn
          </a>{" "}
          · Du lịch Ninh Bình
        </p>
      </Container>
    </footer>
  );
}
