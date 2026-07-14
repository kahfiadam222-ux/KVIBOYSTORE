import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  defaultValue,
  embedded = false,
}: {
  defaultValue?: string;
  embedded?: boolean;
}) {
  return (
    <form
      action="/"
      className={cn(
        "relative group",
        embedded ? "mb-0 max-w-none" : "mb-8 max-w-2xl mx-auto"
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors">
        <Search className="size-5" />
      </div>
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Cari produk — Netflix, Canva, Copilot..."
        className={cn(
          "h-12 w-full rounded-2xl pl-12 pr-5 text-base transition-all duration-300",
          "border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-xl",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),var(--shadow-card)]",
          "hover:border-primary/25 focus-visible:border-primary/70 focus-visible:ring-3 focus-visible:ring-primary/25"
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"
        style={{
          boxShadow:
            "0 0 0 1px color-mix(in oklch, var(--primary) 28%, transparent), 0 12px 40px -16px color-mix(in oklch, var(--primary) 35%, transparent)",
        }}
      />
    </form>
  );
}
