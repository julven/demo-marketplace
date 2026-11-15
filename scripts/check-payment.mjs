import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const session_id = process.argv[2];
if (!session_id) {
  console.error("Usage: node scripts/check-payment.mjs <session_id>");
  process.exit(1);
}

const { data: order } = await supabase
  .from("orders")
  .select("*")
  .eq("stripe_session_id", session_id)
  .single();

if (!order) {
  console.error("No order found in Supabase for that session ID.");
  process.exit(1);
}

console.log("\n── Supabase Order ──────────────────────────");
console.log("Status        :", order.status);
console.log("Amount        : $" + (order.amount / 100).toFixed(2));
console.log("Platform fee  : $" + (order.platform_fee / 100).toFixed(2));
console.log("Seller gets   : $" + ((order.amount - order.platform_fee) / 100).toFixed(2));
console.log("Listing ID    :", order.listing_id);

const session = await stripe.checkout.sessions.retrieve(
  session_id,
  {},
  { stripeAccount: order.stripe_account_id }
);

console.log("\n── Stripe Session ──────────────────────────");
console.log("Payment status:", session.payment_status);
console.log("Session status:", session.status);

if (session.payment_intent) {
  const pi = await stripe.paymentIntents.retrieve(
    session.payment_intent,
    {},
    { stripeAccount: order.stripe_account_id }
  );

  console.log("\n── Payment Intent ──────────────────────────");
  console.log("Status        :", pi.status);
  console.log("Amount        : $" + (pi.amount / 100).toFixed(2));
  console.log("App fee amount: $" + (pi.application_fee_amount / 100).toFixed(2));

  if (pi.latest_charge) {
    const charge = await stripe.charges.retrieve(
      pi.latest_charge,
      {},
      { stripeAccount: order.stripe_account_id }
    );
    console.log("\n── Charge ──────────────────────────────────");
    console.log("Paid          :", charge.paid);
    console.log("Amount        : $" + (charge.amount / 100).toFixed(2));
    console.log("Buyer email   :", charge.billing_details?.email ?? "—");
    console.log("Card last 4   :", charge.payment_method_details?.card?.last4 ?? "—");
    console.log("Transfer      :", charge.transfer ?? "—");
  }
}

console.log("\n────────────────────────────────────────────\n");
