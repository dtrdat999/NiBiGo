import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-helpers";
import { tripRequestSchema } from "@/lib/validation/trip";

/** POST /api/trip-requests — guest tạo nhu cầu chuyến đi (status 'draft'). */
export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = tripRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const { data: dest } = await supabase
    .from("destinations")
    .select("id")
    .eq("slug", "ninh-binh")
    .single();
  if (!dest) {
    return NextResponse.json(
      { error: "Chưa có điểm đến Ninh Bình — hãy chạy seed.sql." },
      { status: 400 },
    );
  }

  const num_people = input.adults + input.children + input.elderly;
  const num_nights = Math.max(0, input.num_days - 1);

  const { data, error } = await supabase
    .from("trip_requests")
    .insert({
      user_id: user!.id,
      destination_id: dest.id,
      num_days: input.num_days,
      num_nights,
      start_date: input.start_date || null,
      num_people,
      budget: input.budget,
      travel_style: input.travel_style,
      interests: input.interests,
      group_composition: {
        adults: input.adults,
        children: input.children,
        elderly: input.elderly,
      },
      special_requests: input.special_requests || null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
