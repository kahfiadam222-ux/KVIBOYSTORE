import type { StatusTone } from "@/lib/orders/stateLabels";

const TONE_STYLES: Record<StatusTone, React.CSSProperties> = {
  success: { background: "color-mix(in oklch, var(--chart-1) 18%, transparent)", color: "var(--chart-1)" },
  warning: { background: "color-mix(in oklch, var(--chart-2) 18%, transparent)", color: "var(--chart-2)" },
  error: { background: "color-mix(in oklch, var(--chart-3) 18%, transparent)", color: "var(--chart-3)" },
  neutral: { background: "var(--muted)", color: "var(--muted-foreground)" },
};

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span
      className="inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium whitespace-nowrap"
      style={TONE_STYLES[tone]}
    >
      {label}
    </span>
  );
}
