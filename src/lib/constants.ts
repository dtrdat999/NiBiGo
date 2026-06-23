/** Hằng số dùng chung toàn app. Giữ đồng bộ với docs/DATA_SCHEMA.md + docs/AI_DESIGN.md. */

export const APP_NAME = "NiBiGo AI Travel Platform";
export const ENGINE_NAME = "NiBi AI";
export const BOOKING_CODE_PREFIX = "NBG";

/** Route trung tâm — tránh hardcode chuỗi rải rác. */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  plan: "/plan",
  proposals: (requestId: string) => `/proposals/${requestId}`,
  tour: (packageId: string) => `/tour/${packageId}`,
  booking: (code: string) => `/bookings/${code}`,
  admin: "/admin",
  adminBookings: "/admin/bookings",
  adminProducts: "/admin/products",
} as const;

/** Mirror các enum trong DB (DATA_SCHEMA.md §1). */
export const PRODUCT_TYPES = ["hotel", "homestay", "activity", "restaurant", "transport", "combo"] as const;
export const AVAILABILITY_STATUSES = ["available", "limited", "sold_out", "need_confirmation"] as const;
export const PACKAGE_TIERS = ["budget", "balanced", "premium"] as const;
export const TRIP_STATUSES = ["draft", "generated", "revised", "submitted"] as const;
export const BOOKING_STATUSES = [
  "new",
  "contacted",
  "checking_availability",
  "waiting_payment",
  "confirmed",
  "completed",
  "cancelled",
] as const;
export const ORDER_STATUSES = [
  "pending_confirmation",
  "awaiting_payment",
  "paid",
  "processing",
  "confirmed",
  "completed",
  "cancelled",
  "refund_requested",
  "refunded",
] as const;
export const CONTENT_STATUSES = ["draft", "pending_review", "published", "archived", "rejected"] as const;
export const PAYMENT_STATUSES = ["unpaid", "pending", "paid_demo", "refunded"] as const;
export const USER_ROLES = ["buyer", "sales", "editor", "admin"] as const;

/** Trọng số Fit Score (AI_DESIGN.md §3). Tổng = 100. */
export const FIT_SCORE_WEIGHTS = {
  budget: 30,
  interest: 25,
  group: 20,
  duration: 15,
  quality: 10,
} as const;

/** Hệ số ngân sách mục tiêu theo tier (package-builder). */
export const TIER_BUDGET_FACTOR = {
  budget: 0.75,
  balanced: 0.98,
  premium: 1.2,
} as const;

/** Nhãn tiếng Việt cho tier gói tour (UI). */
export const PACKAGE_TIER_LABELS: Record<(typeof PACKAGE_TIERS)[number], string> = {
  budget: "Tiết kiệm",
  balanced: "Cân bằng",
  premium: "Trải nghiệm",
};

/** Tag chuẩn cho sản phẩm & sở thích khách. */
export const TAGS = [
  "nature",
  "photo",
  "couple",
  "family",
  "budget",
  "premium",
  "relaxing",
  "food",
  "culture",
  "active",
  "kids",
  "elderly-friendly",
] as const;

/** Nhãn tiếng Việt cho trạng thái booking (UI). */
export const BOOKING_STATUS_LABELS: Record<(typeof BOOKING_STATUSES)[number], string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  checking_availability: "Đang kiểm tra chỗ",
  waiting_payment: "Chờ thanh toán",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

/** Nhãn tiếng Việt cho trạng thái order (UI). */
export const ORDER_STATUS_LABELS: Record<(typeof ORDER_STATUSES)[number], string> = {
  pending_confirmation: "Chờ xác nhận",
  awaiting_payment: "Chờ thanh toán",
  paid: "Đã thanh toán",
  processing: "Đang xử lý",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  refund_requested: "Yêu cầu hoàn tiền",
  refunded: "Đã hoàn tiền",
};

/** Nhãn tiếng Việt cho payment status (UI). */
export const PAYMENT_STATUS_LABELS: Record<(typeof PAYMENT_STATUSES)[number], string> = {
  unpaid: "Chưa thanh toán",
  pending: "Đang chờ",
  paid_demo: "Đã thanh toán (demo)",
  refunded: "Đã hoàn tiền",
};

/** Nhãn tiếng Việt cho trạng thái nội dung/sản phẩm (UI). */
export const CONTENT_STATUS_LABELS: Record<(typeof CONTENT_STATUSES)[number], string> = {
  draft: "Nháp",
  pending_review: "Chờ duyệt",
  published: "Đã đăng",
  archived: "Lưu trữ",
  rejected: "Bị từ chối",
};

/** Nhãn tiếng Việt cho vai trò người dùng (UI). */
export const USER_ROLE_LABELS: Record<(typeof USER_ROLES)[number], string> = {
  buyer: "Khách hàng",
  sales: "Sales",
  editor: "Editor/MOD",
  admin: "Admin",
};

/** Nhãn tiếng Việt cho tình trạng chỗ (UI). */
export const AVAILABILITY_LABELS: Record<(typeof AVAILABILITY_STATUSES)[number], string> = {
  available: "Còn chỗ",
  limited: "Sắp hết",
  sold_out: "Hết chỗ",
  need_confirmation: "Cần xác nhận",
};

/** Nhãn tiếng Việt cho loại sản phẩm (UI). */
export const PRODUCT_TYPE_LABELS: Record<(typeof PRODUCT_TYPES)[number], string> = {
  hotel: "Khách sạn",
  homestay: "Homestay",
  activity: "Hoạt động",
  restaurant: "Ăn uống",
  transport: "Di chuyển",
  combo: "Combo",
};

/** Đơn vị tính giá (cột price_unit là text, không phải enum DB). */
export const PRICE_UNITS = ["per_person", "per_group", "per_night", "per_trip"] as const;

export const PRICE_UNIT_LABELS: Record<(typeof PRICE_UNITS)[number], string> = {
  per_person: "/ người",
  per_group: "/ nhóm",
  per_night: "/ đêm",
  per_trip: "/ chuyến",
};

/** Đối tượng phù hợp (suitable_for). */
export const SUITABLE_FOR = ["solo", "couple", "family", "group", "kids", "elderly"] as const;

export const SUITABLE_FOR_LABELS: Record<(typeof SUITABLE_FOR)[number], string> = {
  solo: "Một mình",
  couple: "Cặp đôi",
  family: "Gia đình",
  group: "Nhóm",
  kids: "Trẻ em",
  elderly: "Người lớn tuổi",
};

/** Phong cách du lịch (travel_style). */
export const TRAVEL_STYLES = ["relaxing", "active", "cultural", "family"] as const;

export const TRAVEL_STYLE_LABELS: Record<(typeof TRAVEL_STYLES)[number], string> = {
  relaxing: "Nghỉ dưỡng nhẹ",
  active: "Năng động, khám phá",
  cultural: "Văn hóa, tâm linh",
  family: "Gia đình, thư giãn",
};

/** Sở thích cho form (value = tag, khớp products.tags để scoring). */
export const INTEREST_OPTIONS: { value: string; label: string }[] = [
  { value: "nature", label: "Thiên nhiên" },
  { value: "photo", label: "Chụp ảnh" },
  { value: "relaxing", label: "Nghỉ dưỡng" },
  { value: "food", label: "Ẩm thực" },
  { value: "culture", label: "Văn hóa" },
  { value: "active", label: "Năng động" },
  { value: "couple", label: "Cặp đôi" },
  { value: "family", label: "Gia đình" },
  { value: "kids", label: "Trẻ em" },
];

/** Gợi ý ngân sách nhanh (VND). */
export const BUDGET_PRESETS = [6_000_000, 8_000_000, 10_000_000, 15_000_000] as const;

/** Nhãn trạng thái trip request (UI). */
export const TRIP_STATUS_LABELS: Record<(typeof TRIP_STATUSES)[number], string> = {
  draft: "Nháp",
  generated: "Đã tạo gói",
  revised: "Đã chỉnh",
  submitted: "Đã gửi booking",
};
