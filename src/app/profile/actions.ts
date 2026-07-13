"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sesi tidak valid. Silakan login kembali.");
  }

  const displayName = formData.get("displayName") as string;
  const phone = formData.get("phone") as string;
  const avatarUrl = formData.get("avatarUrl") as string;
  const coverUrl = formData.get("coverUrl") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      phone: phone || null,
      avatar_url: avatarUrl || null,
      cover_url: coverUrl || null,
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Gagal memperbarui profil: ${error.message}`);
  }

  revalidatePath("/profile");
  revalidatePath("/");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 6) {
    throw new Error("Kata sandi baru minimal 6 karakter.");
  }

  if (password !== confirmPassword) {
    throw new Error("Kata sandi baru tidak cocok dengan konfirmasi.");
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    throw new Error(`Gagal memperbarui kata sandi: ${error.message}`);
  }
}
