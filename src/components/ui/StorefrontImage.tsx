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
  const resolvedSrc = src?.trim() || null;

  if (!resolvedSrc) {
    return (
      <div
        className={cn(
          "relative h-full w-full bg-[var(--primary-gradient)] flex items-center justify-center",
          className,
        )}
        aria-hidden
      >
        <svg
          className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground/40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-muted/30", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out will-change-transform group-hover/card:scale-105"
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
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