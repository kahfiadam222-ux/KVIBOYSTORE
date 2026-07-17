import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Atomic order state transition (compare-and-swap).
 * Only updates when the current state matches `fromState`.
 * Returns true if this caller won the race.
 */
export async function transitionOrderState(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any, any, any>,
  orderId: string,
  fromState: string,
  toState: string,
  meta?: {
    actorType?: string;
    actorId?: string | null;
    reason?: string;
  },
): Promise<boolean> {
  const { data, error } = await admin
    .from("orders")
    .update({ state: toState })
    .eq("id", orderId)
    .eq("state", fromState)
    .select("id")
    .maybeSingle();

  if (error || !data) return false;

  if (meta?.reason) {
    await admin.from("order_state_transitions").insert({
      order_id: orderId,
      from_state: fromState,
      to_state: toState,
      actor_type: meta.actorType ?? "system",
      actor_id: meta.actorId ?? null,
      reason: meta.reason,
    });
  }

  return true;
}
