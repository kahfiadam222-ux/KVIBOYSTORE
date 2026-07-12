import { Input } from "@/components/ui/input";

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/" className="mb-8">
      <Input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Cari produk, misalnya Netflix, Canva, ChatGPT..."
        className="h-12 rounded-2xl px-5 text-base"
      />
    </form>
  );
}
