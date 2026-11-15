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
  console.log("[reconcile] checking listing:", listing_id);

  if (!listing_id) return NextResponse.json({ sold: false });

  const { data: listing } = await supabase
    .from("listings")
    .select("sold")
    .eq("id", listing_id)
    .single();

  console.log("[reconcile] listing.sold:", listing?.sold);
  if (listing?.sold) return NextResponse.json({ sold: true });

  const { data: orders } = await supabase
    .from("orders")
    .select("stripe_session_id, stripe_account_id, status")
    .eq("listing_id", listing_id)
    .in("status", ["pending", "paid"]);

  console.log("[reconcile] orders found (pending+paid):", orders?.length ?? 0);
  if (!orders?.length) return NextResponse.json({ sold: false });

  for (const order of orders) {
    console.log("[reconcile] order status:", order.status);
    console.log("[reconcile] step 1 — session id:", order.stripe_session_id);
    console.log("[reconcile] step 2 — stripe account:", order.stripe_account_id);
    try {
      console.log("[reconcile] step 3 — retrieving session from Stripe...");
      const session = await stripe.checkout.sessions.retrieve(
        order.stripe_session_id,
        {},
        { stripeAccount: order.stripe_account_id }
      );
      console.log("[reconcile] step 4 — full session data:", JSON.stringify(session, null, 2));
      console.log("[reconcile] step 5 — payment_status:", session.payment_status);
      console.log("[reconcile] step 6 — payment_intent:", session.payment_intent);

      if (session.payment_status === "paid") {
        console.log("[reconcile] step 7 — payment is paid, updating order...");
        await supabase
          .from("orders")
          .update({ status: "paid", stripe_payment_intent_id: session.payment_intent })
          .eq("stripe_session_id", order.stripe_session_id);
        console.log("[reconcile] step 8 — order updated to paid");

        console.log("[reconcile] step 9 — marking listing as sold...");
        await supabase.from("listings").update({ sold: true }).eq("id", listing_id);
        console.log("[reconcile] step 10 — listing marked sold. done.");

        return NextResponse.json({ sold: true });
      } else {
        console.log("[reconcile] step 7 — payment not paid, status is:", session.payment_status);
      }
    } catch (err) {
      console.error("[reconcile] error at session retrieve:", order.stripe_session_id);
      console.error("[reconcile] error message:", err.message);
    }
  }

  console.log("[reconcile] no paid sessions found");
  return NextResponse.json({ sold: false });
}
