import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import {
  ROUTES,
  SALES_NOTE_TYPES,
  SALES_NOTE_TYPE_LABELS,
} from "@/lib/constants";
import type { BookingRequest, Profile, SalesNoteType } from "@/types";

export const metadata: Metadata = {
  title: "Ghi chú khách hàng — NiBiGo AI Travel Platform",
};
export const dynamic = "force-dynamic";

type NoteRow = {
  id: string;
  booking_request_id: string;
  author_id: string;
  content: string;
  note_type: SalesNoteType;
  created_at: string;
};

const NOTE_TONE: Record<SalesNoteType, "neutral" | "green" | "gold" | "amber" | "red"> = {
  contact_attempt: "green",
  customer_preference: "gold",
  price_discussion: "amber",
  partner_confirmation: "green",
  risk_warning: "red",
  follow_up: "gold",
  general: "neutral",
};

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export default async function SalesNotesPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const search = param(searchParams?.q)?.trim() ?? "";
  const typeFilter = param(searchParams?.type) ?? "all";
  const mine = param(searchParams?.mine) === "1";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("sales_notes")
    .select("id, booking_request_id, author_id, content, note_type, created_at")
    .order("created_at", { ascending: false })
    .limit(150);
  if (typeFilter !== "all") query = query.eq("note_type", typeFilter);
  if (mine && user) query = query.eq("author_id", user.id);
  if (search) query = query.ilike("content", `%${search}%`);

  const { data: noteData } = await query;
  const notes = (noteData as NoteRow[] | null) ?? [];

  const bookingIds = Array.from(new Set(notes.map((note) => note.booking_request_id)));
  const authorIds = Array.from(new Set(notes.map((note) => note.author_id)));

  const [{ data: bookingData }, { data: authorData }] = await Promise.all([
    bookingIds.length
      ? supabase
          .from("booking_requests")
          .select("id, code, contact_name")
          .in("id", bookingIds)
      : Promise.resolve({ data: [] }),
    authorIds.length
      ? supabase.from("profiles").select("id, full_name, email").in("id", authorIds)
      : Promise.resolve({ data: [] }),
  ]);

  const bookingById = new Map(
    ((bookingData as Pick<BookingRequest, "id" | "code" | "contact_name">[] | null) ?? []).map(
      (booking) => [booking.id, booking],
    ),
  );
  const authorById = new Map(
    ((authorData as Pick<Profile, "id" | "full_name" | "email">[] | null) ?? []).map((profile) => [
      profile.id,
      profile,
    ]),
  );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
          Ghi chú khách hàng
        </p>
        <h1 className="mt-1 text-3xl font-bold text-brand-ink">Lịch sử chăm sóc khách</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
          Toàn bộ ghi chú nội bộ từ các booking, để Sales/Admin không mất ngữ cảnh. Ghi chú chỉ
          hiển thị nội bộ, không hiện cho khách.
        </p>
      </section>

      {/* Bộ lọc */}
      <form
        method="get"
        className="flex flex-col gap-3 rounded-[22px] border border-black/5 bg-white p-3 shadow-card sm:flex-row sm:items-center"
      >
        <label className="relative flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
          />
          <input
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Tìm trong nội dung ghi chú…"
            className="h-11 w-full rounded-xl border border-black/[0.07] bg-brand-cream/[0.5] pl-10 pr-4 text-sm text-brand-ink outline-none transition focus:border-brand-green/30 focus:bg-white"
          />
        </label>
        <select
          name="type"
          defaultValue={typeFilter}
          className="h-11 rounded-xl border border-black/[0.07] bg-white px-3 text-sm font-semibold text-brand-ink outline-none focus:border-brand-green/30"
        >
          <option value="all">Tất cả loại</option>
          {SALES_NOTE_TYPES.map((type) => (
            <option key={type} value={type}>
              {SALES_NOTE_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-black/[0.07] px-3 text-sm font-semibold text-brand-muted">
          <input type="checkbox" name="mine" value="1" defaultChecked={mine} className="accent-brand-green" />
          Của tôi
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-green px-5 text-sm font-bold text-white"
        >
          <Icon name="sliders" className="h-4 w-4" />
          Lọc
        </button>
        {(search || typeFilter !== "all" || mine) && (
          <Link
            href={ROUTES.salesNotes}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-black/10 px-4 text-sm font-bold text-brand-muted hover:text-brand-green"
          >
            <Icon name="x" className="h-4 w-4" />
            Xóa
          </Link>
        )}
      </form>

      {notes.length === 0 ? (
        <div className="grid min-h-56 place-items-center rounded-[26px] border border-black/5 bg-white p-8 text-center shadow-card">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-green-soft text-brand-green">
              <Icon name="list" className="h-5 w-5" />
            </span>
            <p className="mt-3 font-bold text-brand-ink">Chưa có ghi chú phù hợp</p>
            <p className="mt-1 text-sm text-brand-muted">
              Ghi chú được tạo từ trang chi tiết booking sẽ xuất hiện ở đây.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {notes.map((note) => {
            const booking = bookingById.get(note.booking_request_id);
            const author = authorById.get(note.author_id);
            return (
              <article
                key={note.id}
                className="flex flex-col rounded-[22px] border border-black/5 bg-white p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={NOTE_TONE[note.note_type]}>
                    {SALES_NOTE_TYPE_LABELS[note.note_type]}
                  </Badge>
                  <time className="text-[10px] text-brand-muted">
                    {formatDateTime(note.created_at)}
                  </time>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-brand-ink">
                  {note.content}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
                  <span className="min-w-0 text-xs text-brand-muted">
                    <span className="font-semibold text-brand-ink">
                      {booking?.contact_name ?? "Khách"}
                    </span>
                    {" · "}
                    {author?.full_name ?? author?.email ?? "Sales"}
                  </span>
                  {booking && (
                    <Link
                      href={ROUTES.salesBooking(booking.id)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-green-soft px-3 py-1.5",
                        "text-[11px] font-bold text-brand-green transition hover:bg-brand-green hover:text-white",
                      )}
                    >
                      {booking.code}
                      <Icon name="arrow-right" className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
