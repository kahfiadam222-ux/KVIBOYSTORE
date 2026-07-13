import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/" className="relative mb-8 group max-w-2xl mx-auto">
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors">
        <Search className="size-5" />
      </div>
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Cari produk, misalnya Netflix, Canva, ChatGPT..."
        className="h-12 w-full rounded-2xl pl-12 pr-5 text-base border-border bg-background/20 backdrop-blur-lg transition-all duration-300 focus-visible:border-primary/80 focus-visible:ring-3 focus-visible:ring-primary/30 shadow-md hover:border-border/80 dark:bg-input/10"
      />
    </form>
  );
}
