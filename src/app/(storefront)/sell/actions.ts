"use server";

import { createHmac } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";

function hashKtp(ktpNumber: string): string {
  const secret =
    process.env.KTP_HASH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "kvibo-dev-ktp-secret";
  return createHmac("sha256", secret).update(ktpNumber).digest("hex");
}

export async function applyAsSeller(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Silakan masuk untuk mendaftar sebagai penjual.")}`);
  }

  const legalName = String(formData.get("legalName") ?? "").trim();
  const ktpNumber = String(formData.get("ktpNumber") ?? "").replace(/\D/g, "");

  if (legalName.length < 3 || legalName.length > 120) {
    redirect(`/sell?error=${encodeURIComponent("Nama lengkap wajib diisi (3–120 karakter).")}`);
  }

  if (!/^\d{16}$/.test(ktpNumber)) {
    redirect(`/sell?error=${encodeURIComponent("Nomor KTP harus 16 digit angka.")}`);
  }

  const ip = await getClientIp();
  const limit = checkRateLimit(`sell-apply:${user.id}:${ip}`, 3, 60 * 60 * 1000);
  if (!limit.allowed) {
    redirect(`/sell?error=${encodeURIComponent("Terlalu banyak percobaan. Coba lagi nanti.")}`);
  }

  const admin = createAdminClient();

  // Block re-apply that would demote an already-approved / pending seller.
  const { data: existing } = await admin
    .from("seller_profiles")
    .select("verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.verification_status === "approved") {
    redirect(`/sell?error=${encodeURIComponent("Akun Anda sudah terverifikasi sebagai penjual.")}`);
  }
  if (
    existing?.verification_status === "pending_kyc" ||
    existing?.verification_status === "pending_review"
  ) {
    redirect(`/sell?error=${encodeURIComponent("Pendaftaran Anda masih dalam proses review.")}`);
  }

  const ktpNumberHash = hashKtp(ktpNumber);

  const { error: profileError } = await admin.from("seller_profiles").upsert({
    user_id: user.id,
    legal_name: legalName,
    ktp_number_hash: ktpNumberHash,
    verification_status: "pending_kyc",
  });

  if (profileError) {
    redirect(`/sell?error=${encodeURIComponent("Gagal mengirim pendaftaran, coba lagi.")}`);
  }

  await admin.from("seller_verifications").insert({
    user_id: user.id,
    status: "pending_review",
  });

  await admin.from("profiles").update({ kyc_status: "pending" }).eq("id", user.id);

  redirect("/sell/submitted");
}
