import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

// POST — start or resume onboarding
export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });

    // find or create seller row
    let { data: seller } = await supabase.from("sellers").select("*").eq("email", email).single();

    if (!seller) {
      const account = await stripe.accounts.create({
        email,
        country: "US",
        controller: {
          stripe_dashboard: { type: "none" },
          losses: { payments: "stripe" },
          fees: { payer: "application" },
          requirement_collection: "stripe",
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      const { data } = await supabase
        .from("sellers")
        .insert({ email, stripe_account_id: account.id })
        .select()
        .single();
      seller = data;
    } else if (!seller.stripe_account_id) {
      const account = await stripe.accounts.create({
        email,
        country: "US",
        controller: {
          stripe_dashboard: { type: "none" },
          losses: { payments: "stripe" },
          fees: { payer: "application" },
          requirement_collection: "stripe",
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      const { data } = await supabase
        .from("sellers")
        .update({ stripe_account_id: account.id })
        .eq("email", email)
        .select()
        .single();
      seller = data;
    }

    const accountLink = await stripe.accountLinks.create({
      account: seller.stripe_account_id,
      refresh_url: `${APP_URL}/connect/refresh?email=${encodeURIComponent(email)}`,
      return_url: `${APP_URL}/connect/return?email=${encodeURIComponent(email)}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe connect POST error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}

// GET — check onboarding status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) return NextResponse.json({ onboarded: false });

    const { data: seller } = await supabase.from("sellers").select("*").eq("email", email).single();
    if (!seller?.stripe_account_id) return NextResponse.json({ onboarded: false });

    const account = await stripe.accounts.retrieve(seller.stripe_account_id);
    const onboarded = account.charges_enabled && account.details_submitted;

    if (onboarded && !seller.onboarded) {
      await supabase.from("sellers").update({ onboarded: true }).eq("email", email);
    }

    return NextResponse.json({ onboarded });
  } catch (err) {
    console.error("Stripe connect GET error:", err);
    return NextResponse.json({ onboarded: false });
  }
}
