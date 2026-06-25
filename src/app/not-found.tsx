import { ButtonLink } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-cream px-4 text-center">
      <p className="text-7xl font-extrabold text-brand-green">404</p>
      <h1 className="mt-4 text-2xl font-bold text-brand-ink">Không tìm thấy trang</h1>
      <p className="mt-2 max-w-md text-brand-muted">
        Trang bạn tìm chưa tồn tại hoặc đang được xây dựng.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href={ROUTES.home}>Về trang chủ</ButtonLink>
        <ButtonLink href={ROUTES.dashboard} variant="outline">
          Bảng điều khiển
        </ButtonLink>
      </div>
    </div>
  );
}
