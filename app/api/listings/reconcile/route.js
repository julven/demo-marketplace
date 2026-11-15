import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const listing_id = searchParams.get("listing_id");

  if (!listing_id) return NextResponse.json({ sold: false });

  const { data: listing } = await supabase
    .from("listings")
    .select("sold")
    .eq("id", listing_id)
    .single();

  // Already marked sold in DB — no need to check Stripe
  if (listing?.sold) return NextResponse.json({ sold: true });

  const { data: orders } = await supabase
    .from("orders")
    .select("stripe_session_id, stripe_account_id, status")
    .eq("listing_id", listing_id)
    .in("status", ["pending", "paid"]);

  if (!orders?.length) return NextResponse.json({ sold: false });

  for (const order of orders) {
    // Order already confirmed paid in DB — skip Stripe, just fix the listing
    if (order.status === "paid") {
      await supabase.from("listings").update({ sold: true }).eq("id", listing_id);
      return NextResponse.json({ sold: true });
    }

    // Pending order — check Stripe to see if payment went through
    try {
      const session = await stripe.checkout.sessions.retrieve(
        order.stripe_session_id,
        {},
        { stripeAccount: order.stripe_account_id }
      );

      if (session.payment_status === "paid") {
        await supabase
          .from("orders")
          .update({ status: "paid", stripe_payment_intent_id: session.payment_intent })
          .eq("stripe_session_id", order.stripe_session_id);

        await supabase.from("listings").update({ sold: true }).eq("id", listing_id);

        return NextResponse.json({ sold: true });
      }
    } catch (err) {
      console.error("[reconcile] error retrieving session:", order.stripe_session_id, err.message);
    }
  }

  return NextResponse.json({ sold: false });
}
