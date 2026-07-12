import { loginWithGoogle } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export function GoogleLoginButton() {
  return (
    <form action={loginWithGoogle}>
      <Button type="submit" variant="secondary" className="w-full gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.58-5.17 3.58-8.84Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.94H1.27v3.11C3.24 21.3 7.29 24 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.29V6.6H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.4l4.01-3.11Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.77c1.76 0 3.35.6 4.6 1.78l3.44-3.44C17.95 1.19 15.24 0 12 0 7.29 0 3.24 2.7 1.27 6.6l4.01 3.11C6.23 6.88 8.88 4.77 12 4.77Z"
          />
        </svg>
        Masuk dengan Google
      </Button>
    </form>
  );
}
