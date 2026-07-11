"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function confirmDelivery(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, buyer_id, state, is_platform_owned")
    .eq("id", orderId)
    .single();

  if (!order || order.buyer_id !== user.id || order.state !== "delivered") return;

  // Platform-owned orders have no seller payout to release, so confirmation
  // closes the order directly instead of routing through payout_released.
  const nextState = order.is_platform_owned ? "completed" : "buyer_confirmed";

  await admin.from("orders").update({ state: nextState }).eq("id", orderId);

  await admin.from("order_state_transitions").insert({
    order_id: orderId,
    from_state: "delivered",
    to_state: nextState,
    actor_type: "buyer",
    actor_id: user.id,
    reason: "Buyer confirmed receipt",
  });

  revalidatePath(`/orders/${orderId}`);
}
