import { cn } from "@/lib/utils";

type StorefrontImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  /** Eager load + high fetch priority for above-the-fold visuals. */
  priority?: boolean;
  /** Subtle gradient overlay to keep text readable without hiding image detail. */
  overlay?: "product" | "banner" | "banner-vertical" | "none";
};

const overlayClass = {
  product:
    "bg-gradient-to-t from-card/90 via-card/15 to-transparent",
  banner:
    "bg-gradient-to-br from-background/45 via-background/10 to-transparent",
  "banner-vertical":
    "bg-gradient-to-t from-background/50 via-background/10 to-transparent",
  none: "",
} as const;

export function StorefrontImage({
  src,
  alt,
  className,
  priority = false,
  overlay = "none",
}: StorefrontImageProps) {
  if (!src) {
    return (
      <div
        className={cn("h-full w-full bg-[var(--primary-gradient)]", className)}
        aria-hidden
      />
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out will-change-transform group-hover/card:scale-105"
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
      />
      {overlay !== "none" && (
        <div
          className={cn("pointer-events-none absolute inset-0", overlayClass[overlay])}
          aria-hidden
        />
      )}
    </div>
  );
}