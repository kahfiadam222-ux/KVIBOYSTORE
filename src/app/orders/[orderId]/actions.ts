"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { completeOrder } from "@/lib/orders/completeOrder";

export async function confirmDelivery(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, buyer_id, seller_id, amount, currency, state, is_platform_owned")
    .eq("id", orderId)
    .single();

  if (!order || order.buyer_id !== user.id || order.state !== "delivered") return;

  await completeOrder(
    admin,
    order,
    { type: "buyer", id: user.id },
    "Buyer confirmed receipt",
  );

  revalidatePath(`/orders/${orderId}`);
}

export async function submitReview(orderId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const rating = Number(formData.get("rating"));
  if (isNaN(rating) || rating < 1 || rating > 5) return;
  const comment = formData.get("comment") as string;

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, buyer_id, seller_id, state, is_platform_owned")
    .eq("id", orderId)
    .single();

  // Platform-owned orders have no seller to review.
  if (!order || order.buyer_id !== user.id || order.state !== "completed" || order.is_platform_owned) {
    return;
  }

  const { error } = await admin.from("reviews").insert({
    order_id: orderId,
    seller_id: order.seller_id,
    buyer_id: user.id,
    rating,
    comment,
  });

  // Unique constraint on order_id rejects a second review — nothing to do either way.
  if (error) return;

  await admin.rpc("refresh_seller_reputation", { p_seller_id: order.seller_id });

  revalidatePath(`/orders/${orderId}`);
}

export async function openDispute(orderId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const reason = formData.get("reason") as string;

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, buyer_id, state")
    .eq("id", orderId)
    .single();

  if (!order || order.buyer_id !== user.id || order.state !== "delivered") return;

  await admin.from("disputes").insert({
    order_id: orderId,
    opened_by: "buyer",
    reason,
    status: "open",
  });

  await admin.from("orders").update({ state: "buyer_disputed" }).eq("id", orderId);
  await admin.from("order_state_transitions").insert({
    order_id: orderId,
    from_state: "delivered",
    to_state: "buyer_disputed",
    actor_type: "buyer",
    actor_id: user.id,
    reason: "Buyer opened a dispute",
  });

  revalidatePath(`/orders/${orderId}`);
}
