// How long a buyer has to confirm or dispute after delivery before the
// system auto-confirms on their behalf — keeps escrow from holding funds
// indefinitely just because a buyer never opens the order page again.
export const AUTO_CONFIRM_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

export function revealExpiresAt(deliveredAt: Date) {
  return new Date(deliveredAt.getTime() + AUTO_CONFIRM_WINDOW_MS).toISOString();
}
