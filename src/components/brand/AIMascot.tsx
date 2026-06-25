"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  MASCOT_ASSETS,
  type MascotState,
} from "@/lib/mascot-assets";
import { cn } from "@/lib/utils";

const STATIC_IMAGES: Record<Exclude<MascotState, "loading">, string> = {
  default: MASCOT_ASSETS.default.fallback,
  thinking: MASCOT_ASSETS.thinking.fallback,
  success: MASCOT_ASSETS.success.fallback,
  error: MASCOT_ASSETS.error.fallback,
};

const LOADING_IMAGES = [
  "/assets/brand/mascot/mascot-thinking.webp",
  "/assets/brand/mascot/mascot-loading-01.webp",
  "/assets/brand/mascot/mascot-loading-02.webp",
] as const;

const LOADING_TEXT = [
  "AI đang hiểu mong muốn của bạn…",
  "AI đang cân đối lịch trình và ngân sách…",
  "AI đang kiểm tra các lựa chọn phù hợp…",
] as const;

const ALT_TEXT: Record<MascotState, string> = {
  default: "Trợ lý AI du lịch",
  thinking: "AI đang suy nghĩ",
  loading: "AI đang chuẩn bị gợi ý",
  success: "Đã hoàn thành",
  error: "Chưa thể hoàn thành",
};

const SIZE_CLASS = {
  sm: "h-20 w-20",
  md: "h-28 w-28",
  lg: "h-40 w-40",
  xl: "h-56 w-56",
} as const;

export function AIMascot({
  state = "default",
  size = "md",
  className,
  priority = false,
  showStatusText = false,
}: {
  state?: MascotState;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  priority?: boolean;
  showStatusText?: boolean;
}) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    LOADING_IMAGES.forEach((src) => {
      const image = new window.Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    if (state !== "loading") {
      setFrame(0);
      return;
    }

    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % LOADING_IMAGES.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [state]);

  const src =
    state === "loading" ? LOADING_IMAGES[frame] : STATIC_IMAGES[state];

  const mascot = (
    <span
      className={cn(
        "relative inline-block shrink-0",
        SIZE_CLASS[size],
        state === "loading" && "animate-mascot-float",
        className,
      )}
      role="img"
      aria-label={ALT_TEXT[state]}
    >
      <Image
        key={src}
        src={src}
        alt=""
        fill
        sizes={
          size === "xl"
            ? "224px"
            : size === "lg"
              ? "160px"
              : size === "md"
                ? "112px"
                : "80px"
        }
        className="animate-mascot-frame object-contain"
        priority={priority}
        unoptimized
      />
    </span>
  );

  if (!showStatusText || state !== "loading") return mascot;

  return (
    <span className="inline-flex flex-col items-center text-center">
      {mascot}
      <span
        key={LOADING_TEXT[frame]}
        className="mt-2 min-h-5 animate-mascot-text text-xs font-semibold text-brand-green"
        aria-live="polite"
      >
        {LOADING_TEXT[frame]}
      </span>
    </span>
  );
}
