import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ROUTES } from "@/lib/constants";

export function BookingButton({
  tourPackageId,
  label = "Gửi yêu cầu tư vấn",
  size = "lg",
  variant = "primary",
  className = "w-full",
}: {
  tourPackageId: string;
  label?: string;
  size?: "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
}) {
  return (
    <ButtonLink
      href={ROUTES.bookingRequest(tourPackageId)}
      className={className}
      size={size}
      variant={variant}
    >
      {label}
      <Icon name="arrow-right" className="h-4 w-4" />
    </ButtonLink>
  );
}
