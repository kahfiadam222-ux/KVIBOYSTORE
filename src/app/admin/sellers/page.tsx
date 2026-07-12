import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveSeller, rejectSeller } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminSellersPage() {
  await requireAdmin();

  const admin = createAdminClient();

  const { data: verifications } = await admin
    .from("seller_verifications")
    .select(
      "id, status, sla_deadline, submitted_at, profiles!seller_verifications_user_id_fkey ( id, email ), user_id",
    )
    .order("submitted_at", { ascending: true });

  const pending = (verifications ?? []).filter(
    (v) => v.status === "pending_review" || v.status === "pending_kyc",
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">
        Antrian Verifikasi Seller
      </h1>

      {pending.length === 0 ? (
        <p className="text-muted-foreground">Tidak ada pendaftaran yang menunggu.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((v) => {
            const profile = v.profiles as unknown as { id: string; email: string } | null;
            const approveWithIds = approveSeller.bind(null, v.id, v.user_id);
            const rejectWithIds = rejectSeller.bind(null, v.id, v.user_id, "Tidak memenuhi kriteria");

            return (
              <Card key={v.id}>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{profile?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Diajukan{" "}
                      {new Date(v.submitted_at).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{v.status}</Badge>
                    <form action={approveWithIds}>
                      <Button type="submit" size="sm">
                        Setujui
                      </Button>
                    </form>
                    <form action={rejectWithIds}>
                      <Button type="submit" size="sm" variant="destructive">
                        Tolak
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
