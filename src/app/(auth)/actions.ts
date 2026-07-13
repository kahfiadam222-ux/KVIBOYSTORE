"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rateLimiter";

// 5 login attempts per 15 minutes per email — enough headroom for a
// forgetful user, tight enough to blunt brute-force attempts.
const LOGIN_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };
// 3 signups per hour per email — prevents automated account farming.
const SIGNUP_LIMIT = { max: 3, windowMs: 60 * 60 * 1000 };

function formatMinutes(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  return `${minutes} menit`;
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Email dan password wajib diisi.")}`);
  }

  const { allowed, resetIn } = checkRateLimit(
    `login:${String(email).toLowerCase()}`,
    LOGIN_LIMIT.max,
    LOGIN_LIMIT.windowMs,
  );
  if (!allowed) {
    redirect(`/login?error=${encodeURIComponent(
      `Terlalu banyak percobaan masuk. Coba lagi dalam ${formatMinutes(resetIn)}.`,
    )}`);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email as string,
    password: password as string,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    redirect(`/signup?error=${encodeURIComponent("Email dan password wajib diisi.")}`);
  }

  const { allowed, resetIn } = checkRateLimit(
    `signup:${String(email).toLowerCase()}`,
    SIGNUP_LIMIT.max,
    SIGNUP_LIMIT.windowMs,
  );
  if (!allowed) {
    redirect(`/signup?error=${encodeURIComponent(
      `Terlalu banyak percobaan daftar. Coba lagi dalam ${formatMinutes(resetIn)}.`,
    )}`);
  }

  const { error } = await supabase.auth.signUp({
    email: email as string,
    password: password as string,
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/signup/check-email");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

async function loginWithOAuth(provider: "google" | "github") {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? `Gagal masuk dengan ${provider}.`)}`);
  }

  redirect(data.url);
}

export async function loginWithGoogle() {
  await loginWithOAuth("google");
}

export async function loginWithGithub() {
  await loginWithOAuth("github");
}
