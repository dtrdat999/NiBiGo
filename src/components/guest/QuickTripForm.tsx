import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/constants";

export function QuickTripForm() {
  return (
    <form action={ROUTES.plan} method="get" className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
          Gợi ý nhanh
        </p>
        <h2 className="mt-1 text-xl font-bold text-brand-ink">Bạn muốn đi như thế nào?</h2>
        <p className="mt-1 text-sm leading-relaxed text-brand-muted">
          Điền vài thông tin cơ bản, NiBi AI sẽ chuẩn bị form phù hợp cho bạn.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-brand-muted">Điểm đến</span>
          <span className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-brand-cream px-3 text-sm font-semibold text-brand-ink">
            <Icon name="map" className="h-4 w-4 text-brand-green" />
            Ninh Bình
          </span>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-brand-muted">Ngày khởi hành</span>
          <input
            name="start_date"
            type="date"
            lang="en-GB"
            className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-brand-ink outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/10"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-brand-muted">Thời lượng</span>
          <select
            name="days"
            defaultValue="3"
            className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-brand-ink outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/10"
          >
            <option value="2">2 ngày 1 đêm</option>
            <option value="3">3 ngày 2 đêm</option>
            <option value="4">4 ngày 3 đêm</option>
            <option value="5">5 ngày 4 đêm</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-brand-muted">Số người</span>
          <select
            name="people"
            defaultValue="2"
            className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-brand-ink outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/10"
          >
            <option value="1">1 người</option>
            <option value="2">2 người</option>
            <option value="4">4 người</option>
            <option value="6">6 người</option>
            <option value="8">8 người</option>
          </select>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-brand-muted">Ngân sách cả đoàn</span>
        <select
          name="budget"
          defaultValue="8000000"
          className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-brand-ink outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/10"
        >
          <option value="4000000">Khoảng 4 triệu</option>
          <option value="6000000">Khoảng 6 triệu</option>
          <option value="8000000">Khoảng 8 triệu</option>
          <option value="10000000">Khoảng 10 triệu</option>
          <option value="15000000">Khoảng 15 triệu</option>
        </select>
      </label>

      <Button type="submit" className="w-full">
        Tạo gợi ý nhanh
        <Icon name="arrow-right" className="h-4 w-4" />
      </Button>
    </form>
  );
}
