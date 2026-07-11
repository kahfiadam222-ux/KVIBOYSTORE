"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function approveSeller(verificationId: string, userId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin
    .from("seller_verifications")
    .update({ status: "approved", decided_at: new Date().toISOString() })
    .eq("id", verificationId);

  await admin
    .from("seller_profiles")
    .update({ verification_status: "approved", active_since: new Date().toISOString() })
    .eq("user_id", userId);

  await admin
    .from("profiles")
    .update({ role: "seller", kyc_status: "verified" })
    .eq("id", userId);

  revalidatePath("/admin/sellers");
}

export async function rejectSeller(verificationId: string, userId: string, reason: string) {
  await requireAdmin();
  const admin = createAdminClient();

  await admin
    .from("seller_verifications")
    .update({ status: "rejected", decision_reason: reason, decided_at: new Date().toISOString() })
    .eq("id", verificationId);

  await admin
    .from("seller_profiles")
    .update({ verification_status: "rejected" })
    .eq("user_id", userId);

  await admin.from("profiles").update({ kyc_status: "rejected" }).eq("id", userId);

  revalidatePath("/admin/sellers");
}
