import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const listing_id = session.metadata?.listing_id;

    if (listing_id) {
      const price_cents = session.amount_total;
      const platform_fee = session.metadata?.platform_fee ? Number(session.metadata.platform_fee) : 0;

      await supabase.from("orders").insert({
        listing_id,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        amount: price_cents,
        platform_fee,
        status: "paid",
      });

      await supabase.from("listings").update({ sold: true }).eq("id", listing_id);
    }
  }

  if (event.type === "account.updated") {
    const account = event.data.object;
    if (account.charges_enabled && account.details_submitted) {
      await supabase
        .from("sellers")
        .update({ onboarded: true })
        .eq("stripe_account_id", account.id);
    }
  }

  return NextResponse.json({ received: true });
}
