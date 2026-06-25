/**
 * Domain types — khớp với docs/DATA_SCHEMA.md.
 * Khi có Supabase, bổ sung type sinh tự động (`supabase gen types typescript`)
 * và để type DB ở file riêng; file này giữ các shape domain + JSONB.
 */

export type UserRole = "buyer" | "sales" | "editor" | "admin";
// 'activity' là bucket chung cho tour/trải nghiệm (engine phụ thuộc — xem DATA_SCHEMA.md).
export type ProductType = "hotel" | "homestay" | "activity" | "restaurant" | "transport" | "combo";
export type AvailabilityStatus = "available" | "limited" | "sold_out" | "need_confirmation";
export type PackageTier = "budget" | "balanced" | "premium";
export type TripStatus = "draft" | "generated" | "revised" | "submitted";
export type BookingStatus =
  | "new"
  | "contacted"
  | "checking_availability"
  | "waiting_payment"
  | "confirmed"
  | "completed"
  | "cancelled";
export type ContentStatus = "draft" | "pending_review" | "published" | "archived" | "rejected";
export type OrderStatus =
  | "pending_confirmation"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "refund_requested"
  | "refunded";
export type PaymentStatus = "unpaid" | "pending" | "paid_demo" | "refunded";
export type TravelStyle = "relaxing" | "active" | "cultural" | "family";
export type PriceUnit = "per_person" | "per_group" | "per_night" | "per_trip";
export type SlotTime = "morning" | "noon" | "afternoon" | "evening";
export type SalesNoteType =
  | "contact_attempt"
  | "customer_preference"
  | "price_discussion"
  | "partner_confirmation"
  | "risk_warning"
  | "follow_up"
  | "general";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface TravelProduct {
  id: string;
  name: string;
  type: ProductType;
  destination_id: string;
  description: string | null;
  price: number;
  price_unit: PriceUnit;
  duration_hours: number | null;
  tags: string[];
  suitable_for: string[];
  availability_status: AvailabilityStatus;
  quality_score: number;
  image_url: string | null;
  is_active: boolean;
  status?: ContentStatus;
  created_by?: string | null;
  slug?: string | null;
}

export interface ProductLocation {
  id: string;
  product_id: string;
  lat: number;
  lng: number;
  address: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  tags: string[];
  related_product_ids: string[];
  status: ContentStatus;
  author_id: string | null;
  published_at: string | null;
}

export interface GroupComposition {
  adults: number;
  children: number;
  elderly: number;
}

export interface TripRequest {
  id: string;
  user_id: string;
  destination_id: string;
  num_days: number;
  num_nights: number;
  start_date: string | null;
  num_people: number;
  budget: number;
  travel_style: string | null;
  interests: string[];
  group_composition: GroupComposition;
  special_requests: string | null;
  status: TripStatus;
  created_at: string;
}

/** Shape JSONB của tour_packages.cost_breakdown. Backend là nguồn sự thật. */
export interface CostBreakdown {
  hotel: number;
  activity: number;
  restaurant: number;
  transport: number;
  other: number;
  total: number;
}

/** Shape JSONB của tour_packages.itinerary[].slots[]. */
export interface ItinerarySlot {
  time: SlotTime;
  product_id: string;
  description: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  slots: ItinerarySlot[];
}

export interface TourPackage {
  id: string;
  trip_request_id: string;
  tier: PackageTier;
  name: string;
  total_price: number;
  fit_score: number;
  recommendation_reason: string | null;
  itinerary: ItineraryDay[];
  cost_breakdown: CostBreakdown;
  conditions: string[];
  is_selected: boolean;
  revision_count: number;
}

export interface BookingRequest {
  id: string;
  code: string;
  user_id: string;
  trip_request_id: string;
  tour_package_id: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  note_from_guest: string | null;
  total_price: number;
  ai_sales_note: string | null;
  status: BookingStatus;
  payment_status?: PaymentStatus;
  assigned_sales_id?: string | null;
  final_price?: number | null;
  final_price_note?: string | null;
  final_price_confirmed_at?: string | null;
  customer_agreed?: boolean;
  contact_status?: ContactStatus;
  last_contacted_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface BookingStatusLog {
  id: string;
  booking_request_id: string;
  from_status: BookingStatus | null;
  to_status: BookingStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export type ContactStatus =
  | "not_contacted"
  | "contacted"
  | "no_response"
  | "interested"
  | "negotiating"
  | "confirmed"
  | "lost";

export type FollowUpType =
  | "call_attempt"
  | "zalo_message"
  | "email_sent"
  | "callback_requested"
  | "price_discussion"
  | "itinerary_discussion"
  | "waiting_partner";

export type FollowUpStatus = "open" | "done" | "cancelled";

export interface BookingFollowUp {
  id: string;
  booking_request_id: string;
  due_at: string;
  content: string;
  follow_up_type: FollowUpType;
  status: FollowUpStatus;
  result_note: string | null;
  created_by: string | null;
  done_by: string | null;
  done_at: string | null;
  created_at: string;
}

export type AvailabilityCheckCategory =
  | "accommodation"
  | "transport"
  | "activity"
  | "restaurant";

export type AvailabilityCheckStatus =
  | "pending"
  | "available"
  | "limited"
  | "not_available"
  | "replaced";

export interface BookingAvailabilityCheck {
  id: string;
  booking_request_id: string;
  category: AvailabilityCheckCategory;
  status: AvailabilityCheckStatus;
  note: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface Order {
  id: string;
  code: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_price: number;
  assigned_sales_id: string | null;
  note_from_buyer: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
}

export interface OrderStatusLog {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  status: string;
  reference: string | null;
  paid_at: string | null;
  created_at: string;
}
