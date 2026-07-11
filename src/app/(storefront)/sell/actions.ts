"use server";

import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function applyAsSeller(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Silakan masuk untuk mendaftar sebagai penjual.")}`);
  }

  const legalName = formData.get("legalName") as string;
  const ktpNumber = formData.get("ktpNumber") as string;

  const admin = createAdminClient();

  // Never store the KTP number itself — only a hash, so a data leak can't expose it.
  const ktpNumberHash = createHash("sha256").update(ktpNumber).digest("hex");

  const { error: profileError } = await admin.from("seller_profiles").upsert({
    user_id: user!.id,
    legal_name: legalName,
    ktp_number_hash: ktpNumberHash,
    verification_status: "pending_kyc",
  });

  if (profileError) {
    redirect(`/sell?error=${encodeURIComponent("Gagal mengirim pendaftaran, coba lagi.")}`);
  }

  await admin.from("seller_verifications").insert({
    user_id: user!.id,
    status: "pending_review",
  });

  await admin.from("profiles").update({ kyc_status: "pending" }).eq("id", user!.id);

  redirect("/sell/submitted");
}
