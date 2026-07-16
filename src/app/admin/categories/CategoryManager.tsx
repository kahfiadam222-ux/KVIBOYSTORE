"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { compressImageDetailed } from "@/lib/image";
import { IMAGE_PRESETS } from "@/lib/image-presets";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
  type CategoryActionState,
} from "./actions";
import type { SidebarCategory } from "@/lib/categories/defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2 } from "lucide-react";

const initial: CategoryActionState = { ok: false };

/** Small logo picker shared by add/edit forms. Compresses to a data URL and
 *  writes it into a hidden `iconUrl` input. */
function LogoPicker({
  currentUrl,
  onClearFlag,
}: {
  currentUrl?: string | null;
  onClearFlag?: (cleared: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { dataUrl } = await compressImageDetailed(file, IMAGE_PRESETS.avatar);
      setPreview(dataUrl);
      onClearFlag?.(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memproses logo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background/40">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] text-muted-foreground">Logo</span>
        )}
      </div>
      <input type="hidden" name="iconUrl" value={preview ?? ""} />
      <input type="hidden" name="clearIcon" value={preview ? "0" : "1"} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        className="h-9 rounded-lg gap-1.5"
      >
        <Upload className="h-3.5 w-3.5" />
        {busy ? "Memproses..." : preview ? "Ganti logo" : "Unggah logo"}
      </Button>
      {preview && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setPreview(null);
            onClearFlag?.(true);
            if (fileRef.current) fileRef.current.value = "";
          }}
          className="h-9 rounded-lg text-destructive"
        >
          Hapus logo
        </Button>
      )}
    </div>
  );
}

function AddForm() {
  const [state, formAction, pending] = useActionState(createCategory, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card/40 p-5 backdrop-blur-xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="add-label">Nama kategori</Label>
          <Input id="add-label" name="label" required placeholder="Netflix" className="h-10 rounded-xl" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="add-href">Tautan / kata kunci</Label>
          <Input id="add-href" name="href" placeholder="/?q=netflix" className="h-10 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Logo (opsional)</Label>
        <LogoPicker />
      </div>

      <div className="flex flex-col gap-2 sm:max-w-[160px]">
        <Label htmlFor="add-sort">Urutan</Label>
        <Input id="add-sort" name="sortOrder" type="number" defaultValue={0} className="h-10 rounded-xl" />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && <p className="text-sm text-primary">Kategori ditambahkan.</p>}

      <div>
        <Button type="submit" disabled={pending} className="h-10 rounded-xl font-semibold">
          {pending ? "Menyimpan..." : "Tambah kategori"}
        </Button>
      </div>
    </form>
  );
}

function CategoryRow({ category }: { category: SidebarCategory }) {
  const [state, formAction, pending] = useActionState(updateCategory, initial);

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4 backdrop-blur-xl">
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={category.id} />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Nama</Label>
            <Input name="label" defaultValue={category.label} required className="h-9 rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Tautan / kata kunci</Label>
            <Input name="href" defaultValue={category.href} className="h-9 rounded-lg" />
          </div>
        </div>

        <LogoPicker currentUrl={category.iconUrl} />

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5 w-24">
            <Label className="text-xs">Urutan</Label>
            <Input name="sortOrder" type="number" defaultValue={category.sortOrder} className="h-9 rounded-lg" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={category.isActive}
              className="h-4 w-4 rounded border-border accent-[var(--primary)]"
            />
            Aktif
          </label>
        </div>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.ok && <p className="text-sm text-primary">Tersimpan.</p>}

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={pending} className="h-9 rounded-lg font-semibold">
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toggleCategory(category.id, category.isActive)}
            className="h-9 rounded-lg"
          >
            {category.isActive ? "Nonaktifkan" : "Aktifkan"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm(`Hapus kategori "${category.label}"?`)) {
                deleteCategory(category.id);
              }
            }}
            className="h-9 rounded-lg gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Hapus
          </Button>
        </div>
      </form>
    </div>
  );
}

export function CategoryManager({ categories }: { categories: SidebarCategory[] }) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Tambah kategori</h2>
        <AddForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Semua kategori ({categories.length})
        </h2>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada kategori.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map((cat) => (
              <CategoryRow key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
