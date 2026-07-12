"use client";

import { useEffect, useState } from "react";
import { RevealBurst } from "./RevealBurst";

// Plays the unboxing-style burst once per order, the first time this browser
// sees the code — reloading the page afterward just shows the code plainly,
// the way opening a physical box a second time doesn't repeat the reveal.
export function DeliveryReveal({ orderId, code }: { orderId: string; code: string }) {
  const [showBurst, setShowBurst] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const key = `kvibo-reveal-${orderId}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      setShowBurst(true);
    }
    setMounted(true);
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
      {showBurst && <RevealBurst />}
      <p className="mb-1 text-xs font-medium text-muted-foreground">Kode Aktivasi</p>
      <code className="text-sm font-semibold">{code}</code>
    </div>
  );
}
