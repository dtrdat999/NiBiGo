import { ROUTES } from "@/lib/constants";
import type { UserRole } from "@/types";

export function homeRouteForRole(role: UserRole | string | null | undefined) {
  if (role === "sales") return ROUTES.salesDashboard;
  if (role === "admin") return ROUTES.admin;
  return ROUTES.dashboard;
}
