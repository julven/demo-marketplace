import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const PLATFORM_FEE_PERCENT = 0.10;

export async function POST(request) {
  const { listing_id } = await request.json();
  if (!listing_id) return NextResponse.json({ error: "listing_id required." }, { status: 400 });

  const { data: listing } = await supabase.from("listings").select("*").eq("id", listing_id).single();
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  if (listing.sold) return NextResponse.json({ error: "Listing already sold." }, { status: 400 });

  const { data: seller } = await supabase
    .from("sellers")
    .select("stripe_account_id, onboarded")
    .eq("email", listing.seller_email)
    .single();

  if (!seller?.onboarded) {
    return NextResponse.json({ error: "Seller not connected to Stripe." }, { status: 400 });
  }

  const price_cents = Math.round(Number(listing.price) * 100);
  const platform_fee = Math.round(price_cents * PLATFORM_FEE_PERCENT);

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: price_cents,
            product_data: {
              name: listing.title,
              description: listing.description || undefined,
              images: listing.image_url ? [listing.image_url] : [],
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platform_fee,
      },
      metadata: { listing_id: listing.id },
      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/item/${listing.id}`,
    },
    { stripeAccount: seller.stripe_account_id }
  );

  // Save pending order so the success page can confirm without a webhook
  await supabase.from("orders").insert({
    listing_id: listing.id,
    stripe_session_id: session.id,
    stripe_account_id: seller.stripe_account_id,
    amount: price_cents,
    platform_fee,
    status: "pending",
  });

  return NextResponse.json({ url: session.url });
}
