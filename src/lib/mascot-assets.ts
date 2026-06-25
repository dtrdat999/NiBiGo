export type MascotState =
  | "default"
  | "thinking"
  | "loading"
  | "success"
  | "error";

/**
 * Danh mục asset mascot dùng trong Buyer/Guest UI.
 * WebP là asset hiển thị chính cho từng trạng thái.
 */
export const MASCOT_ASSETS: Record<
  MascotState,
  {
    fallback: string;
    usage: string;
  }
> = {
  default: {
    fallback: "/assets/brand/mascot/mascot-default.webp",
    usage: "Chào người dùng, empty state nhẹ và landing page.",
  },
  thinking: {
    fallback: "/assets/brand/mascot/mascot-thinking.webp",
    usage: "Đang hiểu yêu cầu hoặc chờ người dùng bổ sung thông tin.",
  },
  loading: {
    fallback: "/assets/brand/mascot/mascot-loading-01.webp",
    usage: "Đang cân đối lịch trình, ngân sách hoặc cập nhật phương án.",
  },
  success: {
    fallback: "/assets/brand/mascot/mascot-success.webp",
    usage: "Yêu cầu đã được lưu hoặc một thay đổi đã hoàn tất.",
  },
  error: {
    fallback: "/assets/brand/mascot/mascot-error.webp",
    usage: "Tác vụ chưa hoàn thành và người dùng có thể thử lại.",
  },
};
