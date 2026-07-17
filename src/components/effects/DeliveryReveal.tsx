"use client";

import { useMemo, useSyncExternalStore } from "react";
import { RevealBurst } from "./RevealBurst";

function emptySubscribe() {
  return () => {};
}

// Plays the unboxing-style burst once per order, the first time this browser
// sees the code — reloading the page afterward just shows the code plainly.
export function DeliveryReveal({ orderId, code }: { orderId: string; code: string }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Compute once per mount on the client (memo is fine; side-effect is intentional).
  const showBurst = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const key = `kvibo-reveal-${orderId}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        return true;
      }
    } catch {
      // sessionStorage blocked
    }
    return false;
  }, [orderId]);

  return (
    <div
      className="relative overflow-visible rounded-md border bg-muted p-3"
      style={{
        animation: mounted && showBurst ? "kvibo-reveal-in 0.5s ease-out" : undefined,
      }}
    >
      <style>{`
        @keyframes kvibo-reveal-in {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      {mounted && showBurst && <RevealBurst />}
      <p className="mb-1 text-xs font-medium text-muted-foreground">Kode Aktivasi</p>
      <code className="text-sm font-semibold break-all">{code}</code>
    </div>
  );
}
