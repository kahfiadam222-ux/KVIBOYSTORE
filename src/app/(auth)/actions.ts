"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "@/lib/security/validation";

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

  const rawEmail = formData.get("email");
  const password = formData.get("password");

  if (!isValidEmail(rawEmail) || !password || typeof password !== "string") {
    redirect(`/login?error=${encodeURIComponent("Email dan password wajib diisi.")}`);
  }

  const email = normalizeEmail(rawEmail);
  const ip = await getClientIp();

  // 1. Rate limit by Email
  const emailLimit = checkRateLimit(
    `login:email:${email}`,
    LOGIN_LIMIT.max,
    LOGIN_LIMIT.windowMs,
  );
  if (!emailLimit.allowed) {
    redirect(`/login?error=${encodeURIComponent(
      `Terlalu banyak percobaan masuk untuk email ini. Coba lagi dalam ${formatMinutes(emailLimit.resetIn)}.`,
    )}`);
  }

  // 2. Rate limit by IP
  const ipLimit = checkRateLimit(
    `login:ip:${ip}`,
    30, // Max 30 attempts per 15 minutes per IP
    LOGIN_LIMIT.windowMs,
  );
  if (!ipLimit.allowed) {
    redirect(`/login?error=${encodeURIComponent(
      `Terlalu banyak percobaan masuk dari alamat IP ini. Coba lagi dalam ${formatMinutes(ipLimit.resetIn)}.`,
    )}`);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const rawEmail = formData.get("email");
  const password = formData.get("password");

  if (!isValidEmail(rawEmail)) {
    redirect(`/signup?error=${encodeURIComponent("Format email tidak valid.")}`);
  }

  if (!isValidPassword(password)) {
    redirect(`/signup?error=${encodeURIComponent("Password minimal 8 karakter.")}`);
  }

  const email = normalizeEmail(rawEmail);
  const ip = await getClientIp();

  // 1. Rate limit by Email
  const emailLimit = checkRateLimit(
    `signup:email:${email}`,
    SIGNUP_LIMIT.max,
    SIGNUP_LIMIT.windowMs,
  );
  if (!emailLimit.allowed) {
    redirect(`/signup?error=${encodeURIComponent(
      `Terlalu banyak percobaan daftar untuk email ini. Coba lagi dalam ${formatMinutes(emailLimit.resetIn)}.`,
    )}`);
  }

  // 2. Rate limit by IP
  const ipLimit = checkRateLimit(
    `signup:ip:${ip}`,
    10, // Max 10 signups per hour per IP
    SIGNUP_LIMIT.windowMs,
  );
  if (!ipLimit.allowed) {
    redirect(`/signup?error=${encodeURIComponent(
      `Terlalu banyak percobaan daftar dari alamat IP ini. Coba lagi dalam ${formatMinutes(ipLimit.resetIn)}.`,
    )}`);
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
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
