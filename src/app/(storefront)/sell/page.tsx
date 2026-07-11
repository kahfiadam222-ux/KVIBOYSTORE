import { applyAsSeller } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Daftar Jadi Penjual</CardTitle>
          <CardDescription>
            Verifikasi biasanya selesai dalam 1–2 hari kerja. Setelah disetujui,
            deposit keamanan Rp500.000 akan diminta sebelum listing pertama aktif.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={applyAsSeller} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="legalName">Nama Lengkap (sesuai KTP)</Label>
              <Input id="legalName" name="legalName" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ktpNumber">Nomor KTP</Label>
              <Input id="ktpNumber" name="ktpNumber" required minLength={16} maxLength={16} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Kirim Pendaftaran
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
