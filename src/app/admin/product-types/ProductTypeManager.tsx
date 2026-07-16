"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  createProductType,
  updateProductType,
  deleteProductType,
  RISK_TIERS,
  DELIVERY_METHODS,
  type ProductTypeActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Package } from "lucide-react";

export interface ProductTypeRow {
  id: string;
  name: string;
  riskTier: string;
  deliveryMethod: string;
}

const initial: ProductTypeActionState = { ok: false };

const TIER_LABELS: Record<string, string> = {
  tier_1: "Tier 1 · risiko rendah",
  tier_2: "Tier 2 · risiko sedang",
  tier_3: "Tier 3 · risiko tinggi",
};

const METHOD_LABELS: Record<string, string> = {
  shared_account: "Akun bersama",
  private_account: "Akun pribadi",
  invite_family: "Undang family plan",
  voucher: "Voucher",
  redeem_code: "Kode redeem",
  license_key: "Lisensi key",
  lifetime_license: "Lisensi seumur hidup",
};

function TierSelect({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? "tier_1"}
      className="form-select-glass h-9 rounded-lg px-3 text-sm cursor-pointer border-border bg-background/50"
    >
      {RISK_TIERS.map((t) => (
        <option key={t} value={t} className="bg-popover text-foreground">
          {TIER_LABELS[t]}
        </option>
      ))}
    </select>
  );
}

function MethodSelect({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? "redeem_code"}
      className="form-select-glass h-9 rounded-lg px-3 text-sm cursor-pointer border-border bg-background/50"
    >
      {DELIVERY_METHODS.map((m) => (
        <option key={m} value={m} className="bg-popover text-foreground">
          {METHOD_LABELS[m]}
        </option>
      ))}
    </select>
  );
}

function AddForm() {
  const [state, formAction, pending] = useActionState(createProductType, initial);
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
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2 sm:col-span-1">
          <Label htmlFor="pt-name">Nama jenis</Label>
          <Input id="pt-name" name="name" required placeholder="Netflix" className="h-9 rounded-lg" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pt-tier">Risk tier</Label>
          <TierSelect name="riskTier" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pt-method">Metode pengiriman</Label>
          <MethodSelect name="deliveryMethod" />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && <p className="text-sm text-primary">Jenis produk ditambahkan.</p>}

      <div>
        <Button type="submit" disabled={pending} className="h-10 rounded-xl font-semibold">
          {pending ? "Menyimpan..." : "Tambah jenis produk"}
        </Button>
      </div>
    </form>
  );
}

function Row({ pt }: { pt: ProductTypeRow }) {
  const [state, formAction, pending] = useActionState(updateProductType, initial);
  const [deleting, startDelete] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4 backdrop-blur-xl">
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={pt.id} />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Nama</Label>
            <Input name="name" defaultValue={pt.name} required className="h-9 rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Risk tier</Label>
            <TierSelect name="riskTier" defaultValue={pt.riskTier} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Metode pengiriman</Label>
            <MethodSelect name="deliveryMethod" defaultValue={pt.deliveryMethod} />
          </div>
        </div>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.ok && <p className="text-sm text-primary">Tersimpan.</p>}

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={pending} className="h-9 rounded-lg font-semibold">
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={() => {
              if (!confirm(`Hapus jenis produk "${pt.name}"?`)) return;
              startDelete(async () => {
                const res = await deleteProductType(pt.id);
                if (!res.ok && res.error) alert(res.error);
              });
            }}
            className="h-9 rounded-lg gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> {deleting ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function ProductTypeManager({ productTypes }: { productTypes: ProductTypeRow[] }) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Tambah jenis produk</h2>
        <AddForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
          <Package className="h-4.5 w-4.5 text-primary" />
          Semua jenis produk ({productTypes.length})
        </h2>
        {productTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada jenis produk.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {productTypes.map((pt) => (
              <Row key={pt.id} pt={pt} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
