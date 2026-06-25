const SAFE_BOOKING_REQUEST_COPY =
  "Yêu cầu đã được ghi nhận; tư vấn viên sẽ kiểm tra lại dịch vụ, giá cuối và liên hệ xác nhận trước khi đặt.";

const UNSAFE_BOOKING_CLAIM_PATTERNS = [
  /đã\s*đặt[\p{L}\p{N}\s,.-]{0,40}thành\s*công/giu,
  /đặt\s*phòng[\p{L}\p{N}\s,.-]{0,24}thành\s*công/giu,
  /booking[\p{L}\p{N}\s,.-]{0,24}thành\s*công/giu,
  /giữ\s*chỗ[\p{L}\p{N}\s,.-]{0,24}thành\s*công/giu,
  /đã\s*xác\s*nhận\s*đặt/giu,
  /dịch\s*vụ[\p{L}\p{N}\s,.-]{0,32}đã\s*được\s*đặt/giu,
];

export function hasUnsafeBookingClaim(value: string) {
  return UNSAFE_BOOKING_CLAIM_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(value);
  });
}

export function sanitizeBookingPolicyCopy(value: string | null | undefined) {
  if (!value) return value ?? "";

  let result = value;
  for (const pattern of UNSAFE_BOOKING_CLAIM_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, SAFE_BOOKING_REQUEST_COPY);
  }

  return result;
}
