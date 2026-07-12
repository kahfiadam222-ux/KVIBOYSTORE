import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase redirects here after Google OAuth with a one-time `code`; we
// exchange it for a session cookie, then send the user on to the homepage.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(`Gagal masuk: ${error.message}`)}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
