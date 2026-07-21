"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { completeOrder } from "@/lib/orders/completeOrder";
import { transitionOrderState } from "@/lib/orders/transition";

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
  revalidatePath("/orders");
}

export async function submitReview(orderId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const rating = Number(formData.get("rating"));
  if (isNaN(rating) || rating < 1 || rating > 5) return;
  const comment = String(formData.get("comment") ?? "").slice(0, 2000);

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

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return;

  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, buyer_id, state")
    .eq("id", orderId)
    .single();

  if (!order || order.buyer_id !== user.id || order.state !== "delivered") return;

  // CAS so confirm + dispute cannot both win.
  const disputed = await transitionOrderState(
    admin,
    orderId,
    "delivered",
    "buyer_disputed",
    {
      actorType: "buyer",
      actorId: user.id,
      reason: "Buyer opened a dispute",
    },
  );

  if (!disputed) return;

  const { data: existing } = await admin
    .from("disputes")
    .select("id")
    .eq("order_id", orderId)
    .eq("status", "open")
    .maybeSingle();

  if (!existing) {
    await admin.from("disputes").insert({
      order_id: orderId,
      opened_by: "buyer",
      reason,
      status: "open",
    });
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/admin/disputes");
}
