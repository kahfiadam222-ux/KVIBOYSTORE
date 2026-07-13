import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest, requestHeaders?: Headers) {
  // When the proxy passes custom request headers (e.g. the CSP nonce), forward
  // those instead of the default request headers so Server Components can read
  // them via `headers()`. Otherwise fall back to the incoming request headers.
  const forwardedHeaders = requestHeaders ?? new Headers(request.headers);
  const next = () => NextResponse.next({ request: { headers: forwardedHeaders } });

  let response = next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = next();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Required: touches the session so expired tokens are refreshed before
  // Server Components read cookies (they cannot write cookies themselves).
  await supabase.auth.getUser();

  return response;
}
