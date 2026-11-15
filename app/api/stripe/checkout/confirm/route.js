import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get("session_id");
  if (!session_id) return NextResponse.json({ error: "session_id required." }, { status: 400 });

  // Look up the pending order to get the stripe_account_id
  const { data: order } = await supabase
    .from("orders")
    .select("*, listings(title)")
    .eq("stripe_session_id", session_id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  // Already confirmed
  if (order.status === "paid") {
    return NextResponse.json({
      listing_title: order.listings?.title,
      amount: order.amount,
      status: "paid",
    });
  }

  // Retrieve session from Stripe using the connected account (direct charge)
  const session = await stripe.checkout.sessions.retrieve(session_id, {}, {
    stripeAccount: order.stripe_account_id,
  });

  if (session.payment_status !== "paid") {
    return NextResponse.json({ status: session.payment_status });
  }

  // Confirm: update order + mark listing sold
  await supabase
    .from("orders")
    .update({ status: "paid", stripe_payment_intent_id: session.payment_intent })
    .eq("stripe_session_id", session_id);

  await supabase.from("listings").update({ sold: true }).eq("id", order.listing_id);

  return NextResponse.json({
    listing_title: order.listings?.title,
    amount: order.amount,
    status: "paid",
  });
}
